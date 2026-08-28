/**
 * Notification Controller
 * --------------------------------------------------------------
 * Xử lý các API liên quan đến Notification Preferences và Notifications.
 * Tất cả routes yêu cầu đăng nhập.
 */
import { Request, Response } from "express";
import { notificationsService } from "./notifications.service";
import { asyncHandler } from "../../../middlewares/asyncHandler";
import { getCustomerId, parseOrThrow } from "../shared/helpers";
import {
  updateNotificationsSchema,
  notificationListSchema,
} from "./notifications.schemas";
import { AppError } from "../../../middlewares/errorHandler";

export const notificationsController = {
  // ============= PREFERENCES =============

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

  // ============= NOTIFICATIONS =============

  /**
   * GET /api/customer/notifications — Danh sách notifications (phân trang).
   */
  list: asyncHandler(async (req: Request, res: Response) => {
    const input = parseOrThrow(notificationListSchema, req.query);
    const result = await notificationsService.getNotifications(
      getCustomerId(req),
      input.page,
      input.pageSize,
    );
    res.json({ success: true, ...result });
  }),

  /**
   * GET /api/customer/notifications/unread-count — Số notification chưa đọc.
   */
  unreadCount: asyncHandler(async (req: Request, res: Response) => {
    const count = await notificationsService.getUnreadCount(getCustomerId(req));
    res.json({ success: true, count, data: { count } });
  }),

  /**
   * GET /api/customer/notifications/:id — Lấy 1 notification theo ID.
   */
  getById: asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      throw new AppError("ID không hợp lệ", 400, "INVALID_ID");
    }
    const notification = await notificationsService.getNotificationById(getCustomerId(req), id);
    if (!notification) {
      throw new AppError("Không tìm thấy thông báo", 404, "NOTIFICATION_NOT_FOUND");
    }
    res.json({ success: true, data: notification });
  }),

  /**
   * PATCH /api/customer/notifications/:id/read — Đánh dấu đã đọc.
   */
  markAsRead: asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      throw new AppError("ID không hợp lệ", 400, "INVALID_ID");
    }
    const result = await notificationsService.markAsRead(getCustomerId(req), id);
    if (!result) {
      throw new AppError("Không tìm thấy thông báo", 404, "NOTIFICATION_NOT_FOUND");
    }
    res.json({ success: true, message: "Đã đánh dấu đã đọc" });
  }),

  /**
   * PATCH /api/customer/notifications/read-all — Đánh dấu tất cả đã đọc.
   */
  markAllAsRead: asyncHandler(async (req: Request, res: Response) => {
    await notificationsService.markAllAsRead(getCustomerId(req));
    res.json({ success: true, message: "Đã đánh dấu tất cả đã đọc" });
  }),

  /**
   * DELETE /api/customer/notifications/:id — Xóa 1 notification.
   */
  delete: asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      throw new AppError("ID không hợp lệ", 400, "INVALID_ID");
    }
    const result = await notificationsService.deleteNotification(getCustomerId(req), id);
    if (!result) {
      throw new AppError("Không tìm thấy thông báo", 404, "NOTIFICATION_NOT_FOUND");
    }
    res.json({ success: true, message: "Đã xóa thông báo" });
  }),
};