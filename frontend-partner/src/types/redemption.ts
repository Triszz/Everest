/**
 * Voucher Validation Types
 * ============================================================
 * Types cho Partner Web Validate flow.
 * Dựa trên backend `/api/partner/redemption/*` đã có sẵn.
 */

// ── Trạng thái validate/confirm ────────────────────────────────────────────
export const RedemptionStatus = {
  VALID: "VALID",
  INVALID_CODE: "INVALID_CODE",
  NOT_FOUND: "NOT_FOUND",
  WRONG_PARTNER: "WRONG_PARTNER",
  NOT_APPROVED: "NOT_APPROVED",
  NOT_VISIBLE: "NOT_VISIBLE",
  NOT_STARTED: "NOT_STARTED",
  EXPIRED: "EXPIRED",
  ALREADY_USED: "ALREADY_USED",
  LOCKED: "LOCKED",
  PAYMENT_PENDING: "PAYMENT_PENDING",
  WRONG_BRANCH: "WRONG_BRANCH",
  CONFIRMED: "CONFIRMED",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const;
export type RedemptionStatus =
  (typeof RedemptionStatus)[keyof typeof RedemptionStatus];

// ── Branch info ────────────────────────────────────────────────────────────
export interface BranchInfo {
  branchId: number;
  branchName: string;
  address: string | null;
  phoneNumber: string | null;
}

// ── Validated voucher data (returned by /redemption/validate) ─────────────
export interface ValidatedVoucherData {
  issuedVoucherId: number;
  voucherCode: string;
  usageStatus: "Unused" | "Used" | "Expired" | "Locked";
  validFrom: string;
  validTo: string;
  usedAt: string | null;
  voucher: {
    title: string;
    description: string | null;
    imageUrl: string | null;
    partnerName: string;
  };
  applicableBranches: BranchInfo[];
  customer: {
    fullName: string | null;
    email: string;
    phoneNumber: string | null;
  };
}

// ── Responses ──────────────────────────────────────────────────────────────
export interface ValidateSuccessResponse {
  success: true;
  status: "VALID";
  canConfirm: true;
  data: ValidatedVoucherData;
  message: "Voucher hợp lệ";
}

export interface ValidateErrorResponse {
  success: false;
  status: RedemptionStatus;
  canConfirm: boolean;
  error: {
    code: RedemptionStatus;
    message: string;
  };
}

export type ValidateResponse = ValidateSuccessResponse | ValidateErrorResponse;

export interface ConfirmSuccessData {
  issuedVoucherId: number;
  voucherCode: string;
  usedAt: string;
  usedAtBranchId: number;
  /** Tên branch nơi voucher được xác nhận (optional — fallback lookup phía client nếu null) */
  branchName?: string | null;
}

export interface ConfirmSuccessResponse {
  success: true;
  status: "CONFIRMED";
  data: ConfirmSuccessData;
  message: "Xác nhận sử dụng voucher thành công";
}

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

// ── Status metadata cho UI ─────────────────────────────────────────────────
export interface StatusMeta {
  label: string;
  color: string;
  bgColor: string;
  canConfirm: boolean;
}

export const STATUS_META: Record<RedemptionStatus, StatusMeta> = {
  VALID: {
    label: "Hợp lệ",
    color: "#10B981",
    bgColor: "#ECFDF5",
    canConfirm: true,
  },
  INVALID_CODE: {
    label: "Mã không hợp lệ",
    color: "#DC2626",
    bgColor: "#FEF2F2",
    canConfirm: false,
  },
  NOT_FOUND: {
    label: "Không tìm thấy",
    color: "#DC2626",
    bgColor: "#FEF2F2",
    canConfirm: false,
  },
  WRONG_PARTNER: {
    label: "Không thuộc đối tác",
    color: "#DC2626",
    bgColor: "#FEF2F2",
    canConfirm: false,
  },
  NOT_APPROVED: {
    label: "Chưa duyệt",
    color: "#F59E0B",
    bgColor: "#FFFBEB",
    canConfirm: false,
  },
  NOT_VISIBLE: {
    label: "Đang ẩn",
    color: "#F59E0B",
    bgColor: "#FFFBEB",
    canConfirm: false,
  },
  NOT_STARTED: {
    label: "Chưa bắt đầu",
    color: "#F59E0B",
    bgColor: "#FFFBEB",
    canConfirm: false,
  },
  EXPIRED: {
    label: "Đã hết hạn",
    color: "#DC2626",
    bgColor: "#FEF2F2",
    canConfirm: false,
  },
  ALREADY_USED: {
    label: "Đã sử dụng",
    color: "#DC2626",
    bgColor: "#FEF2F2",
    canConfirm: false,
  },
  LOCKED: {
    label: "Đang khóa",
    color: "#DC2626",
    bgColor: "#FEF2F2",
    canConfirm: false,
  },
  PAYMENT_PENDING: {
    label: "Chưa thanh toán",
    color: "#F59E0B",
    bgColor: "#FFFBEB",
    canConfirm: false,
  },
  WRONG_BRANCH: {
    label: "Sai chi nhánh",
    color: "#F59E0B",
    bgColor: "#FFFBEB",
    canConfirm: false,
  },
  CONFIRMED: {
    label: "Đã xác nhận",
    color: "#10B981",
    bgColor: "#ECFDF5",
    canConfirm: false,
  },
  UNKNOWN_ERROR: {
    label: "Lỗi không xác định",
    color: "#DC2626",
    bgColor: "#FEF2F2",
    canConfirm: false,
  },
};