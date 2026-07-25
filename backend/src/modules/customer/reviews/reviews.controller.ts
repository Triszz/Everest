import { Request, Response, NextFunction } from "express";
import { reviewsService } from "./reviews.service";
import { AppError } from "../../../middlewares/errorHandler";

function zodError(error: unknown) {
  const zErr = error as { name: string; errors?: { message: string }[] };
  if (zErr.name === "ZodError" && zErr.errors?.[0]) {
    return { code: "VALIDATION_ERROR" as const, message: zErr.errors[0].message };
  }
  return null;
}

export const reviewsController = {
  /**
   * POST /api/customer/vouchers/:voucherId/reviews
   * Tạo / cập nhật đánh giá voucher.
   */
  async createReview(req: Request, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.userId;
      const voucherId = Number(req.params.voucherId);

      if (!voucherId || !Number.isInteger(voucherId) || voucherId <= 0) {
        return res.status(400).json({
          success: false,
          error: { code: "VALIDATION_ERROR", message: "voucherId không hợp lệ" },
        });
      }

      const input = req.body;
      const result = await reviewsService.createReview(customerId, voucherId, input);

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
      next(error);
    }
  },

  /**
   * GET /api/customer/vouchers/:voucherId/reviews
   * Danh sách đánh giá voucher.
   */
  async listReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const voucherId = Number(req.params.voucherId);
      const page = Number(req.query.page) || 1;
      const pageSize = Number(req.query.pageSize) || 10;

      const result = await reviewsService.listReviews(voucherId, page, pageSize);

      res.json({
        success: true,
        data: result.reviews,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  },
};
