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

export default router;
