/**
 * services/reviewApi.ts
 * ------------------------------------------------------------------
 * Module API cho Review (B6).
 *
 * Các hàm:
 *  - `reviewApi.create(voucherId, payload)` : Tạo / cập nhật review cho voucher.
 *
 * Lưu ý:
 *  - Mỗi customer chỉ review 1 lần cho mỗi voucher; gọi lại sẽ UPDATE.
 *  - Backend xác thực customer đã mua voucher (qua IssuedVoucher).
 * ------------------------------------------------------------------
 */
import { authFetch, BASE_URL, handleResponse } from "./http";
import type { ReviewPayload } from "./types";

export const reviewApi = {
  /**
   * B6: Tạo / cập nhật đánh giá voucher.
   * POST /api/vouchers/:id/reviews
   * @param voucherId id của voucher được review
   * @param payload {@link ReviewPayload}
   */
  create: async (voucherId: number, payload: ReviewPayload) => {
    const res = await authFetch(`${BASE_URL}/vouchers/${voucherId}/reviews`, {
      method: "POST",
      auth: true,
      body: JSON.stringify(payload),
    });
    return handleResponse<{
      success: boolean;
      data: { reviewId: number; rating: number; comment: string; updated: boolean };
    }>(res);
  },
};