export type Role = "Admin" | "Customer" | "Partner_Owner" | "Partner_Cashier";
export type AccountStatus = "Active" | "Banned";
export type PartnerStatus = "Pending" | "Approved" | "Rejected";
export type VoucherApprovalStatus =
  | "Draft"
  | "Pending"
  | "Approved"
  | "Rejected";
export type VoucherDisplayStatus = "Visible" | "Hidden";
export type PaymentStatus = "Pending" | "Paid" | "Cancelled";
export type VoucherUsageStatus = "Unused" | "Used" | "Expired" | "Locked";

export interface JwtPayload {
  userId: string; // UUID
  email: string;
  role: Role;
  partnerId?: number; // Partner_Owner và Partner_Cashier
  branchId?: number; // Partner_Cashier only
  sessionId?: string; // current session ID (UUID)
}

export type AuditActor = Pick<JwtPayload, "userId" | "role"> & {
  actorType?: "ADMIN" | "CUSTOMER" | "PARTNER";
};

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
