import { Router } from "express";
import { vouchersController } from "./vouchers.controller";
import { reviewsController } from "../reviews/reviews.controller";
import { authenticate } from "../../../middlewares/authenticate";

const router = Router();

router.get("/", vouchersController.listVouchers);
router.get("/featured", vouchersController.getFeatured);
router.get("/:id", vouchersController.getVoucherById);

// GET /api/vouchers/:voucherId/reviews — public
router.get("/:voucherId/reviews", vouchersController.getVoucherReviews);

// POST /api/vouchers/:voucherId/reviews — authenticated
router.post("/:voucherId/reviews", authenticate, reviewsController.createReview);

export default router;
