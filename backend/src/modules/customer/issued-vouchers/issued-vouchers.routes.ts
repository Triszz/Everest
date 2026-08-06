/**
 * Issued Voucher Routes
 * --------------------------------------------------------------
 * Mount trong app.ts ở prefix `/api/customer/issued-vouchers`.
 * Tất cả routes yêu cầu đăng nhập.
 */
import { Router } from "express";
import { issuedVouchersController } from "./issued-vouchers.controller";
import { authenticate } from "../../../middlewares/authenticate";

const router = Router();

router.use(authenticate);

/** GET /api/customer/issued-vouchers — Danh sách voucher đã mua */
router.get("/", issuedVouchersController.list);

/** GET /api/customer/issued-vouchers/:issuedVoucherId — Chi tiết 1 voucher đã mua */
router.get("/:issuedVoucherId", issuedVouchersController.get);

export default router;