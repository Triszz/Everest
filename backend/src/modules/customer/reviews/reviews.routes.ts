/**
 * Review Routes (legacy mount)
 * --------------------------------------------------------------
 * Mount trong app.ts ở prefix `/api/customer/vouchers`.
 * Mount này là alias để giữ backward-compat với frontend cũ
 * (frontend mới nên dùng `/api/vouchers/:voucherId/reviews`).
 *
 * Routes chính thức nằm ở vouchers.routes.ts.
 */
import { Router } from "express";
import { reviewsController } from "./reviews.controller";
import { authenticate } from "../../../middlewares/authenticate";

const router = Router();

/** GET /api/customer/vouchers/:voucherId/reviews — public */
router.get("/:voucherId/reviews", reviewsController.listReviews);

/** POST /api/customer/vouchers/:voucherId/reviews — cần đăng nhập */
router.post(
  "/:voucherId/reviews",
  authenticate,
  reviewsController.createReview,
);

export default router;