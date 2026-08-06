/**
 * Issued Voucher Schemas
 * --------------------------------------------------------------
 * Zod schemas cho IssuedVouchers API (voucher đã mua của customer).
 */
import { z } from "zod";

/** Query cho GET /api/customer/issued-vouchers */
export const issuedVouchersQuery = z.object({
  status: z
    .enum(["Unused", "Used", "Expired", "Locked", "Cancelled", ""])
    .optional()
    .transform((v) => (v ? v : undefined)),
  page: z.coerce.number("page phải là số").int().positive().optional().default(1),
  pageSize: z.coerce
    .number("pageSize phải là số")
    .int()
    .positive()
    .max(100)
    .optional()
    .default(20),
});

/** Params cho /:issuedVoucherId */
export const issuedVoucherIdParam = z.object({
  issuedVoucherId: z.coerce.number("id phải là số").int().positive(),
});

export type IssuedVouchersQuery = z.infer<typeof issuedVouchersQuery>;
export type IssuedVoucherIdParam = z.infer<typeof issuedVoucherIdParam>;