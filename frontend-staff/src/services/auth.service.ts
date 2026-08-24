/**
 * Auth Service
 * ============================================================
 * Xử lý authentication với error handling
 */

import { apiClient, ApiError, NetworkError, UnauthorizedError } from "../api/client";
import type { LoginRequest, LoginResponse } from "../types";
import { PARTNER_ROLES } from "../constants";

export interface LoginResult {
  success: boolean;
  data?: LoginResponse;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Login với email/password
 * Chỉ cho phép Partner_Owner và Partner_Cashier
 */
export async function login(credentials: LoginRequest): Promise<LoginResult> {
  try {
    /*
     * Backend auth controller wrap response trong ApiSuccess<T>:
     *   { success: true, data: { user, accessToken, refreshToken } }
     * Do đó phải đọc response.data.data (KHÔNG phải response.data).
     *
     * Lưu ý: KHÔNG dùng global axios interceptor unwrap vì sẽ phá
     * Redemption API (redemption.service đang dùng flat shape).
     */
    const response = await apiClient.post<{
      success: true;
      data: LoginResponse;
    }>("/auth/login", credentials);

    const payload = response.data?.data;

    if (!payload || !payload.user || !payload.accessToken) {
      return {
        success: false,
        error: {
          code: "INVALID_RESPONSE",
          message: "Phản hồi từ máy chủ không hợp lệ.",
        },
      };
    }

    // Validate role - chỉ cho phép partner staff
    if (
      payload.user.role !== PARTNER_ROLES.OWNER &&
      payload.user.role !== PARTNER_ROLES.CASHIER
    ) {
      return {
        success: false,
        error: {
          code: "INVALID_ROLE",
          message: "Ứng dụng này chỉ dành cho nhân viên đối tác.",
        },
      };
    }

    return { success: true, data: payload };
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Tài khoản bị khóa hoặc không có quyền truy cập.",
        },
      };
    }

    if (error instanceof NetworkError) {
      return {
        success: false,
        error: {
          code: "NETWORK_ERROR",
          message: "Không thể kết nối server. Vui lòng kiểm tra mạng.",
        },
      };
    }

    if (error instanceof ApiError) {
      return {
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      };
    }

    return {
      success: false,
      error: {
        code: "UNKNOWN_ERROR",
        message: "Đăng nhập thất bại. Vui lòng thử lại.",
      },
    };
  }
}

/**
 * Logout - xóa token
 */
export async function logout(): Promise<void> {
  try {
    await apiClient.post("/auth/logout");
  } catch {
    // Ignore logout errors - always clear local storage
  }
}

// ── Forgot Password (reuses backend /api/auth/email-otp/* + /reset-password-otp) ──

/**
 * POST /api/auth/email-otp/send
 * Body: { email, purpose: "RESET_PASSWORD" }
 *
 * 200 → { success: true, message, expiresIn, sent }
 * 429 → RATE_LIMIT (đã gửi OTP < 60s trước — phải đợi cooldown)
 *
 * Public endpoint (chưa đăng nhập). Backend luôn trả 200 với
 * generic message để tránh user enumeration.
 */
export async function requestPasswordReset(
  email: string,
): Promise<{ success: boolean; message?: string; error?: { code: string; message: string } }> {
  try {
    const response = await apiClient.post<{
      success: true;
      message?: string;
      expiresIn?: number;
    }>("/auth/email-otp/send", { email, purpose: "RESET_PASSWORD" });

    return { success: true, message: response.data?.message };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        success: false,
        error: { code: error.code, message: error.message },
      };
    }
    return {
      success: false,
      error: {
        code: "UNKNOWN_ERROR",
        message: "Không thể gửi yêu cầu. Vui lòng thử lại sau.",
      },
    };
  }
}

/**
 * POST /api/auth/email-otp/resend
 * Body: { email, purpose: "RESET_PASSWORD" }
 *
 * Gửi lại OTP — backend có rate-limit 60s cooldown.
 */
export async function resendPasswordReset(
  email: string,
): Promise<{ success: boolean; message?: string; error?: { code: string; message: string } }> {
  try {
    const response = await apiClient.post<{
      success: true;
      message?: string;
      expiresIn?: number;
    }>("/auth/email-otp/resend", { email, purpose: "RESET_PASSWORD" });

    return { success: true, message: response.data?.message };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        success: false,
        error: { code: error.code, message: error.message },
      };
    }
    return {
      success: false,
      error: {
        code: "UNKNOWN_ERROR",
        message: "Không thể gửi lại mã. Vui lòng thử lại sau.",
      },
    };
  }
}

/**
 * POST /api/auth/reset-password-otp
 * Body: { email, otp, newPassword }
 *
 * Verify OTP lần cuối + hash password + revoke tất cả UserSession.
 * KHÔNG pre-verify OTP — backend tự verify + consume OTP trong bước này.
 *
 * 200 → { success: true, message }
 * 400 → OTP_INVALID | VALIDATION_ERROR
 */
export async function resetPasswordWithOtp(
  email: string,
  otp: string,
  newPassword: string,
): Promise<{ success: boolean; message?: string; error?: { code: string; message: string } }> {
  try {
    const response = await apiClient.post<{
      success: true;
      message?: string;
    }>("/auth/reset-password-otp", { email, otp, newPassword });

    return { success: true, message: response.data?.message };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        success: false,
        error: { code: error.code, message: error.message },
      };
    }
    return {
      success: false,
      error: {
        code: "UNKNOWN_ERROR",
        message: "Không thể đặt lại mật khẩu. Vui lòng thử lại sau.",
      },
    };
  }
}
