import { Router } from "express";
import { adminController } from "./admin.controller";
import { authenticate } from "../../middlewares/authenticate";
import { roleGuard } from "../../middlewares/roleGuard";

const router = Router();

router.use(authenticate, roleGuard("Admin"));

router.get("/users", adminController.listUsers);
router.get("/users/:userId", adminController.getUserById);
router.patch("/users/:userId/status", adminController.updateUserStatus);
router.patch("/users/:userId/role", adminController.updateUserRole);

router.get("/partners", adminController.listPartners);
router.get("/partners/:partnerId", adminController.getPartnerById);
router.post("/partners/:partnerId/approve", adminController.approvePartner);
router.post("/partners/:partnerId/reject", adminController.rejectPartner);
router.patch("/partners/:partnerId/lock", adminController.togglePartnerLock);

router.get("/partners/:partnerId/branches", adminController.listBranches);
router.get("/partners/:partnerId/branches/:branchId", adminController.getBranchById);
router.post("/partners/:partnerId/branches", adminController.createBranch);
router.patch("/partners/:partnerId/branches/:branchId", adminController.updateBranch);
router.delete("/partners/:partnerId/branches/:branchId", adminController.deleteBranch);
router.patch("/partners/:partnerId/branches/:branchId/lock", adminController.toggleBranchLock);

router.get("/categories", adminController.listCategories);
router.get("/categories/:categoryId", adminController.getCategoryById);
router.post("/categories", adminController.createCategory);
router.patch("/categories/:categoryId", adminController.updateCategory);
router.delete("/categories/:categoryId", adminController.deleteCategory);

router.get("/vouchers", adminController.listVouchers);
router.get("/vouchers/stats", adminController.getVoucherStats);
router.post("/vouchers/:voucherId/approve", adminController.approveVoucher);
router.post("/vouchers/:voucherId/reject", adminController.rejectVoucher);
router.patch("/vouchers/:voucherId/display", adminController.setVoucherDisplayStatus);

router.get("/policies", adminController.listPolicies);
router.get("/policies/:policyId", adminController.getPolicyById);
router.put("/policies", adminController.upsertPolicy);
router.delete("/policies", adminController.deletePolicy);

router.get("/banners", adminController.listBanners);
router.get("/banners/:bannerId", adminController.getBannerById);
router.post("/banners", adminController.createBanner);
router.patch("/banners/:bannerId", adminController.updateBanner);
router.patch("/banners/:bannerId/status", adminController.updateBannerStatus);
router.delete("/banners/:bannerId", adminController.deleteBanner);

export default router;
