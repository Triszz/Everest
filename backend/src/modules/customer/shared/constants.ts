/**
 * Shared constants cho customer modules.
 *
 * Gom các select field trùng lặp giữa nhiều service (prisma `select`/`include`)
 * và các enum string constants để tránh typo.
 */
import type { Prisma } from "../../../generated/prisma/client";

// ── Common Prisma selects ─────────────────────────────────────────────────────

/**
 * Select tối thiểu cho thông tin voucher hiển thị trong danh sách.
 * Dùng cho cart, orders, issued-vouchers, reviews, ...
 */
export const VOUCHER_LIST_SELECT = {
  voucherId: true,
  title: true,
  imageUrl: true,
  salePrice: true,
  originalPrice: true,
  availableQuantity: true,
  expiryDays: true,
  startDate: true,
  endDate: true,
  approvalStatus: true,
  displayStatus: true,
} satisfies Prisma.VoucherSelect;

/**
 * Include của partner (chỉ các trường cần cho customer UI).
 */
export const PARTNER_MINI_INCLUDE = {
  partnerId: true,
  companyName: true,
} satisfies Prisma.PartnerSelect;

/**
 * Include của category (chỉ các trường cần cho customer UI).
 */
export const CATEGORY_MINI_INCLUDE = {
  categoryId: true,
  categoryName: true,
} satisfies Prisma.CategorySelect;

/**
 * Select thông tin customer kèm theo review.
 */
export const CUSTOMER_MINI_SELECT = {
  userId: true,
  fullName: true,
} satisfies Prisma.UserSelect;

/**
 * Default where clause cho voucher hiển thị trên customer UI
 * (đã duyệt, đang hiển thị, còn hàng, đang trong thời gian bán).
 */
export const VISIBLE_VOUCHER_WHERE = (now: Date = new Date()): Prisma.VoucherWhereInput => ({
  approvalStatus: "Approved",
  displayStatus: "Visible",
  availableQuantity: { gt: 0 },
  startDate: { lte: now },
  endDate: { gte: now },
});

// ── Status enums (string literal types) ───────────────────────────────────────

export const PAYMENT_STATUS = ["Pending", "Paid", "Cancelled"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUS)[number];

export const ISSUED_VOUCHER_STATUS = ["Unused", "Used", "Expired", "Locked", "Cancelled"] as const;
export type IssuedVoucherStatus = (typeof ISSUED_VOUCHER_STATUS)[number];

export const FEEDBACK_TYPES = ["general", "order", "voucher", "complaint"] as const;
export type FeedbackType = (typeof FEEDBACK_TYPES)[number];

export const FEEDBACK_STATUSES = ["Open", "InProgress", "Resolved", "Closed"] as const;
export type FeedbackStatus = (typeof FEEDBACK_STATUSES)[number];