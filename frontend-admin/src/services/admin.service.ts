import { get, post, patch, del } from './api-client';

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

export interface BranchResponse {
  branchId: number;
  partnerId: number;
  cashierId: string | null;
  branchName: string;
  address: string;
  phoneNumber: string | null;
  isLocked: boolean;
  createdAt: string;
}

export interface CategoryResponse {
  categoryId: number;
  categoryName: string;
  description: string | null;
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
    status?: PartnerStatus;
  }): Promise<PaginatedList<PartnerResponse>> {
    return get<PaginatedList<PartnerResponse>>(
      `/api/admin/partners${buildQueryString(params)}`,
      { auth: true },
    ).then((res) => res.data);
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
  ): Promise<PartnerResponse> {
    return patch<PartnerResponse>(
      `/api/admin/partners/${partnerId}/lock`,
      body,
      { auth: true },
    ).then((res) => res.data);
  },
};

// ── Branches API ────────────────────────────────────────────────────────────
export const adminBranchesApi = {
  list(
    partnerId: number,
    params?: {
      page?: number;
      limit?: number;
      search?: string;
      isLocked?: boolean;
    },
  ): Promise<PaginatedList<BranchResponse>> {
    return get<PaginatedList<BranchResponse>>(
      `/api/admin/partners/${partnerId}/branches${buildQueryString(params)}`,
      { auth: true },
    ).then((res) => res.data);
  },

  getById(partnerId: number, branchId: number): Promise<BranchResponse> {
    return get<BranchResponse>(
      `/api/admin/partners/${partnerId}/branches/${branchId}`,
      { auth: true },
    ).then((res) => res.data);
  },

  create(
    partnerId: number,
    body: { branchName: string; address: string; phoneNumber?: string },
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
    body: { branchName?: string; address?: string; phoneNumber?: string | null },
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
    return get<PaginatedList<CategoryResponse>>(
      `/api/admin/categories${buildQueryString(params)}`,
      { auth: true },
    ).then((res) => res.data);
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
    return del<null>(`/api/admin/categories/${categoryId}`, {
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
};
