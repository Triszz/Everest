/**
 * Redemption Schemas
 * ------------------------------------------------
 * Định nghĩa enum, Zod schema, và type cho Validate và Confirm API.
 * KHÔNG chứa business logic.
 */

import { z } from "zod";

// ============================================================
// ENUMS
// ============================================================

/**
 * Trạng thái kiểm tra voucher — dùng chung cho Validate và Confirm.
 * Frontend map status → message.
 */
export const RedemptionStatus = {
  /** Voucher hợp lệ, có thể xác nhận sử dụng */
  VALID: "VALID",
  /** Format voucher code không đúng */
  INVALID_CODE: "INVALID_CODE",
  /** Không tìm thấy voucher với mã này */
  NOT_FOUND: "NOT_FOUND",
  /** Voucher không thuộc Partner đang đăng nhập */
  WRONG_PARTNER: "WRONG_PARTNER",
  /** Voucher chưa được Admin duyệt */
  NOT_APPROVED: "NOT_APPROVED",
  /** Voucher đang bị ẩn (không hiển thị) */
  NOT_VISIBLE: "NOT_VISIBLE",
  /** Voucher chưa đến ngày bắt đầu */
  NOT_STARTED: "NOT_STARTED",
  /** Voucher đã hết hạn */
  EXPIRED: "EXPIRED",
  /** Voucher đã được sử dụng */
  ALREADY_USED: "ALREADY_USED",
  /** Voucher đang bị khóa */
  LOCKED: "LOCKED",
  /** Đơn hàng chưa thanh toán */
  PAYMENT_PENDING: "PAYMENT_PENDING",
  /** Branch hiện tại không nằm trong danh sách áp dụng */
  WRONG_BRANCH: "WRONG_BRANCH",
  /** Lỗi không xác định */
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
  /** Confirm thành công (chỉ dùng trong confirm response) */
  CONFIRMED: "CONFIRMED",
} as const;

export type RedemptionStatus =
  (typeof RedemptionStatus)[keyof typeof RedemptionStatus];

/** Những status cho phép confirm */
export const CONFIRMABLE_STATUSES = new Set<RedemptionStatus>([
  RedemptionStatus.VALID,
]);

/** Những status KHÔNG cho phép confirm */
export const NON_CONFIRMABLE_STATUSES = new Set<RedemptionStatus>([
  RedemptionStatus.ALREADY_USED,
  RedemptionStatus.LOCKED,
  RedemptionStatus.EXPIRED,
  RedemptionStatus.NOT_APPROVED,
  RedemptionStatus.NOT_VISIBLE,
  RedemptionStatus.WRONG_BRANCH,
  RedemptionStatus.PAYMENT_PENDING,
  RedemptionStatus.NOT_FOUND,
  RedemptionStatus.WRONG_PARTNER,
  RedemptionStatus.NOT_STARTED,
  RedemptionStatus.INVALID_CODE,
  RedemptionStatus.UNKNOWN_ERROR,
]);

// ============================================================
// ZOD INPUT SCHEMA
// ============================================================

export const validateVoucherSchema = z.object({
  /** Mã voucher — ví dụ: EVR-X8A4-KP72 */
  voucherCode: z
    .string()
    .min(1, "Mã voucher không được để trống")
    .max(50, "Mã voucher quá dài"),
});

export const confirmVoucherSchema = z.object({
  /** Mã voucher — ví dụ: EVR-X8A4-KP72 */
  voucherCode: z
    .string()
    .min(1, "Mã voucher không được để trống")
    .max(50, "Mã voucher quá dài"),
  /**
   * Branch ID được chọn để confirm (tùy chọn).
   * Nếu không cung cấp và là Owner (không có branchId trong JWT),
   * hệ thống sẽ dùng branch đầu tiên trong VoucherBranch.
   * Bắt buộc nếu là Cashier.
   */
  selectedBranchId: z.number().int().positive().optional(),
});

// ============================================================
// RESPONSE TYPES
// ============================================================

/** Thông tin branch đầy đủ trong response */
export interface BranchInfo {
  branchId: number;
  branchName: string;
  address: string | null;
  phoneNumber: string | null;
}

