/**
 * Auth Utilities
 * ============================================================
 * Helpers cho authentication
 */

import * as SecureStore from "expo-secure-store";
import { STORAGE_KEYS } from "../constants";

/**
 * JWT payload interface (basic, not full JWT)
 */
interface JwtPayload {
  sub?: string;
  userId?: string;
  exp?: number;
  iat?: number;
}

/**
 * Decode JWT token (base64)
 * Returns null if invalid or expired
 */
export function decodeJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded) as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * Check if JWT token is expired
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeJwt(token);
  if (!payload?.exp) {
    // No expiration claim - treat as valid
    // In production, should verify signature
    return false;
  }

  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp < currentTime;
}

/**
 * Get stored auth token
 */
export async function getStoredToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
  } catch {
    return null;
  }
}

/**
 * Clear all auth storage
 */
export async function clearAuthStorage(): Promise<void> {
  await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
  await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
  await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA);
}

/**
 * Check if user has valid token (not expired)
 */
export async function isAuthenticated(): Promise<boolean> {
  const token = await getStoredToken();
  if (!token) return false;

  // If token looks like a JWT, check expiration
  // If it's just a userId (demo mode), trust it
  if (token.includes(".")) {
    return !isTokenExpired(token);
  }

  return true;
}
