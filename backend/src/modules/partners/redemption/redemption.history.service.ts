/**
 * History Service
 * ------------------------------------------------
 * Lấy danh sách voucher đã xác nhận sử dụng
 */

import { prisma } from "../../../config/prisma";
import type {
  HistoryItem,
  HistoryQuery,
} from "./redemption.history.schemas";

/**
 * Lấy lịch sử redemption
 * Sắp xếp theo usedAt DESC
 *
 * @param auth - context từ JWT (partnerId, branchId)
 * @param query - filter params
 */
export async function getRedemptionHistory(
  auth: { partnerId: number; branchId?: number },
  query: HistoryQuery,
): Promise<{
  data: HistoryItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}> {
  const { page, limit, search, dateFrom, dateTo } = query;

  // Build where clause
  const where: Record<string, unknown> = {
    status: "Used",
    orderItem: {
      voucher: {
        partnerId: auth.partnerId,
      },
    },
    usedAt: { not: null },
  };

  // Branch filter - cashier chỉ thấy branch của mình
  if (auth.branchId !== undefined) {
    where.usedAtBranchId = auth.branchId;
  }

  // Date range filter
  if (dateFrom || dateTo) {
    const usedAtFilter: Record<string, Date> = {};
    if (dateFrom) usedAtFilter.gte = new Date(dateFrom);
    if (dateTo) usedAtFilter.lte = new Date(dateTo);
    where.usedAt = { ...(where.usedAt as Record<string, Date>), ...usedAtFilter };
  }

  // Search by voucherCode or customerName
  if (search && search.trim()) {
    const searchTerm = search.trim();
    where.OR = [
      { voucherCode: { contains: searchTerm, mode: "insensitive" } },
      {
        orderItem: {
          order: {
            customer: {
              OR: [
                { fullName: { contains: searchTerm, mode: "insensitive" } },
                { email: { contains: searchTerm, mode: "insensitive" } },
              ],
            },
          },
        },
      },
    ];
  }

  // Count total
  const total = await prisma.issuedVoucher.count({ where });

  // Fetch items
  const issuedVouchers = await prisma.issuedVoucher.findMany({
    where,
    include: {
      orderItem: {
        include: {
          voucher: { select: { title: true } },
          order: {
            include: {
              customer: {
                select: {
                  fullName: true,
                  email: true,
                },
              },
            },
          },
        },
      },
      usedAtBranch: {
        select: {
          branchId: true,
          branchName: true,
        },
      },
    },
    orderBy: {
      usedAt: "desc",
    },
    skip: (page - 1) * limit,
    take: limit,
  });

  // Map to response
  const data: HistoryItem[] = issuedVouchers.map((iv) => ({
    issuedVoucherId: iv.issuedVoucherId,
    voucherCode: iv.voucherCode,
    voucherTitle: iv.orderItem.voucher.title,
    customerName: iv.orderItem.order.customer.fullName,
    customerEmail: iv.orderItem.order.customer.email,
    usedAt: iv.usedAt!.toISOString(),
    usedAtBranchId: iv.usedAtBranchId!,
    branchName: iv.usedAtBranch?.branchName ?? "N/A",
    status: iv.status,
  }));

  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasMore: page < totalPages,
    },
  };
}
