/**
 * Offline Detection
 * ============================================================
 * Simple offline detection based on error types
 */

import { ApiError, NetworkError } from "../api/client";

/**
 * Check if error is a network/offline error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof NetworkError) return true;

  // Check for common network error codes
  if (error instanceof ApiError) {
    return error.code === "NETWORK_ERROR" || error.code === "TIMEOUT";
  }

  return false;
}

/**
 * Check if error is a timeout error
 */
export function isTimeoutError(error: unknown): boolean {
  if (error instanceof NetworkError) {
    return error.message.includes("timeout");
  }
  return false;
}
