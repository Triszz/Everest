import { Router } from "express";
import { reviewsController } from "./reviews.controller";
import { authenticate } from "../../../middlewares/authenticate";

const router = Router();

// GET /api/customer/vouchers/:voucherId/reviews — public
router.get("/:voucherId/reviews", reviewsController.listReviews);

// POST /api/customer/vouchers/:voucherId/reviews — authenticated
router.post(
  "/:voucherId/reviews",
  authenticate,
  reviewsController.createReview
);

export default router;
