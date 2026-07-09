import type { ApiSuccess, ApiError } from '../types/auth';

// ── Config ──────────────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// ── Storage keys (centralized) ──────────────────────────────────────────────
export const STORAGE_KEY_ACCESS_TOKEN = 'everest_partner_token';
export const STORAGE_KEY_REFRESH_TOKEN = 'everest_partner_refresh_token';
export const STORAGE_KEY_USER = 'everest_partner_user';

/**
 * Custom event dispatched by the HTTP client when tokens are cleared
 * (e.g. refresh failed). AuthContext listens to this to sync React state.
 */
export const AUTH_CLEARED_EVENT = 'everest:auth-cleared';

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
  /** Custom headers (merged with defaults) */
  headers?: Record<string, string>;
  /** If true, attach Bearer token from localStorage */
  auth?: boolean;
  /**
   * Skip the global 401 → refresh → retry flow for this request.
   * Use for: login, register, refresh itself (otherwise infinite loop).
   */
  skipAuthRefresh?: boolean;
}

interface InternalRequestOptions extends RequestOptions {
  /** Marker so refresh-and-retry cannot loop forever */
  _isRetry?: boolean;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

const readAccessToken = (): string | null =>
  localStorage.getItem(STORAGE_KEY_ACCESS_TOKEN);

const readRefreshToken = (): string | null =>
  localStorage.getItem(STORAGE_KEY_REFRESH_TOKEN);

/**
 * Clears all auth state from localStorage, notifies listeners
 * (AuthContext) via a custom event, and redirects to /login.
 * Called when refresh token is rejected by the backend.
 *
 * Kept dependency-free (no React) to avoid circular imports
 * between api-client ↔ auth.service ↔ AuthContext.
 */
export function clearAuthAndRedirect(reason: 'expired' | 'manual' = 'expired'): void {
  localStorage.removeItem(STORAGE_KEY_ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEY_REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEY_USER);

  // Notify React subscribers (AuthContext) in the same tab.
  window.dispatchEvent(new CustomEvent(AUTH_CLEARED_EVENT, { detail: { reason } }));

  // Only redirect if not already on /login to avoid loops / flicker.
  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    // Use replace so the back button doesn't return to a protected page.
    window.location.replace('/login');
  }
}

// ── Refresh-token coordination ──────────────────────────────────────────────

interface PendingRefresh {
  promise: Promise<string>;
}

/**
 * If multiple requests 401 simultaneously, they MUST share a single
 * refresh call. Otherwise each would call /refresh independently,
 * potentially invalidating each other's tokens (token rotation, etc.)
 * or causing thundering-herd load on the auth endpoint.
 */
let pendingRefresh: PendingRefresh | null = null;

async function refreshAccessToken(): Promise<string> {
  if (pendingRefresh) return pendingRefresh.promise;

  const refreshToken = readRefreshToken();
  if (!refreshToken) {
    throw new ApiException(
      'Không có refresh token',
      'UNAUTHORIZED',
      401,
    );
  }

  // Build a fresh fetch — do NOT go through `request()` to avoid
  // recursive 401 → refresh loop.
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

  // Always clear pending slot, whether refresh succeeded or failed.
  promise.finally(() => {
    pendingRefresh = null;
  });

  return promise;
}

// ── Core request function ───────────────────────────────────────────────────

/**
 * Low-level fetch wrapper that handles:
 * 1. Base URL prefixing
 * 2. JSON serialization / Content-Type
 * 3. Bearer token injection (opt-in via `auth: true`)
 * 4. HTTP error → ApiException mapping
 * 5. 401 → automatic refresh → single retry
 * 6. Refresh failure → clearAuthAndRedirect (logs user out)
 *
 * Returns the FULL envelope `{ success, data, message? }` so callers
 * can read `data` (default helpers) or `message` when needed.
 */
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
    // Only attempt refresh for auth-protected requests, on 401, and only once.
    const shouldAttemptRefresh =
      options?.auth &&
      !options?._isRetry &&
      !options?.skipAuthRefresh &&
      err instanceof ApiException &&
      err.statusCode === 401;

    if (!shouldAttemptRefresh) throw err;

    // Try refresh.
    try {
      await refreshAccessToken();
    } catch {
      // Refresh failed → force logout + redirect.
      clearAuthAndRedirect('expired');
      throw err;
    }

    // Retry exactly once with the freshly-stored token.
    return send(readAccessToken());
  }
}

// ── Public convenience methods ──────────────────────────────────────────────

/**
 * GET request – returns the FULL envelope.
 * Use `.data` on the result for the typed payload.
 */
export function get<T>(path: string, options?: RequestOptions): Promise<ApiSuccess<T>> {
  return request<T>('GET', path, undefined, options);
}

/** POST request – returns the FULL envelope. */
export function post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<ApiSuccess<T>> {
  return request<T>('POST', path, body, options);
}

/** PUT request – returns the FULL envelope. */
export function put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<ApiSuccess<T>> {
  return request<T>('PUT', path, body, options);
}

/** PATCH request – returns the FULL envelope. */
export function patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<ApiSuccess<T>> {
  return request<T>('PATCH', path, body, options);
}

/** DELETE request – returns the FULL envelope. */
export function del<T = null>(path: string, options?: RequestOptions): Promise<ApiSuccess<T>> {
  return request<T>('DELETE', path, undefined, options);
}