/**
 * Voucher Schemas
 * --------------------------------------------------------------
 * Zod schemas cho validate query/params của Vouchers API.
 *
 * Hỗ trợ filter theo: search, category (id hoặc nhiều id), price range,
 * partner, area (city/province), discount min %.
 */
import { z } from "zod";

const intFromString = (errorMsg: string) =>
  z
    .string()
    .transform((val) => {
      const num = parseInt(val, 10);
      if (isNaN(num)) throw new Error(errorMsg);
      return num;
    });

const floatFromString = (errorMsg: string) =>
  z
    .string()
    .transform((val) => {
      const num = parseFloat(val);
      if (isNaN(num)) throw new Error(errorMsg);
      return num;
    });

/** Query cho GET /api/vouchers — list + filter + sort + paginate. */
export const voucherQuerySchema = z.object({
  search: z.string().optional(),
  category_id: intFromString("category_id phải là số").optional(),
  category_ids: z
    .string()
    .transform((val) => {
      const nums = val
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
        .map((s) => {
          const n = parseInt(s, 10);
          if (isNaN(n)) {
            throw new Error("category_ids phải là danh sách số, phân cách bằng dấu phẩy");
          }
          return n;
        });
      return nums.length > 0 ? nums : undefined;
    })
    .optional(),
  min_price: floatFromString("min_price không hợp lệ").optional(),
  max_price: floatFromString("max_price không hợp lệ").optional(),
  // BR-CUS-03: Mở rộng search
  partner_id: intFromString("partner_id phải là số").optional(),
  partner_name: z.string().optional(),
  discount_min: intFromString("discount_min phải là số").optional(),
  area: z.string().optional(),
  // BR-CUS-03: Filter theo trạng thái hiệu lực
  // - "available": Còn hàng (available_quantity > 0)
  // - "selling": Đang trong thời gian bán (start_date <= now <= end_date)
  // - "expiring_soon": Sắp hết hạn (còn ≤ 3 ngày)
  validity_status: z.enum(["available", "selling", "expiring_soon"]).optional(),
  sort: z
    .enum(["price_asc", "price_desc", "popular", "newest"])
    .optional()
    .default("newest"),
  page: intFromString("page phải là số dương")
    .refine((val) => val > 0, { message: "page phải > 0" })
    .optional()
    .default(1),
  limit: intFromString("limit phải là số dương")
    .refine((val) => val > 0 && val <= 100, { message: "limit phải trong (0, 100]" })
    .optional()
    .default(50),
});

/** Query cho GET /api/vouchers/:voucherId/reviews */
export const reviewQuerySchema = z.object({
  page: intFromString("page phải là số dương")
    .refine((val) => val > 0)
    .optional()
    .default(1),
  limit: intFromString("limit phải là số dương")
    .refine((val) => val > 0 && val <= 100)
    .optional()
    .default(10),
});

/** Params cho /:id hoặc /:voucherId — trả về number, ít nhất 1 trong 2 phải có. */
export const voucherOptionalIdParam = z
  .object({
    id: intFromString("id phải là số").optional(),
    voucherId: intFromString("voucherId phải là số").optional(),
  })
  .refine((v) => v.id !== undefined || v.voucherId !== undefined, {
    message: "Phải truyền id hoặc voucherId",
  })
  .transform((v) => v.voucherId ?? v.id!);

export type VoucherQuery = z.infer<typeof voucherQuerySchema>;
export type ReviewQuery = z.infer<typeof reviewQuerySchema>;
export type VoucherIdFromParam = number;