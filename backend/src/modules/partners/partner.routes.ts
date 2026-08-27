import { Router } from "express";
import { partnerController } from "./partner.controller";
import { reportsController } from "./reports.controller";
import { getDashboardStats } from "./dashboard/dashboard.controller";
import { authenticate } from "../../middlewares/authenticate";
import { roleGuard } from "../../middlewares/roleGuard";
import voucherRouter from "./vouchers/voucher.routes";
import redemptionRouter from "./redemption/redemption.routes";

const router = Router();

// ── Shared auth + role guard ──────────────────────────────────────────────────
router.use(authenticate);

// /settings: shared by both Owner and Cashier
router.get(
  "/settings",
  roleGuard("Partner_Owner", "Partner_Cashier"),
  partnerController.getSettings,
);

// Dashboard: shared by both Owner and Cashier
router.get(
  "/dashboard/stats",
  roleGuard("Partner_Owner", "Partner_Cashier"),
  getDashboardStats,
);

// Redemption — shared by Owner and Cashier (role guard inside redemption.routes)
router.use("/redemption", redemptionRouter);

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
// [LEGACY] Endpoint này không còn được frontend Partner sử dụng.
// Chỉ giữ lại cho backward compatibility (ví dụ: app mobile, tích hợp cũ).
// Theo business rule mới: cashier chỉ được tạo 1 lần qua POST /cashiers.
router.post(
  "/branches/:branchId/cashier",
  partnerController.assignCashier,
);
router.delete(
  "/branches/:branchId/cashier",
  partnerController.removeCashier,
);

router.post("/cashiers", partnerController.createCashier);
// [LEGACY] Endpoint search cashier phục vụ autocomplete khi gán cashier.
// Hiện không còn UI dùng — chỉ giữ cho backward compatibility.
router.get("/cashiers", partnerController.listCashiers);

// Đổi mật khẩu Cashier (chỉ Owner được thực hiện)
router.put(
  "/branches/:branchId/cashier/password",
  partnerController.resetCashierPassword,
);

// Quản lý voucher: chỉ Owner
router.use("/vouchers", voucherRouter);

// Báo cáo & Thống kê (Owner only)
router.get("/reports/kpis", reportsController.getKPIs);
router.get("/reports/revenue-chart", reportsController.getRevenueChart);
router.get("/reports/voucher-performance", reportsController.getVoucherPerformance);
router.get("/reports/voucher-status-distribution", reportsController.getVoucherStatusDistribution);
router.get("/reports/vouchers", reportsController.getVoucherReportTable);

export default router;