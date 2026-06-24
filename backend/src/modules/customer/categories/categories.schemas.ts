import { z } from "zod";

const coerceToNumber = (errorMsg: string) =>
  z.string().pipe(
    z.string().transform((val) => {
      const num = parseInt(val, 10);
      if (isNaN(num)) throw new Error(errorMsg);
      return num;
    })
  );

export const categoryIdParam = z.object({
  id: coerceToNumber("id phải là số"),
});

export const categoryVoucherQuerySchema = z.object({
  page: coerceToNumber("page phải là số dương").refine((val) => val > 0).optional().default(1),
  limit: coerceToNumber("limit phải là số dương").refine((val) => val > 0 && val <= 100).optional().default(20),
  sort: z
    .enum(["price_asc", "price_desc", "popular", "newest"])
    .optional()
    .default("newest"),
});

export type CategoryIdParam = z.infer<typeof categoryIdParam>;
export type CategoryVoucherQuery = z.infer<typeof categoryVoucherQuerySchema>;
