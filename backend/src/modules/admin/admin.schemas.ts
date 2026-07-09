import { z } from "zod";
import {
  UserRole,
  AccountStatus,
  PartnerStatus,
  VoucherApprovalStatus,
} from "../../generated/prisma/enums";

export const listUsersSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  search: z.string().optional(),
  role: z.nativeEnum(UserRole).optional(),
  status: z.nativeEnum(AccountStatus).optional(),
});

export const updateUserStatusSchema = z.object({
  status: z.nativeEnum(AccountStatus),
});

export const updateUserRoleSchema = z.object({
  role: z.nativeEnum(UserRole),
});

export const getUserByIdSchema = z.object({
  userId: z.string().uuid("ID người dùng không hợp lệ"),
});

// ─── Partner Approval ─────────────────────────────────────────────────────────

export const listPartnersSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  search: z.string().optional(),
  status: z.nativeEnum(PartnerStatus).optional(),
});

export const getPartnerByIdSchema = z.object({
  partnerId: z.string().regex(/^\d+$/, "partnerId phải là số nguyên").transform(Number),
});

export const approvePartnerSchema = z.object({
  note: z.string().max(500).optional(),
});

export const rejectPartnerSchema = z.object({
  reason: z
    .string()
    .min(10, "Lý do từ chối phải có ít nhất 10 ký tự")
    .max(500),
});

// ─── Partner Lock / Unlock ─────────────────────────────────────────────────────

export const togglePartnerLockSchema = z.object({
  locked: z.boolean(),
  reason: z.string().max(500).optional(),
});

// ─── Branch Management ─────────────────────────────────────────────────────────

export const listBranchesSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  search: z.string().optional(),
  isLocked: z
    .string()
    .transform((v) => (v === "true" ? true : v === "false" ? false : undefined))
    .optional(),
});

export const getBranchByIdSchema = z.object({
  partnerId: z.string().regex(/^\d+$/, "partnerId phải là số nguyên").transform(Number),
  branchId: z.string().regex(/^\d+$/, "branchId phải là số nguyên").transform(Number),
});

export const createBranchSchema = z.object({
  branchName: z
    .string()
    .min(2, "Tên chi nhánh không được để trống")
    .max(150),
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

export const deleteBranchSchema = z.object({
  reason: z.string().min(5).max(500).optional(),
});

export const toggleBranchLockSchema = z.object({
  locked: z.boolean(),
});

// ─── Category Management ────────────────────────────────────────────────────────

export const listCategoriesSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  search: z.string().optional(),
});

export const createCategorySchema = z.object({
  categoryName: z.string().min(2, "Tên danh mục không được để trống").max(100),
  description: z.string().max(500).optional(),
});

export const updateCategorySchema = z.object({
  categoryName: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
});

export const getCategoryByIdSchema = z.object({
  categoryId: z.string().regex(/^\d+$/, "categoryId phải là số nguyên").transform(Number),
});

// ─── Voucher Management ────────────────────────────────────────────────────────

export const listVouchersSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  search: z.string().optional(),
  categoryId: z
    .string()
    .regex(/^\d+$/, "categoryId phải là số nguyên")
    .transform(Number)
    .optional(),
  partnerId: z
    .string()
    .regex(/^\d+$/, "partnerId phải là số nguyên")
    .transform(Number)
    .optional(),
  approvalStatus: z.string().optional(),
});

export const getVoucherByIdSchema = z.object({
  voucherId: z.string().regex(/^\d+$/, "voucherId phải là số nguyên").transform(Number),
});

export const approveVoucherSchema = z.object({
  note: z.string().max(500).optional(),
});

export const rejectVoucherSchema = z.object({
  reason: z
    .string()
    .min(10, "Lý do từ chối phải có ít nhất 10 ký tự")
    .max(500),
});

export type ListUsersInput = z.infer<typeof listUsersSchema>;
export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type GetUserByIdInput = z.infer<typeof getUserByIdSchema>;
export type ListPartnersInput = z.infer<typeof listPartnersSchema>;
export type ApprovePartnerInput = z.infer<typeof approvePartnerSchema>;
export type RejectPartnerInput = z.infer<typeof rejectPartnerSchema>;
export type GetPartnerByIdInput = z.infer<typeof getPartnerByIdSchema>;
export type TogglePartnerLockInput = z.infer<typeof togglePartnerLockSchema>;
export type ListBranchesInput = z.infer<typeof listBranchesSchema>;
export type CreateBranchInput = z.infer<typeof createBranchSchema>;
export type UpdateBranchInput = z.infer<typeof updateBranchSchema>;
export type DeleteBranchInput = z.infer<typeof deleteBranchSchema>;
export type ToggleBranchLockInput = z.infer<typeof toggleBranchLockSchema>;
export type GetBranchByIdInput = z.infer<typeof getBranchByIdSchema>;
export type ListCategoriesInput = z.infer<typeof listCategoriesSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type GetCategoryByIdInput = z.infer<typeof getCategoryByIdSchema>;
export type ListVouchersInput = z.infer<typeof listVouchersSchema>;
export type GetVoucherByIdInput = z.infer<typeof getVoucherByIdSchema>;
export type ApproveVoucherInput = z.infer<typeof approveVoucherSchema>;
export type RejectVoucherInput = z.infer<typeof rejectVoucherSchema>;
