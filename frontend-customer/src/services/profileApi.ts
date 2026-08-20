/**
 * services/profileApi.ts
 * ------------------------------------------------------------------
 * Module API cho Profile + Password + Notification Preferences.
 *
 * Các hàm:
 *  - `profileApi.getProfile()`                       : Lấy thông tin profile.
 *  - `profileApi.updateProfile(data)`                : Cập nhật họ tên + SĐT.
 *  - `profileApi.changePassword(data)`               : Đổi mật khẩu.
 *  - `profileApi.getNotificationPrefs()`             : Lấy cài đặt thông báo.
 *  - `profileApi.updateNotificationPrefs(prefs)`     : Cập nhật cài đặt thông báo (B10).
 * ------------------------------------------------------------------
 */
import { authFetch, BASE_URL, handleResponse } from "./http";
import type { User } from "./types";

export const profileApi = {
  /** Lấy thông tin profile của customer hiện tại. */
  getProfile: async () => {
    const res = await authFetch(`${BASE_URL}/customer/profile/me`, { auth: true });
    return handleResponse<{ success: boolean; data: User }>(res);
  },

  /** Cập nhật fullName + phoneNumber. */
  updateProfile: async (data: { fullName?: string; phoneNumber?: string | null }) => {
    const res = await authFetch(`${BASE_URL}/customer/profile/me`, {
      method: "PUT",
      auth: true,
      body: JSON.stringify(data),
    });
    return handleResponse<{ success: boolean; data: User; message: string }>(res);
  },

  /** Đổi mật khẩu. Cần cung cấp currentPassword + newPassword. */
  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    const res = await authFetch(`${BASE_URL}/customer/profile/password`, {
      method: "PUT",
      auth: true,
      body: JSON.stringify(data),
    });
    return handleResponse<{ success: boolean; data: null; message: string }>(res);
  },

  /** B10: Lấy cài đặt thông báo (9 loại n1..n9). */
  getNotificationPrefs: async () => {
    const res = await authFetch(`${BASE_URL}/customer/notifications/preferences`, { auth: true });
    return handleResponse<{ success: boolean; data: Record<string, boolean> }>(res);
  },

  /** B10: Cập nhật cài đặt thông báo. Body: `{ n1?: boolean, n2?: boolean, ..., n9?: boolean }`. */
  updateNotificationPrefs: async (prefs: Record<string, boolean>) => {
    const res = await authFetch(`${BASE_URL}/customer/notifications/preferences`, {
      method: "PUT",
      auth: true,
      body: JSON.stringify(prefs),
    });
    return handleResponse<{ success: boolean; data: Record<string, boolean>; message: string }>(res);
  },
};