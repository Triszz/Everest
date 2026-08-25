/**
 * services/types.ts
 * ------------------------------------------------------------------
 * Tập trung toàn bộ TypeScript types / interfaces dùng chung.
 * Mỗi module con chỉ import type từ đây để tránh định nghĩa trùng.
 * ------------------------------------------------------------------
 */
import type { PaginationMeta } from "./http";

// Re-export PaginationMeta cho tiện.
export type { PaginationMeta };

// ── Voucher ─────────────────────────────────────────────────────────

/** Một voucher trả về từ backend (rút gọn cho list view). */
export interface Voucher {
  voucherId: number;
  title: string;
  description: string;
  originalPrice: string;
  salePrice: string;
  totalQuantity: number;
  availableQuantity: number;
  imageUrl: string | null;
  startDate: string;
  endDate: string;
  expiryDays: number;
  averageRating: number;
  reviewCount: number;
  /** BR-CUS-03: % giảm giá (đã tính sẵn ở backend). */
  discountPercent: number;
  partner: {
    partnerId: number;
    companyName: string;
  };
  category: {
    categoryId: number;
    categoryName: string;
  };
  /** BR-CUS-03: Danh sách chi nhánh áp dụng voucher (trả về từ getById). */
  voucherBranches?: Array<{
    branch: {
      branchId: number;
      branchName: string;
      address: string;
      city?: string | null;
      phoneNumber: string;
    };
  }>;
}

/** Query filter cho list voucher (BR-CUS-03 mở rộng). */
export interface VoucherQuery {
  search?: string;
  category_id?: number;
  category_ids?: number[];
  min_price?: number;
  max_price?: number;
  partner_id?: number;
  partner_name?: string;
  discount_min?: number;
  area?: string;
  sort?: "price_asc" | "price_desc" | "popular" | "newest";
  page?: number;
  limit?: number;
}

/** Query filter cho trang Category. */
export interface CategoryVoucherQuery {
  sort?: "price_asc" | "price_desc" | "popular" | "newest";
  page?: number;
  limit?: number;
}

/** Review của một voucher. */
export interface Review {
  reviewId: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  customer: {
    userId: string;
    fullName: string;
  };
}

/** Payload khi customer tạo/sửa review (B6). */
export interface ReviewPayload {
  rating: number;
  comment: string;
  issuedVoucherId?: number;
}

// ── Category & Partner ─────────────────────────────────────────────

export interface Category {
  categoryId: number;
  categoryName: string;
  description: string | null;
  voucherCount: number;
  /** Backend có thể trả thêm imageUrl (nếu có). */
  imageUrl?: string | null;
}

export interface Partner {
  partnerId: number;
  companyName: string;
  status: string;
}

// ── Content (banner / popup / post) ─────────────────────────────────

export interface Banner {
  bannerId: number;
  title: string;
  imageUrl: string;
  status: "Visible" | "Hidden";
}

export interface Popup {
  popupId: number;
  title: string;
  body: string;
  imageUrl: string | null;
  ctaLabel: string | null;
  ctaTargetUrl: string | null;
  status: "Visible" | "Hidden";
}

export interface Post {
  postId: number;
  title: string;
  content: string;
  imageUrl: string | null;
  createdAt: string;
  author: {
    userId: string;
    fullName: string;
    avatar: string | null;
  };
}

// ── Cart ────────────────────────────────────────────────────────────

export interface CartVoucher {
  voucherId: number;
  title: string;
  imageUrl: string | null;
  salePrice: number;
  originalPrice: number;
  availableQuantity: number;
  expiryDays: number;
  startDate: string;
  endDate: string;
  approvalStatus: string;
  displayStatus: string;
  partner: { partnerId: number; companyName: string };
  category: { categoryId: number; categoryName: string };
}

export interface CartItem {
  cartItemId: number;
  quantity: number;
  addedAt: string;
  voucher: CartVoucher;
}

export interface Cart {
  items: CartItem[];
  summary: {
    totalItems: number;
    totalAmount: number;
  };
}

// ── Auth ────────────────────────────────────────────────────────────

