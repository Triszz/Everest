/**
 * notificationApi.ts
 * ------------------------------------------------------------------
 * API cho Notification (thông báo trong app).
 * - Danh sách notifications (phân trang)
 * - Đếm số chưa đọc
 * - Đánh dấu đã đọc
 * ------------------------------------------------------------------
 */
import { authFetch, BASE_URL, handleResponse } from "./http";
import type { NotificationListResponse, Notification } from "./types";

const BASE = `${BASE_URL}/customer/notifications`;

export const notificationApi = {
  /** GET /api/customer/notifications — Danh sách notifications */
  async list(page: number = 1, pageSize: number = 20) {
    const res = await authFetch(
      `${BASE}?page=${page}&pageSize=${pageSize}`,
      { auth: true },
    );
    return handleResponse<NotificationListResponse>(res);
  },

  /** GET /api/customer/notifications/unread-count — Số chưa đọc */
  async getUnreadCount() {
    const res = await authFetch(`${BASE}/unread-count`, { auth: true });
    const json = await handleResponse<{ count?: number; data?: { count: number } }>(res);
    const count = json?.data?.count ?? json?.count ?? 0;
    return { count };
  },

  /** PATCH /api/customer/notifications/:id/read — Đánh dấu 1 cái đã đọc */
  async markAsRead(id: number) {
    const res = await authFetch(`${BASE}/${id}/read`, {
      method: "PATCH",
      auth: true,
    });
    return handleResponse<null>(res);
  },

  /** PATCH /api/customer/notifications/read-all — Đánh dấu tất cả đã đọc */
  async markAllAsRead() {
    const res = await authFetch(`${BASE}/read-all`, {
      method: "PATCH",
      auth: true,
    });
    return handleResponse<null>(res);
  },

  /** GET /api/customer/notifications/:id — Lấy 1 notification theo ID */
  async getById(id: number) {
    const res = await authFetch(`${BASE}/${id}`, { auth: true });
    return handleResponse<Notification>(res);
  },

  /** DELETE /api/customer/notifications/:id — Xóa notification */
  async delete(id: number) {
    const res = await authFetch(`${BASE}/${id}`, {
      method: "DELETE",
      auth: true,
    });
    return handleResponse<null>(res);
  },
};