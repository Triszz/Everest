/**
 * services/cartApi.ts
 * ------------------------------------------------------------------
 * Module API cho Giỏ hàng + áp mã giảm giá.
 *
 * Các hàm:
 *  - `cartApi.getCart()`             : Lấy giỏ hàng hiện tại.
 *  - `cartApi.addToCart(voucherId, quantity)` : Thêm voucher vào giỏ.
 *  - `cartApi.updateCartItem(itemId, quantity)` : Cập nhật số lượng.
 *  - `cartApi.removeCartItem(itemId)` : Xoá 1 item.
 *  - `cartApi.clearCart()`            : Xoá toàn bộ giỏ.
 *  - `cartApi.applyCode(code)`        : Áp mã giảm giá vào đơn.
 * ------------------------------------------------------------------
 */
import { authFetch, BASE_URL, handleResponse } from "./http";
import type { Cart, CartItem } from "./types";

export const cartApi = {
  /** Lấy giỏ hàng hiện tại của customer đang đăng nhập. */
  getCart: async () => {
    const res = await authFetch(`${BASE_URL}/cart`, { auth: true });
    return handleResponse<{ success: boolean; data: Cart }>(res);
  },

  /** Thêm voucher vào giỏ. Nếu đã có thì cộng dồn số lượng (backend xử lý). */
  addToCart: async (voucherId: number, quantity: number) => {
    const res = await authFetch(`${BASE_URL}/cart/items`, {
      method: "POST",
      auth: true,
      body: JSON.stringify({ voucher_id: voucherId, quantity }),
    });
    return handleResponse<{ success: boolean; data: { message: string; item: CartItem } }>(res);
  },

  /** Cập nhật số lượng của 1 cart item. */
  updateCartItem: async (itemId: number, quantity: number) => {
    const res = await authFetch(`${BASE_URL}/cart/items/${itemId}`, {
      method: "PUT",
      auth: true,
      body: JSON.stringify({ quantity }),
    });
    return handleResponse<{ success: boolean; data: { message: string; item: CartItem } }>(res);
  },

  /** Xoá 1 item khỏi giỏ. */
  removeCartItem: async (itemId: number) => {
    const res = await authFetch(`${BASE_URL}/cart/items/${itemId}`, {
      method: "DELETE",
      auth: true,
    });
    return handleResponse<{ success: boolean; data: { message: string } }>(res);
  },

  /** Xoá sạch giỏ hàng. */
  clearCart: async () => {
    const res = await authFetch(`${BASE_URL}/cart`, {
      method: "DELETE",
      auth: true,
    });
    return handleResponse<{ success: boolean; data: { message: string } }>(res);
  },

  /**
   * Áp mã giảm giá vào đơn hàng.
   * POST /api/customer/orders/apply-code — Body: { code: string }
   */
  applyCode: async (code: string) => {
    const res = await authFetch(`${BASE_URL}/customer/orders/apply-code`, {
      method: "POST",
      auth: true,
      body: JSON.stringify({ code }),
    });
    return handleResponse<{ success: boolean; data: { discount: number; code: string } }>(res);
  },
};
