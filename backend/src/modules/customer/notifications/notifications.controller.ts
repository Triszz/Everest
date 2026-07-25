import { Request, Response, NextFunction } from "express";
import { notificationsService } from "./notifications.service";
import { AppError } from "../../../middlewares/errorHandler";

function zodError(error: unknown) {
  const zErr = error as { name: string; errors?: { message: string }[] };
  if (zErr.name === "ZodError" && zErr.errors?.[0]) {
    return { code: "VALIDATION_ERROR" as const, message: zErr.errors[0].message };
  }
  return null;
}

export const notificationsController = {
  /**
   * GET /api/customer/notifications/preferences — Lấy preferences
   */
  async getPreferences(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const prefs = await notificationsService.getPreferences(userId);
      res.json({ success: true, data: prefs });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/customer/notifications/preferences — Cập nhật preferences
   * Body: { n1?: boolean, n2?: boolean, ... }
   */
  async updatePreferences(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const input = req.body;

      const prefs = await notificationsService.updatePreferences(userId, input);

      res.json({
        success: true,
        data: prefs,
        message: "Đã lưu cài đặt thông báo",
      });
    } catch (error) {
      const zErr = zodError(error);
      if (zErr) {
        return res.status(400).json({ success: false, error: zErr });
      }
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: { code: error.code, message: error.message },
        });
      }
      next(error);
    }
  },
};
