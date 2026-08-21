import { z } from "zod";

export const forgotPasswordSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10, "Token không hợp lệ"),
  newPassword: z
    .string()
    .min(6, "Mật khẩu mới ít nhất 6 ký tự")
    .max(128, "Mật khẩu tối đa 128 ký tự"),
});

/**
 * Reset password bằng OTP (flow mobile / Partner).
 * Frontend gửi:
 *   1) POST /api/auth/email-otp/send { email, purpose: "RESET_PASSWORD" }
 *   2) POST /api/auth/email-otp/verify { email, code, purpose: "RESET_PASSWORD" }
 *   3) POST /api/auth/reset-password-otp { email, otp, newPassword }
 *
 * Backend sẽ verify OTP lần nữa để đảm bảo OTP chưa bị consume bởi flow khác
 * và chưa expire tại thời điểm reset.
 */
export const resetPasswordWithOtpSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  otp: z
    .string()
    .regex(/^\d{6}$/, "Mã OTP phải gồm đúng 6 chữ số"),
  newPassword: z
    .string()
    .min(6, "Mật khẩu mới ít nhất 6 ký tự")
    .max(128, "Mật khẩu tối đa 128 ký tự"),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ResetPasswordWithOtpInput = z.infer<typeof resetPasswordWithOtpSchema>;
