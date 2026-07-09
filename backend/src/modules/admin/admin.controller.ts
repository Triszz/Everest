import { Request, Response } from "express";
import { ZodError } from "zod";
import { adminService } from "./admin.service";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { AppError } from "../../middlewares/errorHandler";
import {
  listUsersSchema,
  updateUserStatusSchema,
  updateUserRoleSchema,
  getUserByIdSchema,
  listPartnersSchema,
  getPartnerByIdSchema,
  approvePartnerSchema,
  rejectPartnerSchema,
  togglePartnerLockSchema,
} from "./admin.schemas";

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

export const adminController = {
  listUsers: asyncHandler(async (req: Request, res: Response) => {
    const input = parseQuery(listUsersSchema, req.query);
    const data = await adminService.listUsers(input);
    res.json({ success: true, data });
  }),

  getUserById: asyncHandler(async (req: Request, res: Response) => {
    const { userId } = parseQuery(getUserByIdSchema, req.params);
    const data = await adminService.getUserById(userId);
    res.json({ success: true, data });
  }),

  updateUserStatus: asyncHandler(async (req: Request, res: Response) => {
    const { userId } = parseQuery(getUserByIdSchema, req.params);
    const input = parseBody(updateUserStatusSchema, req.body);
    const data = await adminService.updateUserStatus(userId, input);
    res.json({ success: true, data, message: "Cập nhật trạng thái thành công" });
  }),

  updateUserRole: asyncHandler(async (req: Request, res: Response) => {
    const { userId } = parseQuery(getUserByIdSchema, req.params);
    const input = parseBody(updateUserRoleSchema, req.body);
    const data = await adminService.updateUserRole(userId, input, req.user!.role);
    res.json({ success: true, data, message: "Phân quyền thành công" });
  }),

  // ─── Partner Approval ───────────────────────────────────────────────────────

  listPartners: asyncHandler(async (req: Request, res: Response) => {
    const input = parseQuery(listPartnersSchema, req.query);
    const data = await adminService.listPartners(input);
    res.json({ success: true, data });
  }),

  getPartnerById: asyncHandler(async (req: Request, res: Response) => {
    const { partnerId } = parseQuery(getPartnerByIdSchema, req.params);
    const data = await adminService.getPartnerById(partnerId);
    res.json({ success: true, data });
  }),

  approvePartner: asyncHandler(async (req: Request, res: Response) => {
    const { partnerId } = parseQuery(getPartnerByIdSchema, req.params);
    const input = parseBody(approvePartnerSchema, req.body);
    const data = await adminService.approvePartner(partnerId, input, req.user!.userId);
    res.json({ success: true, data, message: "Duyệt đối tác thành công" });
  }),

  rejectPartner: asyncHandler(async (req: Request, res: Response) => {
    const { partnerId } = parseQuery(getPartnerByIdSchema, req.params);
    const input = parseBody(rejectPartnerSchema, req.body);
    const data = await adminService.rejectPartner(partnerId, input, req.user!.userId);
    res.json({ success: true, data, message: "Từ chối đối tác thành công" });
  }),

  togglePartnerLock: asyncHandler(async (req: Request, res: Response) => {
    const { partnerId } = parseQuery(getPartnerByIdSchema, req.params);
    const input = parseBody(togglePartnerLockSchema, req.body);
    const data = await adminService.togglePartnerLock(partnerId, input);
    const msg = input.locked ? "Khóa đối tác thành công" : "Mở khóa đối tác thành công";
    res.json({ success: true, data, message: msg });
  }),
};
