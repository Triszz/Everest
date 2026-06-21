import { z } from "zod";
import { Role, AccountStatus } from "../../shared/types";

export const listUsersSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  search: z.string().optional(),
  role: z.nativeEnum(Role).optional(),
  status: z.nativeEnum(AccountStatus).optional(),
});

export const updateUserStatusSchema = z.object({
  status: z.nativeEnum(AccountStatus),
});

export const updateUserRoleSchema = z.object({
  role: z.nativeEnum(Role),
});

export const getUserByIdSchema = z.object({
  userId: z.string().uuid("ID người dùng không hợp lệ"),
});

export type ListUsersInput = z.infer<typeof listUsersSchema>;
export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type GetUserByIdInput = z.infer<typeof getUserByIdSchema>;
