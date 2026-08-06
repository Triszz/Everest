/**
 * Notification Preferences Controller
 * --------------------------------------------------------------
 * Xem và cập nhật notification preferences.
 * Tất cả routes yêu cầu đăng nhập.
 */
import { Request, Response } from "express";
import { notificationsService } from "./notifications.service";
import { asyncHandler } from "../../../middlewares/asyncHandler";
import { getCustomerId, parseOrThrow } from "../shared/helpers";
import { updateNotificationsSchema } from "./notifications.schemas";

export const notificationsController = {
  /**
   * GET /api/customer/notifications/preferences — Lấy preferences hiện tại.
   */
  getPreferences: asyncHandler(async (req: Request, res: Response) => {
    const prefs = await notificationsService.getPreferences(getCustomerId(req));
    res.json({ success: true, data: prefs });
  }),

  /**
   * PUT /api/customer/notifications/preferences — Cập nhật preferences.
   */
  updatePreferences: asyncHandler(async (req: Request, res: Response) => {
    const input = parseOrThrow(updateNotificationsSchema, req.body);
    const prefs = await notificationsService.updatePreferences(getCustomerId(req), input);
    res.json({
      success: true,
      data: prefs,
      message: "Đã lưu cài đặt thông báo",
    });
  }),
};