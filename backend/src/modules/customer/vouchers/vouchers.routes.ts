import { Router } from "express";
import { vouchersController } from "./vouchers.controller";
import { reviewsController } from "../reviews/reviews.controller";
import { authenticate } from "../../../middlewares/authenticate";

const router = Router();

router.get("/", vouchersController.listVouchers);
router.get("/featured", vouchersController.getFeatured);
router.get("/:id", vouchersController.getVoucherById);

// GET /api/vouchers/:id/reviews — public
router.get("/:id/reviews", vouchersController.getVoucherReviews);

// POST /api/vouchers/:id/reviews — authenticated
router.post("/:id/reviews", authenticate, reviewsController.createReview);

export default router;
