import { prisma } from '../../config/prisma';
import { AppError } from '../../middlewares/errorHandler';
import { getPagination, buildPaginated } from '../../shared/utils/paginate';
import type { CreateVoucherInput, UpdateVoucherInput, VoucherQuery } from './voucher.schemas';

// Các trạng thái cho phép chỉnh sửa
const EDITABLE_STATUSES = ['Draft', 'Rejected'] as const;

export const voucherService = {

    // ── Tạo voucher mới (BR-PAR-02) ─────────────────────────────

    async create(partnerId: number, input: CreateVoucherInput) {
        // Validate branchIds thuộc partner này
        if (input.branchIds?.length) {
            const ownedBranches = await prisma.branch.findMany({
                where: { partnerId, branchId: { in: input.branchIds } },
                select: { branchId: true },
            });
            if (ownedBranches.length !== input.branchIds.length) {
                throw new AppError('Một hoặc nhiều chi nhánh không thuộc đối tác này', 400, 'VALIDATION_ERROR');
            }
        }

        const category = await prisma.category.findUnique({
            where: { categoryId: input.categoryId },
            select: { categoryId: true },
        });

        if (!category) {
            throw new AppError('Danh mục không tồn tại', 404, 'NOT_FOUND');
        }

        return prisma.voucher.create({
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
                ...(input.branchIds?.length && {
                    voucherBranches: {
                        create: input.branchIds.map((branchId) => ({ branchId })),
                    },
                }),
            },
            include: {
                category: { select: { categoryId: true, categoryName: true } },
                voucherBranches: {
                    include: { branch: { select: { branchId: true, branchName: true } } },
                },
            },
        });
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

        // Validate branchIds
        if (input.branchIds?.length) {
            const owned = await prisma.branch.findMany({
                where: { partnerId, branchId: { in: input.branchIds } },
                select: { branchId: true },
            });
            if (owned.length !== input.branchIds.length) {
                throw new AppError('Một hoặc nhiều chi nhánh không hợp lệ', 400, 'VALIDATION_ERROR');
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
};