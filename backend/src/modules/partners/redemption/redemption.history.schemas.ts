/**
 * History Schemas
 * ------------------------------------------------
 * Định nghĩa types và Zod schema cho History API.
 */

import { z } from "zod";

// ============================================================
// INPUT SCHEMA
// ============================================================

export const historyQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().max(100).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

export type HistoryQuery = z.infer<typeof historyQuerySchema>;

// ============================================================
// RESPONSE TYPES
// ============================================================

export interface HistoryItem {
  /** ID của issued voucher */
  issuedVoucherId: number;
  /** Mã voucher */
  voucherCode: string;
  /** Tiêu đề voucher */
  voucherTitle: string;
  /** Tên khách hàng */
  customerName: string | null;
  /** Email khách hàng */
  customerEmail: string;
  /** Thời gian sử dụng (ISO string) */
  usedAt: string;
  /** Branch ID đã xác nhận */
  usedAtBranchId: number;
  /** Tên branch */
  branchName: string;
  /** Trạng thái: Used, Locked, Expired */
  status: string;
}

export interface HistoryListResponse {
  success: true;
  data: HistoryItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}
