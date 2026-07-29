const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// ── Token Refresh Mechanism ───────────────────────────────────────────────────
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

const subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = localStorage.getItem("refresh_token");
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    const json = await res.json();
    if (json.success && json.data?.accessToken) {
      localStorage.setItem("access_token", json.data.accessToken);
      return json.data.accessToken;
    }
  } catch {
    // Refresh failed
  }
  return null;
};

/**
 * Fetch wrapper với auto-refresh token khi nhận 401
 */
const authFetch = async (url: string, options: RequestInit & { auth?: boolean } = {}): Promise<Response> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  // Attach auth token
  if (options.auth) {
    const token = localStorage.getItem("access_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  let response = await fetch(url, { ...options, headers });

  // Handle 401 - attempt token refresh
  if (response.status === 401) {
    if (!isRefreshing) {
      isRefreshing = true;
      const newToken = await refreshAccessToken();
      isRefreshing = false;

      if (newToken) {
        onTokenRefreshed(newToken);
        // Retry with new token
        headers["Authorization"] = `Bearer ${newToken}`;
        response = await fetch(url, { ...options, headers });
      } else {
        // Refresh failed - clear tokens and redirect
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
      }
    } else {
      // Another refresh in progress, wait
      await new Promise<string>((resolve) => {
        subscribeTokenRefresh(resolve);
      });
      const newToken = localStorage.getItem("access_token")!;
      headers["Authorization"] = `Bearer ${newToken}`;
      response = await fetch(url, { ...options, headers });
    }
  }

  return response;
};

const handleResponse = async <T>(res: Response): Promise<T> => {
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error?.message || "API Error");
  }
  return json;
};

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
  // ── BR-CUS-03 ───────────────────────────────────────────────
  discountPercent: number;
  // ─────────────────────────────────────────────────────────────
  partner: {
    partnerId: number;
    companyName: string;
  };
  category: {
    categoryId: number;
    categoryName: string;
  };
}

export interface Partner {
  partnerId: number;
  companyName: string;
  status: string;
}

export interface Category {
  categoryId: number;
  categoryName: string;
  description: string | null;
  voucherCount: number;
}

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

export interface VoucherQuery {
  search?: string;
  category_id?: number;
  category_ids?: number[];
  min_price?: number;
  max_price?: number;
  // ── BR-CUS-03: Mở rộng search ─────────────────────────────────
  partner_id?: number;
  partner_name?: string;
  discount_min?: number;
  area?: string;
  // ───────────────────────────────────────────────────────────────
  sort?: "price_asc" | "price_desc" | "popular" | "newest";
  page?: number;
  limit?: number;
}

export interface CategoryVoucherQuery {
  sort?: "price_asc" | "price_desc" | "popular" | "newest";
  page?: number;
  limit?: number;
}

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
  publishedAt: string | null;
  author: {
    userId: string;
    fullName: string;
    avatar: string | null;
  };
}

// Cart Types
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
  partner: {
    partnerId: number;
    companyName: string;
  };
  category: {
    categoryId: number;
    categoryName: string;
  };
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

// Auth Types
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

export const voucherApi = {
  list: async (params?: VoucherQuery) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v === undefined || v === null) return;
        if (Array.isArray(v)) {
          if (v.length === 0) return;
          query.set(k, v.join(","));
        } else {
          query.set(k, String(v));
        }
      });
    }
    const res = await authFetch(`${BASE_URL}/vouchers?${query}`, { auth: true });
    const json = await handleResponse<{ success: boolean; vouchers: Voucher[]; pagination: PaginationMeta }>(res);
    return { ...json, data: json.vouchers };
  },

  getFeatured: async () => {
    const res = await authFetch(`${BASE_URL}/vouchers/featured`, { auth: true });
    return handleResponse<{ success: boolean; data: Voucher[] }>(res);
  },

  getById: async (id: number) => {
    const res = await authFetch(`${BASE_URL}/vouchers/${id}`, { auth: true });
    return handleResponse<{ success: boolean; data: Voucher }>(res);
  },

  getReviews: async (id: number, page = 1, limit = 10) => {
    const res = await authFetch(`${BASE_URL}/vouchers/${id}/reviews?page=${page}&limit=${limit}`, { auth: true });
    const json = await handleResponse<{ success: boolean; reviews: Review[]; pagination: PaginationMeta }>(res);
    return { ...json, data: json.reviews };
  },
};

