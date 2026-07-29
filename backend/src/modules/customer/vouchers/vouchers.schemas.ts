import { z } from "zod";

const coerceToNumber = (errorMsg: string) =>
  z.string().pipe(
    z.string().transform((val) => {
      const num = parseInt(val, 10);
      if (isNaN(num)) throw new Error(errorMsg);
      return num;
    })
  );

const coerceToFloat = (errorMsg: string) =>
  z.string().pipe(
    z.string().transform((val) => {
      const num = parseFloat(val);
      if (isNaN(num)) throw new Error(errorMsg);
      return num;
    })
  );

export const voucherQuerySchema = z.object({
  search: z.string().optional(),
  category_id: coerceToNumber("category_id phải là số").optional(),
  category_ids: z
    .string()
    .transform((val) => {
      const nums = val
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
        .map((s) => {
          const n = parseInt(s, 10);
          if (isNaN(n)) throw new Error("category_ids phải là danh sách số, phân cách bằng dấu phẩy");
          return n;
        });
      return nums.length > 0 ? nums : undefined;
    })
    .optional(),
  min_price: coerceToFloat("min_price không hợp lệ").optional(),
  max_price: coerceToFloat("max_price không hợp lệ").optional(),
  // ── BR-CUS-03: Mở rộng search ─────────────────────────────────
  partner_id: coerceToNumber("partner_id phải là số").optional(),
  partner_name: z.string().optional(),
  discount_min: coerceToNumber("discount_min phải là số").optional(),
  area: z.string().optional(),
  // ───────────────────────────────────────────────────────────────
  sort: z
    .enum(["price_asc", "price_desc", "popular", "newest"])
    .optional()
    .default("newest"),
  page: coerceToNumber("page phải là số dương").refine((val) => val > 0).optional().default(1),
  limit: coerceToNumber("limit phải là số dương").refine((val) => val > 0 && val <= 100).optional().default(20),
});

export const voucherIdParam = z.object({
  id: coerceToNumber("id phải là số"),
});

export const reviewQuerySchema = z.object({
  page: coerceToNumber("page phải là số dương").refine((val) => val > 0).optional().default(1),
  limit: coerceToNumber("limit phải là số dương").refine((val) => val > 0 && val <= 100).optional().default(10),
});

export type VoucherQuery = z.infer<typeof voucherQuerySchema>;
export type VoucherIdParam = z.infer<typeof voucherIdParam>;
export type ReviewQuery = z.infer<typeof reviewQuerySchema>;
