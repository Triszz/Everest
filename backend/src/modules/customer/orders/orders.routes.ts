import { Router } from "express";
import { ordersController } from "./orders.controller";
import { authenticate } from "../../../middlewares/authenticate";

const router = Router();

// Tất cả routes cần đăng nhập
router.use(authenticate);

// GET  /api/customer/orders          — danh sách đơn hàng của customer
router.get("/", ordersController.listOrders);

// GET  /api/customer/orders/:orderId — chi tiết đơn hàng
router.get("/:orderId", ordersController.getOrder);

// POST /api/customer/orders          — tạo đơn hàng (trạng thái Pending)
router.post("/", ordersController.createOrder);

// POST /api/customer/orders/:orderId/checkout — thanh toán + phát hành voucher
router.post("/:orderId/checkout", ordersController.checkoutOrder);

// POST /api/customer/orders/:orderId/cancel — hủy đơn hàng (chỉ Pending)
router.post("/:orderId/cancel", ordersController.cancelOrder);

export default router;
