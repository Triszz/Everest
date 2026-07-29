import { Router } from "express";
import { partnerController } from "./partner.controller";
import { authenticate } from "../../middlewares/authenticate";
import { roleGuard } from "../../middlewares/roleGuard";
import voucherRouter from "../vouchers/voucher.routes";

const router = Router();

// ── Shared auth + role guard ──────────────────────────────────────────────────
router.use(authenticate);

// /settings: shared by both Owner and Cashier
router.get(
  "/settings",
  roleGuard("Partner_Owner", "Partner_Cashier"),
  partnerController.getSettings,
);

// ── Owner-only routes ──────────────────────────────────────────────────────────
router.use(roleGuard("Partner_Owner"));

// Profile doanh nghiệp
router.get("/profile", partnerController.getProfile);
router.put("/profile", partnerController.updateProfile);

// Quản lý chi nhánh
router.get("/branches", partnerController.listBranches);
router.post("/branches", partnerController.createBranch);
router.get("/branches/:branchId", partnerController.getBranch);
router.put("/branches/:branchId", partnerController.updateBranch);
router.delete("/branches/:branchId", partnerController.deleteBranch);

// Quản lý thu ngân
router.post(
  "/branches/:branchId/cashier",
  partnerController.assignCashier,
);
router.delete(
  "/branches/:branchId/cashier",
  partnerController.removeCashier,
);

router.post("/cashiers", partnerController.createCashier);
router.get("/cashiers", partnerController.listCashiers);

// Quản lý voucher: chỉ Owner
router.use("/vouchers", voucherRouter);

export default router;