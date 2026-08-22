/**
 * History Service (Partner Web)
 * ============================================================
 * Wrapper cho `/api/partner/redemption/history`.
 *
 * Backend đã có sẵn endpoint này (dùng cho Staff Mobile) — reuse.
 * Partner_Owner (gọi từ Partner Web) sẽ thấy TẤT CẢ chi nhánh
 * vì auth.branchId === undefined → service không filter branch.
 */

import { get } from "./api-client";
import type {
  HistoryItem,
  HistoryListResponse,
  HistoryQuery,
} from "../types/history";

/**
 * GET /api/partner/redemption/history?page=&limit=&search=&dateFrom=&dateTo=
 *
 * Returns: HistoryListResponse chứa `data` (danh sách HistoryItem) + `pagination`.
 */
export async function apiGetRedemptionHistory(
  query: HistoryQuery = {},
): Promise<HistoryListResponse> {
  const qs = new URLSearchParams();
  if (query.page) qs.set("page", String(query.page));
  if (query.limit) qs.set("limit", String(query.limit));
  if (query.search) qs.set("search", query.search);
  if (query.dateFrom) qs.set("dateFrom", query.dateFrom);
  if (query.dateTo) qs.set("dateTo", query.dateTo);
  const queryString = qs.toString();
  const path = `/api/partner/redemption/history${queryString ? `?${queryString}` : ""}`;

  // Backend returns `{ success, data: HistoryItem[], pagination }`.
  // ApiSuccess<T> không model `pagination`, nên cast thêm field.
  const res = await get<HistoryItem[]>(path, { auth: true });
  return res as unknown as HistoryListResponse;
}