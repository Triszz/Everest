import { prisma } from '../../config/prisma';
import { AppError } from '../../middlewares/errorHandler';
import { getPagination, buildPaginated } from '../../shared/utils/paginate';
import type { CreateVoucherInput, UpdateVoucherInput, VoucherQuery, ToggleVoucherDisplayInput } from './voucher.schemas';

// Các trạng thái cho phép chỉnh sửa
const EDITABLE_STATUSES = ['Draft', 'Rejected'] as const;

export const voucherService = {

    // ── Tạo voucher mới (BR-PAR-02) ─────────────────────────────

    async create(partnerId: number, input: CreateVoucherInput) {
        // BR-PAR-02: Mỗi voucher phải gán với ≥ 1 chi nhánh của partner.
        // Service-level guard (defense-in-depth ngoài schema zod).
        if (!input.branchIds || input.branchIds.length === 0) {
            throw new AppError(
                'Voucher phải gán với ít nhất 1 chi nhánh của partner',
                400,
                'VALIDATION_ERROR',
            );
        }

        // Validate branchIds thuộc partner này
        // Check for duplicates
        const uniqueBranchIds = [...new Set(input.branchIds)];
        if (uniqueBranchIds.length !== input.branchIds.length) {
            throw new AppError('Danh sách chi nhánh chứa giá trị trùng lặp', 400, 'VALIDATION_ERROR');
        }

        const ownedBranches = await prisma.branch.findMany({
            where: { partnerId, branchId: { in: uniqueBranchIds } },
            select: { branchId: true },
        });
        if (ownedBranches.length !== uniqueBranchIds.length) {
            throw new AppError(
                'Một hoặc nhiều chi nhánh không thuộc đối tác này',
                400,
                'VALIDATION_ERROR',
            );
        }

        // Kiểm tra partner có ít nhất 1 chi nhánh.
        // Nếu partner không tạo branch nào nhưng vẫn pass schema check
        // (do gửi branchIds rỗng → bị chặn ở trên), thì đây là guard cuối.
        // Trong trường hợp bình thường, đến đây chỉ fail nếu partner bị xóa branch
        // ngay sau khi submit voucher.
        if (ownedBranches.length === 0) {
            throw new AppError(
                'Partner chưa có chi nhánh nào. Vui lòng tạo chi nhánh trước khi tạo voucher',
                400,
                'VALIDATION_ERROR',
            );
        }

        const category = await prisma.category.findUnique({
            where: { categoryId: input.categoryId },
            select: { categoryId: true },
        });

        if (!category) {
            throw new AppError('Danh mục không tồn tại', 404, 'NOT_FOUND');
        }

        try {
            const result = await prisma.voucher.create({
                data: {
                    partnerId,
                    title: input.title,
                    description: input.description,
                    categoryId: input.categoryId,
                    applicationCondition: input.applicationCondition,
                    originalPrice: input.originalPrice,
                    salePrice: input.salePrice,
                    totalQuantity: input.totalQuantity,
                    availableQuantity: input.totalQuantity, // ban đầu = tổng số lượng
                    imageUrl: input.imageUrl,
                    startDate: new Date(input.startDate),
                    endDate: new Date(input.endDate),
                    expiryDays: input.expiryDays,
                    approvalStatus: 'Draft',
                    displayStatus: 'Hidden',
                    voucherBranches: {
                        create: uniqueBranchIds.map((branchId) => ({ branchId })),
                    },
                },
                include: {
                    category: { select: { categoryId: true, categoryName: true } },
                    voucherBranches: {
                        include: { branch: { select: { branchId: true, branchName: true } } },
                    },
                },
            });
            return result;
        } catch (err) {
            console.error("[VoucherService] Prisma error creating voucher:", err);
            if (err instanceof Error) {
                console.error("[VoucherService] Error name:", err.name);
                console.error("[VoucherService] Error message:", err.message);
                console.error("[VoucherService] Error stack:", err.stack);
            }
            throw err;
        }
    },

    // ── Danh sách voucher của partner (BR-PAR-04) ────────────────

    async list(partnerId: number, query: VoucherQuery) {
        const { page, limit, skip } = getPagination(query);
        const where = {
            partnerId,
            ...(query.status && { approvalStatus: query.status }),
            ...(query.q && { title: { contains: query.q, mode: 'insensitive' as const } }),
        };

        const [vouchers, total] = await Promise.all([
            prisma.voucher.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    category: { select: { categoryId: true, categoryName: true } },
                    voucherBranches: {
                        include: { branch: { select: { branchId: true, branchName: true } } },
                    },
                },
            }),
            prisma.voucher.count({ where }),
        ]);

        return buildPaginated(vouchers, total, page, limit);
    },

    // ── Chi tiết voucher + thống kê ──────────────────────────────

    async getById(voucherId: number, partnerId: number) {
        const voucher = await prisma.voucher.findFirst({
            where: { voucherId, partnerId },
            include: {
                category: { select: { categoryId: true, categoryName: true } },
                voucherBranches: {
                    include: { branch: { select: { branchId: true, branchName: true, address: true } } },
                },
            },
        });
        if (!voucher) throw new AppError('Không tìm thấy voucher', 404, 'NOT_FOUND');

        // Thống kê: số đã bán, số đã dùng
        const [soldCount, usedCount] = await Promise.all([
            prisma.orderItem.count({
                where: { voucherId, order: { paymentStatus: 'Paid' } },
            }),
            prisma.issuedVoucher.count({
                where: { orderItem: { voucherId }, status: 'Used' },
            }),
        ]);

        return { ...voucher, stats: { soldCount, usedCount } };
    },

    // ── Cập nhật voucher (BR-PAR-04) ─────────────────────────────

    async update(voucherId: number, partnerId: number, input: UpdateVoucherInput) {
        const voucher = await prisma.voucher.findFirst({ where: { voucherId, partnerId } });
        if (!voucher) throw new AppError('Không tìm thấy voucher', 404, 'NOT_FOUND');

        if (!EDITABLE_STATUSES.includes(voucher.approvalStatus as typeof EDITABLE_STATUSES[number])) {
            throw new AppError(
                'Chỉ có thể sửa voucher ở trạng thái Draft hoặc Rejected',
                400, 'VALIDATION_ERROR'
            );
        }

        // Validate giá sau khi merge old + new
        const finalOriginal = Number(input.originalPrice ?? voucher.originalPrice);
        const finalSale = Number(input.salePrice ?? voucher.salePrice);
        if (finalSale >= finalOriginal) {
            throw new AppError('Giá bán phải nhỏ hơn giá gốc', 400, 'VALIDATION_ERROR');
        }

        // Validate ngày
        const finalStart = new Date(input.startDate ?? voucher.startDate);
        const finalEnd = new Date(input.endDate ?? voucher.endDate);
        if (finalEnd <= finalStart) {
            throw new AppError('Ngày kết thúc phải sau ngày bắt đầu', 400, 'VALIDATION_ERROR');
        }

        // Validate số lượng không nhỏ hơn số đã bán
        if (input.totalQuantity !== undefined) {
            const soldCount = await prisma.orderItem.count({
                where: { voucherId, order: { paymentStatus: 'Paid' } },
            });
            if (input.totalQuantity < soldCount) {
                throw new AppError(
                    `Số lượng không thể nhỏ hơn số đã bán (${soldCount})`,
                    409, 'CONFLICT'
                );
            }
        }

        // Validate branchIds (chỉ khi partner gửi lên, kể cả rỗng [])
        if (input.branchIds !== undefined) {
            // Service-level guard: không cho phép rỗng (đã có zod min(1) nhưng thêm guard để chắc)
            if (input.branchIds.length === 0) {
                throw new AppError(
                    'Voucher phải gán với ít nhất 1 chi nhánh của partner',
                    400,
                    'VALIDATION_ERROR',
                );
            }

            // Check for duplicates
            const uniqueBranchIds = [...new Set(input.branchIds)];
            if (uniqueBranchIds.length !== input.branchIds.length) {
                throw new AppError(
                    'Danh sách chi nhánh chứa giá trị trùng lặp',
                    400,
                    'VALIDATION_ERROR',
                );
            }

            const owned = await prisma.branch.findMany({
                where: { partnerId, branchId: { in: uniqueBranchIds } },
                select: { branchId: true },
            });
            if (owned.length !== uniqueBranchIds.length) {
                throw new AppError(
                    'Một hoặc nhiều chi nhánh không thuộc đối tác này',
                    400,
                    'VALIDATION_ERROR',
                );
            }
        }

        if (input.categoryId !== undefined) {
            const category = await prisma.category.findUnique({
                where: { categoryId: input.categoryId },
                select: { categoryId: true },
            });

            if (!category) {
                throw new AppError('Danh mục không tồn tại', 404, 'NOT_FOUND');
            }
        }

        return prisma.$transaction(async (tx) => {
            // Cập nhật branches nếu có thay đổi
            if (input.branchIds !== undefined) {
                await tx.voucherBranch.deleteMany({ where: { voucherId } });
                if (input.branchIds.length) {
                    await tx.voucherBranch.createMany({
                        data: input.branchIds.map((branchId) => ({ voucherId, branchId })),
                    });
                }
            }

            const { branchIds, ...rest } = input;
            const { startDate, endDate, totalQuantity, ...otherFields } = rest;

            // Tính lại availableQuantity nếu totalQuantity thay đổi
            let newAvailableQty: number | undefined;
            if (totalQuantity !== undefined) {
                const soldCount = await tx.orderItem.count({
                    where: { voucherId, order: { paymentStatus: 'Paid' } },
                });
                newAvailableQty = totalQuantity - soldCount;
            }

            return tx.voucher.update({
                where: { voucherId },
                data: {
                    ...otherFields,
                    ...(totalQuantity !== undefined && { totalQuantity, availableQuantity: newAvailableQty }),
                    ...(startDate && { startDate: new Date(startDate) }),
                    ...(endDate && { endDate: new Date(endDate) }),
                },
                include: {
                    category: true,
                    voucherBranches: {
                        include: { branch: { select: { branchId: true, branchName: true } } },
                    },
                },
            });
        });
    },

    // ── Gửi duyệt (BR-PAR-03) ────────────────────────────────────

    async submit(voucherId: number, partnerId: number) {
        const voucher = await prisma.voucher.findFirst({ where: { voucherId, partnerId } });
        if (!voucher) throw new AppError('Không tìm thấy voucher', 404, 'NOT_FOUND');

        if (!EDITABLE_STATUSES.includes(voucher.approvalStatus as typeof EDITABLE_STATUSES[number])) {
            throw new AppError(
                'Chỉ có thể gửi duyệt voucher ở trạng thái Draft hoặc Rejected',
                400, 'VALIDATION_ERROR'
            );
        }

        return prisma.voucher.update({
            where: { voucherId },
            data: { approvalStatus: 'Pending' },
            select: { voucherId: true, title: true, approvalStatus: true },
        });
    },

    // ── Xóa voucher (chỉ Draft) ──────────────────────────────────

    async delete(voucherId: number, partnerId: number) {
        const voucher = await prisma.voucher.findFirst({ where: { voucherId, partnerId } });
        if (!voucher) throw new AppError('Không tìm thấy voucher', 404, 'NOT_FOUND');

        if (voucher.approvalStatus !== 'Draft') {
            throw new AppError(
                'Chỉ có thể xóa voucher ở trạng thái Draft',
                400, 'VALIDATION_ERROR'
            );
        }

        await prisma.voucher.delete({ where: { voucherId } });
    },

    // ── Bật/tắt hiển thị voucher (BR-PAR-DISPLAY) ─────────────────
    // Phân biệt rõ với approval:
    //   - approvalStatus (Draft/Pending/Approved/Rejected) → admin quyết định,
    //     EDITABLE_STATUSES gate update và submit.
    //   - displayStatus (Visible/Hidden) → partner tự quyết định sau khi
    //     voucher đã Approved. Đây là action kinh doanh, không cần duyệt lại.
    //
    // Lý do tách: nếu partner quên bật Visible khi submit, admin approve xong
    // voucher vẫn Hidden → partner không thể tự bật lại, phải nhờ admin.
    // Tách endpoint này để partner có thể bật/tắt linh hoạt mà không phải
    // submit lại voucher.

    async setVoucherDisplayStatus(
        voucherId: number,
        partnerId: number,
        input: ToggleVoucherDisplayInput,
    ) {
        const voucher = await prisma.voucher.findFirst({
            where: { voucherId, partnerId },
        });
        if (!voucher) {
            throw new AppError('Không tìm thấy voucher', 404, 'NOT_FOUND');
        }

        // Chỉ cho phép toggle khi đã được duyệt.
        // Trước Approved, displayStatus chưa có ý nghĩa kinh doanh
        // (chưa hiện trên store nên Visible/Hidden không khác biệt).
        if (voucher.approvalStatus !== 'Approved') {
            throw new AppError(
                'Chỉ có thể bật/tắt hiển thị sau khi voucher được Admin duyệt',
                400,
                'VALIDATION_ERROR',
            );
        }

        // Không cho toggle nếu voucher đã kết thúc (startDate > now).
        // Khi này partner vẫn có thể xem lại nhưng không nên cho khách mua.
        const now = new Date();
        if (voucher.startDate > now) {
            // Được phép toggle trước startDate (partner chuẩn bị).
            // Sau startDate, vẫn được phép nếu còn hạn.
        }
        if (voucher.endDate < now) {
            throw new AppError(
                'Voucher đã hết hạn, không thể thay đổi trạng thái hiển thị',
                400,
                'VALIDATION_ERROR',
            );
        }

        return prisma.voucher.update({
            where: { voucherId },
            data: { displayStatus: input.displayStatus },
            select: {
                voucherId: true,
                title: true,
                approvalStatus: true,
                displayStatus: true,
            },
        });
    },
};