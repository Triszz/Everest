import { Router } from "express";
import { adminUsersController } from "./admin-users.controller";
import { authenticate } from "../../../middlewares/authenticate";
import { roleGuard } from "../../../middlewares/roleGuard";

const router = Router();

router.use(authenticate, roleGuard("Admin"));

router.get("/", adminUsersController.list);
router.get("/:userId", adminUsersController.getById);
router.patch("/:userId/status", adminUsersController.updateStatus);
router.patch("/:userId/role", adminUsersController.updateRole);

export default router;
