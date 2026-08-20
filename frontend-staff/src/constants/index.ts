/**
 * App Constants
 * ============================================================
 * Tái xuất từ env.ts và định nghĩa các constants khác
 */

// Re-export từ env
export { ENV } from "./env";
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000/api";

// ============================================================
// Storage Keys
// ============================================================
export const STORAGE_KEYS = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
  USER_DATA: "user_data",
} as const;

// ============================================================
// Role constants (matching backend)
// ============================================================
export const PARTNER_ROLES = {
  OWNER: "Partner_Owner",
  CASHIER: "Partner_Cashier",
} as const;

// ============================================================
// Redemption Status mapping
// ============================================================
export const STATUS_CONFIG = {
  VALID: {
    badge: "success" as const,
    color: "#10B981",
    bgColor: "#ECFDF5",
    label: "Hợp lệ",
    canConfirm: true,
  },
  INVALID_CODE: {
    badge: "danger" as const,
    color: "#DC2626",
    bgColor: "#FEF2F2",
    label: "Mã không hợp lệ",
    canConfirm: false,
  },
  NOT_FOUND: {
    badge: "danger" as const,
    color: "#DC2626",
    bgColor: "#FEF2F2",
    label: "Không tìm thấy",
    canConfirm: false,
  },
  WRONG_PARTNER: {
    badge: "danger" as const,
    color: "#DC2626",
    bgColor: "#FEF2F2",
    label: "Không thuộc đối tác",
    canConfirm: false,
  },
  NOT_APPROVED: {
    badge: "warning" as const,
    color: "#F59E0B",
    bgColor: "#FFFBEB",
    label: "Chưa duyệt",
    canConfirm: false,
  },
  NOT_VISIBLE: {
    badge: "warning" as const,
    color: "#F59E0B",
    bgColor: "#FFFBEB",
    label: "Đang ẩn",
    canConfirm: false,
  },
  NOT_STARTED: {
    badge: "warning" as const,
    color: "#F59E0B",
    bgColor: "#FFFBEB",
    label: "Chưa bắt đầu",
    canConfirm: false,
  },
  EXPIRED: {
    badge: "danger" as const,
    color: "#DC2626",
    bgColor: "#FEF2F2",
    label: "Đã hết hạn",
    canConfirm: false,
  },
  ALREADY_USED: {
    badge: "danger" as const,
    color: "#DC2626",
    bgColor: "#FEF2F2",
    label: "Đã sử dụng",
    canConfirm: false,
  },
  LOCKED: {
    badge: "danger" as const,
    color: "#DC2626",
    bgColor: "#FEF2F2",
    label: "Đang khóa",
    canConfirm: false,
  },
  PAYMENT_PENDING: {
    badge: "warning" as const,
    color: "#F59E0B",
    bgColor: "#FFFBEB",
    label: "Chưa thanh toán",
    canConfirm: false,
  },
  WRONG_BRANCH: {
    badge: "warning" as const,
    color: "#F59E0B",
    bgColor: "#FFFBEB",
    label: "Sai chi nhánh",
    canConfirm: false,
  },
  CONFIRMED: {
    badge: "success" as const,
    color: "#10B981",
    bgColor: "#ECFDF5",
    label: "Đã xác nhận",
    canConfirm: false,
  },
  UNKNOWN_ERROR: {
    badge: "danger" as const,
    color: "#DC2626",
    bgColor: "#FEF2F2",
    label: "Lỗi không xác định",
    canConfirm: false,
  },
} as const;

// ============================================================
// Query Keys for React Query
// ============================================================
export const QUERY_KEYS = {
  REDEMPTION: {
    VALIDATE: ["redemption", "validate"] as const,
    HISTORY: ["redemption", "history"] as const,
    DETAIL: (code: string) => ["redemption", "detail", code] as const,
  },
  AUTH: {
    PROFILE: ["auth", "profile"] as const,
  },
} as const;

// ============================================================
// Navigation Routes
// ============================================================
export const NAV_ROUTES = {
  AUTH: {
    LOGIN: "/(auth)/login",
  },
  APP: {
    HOME: "/(app)/home",
    SCAN: "/(app)/scan",
    MANUAL: "/(app)/manual",
    HISTORY: "/(app)/history",
  },
} as const;

// ============================================================
// Validation Rules
// ============================================================
export const VALIDATION = {
  EMAIL: {
    MIN_LENGTH: 5,
    MAX_LENGTH: 100,
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  PASSWORD: {
    MIN_LENGTH: 6,
    MAX_LENGTH: 100,
  },
} as const;
