import { z } from "zod";

const coerceToNumber = (errorMsg: string) =>
  z.coerce.number(errorMsg);

export const addToCartSchema = z.object({
  voucher_id: coerceToNumber("voucher_id phải là số"),
  quantity: coerceToNumber("quantity phải là số").refine(
    (val) => val > 0,
    { message: "Số lượng phải lớn hơn 0" }
  ),
});

export const updateCartItemSchema = z.object({
  quantity: coerceToNumber("quantity phải là số").refine(
    (val) => val > 0,
    { message: "Số lượng phải lớn hơn 0" }
  ),
});

export const cartItemIdParam = z.object({
  itemId: coerceToNumber("itemId phải là số"),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
export type CartItemIdParam = z.infer<typeof cartItemIdParam>;
