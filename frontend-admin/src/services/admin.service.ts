import { get, post, patch, del, put } from './api-client';

// ── Helpers ─────────────────────────────────────────────────────────────────
const buildQueryString = (params?: Record<string, any>): string => {
  if (!params) return '';
  const qs = Object.entries(params)
    .filter(([_, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
  return qs ? `?${qs}` : '';
};

// ── Types & Interfaces ──────────────────────────────────────────────────────
export type UserRole = 'Admin' | 'Customer' | 'Partner_Owner' | 'Partner_Cashier';
export type AccountStatus = 'Active' | 'Banned';
export type PartnerStatus = 'Pending' | 'Approved' | 'Rejected';

export interface UserResponse {
  userId: string;
  email: string;
  phoneNumber: string | null;
  fullName: string;
  role: UserRole;
  status: AccountStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PartnerResponse {
  partnerId: number;
  companyName: string;
  taxCode: string;
  businessLicenseUrl: string | null;
  status: PartnerStatus;
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PartnerLockResponse {
  partner: PartnerResponse;
  affected: {
    branches: number;
    cashiers: number;
  };
}

export interface BranchResponse {
  branchId: number;
  partnerId: number;
  cashierId: string | null;
  branchName: string;
  address: string;
  city: string | null;
  phoneNumber: string | null;
  isLocked: boolean;
  createdAt: string;
  updatedAt?: string;
  cashier?: { userId: string; fullName: string; email: string; status: string } | null;
  partner?: { partnerId: number; companyName: string } | null;
}

export interface BranchDetailResponse extends BranchResponse {
  cashier: { userId: string; fullName: string; email: string; status: string } | null;
  partner: { partnerId: number; companyName: string; status: string } | null;
}

export interface CategoryResponse {
  categoryId: number;
  categoryName: string;
  description: string | null;
  voucherCount?: number;
}

export interface VoucherResponse {
  voucherId: number;
  partnerId: number;
  categoryId: number;
  title: string;
  description: string | null;
  originalPrice: string | number;
  salePrice: string | number;
  applicationCondition: string | null;
  totalQuantity: number;
  availableQuantity: number;
  imageUrl: string | null;
  startDate: string;
  endDate: string;
  expiryDays: number;
  approvalStatus: 'Draft' | 'Pending' | 'Approved' | 'Rejected';
  displayStatus: 'Visible' | 'Hidden';
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedList<T> {
  list: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ApiPaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ── Users API ───────────────────────────────────────────────────────────────
export const adminUsersApi = {
  list(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: UserRole;
    status?: AccountStatus;
  }): Promise<PaginatedList<UserResponse>> {
    return get<ApiPaginatedResponse<UserResponse>>(
      `/api/admin/users${buildQueryString(params)}`,
      { auth: true },
    ).then((res) => {
      const { data, pagination } = res.data;
      return {
        list: data,
        total: pagination.total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: pagination.totalPages,
      };
    });
  },

  getById(userId: string): Promise<UserResponse> {
    return get<UserResponse>(`/api/admin/users/${userId}`, { auth: true }).then(
      (res) => res.data,
    );
  },

  updateStatus(userId: string, status: AccountStatus): Promise<UserResponse> {
    return patch<UserResponse>(
      `/api/admin/users/${userId}/status`,
      { status },
      { auth: true },
    ).then((res) => res.data);
  },

  updateRole(userId: string, role: UserRole): Promise<UserResponse> {
    return patch<UserResponse>(
      `/api/admin/users/${userId}/role`,
      { role },
      { auth: true },
    ).then((res) => res.data);
  },
};

// ── Partners API ────────────────────────────────────────────────────────────
export const adminPartnersApi = {
  list(params?: {
    page?: number;
    limit?: number;
    search?: string;
    searchField?: 'companyName' | 'partnerId' | 'phoneNumber' | 'email';
    status?: PartnerStatus;
    isLocked?: boolean;
  }): Promise<PaginatedList<PartnerResponse>> {
    return get<{ data: PartnerResponse[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>(
      `/api/admin/partners${buildQueryString(params)}`,
      { auth: true },
    ).then((res) => ({
      list: res.data.data,
      total: res.data.pagination.total,
      page: res.data.pagination.page,
      limit: res.data.pagination.limit,
      totalPages: res.data.pagination.totalPages,
    }));
  },

  getById(partnerId: number): Promise<PartnerResponse> {
    return get<PartnerResponse>(`/api/admin/partners/${partnerId}`, {
      auth: true,
    }).then((res) => res.data);
  },

  approve(partnerId: number, body?: { note?: string }): Promise<PartnerResponse> {
    return post<PartnerResponse>(
      `/api/admin/partners/${partnerId}/approve`,
      body || {},
      { auth: true },
    ).then((res) => res.data);
  },

  reject(partnerId: number, body: { reason: string }): Promise<PartnerResponse> {
    return post<PartnerResponse>(
      `/api/admin/partners/${partnerId}/reject`,
      body,
      { auth: true },
    ).then((res) => res.data);
  },

  toggleLock(
    partnerId: number,
    body: { locked: boolean; reason?: string },
  ): Promise<PartnerLockResponse> {
    return patch<PartnerLockResponse>(
      `/api/admin/partners/${partnerId}/lock`,
      body,
      { auth: true },
    ).then((res) => res.data);
  },
};

// ── Branches API ────────────────────────────────────────────────────────────
export const adminBranchesApi = {
  // Cross-partner list (for /branches page)
  listAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    isLocked?: boolean;
    partnerId?: number;
  }): Promise<PaginatedList<BranchResponse>> {
    return get<{ data: BranchResponse[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>(
      `/api/admin/branches${buildQueryString(params)}`,
      { auth: true },
    ).then((res) => ({
      list: res.data.data,
      total: res.data.pagination.total,
      page: res.data.pagination.page,
      limit: res.data.pagination.limit,
      totalPages: res.data.pagination.totalPages,
    }));
  },

  // Per-partner list
  list(
    partnerId: number,
    params?: {
      page?: number;
      limit?: number;
      search?: string;
      isLocked?: boolean;
    },
  ): Promise<PaginatedList<BranchResponse>> {
    return get<{ data: BranchResponse[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>(
      `/api/admin/partners/${partnerId}/branches${buildQueryString(params)}`,
      { auth: true },
    ).then((res) => ({
      list: res.data.data,
      total: res.data.pagination.total,
      page: res.data.pagination.page,
      limit: res.data.pagination.limit,
      totalPages: res.data.pagination.totalPages,
    }));
  },

  getById(partnerId: number, branchId: number): Promise<BranchDetailResponse> {
    return get<BranchDetailResponse>(
      `/api/admin/partners/${partnerId}/branches/${branchId}`,
      { auth: true },
    ).then((res) => res.data);
  },

  getByIdSimple(branchId: number): Promise<BranchDetailResponse> {
    // Uses top-level endpoint if needed — for now we always use partnerId
    return get<BranchDetailResponse>(
      `/api/admin/branches/${branchId}`,
      { auth: true },
    ).then((res) => res.data).catch(() =>
      // Fallback: try via first partner (admin should always know partnerId)
      Promise.reject(new Error('Cần partnerId để lấy chi tiết chi nhánh'))
    );
  },

  create(
    partnerId: number,
    body: { branchName: string; address: string; city: string; phoneNumber?: string },
  ): Promise<BranchResponse> {
    return post<BranchResponse>(
      `/api/admin/partners/${partnerId}/branches`,
      body,
      { auth: true },
    ).then((res) => res.data);
  },

  update(
    partnerId: number,
    branchId: number,
    body: { branchName?: string; address?: string; city?: string; phoneNumber?: string | null },
  ): Promise<BranchResponse> {
    return patch<BranchResponse>(
      `/api/admin/partners/${partnerId}/branches/${branchId}`,
      body,
      { auth: true },
    ).then((res) => res.data);
  },

  delete(
    partnerId: number,
    branchId: number,
    body?: { reason?: string },
  ): Promise<null> {
    return del<null>(
      `/api/admin/partners/${partnerId}/branches/${branchId}`,
      undefined,
      { auth: true, headers: body ? { 'x-reason': encodeURIComponent(body.reason || '') } : undefined },
    ).then((res) => res.data);
  },

  toggleLock(
    partnerId: number,
    branchId: number,
    body: { locked: boolean },
  ): Promise<BranchResponse> {
    return patch<BranchResponse>(
      `/api/admin/partners/${partnerId}/branches/${branchId}/lock`,
      body,
      { auth: true },
    ).then((res) => res.data);
  },
};

// ── Categories API ──────────────────────────────────────────────────────────
export const adminCategoriesApi = {
  list(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<PaginatedList<CategoryResponse>> {
    return get<{ data: CategoryResponse[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>(
      `/api/admin/categories${buildQueryString(params)}`,
      { auth: true },
    ).then((res) => ({
      list: res.data.data,
      total: res.data.pagination.total,
      page: res.data.pagination.page,
      limit: res.data.pagination.limit,
      totalPages: res.data.pagination.totalPages,
    }));
  },

  getById(categoryId: number): Promise<CategoryResponse> {
    return get<CategoryResponse>(`/api/admin/categories/${categoryId}`, {
      auth: true,
    }).then((res) => res.data);
  },

  create(body: { categoryName: string; description?: string }): Promise<CategoryResponse> {
    return post<CategoryResponse>('/api/admin/categories', body, {
      auth: true,
    }).then((res) => res.data);
  },

  update(
    categoryId: number,
    body: { categoryName?: string; description?: string | null },
  ): Promise<CategoryResponse> {
    return patch<CategoryResponse>(
      `/api/admin/categories/${categoryId}`,
      body,
      { auth: true },
    ).then((res) => res.data);
  },

  delete(categoryId: number): Promise<null> {
    return del<null>(`/api/admin/categories/${categoryId}`, undefined, {
      auth: true,
    }).then((res) => res.data);
  },
};

// ── Vouchers API ────────────────────────────────────────────────────────────
export interface VoucherStatsResponse {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  totalIssued: number;
  totalUsed: number;
}

export const adminVouchersApi = {
  list(params?: {
    page?: number;
    limit?: number;
    search?: string;
    searchField?: 'title' | 'voucherId';
    categoryId?: number;
    partnerId?: number;
    approvalStatus?: string;
  }): Promise<PaginatedList<VoucherResponse>> {
    return get<ApiPaginatedResponse<VoucherResponse>>(
      `/api/admin/vouchers${buildQueryString(params)}`,
      { auth: true },
    ).then((res) => {
      const { data, pagination } = res.data;
      return {
        list: data,
        total: pagination.total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: pagination.totalPages,
      };
    });
  },

  getStats(): Promise<VoucherStatsResponse> {
    return get<VoucherStatsResponse>('/api/admin/vouchers/stats', { auth: true }).then(
      (res) => res.data,
    );
  },

  setDisplayStatus(
    voucherId: number,
    body: { displayStatus: "Visible" | "Hidden" },
  ): Promise<VoucherResponse> {
    return patch<VoucherResponse>(
      `/api/admin/vouchers/${voucherId}/display`,
      body,
      { auth: true },
    ).then((res) => res.data);
  },

  updateDates(voucherId: number, body: { endDate: string }): Promise<Partial<VoucherResponse>> {
    return patch<Partial<VoucherResponse>>(
      `/api/admin/vouchers/${voucherId}/dates`,
      body,
      { auth: true },
    ).then((res) => res.data);
  },

  expireNow(voucherId: number): Promise<Partial<VoucherResponse>> {
    return post<Partial<VoucherResponse>>(
      `/api/admin/vouchers/${voucherId}/expire`,
      undefined,
      { auth: true },
    ).then((res) => res.data);
  },

  approve(voucherId: number, body?: { note?: string }): Promise<VoucherResponse> {
    return post<VoucherResponse>(
      `/api/admin/vouchers/${voucherId}/approve`,
      body || {},
      { auth: true },
    ).then((res) => res.data);
  },

  reject(voucherId: number, body: { reason: string }): Promise<VoucherResponse> {
    return post<VoucherResponse>(
      `/api/admin/vouchers/${voucherId}/reject`,
      body,
      { auth: true },
    ).then((res) => res.data);
  },

  toggleLock(voucherId: number, body: { locked: boolean }): Promise<VoucherResponse> {
    return patch<VoucherResponse>(
      `/api/admin/vouchers/${voucherId}/lock`,
      body,
      { auth: true },
    ).then((res) => res.data);
  },
};

// ─── Policy API ─────────────────────────────────────────────────────────────────

export interface PolicyResponse {
  policyId: number;
  title: string;
  content: string;
  updatedAt: string;
}

export const adminPoliciesApi = {
  list(): Promise<PolicyResponse[]> {
    return get<PolicyResponse[]>(`/api/admin/policies`, { auth: true }).then((res) => res.data);
  },

  getById(policyId: number): Promise<PolicyResponse> {
    return get<PolicyResponse>(`/api/admin/policies/${policyId}`, { auth: true }).then((res) => res.data);
  },

  upsert(body: { policyId?: number; title: string; content: string }): Promise<PolicyResponse> {
    return put<PolicyResponse>(`/api/admin/policies`, body, { auth: true }).then((res) => res.data);
  },

  delete(policyId: number): Promise<void> {
    return del<void>(`/api/admin/policies`, { policyId }, { auth: true }).then((res) => res as unknown as void);
  },
};

// ─── Banner API ──────────────────────────────────────────────────────────────────

export type BannerStatus = "Visible" | "Hidden";

export interface BannerResponse {
  bannerId: number;
  title: string;
  imageUrl: string;
  status: BannerStatus;
  createdAt: string;
  updatedAt: string;
}

export const adminBannersApi = {
  list(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: BannerStatus;
  }): Promise<PaginatedList<BannerResponse>> {
    return get<{
      data: BannerResponse[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(`/api/admin/banners${buildQueryString(params)}`, {
      auth: true,
    }).then((res) => ({
      list: res.data.data,
      total: res.data.pagination.total,
      page: res.data.pagination.page,
      limit: res.data.pagination.limit,
      totalPages: res.data.pagination.totalPages,
    }));
  },

  getById(bannerId: number): Promise<BannerResponse> {
    return get<BannerResponse>(`/api/admin/banners/${bannerId}`, {
      auth: true,
    }).then((res) => res.data);
  },

  create(body: {
    title: string;
    imageUrl: string;
    status?: BannerStatus;
  }): Promise<BannerResponse> {
    return post<BannerResponse>(`/api/admin/banners`, body, {
      auth: true,
    }).then((res) => res.data);
  },

  update(
    bannerId: number,
    body: {
      title?: string;
      imageUrl?: string;
    },
  ): Promise<BannerResponse> {
    return patch<BannerResponse>(`/api/admin/banners/${bannerId}`, body, {
      auth: true,
    }).then((res) => res.data);
  },

  updateStatus(
    bannerId: number,
    body: { status: BannerStatus },
  ): Promise<BannerResponse> {
    return patch<BannerResponse>(
      `/api/admin/banners/${bannerId}/status`,
      body,
      { auth: true },
    ).then((res) => res.data);
  },

  delete(bannerId: number): Promise<null> {
    return del<null>(`/api/admin/banners/${bannerId}`, undefined, {
      auth: true,
    }).then((res) => res.data);
  },
};

// ─── Popup API ────────────────────────────────────────────────────────────────

export type PopupStatus = "Visible" | "Hidden";

export interface PopupResponse {
  popupId: number;
  title: string;
  body: string;
  imageUrl: string | null;
  ctaLabel: string | null;
  ctaTargetUrl: string | null;
  status: PopupStatus;
  createdAt: string;
  updatedAt: string;
}

export const adminPopupsApi = {
  list(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: PopupStatus;
  }): Promise<PaginatedList<PopupResponse>> {
    return get<{
      data: PopupResponse[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(`/api/admin/popups${buildQueryString(params)}`, {
      auth: true,
    }).then((res) => ({
      list: res.data.data,
      total: res.data.pagination.total,
      page: res.data.pagination.page,
      limit: res.data.pagination.limit,
      totalPages: res.data.pagination.totalPages,
    }));
  },

  getById(popupId: number): Promise<PopupResponse> {
    return get<PopupResponse>(`/api/admin/popups/${popupId}`, {
      auth: true,
    }).then((res) => res.data);
  },

  create(body: {
    title: string;
    body: string;
    imageUrl?: string | null;
    ctaLabel?: string | null;
    ctaTargetUrl?: string | null;
    status?: PopupStatus;
  }): Promise<PopupResponse> {
    return post<PopupResponse>(`/api/admin/popups`, body, {
      auth: true,
    }).then((res) => res.data);
  },

  update(
    popupId: number,
    body: {
      title?: string;
      body?: string;
      imageUrl?: string | null;
      ctaLabel?: string | null;
      ctaTargetUrl?: string | null;
    },
  ): Promise<PopupResponse> {
    return patch<PopupResponse>(`/api/admin/popups/${popupId}`, body, {
      auth: true,
    }).then((res) => res.data);
  },

  updateStatus(
    popupId: number,
    body: { status: PopupStatus },
  ): Promise<PopupResponse> {
    return patch<PopupResponse>(
      `/api/admin/popups/${popupId}/status`,
      body,
      { auth: true },
    ).then((res) => res.data);
  },

  delete(popupId: number): Promise<null> {
    return del<null>(`/api/admin/popups/${popupId}`, undefined, {
      auth: true,
    }).then((res) => res.data);
  },
};

// ─── Post API ─────────────────────────────────────────────────────────────────

export type PostStatus = "Visible" | "Hidden";

export interface PostAuthor {
  userId: string;
  fullName: string;
  email: string;
  avatar: string | null;
}

export interface PostResponse {
  postId: number;
  authorId: string;
  title: string;
  content: string;
  imageUrl: string | null;
  status: PostStatus;
  createdAt: string;
  updatedAt: string;
  author: PostAuthor;
}

export const adminPostsApi = {
  list(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: PostStatus;
  }): Promise<PaginatedList<PostResponse>> {
    return get<{
      data: PostResponse[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(`/api/admin/posts${buildQueryString(params)}`, {
      auth: true,
    }).then((res) => ({
      list: res.data.data,
      total: res.data.pagination.total,
      page: res.data.pagination.page,
      limit: res.data.pagination.limit,
      totalPages: res.data.pagination.totalPages,
    }));
  },

  getById(postId: number): Promise<PostResponse> {
    return get<PostResponse>(`/api/admin/posts/${postId}`, {
      auth: true,
    }).then((res) => res.data);
  },

  create(body: {
    title: string;
    content: string;
    imageUrl?: string | null;
    status?: PostStatus;
  }): Promise<PostResponse> {
    return post<PostResponse>(`/api/admin/posts`, body, {
      auth: true,
    }).then((res) => res.data);
  },

  update(
    postId: number,
    body: {
      title?: string;
      content?: string;
      imageUrl?: string | null;
    },
  ): Promise<PostResponse> {
    return patch<PostResponse>(`/api/admin/posts/${postId}`, body, {
      auth: true,
    }).then((res) => res.data);
  },

  updateStatus(
    postId: number,
    body: { status: PostStatus },
  ): Promise<PostResponse> {
    return patch<PostResponse>(
      `/api/admin/posts/${postId}/status`,
      body,
      { auth: true },
    ).then((res) => res.data);
  },

  delete(postId: number): Promise<null> {
    return del<null>(`/api/admin/posts/${postId}`, undefined, {
      auth: true,
    }).then((res) => res.data);
  },
};

// ─── Order API ────────────────────────────────────────────────────────────────

export type OrderPaymentStatus = "Pending" | "Paid" | "Cancelled" | "Refunded";

export interface OrderItemResponse {
  orderItemId: number;
  voucherId: number;
  quantity: number;
  price: string;
  voucher?: {
    voucherId: number;
    title: string;
    imageUrl: string | null;
  };
  issuedVouchers?: {
    issuedVoucherId: number;
    voucherCode: string;
    status: "Unused" | "Used" | "Expired" | "Locked";
    validFrom: string;
    validTo: string;
    usedAt: string | null;
  }[];
}

export interface OrderResponse {
  orderId: number;
  customerId: string;
  totalAmount: string;
  paymentMethod: string | null;
  paymentStatus: OrderPaymentStatus;
  isGift: boolean;
  receiverEmail: string | null;
  giftMessage: string | null;
  cancelledAt: string | null;
  cancelledBy: string | null;
  cancelReason: string | null;
  refundedAt: string | null;
  refundAmount: string | null;
  refundReason?: string | null;
  createdAt: string;
  updatedAt: string;
  customer?: {
    userId: string;
    fullName: string;
    email: string;
    phoneNumber: string | null;
    avatar?: string | null;
  };
  orderItems?: OrderItemResponse[];
}

export const adminOrdersApi = {
  list(params?: {
    page?: number;
    limit?: number;
    search?: string;
    paymentStatus?: OrderPaymentStatus;
    customerId?: string;
    userId?: string;
    status?: OrderPaymentStatus | 'Refunded';
    fromDate?: string;
    toDate?: string;
  }): Promise<PaginatedList<OrderResponse>> {
    return get<{
      data: OrderResponse[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(`/api/admin/orders${buildQueryString(params)}`, {
      auth: true,
    }).then((res) => ({
      list: res.data.data,
      total: res.data.pagination.total,
      page: res.data.pagination.page,
      limit: res.data.pagination.limit,
      totalPages: res.data.pagination.totalPages,
    }));
  },

  getById(orderId: number): Promise<OrderResponse> {
    return get<OrderResponse>(`/api/admin/orders/${orderId}`, {
      auth: true,
    }).then((res) => res.data);
  },

  cancel(orderId: number, body: { reason: string }) {
    return post<{
      orderId: number;
      paymentStatus: OrderPaymentStatus;
      cancelledAt: string;
      cancelledBy: string;
      cancelReason: string;
      updatedAt: string;
    }>(`/api/admin/orders/${orderId}/cancel`, body, {
      auth: true,
    }).then((res) => res.data);
  },

  refund(orderId: number, body: { reason: string; amount?: number }) {
    return post<{
      orderId: number;
      paymentStatus: OrderPaymentStatus;
      refundedAt: string;
      refundedBy: string;
      refundReason: string;
      refundAmount: string;
      updatedAt: string;
    }>(`/api/admin/orders/${orderId}/refund`, body, {
      auth: true,
    }).then((res) => res.data);
  },

  markPaid(orderId: number) {
    return post<{ orderId: number; paymentStatus: OrderPaymentStatus; updatedAt: string }>(
      `/api/admin/orders/${orderId}/pay`, {}, { auth: true },
    ).then((res) => res.data);
  },
};

// ─── Dashboard API ────────────────────────────────────────────────────────────

export interface DashboardKpis {
  totalUsers: number;
  totalPartners: number;
  totalVouchers: number;
  totalIssued: number;
  totalUsed: number;
}

export interface DashboardMonthPoint {
  month: string;
  year: number;
  label: string;
  value: number;
}

export interface DashboardOrdersByStatus {
  paid: number;
  pending: number;
  cancelled: number;
  refunded: number;
}

export interface DashboardTopVoucher {
  rank: number;
  voucherId: number;
  title: string;
  partnerId: number;
  partnerName: string;
  sold: number;
}

export interface DashboardTopPartner {
  rank: number;
  partnerId: number;
  partnerName: string;
  sold: number;
}

export interface DashboardResponse {
  kpis: DashboardKpis;
  revenueByMonth: DashboardMonthPoint[];
  ordersByMonth: DashboardMonthPoint[];
  userRegistrationByMonth: DashboardMonthPoint[];
  ordersByStatus: DashboardOrdersByStatus;
  topVouchers: DashboardTopVoucher[];
  topPartners: DashboardTopPartner[];
}

export const adminDashboardApi = {
  get(): Promise<DashboardResponse> {
    return get<DashboardResponse>('/api/admin/dashboard', { auth: true }).then(
      (res) => res.data,
    );
  },
};
