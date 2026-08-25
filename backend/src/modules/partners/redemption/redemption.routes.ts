/**
 * Redemption Routes
 * ------------------------------------------------
 * Mount tại /api/partner/redemption
 * Auth: Partner_Owner | Partner_Cashier
 */

import { Router } from "express";
import {
  validateVoucher,
  confirmVoucherHandler,
  getVoucherDetailHandler,
} from "./redemption.controller";
import { getHistory } from "./redemption.history.controller";
import { authenticate } from "../../../middlewares/authenticate";
import { roleGuard } from "../../../middlewares/roleGuard";
import { idempotency } from "../../../middlewares/idempotency";
import { redemptionLimiter } from "../../../middlewares/rateLimiters";

const router = Router();

// Tất cả routes cần authenticate + role Partner_Owner | Partner_Cashier
router.use(authenticate);
router.use(roleGuard("Partner_Owner", "Partner_Cashier"));

// POST /api/partner/redemption/validate
router.post("/validate", redemptionLimiter, validateVoucher);

// POST /api/partner/redemption/confirm
router.post("/confirm", redemptionLimiter, idempotency(), confirmVoucherHandler);

// GET /api/partner/redemption/history
router.get("/history", getHistory);

// GET /api/partner/redemption/voucher/:voucherCode
// Lấy chi tiết voucher cho MỌI trạng thái (kể cả Used).
// Dùng cho navigation từ History.
router.get("/voucher/:voucherCode", getVoucherDetailHandler);

export default router;
