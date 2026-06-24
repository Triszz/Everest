import type { ApiSuccess, ApiError } from '../types/auth';

// ── Config ──────────────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// ── Storage keys (centralized) ──────────────────────────────────────────────
export const STORAGE_KEY_ACCESS_TOKEN = 'everest_partner_token';
export const STORAGE_KEY_REFRESH_TOKEN = 'everest_partner_refresh_token';
export const STORAGE_KEY_USER = 'everest_partner_user';

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
}

// ── Core request function ───────────────────────────────────────────────────

/**
 * Low-level fetch wrapper that handles:
 * 1. Base URL prefixing
 * 2. JSON serialization / Content-Type
 * 3. Bearer token injection (opt-in via `auth: true`)
 * 4. HTTP error → ApiException mapping
 * 5. Generic response typing
 *
 * Returns only the `data` field from `{ success: true, data: T }`.
 */
async function request<T>(
  method: HttpMethod,
  path: string,
  body?: unknown,
  options?: RequestOptions,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options?.headers,
  };

  // Attach auth token if requested
  if (options?.auth) {
    const token = localStorage.getItem(STORAGE_KEY_ACCESS_TOKEN);
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
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

  return (json as ApiSuccess<T>).data;
}

// ── Public convenience methods ──────────────────────────────────────────────

/** GET request – returns `data` from response envelope */
export function get<T>(path: string, options?: RequestOptions): Promise<T> {
  return request<T>('GET', path, undefined, options);
}

/** POST request – returns `data` from response envelope */
export function post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
  return request<T>('POST', path, body, options);
}

/** PUT request – returns `data` from response envelope */
export function put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
  return request<T>('PUT', path, body, options);
}

/** PATCH request – returns `data` from response envelope */
export function patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
  return request<T>('PATCH', path, body, options);
}

/** DELETE request – returns `data` from response envelope */
export function del<T = null>(path: string, options?: RequestOptions): Promise<T> {
  return request<T>('DELETE', path, undefined, options);
}

// ── Full response helper (for when you need `message` or `pagination`) ──────

/**
 * Like `post`, but returns the full `{ success, data, message }` envelope
 * instead of just `data`. Useful for register, submit, etc.
 */
export async function postFull<T>(
  path: string,
  body?: unknown,
  options?: RequestOptions,
): Promise<ApiSuccess<T>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options?.headers,
  };

  if (options?.auth) {
    const token = localStorage.getItem(STORAGE_KEY_ACCESS_TOKEN);
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
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
}
