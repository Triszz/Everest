/**
 * Notification Preferences Routes
 * --------------------------------------------------------------
 * Mount trong app.ts ở prefix `/api/customer/notifications`.
 * Tất cả routes yêu cầu đăng nhập.
 */
import { Router } from "express";
import { notificationsController } from "./notifications.controller";
import { authenticate } from "../../../middlewares/authenticate";

const router = Router();

router.use(authenticate);

/** GET /api/customer/notifications/preferences — Xem preferences */
router.get("/preferences", notificationsController.getPreferences);

/** PUT /api/customer/notifications/preferences — Cập nhật preferences */
router.put("/preferences", notificationsController.updatePreferences);

export default router;