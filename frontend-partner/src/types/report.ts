// ── Date presets ─────────────────────────────────────────────────────────────
export type DatePreset = "today" | "last7days" | "last30days" | "last90days" | "thisYear" | "custom";

export type RevenueGranularity = "day" | "week" | "month";

// ── Filter params ─────────────────────────────────────────────────────────────
export interface ReportFilters {
  datePreset?: DatePreset;
  fromDate?: string;
  toDate?: string;
  voucherId?: number | null;
  branchId?: number | null;
}

// ── KPI data ─────────────────────────────────────────────────────────────────
export interface PartnerKPIs {
  // Tổng voucher trong catalog của Partner (mọi trạng thái).
  // Trước đây field này tên là `totalIssued` nhưng backend filter Approved+Visible
  // (sai nghĩa). Đã tách thành totalCatalog + totalLive để rõ ràng.
  totalCatalog: number;
  // Trong đó bao nhiêu voucher đang được bày bán (Approved + Visible).
  totalLive: number;
  // Legacy alias cho totalCatalog — giữ để không break client cũ.
  /** @deprecated Dùng `totalCatalog` thay thế. */
  totalIssued: number;
  totalSold: number;    // Tổng quantity đã bán
  totalUsed: number;    // Tổng voucher đã dùng
  revenue: number;      // Tổng doanh thu (VNĐ)
  usageRate: number;    // Tỷ lệ sử dụng (%)
}

// ── Revenue chart ─────────────────────────────────────────────────────────────
export interface RevenueChartPoint {
  date: string;
  revenue: number;
}

export interface RevenueChartData {
  granularity: RevenueGranularity;
  data: RevenueChartPoint[];
}

// ── Voucher performance ───────────────────────────────────────────────────────
export interface VoucherPerformanceItem {
  voucherId: number;
  title: string;
  sold: number;
  used: number;
  usageRate: number;
}

export interface VoucherPerformanceData {
  data: VoucherPerformanceItem[];
}

// ── Status distribution ───────────────────────────────────────────────────────
export interface StatusDistributionItem {
  label: string;
  count: number;
  type: "voucher" | "issued";
}

export interface StatusDistributionData {
  data: StatusDistributionItem[];
}

// ── Voucher table ─────────────────────────────────────────────────────────────
// sortBy 'issued' được giữ là alias legacy → backend map sang totalQuantity.
// Sử dụng 'totalQuantity' / 'isLive' / 'soldRate' cho code mới.
export type VoucherSortBy =
  | "title"
  | "issued" // legacy alias → totalQuantity
  | "totalQuantity"
  | "isLive"
  | "sold"
  | "used"
  | "soldRate"
  | "revenue"
  | "usageRate"
  | "status";

export interface VoucherReportRow {
  voucherId: number;
  title: string;
  // Tổng số lượng phát hành ban đầu.
  totalQuantity: number;
  // Voucher đang được bày bán trên store hay không.
  isLive: boolean;
  // Legacy: backend vẫn trả 'issued' để không break client cũ, giá trị = totalQuantity.
  /** @deprecated Dùng `totalQuantity` thay thế. */
  issued: number;
  sold: number;
  used: number;
  // soldRate = sold / totalQuantity — tỷ lệ bán hết trên tổng phát hành.
  soldRate: number;
  // usageRate = used / sold — tỷ lệ khách đã mua đến redeem.
  usageRate: number;
  status: string;
  createdAt: string;
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
}

export interface VoucherReportData {
  data: VoucherReportRow[];
  pagination: PaginationInfo;
}
