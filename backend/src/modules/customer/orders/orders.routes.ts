/**
 * Order Routes
 * --------------------------------------------------------------
 * Mount trong app.ts ở prefix `/api/customer/orders`.
 * Tất cả routes yêu cầu đăng nhập.
 */
import { Router } from "express";
import { ordersController } from "./orders.controller";
import { authenticate } from "../../../middlewares/authenticate";
import { idempotency } from "../../../middlewares/idempotency";
import { checkoutLimiter } from "../../../middlewares/rateLimiters";

const router = Router();

router.use(authenticate);

/** GET /api/customer/orders — Danh sách đơn */
router.get("/", ordersController.listOrders);

/** GET /api/customer/orders/:orderId — Chi tiết đơn */
router.get("/:orderId", ordersController.getOrder);

/** POST /api/customer/orders — Tạo đơn (Pending) */
router.post("/", checkoutLimiter, idempotency(), ordersController.createOrder);

/** POST /api/customer/orders/:orderId/checkout — Thanh toán + phát hành voucher */
router.post("/:orderId/checkout", checkoutLimiter, idempotency(), ordersController.checkoutOrder);

/** POST /api/customer/orders/:orderId/cancel — Hủy đơn */
router.post("/:orderId/cancel", ordersController.cancelOrder);

export default router;