/** Thông tin voucher trả về khi VALID */
export interface ValidatedVoucherData {
  /** ID của issued voucher */
  issuedVoucherId: number;
  /** Mã voucher */
  voucherCode: string;
  /** Trạng thái sử dụng */
  usageStatus: "Unused" | "Used" | "Expired" | "Locked";
  /** Ngày bắt đầu hiệu lực */
  validFrom: string;
  /** Ngày hết hạn */
  validTo: string;
  /** Ngày đã sử dụng (null nếu chưa dùng) */
  usedAt: string | null;
  /**
   * Branch ID nơi voucher đã được sử dụng.
   * - Validate response: chỉ set khi voucher đang ở trạng thái "Used" (history view).
   * - Confirm response: set ngay sau khi xác nhận thành công (chắc chắn có giá trị).
   * - Validate response cho voucher "Unused": undefined.
   */
  usedAtBranchId?: number | null;
  /**
   * Tên branch nơi voucher đã sử dụng (chỉ set khi usedAtBranchId được set).
   */
  usedAtBranchName?: string | null;
  /** Thông tin voucher */
  voucher: {
    title: string;
    description: string | null;
    imageUrl: string | null;
    partnerName: string;
  };
  /** Danh sách branch được áp dụng — đầy đủ info */
  applicableBranches: BranchInfo[];
  /** Thông tin khách hàng */
  customer: {
    fullName: string | null;
    email: string;
    phoneNumber: string | null;
  };
}

/** Response khi validate thất bại */
export interface ValidateErrorResponse {
  success: false;
  status: RedemptionStatus;
  canConfirm: false;
  error: {
    code: RedemptionStatus;
    message: string;
  };
}

/** Response khi validate thành công */
export interface ValidateSuccessResponse {
  success: true;
  status: "VALID";
  canConfirm: true;
  data: ValidatedVoucherData;
  message: "Voucher hợp lệ";
}

export type ValidateResponse = ValidateSuccessResponse | ValidateErrorResponse;

/** Response khi confirm thành công */
export interface ConfirmSuccessResponse {
  success: true;
  status: "CONFIRMED";
  data: {
    issuedVoucherId: number;
    voucherCode: string;
    usedAt: string;
    usedAtBranchId: number;
    /** Tên branch nơi voucher được xác nhận (optional, có thể null nếu lookup fail) */
    branchName?: string | null;
  };
  message: "Xác nhận sử dụng voucher thành công";
}

/** Response khi confirm thất bại */
export interface ConfirmErrorResponse {
  success: false;
  status: RedemptionStatus;
  canConfirm: false;
  error: {
    code: RedemptionStatus;
    message: string;
  };
}

export type ConfirmResponse = ConfirmSuccessResponse | ConfirmErrorResponse;

// ============================================================
// INTERNAL TYPES (service dùng)
// ============================================================

/**
 * Kết quả trả về từ hàm validateVoucherForRedemption.
 * Chứa đầy đủ data để:
 * - Controller serialize thành response
 * - Phase 5 confirmVoucher() tái sử dụng mà không cần query lại
 */
export interface ValidateVoucherResult {
  /** true nếu hợp lệ */
  isValid: boolean;
  /** Trạng thái — VALID hoặc mã lỗi */
  status: RedemptionStatus;
  /** Message để trả về client */
  message: string;
  /** Data khi isValid = true */
  data?: ValidatedVoucherData;
  /** Raw Prisma data — internal, dùng cho Confirm */
  internal?: {
    issued: {
      issuedVoucherId: number;
      voucherCode: string;
      status: string;
      validFrom: Date;
      validTo: Date;
      usedAt: Date | null;
      usedAtBranchId: number | null;
      orderItemId: number;
    };
    voucher: {
      voucherId: number;
      partnerId: number;
      title: string;
      approvalStatus: string;
      displayStatus: string;
      voucherBranches: BranchInfo[];
    };
    partner: {
      partnerId: number;
      companyName: string;
    };
    order: {
      paymentStatus: string;
      customerId: string;
    };
    customer: {
      fullName: string | null;
      email: string;
      phoneNumber: string | null;
    };
  };
}

/** Context auth từ JWT */
export interface AuthContext {
  userId: string;
  role: "Partner_Owner" | "Partner_Cashier";
  partnerId: number;
  branchId?: number;
}
