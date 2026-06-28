import { post, get } from './api-client';
import type {
  LoginResponseData,
  RegisterPartnerResponseData,
  RefreshResponseData,
  MeResponseData,
} from '../types/auth';

// Re-export storage keys from api-client for backward compatibility
export {
  STORAGE_KEY_ACCESS_TOKEN,
  STORAGE_KEY_REFRESH_TOKEN,
  STORAGE_KEY_USER,
} from './api-client';

// ── Types ───────────────────────────────────────────────────────────────────

export interface RegisterPartnerInput {
  email: string;
  password: string;
  fullName: string;
  phoneNumber?: string;
  companyName: string;
  taxCode: string;
  businessLicenseUrl?: string;
}

// ── API calls ───────────────────────────────────────────────────────────────
//
// NOTE: All these endpoints are public/auth-bootstrap, so we set
// `skipAuthRefresh: true` to avoid the global 401 → refresh flow
// recursing into itself when login itself fails.

/**
 * POST /api/auth/login
 * 200 → { accessToken, refreshToken, user }
 * 401 → UNAUTHORIZED | 403 → FORBIDDEN
 */
export function apiLogin(
  email: string,
  password: string,
): Promise<LoginResponseData> {
  return post<LoginResponseData>(
    '/api/auth/login',
    { email, password },
    { skipAuthRefresh: true },
  ).then(res => res.data);
}

/**
 * POST /api/auth/register/partner
 * 201 → { user, partner } — NO token (partner waits for admin approval)
 * 400 → VALIDATION_ERROR | 409 → CONFLICT
 */
export async function apiRegisterPartner(
  input: RegisterPartnerInput,
): Promise<{ data: RegisterPartnerResponseData; message?: string }> {
  const response = await post<RegisterPartnerResponseData>(
    '/api/auth/register/partner',
    input,
    { skipAuthRefresh: true },
  );
  return { data: response.data, message: response.message };
}

/**
 * POST /api/auth/refresh
 * 200 → { accessToken }
 * 401 → UNAUTHORIZED
 *
 * Internal: api-client handles refresh automatically on 401.
 * This export is for AuthContext's hydration flow (on page reload).
 */
export function apiRefreshToken(
  refreshToken: string,
): Promise<RefreshResponseData> {
  return post<RefreshResponseData>(
    '/api/auth/refresh',
    { refreshToken },
    { skipAuthRefresh: true },
  ).then(res => res.data);
}

/**
 * GET /api/auth/me
 * 200 → user object
 * 401 → UNAUTHORIZED (api-client will auto-refresh + retry)
 *
 * Accepts explicit token for hydration (before context has auth state).
 */
export function apiGetMe(accessToken: string): Promise<MeResponseData> {
  return get<MeResponseData>('/api/auth/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
    auth: true,
  }).then(res => res.data);
}