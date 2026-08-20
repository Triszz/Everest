/**
 * Review Schemas
 * --------------------------------------------------------------
 * Zod schemas cho Reviews API.
 */
import { z } from "zod";

/** Body cho POST /api/vouchers/:voucherId/reviews */
export const createReviewSchema = z.object({
  rating: z.coerce
    .number("rating phải là số")
    .int("rating phải là số nguyên")
    .min(1, "Rating phải từ 1 đến 5 sao")
    .max(5, "Rating phải từ 1 đến 5 sao"),
  comment: z
    .string()
    .min(10, "Bình luận phải có ít nhất 10 ký tự")
    .max(1000, "Bình luận tối đa 1000 ký tự"),
  issuedVoucherId: z.coerce
    .number("issuedVoucherId phải là số")
    .int()
    .positive()
    .optional(),
});

/** Params cho /:voucherId/reviews */
export const voucherIdParam = z.object({
  voucherId: z.coerce
    .number("voucherId phải là số")
    .int()
    .positive("voucherId phải lớn hơn 0"),
});

/** Query cho GET reviews */
export const listReviewsQuery = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(50).optional().default(10),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type VoucherIdParam = z.infer<typeof voucherIdParam>;
export type ListReviewsQuery = z.infer<typeof listReviewsQuery>;