export const categoryApi = {
  list: async () => {
    const res = await authFetch(`${BASE_URL}/categories`, { auth: true });
    return handleResponse<{ success: boolean; data: Category[] }>(res);
  },

  getById: async (id: number) => {
    const res = await authFetch(`${BASE_URL}/categories/${id}`, { auth: true });
    return handleResponse<{ success: boolean; data: Category }>(res);
  },

  getVouchers: async (id: number, params?: CategoryVoucherQuery) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) query.set(k, String(v));
      });
    }
    const res = await authFetch(`${BASE_URL}/categories/${id}/vouchers?${query}`, { auth: true });
    return handleResponse<{
      success: boolean;
      category: Category;
      vouchers: Voucher[];
      pagination: PaginationMeta;
    }>(res);
  },
};

// ── BR-CUS-03: Partner list for filter dropdown ───────────────────────────
export const partnerApi = {
  list: async () => {
    // Public endpoint — không cần auth
    const res = await fetch(`${BASE_URL}/partners`);
    return handleResponse<{ success: boolean; data: Partner[] }>(res);
  },
};

export const bannerApi = {
  list: async () => {
    const res = await fetch(`${BASE_URL}/banners`);
    return handleResponse<{ success: boolean; data: Banner[] }>(res);
  },
};

export const popupApi = {
  getActive: async () => {
    const res = await fetch(`${BASE_URL}/popups/active`);
    return handleResponse<{ success: boolean; data: Popup | null }>(res);
  },
};

export const postApi = {
  list: async (params?: { page?: number; limit?: number }) => {
    const qs = params
      ? "?" +
        Object.entries(params)
          .filter(([, v]) => v !== undefined && v !== null)
          .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
          .join("&")
      : "";
    const res = await fetch(`${BASE_URL}/posts${qs}`);
    return handleResponse<{
      success: boolean;
      data: { items: Post[]; total: number; page: number; limit: number; totalPages: number };
    }>(res);
  },
  getById: async (postId: number) => {
    const res = await fetch(`${BASE_URL}/posts/${postId}`);
    return handleResponse<{ success: boolean; data: Post }>(res);
  },
};

export const cartApi = {
  getCart: async () => {
    const res = await authFetch(`${BASE_URL}/cart`, { auth: true });
    return handleResponse<{ success: boolean; data: Cart }>(res);
  },

  addToCart: async (voucherId: number, quantity: number) => {
    const res = await authFetch(`${BASE_URL}/cart/items`, {
      method: "POST",
      auth: true,
      body: JSON.stringify({ voucher_id: voucherId, quantity }),
    });
    return handleResponse<{ success: boolean; data: { message: string; item: CartItem } }>(res);
  },

  updateCartItem: async (itemId: number, quantity: number) => {
    const res = await authFetch(`${BASE_URL}/cart/items/${itemId}`, {
      method: "PUT",
      auth: true,
      body: JSON.stringify({ quantity }),
    });
    return handleResponse<{ success: boolean; data: { message: string; item: CartItem } }>(res);
  },

  removeCartItem: async (itemId: number) => {
    const res = await authFetch(`${BASE_URL}/cart/items/${itemId}`, {
      method: "DELETE",
      auth: true,
    });
    return handleResponse<{ success: boolean; data: { message: string } }>(res);
  },

  clearCart: async () => {
    const res = await authFetch(`${BASE_URL}/cart`, {
      method: "DELETE",
      auth: true,
    });
    return handleResponse<{ success: boolean; data: { message: string } }>(res);
  },

  /**
   * Áp mã giảm giá vào đơn hàng.
   * POST /api/customer/orders/apply-code
   * Body: { code: string }
   */
  applyCode: async (code: string) => {
    const res = await authFetch(`${BASE_URL}/customer/orders/apply-code`, {
      method: "POST",
      auth: true,
      body: JSON.stringify({ code }),
    });
    return handleResponse<{ success: boolean; data: { discount: number; code: string } }>(res);
  },
};

