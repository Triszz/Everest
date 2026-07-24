import { Router } from "express";
import { issuedVouchersController } from "./issued-vouchers.controller";
import { authenticate } from "../../../middlewares/authenticate";

const router = Router();

router.use(authenticate);

// GET /api/customer/issued-vouchers — danh sách voucher đã mua
router.get("/", issuedVouchersController.list);

// GET /api/customer/issued-vouchers/:issuedVoucherId — chi tiết voucher đã mua
router.get("/:issuedVoucherId", issuedVouchersController.get);

export default router;
