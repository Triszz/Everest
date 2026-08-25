import { Router } from "express";
import { authController } from "./auth.controller";
import { authService } from "./auth.service";
import { passwordService } from "./password.service";
import emailOtpRouter from "./email-otp.routes";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { AppError } from "../../middlewares/errorHandler";
import { authenticate } from "../../middlewares/authenticate";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  resetPasswordWithOtpSchema,
} from "./password.schemas";
import { ZodError } from "zod";
import { authSensitiveLimiter } from "../../middlewares/rateLimiters";

const router = Router();

// ── Public ──────────────────────────────────────────────────────
router.post("/login", authSensitiveLimiter, authController.login);
router.post("/register", authSensitiveLimiter, authController.registerCustomer);
router.post("/register/partner", authSensitiveLimiter, authController.registerPartner);
router.post("/refresh", authController.refresh);

// ── Email OTP ───────────────────────────────────────────────────
// Mount toàn bộ router OTP (send / resend / verify) tại /email-otp
router.use("/email-otp", authSensitiveLimiter, emailOtpRouter);

// ── Forgot / Reset Password ───────────────────────────────────────
router.post(
  "/forgot-password",
  authSensitiveLimiter,
  asyncHandler(async (req, res) => {
    try {
      forgotPasswordSchema.parse(req.body);
    } catch (err) {
      if (err instanceof ZodError) throw new AppError(err.issues[0].message, 400, "VALIDATION_ERROR");
      throw err;
    }
    const { email } = req.body as { email: string };
    const result = await passwordService.requestReset(email, req.ip);
    res.json({ success: true, ...result });
  })
);

router.put(
  "/reset-password",
  asyncHandler(async (req, res) => {
    try {
      resetPasswordSchema.parse(req.body);
    } catch (err) {
      if (err instanceof ZodError) throw new AppError(err.issues[0].message, 400, "VALIDATION_ERROR");
      throw err;
    }
    const { token, newPassword } = req.body as { token: string; newPassword: string };
    const result = await passwordService.resetPassword(token, newPassword);
    res.json({ success: true, ...result });
  })
);

/**
 * POST /api/auth/reset-password-otp
 * Body: { email, otp, newPassword }
 *
 * Reset password dùng OTP 6 số (flow mobile / Partner).
 * Frontend flow:
 *   1. POST /api/auth/email-otp/send { email, purpose: "RESET_PASSWORD" }
 *   2. (optional) verify OTP trước để hiển thị "Mã hợp lệ"
 *   3. POST /api/auth/reset-password-otp { email, otp, newPassword }
 *
 * OTP sẽ bị consume ngay khi verify (cả ở bước 2 và bước 3) → không thể reuse.
 */
router.post(
  "/reset-password-otp",
  asyncHandler(async (req, res) => {
    try {
      resetPasswordWithOtpSchema.parse(req.body);
    } catch (err) {
      if (err instanceof ZodError) throw new AppError(err.issues[0].message, 400, "VALIDATION_ERROR");
      throw err;
    }
    const { email, otp, newPassword } = req.body as {
      email: string;
      otp: string;
      newPassword: string;
    };
    const result = await passwordService.resetPasswordWithOtp(email, otp, newPassword);
    res.json({ success: true, ...result });
  })
);

// ── Authenticated ────────────────────────────────────────────────
router.get("/me", authenticate, authController.me);
router.put("/me", authenticate, authController.updateProfile);
router.put("/password", authenticate, authController.changePassword);

// ── Session management (B9) ──────────────────────────────────────
router.get("/sessions", authenticate, asyncHandler(async (req, res) => {
  const sessions = await authService.listSessions(req.user!.userId);
  res.json({ success: true, data: sessions });
}));

router.post("/sessions/:sessionId/revoke", authenticate, asyncHandler(async (req, res) => {
  const { sessionId } = req.params as { sessionId: string };
  const result = await authService.revokeSession(req.user!.userId, sessionId);
  res.json({ success: true, ...result });
}));

router.post("/sessions/revoke-all", authenticate, asyncHandler(async (req, res) => {
  const sessionId = (req.user as any).sessionId as string | undefined;
  const result = await authService.revokeAllOtherSessions(req.user!.userId, sessionId);
  res.json({ success: true, ...result });
}));

export default router;
