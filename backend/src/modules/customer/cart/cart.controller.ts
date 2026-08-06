/**
 * Cart Controller
 * --------------------------------------------------------------
 * Tất cả routes yêu cầu đăng nhập (authenticate middleware).
 * Lấy customerId từ req.user.userId, gọi cartService.
 */
import { Request, Response } from "express";
import { cartService } from "./cart.service";
import { asyncHandler } from "../../../middlewares/asyncHandler";
import { getCustomerId, parseOrThrow, parseParams } from "../shared/helpers";
import {
  addToCartSchema,
  updateCartItemSchema,
  cartItemIdParam,
} from "./cart.schemas";

export const cartController = {
  /**
   * GET /api/cart — Lấy giỏ hàng + tổng tiền.
   */
  getCart: asyncHandler(async (req: Request, res: Response) => {
    const customerId = getCustomerId(req);
    const cart = await cartService.getCart(customerId);
    res.json({ success: true, data: cart });
  }),

  /**
   * POST /api/cart/items — Thêm voucher vào giỏ.
   */
  addToCart: asyncHandler(async (req: Request, res: Response) => {
    const customerId = getCustomerId(req);
    const input = parseOrThrow(addToCartSchema, req.body);
    const result = await cartService.addToCart(customerId, input);
    res.status(201).json({ success: true, data: result });
  }),

  /**
   * PUT /api/cart/items/:itemId — Cập nhật số lượng.
   */
  updateCartItem: asyncHandler(async (req: Request, res: Response) => {
    const customerId = getCustomerId(req);
    const { itemId } = parseParams(req, cartItemIdParam);
    const input = parseOrThrow(updateCartItemSchema, req.body);
    const result = await cartService.updateCartItem(customerId, itemId, input);
    res.json({ success: true, data: result });
  }),

  /**
   * DELETE /api/cart/items/:itemId — Xóa 1 item khỏi giỏ.
   */
  removeCartItem: asyncHandler(async (req: Request, res: Response) => {
    const customerId = getCustomerId(req);
    const { itemId } = parseParams(req, cartItemIdParam);
    const result = await cartService.removeCartItem(customerId, itemId);
    res.json({ success: true, data: result });
  }),

  /**
   * DELETE /api/cart — Xóa toàn bộ giỏ hàng.
   */
  clearCart: asyncHandler(async (req: Request, res: Response) => {
    const customerId = getCustomerId(req);
    const result = await cartService.clearCart(customerId);
    res.json({ success: true, data: result });
  }),
};