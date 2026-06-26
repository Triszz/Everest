import { Router } from "express";
import { vouchersController } from "./vouchers.controller";

const router = Router();

router.get("/", vouchersController.listVouchers);
router.get("/featured", vouchersController.getFeatured);
router.get("/:id", vouchersController.getVoucherById);
router.get("/:id/reviews", vouchersController.getVoucherReviews);

export default router;
