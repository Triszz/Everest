/**
 * Order Schemas
 * --------------------------------------------------------------
 * Zod schemas cho Orders API.
 */
import { z } from "zod";

/** POST /api/customer/orders — Tạo đơn (Pending). */
export const createOrderSchema = z.object({
  buyerInfo: z.object({
    fullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
    email: z.string().email("Email không hợp lệ"),
    phone: z.string().min(8, "Số điện thoại không hợp lệ"),
  }),
  items: z
    .array(
      z.object({
        voucherId: z.coerce.number("voucher_id phải là số").int().positive(),
        quantity: z.coerce
          .number("quantity phải là số")
          .int()
          .positive({ message: "Số lượng phải lớn hơn 0" }),
      }),
    )
    .min(1, "Đơn hàng phải có ít nhất 1 voucher"),
  sendAsGift: z.boolean().optional().default(false),
  // Thông tin tặng quà — bắt buộc khi sendAsGift = true
  receiverEmail: z.string().email("Email người nhận không hợp lệ").optional(),
  giftMessage: z.string().max(500, "Lời chúc tối đa 500 ký tự").optional(),
  // Tương lai: mã giảm giá
  couponCode: z.string().optional(),
});

/** POST /api/customer/orders/:orderId/checkout — Thanh toán mô phỏng. */
export const checkoutSchema = z.object({
  paymentMethod: z.enum(["atm", "momo", "visa"]),
});

/** Params cho /orders/:orderId */
export const orderIdParam = z.object({
  orderId: z.coerce.number("orderId phải là số").int().positive(),
});

/** Query cho GET /api/customer/orders */
export const listOrdersQuery = z.object({
  page: z.coerce.number("page phải là số").int().positive().optional().default(1),
  pageSize: z.coerce
    .number("pageSize phải là số")
    .int()
    .positive()
    .max(100)
    .optional()
    .default(10),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type OrderIdParam = z.infer<typeof orderIdParam>;
export type ListOrdersQuery = z.infer<typeof listOrdersQuery>;