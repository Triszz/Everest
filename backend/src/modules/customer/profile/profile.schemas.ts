/**
 * Profile Schemas
 * --------------------------------------------------------------
 * Zod schemas cho Profile API.
 */
import { z } from "zod";

/** Body cho PUT /api/customer/profile/me — cập nhật hồ sơ. */
export const updateProfileSchema = z.object({
  fullName: z.string().min(2, "Họ tên ít nhất 2 ký tự").max(100).optional(),
  phoneNumber: z
    .string()
    .regex(/^[0-9]{10,11}$/, "Số điện thoại không hợp lệ")
    .optional()
    .nullable(),
});

/** Body cho PUT /api/customer/profile/password — đổi mật khẩu. */
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6, "Mật khẩu hiện tại ít nhất 6 ký tự"),
  newPassword: z.string().min(6, "Mật khẩu mới ít nhất 6 ký tự"),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;