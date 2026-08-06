/**
 * Popup Routes
 * --------------------------------------------------------------
 * Mount trong app.ts ở prefix `/api/popups`.
 * Public — không yêu cầu auth.
 */
import { Router } from "express";
import { popupsController } from "./popups.controller";

const router = Router();

/** GET /api/popups/active — Lấy 1 popup ngẫu nhiên (dùng cho trang chủ) */
router.get("/active", popupsController.getActivePopup);

/** GET /api/popups — Lấy tất cả popup đang hiển thị */
router.get("/", popupsController.listActivePopups);

export default router;