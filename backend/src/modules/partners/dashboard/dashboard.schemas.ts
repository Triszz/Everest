/**
 * Dashboard Schemas
 * ------------------------------------------------
 * Types cho Dashboard API
 */

import { z } from "zod";

// ============================================================
// INPUT SCHEMA
// ============================================================

export const dashboardQuerySchema = z.object({
  recentLimit: z.coerce.number().int().positive().max(20).default(5),
});

export type DashboardQuery = z.infer<typeof dashboardQuerySchema>;

// ============================================================
// RESPONSE TYPES
// ============================================================

export interface TodaySummary {
  /** Số voucher đã xác nhận hôm nay */
  confirmedCount: number;
  /** Số voucher pending (nếu có) */
  pendingCount: number;
  /** Thời gian xác nhận gần nhất */
  lastConfirmedAt: string | null;
}

export interface RecentActivityItem {
  issuedVoucherId: number;
  voucherCode: string;
  voucherTitle: string;
  customerName: string | null;
  customerEmail: string;
  usedAt: string;
  usedAtBranchId: number;
  branchName: string;
  status: string;
}

export interface DashboardResponse {
  success: true;
  data: {
    summary: TodaySummary;
    recentActivity: RecentActivityItem[];
  };
}
