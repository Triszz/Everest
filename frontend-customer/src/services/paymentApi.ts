/**
 * services/paymentApi.ts
 * ------------------------------------------------------------------
 * Module API cho VNPAY.
 *
 * Payment APIs:
 *  - `paymentApi.create(orderId)`         : Tạo URL thanh toán VNPAY cho đơn hàng.
 *  - `paymentApi.handleReturn(queryParams)`: Xử lý khi user quay lại từ VNPAY.
 *                                           (Chỉ verify + trả message — KHÔNG cập nhật đơn).
 * ------------------------------------------------------------------
 */
import { authFetch, BASE_URL, handleResponse } from "./http";

export interface CreatePaymentResponse {
  paymentUrl: string;
  orderId: number;
}

export interface PaymentReturnInfo {
  isSuccess: boolean;
  isVerified: boolean;
  orderId: number;
  message: string;
}

export const paymentApi = {
  /**
   * Tạo URL thanh toán VNPAY cho đơn hàng đã có.
   * Backend sẽ ký URL bằng hash secret của merchant.
   * Frontend nhận URL → redirect user sang đó (window.location.href).
   */
  create: async (orderId: number) => {
    const res = await authFetch(`${BASE_URL}/customer/payment/create`, {
      method: "POST",
      auth: true,
      body: JSON.stringify({ orderId }),
    });
    return handleResponse<{ success: boolean; data: CreatePaymentResponse }>(res);
  },

  /**
   * Trích xuất query params VNPAY trả về và verify với backend.
   * Backend sẽ check signature → trả isSuccess + message.
   *
   * QUAN TRỌNG: Truyền raw query string từ window.location.search (không encode lại)
   * để tránh vnp_SecureHash bị biến dạng khi qua URLSearchParams lần 2.
   */
  handleReturn: async (_queryParams: Record<string, string>, rawSearch?: string) => {
    // Ưu tiên dùng raw query string gốc từ URL để tránh double-encode
    const qs = rawSearch
      ? rawSearch.startsWith("?") ? rawSearch.slice(1) : rawSearch
      : new URLSearchParams(_queryParams).toString();
    const res = await fetch(`${BASE_URL}/customer/payment/return?${qs}`);
    return handleResponse<PaymentReturnInfo>(res);
  },
};