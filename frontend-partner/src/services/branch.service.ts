import { get } from './api-client';

// ── Types ───────────────────────────────────────────────────────────────────
export interface Branch {
  branchId: number;
  branchName: string;
  address: string | null;
  phoneNumber: string | null;
  cashier: { userId: string; fullName: string; email: string } | null;
  _count: { voucherBranches: number };
}

// ── API ─────────────────────────────────────────────────────────────────────

/** GET /api/partner/branches — requires Partner_Owner auth */
export function apiListBranches(): Promise<Branch[]> {
  return get<Branch[]>('/api/partner/branches', { auth: true }).then(res => res.data);
}