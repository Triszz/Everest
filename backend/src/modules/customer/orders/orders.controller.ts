/**
 * Order Controller
 * --------------------------------------------------------------
 * Parse body/query/params qua shared helpers, gọi ordersService.
 */
import { Request, Response } from "express";
import { ordersService } from "./orders.service";
import { asyncHandler } from "../../../middlewares/asyncHandler";
import { getCustomerId, parseOrThrow, parseParams } from "../shared/helpers";
import {
  createOrderSchema,
  checkoutSchema,
  orderIdParam,
  listOrdersQuery,
} from "./orders.schemas";

export const ordersController = {
  /**
   * POST /api/customer/orders — Tạo đơn (Pending).
   */
  createOrder: asyncHandler(async (req: Request, res: Response) => {
    const customerId = getCustomerId(req);
    const input = parseOrThrow(createOrderSchema, req.body);
    const result = await ordersService.createOrder(customerId, input);
    res.status(201).json({ success: true, data: result });
  }),

  /**
   * POST /api/customer/orders/:orderId/checkout — Thanh toán mô phỏng.
   */
  checkoutOrder: asyncHandler(async (req: Request, res: Response) => {
    const customerId = getCustomerId(req);
    const { orderId } = parseParams(req, orderIdParam);
    const input = parseOrThrow(checkoutSchema, req.body);
    const result = await ordersService.checkoutOrder(customerId, orderId, input);
    res.json({ success: true, data: result });
  }),

  /**
   * POST /api/customer/orders/:orderId/cancel — Hủy đơn.
   */
  cancelOrder: asyncHandler(async (req: Request, res: Response) => {
    const customerId = getCustomerId(req);
    const { orderId } = parseParams(req, orderIdParam);
    const result = await ordersService.cancelOrder(customerId, orderId);
    res.json({ success: true, data: result });
  }),

  /**
   * GET /api/customer/orders — Danh sách đơn (có phân trang).
   */
  listOrders: asyncHandler(async (req: Request, res: Response) => {
    const customerId = getCustomerId(req);
    const { page, pageSize } = parseOrThrow(listOrdersQuery, req.query);
    const result = await ordersService.listOrders(customerId, page, pageSize);
    res.json({ success: true, data: result.orders, pagination: result.pagination });
  }),

  /**
   * GET /api/customer/orders/:orderId — Chi tiết đơn.
   */
  getOrder: asyncHandler(async (req: Request, res: Response) => {
    const customerId = getCustomerId(req);
    const { orderId } = parseParams(req, orderIdParam);
    const result = await ordersService.getOrder(customerId, orderId);
    res.json({ success: true, data: result });
  }),
};