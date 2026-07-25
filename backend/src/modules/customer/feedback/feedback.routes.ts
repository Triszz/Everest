import { Router } from "express";
import { feedbackController } from "./feedback.controller";
import { authenticate } from "../../../middlewares/authenticate";
import { roleGuard } from "../../../middlewares/roleGuard";

const router = Router();

// ── Customer / Public routes ────────────────────────────────────────────────

// POST /api/feedback — Submit feedback (public, no auth required)
// guest can also submit via email
router.post("/", feedbackController.submit);

// ── Admin routes ────────────────────────────────────────────────────────────

// GET /api/admin/feedback — List all feedbacks
router.get(
  "/",
  authenticate,
  roleGuard("Admin"),
  feedbackController.list
);

// GET /api/admin/feedback/:feedbackId — Get single feedback
router.get(
  "/:feedbackId",
  authenticate,
  roleGuard("Admin"),
  feedbackController.getById
);

// PATCH /api/admin/feedback/:feedbackId — Update status
router.patch(
  "/:feedbackId",
  authenticate,
  roleGuard("Admin"),
  feedbackController.updateStatus
);

export default router;
