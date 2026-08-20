export type AuditActorType = "ADMIN" | "SYSTEM" | "CUSTOMER" | "PARTNER";

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
  | "ORDER"
  | "ADMIN";

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
  { value: "TOGGLE_PARTNER_LOCK", label: "Khóa/Mở đối tác" },
  { value: "CREATE_BRANCH", label: "Tạo chi nhánh" },
  { value: "UPDATE_BRANCH", label: "Cập nhật chi nhánh" },
  { value: "DELETE_BRANCH", label: "Xóa chi nhánh" },
  { value: "TOGGLE_BRANCH_LOCK", label: "Khóa/Mở chi nhánh" },
  { value: "CREATE_CATEGORY", label: "Tạo danh mục" },
  { value: "UPDATE_CATEGORY", label: "Sửa danh mục" },
  { value: "DELETE_CATEGORY", label: "Xóa danh mục" },
  { value: "APPROVE_VOUCHER", label: "Duyệt voucher" },
  { value: "REJECT_VOUCHER", label: "Từ chối voucher" },
  { value: "TOGGLE_VOUCHER_DISPLAY", label: "Ẩn/Hiện voucher" },
  { value: "DELETE_VOUCHER", label: "Xóa voucher" },
  { value: "UPSERT_POLICY", label: "Lưu chính sách" },
  { value: "DELETE_POLICY", label: "Xóa chính sách" },
  { value: "CREATE_BANNER", label: "Tạo banner" },
  { value: "UPDATE_BANNER", label: "Sửa banner" },
  { value: "UPDATE_BANNER_STATUS", label: "Bật/Tắt banner" },
  { value: "DELETE_BANNER", label: "Xóa banner" },
  { value: "CREATE_POPUP", label: "Tạo popup" },
  { value: "UPDATE_POPUP", label: "Sửa popup" },
  { value: "UPDATE_POPUP_STATUS", label: "Bật/Tắt popup" },
  { value: "DELETE_POPUP", label: "Xóa popup" },
  { value: "CREATE_POST", label: "Tạo bài viết" },
  { value: "UPDATE_POST", label: "Sửa bài viết" },
  { value: "UPDATE_POST_STATUS", label: "Đăng/Ẩn bài viết" },
  { value: "DELETE_POST", label: "Xóa bài viết" },
  { value: "CANCEL_ORDER", label: "Hủy đơn" },
  { value: "REFUND_ORDER", label: "Hoàn tiền" },
  { value: "CREATE_ORDER", label: "Tạo đơn" },
  { value: "PAY_ORDER", label: "Thanh toán đơn" },
];

export const AUDIT_ACTOR_TYPE_LABELS: Record<AuditActorType, string> = {
  ADMIN: "Quản trị viên",
  SYSTEM: "Hệ thống",
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
  ADMIN: "Admin",
};