/**
 * services/orderApi.ts
 * ------------------------------------------------------------------
 * Module API cho Đơn hàng + Voucher đã phát hành (IssuedVoucher).
 *
 * Order APIs:
 *  - `orderApi.create(payload)`       : Tạo đơn hàng (trạng thái Pending).
 *  - `orderApi.checkout(orderId, ...)` : Thanh toán đơn (mô phỏng) → sinh IssuedVoucher.
 *  - `orderApi.getById(orderId)`      : Chi tiết 1 đơn.
 *  - `orderApi.listMine(params?)`     : Lịch sử đơn của customer hiện tại.
 *  - `orderApi.cancel(orderId)`       : Hủy đơn (chỉ Pending).
 *
 * Issued Voucher APIs:
 *  - `orderApi.listIssuedVouchers(p)` : Danh sách voucher đã mua.
 * ------------------------------------------------------------------
 */
import { authFetch, BASE_URL, buildQuery, handleResponse } from "./http";
import type {
  OrderDetail,
  OrderSummary,
  CreateOrderPayload,
  CreateOrderResponse,
  CheckoutResponse,
  IssuedVoucher,
} from "./types";
import type { PaginationMeta } from "./http";

export const orderApi = {
  /** Tạo đơn hàng (trạng thái Pending). */
  create: async (payload: CreateOrderPayload) => {
    const res = await authFetch(`${BASE_URL}/customer/orders`, {
      method: "POST",
      auth: true,
      body: JSON.stringify(payload),
    });
    return handleResponse<{ success: boolean; data: CreateOrderResponse }>(res);
  },

  /**
   * Thanh toán đơn hàng (mô phỏng).
   * Sau khi thanh toán thành công → backend sinh IssuedVoucher.
   * @param paymentMethod `"atm" | "momo" | "visa"`
   */
  checkout: async (orderId: number, body: { paymentMethod: string }) => {
    const res = await authFetch(`${BASE_URL}/customer/orders/${orderId}/checkout`, {
      method: "POST",
      auth: true,
      body: JSON.stringify(body),
    });
    return handleResponse<{ success: boolean; data: CheckoutResponse }>(res);
  },

  /** Lấy chi tiết 1 đơn hàng (kèm issuedVouchers nếu đã thanh toán). */
  getById: async (orderId: number) => {
    const res = await authFetch(`${BASE_URL}/customer/orders/${orderId}`, { auth: true });
    return handleResponse<{ success: boolean; data: OrderDetail }>(res);
  },

  /** Lịch sử đơn hàng của user hiện tại. */
  listMine: async (params?: { page?: number; pageSize?: number }) => {
    const res = await authFetch(
      `${BASE_URL}/customer/orders${buildQuery(params)}`,
      { auth: true }
    );
    return handleResponse<{
      success: boolean;
      data: OrderSummary[];
      pagination: PaginationMeta;
    }>(res);
  },

  /** Hủy đơn hàng (chỉ khi trạng thái Pending). */
  cancel: async (orderId: number) => {
    const res = await authFetch(`${BASE_URL}/customer/orders/${orderId}/cancel`, {
      method: "POST",
      auth: true,
    });
    return handleResponse<{ success: boolean; data: { orderId: number; paymentStatus: string }; message: string }>(res);
  },

  /** Lấy danh sách voucher đã mua (IssuedVoucher). */
  listIssuedVouchers: async (params?: { page?: number; pageSize?: number; status?: string }) => {
    const res = await authFetch(
      `${BASE_URL}/customer/issued-vouchers${buildQuery(params)}`,
      { auth: true }
    );
    return handleResponse<{
      success: boolean;
      data: IssuedVoucher[];
      pagination: PaginationMeta;
    }>(res);
  },
};