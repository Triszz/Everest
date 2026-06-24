// ── Role types (matching backend shared/types/index.ts) ─────────────────────
export type PartnerRole = 'Partner_Owner' | 'Partner_Cashier';

// ── Auth user — mirrors backend login response `data.user` ──────────────────
export interface AuthUser {
  userId: string;
  email: string;
  fullName: string;
  role: PartnerRole;
  status: string;
  partnerId: number | null;
}

// ── Auth state ──────────────────────────────────────────────────────────────
export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
}

// ── Backend response shapes ─────────────────────────────────────────────────
// POST /api/auth/login → 200
export interface LoginResponseData {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

// POST /api/auth/register/partner → 201
// Backend KHÔNG trả token — partner phải chờ Admin duyệt
export interface RegisterPartnerResponseData {
  user: {
    userId: string;
    email: string;
    fullName: string;
    partnerId: number | null;
  };
  partner: {
    partnerId: number;
    companyName: string;
    status: string; // 'Pending'
  };
}

// POST /api/auth/refresh → 200
export interface RefreshResponseData {
  accessToken: string;
}

// GET /api/auth/me → 200
export interface MeResponseData {
  userId: string;
  email: string;
  phoneNumber: string | null;
  fullName: string;
  role: string;
  status: string;
  partnerId: number | null;
  createdAt: string;
}

// ── Generic API envelope (matches backend shared/types ApiSuccess / ApiError)
export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: { code: string; message: string };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
