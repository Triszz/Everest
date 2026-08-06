/**
 * Voucher Routes
 * --------------------------------------------------------------
 * Mount trong app.ts ở prefix `/api/vouchers`.
 * Routes:
 *  - GET  /                    Danh sách voucher (filter/sort/paginate)
 *  - GET  /featured           Voucher nổi bật
 *  - GET  /search/partners    Danh sách đối tác cho dropdown filter
 *  - GET  /:voucherId/reviews Danh sách review (public)
 *  - POST /:voucherId/reviews Tạo/cập nhật review (cần auth)
 *  - GET  /:id                Chi tiết voucher
 *
 * Lưu ý:
 *  - `/search/partners` phải đứng TRƯỚC `/:id` để Express không nhầm "search" thành param `:id`.
 *  - `/reviews` cũng phải đứng TRƯỚC `/:id` cùng lý do.
 */
import { Router } from "express";
import { vouchersController } from "./vouchers.controller";
import { reviewsController } from "../reviews/reviews.controller";
import { authenticate } from "../../../middlewares/authenticate";

const router = Router();

/** GET /api/vouchers — Danh sách voucher (filter/sort/paginate) */
router.get("/", vouchersController.listVouchers);

/** GET /api/vouchers/featured — Voucher nổi bật cho trang chủ */
router.get("/featured", vouchersController.getFeatured);

/** GET /api/vouchers/search/partners — Đối tác cho dropdown filter (BR-CUS-03) */
router.get("/search/partners", vouchersController.listPartners);

/** GET /api/vouchers/:voucherId/reviews — Review của voucher (public) — phải đăng ký TRƯỚC /:id */
router.get("/:voucherId/reviews", vouchersController.getVoucherReviews);

/** POST /api/vouchers/:voucherId/reviews — Tạo/cập nhật review (cần auth) */
router.post("/:voucherId/reviews", authenticate, reviewsController.createReview);

/** GET /api/vouchers/:id — Chi tiết voucher */
router.get("/:id", vouchersController.getVoucherById);

export default router;