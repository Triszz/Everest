import { Request, Response, NextFunction } from "express";
import { cartService } from "./cart.service";
import {
  addToCartSchema,
  updateCartItemSchema,
  cartItemIdParam,
} from "./cart.schemas";
import { AppError } from "../../../middlewares/errorHandler";

export const cartController = {
  async getCart(req: Request, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.userId;
      const cart = await cartService.getCart(customerId);

      res.json({
        success: true,
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  },

  async addToCart(req: Request, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.userId;
      const input = addToCartSchema.parse(req.body);

      const result = await cartService.addToCart(customerId, input);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        });
      } else if ((error as any).name === "ZodError") {
        const zodError = error as any;
        const firstError = zodError.errors?.[0];
        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: firstError?.message || "Dữ liệu không hợp lệ",
          },
        });
      } else {
        next(error);
      }
    }
  },

  async updateCartItem(req: Request, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.userId;
      const { itemId } = cartItemIdParam.parse(req.params);
      const input = updateCartItemSchema.parse(req.body);

      const result = await cartService.updateCartItem(
        customerId,
        itemId,
        input
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        });
      } else if ((error as any).name === "ZodError") {
        const zodError = error as any;
        const firstError = zodError.errors?.[0];
        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: firstError?.message || "Dữ liệu không hợp lệ",
          },
        });
      } else {
        next(error);
      }
    }
  },

  async removeCartItem(req: Request, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.userId;
      const { itemId } = cartItemIdParam.parse(req.params);

      const result = await cartService.removeCartItem(customerId, itemId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        });
      } else if ((error as any).name === "ZodError") {
        const zodError = error as any;
        const firstError = zodError.errors?.[0];
        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: firstError?.message || "Dữ liệu không hợp lệ",
          },
        });
      } else {
        next(error);
      }
    }
  },

  async clearCart(req: Request, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.userId;
      const result = await cartService.clearCart(customerId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
};
