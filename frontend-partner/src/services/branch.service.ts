import { get, post, put, del } from './api-client';
import type {
  Branch,
  BranchDetail,
  CreateBranchInput,
  UpdateBranchInput,
  CreateCashierInput,
  CashierCreated,
} from '../types/branch';

const BASE = '/api/partner/branches';

export type { Branch, BranchDetail };

// ── Branch CRUD ────────────────────────────────────────────────────────────────

/** GET /api/partner/branches */
export function apiListBranches(): Promise<Branch[]> {
  return get<Branch[]>(BASE, { auth: true }).then(res => res.data);
}

/** GET /api/partner/branches/:branchId */
export function apiGetBranch(branchId: number): Promise<BranchDetail> {
  return get<BranchDetail>(`${BASE}/${branchId}`, { auth: true }).then(res => res.data);
}

/** POST /api/partner/branches */
export function apiCreateBranch(input: CreateBranchInput): Promise<Branch> {
  return post<Branch>(BASE, input, { auth: true }).then(res => res.data);
}

/** PUT /api/partner/branches/:branchId */
export function apiUpdateBranch(
  branchId: number,
  input: UpdateBranchInput,
): Promise<Branch> {
  return put<Branch>(`${BASE}/${branchId}`, input, { auth: true }).then(res => res.data);
}

/** DELETE /api/partner/branches/:branchId */
export function apiDeleteBranch(branchId: number): Promise<null> {
  return del<null>(`${BASE}/${branchId}`, { auth: true }).then(res => res.data as null);
}

// ── Cashier Management ───────────────────────────────────────────────────────

/**
 * POST /api/partner/branches/:branchId/cashier
 * Gán thu ngân đã có (qua email) vào chi nhánh.
 */
export function apiAssignCashier(
  branchId: number,
  cashierEmail: string,
): Promise<Branch> {
  return post<Branch>(
    `${BASE}/${branchId}/cashier`,
    { cashierEmail },
    { auth: true },
  ).then(res => res.data);
}

/**
 * DELETE /api/partner/branches/:branchId/cashier
 * Gỡ thu ngân khỏi chi nhánh.
 */
export function apiRemoveCashier(branchId: number): Promise<Branch> {
  return del<Branch>(`${BASE}/${branchId}/cashier`, { auth: true }).then(res => res.data);
}

/**
 * POST /api/partner/cashiers
 * Tạo tài khoản thu ngân mới.
 * Nếu truyền branchId → tự động gán vào chi nhánh (2 thao tác trong 1 transaction backend).
 */
export function apiCreateCashier(input: CreateCashierInput): Promise<CashierCreated> {
  return post<CashierCreated>('/api/partner/cashiers', input, { auth: true }).then(res => res.data);
}

/**
 * Tóm tắt thu ngân cho autocomplete.
 */
export interface CashierSummary {
  userId: string;
  email: string;
  fullName: string;
}

/**
 * GET /api/partner/cashiers?q=&limit=
 * Tìm thu ngân thuộc partner hiện tại (role = Partner_Cashier).
 * Dùng cho autocomplete khi gán cashier.
 */
export function apiSearchCashiers(
  query: { q?: string; limit?: number } = {},
): Promise<CashierSummary[]> {
  const qs = new URLSearchParams();
  if (query.q) qs.set('q', query.q);
  if (query.limit) qs.set('limit', String(query.limit));
  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  return get<CashierSummary[]>(`/api/partner/cashiers${suffix}`, { auth: true })
    .then(res => res.data);
}
