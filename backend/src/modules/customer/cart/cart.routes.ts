/**
 * Cart Routes
 * --------------------------------------------------------------
 * Mount trong app.ts ở prefix `/api/cart`.
 * Tất cả routes yêu cầu đăng nhập (authenticate middleware).
 */
import { Router } from "express";
import { cartController } from "./cart.controller";
import { authenticate } from "../../../middlewares/authenticate";

const router = Router();

router.use(authenticate);

/** GET /api/cart — Lấy giỏ hàng */
router.get("/", cartController.getCart);

/** POST /api/cart/items — Thêm voucher vào giỏ */
router.post("/items", cartController.addToCart);

/** PUT /api/cart/items/:itemId — Cập nhật số lượng */
router.put("/items/:itemId", cartController.updateCartItem);

/** DELETE /api/cart/items/:itemId — Xóa 1 item */
router.delete("/items/:itemId", cartController.removeCartItem);

/** DELETE /api/cart — Xóa toàn bộ giỏ hàng */
router.delete("/", cartController.clearCart);

export default router;