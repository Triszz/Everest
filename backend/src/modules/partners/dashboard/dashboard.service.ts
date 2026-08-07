/**
 * Dashboard Service
 * ------------------------------------------------
 * Lấy summary + recent activity cho Dashboard
 *
 * Performance: KHÔNG load toàn bộ history
 * - recentActivity giới hạn theo recentLimit param (default 5)
 * - todaySummary chỉ count 1 query riêng
 */

import { prisma } from "../../../config/prisma";
import type {
  DashboardQuery,
  RecentActivityItem,
  TodaySummary,
} from "./dashboard.schemas";

/**
 * Lấy dashboard data (summary + recent activity)
 */
export async function getDashboardData(
  auth: { partnerId: number; branchId?: number },
  query: DashboardQuery,
): Promise<{
  summary: TodaySummary;
  recentActivity: RecentActivityItem[];
}> {
  const [summary, recentActivity] = await Promise.all([
    getTodaySummary(auth),
    getRecentActivity(auth, query.recentLimit),
  ]);

  return { summary, recentActivity };
}

/**
 * Summary hôm nay: confirmed count + last confirmed
 */
async function getTodaySummary(auth: {
  partnerId: number;
  branchId?: number;
}): Promise<TodaySummary> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const where: Record<string, unknown> = {
    status: "Used",
    usedAt: { gte: startOfDay, lte: endOfDay },
    orderItem: { voucher: { partnerId: auth.partnerId } },
  };

  if (auth.branchId !== undefined) {
    where.usedAtBranchId = auth.branchId;
  }

  const [count, latest] = await Promise.all([
    prisma.issuedVoucher.count({ where }),
    prisma.issuedVoucher.findFirst({
      where,
      orderBy: { usedAt: "desc" },
      select: { usedAt: true },
    }),
  ]);

  return {
    confirmedCount: count,
    pendingCount: 0,
    lastConfirmedAt: latest?.usedAt?.toISOString() ?? null,
  };
}

/**
 * Recent activity với limit riêng (không load full history)
 */
async function getRecentActivity(
  auth: { partnerId: number; branchId?: number },
  limit: number,
): Promise<RecentActivityItem[]> {
  const where: Record<string, unknown> = {
    status: "Used",
    usedAt: { not: null },
    orderItem: { voucher: { partnerId: auth.partnerId } },
  };

  if (auth.branchId !== undefined) {
    where.usedAtBranchId = auth.branchId;
  }

  const items = await prisma.issuedVoucher.findMany({
    where,
    include: {
      orderItem: {
        include: {
          voucher: { select: { title: true } },
          order: {
            include: {
              customer: { select: { fullName: true, email: true } },
            },
          },
        },
      },
      usedAtBranch: { select: { branchId: true, branchName: true } },
    },
    orderBy: { usedAt: "desc" },
    take: limit,
  });

  return items.map((iv) => ({
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
}
