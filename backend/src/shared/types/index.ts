// Enums dùng chung toàn hệ thống — Nhân và Bảo import file này
export type Role = "CUSTOMER" | "PARTNER" | "ADMIN";

export type VoucherStatus =
  | "DRAFT" // mới tạo, chưa gửi duyệt
  | "PENDING" // đã gửi, chờ admin duyệt
  | "APPROVED" // admin duyệt, chưa đến ngày bán
  | "ON_SALE" // đang bán
  | "SUSPENDED" // bị tạm dừng
  | "EXPIRED"; // hết hạn bán

export type VoucherType = "PERCENTAGE_DISCOUNT" | "FIXED_AMOUNT";

export type OrderStatus = "PENDING" | "PAID" | "CANCELLED";

export type VoucherCodeStatus = "ISSUED" | "USED" | "EXPIRED";

export type PartnerStatus = "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";

// Envelope chuẩn mọi API response
export interface ApiSuccess<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: { code: string; message: string };
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;
