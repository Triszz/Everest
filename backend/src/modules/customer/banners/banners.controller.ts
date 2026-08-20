/**
 * Banner Controller
 * --------------------------------------------------------------
 * Controller gọi bannersService và trả response theo format chuẩn:
 *   { success: true, data: ... }
 */
import { Request, Response } from "express";
import { bannersService } from "./banners.service";
import { asyncHandler } from "../../../middlewares/asyncHandler";

export const bannersController = {
  /**
   * GET /api/banners
   * Lấy danh sách banner đang hiển thị.
   */
  listActiveBanners: asyncHandler(async (_req: Request, res: Response) => {
    const banners = await bannersService.listActiveBanners();
    res.json({ success: true, data: banners });
  }),
};