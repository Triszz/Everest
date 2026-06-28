// ── Voucher types (matching backend response shapes) ────────────────────────

export type ApprovalStatus = 'Draft' | 'Pending' | 'Approved' | 'Rejected';
export type DisplayStatus = 'Visible' | 'Hidden';

export interface VoucherCategory {
  categoryId: number;
  categoryName: string;
}

export interface VoucherBranch {
  branchId: number;
  branchName: string;
  /**
   * Only included on the detail endpoint (`GET /api/partner/vouchers/:id`).
   * The list endpoint omits this field.
   */
  address?: string | null;
}

export interface Voucher {
  voucherId: number;
  partnerId: number;
  title: string;
  description: string | null;
  categoryId: number;
  applicationCondition: string | null;
  originalPrice: string | number;
  salePrice: string | number;
  totalQuantity: number;
  availableQuantity: number;
  imageUrl: string | null;
  startDate: string;
  endDate: string;
  expiryDays: number;
  approvalStatus: ApprovalStatus;
  displayStatus: DisplayStatus;
  createdAt: string;
  updatedAt: string;
  category: VoucherCategory | null;
  voucherBranches: { branch: VoucherBranch }[];
}

export interface VoucherStats {
  soldCount: number;
  usedCount: number;
}

export type VoucherDetail = Voucher & { stats: VoucherStats };

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface VoucherListResponse {
  data: Voucher[];
  pagination: Pagination;
}
