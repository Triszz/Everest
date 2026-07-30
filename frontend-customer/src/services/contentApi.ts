/**
 * services/contentApi.ts
 * ------------------------------------------------------------------
 * Module API cho nội dung hiển thị: Banner, Popup, Post.
 * Đây là các API public (không cần auth).
 *
 * Banner:
 *  - `bannerApi.list()` : Danh sách banner đang Visible (trang chủ).
 *
 * Popup:
 *  - `popupApi.getActive()` : Lấy popup đang active (ưu tiên 1 popup mới nhất).
 *  - `popupApi.list()`      : Danh sách popup Visible.
 *
 * Post (bài viết / blog):
 *  - `postApi.list(params?)` : Danh sách bài viết đã published, có phân trang.
 *  - `postApi.getById(id)`   : Chi tiết 1 bài viết.
 * ------------------------------------------------------------------
 */
import { BASE_URL, buildQuery, handleResponse } from "./http";
import type { Banner, Popup, Post } from "./types";

// ── Banner ──────────────────────────────────────────────────────────

export const bannerApi = {
  /** Lấy danh sách banner đang hiển thị (chỉ `Visible`). */
  list: async () => {
    const res = await fetch(`${BASE_URL}/banners`);
    return handleResponse<{ success: boolean; data: Banner[] }>(res);
  },
};

// ── Popup ───────────────────────────────────────────────────────────

export const popupApi = {
  /** Lấy popup đang active — nếu backend trả về 1 popup duy nhất (ưu tiên). */
  getActive: async () => {
    const res = await fetch(`${BASE_URL}/popups/active`);
    return handleResponse<{ success: boolean; data: Popup | null }>(res);
  },

  /** Lấy tất cả popup đang `Visible`. */
  list: async () => {
    const res = await fetch(`${BASE_URL}/popups`);
    return handleResponse<{ success: boolean; data: Popup[] }>(res);
  },
};

// ── Post ────────────────────────────────────────────────────────────

export const postApi = {
  /** Danh sách bài viết đã published, có phân trang. */
  list: async (params?: { page?: number; limit?: number }) => {
    const res = await fetch(`${BASE_URL}/posts${buildQuery(params)}`);
    return handleResponse<{
      success: boolean;
      data: { items: Post[]; total: number; page: number; limit: number; totalPages: number };
    }>(res);
  },

  /** Chi tiết 1 bài viết. */
  getById: async (postId: number) => {
    const res = await fetch(`${BASE_URL}/posts/${postId}`);
    return handleResponse<{ success: boolean; data: Post }>(res);
  },
};