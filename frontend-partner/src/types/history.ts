/**
 * History Types (Partner Web)
 * ============================================================
 * Mirror của `backend/src/modules/partners/redemption/redemption.history.schemas.ts`.
 */

export interface HistoryQuery {
  page?: number;
  limit?: number;
  search?: string;
  /** ISO datetime string */
  dateFrom?: string;
  /** ISO datetime string */
  dateTo?: string;
}

export interface HistoryItem {
  issuedVoucherId: number;
  voucherCode: string;
  voucherTitle: string;
  customerName: string | null;
  customerEmail: string;
  /** ISO datetime string */
  usedAt: string;
  usedAtBranchId: number;
  branchName: string;
  /** Trạng thái: Used, Locked, Expired */
  status: string;
}

export interface HistoryPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface HistoryListResponse {
  success: true;
  data: HistoryItem[];
  pagination: HistoryPagination;
}