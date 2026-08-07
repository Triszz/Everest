import { z } from "zod";

const otpPurposeSchema = z.enum(["REGISTER_VERIFY", "RESET_PASSWORD", "TWO_FA_LOGIN"]);

export const sendOtpSchema = z.object({
  email: z.email("Email không hợp lệ"),
  purpose: otpPurposeSchema.default("REGISTER_VERIFY"),
});

export const verifyOtpSchema = z.object({
  email: z.email("Email không hợp lệ"),
  code: z
    .string()
    .regex(/^\d{6}$/, "Mã OTP phải gồm đúng 6 chữ số"),
  purpose: otpPurposeSchema.default("REGISTER_VERIFY"),
});

export const resendOtpSchema = z.object({
  email: z.email("Email không hợp lệ"),
  purpose: otpPurposeSchema.default("REGISTER_VERIFY"),
});

export type SendOtpInput = z.infer<typeof sendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type ResendOtpInput = z.infer<typeof resendOtpSchema>;
export type OtpPurposeType = z.infer<typeof otpPurposeSchema>;
