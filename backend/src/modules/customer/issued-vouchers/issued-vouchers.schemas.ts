import { z } from "zod";

export const issuedVouchersQuery = z.object({
  status: z
    .enum(["Unused", "Used", "Expired", "Locked", ""])
    .optional()
    .transform((v) => v || undefined),
  page: z.coerce.number("page phải là số").int().positive().optional().default(1),
  pageSize: z.coerce
    .number("pageSize phải là số")
    .int()
    .positive()
    .max(100)
    .optional()
    .default(20),
});

export const issuedVoucherIdParam = z.object({
  issuedVoucherId: z.coerce.number("id phải là số").int().positive(),
});

export type IssuedVouchersQuery = z.infer<typeof issuedVouchersQuery>;
export type IssuedVoucherIdParam = z.infer<typeof issuedVoucherIdParam>;
