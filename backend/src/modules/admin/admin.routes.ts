import { Router } from "express";
import { adminController } from "./admin.controller";
import { authenticate } from "../../middlewares/authenticate";
import { roleGuard } from "../../middlewares/roleGuard";
import { auditContext } from "../../middlewares/auditContext";

const router = Router();

router.use(authenticate, roleGuard("Admin"), auditContext);

router.get("/users", adminController.listUsers);
router.get("/users/:userId", adminController.getUserById);
router.patch("/users/:userId/status", adminController.updateUserStatus);
router.patch("/users/:userId/role", adminController.updateUserRole);

router.get("/partners", adminController.listPartners);
router.get("/partners/:partnerId", adminController.getPartnerById);
router.post("/partners/:partnerId/approve", adminController.approvePartner);
router.post("/partners/:partnerId/reject", adminController.rejectPartner);
router.patch("/partners/:partnerId/lock", adminController.togglePartnerLock);

router.get("/branches", adminController.listAllBranches);
router.get("/branches/:branchId", adminController.getBranchByIdSimple);

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

router.get("/popups", adminController.listPopups);
router.get("/popups/:popupId", adminController.getPopupById);
router.post("/popups", adminController.createPopup);
router.patch("/popups/:popupId", adminController.updatePopup);
router.patch("/popups/:popupId/status", adminController.updatePopupStatus);
router.delete("/popups/:popupId", adminController.deletePopup);

router.get("/posts", adminController.listPosts);
router.get("/posts/:postId", adminController.getPostById);
router.post("/posts", adminController.createPost);
router.patch("/posts/:postId", adminController.updatePost);
router.patch("/posts/:postId/status", adminController.updatePostStatus);
router.delete("/posts/:postId", adminController.deletePost);

router.get("/orders", adminController.listOrders);
router.get("/orders/:orderId", adminController.getOrderById);
router.post("/orders/:orderId/cancel", adminController.cancelOrder);
router.post("/orders/:orderId/refund", adminController.refundOrder);

router.get("/audit-logs", adminController.listAuditLogs);

export default router;
