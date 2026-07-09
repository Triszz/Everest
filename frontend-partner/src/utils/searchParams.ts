import { z } from "zod";

/**
 * Search params cho trang Voucher Create.
 *
 * - `branch` (optional): id của branch sẽ được preselect khi mở form.
 *   Phải là số nguyên dương. Nếu invalid (chuỗi, số âm, v.v.) thì bị
 *   bỏ qua — form sẽ mở bình thường nhưng không preselect gì.
 */
export const voucherCreateSearchParamsSchema = z.object({
  branch: z
    .string()
    .regex(/^\d+$/, "branch phải là số nguyên dương")
    .transform((v) => Number(v))
    .pipe(z.number().int().positive())
    .optional(),
});

export type VoucherCreateSearchParams = z.infer<
  typeof voucherCreateSearchParamsSchema
>;

/**
 * Parse `URLSearchParams` thành object đã validated. Mọi param không khớp
 * schema sẽ bị bỏ qua thay vì ném lỗi — tránh UX xấu khi user gõ URL
 * sai tay hoặc share link cũ.
 */
export function parseVoucherCreateSearchParams(
  searchParams: URLSearchParams,
): VoucherCreateSearchParams {
  const raw: Record<string, string> = {};
  // Use `forEach` (always present on the DOM URLSearchParams interface) instead
  // of `.entries()` / `for...of`. Both of those depend on a secondary interface
  // declaration that isn't reliably visible in every TypeScript lib version.
  searchParams.forEach((value, key) => {
    raw[key] = value;
  });
  const result = voucherCreateSearchParamsSchema.safeParse(raw);
  return result.success ? result.data : {};
}
