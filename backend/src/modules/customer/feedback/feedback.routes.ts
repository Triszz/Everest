/**
 * Feedback Routes
 * --------------------------------------------------------------
 * 2 routers được export:
 *   - default router  → mount ở /api/feedback     (POST submit — public)
 *   - adminRouter     → mount ở /api/admin/feedback (GET list, GET :id, PATCH — admin)
 *
 * Feedback là resource thuộc customer module (vì customer/guest là người submit),
 * nhưng admin cũng cần quản lý → nên feedback module export cả 2.
 */
import { Router } from "express";
import { feedbackController } from "./feedback.controller";
import { authenticate } from "../../../middlewares/authenticate";
import { roleGuard } from "../../../middlewares/roleGuard";

// ── Public / Customer router ─────────────────────────────────────────────────

const publicRouter = Router();

/** POST /api/feedback — Gửi phản hồi (guest hoặc customer) */
publicRouter.post("/", feedbackController.submit);

// ── Admin router ─────────────────────────────────────────────────────────────

const adminRouter = Router();
adminRouter.use(authenticate, roleGuard("Admin"));

/** GET /api/admin/feedback — Danh sách feedback (admin) */
adminRouter.get("/", feedbackController.list);

/** GET /api/admin/feedback/:feedbackId — Chi tiết feedback (admin) */
adminRouter.get("/:feedbackId", feedbackController.getById);

/** PATCH /api/admin/feedback/:feedbackId — Cập nhật trạng thái (admin) */
adminRouter.patch("/:feedbackId", feedbackController.updateStatus);

export { adminRouter as feedbackAdminRouter };
export default publicRouter;