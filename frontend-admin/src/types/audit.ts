export type AuditActorType = "ADMIN" | "CUSTOMER" | "PARTNER";

export type AuditTargetType =
  | "USER"
  | "PARTNER"
  | "BRANCH"
  | "CATEGORY"
  | "VOUCHER"
  | "POLICY"
  | "BANNER"
  | "POPUP"
  | "POST"
  | "ORDER";

export interface AuditLogActor {
  userId: string;
  fullName: string;
  email: string;
  avatar: string | null;
}

export interface AuditLog {
  logId: string;
  actorId: string | null;
  actorType: AuditActorType;
  action: string;
  targetType: AuditTargetType | null;
  targetId: string | null;
  description: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  actor: AuditLogActor | null;
}

export interface AuditLogsResponse {
  data: AuditLog[];
  actions: string[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AuditLogFilters {
  page?: number;
  limit?: number;
  action?: string;
  actorId?: string;
  actorType?: AuditActorType;
  targetType?: AuditTargetType;
  targetId?: string;
  fromDate?: string;
  toDate?: string;
}

export const AUDIT_ACTIONS: Array<{ value: string; label: string }> = [
  { value: "LOGIN", label: "Đăng nhập" },
  { value: "LOGOUT", label: "Đăng xuất" },
  { value: "UPDATE_USER_STATUS", label: "Khóa/Mở tài khoản" },
  { value: "UPDATE_USER_ROLE", label: "Đổi quyền user" },
  { value: "APPROVE_PARTNER", label: "Duyệt đối tác" },
  { value: "REJECT_PARTNER", label: "Từ chối đối tác" },
  { value: "LOCK_PARTNER", label: "Khóa/Mở đối tác" },
  { value: "LOCK_BRANCH", label: "Khóa/Mở chi nhánh" },
  { value: "CREATE_VOUCHER", label: "Tạo voucher" },
  { value: "SUBMIT_VOUCHER", label: "Gửi duyệt voucher" },
  { value: "APPROVE_VOUCHER", label: "Duyệt voucher" },
  { value: "REJECT_VOUCHER", label: "Từ chối voucher" },
  { value: "SET_VOUCHER_DISPLAY", label: "Hiện/Ẩn voucher" },
  { value: "UPDATE_VOUCHER_DATES", label: "Cập nhật ngày voucher" },
  { value: "EXPIRE_VOUCHER", label: "Hết hạn voucher" },
  { value: "CANCEL_ORDER", label: "Hủy đơn" },
  { value: "REFUND_ORDER", label: "Hoàn tiền" },
  { value: "MARK_ORDER_PAID", label: "Đánh dấu thanh toán" },
  { value: "CREATE_ORDER", label: "Tạo đơn" },
  { value: "PAY_ORDER", label: "Thanh toán đơn" },
];

export const AUDIT_ACTOR_TYPE_LABELS: Record<AuditActorType, string> = {
  ADMIN: "Quản trị viên",
  CUSTOMER: "Khách hàng",
  PARTNER: "Đối tác",
};

export const AUDIT_TARGET_TYPE_LABELS: Record<AuditTargetType, string> = {
  USER: "Người dùng",
  PARTNER: "Đối tác",
  BRANCH: "Chi nhánh",
  CATEGORY: "Danh mục",
  VOUCHER: "Voucher",
  POLICY: "Chính sách",
  BANNER: "Banner",
  POPUP: "Popup",
  POST: "Bài viết",
  ORDER: "Đơn hàng",
};