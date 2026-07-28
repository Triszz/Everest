import { Router } from "express";
import { partnerController } from "./partner.controller";
import { authenticate } from "../../middlewares/authenticate";
import { roleGuard } from "../../middlewares/roleGuard";
import voucherRouter from "../vouchers/voucher.routes";

const router = Router();

/*
 * Tất cả route đối tác đều phải đăng nhập.
 * Chưa giới hạn Owner tại đây vì Cashier cũng cần dùng một số route.
 */
router.use(authenticate);

router.get(
  "/settings",
  roleGuard(
    "Partner_Owner",
    "Partner_Cashier",
  ),
  partnerController.getSettings,
);

// Các route từ đây trở xuống chỉ Owner
router.use(roleGuard("Partner_Owner"));

/*
 * =====================================================
 * ROUTE DÙNG CHUNG CHO OWNER VÀ CASHIER
 * =====================================================
 */

// Owner xem user + partner.
// Cashier xem user + partner + branch được phân công.
router.get(
  "/settings",
  roleGuard("Partner_Owner", "Partner_Cashier"),
  partnerController.getSettings,
);

/*
 * Sau khi tạo module voucher-redemption, hai route này
 * phải được đặt tại đây, trước middleware Owner-only.
 *
 * router.post(
 *   "/voucher-codes/validate",
 *   roleGuard("Partner_Owner", "Partner_Cashier"),
 *   voucherRedemptionController.validate,
 * );
 *
 * router.post(
 *   "/voucher-codes/:code/confirm-use",
 *   roleGuard("Partner_Owner", "Partner_Cashier"),
 *   voucherRedemptionController.confirmUse,
 * );
 */

/*
 * =====================================================
 * TỪ ĐÂY TRỞ XUỐNG CHỈ PARTNER OWNER
 * =====================================================
 */

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