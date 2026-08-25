import { Router } from "express";
import { paymentController } from "./payment.controller";
import { authenticate } from "../../../middlewares/authenticate";
import { idempotency } from "../../../middlewares/idempotency";
import { checkoutLimiter } from "../../../middlewares/rateLimiters";

const router = Router();

/** POST /api/customer/payment/create — Tạo URL thanh toán VNPAY */
router.post("/create", authenticate, checkoutLimiter, idempotency(), paymentController.createPaymentUrl);

/** GET /api/customer/payment/return — User quay lại từ VNPAY (không cần auth) */
router.get("/return", paymentController.returnUrl);

/** POST /api/customer/payment/ipn — Webhook VNPAY gọi về (không cần auth vì có verify signature) */
router.post("/ipn", paymentController.ipn);

export default router;
