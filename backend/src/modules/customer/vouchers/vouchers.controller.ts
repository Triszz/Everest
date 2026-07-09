import { Request, Response } from "express";
import { ZodError } from "zod";
import { vouchersService } from "./vouchers.service";
import { asyncHandler } from "../../../middlewares/asyncHandler";
import { AppError } from "../../../middlewares/errorHandler";
import {
  voucherQuerySchema,
  voucherIdParam,
  reviewQuerySchema,
} from "./vouchers.schemas";

const parseQueryOrThrow = <T>(schema: { parse: (v: unknown) => T }, value: unknown): T => {
  try {
    return schema.parse(value);
  } catch (err) {
    if (err instanceof ZodError) {
      const issue = err.issues[0];
      throw new AppError(issue.message, 400, "VALIDATION_ERROR");
    }
    throw err;
  }
};

const parseIdParamOrThrow = (req: Request): number => {
  try {
    return voucherIdParam.parse(req.params).id;
  } catch {
    throw new AppError("ID voucher không hợp lệ", 400, "VALIDATION_ERROR");
  }
};

export const vouchersController = {
  listVouchers: asyncHandler(async (req: Request, res: Response) => {
    const query = parseQueryOrThrow(voucherQuerySchema, req.query);
    const result = await vouchersService.listVouchers(query);
    res.json({ success: true, ...result });
  }),

  getFeatured: asyncHandler(async (_req: Request, res: Response) => {
    const vouchers = await vouchersService.getFeaturedVouchers();
    res.json({ success: true, data: vouchers });
  }),

  getVoucherById: asyncHandler(async (req: Request, res: Response) => {
    const id = parseIdParamOrThrow(req);
    const voucher = await vouchersService.getVoucherById(id);
    res.json({ success: true, data: voucher });
  }),

  getVoucherReviews: asyncHandler(async (req: Request, res: Response) => {
    const id = parseIdParamOrThrow(req);
    const { page, limit } = parseQueryOrThrow(reviewQuerySchema, req.query);
    const result = await vouchersService.getVoucherReviews(id, page, limit);
    res.json({ success: true, ...result });
  }),
};
