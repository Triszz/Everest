/**
 * Cart Schemas
 * --------------------------------------------------------------
 * Zod schemas cho validate body/params của Cart API.
 */
import { z } from "zod";

/** POST /api/cart/items — Thêm voucher vào giỏ. */
export const addToCartSchema = z.object({
  voucher_id: z.coerce.number("voucher_id phải là số").int().positive(),
  quantity: z.coerce
    .number("quantity phải là số")
    .int()
    .positive({ message: "Số lượng phải lớn hơn 0" }),
});

/** PUT /api/cart/items/:itemId — Cập nhật số lượng. */
export const updateCartItemSchema = z.object({
  quantity: z.coerce
    .number("quantity phải là số")
    .int()
    .positive({ message: "Số lượng phải lớn hơn 0" }),
});

/** Params cho /cart/items/:itemId */
export const cartItemIdParam = z.object({
  itemId: z.coerce.number("itemId phải là số").int().positive(),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
export type CartItemIdParam = z.infer<typeof cartItemIdParam>;