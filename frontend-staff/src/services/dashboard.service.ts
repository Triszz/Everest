/**
 * Dashboard Service
 * ============================================================
 * Service cho dashboard data
 * Interface được thiết kế để match với API thật
 */

import { apiClient } from "../api/client";
import type { TodaySummary, RedemptionHistoryItem } from "../types";

// API endpoint: GET /partner/dashboard/stats?recentLimit=5
// Trả về Dashboard stats với recent activity limit riêng

export interface DashboardStats {
  summary: TodaySummary;
  recentActivity: RedemptionHistoryItem[];
}

export type DashboardError =
  | { type: "NETWORK_ERROR"; message: string }
  | { type: "SERVER_ERROR"; message: string }
  | { type: "UNKNOWN_ERROR"; message: string };

/**
 * Lấy dashboard stats
 * Backend trả về summary + recent activity với limit riêng
 */
export async function getDashboardStats(
  recentLimit = 5,
): Promise<DashboardStats> {
  const response = await apiClient.get<{
    success: true;
    data: DashboardStats;
  }>("/partner/dashboard/stats", {
    params: { recentLimit },
  });
  return response.data.data;
}

/**
 * Lấy summary hôm nay
 */
export async function getTodaySummary(): Promise<TodaySummary> {
  const stats = await getDashboardStats(5);
  return stats.summary;
}

/**
 * Lấy recent activity với limit riêng (không tải toàn bộ history)
 */
export async function getRecentActivity(
  limit = 5,
): Promise<RedemptionHistoryItem[]> {
  const stats = await getDashboardStats(limit);
  return stats.recentActivity;
}