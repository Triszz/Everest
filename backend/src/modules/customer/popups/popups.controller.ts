/**
 * Popup Controller
 * --------------------------------------------------------------
 * Controller gọi popupsService và trả response theo format chuẩn:
 *   { success: true, data: ... }
 */
import { Request, Response } from "express";
import { popupsService } from "./popups.service";
import { asyncHandler } from "../../../middlewares/asyncHandler";

export const popupsController = {
  /**
   * GET /api/popups/active
   * Trả về 1 popup visible ngẫu nhiên.
   * Dùng để hiển thị quảng cáo khi khách vào trang chủ.
   */
  getActivePopup: asyncHandler(async (_req: Request, res: Response) => {
    const popup = await popupsService.getRandomPopup();
    res.json({ success: true, data: popup });
  }),

  /**
   * GET /api/popups
   * Trả về tất cả popup visible (dùng cho admin preview hoặc debug).
   */
  listActivePopups: asyncHandler(async (_req: Request, res: Response) => {
    const popups = await popupsService.listActivePopups();
    res.json({ success: true, data: popups });
  }),
};