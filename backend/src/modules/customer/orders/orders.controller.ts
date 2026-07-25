import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { ordersService } from "./orders.service";
import { AppError } from "../../../middlewares/errorHandler";

function zodError(error: unknown) {
  const zErr = error as { name: string; errors?: { message: string }[] };
  if (zErr.name === "ZodError" && zErr.errors?.[0]) {
    return { code: "VALIDATION_ERROR" as const, message: zErr.errors[0].message };
  }
  return null;
}

export const ordersController = {
  async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.userId;
      const input = req.body;

      const result = await ordersService.createOrder(customerId, input);

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

  async checkoutOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.userId;
      const orderId = Number(req.params.orderId);
      const input = req.body;

      if (!orderId || !Number.isInteger(orderId)) {
        return res.status(400).json({
          success: false,
          error: { code: "VALIDATION_ERROR", message: "orderId không hợp lệ" },
        });
      }

      const result = await ordersService.checkoutOrder(customerId, orderId, input);

      res.json({
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

  async cancelOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.userId;
      const orderId = Number(req.params.orderId);

      if (!orderId || !Number.isInteger(orderId)) {
        return res.status(400).json({
          success: false,
          error: { code: "VALIDATION_ERROR", message: "orderId không hợp lệ" },
        });
      }

      const result = await ordersService.cancelOrder(customerId, orderId);

      res.json({
        success: true,
        data: result,
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

  async listOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.userId;
      const page = Number(req.query.page) || 1;
      const pageSize = Number(req.query.pageSize) || 10;

      const result = await ordersService.listOrders(customerId, page, pageSize);

      res.json({
        success: true,
        data: result.orders,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  },

  async getOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.userId;
      const orderId = Number(req.params.orderId);

      if (!orderId || !Number.isInteger(orderId)) {
        return res.status(400).json({
          success: false,
          error: { code: "VALIDATION_ERROR", message: "orderId không hợp lệ" },
        });
      }

      const result = await ordersService.getOrder(customerId, orderId);

      res.json({
        success: true,
        data: result,
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
