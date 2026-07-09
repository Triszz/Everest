import { get, post, put, del } from './api-client';
import type { ApiSuccess } from '../types/auth';
import type {
  Voucher,
  VoucherDetail,
  VoucherListResponse,
  ApprovalStatus,
  Pagination,
} from '../types/voucher';

// ── Base path (mounted at /api/partner/vouchers in backend) ─────────────────
const BASE = '/api/partner/vouchers';

// ── Query params ────────────────────────────────────────────────────────────
export interface VoucherQueryParams {
  page?: number;
  limit?: number;
  status?: ApprovalStatus;
  q?: string;
}

function buildQuery(params: VoucherQueryParams): string {
  const qs = new URLSearchParams();
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  if (params.status) qs.set('status', params.status);
  if (params.q) qs.set('q', params.q);
  const str = qs.toString();
  return str ? `?${str}` : '';
}

// ── API calls ───────────────────────────────────────────────────────────────
//
// All endpoints here are protected, so `auth: true` is set so the HTTP
// client automatically attaches the Bearer token and handles 401
// → refresh → retry on the user's behalf.

/**
 * GET /api/partner/vouchers?page=&limit=&status=&q=
 * Backend spreads `{ data, pagination }` into the response envelope,
 * so we read `pagination` from the envelope alongside `data`.
 */
export async function apiListVouchers(
  params: VoucherQueryParams = {},
): Promise<VoucherListResponse> {
  const res = await get<Voucher[]>(`${BASE}${buildQuery(params)}`, { auth: true });
  // Backend list endpoint returns `{ success, data: [...], pagination: {...} }`.
  // `ApiSuccess<T>` doesn't model `pagination`, so we cast the extra field.
  const { data, pagination } = res as ApiSuccess<Voucher[]> & { pagination: Pagination };
  return { data, pagination };
}

/**
 * GET /api/partner/vouchers/:id
 * Response: { success, data: VoucherDetail }
 */
export function apiGetVoucher(voucherId: number): Promise<VoucherDetail> {
  return get<VoucherDetail>(`${BASE}/${voucherId}`, { auth: true }).then(res => res.data);
}

/**
 * POST /api/partner/vouchers
 * Response: { success, data: Voucher }
 */
export function apiCreateVoucher(input: Record<string, unknown>): Promise<Voucher> {
  return post<Voucher>(BASE, input, { auth: true }).then(res => res.data);
}

/**
 * PUT /api/partner/vouchers/:id
 * Response: { success, data: Voucher }
 */
export function apiUpdateVoucher(
  voucherId: number,
  input: Record<string, unknown>,
): Promise<Voucher> {
  return put<Voucher>(`${BASE}/${voucherId}`, input, { auth: true }).then(res => res.data);
}

/**
 * POST /api/partner/vouchers/:id/submit
 * Response: { success, data, message }
 */
export function apiSubmitVoucher(
  voucherId: number,
): Promise<{ voucherId: number; title: string; approvalStatus: string }> {
  return post<{ voucherId: number; title: string; approvalStatus: string }>(
    `${BASE}/${voucherId}/submit`,
    undefined,
    { auth: true },
  ).then(res => res.data);
}

/**
 * DELETE /api/partner/vouchers/:id
 * Response: { success, data: null, message }
 */
export function apiDeleteVoucher(voucherId: number): Promise<null> {
  return del<null>(`${BASE}/${voucherId}`, { auth: true }).then(res => res.data as null);
}