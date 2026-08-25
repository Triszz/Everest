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
 *  - `authApi.sendOtp(email, purpose)`            : Gửi mã OTP verify email.
 *  - `authApi.verifyOtp(email, code, purpose)`    : Xác thực OTP, trả AuthResponse.
 *  - `authApi.resendOtp(email, purpose)`          : Gửi lại OTP.
 *
 * Lưu ý: refresh token được quản lý tự động trong `services/http.ts`.
 * Sau khi login/register, page cần gọi `setTokens()` để lưu vào localStorage.
 * ------------------------------------------------------------------
 */
import { authFetch, BASE_URL, handleResponse } from "./http";
import type { AuthResponse, MeResponse } from "./types";

export type OtpPurpose = "REGISTER_VERIFY" | "RESET_PASSWORD" | "TWO_FA_LOGIN";

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

  /**
   * Đăng ký tài khoản customer mới.
   * Trả về { user } (KHÔNG có token) — phải verify OTP trước.
   */
  register: async (data: {
    email: string;
    password: string;
    fullName: string;
    phoneNumber?: string;
    otpChannel?: "email" | "sms";
  }) => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse<{
      success: boolean;
      data: { user: { userId: string; email: string; fullName: string; role: string; emailVerified: boolean } };
      message?: string;
    }>(res);
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

  /** Gửi mã OTP (qua Email hoặc SMS). */
  sendOtp: async (
    email: string,
    purpose: OtpPurpose = "REGISTER_VERIFY",
    channel: "email" | "sms" = "email"
  ) => {
    const res = await fetch(`${BASE_URL}/auth/email-otp/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, purpose, channel }),
    });
    return handleResponse<{ success: boolean; message?: string; expiresIn?: number; sent?: boolean }>(res);
  },

  /**
   * Xác thực OTP.
   * Với REGISTER_VERIFY → trả AuthResponse (auto-login).
   */
  verifyOtp: async (email: string, code: string, purpose: OtpPurpose = "REGISTER_VERIFY") => {
    const res = await fetch(`${BASE_URL}/auth/email-otp/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code, purpose }),
    });
    return handleResponse<{ success: boolean; data?: AuthResponse; message?: string }>(res);
  },

  /** Gửi lại OTP (qua Email hoặc SMS, có cooldown 60s). */
  resendOtp: async (
    email: string,
    purpose: OtpPurpose = "REGISTER_VERIFY",
    channel: "email" | "sms" = "email"
  ) => {
    const res = await fetch(`${BASE_URL}/auth/email-otp/resend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, purpose, channel }),
    });
    return handleResponse<{ success: boolean; message?: string; expiresIn?: number }>(res);
  },
};