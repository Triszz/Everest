import { prisma } from "../../../config/prisma";
import type { IssuedVouchersQuery } from "./issued-vouchers.schemas";

export const issuedVouchersService = {
  async listIssuedVouchers(customerId: string, query: IssuedVouchersQuery) {
    const { status, page, pageSize } = query;
    const skip = (page - 1) * pageSize;

    const where = {
      orderItem: {
        order: {
          customerId,
          paymentStatus: "Paid", // only paid orders
        },
      },
      ...(status ? { status } : {}),
    };

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
                  partner: {
                    select: { companyName: true },
                  },
                },
              },
            },
          },
        },
        orderBy: { validTo: "asc" },
        skip,
        take: pageSize,
      }),
      prisma.issuedVoucher.count({ where }),
    ]);

    return {
      vouchers: vouchers.map((iv) => ({
        issuedVoucherId: iv.issuedVoucherId,
        voucherCode: iv.voucherCode,
        status: iv.status,
        validFrom: iv.validFrom,
        validTo: iv.validTo,
        usedAt: iv.usedAt,
        usedAtBranchId: iv.usedAtBranchId,
        voucher: {
          voucherId: iv.orderItem.voucher.voucherId,
          title: iv.orderItem.voucher.title,
          imageUrl: iv.orderItem.voucher.imageUrl,
          expiryDays: iv.orderItem.voucher.expiryDays,
          partner: iv.orderItem.voucher.partner.companyName,
        },
      })),
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

    return {
      issuedVoucherId: voucher.issuedVoucherId,
      voucherCode: voucher.voucherCode,
      status: voucher.status,
      validFrom: voucher.validFrom,
      validTo: voucher.validTo,
      usedAt: voucher.usedAt,
      usedAtBranchId: voucher.usedAtBranchId,
      voucher: {
        voucherId: voucher.orderItem.voucher.voucherId,
        title: voucher.orderItem.voucher.title,
        description: voucher.orderItem.voucher.description,
        imageUrl: voucher.orderItem.voucher.imageUrl,
        expiryDays: voucher.orderItem.voucher.expiryDays,
        applicationCondition: voucher.orderItem.voucher.applicationCondition,
        partner: voucher.orderItem.voucher.partner.companyName,
        branches: voucher.orderItem.voucher.voucherBranches.map((vb) => vb.branch),
      },
    };
  },
};
