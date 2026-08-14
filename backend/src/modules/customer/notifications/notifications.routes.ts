/**
 * Notification Routes
 * --------------------------------------------------------------
 * Mount trong app.ts ở prefix `/api/customer/notifications`.
 * Tất cả routes yêu cầu đăng nhập.
 */
import { Router } from "express";
import { notificationsController } from "./notifications.controller";
import { authenticate } from "../../../middlewares/authenticate";

const router = Router();

router.use(authenticate);

// ============= PREFERENCES =============

/** GET /api/customer/notifications/preferences — Xem preferences */
router.get("/preferences", notificationsController.getPreferences);

/** PUT /api/customer/notifications/preferences — Cập nhật preferences */
router.put("/preferences", notificationsController.updatePreferences);

// ============= NOTIFICATIONS =============

/** GET /api/customer/notifications — Danh sách notifications */
router.get("/", notificationsController.list);

/** GET /api/customer/notifications/unread-count — Số notification chưa đọc */
router.get("/unread-count", notificationsController.unreadCount);

/** PATCH /api/customer/notifications/read-all — Đánh dấu tất cả đã đọc */
router.patch("/read-all", notificationsController.markAllAsRead);

/** GET /api/customer/notifications/:id — Lấy 1 notification theo ID */
router.get("/:id", notificationsController.getById);

/** PATCH /api/customer/notifications/:id/read — Đánh dấu 1 notification đã đọc */
router.patch("/:id/read", notificationsController.markAsRead);

/** DELETE /api/customer/notifications/:id — Xóa 1 notification */
router.delete("/:id", notificationsController.delete);

export default router;