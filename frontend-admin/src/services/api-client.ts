import type { ApiSuccess, ApiError } from '../types/auth';

// ── Config ──────────────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// ── Storage keys (centralized for admin) ────────────────────────────────────
export const STORAGE_KEY_ACCESS_TOKEN = 'everest_admin_token';
export const STORAGE_KEY_REFRESH_TOKEN = 'everest_admin_refresh_token';
export const STORAGE_KEY_USER = 'everest_admin_user';

export const AUTH_CLEARED_EVENT = 'everest:admin-auth-cleared';

// ── Custom error for API failures ───────────────────────────────────────────
export class ApiException extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(message: string, code: string, statusCode: number) {
    super(message);
    this.name = 'ApiException';
    this.code = code;
    this.statusCode = statusCode;
  }
}

// ── Request options ─────────────────────────────────────────────────────────
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
  headers?: Record<string, string>;
  auth?: boolean;
  skipAuthRefresh?: boolean;
}

interface InternalRequestOptions extends RequestOptions {
  _isRetry?: boolean;
}

// ── Helpers ─────────────────────────────────────────────────────────────────
const readAccessToken = (): string | null =>
  localStorage.getItem(STORAGE_KEY_ACCESS_TOKEN);

const readRefreshToken = (): string | null =>
  localStorage.getItem(STORAGE_KEY_REFRESH_TOKEN);

export function clearAuthAndRedirect(reason: 'expired' | 'manual' = 'expired'): void {
  localStorage.removeItem(STORAGE_KEY_ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEY_REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEY_USER);

  window.dispatchEvent(new CustomEvent(AUTH_CLEARED_EVENT, { detail: { reason } }));

  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    window.location.replace('/login');
  }
}

// ── Refresh-token coordination ──────────────────────────────────────────────
interface PendingRefresh {
  promise: Promise<string>;
}

let pendingRefresh: PendingRefresh | null = null;

async function refreshAccessToken(): Promise<string> {
  if (pendingRefresh) return pendingRefresh.promise;

  const refreshToken = readRefreshToken();
  if (!refreshToken) {
    throw new ApiException('Không có refresh token', 'UNAUTHORIZED', 401);
  }

  const promise = (async () => {
    const res = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    const json: unknown = await res.json();

    if (!res.ok) {
      const errBody = json as ApiError;
      throw new ApiException(
        errBody?.error?.message || 'Refresh token không hợp lệ',
        errBody?.error?.code || 'UNAUTHORIZED',
        res.status,
      );
    }

    const data = (json as ApiSuccess<{ accessToken: string }>).data;
    localStorage.setItem(STORAGE_KEY_ACCESS_TOKEN, data.accessToken);
    return data.accessToken;
  })();

  pendingRefresh = { promise };

  promise.finally(() => {
    pendingRefresh = null;
  });

  return promise;
}

// ── Core request function ───────────────────────────────────────────────────
async function request<T>(
  method: HttpMethod,
  path: string,
  body?: unknown,
  options?: InternalRequestOptions,
): Promise<ApiSuccess<T>> {
  const send = async (tokenOverride?: string | null): Promise<ApiSuccess<T>> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options?.headers,
    };

    if (options?.auth) {
      const token = tokenOverride ?? readAccessToken();
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      ...(body !== undefined && { body: JSON.stringify(body) }),
    });

    const json: unknown = await res.json();

    if (!res.ok) {
      const errBody = json as ApiError;
      throw new ApiException(
        errBody?.error?.message || 'Đã xảy ra lỗi, vui lòng thử lại',
        errBody?.error?.code || 'UNKNOWN_ERROR',
        res.status,
      );
    }

    return json as ApiSuccess<T>;
  };

  try {
    return await send();
  } catch (err) {
    const shouldAttemptRefresh =
      options?.auth &&
      !options?._isRetry &&
      !options?.skipAuthRefresh &&
      err instanceof ApiException &&
      err.statusCode === 401;

    if (!shouldAttemptRefresh) throw err;

    try {
      await refreshAccessToken();
    } catch {
      clearAuthAndRedirect('expired');
      throw err;
    }

    return send(readAccessToken());
  }
}

// ── Public convenience methods ──────────────────────────────────────────────
export function get<T>(path: string, options?: RequestOptions): Promise<ApiSuccess<T>> {
  return request<T>('GET', path, undefined, options);
}

export function post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<ApiSuccess<T>> {
  return request<T>('POST', path, body, options);
}

export function put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<ApiSuccess<T>> {
  return request<T>('PUT', path, body, options);
}

export function patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<ApiSuccess<T>> {
  return request<T>('PATCH', path, body, options);
}

export function del<T = null>(path: string, body?: unknown, options?: RequestOptions): Promise<ApiSuccess<T>> {
  return request<T>('DELETE', path, body, options);
}
