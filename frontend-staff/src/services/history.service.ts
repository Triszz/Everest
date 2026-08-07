/**
 * History Service
 * ============================================================
 * Lấy lịch sử voucher đã xác nhận
 */

import { apiClient } from "../api/client";
import type { RedemptionHistoryItem, HistoryQuery } from "../types";

export interface HistoryResponse {
  success: true;
  data: RedemptionHistoryItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export async function getRedemptionHistory(
  query: HistoryQuery,
): Promise<HistoryResponse> {
  const response = await apiClient.get<HistoryResponse>(
    "/partner/redemption/history",
    { params: query },
  );
  return response.data;
}
