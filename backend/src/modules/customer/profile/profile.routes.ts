import { Router } from "express";
import { profileController } from "./profile.controller";
import { authenticate } from "../../../middlewares/authenticate";

const router = Router();

// Tất cả routes đều yêu cầu đăng nhập
router.use(authenticate);

router.get("/me", profileController.getProfile);
router.put("/me", profileController.updateProfile);
router.put("/password", profileController.changePassword);

export default router;
