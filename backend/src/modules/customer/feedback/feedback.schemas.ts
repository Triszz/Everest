import { z } from "zod";

const FEEDBACK_TYPES = ["general", "order", "voucher", "complaint"] as const;
const STATUS_VALUES = ["Open", "InProgress", "Resolved", "Closed"] as const;

// ── Submit feedback ─────────────────────────────────────────────────────────────

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
  phone: z
    .string()
    .max(15, "Số điện thoại không hợp lệ")
    .optional(),
  orderId: z.coerce
    .number("orderId phải là số")
    .int("orderId phải là số nguyên")
    .positive("orderId phải lớn hơn 0")
    .optional(),
  voucherCode: z
    .string()
    .max(50, "Mã voucher tối đa 50 ký tự")
    .optional(),
});

// ── List (admin) ───────────────────────────────────────────────────────────────

export const listFeedbackQuery = z.object({
  status: z.enum(STATUS_VALUES).optional(),
  type: z.enum(FEEDBACK_TYPES).optional(),
  page: z.coerce.number("page phải là số").int().positive().optional().default(1),
  pageSize: z
    .coerce
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

// ── Types ─────────────────────────────────────────────────────────────────────

export type SubmitFeedbackInput = z.infer<typeof submitFeedbackSchema>;
export type ListFeedbackQuery = z.infer<typeof listFeedbackQuery>;
export type FeedbackIdParam = z.infer<typeof feedbackIdParam>;
