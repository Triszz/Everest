import { z } from "zod";

const branchIdParam = z.object({
  branchId: z.string().regex(/^\d+$/, "branchId phải là số").transform(Number),
});

export const updatePartnerSchema = z.object({
  representativeName: z.string().min(2).max(100).optional().nullable(),
  representativePosition: z.string().min(2).max(100).optional().nullable(),
  representativePhone: z
    .string()
    .regex(/^[0-9]{10,11}$/)
    .optional()
    .nullable(),
  representativeEmail: z.string().email().optional().nullable(),
  businessLicenseUrl: z.string().url().optional().nullable(),
});

export const createBranchSchema = z.object({
  branchName: z.string().min(2, "Tên chi nhánh không được để trống").max(150),
  address: z.string().min(5, "Địa chỉ không được để trống").max(255),
  phoneNumber: z
    .string()
    .regex(/^[0-9]{10,11}$/, "Số điện thoại không hợp lệ"),
  city: z.string().min(2).max(100).optional(),
});

export const updateBranchSchema = z.object({
  branchName: z.string().min(2).max(150).optional(),
  address: z.string().min(5).max(255).optional(),
  phoneNumber: z
    .string()
    .regex(/^[0-9]{10,11}$/, "Số điện thoại không hợp lệ")
    .optional(),
  city: z.string().min(2).max(100).optional(),
});

export const assignCashierSchema = z.object({
  cashierEmail: z.email("Email không hợp lệ"),
});

/** Schema cho query search cashier (?q=&limit=) */
export const listCashiersQuerySchema = z.object({
  q: z.string().trim().optional(),
  limit: z.coerce.number().int().positive().max(50).optional().default(20),
});

export const createCashierSchema = z.object({
  email: z.email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu ít nhất 6 ký tự"),
  branchId: z.number().int().positive().optional(),
});

export { branchIdParam };

/**
 * Schema đổi mật khẩu cho Cashier (Partner_Owner thực hiện).
 * Chỉ cho phép đổi password — không cho đổi email/branch/role.
 */
export const resetCashierPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(6, "Mật khẩu mới ít nhất 6 ký tự")
    .max(128),
});
