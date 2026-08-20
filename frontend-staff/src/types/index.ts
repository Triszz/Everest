// ============================================================
// Types
// ============================================================

// API Response types (matching backend)
export interface ApiSuccess<T> {
  success: true;
  status?: string;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  status?: string;
  error: {
    code: string;
    message: string;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponseUser {
  userId: string;
  email: string;
  fullName: string;
  role: "Partner_Owner" | "Partner_Cashier";
  status: string;
  partnerId: number | null;
}

/**
 * Response payload từ POST /auth/login
 * (backend wrap trong ApiSuccess<{user, accessToken, refreshToken}>)
 */
export interface LoginResponse {
  user: LoginResponseUser;
  accessToken: string;
  refreshToken: string;
}

export interface User {
  userId: string;
  email: string;
  role: "Partner_Owner" | "Partner_Cashier";
  partnerId?: number;
  branchId?: number;
  fullName?: string;
  partnerName?: string;
  branchName?: string;
}

// Redemption types
export type RedemptionStatusCode =
  | "VALID"
  | "INVALID_CODE"
  | "NOT_FOUND"
  | "WRONG_PARTNER"
  | "NOT_APPROVED"
  | "NOT_VISIBLE"
  | "NOT_STARTED"
  | "EXPIRED"
  | "ALREADY_USED"
  | "LOCKED"
  | "PAYMENT_PENDING"
  | "WRONG_BRANCH"
  | "CONFIRMED"
  | "UNKNOWN_ERROR";

export interface BranchInfo {
  branchId: number;
  branchName: string;
  address: string | null;
  phoneNumber: string | null;
}

export interface VoucherInfo {
  title: string;
  description: string | null;
  imageUrl: string | null;
  partnerName: string;
}

export interface CustomerInfo {
  fullName: string | null;
  email: string;
  phoneNumber: string | null;
}

export interface ValidatedVoucherData {
  issuedVoucherId: number;
  voucherCode: string;
  usageStatus: "Unused" | "Used" | "Expired" | "Locked";
  validFrom: string;
  validTo: string;
  usedAt: string | null;
  voucher: VoucherInfo;
  applicableBranches: BranchInfo[];
  customer: CustomerInfo;
}

export interface ValidateSuccessResponse extends ApiSuccess<ValidatedVoucherData> {
  success: true;
  status: "VALID";
  canConfirm: true;
}

export interface ValidateErrorResponse extends ApiError {
  success: false;
  status: RedemptionStatusCode;
  canConfirm: false;
}

export type ValidateResponse = ValidateSuccessResponse | ValidateErrorResponse;

export interface ConfirmSuccessData {
  issuedVoucherId: number;
  voucherCode: string;
  usedAt: string;
  usedAtBranchId: number;
}

export interface ConfirmSuccessResponse extends ApiSuccess<ConfirmSuccessData> {
  success: true;
  status: "CONFIRMED";
}

export type ConfirmResponse = ConfirmSuccessResponse | ValidateErrorResponse;

// History types
export interface RedemptionHistoryItem {
  issuedVoucherId: number;
  voucherCode: string;
  voucherTitle: string;
  customerName: string | null;
  customerEmail: string;
  usedAt: string;
  usedAtBranchId: number;
  branchName: string;
  status: string;
}

export interface HistoryQuery {
  page?: number;
  limit?: number;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface HistoryPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface HistoryListResponse {
  success: true;
  data: RedemptionHistoryItem[];
  pagination: HistoryPagination;
}

// Dashboard types
export interface TodaySummary {
  confirmedCount: number;
  pendingCount: number;
  lastConfirmedAt: string | null;
}
