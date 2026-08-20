/**
 * Profile Routes
 * --------------------------------------------------------------
 * Mount trong app.ts ở prefix `/api/customer/profile`.
 * Tất cả routes yêu cầu đăng nhập.
 */
import { Router } from "express";
import { profileController } from "./profile.controller";
import { authenticate } from "../../../middlewares/authenticate";

const router = Router();

router.use(authenticate);

/** GET /api/customer/profile/me — Xem hồ sơ */
router.get("/me", profileController.getProfile);

/** PUT /api/customer/profile/me — Cập nhật thông tin */
router.put("/me", profileController.updateProfile);

/** PUT /api/customer/profile/password — Đổi mật khẩu */
router.put("/password", profileController.changePassword);

export default router;