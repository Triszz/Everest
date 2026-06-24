import { z } from "zod";
const roleValues = ["Admin", "Customer", "Partner_Owner", "Partner_Cashier"] as const;
const accountStatusValues = ["Active", "Inactive", "Banned"] as const;

export const listUsersSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  search: z.string().optional(),
  role: z.enum(roleValues).optional(),
  status: z.enum(accountStatusValues).optional(),
});

export const updateUserStatusSchema = z.object({
  status: z.enum(accountStatusValues),
});

export const updateUserRoleSchema = z.object({
  role: z.enum(roleValues),
});

export const getUserByIdSchema = z.object({
  userId: z.uuid("ID người dùng không hợp lệ"),
});

export type ListUsersInput = z.infer<typeof listUsersSchema>;
export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type GetUserByIdInput = z.infer<typeof getUserByIdSchema>;
