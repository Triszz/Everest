/**
 * Issued Voucher Service
 * --------------------------------------------------------------
 * Quản lý voucher đã phát hành (sau khi customer thanh toán đơn thành công).
 * - List issued voucher của customer (filter theo status)
 * - Chi tiết 1 issued voucher
 *
 * `isAvailable`: voucher còn dùng được (chưa dùng + voucher cha còn active).
 */
import { prisma } from "../../../config/prisma";
import { Prisma } from "../../../generated/prisma/client";
import { AppError } from "../../../middlewares/errorHandler";
import type { IssuedVouchersQuery } from "./issued-vouchers.schemas";
import { buildPagination } from "../shared";

export const issuedVouchersService = {
  /**
   * Danh sách issued voucher của customer (chỉ lấy từ đơn đã Paid).
   * Trả kèm `hasReviewed` để UI biết ẩn/hiện nút "Đánh giá".
   */
  async listIssuedVouchers(customerId: string, query: IssuedVouchersQuery) {
    const { status, page, pageSize } = query;
    const { skip, pagination } = buildPagination(page, pageSize, 0);

    // Build where clause — status cần cast đúng enum type
    const where: Prisma.IssuedVoucherWhereInput = {
      orderItem: {
        order: { customerId, paymentStatus: "Paid" },
      },
    };
    if (status) {
      where.status = status as Prisma.EnumVoucherUsageStatusFilter<"IssuedVoucher">;
    }

    const [vouchers, total] = await Promise.all([
      prisma.issuedVoucher.findMany({
        where,
        include: {
          orderItem: {
            include: {
              voucher: {
                select: {
                  voucherId: true,
                  title: true,
                  imageUrl: true,
                  expiryDays: true,
                  approvalStatus: true,
                  displayStatus: true,
                  partner: { select: { companyName: true } },
                },
              },
            },
          },
          reviews: {
            where: { customerId },
            select: { reviewId: true },
          },
        },
        orderBy: { validTo: "asc" },
        skip,
        take: pageSize,
      }),
      prisma.issuedVoucher.count({ where }),
    ]);

    return {
      vouchers: vouchers.map((iv) => {
        const v = iv.orderItem.voucher;
        const isAvailable =
          v.approvalStatus === "Approved" && v.displayStatus === "Visible";
        return {
          issuedVoucherId: iv.issuedVoucherId,
          voucherCode: iv.voucherCode,
          status: iv.status,
          validFrom: iv.validFrom,
          validTo: iv.validTo,
          usedAt: iv.usedAt,
          usedAtBranchId: iv.usedAtBranchId,
          hasReviewed: iv.reviews.length > 0,
          isAvailable,
          voucher: {
            voucherId: v.voucherId,
            title: v.title,
            imageUrl: v.imageUrl,
            expiryDays: v.expiryDays,
            partner: v.partner.companyName,
          },
        };
      }),
      pagination: { ...pagination, total },
    };
  },

  /**
   * Chi tiết 1 issued voucher (kèm thông tin voucher cha + danh sách chi nhánh).
   * Throw 404 nếu không thuộc customer.
   */
  async getIssuedVoucher(customerId: string, issuedVoucherId: number) {
    const voucher = await prisma.issuedVoucher.findFirst({
      where: {
        issuedVoucherId,
        orderItem: { order: { customerId } },
      },
      include: {
        orderItem: {
          include: {
            voucher: {
              select: {
                voucherId: true,
                title: true,
                description: true,
                imageUrl: true,
                expiryDays: true,
                applicationCondition: true,
                approvalStatus: true,
                displayStatus: true,
                partner: { select: { companyName: true } },
                voucherBranches: {
                  select: {
                    branch: {
                      select: {
                        branchId: true,
                        branchName: true,
                        address: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!voucher) {
      throw new AppError("Không tìm thấy voucher", 404, "ISSUED_VOUCHER_NOT_FOUND");
    }

    const v = voucher.orderItem.voucher;
    const isAvailable =
      v.approvalStatus === "Approved" && v.displayStatus === "Visible";

    return {
      issuedVoucherId: voucher.issuedVoucherId,
      voucherCode: voucher.voucherCode,
      status: voucher.status,
      validFrom: voucher.validFrom,
      validTo: voucher.validTo,
      usedAt: voucher.usedAt,
      usedAtBranchId: voucher.usedAtBranchId,
      isAvailable,
      voucher: {
        voucherId: v.voucherId,
        title: v.title,
        description: v.description,
        imageUrl: v.imageUrl,
        expiryDays: v.expiryDays,
        applicationCondition: v.applicationCondition,
        partner: v.partner.companyName,
        branches: v.voucherBranches.map((vb) => vb.branch),
      },
    };
  },
};