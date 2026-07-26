import { z } from "zod";

const coerceToNumber = (msg: string) => z.coerce.number(msg);

export const createReviewSchema = z.object({
  rating: coerceToNumber("rating phải là số").int("rating phải là số nguyên").refine(
    (val) => val >= 1 && val <= 5,
    { message: "Rating phải từ 1 đến 5 sao" }
  ),
  comment: z
    .string()
    .min(10, "Bình luận phải có ít nhất 10 ký tự")
    .max(1000, "Bình luận tối đa 1000 ký tự"),
  issuedVoucherId: z
    .coerce
    .number("issuedVoucherId phải là số")
    .int()
    .positive()
    .optional(),
});

export const voucherIdParam = z.object({
  voucherId: coerceToNumber("voucherId phải là số").int("voucherId phải là số nguyên").positive("voucherId phải lớn hơn 0"),
});

export const listReviewsQuery = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(50).optional().default(10),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type VoucherIdParam = z.infer<typeof voucherIdParam>;
export type ListReviewsQuery = z.infer<typeof listReviewsQuery>;
