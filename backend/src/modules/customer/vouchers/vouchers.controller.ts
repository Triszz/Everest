/**
 * Voucher Controller
 * --------------------------------------------------------------
 * Parse query/params qua shared helpers, gọi vouchersService.
 * Mount trong app.ts ở `/api/vouchers`.
 */
import { Request, Response } from "express";
import { vouchersService } from "./vouchers.service";
import { asyncHandler } from "../../../middlewares/asyncHandler";
import { parseOrThrow } from "../shared/helpers";
import {
  voucherQuerySchema,
  voucherOptionalIdParam,
  reviewQuerySchema,
} from "./vouchers.schemas";

export const vouchersController = {
  /**
   * GET /api/vouchers
   * List + filter + sort + paginate voucher.
   */
  listVouchers: asyncHandler(async (req: Request, res: Response) => {
    const query = parseOrThrow(voucherQuerySchema, req.query);
    const result = await vouchersService.listVouchers(query);
    res.json({ success: true, ...result });
  }),

  /**
   * GET /api/vouchers/featured
   * Top 8 voucher nổi bật cho trang chủ.
   */
  getFeatured: asyncHandler(async (_req: Request, res: Response) => {
    const vouchers = await vouchersService.getFeaturedVouchers();
    res.json({ success: true, data: vouchers });
  }),

  /**
   * GET /api/vouchers/:id (hoặc :voucherId)
   * Chi tiết 1 voucher.
   */
  getVoucherById: asyncHandler(async (req: Request, res: Response) => {
    const voucherId = parseOrThrow(voucherOptionalIdParam, req.params);
    const voucher = await vouchersService.getVoucherById(voucherId);
    res.json({ success: true, data: voucher });
  }),

  /**
   * GET /api/vouchers/:voucherId/reviews
   * Danh sách review của voucher.
   */
  getVoucherReviews: asyncHandler(async (req: Request, res: Response) => {
    const voucherId = parseOrThrow(voucherOptionalIdParam, req.params);
    const { page, limit } = parseOrThrow(reviewQuerySchema, req.query);
    const result = await vouchersService.getVoucherReviews(voucherId, page, limit);
    res.json({ success: true, ...result });
  }),

  /**
   * GET /api/customer/search/partners
   * Danh sách đối tác cho dropdown filter (BR-CUS-03).
   * Chuyển từ search module cũ.
   */
  listPartners: asyncHandler(async (_req: Request, res: Response) => {
    const data = await vouchersService.listPartnersForFilter();
    res.json({ success: true, data });
  }),
};