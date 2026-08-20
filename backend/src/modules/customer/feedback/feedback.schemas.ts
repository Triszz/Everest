/**
 * Feedback Schemas
 * --------------------------------------------------------------
 * Zod schemas cho Feedback API.
 *
 * Phân chia:
 * - Customer (submit): chỉ cần type, subject, message, email, phone, orderId, voucherCode
 * - Admin (list/get/update): listFeedbackQuery, feedbackIdParam
 */
import { z } from "zod";

// ── Customer: Submit ──────────────────────────────────────────────────────────

/** Body cho POST /api/feedback — gửi phản hồi/kiến nghị (guest hoặc authenticated). */
export const submitFeedbackSchema = z.object({
  type: z.enum(["general", "order", "voucher", "complaint"]),
  subject: z
    .string()
    .min(10, "Tiêu đề phải có ít nhất 10 ký tự")
    .max(255, "Tiêu đề tối đa 255 ký tự"),
  message: z
    .string()
    .min(20, "Nội dung phải có ít nhất 20 ký tự")
    .max(1000, "Nội dung tối đa 1000 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  phone: z.string().max(15, "Số điện thoại không hợp lệ").optional(),
  orderId: z.coerce
    .number("orderId phải là số")
    .int()
    .positive()
    .optional(),
  voucherCode: z.string().max(50).optional(),
});

// ── Admin: List/Get/Update ───────────────────────────────────────────────────

export const listFeedbackQuery = z.object({
  status: z.enum(["Open", "InProgress", "Resolved", "Closed"]).optional(),
  type: z.enum(["general", "order", "voucher", "complaint"]).optional(),
  page: z.coerce.number("page phải là số").int().positive().optional().default(1),
  pageSize: z.coerce
    .number("pageSize phải là số")
    .int()
    .positive()
    .max(100)
    .optional()
    .default(20),
});

export const feedbackIdParam = z.object({
  feedbackId: z.coerce
    .number("feedbackId phải là số")
    .int()
    .positive("feedbackId phải lớn hơn 0"),
});

export type SubmitFeedbackInput = z.infer<typeof submitFeedbackSchema>;
export type ListFeedbackQuery = z.infer<typeof listFeedbackQuery>;
export type FeedbackIdParam = z.infer<typeof feedbackIdParam>;