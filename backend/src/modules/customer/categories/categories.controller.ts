/**
 * Category Controller
 * --------------------------------------------------------------
 * Parse query/params qua shared helpers, gọi categoriesService.
 */
import { Request, Response } from "express";
import { categoriesService } from "./categories.service";
import { asyncHandler } from "../../../middlewares/asyncHandler";
import { parseOrThrow, parseParams } from "../shared/helpers";
import {
  categoryIdParam,
  categoryVoucherQuerySchema,
} from "./categories.schemas";

export const categoriesController = {
  /**
   * GET /api/categories
   * Danh sách tất cả category kèm voucherCount.
   */
  listCategories: asyncHandler(async (_req: Request, res: Response) => {
    const categories = await categoriesService.listCategories();
    res.json({ success: true, data: categories });
  }),

  /**
   * GET /api/categories/:id
   * Chi tiết 1 category.
   */
  getCategoryById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = parseParams(req, categoryIdParam);
    const category = await categoriesService.getCategoryById(id);
    res.json({ success: true, data: category });
  }),

  /**
   * GET /api/categories/:id/vouchers?page=1&limit=20&sort=newest
   * Danh sách voucher thuộc 1 category.
   */
  getCategoryVouchers: asyncHandler(async (req: Request, res: Response) => {
    const { id } = parseParams(req, categoryIdParam);
    const query = parseOrThrow(categoryVoucherQuerySchema, req.query);
    const result = await categoriesService.getCategoryVouchers(id, query);
    res.json({ success: true, ...result });
  }),
};