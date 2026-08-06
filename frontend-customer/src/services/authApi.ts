/**
 * services/authApi.ts
 * ------------------------------------------------------------------
 * Module API cho Authentication (Customer).
 *
 * Các hàm:
 *  - `authApi.login(email, password)`             : Đăng nhập.
 *  - `authApi.register(data)`                     : Đăng ký tài khoản mới.
 *  - `authApi.me()`                               : Lấy thông tin user hiện tại.
 *  - `authApi.refresh(refreshToken)`              : Refresh access token.
 *  - `authApi.forgotPassword(email)`              : Gửi email reset (B4).
 *  - `authApi.revokeSession(sessionId)`           : Đăng xuất 1 phiên (B9).
 *  - `authApi.revokeAllOtherSessions()`           : Đăng xuất tất cả phiên khác (B9).
 *
 * Lưu ý: refresh token được quản lý tự động trong `services/http.ts`.
 * Sau khi login/register, page cần gọi `setTokens()` để lưu vào localStorage.
 * ------------------------------------------------------------------
 */
import { authFetch, BASE_URL, handleResponse } from "./http";
import type { AuthResponse, MeResponse } from "./types";

export const authApi = {
  /** Đăng nhập bằng email + password. */
  login: async (email: string, password: string) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse<{ success: boolean; data: AuthResponse }>(res);
  },

  /** Đăng ký tài khoản customer mới. */
  register: async (data: { email: string; password: string; fullName: string; phoneNumber?: string }) => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse<{ success: boolean; data: AuthResponse }>(res);
  },

  /** Lấy thông tin user đang đăng nhập (cần Bearer token). */
  me: async () => {
    const res = await authFetch(`${BASE_URL}/auth/me`, { auth: true });
    return handleResponse<{ success: boolean; data: MeResponse }>(res);
  },

  /** Refresh access token từ refresh token. */
  refresh: async (refreshToken: string) => {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    return handleResponse<{ success: boolean; data: AuthResponse }>(res);
  },

  /**
   * B4: Gửi email reset password.
   * Endpoint public, luôn trả success=true (tránh user enumeration).
   */
  forgotPassword: async (email: string) => {
    const res = await fetch(`${BASE_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    return handleResponse<{ success: boolean; message?: string }>(res);
  },

  /** B9: Đăng xuất 1 phiên cụ thể. */
  revokeSession: async (sessionId: string) => {
    const res = await authFetch(`${BASE_URL}/auth/sessions/${sessionId}/revoke`, {
      method: "POST",
      auth: true,
    });
    return handleResponse<{ success: boolean; message?: string }>(res);
  },

  /** B9: Đăng xuất tất cả phiên khác (giữ lại phiên hiện tại). */
  revokeAllOtherSessions: async () => {
    const res = await authFetch(`${BASE_URL}/auth/sessions/revoke-all`, {
      method: "POST",
      auth: true,
    });
    return handleResponse<{ success: boolean; message?: string }>(res);
  },
};