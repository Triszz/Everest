import { z } from "zod";
import { UserRole, AccountStatus, PartnerStatus } from "../../generated/prisma/enums";

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

export type ListUsersInput = z.infer<typeof listUsersSchema>;
export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type GetUserByIdInput = z.infer<typeof getUserByIdSchema>;
export type ListPartnersInput = z.infer<typeof listPartnersSchema>;
export type ApprovePartnerInput = z.infer<typeof approvePartnerSchema>;
export type RejectPartnerInput = z.infer<typeof rejectPartnerSchema>;
export type GetPartnerByIdInput = z.infer<typeof getPartnerByIdSchema>;
export type TogglePartnerLockInput = z.infer<typeof togglePartnerLockSchema>;
