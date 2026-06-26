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

export const voucherApi = {
  list: async (params?: VoucherQuery) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) query.set(k, String(v));
      });
    }
    const res = await fetch(`${BASE_URL}/vouchers?${query}`, {
      headers: { ...getAuthHeaders() },
    });
    const json = await handleResponse<{ success: boolean; vouchers: Voucher[]; pagination: PaginationMeta }>(res);
    return { ...json, data: json.vouchers };
  },

  getFeatured: async () => {
    const res = await fetch(`${BASE_URL}/vouchers/featured`, {
      headers: { ...getAuthHeaders() },
    });
    return handleResponse<{ success: boolean; data: Voucher[] }>(res);
  },

  getById: async (id: number) => {
    const res = await fetch(`${BASE_URL}/vouchers/${id}`, {
      headers: { ...getAuthHeaders() },
    });
    return handleResponse<{ success: boolean; data: Voucher }>(res);
  },

  getReviews: async (id: number, page = 1, limit = 10) => {
    const res = await fetch(`${BASE_URL}/vouchers/${id}/reviews?page=${page}&limit=${limit}`, {
      headers: { ...getAuthHeaders() },
    });
    const json = await handleResponse<{ success: boolean; reviews: Review[]; pagination: PaginationMeta }>(res);
    return { ...json, data: json.reviews };
  },
};

export const categoryApi = {
  list: async () => {
    const res = await fetch(`${BASE_URL}/categories`, {
      headers: { ...getAuthHeaders() },
    });
    return handleResponse<{ success: boolean; data: Category[] }>(res);
  },

  getById: async (id: number) => {
    const res = await fetch(`${BASE_URL}/categories/${id}`, {
      headers: { ...getAuthHeaders() },
    });
    return handleResponse<{ success: boolean; data: Category }>(res);
  },

  getVouchers: async (id: number, params?: CategoryVoucherQuery) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) query.set(k, String(v));
      });
    }
    const res = await fetch(`${BASE_URL}/categories/${id}/vouchers?${query}`, {
      headers: { ...getAuthHeaders() },
    });
    return handleResponse<{
      success: boolean;
      category: Category;
      vouchers: Voucher[];
      pagination: PaginationMeta;
    }>(res);
  },
};
