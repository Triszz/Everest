const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

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
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    const json = await res.json();
    if (json.success && json.data?.accessToken) {
      localStorage.setItem('access_token', json.data.accessToken);
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
const authFetch = async (
  url: string,
  options: RequestInit & { auth?: boolean } = {},
): Promise<Response> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };

  // Attach auth token
  if (options.auth) {
    const token = localStorage.getItem('access_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
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
        headers['Authorization'] = `Bearer ${newToken}`;
        response = await fetch(url, { ...options, headers });
      } else {
        // Refresh failed - clear tokens and redirect
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    } else {
      // Another refresh in progress, wait
      await new Promise<string>((resolve) => {
        subscribeTokenRefresh(resolve);
      });
      const newToken = localStorage.getItem('access_token')!;
      headers['Authorization'] = `Bearer ${newToken}`;
      response = await fetch(url, { ...options, headers });
    }
  }

  return response;
};

const handleResponse = async <T>(res: Response): Promise<T> => {
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error?.message || 'API Error');
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
  partner: {
    partnerId: number;
    companyName: string;
  };
  category: {
    categoryId: number;
    categoryName: string;
  };
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
  min_price?: number;
  max_price?: number;
  sort?: 'price_asc' | 'price_desc' | 'popular' | 'newest';
  page?: number;
  limit?: number;
}

export interface CategoryVoucherQuery {
  sort?: 'price_asc' | 'price_desc' | 'popular' | 'newest';
  page?: number;
  limit?: number;
}

export interface Banner {
  bannerId: number;
  title: string;
  imageUrl: string;
  targetUrl: string | null;
  displayOrder: number;
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
  status: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface MeResponse {
  user: User;
}

export const voucherApi = {
  list: async (params?: VoucherQuery) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) query.set(k, String(v));
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

export const bannerApi = {
  list: async () => {
    const res = await fetch(`${BASE_URL}/banners`);
    return handleResponse<{ success: boolean; data: Banner[] }>(res);
  },
};

export const cartApi = {
  getCart: async () => {
    const res = await authFetch(`${BASE_URL}/cart`, { auth: true });
    return handleResponse<{ success: boolean; data: Cart }>(res);
  },

  addToCart: async (voucherId: number, quantity: number) => {
    const res = await authFetch(`${BASE_URL}/cart/items`, {
      method: 'POST',
      auth: true,
      body: JSON.stringify({ voucher_id: voucherId, quantity }),
    });
    return handleResponse<{ success: boolean; data: { message: string; item: CartItem } }>(res);
  },

  updateCartItem: async (itemId: number, quantity: number) => {
    const res = await authFetch(`${BASE_URL}/cart/items/${itemId}`, {
      method: 'PUT',
      auth: true,
      body: JSON.stringify({ quantity }),
    });
    return handleResponse<{ success: boolean; data: { message: string; item: CartItem } }>(res);
  },

  removeCartItem: async (itemId: number) => {
    const res = await authFetch(`${BASE_URL}/cart/items/${itemId}`, {
      method: 'DELETE',
      auth: true,
    });
    return handleResponse<{ success: boolean; data: { message: string } }>(res);
  },

  clearCart: async () => {
    const res = await authFetch(`${BASE_URL}/cart`, {
      method: 'DELETE',
      auth: true,
    });
    return handleResponse<{ success: boolean; data: { message: string } }>(res);
  },
};

export const authApi = {
  login: async (email: string, password: string) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse<{ success: boolean; data: AuthResponse }>(res);
  },

  register: async (data: {
    email: string;
    password: string;
    fullName: string;
    phoneNumber?: string;
  }) => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    return handleResponse<{ success: boolean; data: AuthResponse }>(res);
  },
};
