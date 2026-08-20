/**
 * Review Controller
 * --------------------------------------------------------------
 * - GET public (xem review)
 * - POST authenticated (tạo/cập nhật review)
 *
 * Route mount ở 2 nơi:
 *  - vouchers.routes.ts   → GET  /api/vouchers/:voucherId/reviews
 *  - vouchers.routes.ts   → POST /api/vouchers/:voucherId/reviews (cần auth)
 *  - reviews.routes.ts    → /api/customer/vouchers/:voucherId/reviews (legacy alias)
 */
import { Request, Response } from "express";
import { reviewsService } from "./reviews.service";
import { asyncHandler } from "../../../middlewares/asyncHandler";
import { getCustomerId, parseOrThrow, parseParams } from "../shared/helpers";
import {
  createReviewSchema,
  voucherIdParam,
  listReviewsQuery,
} from "./reviews.schemas";

export const reviewsController = {
  /**
   * POST /api/vouchers/:voucherId/reviews
   * Tạo hoặc cập nhật review (1 customer chỉ có 1 review / voucher).
   */
  createReview: asyncHandler(async (req: Request, res: Response) => {
    const customerId = getCustomerId(req);
    const { voucherId } = parseParams(req, voucherIdParam);
    const input = parseOrThrow(createReviewSchema, req.body);
    const result = await reviewsService.createReview(customerId, voucherId, input);
    res.status(201).json({ success: true, data: result });
  }),

  /**
   * GET /api/vouchers/:voucherId/reviews
   * Danh sách review của voucher (public).
   */
  listReviews: asyncHandler(async (req: Request, res: Response) => {
    const { voucherId } = parseParams(req, voucherIdParam);
    const { page, pageSize } = parseOrThrow(listReviewsQuery, req.query);
    const result = await reviewsService.listReviews(voucherId, page, pageSize);
    res.json({ success: true, ...result });
  }),
};