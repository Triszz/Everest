/**
 * utils/format.ts
 * ------------------------------------------------------------------
 * Tập trung các hàm format hiển thị.
 *
 *  - `formatPrice(p)`         : "100000" → "100.000đ"
 *  - `formatDate(s)`          : ISO date → "dd/mm/yyyy"
 *  - `formatDateTime(s)`      : ISO datetime → "dd/mm/yyyy HH:mm"
 *  - `formatDiscount(p, o)`   : Tính % giảm giá.
 *  - `truncate(s, n)`         : Cắt chuỗi với dấu "…".
 */
import type { IssuedVoucherStatus, OrderSummary } from "../services";

/** Format giá tiền VND. */
export function formatPrice(p: string | number): string {
  return Number(p).toLocaleString("vi-VN") + "đ";
}

/** Format ngày (ISO string) thành dd/mm/yyyy. */
export function formatDate(s: string): string {
  return new Date(s).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/** Format ngày + giờ. */
export function formatDateTime(s: string): string {
  return new Date(s).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Tính % giảm giá từ giá gốc + giá bán. */
export function formatDiscount(sale: number, original: number): number {
  if (!original || original <= 0) return 0;
  return Math.round((1 - sale / original) * 100);
}

/** Cắt chuỗi nếu dài quá n ký tự. */
export function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

/** Map trạng thái IssuedVoucher → label tiếng Việt + màu. */
export const ISSUED_STATUS_LABELS: Record<IssuedVoucherStatus, { label: string; color: string; bg: string }> = {
  Unused:    { label: "Chưa dùng",  color: "#10B981", bg: "#ECFDF5" },
  Used:      { label: "Đã dùng",    color: "#64748B", bg: "#F1F5F9" },
  Expired:   { label: "Hết hạn",    color: "#EF4444", bg: "#FEE2E2" },
  Locked:    { label: "Đang khoá",  color: "#F59E0B", bg: "#FEF3C7" },
  Cancelled: { label: "Đã huỷ",     color: "#EF4444", bg: "#FEE2E2" },
};

/** Map trạng thái thanh toán đơn hàng → label + màu. */
export const PAYMENT_STATUS_LABELS: Record<OrderSummary["paymentStatus"], { label: string; color: string; bg: string }> = {
  Pending:   { label: "Chờ thanh toán", color: "#F59E0B", bg: "#FEF3C7" },
  Paid:      { label: "Đã thanh toán",  color: "#10B981", bg: "#ECFDF5" },
  Cancelled: { label: "Đã huỷ",         color: "#EF4444", bg: "#FEE2E2" },
};