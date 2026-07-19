// ── Auth types (matching backend user roles & structures) ──────────────────
export interface AuthUser {
  userId: string;
  email: string;
  fullName: string;
  role: 'Admin';
  status: string;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
}

export interface LoginResponseData {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface RefreshResponseData {
  accessToken: string;
}

export interface MeResponseData {
  userId: string;
  email: string;
  phoneNumber: string | null;
  fullName: string;
  role: string;
  status: string;
  createdAt: string;
}

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
