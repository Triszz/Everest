import { Request, Response, NextFunction } from "express";
import { feedbackService } from "./feedback.service";
import { AppError } from "../../../middlewares/errorHandler";

function zodError(error: unknown) {
  const zErr = error as { name: string; errors?: { message: string }[] };
  if (zErr.name === "ZodError" && zErr.errors?.[0]) {
    return { code: "VALIDATION_ERROR" as const, message: zErr.errors[0].message };
  }
  return null;
}

export const feedbackController = {
  /**
   * POST /api/feedback — Submit feedback (guest or authenticated).
   * No authentication required.
   */
  async submit(req: Request, res: Response, next: NextFunction) {
    try {
      const input = req.body;
      const customerId = req.user?.userId as string | undefined;
      const ipAddress = req.ip;

      const result = await feedbackService.submit(input, customerId, ipAddress);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      const zErr = zodError(error);
      if (zErr) {
        return res.status(400).json({ success: false, error: zErr });
      }
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: { code: error.code, message: error.message },
        });
      }
      if (error instanceof Error) {
        return res.status(400).json({
          success: false,
          error: { code: "BAD_REQUEST", message: error.message },
        });
      }
      next(error);
    }
  },

  /**
   * GET /api/admin/feedback — List all feedbacks (admin only).
   * Query: ?status=Open&type=complaint&page=1&pageSize=20
   */
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, type, page, pageSize } = req.query;

      const result = await feedbackService.list({
        status: status as string | undefined,
        type: type as string | undefined,
        page: page ? Number(page) : 1,
        pageSize: pageSize ? Number(pageSize) : 20,
      });

      res.json({
        success: true,
        data: result.feedbacks,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/admin/feedback/:feedbackId — Get single feedback (admin).
   */
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const feedbackId = Number(req.params.feedbackId);
      if (!feedbackId || !Number.isInteger(feedbackId)) {
        return res.status(400).json({
          success: false,
          error: { code: "VALIDATION_ERROR", message: "feedbackId không hợp lệ" },
        });
      }

      const feedback = await feedbackService.getById(feedbackId);
      if (!feedback) {
        return res.status(404).json({
          success: false,
          error: { code: "NOT_FOUND", message: "Không tìm thấy phản hồi" },
        });
      }

      res.json({ success: true, data: feedback });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/admin/feedback/:feedbackId — Update status (admin).
   */
  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const feedbackId = Number(req.params.feedbackId);
      const { status } = req.body as { status: string };

      if (!feedbackId || !Number.isInteger(feedbackId)) {
        return res.status(400).json({
          success: false,
          error: { code: "VALIDATION_ERROR", message: "feedbackId không hợp lệ" },
        });
      }

      const result = await feedbackService.updateStatus(feedbackId, status);

      res.json({ success: true, data: result });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({
          success: false,
          error: { code: "BAD_REQUEST", message: error.message },
        });
      }
      next(error);
    }
  },
};
