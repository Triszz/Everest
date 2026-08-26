/**
 * services/voucherApi.ts
 * ------------------------------------------------------------------
 * Module API cho Voucher + Category + Partner (BR-CUS-03).
 *
 * Các hàm:
 *  - `voucherApi.list(query?)`     : Danh sách voucher có filter/sort/pagination.
 *  - `voucherApi.getFeatured()`    : Top voucher nổi bật cho trang chủ.
 *  - `voucherApi.getById(id)`      : Chi tiết 1 voucher.
 *  - `voucherApi.getReviews(id)`   : Danh sách review của voucher.
 *
 *  - `categoryApi.list()`          : Danh sách tất cả danh mục.
 *  - `categoryApi.getById(id)`     : Chi tiết danh mục.
 *  - `categoryApi.getVouchers()`   : Voucher theo danh mục + filter.
 *
 *  - `partnerApi.list()`           : Danh sách đối tác (cho dropdown filter).
 * ------------------------------------------------------------------
 */
import { authFetch, BASE_URL, buildQuery, handleResponse } from "./http";
import type {
  Voucher,
  VoucherQuery,
  Category,
  CategoryVoucherQuery,
  Partner,
  Review,
} from "./types";
import type { PaginationMeta } from "./http";

// ── Voucher ─────────────────────────────────────────────────────────

export const voucherApi = {
  /**
   * Lấy danh sách voucher kèm filter/sort/pagination.
   * @param params {@link VoucherQuery}
   */
  list: async (params?: VoucherQuery) => {
    const res = await authFetch(`${BASE_URL}/vouchers${buildQuery(params as Record<string, unknown>)}`, {
      auth: true,
    });
    const json = await handleResponse<{
      success: boolean;
      vouchers: Voucher[];
      pagination: PaginationMeta;
    }>(res);
    // Chuẩn hoá: backend trả `vouchers`, UI mong đợi `data`.
    return { ...json, data: json.vouchers };
  },

  /** Top 8 voucher nổi bật (cho trang chủ). */
  getFeatured: async () => {
    const res = await authFetch(`${BASE_URL}/vouchers/featured`, { auth: true });
    return handleResponse<{ success: boolean; data: Voucher[] }>(res);
  },

  /** Chi tiết 1 voucher (kèm branches, reviews summary). */
  getById: async (id: number) => {
    const res = await authFetch(`${BASE_URL}/vouchers/${id}`, { auth: true });
    return handleResponse<{ success: boolean; data: Voucher }>(res);
  },

  /** Lấy review phân trang của 1 voucher. */
  getReviews: async (id: number, page = 1, limit = 10) => {
    const res = await authFetch(
      `${BASE_URL}/vouchers/${id}/reviews?page=${page}&limit=${limit}`,
      { auth: true }
    );
    const json = await handleResponse<{
      success: boolean;
      reviews: Review[];
      pagination: PaginationMeta;
    }>(res);
    return { ...json, data: json.reviews };
  },
};

// ── Category ────────────────────────────────────────────────────────

export const categoryApi = {
  /** Danh sách tất cả danh mục (kèm voucherCount). */
  list: async () => {
    const res = await authFetch(`${BASE_URL}/categories`, { auth: true });
    return handleResponse<{ success: boolean; data: Category[] }>(res);
  },

  /** Chi tiết 1 danh mục. */
  getById: async (id: number) => {
    const res = await authFetch(`${BASE_URL}/categories/${id}`, { auth: true });
    return handleResponse<{ success: boolean; data: Category }>(res);
  },

  /** Voucher theo danh mục, có sort + phân trang. */
  getVouchers: async (id: number, params?: CategoryVoucherQuery) => {
    const res = await authFetch(
      `${BASE_URL}/categories/${id}/vouchers${buildQuery(params as Record<string, unknown>)}`,
      { auth: true }
    );
    return handleResponse<{
      success: boolean;
      category: Category;
      vouchers: Voucher[];
      pagination: PaginationMeta;
    }>(res);
  },
};

// ── Partner (BR-CUS-03) ─────────────────────────────────────────────

export const partnerApi = {
  /** Danh sách đối tác đã duyệt (cho dropdown filter). */
  list: async () => {
    const res = await fetch(`${BASE_URL}/vouchers/search/partners`);
    return handleResponse<{ success: boolean; data: Partner[] }>(res);
  },
};