export interface User {
  userId: string;
  email: string;
  fullName: string;
  role: string;
  phoneNumber?: string;
  status: "Active" | "Inactive" | "Banned";
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  sessionId?: string;
}

export interface MeResponse {
  user: User;
}

// ── Order / IssuedVoucher ───────────────────────────────────────────

export type IssuedVoucherStatus = "Unused" | "Used" | "Expired" | "Locked" | "Cancelled";

export interface IssuedVoucher {
  issuedVoucherId: number;
  voucherCode: string;
  status: IssuedVoucherStatus;
  validFrom: string;
  validTo: string;
  usedAt: string | null;
  usedAtBranchId: number | null;
  hasReviewed?: boolean;
  isAvailable?: boolean;
  voucher?: {
    voucherId: number;
    title: string;
    imageUrl: string | null;
    expiryDays: number;
    partner?: string | { companyName: string };
  };
}

export interface OrderItem {
  orderItemId: number;
  voucherId: number;
  quantity: number;
  price: number;
  voucher?: {
    title: string;
    imageUrl: string | null;
    expiryDays: number;
    partner?: string | { companyName: string };
  };
  issuedVouchers?: IssuedVoucher[];
}

export interface OrderDetail {
  orderId: number;
  customerId: string;
  totalAmount: string | number;
  paymentMethod: string | null;
  paymentStatus: "Pending" | "Paid" | "Cancelled";
  isGift: boolean;
  receiverEmail: string | null;
  giftMessage: string | null;
  createdAt: string;
  updatedAt: string;
  expiresAt: string | null;
  orderItems: OrderItem[];
}

export interface OrderSummary {
  orderId: number;
  totalAmount: string | number;
  paymentMethod: string | null;
  paymentStatus: "Pending" | "Paid" | "Cancelled";
  createdAt: string;
  /** Null nếu đã thanh toán hoặc đã hủy. */
  expiresAt: string | null;
  itemCount: number;
}

export interface CreateOrderPayload {
  buyerInfo: { fullName: string; email: string; phone: string };
  items: { voucherId: number; quantity: number }[];
  sendAsGift?: boolean;
  receiverEmail?: string;
  giftMessage?: string;
}

export interface CreateOrderResponse {
  orderId: number;
  totalAmount: number;
  paymentStatus: "Pending" | "Paid" | "Cancelled";
  isGift: boolean;
  createdAt: string;
  /** ISO datetime khi đơn Pending hết hạn (now + 15 phút). */
  expiresAt: string | null;
  orderItems: OrderItem[];
}

export interface CheckoutResponse {
  orderId: number;
  paymentStatus: "Paid";
  paymentMethod: string;
  issuedVouchers: {
    issuedVoucherId: number;
    voucherCode: string;
    status: string;
    validFrom: string;
    validTo: string;
    voucher: {
      title: string;
      imageUrl: string | null;
      expiryDays: number;
      partner?: string;
    };
  }[];
}

// ── Payment (VNPAY) ───────────────────────────────────────────────

export interface CreatePaymentResponse {
  paymentUrl: string;
  orderId: number;
}

export interface PaymentReturnInfo {
  isSuccess: boolean;
  isVerified: boolean;
  orderId: number;
  message: string;
}

// ── Feedback ────────────────────────────────────────────────────────

export interface FeedbackPayload {
  type: "general" | "order" | "voucher" | "complaint";
  subject: string;
  orderId?: string;
  voucherCode?: string;
  message: string;
  email: string;
  phone?: string;
}

export interface FeedbackSubmitResponse {
  ticketId: string;
  feedbackId: number;
  status: string;
  createdAt: string;
}

// ── Notification ────────────────────────────────────────────────────

export type NotificationType =
  | "ORDER_PURCHASED"
  | "ORDER_PAID"
  | "VOUCHER_GIFT_RECEIVED"
  | "VOUCHER_EXPIRING"
  | "SYSTEM";

export interface Notification {
  notificationId: number;
  type: NotificationType;
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  status: "Unread" | "Read";
  createdAt: string;
}

export interface NotificationListResponse {
  notifications: Notification[];
  unreadCount: number;
  pagination: PaginationMeta;
}
