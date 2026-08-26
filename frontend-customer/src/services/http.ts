/**
 * services/http.ts
 * ------------------------------------------------------------------
 * HTTP client dùng chung cho toàn bộ frontend-customer.
 *
 * Cung cấp:
 *  - `BASE_URL`         : URL gốc của backend (lấy từ VITE_API_URL).
 *  - `PaginationMeta`   : Cấu trúc phân trang trả về từ backend.
 *  - `ApiError`         : Lỗi chuẩn hoá từ response của backend.
 *  - `authFetch()`      : Fetch wrapper tự động gắn Bearer token,
 *                         xử lý 401 → tự refresh access token → retry.
 *  - `handleResponse()` : Parse JSON, ném lỗi nếu !res.ok.
 *  - `buildQuery()`     : Helper tạo query string từ object params.
 *
 * Mọi module trong services/ đều sử dụng file này để tránh lặp code.
 * ------------------------------------------------------------------
 */

// ── Base URL ────────────────────────────────────────────────────────
// Lấy từ biến môi trường VITE_API_URL, mặc định trỏ về backend local.
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// ── Shared types ────────────────────────────────────────────────────

/** Cấu trúc phân trang trả về từ backend. */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/**
 * Cấu trúc lỗi chuẩn hoá theo envelope backend trả về.
 * Mọi response lỗi từ server đều có shape: { success: false, error: { message, code } }
 */
export interface ApiError {
  success: false;
  error: { message: string; code: string };
}

/**
 * Custom Error class giữ thêm `code` (mã lỗi từ backend) để frontend
 * phân nhánh xử lý (VD: redirect khi EMAIL_NOT_VERIFIED).
 */
export class ApiResponseError extends Error {
  code: string;
  constructor(message: string, code: string) {
    super(message);
    this.name = "ApiResponseError";
    this.code = code;
  }
}

// ── Token storage ───────────────────────────────────────────────────
// Dùng localStorage để persist qua refresh trang.
// Key trùng với convention của các module khác trong repo.

const STORAGE_KEY_ACCESS_TOKEN = "access_token";
const STORAGE_KEY_REFRESH_TOKEN = "refresh_token";

/** Lấy access token từ localStorage. */
export const getAccessToken = (): string | null =>
  localStorage.getItem(STORAGE_KEY_ACCESS_TOKEN);

/** Lấy refresh token từ localStorage. */
export const getRefreshToken = (): string | null =>
  localStorage.getItem(STORAGE_KEY_REFRESH_TOKEN);

/** Lưu cặp token mới (sau khi login hoặc refresh). */
export const setTokens = (accessToken: string, refreshToken: string): void => {
  localStorage.setItem(STORAGE_KEY_ACCESS_TOKEN, accessToken);
  localStorage.setItem(STORAGE_KEY_REFRESH_TOKEN, refreshToken);
};

/** Xoá toàn bộ token và thông tin phiên làm việc (khi refresh fail, bị khóa hoặc logout). */
export const clearTokens = (): void => {
  localStorage.removeItem(STORAGE_KEY_ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEY_REFRESH_TOKEN);
  localStorage.removeItem("everest_user");
  localStorage.removeItem("user");
  localStorage.removeItem("current_session_id");
};

// ── Refresh token coordination ──────────────────────────────────────
// Nếu nhiều request đồng thời nhận 401, chỉ refresh 1 lần duy nhất,
// các request còn lại sẽ chờ token mới rồi retry.

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

/**
 * Đăng ký callback nhận token mới khi refresh xong.
 * Dùng cho các request đang chờ refresh từ 1 request khác.
 */
const subscribeTokenRefresh = (callback: (token: string) => void): void => {
  refreshSubscribers.push(callback);
};

/** Phát token mới tới tất cả request đang chờ. */
const onTokenRefreshed = (token: string): void => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

/**
 * Gọi endpoint refresh token của backend.
 * Trả về access token mới nếu thành công, `null` nếu thất bại.
 */
