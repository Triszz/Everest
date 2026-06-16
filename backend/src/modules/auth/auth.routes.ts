import { Router } from "express";
import { authController } from "./auth.controller";
import { authenticate } from "../../middlewares/authenticate";

const router = Router();

// ── Public ──────────────────────────────────────────────────────
router.post("/login", authController.login);
router.post("/register", authController.registerCustomer); // Nhân dùng cho 7.2
router.post("/register/partner", authController.registerPartner); // Trí – 7.3
router.post("/refresh", authController.refresh);

// ── Authenticated ────────────────────────────────────────────────
router.get("/me", authenticate, authController.me);
router.put("/me", authenticate, authController.updateProfile);
router.put("/password", authenticate, authController.changePassword);

export default router;
