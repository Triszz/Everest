import { Router } from "express";
import { partnerController } from "./partner.controller";
import { authenticate } from "../../middlewares/authenticate";
import { roleGuard } from "../../middlewares/roleGuard";
import voucherRouter from '../vouchers/voucher.routes';

const router = Router();

// Tất cả routes cần login + role Partner_Owner
router.use(authenticate, roleGuard("Partner_Owner"));

router.get("/profile", partnerController.getProfile);
router.put("/profile", partnerController.updateProfile);

router.get("/branches", partnerController.listBranches);
router.post("/branches", partnerController.createBranch);
router.get("/branches/:branchId", partnerController.getBranch);
router.put("/branches/:branchId", partnerController.updateBranch);
router.delete("/branches/:branchId", partnerController.deleteBranch);
router.post("/branches/:branchId/cashier", partnerController.assignCashier);
router.delete("/branches/:branchId/cashier", partnerController.removeCashier);

router.post("/cashiers", partnerController.createCashier); // Tạo tài khoản thu ngân mới

router.use('/vouchers', voucherRouter);

export default router;
