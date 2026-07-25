import { Router } from "express";
import { notificationsController } from "./notifications.controller";
import { authenticate } from "../../../middlewares/authenticate";

const router = Router();

router.use(authenticate);

// GET  /api/customer/notifications/preferences
router.get("/preferences", notificationsController.getPreferences);

// PUT  /api/customer/notifications/preferences
router.put("/preferences", notificationsController.updatePreferences);

export default router;
