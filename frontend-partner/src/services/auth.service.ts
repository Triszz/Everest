import { post, get, postFull } from './api-client';
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

/**
 * POST /api/auth/login
 * 200 → { accessToken, refreshToken, user }
 * 401 → UNAUTHORIZED | 403 → FORBIDDEN
 */
export function apiLogin(
  email: string,
  password: string,
): Promise<LoginResponseData> {
  return post<LoginResponseData>('/api/auth/login', { email, password });
}

/**
 * POST /api/auth/register/partner
 * 201 → { user, partner } — NO token (partner waits for admin approval)
 * 400 → VALIDATION_ERROR | 409 → CONFLICT
 */
export async function apiRegisterPartner(
  input: RegisterPartnerInput,
): Promise<{ data: RegisterPartnerResponseData; message?: string }> {
  const response = await postFull<RegisterPartnerResponseData>(
    '/api/auth/register/partner',
    input,
  );
  return { data: response.data, message: response.message };
}

/**
 * POST /api/auth/refresh
 * 200 → { accessToken }
 * 401 → UNAUTHORIZED
 */
export function apiRefreshToken(
  refreshToken: string,
): Promise<RefreshResponseData> {
  return post<RefreshResponseData>('/api/auth/refresh', { refreshToken });
}

/**
 * GET /api/auth/me
 * 200 → user object
 * 401 → UNAUTHORIZED
 *
 * Accepts explicit token for hydration (before context has auth state).
 */
export function apiGetMe(accessToken: string): Promise<MeResponseData> {
  return get<MeResponseData>('/api/auth/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}
