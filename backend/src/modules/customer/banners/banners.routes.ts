/**
 * Banner Routes
 * --------------------------------------------------------------
 * Mount trong app.ts ở prefix `/api/banners`.
 * Public — không yêu cầu auth.
 */
import { Router } from "express";
import { bannersController } from "./banners.controller";

const router = Router();

/** GET /api/banners — Lấy danh sách banner đang hiển thị */
router.get("/", bannersController.listActiveBanners);

export default router;