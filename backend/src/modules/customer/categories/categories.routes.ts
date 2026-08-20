/**
 * Category Routes
 * --------------------------------------------------------------
 * Mount trong app.ts ở prefix `/api/categories`.
 * Public — không yêu cầu auth.
 */
import { Router } from "express";
import { categoriesController } from "./categories.controller";

const router = Router();

/** GET /api/categories — Danh sách tất cả category */
router.get("/", categoriesController.listCategories);

/** GET /api/categories/:id — Chi tiết 1 category */
router.get("/:id", categoriesController.getCategoryById);

/** GET /api/categories/:id/vouchers — Voucher thuộc 1 category */
router.get("/:id/vouchers", categoriesController.getCategoryVouchers);

export default router;