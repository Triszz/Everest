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

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
