import { Request, Response } from "express";
import { ZodError } from "zod";
import { adminUsersService } from "./admin-users.service";
import { asyncHandler } from "../../../middlewares/asyncHandler";
import { AppError } from "../../../middlewares/errorHandler";
import {
  listUsersSchema,
  updateUserStatusSchema,
  updateUserRoleSchema,
  getUserByIdSchema,
} from "./admin-users.schemas";

const parseQuery = <T>(schema: { parse: (v: unknown) => T }, value: unknown): T => {
  try {
    return schema.parse(value);
  } catch (err) {
    if (err instanceof ZodError) {
      throw new AppError(err.issues[0].message, 400, "VALIDATION_ERROR");
    }
    throw err;
  }
};

const parseBody = <T>(schema: { parse: (v: unknown) => T }, body: unknown): T => {
  try {
    return schema.parse(body);
  } catch (err) {
    if (err instanceof ZodError) {
      throw new AppError(err.issues[0].message, 400, "VALIDATION_ERROR");
    }
    throw err;
  }
};

export const adminUsersController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const input = parseQuery(listUsersSchema, req.query);
    const data = await adminUsersService.list(input);
    res.json({ success: true, data });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const { userId } = parseQuery(getUserByIdSchema, req.params);
    const data = await adminUsersService.getById(userId);
    res.json({ success: true, data });
  }),

  updateStatus: asyncHandler(async (req: Request, res: Response) => {
    const { userId } = parseQuery(getUserByIdSchema, req.params);
    const input = parseBody(updateUserStatusSchema, req.body);
    const data = await adminUsersService.updateStatus(userId, input);
    res.json({ success: true, data, message: "Cập nhật trạng thái thành công" });
  }),

  updateRole: asyncHandler(async (req: Request, res: Response) => {
    const { userId } = parseQuery(getUserByIdSchema, req.params);
    const input = parseBody(updateUserRoleSchema, req.body);
    const data = await adminUsersService.updateRole(userId, input, req.user!.role);
    res.json({ success: true, data, message: "Phân quyền thành công" });
  }),
};
