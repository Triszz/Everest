/**
 * Category Schemas
 * --------------------------------------------------------------
 * Zod schemas cho validate query/params của Categories API.
 */
import { z } from "zod";

/** Params cho route /categories/:id — id là số nguyên dương. */
export const categoryIdParam = z.object({
  id: z.coerce.number("id phải là số").int().positive(),
});

/** Query cho route /categories/:id/vouchers */
export const categoryVoucherQuerySchema = z.object({
  page: z.coerce.number("page phải là số").int().positive().optional().default(1),
  limit: z.coerce
    .number("limit phải là số")
    .int()
    .positive()
    .max(100)
    .optional()
    .default(20),
  sort: z
    .enum(["price_asc", "price_desc", "popular", "newest"])
    .optional()
    .default("newest"),
});

export type CategoryIdParam = z.infer<typeof categoryIdParam>;
export type CategoryVoucherQuery = z.infer<typeof categoryVoucherQuerySchema>;