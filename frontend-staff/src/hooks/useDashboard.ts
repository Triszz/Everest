/**
 * Dashboard Hooks
 * ============================================================
 * React Query hooks cho dashboard
 */

import { useQuery, useQueryClient, type UseQueryResult } from "@tanstack/react-query";
import {
  getDashboardStats,
  getTodaySummary,
  getRecentActivity,
  type DashboardStats,
} from "../services/dashboard.service";
import type { TodaySummary, RedemptionHistoryItem } from "../types";
import { isNetworkError } from "../utils/network";

// Query keys
const DASHBOARD_KEYS = {
  STATS: ["dashboard", "stats"] as const,
  SUMMARY: ["dashboard", "summary"] as const,
  RECENT: ["dashboard", "recent"] as const,
};

/**
 * Extended query result với error type
 */
export type DashboardQueryResult<T> = UseQueryResult<T> & {
  isOffline: boolean;
};

/**
 * Get full dashboard stats (summary + recent activity)
 */
export function useDashboardStats(
  recentLimit = 5,
): DashboardQueryResult<DashboardStats> {
  const queryClient = useQueryClient();
  const result = useQuery<DashboardStats, Error>({
    queryKey: [...DASHBOARD_KEYS.STATS, recentLimit],
    queryFn: () => getDashboardStats(recentLimit),
    staleTime: 1000 * 60, // 1 minute
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  return {
    ...result,
    isOffline: isNetworkError(result.error),
  };
}

/**
 * Get today's summary only
 */
export function useTodaySummary(): DashboardQueryResult<TodaySummary> {
  const result = useQuery<TodaySummary, Error>({
    queryKey: DASHBOARD_KEYS.SUMMARY,
    queryFn: () => getTodaySummary(),
    staleTime: 1000 * 60, // 1 minute
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  return {
    ...result,
    isOffline: isNetworkError(result.error),
  };
}

/**
 * Get recent activity only - chỉ tải 5 items, không tải toàn bộ
 */
export function useRecentActivity(
  limit = 5,
): DashboardQueryResult<RedemptionHistoryItem[]> {
  const result = useQuery<RedemptionHistoryItem[], Error>({
    queryKey: [...DASHBOARD_KEYS.RECENT, limit],
    queryFn: () => getRecentActivity(limit),
    staleTime: 1000 * 60, // 1 minute
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  return {
    ...result,
    isOffline: isNetworkError(result.error),
  };
}

/**
 * Refresh dashboard data
 */
export function useRefreshDashboard() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  };
}