/**
 * Environment Configuration
 * ============================================================
 * Cấu hình environment variables cho frontend-staff
 *
 * Sử dụng EXPO_PUBLIC_ prefix để expose cho client
 * @see https://docs.expo.dev/guides/environment-variables/
 */

const getEnvVar = (key: string, fallback: string): string => {
  // Expo tự động expose các biến bắt đầu bằng EXPO_PUBLIC_
  const value = process.env[key];
  if (!value) {
    if (process.env.NODE_ENV === "development") {
      console.warn(`[ENV] Missing ${key}, using fallback: ${fallback}`);
    }
    return fallback;
  }
  return value;
};

// API Configuration
export const ENV = {
  API: {
    BASE_URL: getEnvVar("EXPO_PUBLIC_API_URL", "http://192.168.1.13:3000/api"),
    TIMEOUT: 15000, // ms
    RETRY_ATTEMPTS: 2,
  },

  // App info
  APP: {
    NAME: "Staff Partner",
    VERSION: "1.0.0",
    SCHEME: "staffpartner",
  },

  // Feature flags
  FEATURES: {
    ENABLE_DEBUG_LOGS: process.env.NODE_ENV === "development",
    ENABLE_ANALYTICS: false,
  },
} as const;

// Type-safe env access
export type EnvConfig = typeof ENV;
