/**
 * Feedback Controller
 * --------------------------------------------------------------
 * Phân chia:
 * - Customer (public): submit — không cần auth
 * - Admin (auth + roleGuard): list, get, update — xử lý ở feedback.routes.ts
 *
 * Tất cả errors throw AppError → errorHandler middleware xử lý.
 */
import { Request, Response } from "express";
import { feedbackService } from "./feedback.service";
import { asyncHandler } from "../../../middlewares/asyncHandler";
import { getCustomerId, parseOrThrow, parseParams } from "../shared/helpers";
import {
  submitFeedbackSchema,
  listFeedbackQuery,
  feedbackIdParam,
} from "./feedback.schemas";

export const feedbackController = {
  /**
   * POST /api/feedback — Gửi phản hồi (guest hoặc customer).
   * Không yêu cầu auth — guest có thể gửi qua email.
   */
  submit: asyncHandler(async (req: Request, res: Response) => {
    const input = parseOrThrow(submitFeedbackSchema, req.body);
    const customerId = req.user?.userId as string | undefined;
    const ipAddress = req.ip;
    const result = await feedbackService.submit(input, customerId, ipAddress);
    res.status(201).json({ success: true, data: result });
  }),

  // ── Admin handlers (xem feedback.routes.ts để biết routes tương ứng) ──────

  /**
   * GET /api/admin/feedback — Danh sách feedback (admin).
   */
  list: asyncHandler(async (req: Request, res: Response) => {
    const { status, type, page, pageSize } = parseOrThrow(listFeedbackQuery, req.query);
    const result = await feedbackService.list({ status, type, page, pageSize });
    res.json({ success: true, data: result.feedbacks, pagination: result.pagination });
  }),

  /**
   * GET /api/admin/feedback/:feedbackId — Chi tiết feedback (admin).
   */
  getById: asyncHandler(async (req: Request, res: Response) => {
    const { feedbackId } = parseParams(req, feedbackIdParam);
    const feedback = await feedbackService.getById(feedbackId);
    if (!feedback) {
      res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Không tìm thấy phản hồi" } });
      return;
    }
    res.json({ success: true, data: feedback });
  }),

  /**
   * PATCH /api/admin/feedback/:feedbackId — Cập nhật trạng thái (admin).
   */
  updateStatus: asyncHandler(async (req: Request, res: Response) => {
    const { feedbackId } = parseParams(req, feedbackIdParam);
    const { status } = req.body as { status: string };
    const result = await feedbackService.updateStatus(feedbackId, status);
    res.json({ success: true, data: result });
  }),
};