export const authApi = {
  login: async (email: string, password: string) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse<{ success: boolean; data: AuthResponse }>(res);
  },

  register: async (data: { email: string; password: string; fullName: string; phoneNumber?: string }) => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse<{ success: boolean; data: AuthResponse }>(res);
  },

  me: async () => {
    const res = await authFetch(`${BASE_URL}/auth/me`, { auth: true });
    return handleResponse<{ success: boolean; data: MeResponse }>(res);
  },

  refresh: async (refreshToken: string) => {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    return handleResponse<{ success: boolean; data: AuthResponse }>(res);
  },

  /**
   * B4: POST /api/auth/forgot-password
   * Luôn trả về success=true (tránh user enumeration)
   */
  forgotPassword: async (email: string) => {
    const res = await fetch(`${BASE_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    return handleResponse<{ success: boolean; message?: string }>(res);
  },

  /**
   * B9: POST /api/auth/sessions/:sessionId/revoke — Đăng xuất 1 phiên
   */
  revokeSession: async (sessionId: string) => {
    const res = await authFetch(`${BASE_URL}/auth/sessions/${sessionId}/revoke`, {
      method: "POST",
      auth: true,
    });
    return handleResponse<{ success: boolean; message?: string }>(res);
  },

  /**
   * B9: POST /api/auth/sessions/revoke-all — Đăng xuất tất cả phiên khác
   */
  revokeAllOtherSessions: async () => {
    const res = await authFetch(`${BASE_URL}/auth/sessions/revoke-all`, {
      method: "POST",
      auth: true,
    });
    return handleResponse<{ success: boolean; message?: string }>(res);
  },
};

export const profileApi = {
  getProfile: async () => {
    const res = await authFetch(`${BASE_URL}/customer/profile/me`, { auth: true });
    return handleResponse<{ success: boolean; data: User }>(res);
  },

  updateProfile: async (data: { fullName?: string; phoneNumber?: string | null }) => {
    const res = await authFetch(`${BASE_URL}/customer/profile/me`, {
      method: "PUT",
      auth: true,
      body: JSON.stringify(data),
    });
    return handleResponse<{ success: boolean; data: User; message: string }>(res);
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    const res = await authFetch(`${BASE_URL}/customer/profile/password`, {
      method: "PUT",
      auth: true,
      body: JSON.stringify(data),
    });
    return handleResponse<{ success: boolean; data: null; message: string }>(res);
  },

  /**
   * B10: PUT /api/customer/notifications/preferences
   * Body: { n1?: boolean, n2?: boolean, ..., n9?: boolean }
   */
  updateNotificationPrefs: async (prefs: Record<string, boolean>) => {
    const res = await authFetch(`${BASE_URL}/customer/notifications/preferences`, {
      method: "PUT",
      auth: true,
      body: JSON.stringify(prefs),
    });
    return handleResponse<{ success: boolean; data: Record<string, boolean>; message: string }>(res);
  },

  /**
   * B10: GET /api/customer/notifications/preferences
   */
  getNotificationPrefs: async () => {
    const res = await authFetch(`${BASE_URL}/customer/notifications/preferences`, { auth: true });
    return handleResponse<{ success: boolean; data: Record<string, boolean> }>(res);
  },
};

// ── Order / IssuedVoucher Types ───────────────────────────────────────────────

export interface IssuedVoucher {
  issuedVoucherId: number;
  voucherCode: string;
  status: "Unused" | "Used" | "Expired" | "Locked" | "Cancelled";
  validFrom: string;
  validTo: string;
  usedAt: string | null;
  usedAtBranchId: number | null;
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
  orderItems: OrderItem[];
}

// Còn lại code cũ dùng `items` — alias để không vỡ
export interface OrderDetailLegacy extends Omit<OrderDetail, "orderItems"> {
  items: OrderItem[];
}

export interface OrderSummary {
  orderId: number;
  totalAmount: string | number;
  paymentMethod: string | null;
  paymentStatus: "Pending" | "Paid" | "Cancelled";
  createdAt: string;
  itemCount: number;
}

// ── Order API ─────────────────────────────────────────────────────────────────

// Input shape for createOrder
export interface CreateOrderPayload {
  buyerInfo: { fullName: string; email: string; phone: string };
  items: { voucherId: number; quantity: number }[];
  sendAsGift?: boolean;
}

// Response from POST /customer/orders
export interface CreateOrderResponse {
  orderId: number;
  totalAmount: number;
  paymentStatus: "Pending" | "Paid" | "Cancelled";
  isGift: boolean;
  createdAt: string;
  orderItems: OrderItem[];
}

// Response from POST /customer/orders/:id/checkout
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

export const orderApi = {
  /**
   * Tạo đơn hàng (trạng thái Pending).
   * Body: { buyerInfo, items[], sendAsGift? }
   */
  create: async (payload: CreateOrderPayload) => {
    const res = await authFetch(`${BASE_URL}/customer/orders`, {
      method: "POST",
      auth: true,
      body: JSON.stringify(payload),
    });
    return handleResponse<{ success: boolean; data: CreateOrderResponse }>(res);
  },

  /**
   * Thanh toán đơn hàng (mô phỏng).
   * Body: { paymentMethod: "atm" | "momo" | "visa" }
   * Sau khi thanh toán thành công → sinh IssuedVoucher.
   */
  checkout: async (orderId: number, body: { paymentMethod: string }) => {
    const res = await authFetch(`${BASE_URL}/customer/orders/${orderId}/checkout`, {
      method: "POST",
      auth: true,
      body: JSON.stringify(body),
    });
    return handleResponse<{ success: boolean; data: CheckoutResponse }>(res);
  },

  /**
   * Lấy chi tiết 1 đơn hàng.
   * Nếu đã thanh toán → items chứa issuedVouchers.
   */
  getById: async (orderId: number) => {
    const res = await authFetch(`${BASE_URL}/customer/orders/${orderId}`, { auth: true });
    return handleResponse<{ success: boolean; data: OrderDetail }>(res);
  },

  /**
   * Lấy lịch sử đơn hàng của user hiện tại.
   * Query: ?page=1&pageSize=10
   */
  listMine: async (params?: { page?: number; pageSize?: number }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.pageSize) query.set("pageSize", String(params.pageSize));
    const res = await authFetch(`${BASE_URL}/customer/orders?${query}`, { auth: true });
    return handleResponse<{
      success: boolean;
      data: OrderSummary[];
      pagination: PaginationMeta;
    }>(res);
  },

  /**
   * Hủy đơn hàng (chỉ khi trạng thái Pending).
   */
  cancel: async (orderId: number) => {
    const res = await authFetch(`${BASE_URL}/customer/orders/${orderId}/cancel`, {
      method: "POST",
      auth: true,
    });
    return handleResponse<{ success: boolean; data: { orderId: number; paymentStatus: string }; message: string }>(res);
  },

  /**
   * Lấy danh sách voucher đã mua (IssuedVoucher).
   * Query: ?page=1&pageSize=20&status=Unused
   */
  listIssuedVouchers: async (params?: { page?: number; pageSize?: number; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.pageSize) query.set("pageSize", String(params.pageSize));
    if (params?.status) query.set("status", params.status);
    const res = await authFetch(`${BASE_URL}/customer/issued-vouchers?${query}`, { auth: true });
    return handleResponse<{
      success: boolean;
      data: IssuedVoucher[];
      pagination: PaginationMeta;
    }>(res);
  },
};

// ── Feedback API ─────────────────────────────────────────────────────────────────

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

export const feedbackApi = {
  /**
   * Submit a feedback/khiếu nại.
   * POST /api/feedback — public endpoint (guests can also submit).
   */
  submit: async (payload: FeedbackPayload) => {
    const res = await fetch(`${BASE_URL}/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return handleResponse<{ success: boolean; data: FeedbackSubmitResponse }>(res);
  },
};

// ── Review API ─────────────────────────────────────────────────────────────────

export interface ReviewPayload {
  rating: number;
  comment: string;
  issuedVoucherId?: number;
}

export const reviewApi = {
  /**
   * B6: POST /api/vouchers/:id/reviews
   * Tạo / cập nhật đánh giá voucher.
   */
  create: async (voucherId: number, payload: ReviewPayload) => {
    const res = await authFetch(`${BASE_URL}/vouchers/${voucherId}/reviews`, {
      method: "POST",
      auth: true,
      body: JSON.stringify(payload),
    });
    return handleResponse<{
      success: boolean;
      data: { reviewId: number; rating: number; comment: string; updated: boolean };
    }>(res);
  },
};
