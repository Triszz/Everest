import { z } from "zod";

const branchIdParam = z.object({
  branchId: z.string().regex(/^\d+$/, "branchId phải là số").transform(Number),
});

export const updatePartnerSchema = z.object({
  companyName: z.string().min(2).max(150).optional(),
  businessLicenseUrl: z.string().url().optional().nullable(),
});

export const createBranchSchema = z.object({
  branchName: z.string().min(2, "Tên chi nhánh không được để trống").max(150),
  address: z.string().min(5, "Địa chỉ không được để trống").max(255),
  phoneNumber: z
    .string()
    .regex(/^[0-9]{10,11}$/)
    .optional(),
});

export const updateBranchSchema = z.object({
  branchName: z.string().min(2).max(150).optional(),
  address: z.string().min(5).max(255).optional(),
  phoneNumber: z
    .string()
    .regex(/^[0-9]{10,11}$/)
    .optional()
    .nullable(),
});

export const assignCashierSchema = z.object({
  cashierEmail: z.email("Email không hợp lệ"),
});

export const createCashierSchema = z.object({
  email: z.email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu ít nhất 6 ký tự"),
  fullName: z.string().min(2).max(100),
  phoneNumber: z
    .string()
    .regex(/^[0-9]{10,11}$/)
    .optional(),
  branchId: z.number().int().positive().optional(),
});

export { branchIdParam };