const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    const json = await res.json();
    if (json.success && json.data?.accessToken) {
      localStorage.setItem(STORAGE_KEY_ACCESS_TOKEN, json.data.accessToken);
      return json.data.accessToken;
    }
  } catch {
    // Refresh failed silently
  }
  return null;
};

/**
 * Fetch wrapper tự động gắn Bearer token + xử lý 401 → refresh → retry.
 *
 * @example
 *   const res = await authFetch(`${BASE_URL}/cart`, { auth: true });
 */
export const authFetch = async (
  url: string,
  options: RequestInit & { auth?: boolean; idempotencyKey?: string } = {}
): Promise<Response> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  // Gắn X-Idempotency-Key nếu được truyền vào
  if (options.idempotencyKey) {
    headers["X-Idempotency-Key"] = options.idempotencyKey;
  }

  // 1. Gắn Authorization header nếu request yêu cầu auth.
  if (options.auth) {
    const token = getAccessToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  let response = await fetch(url, { ...options, headers });

  // 2. Nhận 401 → thử refresh access token.
  if (response.status === 401 && options.auth) {
    if (!isRefreshing) {
      isRefreshing = true;
      const newToken = await refreshAccessToken();
      isRefreshing = false;

      if (newToken) {
        onTokenRefreshed(newToken);
        // Retry với token mới
        headers["Authorization"] = `Bearer ${newToken}`;
        response = await fetch(url, { ...options, headers });
      } else {
        // Refresh fail → clear token, đẩy về trang login.
        clearTokens();
        window.location.href = "/login";
      }
    } else {
      // Có 1 request khác đang refresh, chờ token mới.
      await new Promise<string>((resolve) => {
        subscribeTokenRefresh(resolve);
      });
      const newToken = getAccessToken()!;
      headers["Authorization"] = `Bearer ${newToken}`;
      response = await fetch(url, { ...options, headers });
    }
  }

  return response;
};

/**
 * Parse response JSON. Ném `ApiResponseError` nếu:
 *   1. HTTP status không ok (4xx/5xx), hoặc
 *   2. HTTP 200 nhưng backend trả { success: false }
 *
 * Return type luôn bao gồm optional `error` field để pages có thể truy cập
 * error message mà không cần TypeScript strict mode complain.
 *
 * @example
 *   const json = await handleResponse<MyData>(res);
 */
export const handleResponse = async <T>(res: Response): Promise<T & { error?: { message: string; code?: string } }> => {
  const json = await res.json();

  // HTTP error → lấy message từ body.error.message hoặc body.message hoặc status text
  if (!res.ok) {
    const err = json as Partial<ApiError> & { message?: string };
    const message = err.error?.message ?? err.message ?? res.statusText;
    const code = err.error?.code ?? `HTTP_${res.status}`;
    throw new ApiResponseError(message, code);
  }

  // HTTP 200 nhưng business logic fail (VD: validation error, permission denied)
  // Backend trả về shape: { success: false, error: { message, code } }
  // Hoặc shape cũ: { success: false, message: "..." }
  const ok = json as { success?: unknown; error?: { message: string; code?: string }; message?: string };
  if (ok.success === false) {
    const message = ok.error?.message ?? ok.message ?? "Yêu cầu không thành công";
    const code = ok.error?.code ?? "API_FAIL";
    throw new ApiResponseError(message, code);
  }

  return json as T & { error?: { message: string; code?: string } };
};

/**
 * Helper tạo query string từ object params.
 * Bỏ qua giá trị undefined/null, array → join bằng dấu phẩy.
 *
 * @example
 *   buildQuery({ page: 1, ids: [1,2,3] })
 *   // → "page=1&ids=1%2C2%2C3"
 */
export const buildQuery = (params?: Record<string, unknown> | null): string => {
  if (!params) return "";
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    if (Array.isArray(v)) {
      if (v.length === 0) return;
      qs.set(k, v.join(","));
    } else {
      qs.set(k, String(v));
    }
  });
  return qs.toString() ? `?${qs.toString()}` : "";
};

export { BASE_URL };