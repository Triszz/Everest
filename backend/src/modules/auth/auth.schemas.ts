import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu ít nhất 6 ký tự"),
});

export const registerCustomerSchema = z.object({
  email: z.email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu ít nhất 6 ký tự"),
  fullName: z.string().min(2, "Họ tên ít nhất 2 ký tự").max(100),
  phoneNumber: z
    .string()
    .regex(/^[0-9]{10,11}$/, "Số điện thoại không hợp lệ")
    .optional(),
});

export const registerPartnerSchema = z.object({
  email: z.email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu ít nhất 6 ký tự"),
  fullName: z.string().min(2).max(100),
  phoneNumber: z
    .string()
    .regex(/^[0-9]{10,11}$/)
    .optional(),
  companyName: z
    .string()
    .min(2, "Tên doanh nghiệp không được để trống")
    .max(150),
  taxCode: z.string().min(10, "Mã số thuế không hợp lệ").max(20),
  businessLicenseUrl: z.string().url().optional(),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token không được để trống"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6, "Mật khẩu mới ít nhất 6 ký tự"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterCustomerInput = z.infer<typeof registerCustomerSchema>;
export type RegisterPartnerInput = z.infer<typeof registerPartnerSchema>;
