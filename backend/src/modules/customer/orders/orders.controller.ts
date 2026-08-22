/**
 * Order Controller
 * --------------------------------------------------------------
 * Parse body/query/params qua shared helpers, gọi ordersService.
 * Hỗ trợ idempotency key và optimistic locking.
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

// Idempotency key header name
const IDEMPOTENCY_KEY_HEADER = "x-idempotency-key";
// Version header for optimistic locking
const VERSION_HEADER = "x-expected-version";

export const ordersController = {
  /**
   * POST /api/customer/orders — Tạo đơn (Pending).
   * Header: x-idempotency-key (optional) - để tránh duplicate order
   */
  createOrder: asyncHandler(async (req: Request, res: Response) => {
    const customerId = getCustomerId(req);
    const input = parseOrThrow(createOrderSchema, req.body);
    const idempotencyKey = req.headers[IDEMPOTENCY_KEY_HEADER] as string | undefined;

    const result = await ordersService.createOrder(customerId, input, idempotencyKey);
    res.status(201).json({ success: true, data: result });
  }),

  /**
   * POST /api/customer/orders/:orderId/checkout — Thanh toán mô phỏng.
   * Headers:
   * - x-idempotency-key (optional) - để tránh duplicate payment
   * - x-expected-version (optional) - để optimistic locking
   */
  checkoutOrder: asyncHandler(async (req: Request, res: Response) => {
    const customerId = getCustomerId(req);
    const { orderId } = parseParams(req, orderIdParam);
    const input = parseOrThrow(checkoutSchema, req.body);
    const idempotencyKey = req.headers[IDEMPOTENCY_KEY_HEADER] as string | undefined;
    const expectedVersion = req.headers[VERSION_HEADER]
      ? parseInt(req.headers[VERSION_HEADER] as string, 10)
      : undefined;

    const result = await ordersService.checkoutOrder(
      customerId,
      orderId,
      input,
      idempotencyKey,
      expectedVersion,
    );
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