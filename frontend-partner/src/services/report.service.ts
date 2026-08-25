import { get } from './api-client';
import type {
  PartnerKPIs,
  RevenueChartData,
  VoucherPerformanceData,
  StatusDistributionData,
  VoucherReportData,
  VoucherSortBy,
  DatePreset,
  RevenueGranularity,
} from '../types/report';

function filtersToQuery(filters: {
  datePreset?: DatePreset;
  fromDate?: string;
  toDate?: string;
  voucherId?: number | null;
  branchId?: number | null;
}): string {
  const params = new URLSearchParams();
  if (filters.datePreset) params.set('datePreset', filters.datePreset);
  if (filters.fromDate) params.set('fromDate', filters.fromDate);
  if (filters.toDate) params.set('toDate', filters.toDate);
  if (filters.voucherId) params.set('voucherId', String(filters.voucherId));
  if (filters.branchId) params.set('branchId', String(filters.branchId));
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

/** GET /api/partner/reports/kpis */
export async function apiGetKPIs(params?: {
  datePreset?: DatePreset;
  fromDate?: string;
  toDate?: string;
  voucherId?: number | null;
  branchId?: number | null;
}): Promise<PartnerKPIs> {
  const q = params ? filtersToQuery(params) : '';
  const res = await get<PartnerKPIs>(`/api/partner/reports/kpis${q}`, { auth: true });
  return res.data as PartnerKPIs;
}

/** GET /api/partner/reports/revenue-chart */
export async function apiGetRevenueChart(params?: {
  datePreset?: DatePreset;
  fromDate?: string;
  toDate?: string;
  voucherId?: number | null;
  branchId?: number | null;
  granularity?: RevenueGranularity;
  offset?: number;
}): Promise<RevenueChartData> {
  const q = params ? filtersToQuery(params) : '';
  const gran = params?.granularity ? `&granularity=${params.granularity}` : '';
  const offset = params?.offset ? `&offset=${params.offset}` : '';
  const res = await get<RevenueChartData>(
    `/api/partner/reports/revenue-chart${q}${gran}${offset}`,
    { auth: true },
  );
  return res.data as RevenueChartData;
}

/** GET /api/partner/reports/voucher-performance */
export async function apiGetVoucherPerformance(params?: {
  datePreset?: DatePreset;
  fromDate?: string;
  toDate?: string;
  voucherId?: number | null;
  branchId?: number | null;
  limit?: number;
}): Promise<VoucherPerformanceData> {
  const q = params ? filtersToQuery(params) : '';
  const res = await get<VoucherPerformanceData>(
    `/api/partner/reports/voucher-performance${q}`,
    { auth: true },
  );
  return res.data as VoucherPerformanceData;
}

/** GET /api/partner/reports/voucher-status-distribution */
export async function apiGetStatusDistribution(params?: {
  datePreset?: DatePreset;
  fromDate?: string;
  toDate?: string;
  voucherId?: number | null;
  branchId?: number | null;
}): Promise<StatusDistributionData> {
  const q = params ? filtersToQuery(params) : '';
  const res = await get<StatusDistributionData>(
    `/api/partner/reports/voucher-status-distribution${q}`,
    { auth: true },
  );
  return res.data as StatusDistributionData;
}

/** GET /api/partner/reports/vouchers */
export async function apiGetVoucherReportTable(params: {
  datePreset?: DatePreset;
  fromDate?: string;
  toDate?: string;
  voucherId?: number | null;
  branchId?: number | null;
  page?: number;
  limit?: number;
  sortBy?: VoucherSortBy;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}): Promise<VoucherReportData> {
  const q = filtersToQuery(params);
  const extra = new URLSearchParams();
  if (params.page) extra.set('page', String(params.page));
  if (params.limit) extra.set('limit', String(params.limit));
  if (params.sortBy) extra.set('sortBy', params.sortBy);
  if (params.sortOrder) extra.set('sortOrder', params.sortOrder);
  if (params.search) extra.set('search', params.search);
  const eq = extra.toString();
  const res = await get<VoucherReportData>(
    `/api/partner/reports/vouchers${q}${q ? '&' : '?'}${eq}`,
    { auth: true },
  );
  return res.data as VoucherReportData;
}
