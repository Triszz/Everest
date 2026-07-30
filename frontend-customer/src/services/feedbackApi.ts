/**
 * services/feedbackApi.ts
 * ------------------------------------------------------------------
 * Module API cho Feedback / khiếu nại.
 *
 * Endpoint public: customer (kể cả guest) đều có thể submit feedback.
 * Admin xử lý ở module `/api/admin/feedback` (không thuộc customer).
 *
 * Các hàm:
 *  - `feedbackApi.submit(payload)` : Gửi feedback.
 * ------------------------------------------------------------------
 */
import { BASE_URL, handleResponse } from "./http";
import type { FeedbackPayload, FeedbackSubmitResponse } from "./types";

export const feedbackApi = {
  /**
   * Gửi feedback / khiếu nại.
   * POST /api/feedback — public endpoint.
   * Guest có thể submit qua email.
   */
  submit: async (payload: FeedbackPayload) => {
    const res = await fetch(`${BASE_URL}/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return handleResponse<{ success: boolean; data: FeedbackSubmitResponse }>(res);
  },
};