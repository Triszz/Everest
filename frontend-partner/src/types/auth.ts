// ── Role types (matching backend shared/types) ─────────────────────────────
export type PartnerRole = 'Partner_Owner' | 'Partner_Cashier';

// ── Auth user (from login response) ─────────────────────────────────────────
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

// ── Login API response ──────────────────────────────────────────────────────
export interface LoginResponse {
  success: true;
  data: {
    accessToken: string;
    refreshToken: string;
    user: AuthUser;
  };
}

export interface ApiErrorResponse {
  success: false;
  error?: { message: string; code?: string };
  message?: string;
}
