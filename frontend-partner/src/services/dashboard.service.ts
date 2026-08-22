/**
 * Dashboard Service
 * ============================================================
 * Wrapper cho `/api/partner/dashboard/stats`.
 * Backend đã có sẵn endpoint này (dùng cho Staff Mobile) — reuse.
 */

import { get } from "./api-client";

export interface TodaySummary {
  /** Số voucher đã xác nhận sử dụng hôm nay */
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

export interface DashboardData {
  summary: TodaySummary;
  recentActivity: RecentActivityItem[];
}

/**
 * GET /api/partner/dashboard/stats
 *
 * Backend response envelope (lưu ý: `summary`+`recentActivity` nằm ở top level `data`):
 * ```json
 * {
 *   "success": true,
 *   "data": {
 *     "summary": { "confirmedCount": ..., "pendingCount": ..., "lastConfirmedAt": ... },
 *     "recentActivity": [...]
 *   }
 * }
 * ```
 *
 * `api-client.get<T>()` đã unwrap 1 lớp và trả về `ApiSuccess<T>` = `{ success, data: T, message? }`.
 * Do đó ta chỉ cần return `res.data` (KHÔNG unwrap thêm) — đây chính là `DashboardData`.
 *
 * Lưu ý: trước đây code cũ định nghĩa `DashboardStatsResponse = { success, data: DashboardData }`
 * rồi return `res.data` (unwrap thêm 1 lần) → hook nhận nhầm `{ summary, recentActivity }` làm
 * `DashboardStatsResponse`, gọi `.data` lần nữa → `undefined` → UI hiển thị 0 mãi mãi dù API trả 200.
 */
export async function apiGetDashboardStats(
  recentLimit = 5,
): Promise<DashboardData> {
  const res = await get<DashboardData>(
    `/api/partner/dashboard/stats?recentLimit=${recentLimit}`,
    { auth: true },
  );
  return res.data;
}