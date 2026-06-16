import { Request, Response } from "express";
import { ZodError } from "zod";
import { partnerService } from "./partner.service";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { AppError } from "../../middlewares/errorHandler";
import {
  updatePartnerSchema,
  createBranchSchema,
  updateBranchSchema,
  assignCashierSchema,
  createCashierSchema,
  branchIdParam,
} from "./partner.schemas";

const requirePartnerId = (req: Request): number => {
  if (!req.user?.partnerId)
    throw new AppError("Không tìm thấy thông tin đối tác", 403, "FORBIDDEN");
  return req.user.partnerId;
};

const parseBranchId = (req: Request): number => {
  try {
    return branchIdParam.parse(req.params).branchId;
  } catch {
    throw new AppError("branchId không hợp lệ", 400, "VALIDATION_ERROR");
  }
};

const parseOrThrow = <T>(
  schema: { parse: (v: unknown) => T },
  value: unknown,
): T => {
  try {
    return schema.parse(value);
  } catch (err) {
    if (err instanceof ZodError)
      throw new AppError(err.issues[0].message, 400, "VALIDATION_ERROR");
    throw err;
  }
};

export const partnerController = {
  // Profile
  getProfile: asyncHandler(async (req: Request, res: Response) => {
    const data = await partnerService.getProfile(requirePartnerId(req));
    res.json({ success: true, data });
  }),

  updateProfile: asyncHandler(async (req: Request, res: Response) => {
    const body = parseOrThrow(updatePartnerSchema, req.body);
    const data = await partnerService.updateProfile(
      requirePartnerId(req),
      body,
    );
    res.json({ success: true, data });
  }),

  // Branches
  listBranches: asyncHandler(async (req: Request, res: Response) => {
    const data = await partnerService.listBranches(requirePartnerId(req));
    res.json({ success: true, data });
  }),

  getBranch: asyncHandler(async (req: Request, res: Response) => {
    const data = await partnerService.getBranch(
      parseBranchId(req),
      requirePartnerId(req),
    );
    res.json({ success: true, data });
  }),

  createBranch: asyncHandler(async (req: Request, res: Response) => {
    const body = parseOrThrow(createBranchSchema, req.body);
    const data = await partnerService.createBranch(requirePartnerId(req), body);
    res.status(201).json({ success: true, data });
  }),

  updateBranch: asyncHandler(async (req: Request, res: Response) => {
    const body = parseOrThrow(updateBranchSchema, req.body);
    const data = await partnerService.updateBranch(
      parseBranchId(req),
      requirePartnerId(req),
      body,
    );
    res.json({ success: true, data });
  }),

  deleteBranch: asyncHandler(async (req: Request, res: Response) => {
    await partnerService.deleteBranch(
      parseBranchId(req),
      requirePartnerId(req),
    );
    res.json({
      success: true,
      data: null,
      message: "Xóa chi nhánh thành công",
    });
  }),

  assignCashier: asyncHandler(async (req: Request, res: Response) => {
    const { cashierEmail } = parseOrThrow(assignCashierSchema, req.body);
    const data = await partnerService.assignCashier(
      parseBranchId(req),
      requirePartnerId(req),
      cashierEmail,
    );
    res.json({ success: true, data });
  }),

  removeCashier: asyncHandler(async (req: Request, res: Response) => {
    const data = await partnerService.removeCashier(
      parseBranchId(req),
      requirePartnerId(req),
    );
    res.json({ success: true, data, message: "Đã gỡ thu ngân" });
  }),

  createCashier: asyncHandler(async (req: Request, res: Response) => {
    const body = parseOrThrow(createCashierSchema, req.body);
    const data = await partnerService.createCashierAccount(
      requirePartnerId(req),
      body,
    );
    res.status(201).json({ success: true, data });
  }),
};
