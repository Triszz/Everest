import type {
  LoginResponseData,
  RegisterPartnerResponseData,
  RefreshResponseData,
  MeResponseData,
  ApiSuccess,
  ApiError,
} from '../types/auth';

// ── Base URL ────────────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// ── Storage keys ────────────────────────────────────────────────────────────
export const STORAGE_KEY_ACCESS_TOKEN = 'everest_partner_token';
export const STORAGE_KEY_REFRESH_TOKEN = 'everest_partner_refresh_token';
export const STORAGE_KEY_USER = 'everest_partner_user';

// ── Error helper ────────────────────────────────────────────────────────────
function extractErrorMessage(json: ApiError): string {
  return json?.error?.message || 'Đã xảy ra lỗi, vui lòng thử lại';
}

// ── API calls ───────────────────────────────────────────────────────────────

/**
 * POST /api/auth/login
 * Body: { email, password }
 * 200 → { success: true, data: { accessToken, refreshToken, user } }
 * 401 → { success: false, error: { code: 'UNAUTHORIZED', message } }
 * 403 → { success: false, error: { code: 'FORBIDDEN', message } }
 */
export async function apiLogin(
  email: string,
  password: string
): Promise<LoginResponseData> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(extractErrorMessage(json as ApiError));
  }

  return (json as ApiSuccess<LoginResponseData>).data;
}

/**
 * POST /api/auth/register/partner
 * Body: { email, password, fullName, phoneNumber?, companyName, taxCode, businessLicenseUrl? }
 * 201 → { success: true, data: { user, partner }, message }
 * 400 → VALIDATION_ERROR
 * 409 → CONFLICT (email/phone/taxCode đã tồn tại)
 *
 * NOTE: Backend KHÔNG trả token. Partner phải chờ Admin phê duyệt mới login được.
 */
export interface RegisterPartnerInput {
  email: string;
  password: string;
  fullName: string;
  phoneNumber?: string;
  companyName: string;
  taxCode: string;
  businessLicenseUrl?: string;
}

export async function apiRegisterPartner(
  input: RegisterPartnerInput
): Promise<{ data: RegisterPartnerResponseData; message?: string }> {
  const res = await fetch(`${API_BASE}/api/auth/register/partner`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(extractErrorMessage(json as ApiError));
  }

  const success = json as ApiSuccess<RegisterPartnerResponseData>;
  return { data: success.data, message: success.message };
}

/**
 * POST /api/auth/refresh
 * Body: { refreshToken }
 * 200 → { success: true, data: { accessToken } }
 * 401 → UNAUTHORIZED
 */
export async function apiRefreshToken(
  refreshToken: string
): Promise<RefreshResponseData> {
  const res = await fetch(`${API_BASE}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(extractErrorMessage(json as ApiError));
  }

  return (json as ApiSuccess<RefreshResponseData>).data;
}

/**
 * GET /api/auth/me
 * Header: Authorization: Bearer <accessToken>
 * 200 → { success: true, data: { userId, email, fullName, role, ... } }
 * 401 → UNAUTHORIZED
 */
export async function apiGetMe(accessToken: string): Promise<MeResponseData> {
  const res = await fetch(`${API_BASE}/api/auth/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(extractErrorMessage(json as ApiError));
  }

  return (json as ApiSuccess<MeResponseData>).data;
}
