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
  totalIssued: number;    // Tổng voucher đã tạo
  totalSold: number;      // Tổng quantity đã bán
  totalUsed: number;      // Tổng voucher đã dùng
  revenue: number;         // Tổng doanh thu (VNĐ)
  usageRate: number;       // Tỷ lệ sử dụng (%)
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
export type VoucherSortBy = "title" | "issued" | "sold" | "used" | "revenue" | "usageRate" | "status";

export interface VoucherReportRow {
  voucherId: number;
  title: string;
  issued: number;
  sold: number;
  used: number;
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
