/**
 * API Client - Axios instance
 * ============================================================
 * Cấu hình Axios với interceptors cho auth token và error handling
 */

import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig } from "axios";
import * as SecureStore from "expo-secure-store";
import { ENV, STORAGE_KEYS } from "../constants";

// Custom error types
export class ApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class NetworkError extends ApiError {
  constructor(message = "Không thể kết nối server") {
    super(message, "NETWORK_ERROR");
    this.name = "NetworkError";
  }
}

export class TimeoutError extends ApiError {
  constructor() {
    super("Yêu cầu bị timeout. Vui lòng thử lại.", "TIMEOUT");
    this.name = "TimeoutError";
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = "Phiên đăng nhập đã hết hạn") {
    super(message, "UNAUTHORIZED", 401);
    this.name = "UnauthorizedError";
  }
}

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: ENV.API.BASE_URL,
  timeout: ENV.API.TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - attach token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Ignore storage errors in request interceptor
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle network errors
    if (!error.response) {
      if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
        return Promise.reject(new TimeoutError());
      }
      return Promise.reject(new NetworkError());
    }

    // Handle 401 - Token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Clear storage
        await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
        await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
        await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA);
      } catch {
        // Ignore storage errors
      }

      return Promise.reject(new UnauthorizedError());
    }

    // Extract error from response
    const errorData = error.response?.data as {
      success?: boolean;
      error?: { code?: string; message?: string };
      message?: string;
    };

    if (errorData?.error?.message) {
      return Promise.reject(
        new ApiError(
          errorData.error.message,
          errorData.error.code ?? "API_ERROR",
          error.response?.status,
        ),
      );
    }

    // Default error
    return Promise.reject(
      new ApiError(
        error.message || "Đã xảy ra lỗi",
        "UNKNOWN_ERROR",
        error.response?.status,
      ),
    );
  },
);

export { apiClient };
export type { AxiosInstance, AxiosError };
