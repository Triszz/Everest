import { post, get } from './api-client';
import type { LoginResponseData, MeResponseData } from '../types/auth';

export {
  STORAGE_KEY_ACCESS_TOKEN,
  STORAGE_KEY_REFRESH_TOKEN,
  STORAGE_KEY_USER,
} from './api-client';

/**
 * POST /api/auth/login
 */
export function apiLogin(email: string, password: string): Promise<LoginResponseData> {
  return post<LoginResponseData>(
    '/api/auth/login',
    { email, password },
    { skipAuthRefresh: true },
  ).then(res => res.data);
}

/**
 * GET /api/auth/me
 */
export function apiGetMe(accessToken: string): Promise<MeResponseData> {
  return get<MeResponseData>('/api/auth/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
    auth: true,
  }).then(res => res.data);
}
