import { prisma } from "../../../config/prisma";
import type { IssuedVouchersQuery } from "./issued-vouchers.schemas";

export const issuedVouchersService = {
  async listIssuedVouchers(customerId: string, query: IssuedVouchersQuery) {
    const { status, page, pageSize } = query;
    const skip = (page - 1) * pageSize;

    const where: Record<string, unknown> = {
      orderItem: {
        order: {
          customerId,
          paymentStatus: "Paid",
        },
      },
    };
    if (status) where.status = status;

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
                  partner: {
                    select: { companyName: true },
                  },
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
        const isAvailable = v.approvalStatus === "Approved" && v.displayStatus === "Visible";
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
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  },

  async getIssuedVoucher(customerId: string, issuedVoucherId: number) {
    const voucher = await prisma.issuedVoucher.findFirst({
      where: {
        issuedVoucherId,
        orderItem: {
          order: { customerId },
        },
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
                  partner: {
                    select: {
                      companyName: true,
                    },
                  },
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

    if (!voucher) return null;

    const v = voucher.orderItem.voucher;
    const isAvailable = v.approvalStatus === "Approved" && v.displayStatus === "Visible";

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
