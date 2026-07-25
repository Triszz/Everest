import { z } from "zod";

// ── Shared helpers ────────────────────────────────────────────────────────────

const coerceToNumber = (msg: string) => z.coerce.number(msg);

// ── Create order ────────────────────────────────────────────────────────────────

export const createOrderSchema = z.object({
  buyerInfo: z.object({
    fullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
    email: z.string().email("Email không hợp lệ"),
    phone: z.string().min(8, "Số điện thoại không hợp lệ"),
  }),
  items: z
    .array(
      z.object({
        voucherId: coerceToNumber("voucher_id phải là số").int("voucher_id phải là số nguyên"),
        quantity: coerceToNumber("quantity phải là số").int("quantity phải là số nguyên").refine(
          (val) => val > 0,
          { message: "Số lượng phải lớn hơn 0" }
        ),
      })
    )
    .min(1, "Đơn hàng phải có ít nhất 1 voucher"),
  sendAsGift: z.boolean().optional().default(false),
  // Optional: để cho tương lai mở rộng mã giảm giá
  couponCode: z.string().optional(),
});

// ── Checkout ───────────────────────────────────────────────────────────────────

export const checkoutSchema = z.object({
  paymentMethod: z.enum(["atm", "momo", "visa"]),
  // Trong tương lai: thêm OTP verification, payment gateway response...
});

// ── Params ────────────────────────────────────────────────────────────────────

export const orderIdParam = z.object({
  orderId: coerceToNumber("orderId phải là số").int("orderId phải là số nguyên"),
});

// ── Types ─────────────────────────────────────────────────────────────────────

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type OrderIdParam = z.infer<typeof orderIdParam>;
