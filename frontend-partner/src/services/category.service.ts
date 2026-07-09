import { get } from './api-client';

// ── Types ───────────────────────────────────────────────────────────────────
export interface Category {
  categoryId: number;
  categoryName: string;
  voucherCount: number;
}

// ── API ─────────────────────────────────────────────────────────────────────

/** GET /api/categories — public, no auth required */
export function apiListCategories(): Promise<Category[]> {
  return get<Category[]>('/api/categories').then(res => res.data);
}