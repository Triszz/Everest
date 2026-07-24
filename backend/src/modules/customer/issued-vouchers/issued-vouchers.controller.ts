import { Request, Response, NextFunction } from "express";
import { issuedVouchersService } from "./issued-vouchers.service";
import { AppError } from "../../../middlewares/errorHandler";

export const issuedVouchersController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.userId;
      const query = req.query;

      const status = query.status as string | undefined;
      const page = Number(query.page) || 1;
      const pageSize = Number(query.pageSize) || 20;

      const result = await issuedVouchersService.listIssuedVouchers(customerId, {
        status,
        page,
        pageSize,
      });

      res.json({
        success: true,
        data: result.vouchers,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  },

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.userId;
      const issuedVoucherId = Number(req.params.issuedVoucherId);

      if (!issuedVoucherId || !Number.isInteger(issuedVoucherId)) {
        return res.status(400).json({
          success: false,
          error: { code: "VALIDATION_ERROR", message: "issuedVoucherId không hợp lệ" },
        });
      }

      const voucher = await issuedVouchersService.getIssuedVoucher(
        customerId,
        issuedVoucherId
      );

      if (!voucher) {
        return res.status(404).json({
          success: false,
          error: { code: "NOT_FOUND", message: "Không tìm thấy voucher" },
        });
      }

      res.json({
        success: true,
        data: voucher,
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: { code: error.code, message: error.message },
        });
      }
      next(error);
    }
  },
};
