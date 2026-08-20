/**
 * Auth Hooks - React Query hooks cho authentication
 * ============================================================
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";
import { login, logout } from "../services/auth.service";
import { STORAGE_KEYS, QUERY_KEYS, NAV_ROUTES } from "../constants";
import type { LoginRequest, User } from "../types";

// Query key
const AUTH_KEY = ["auth", "user"] as const;

/**
 * Get current auth state
 */
export function useAuth() {
  return useQuery({
    queryKey: AUTH_KEY,
    queryFn: async (): Promise<User | null> => {
      const token = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
      const userData = await SecureStore.getItemAsync(STORAGE_KEYS.USER_DATA);

      if (!token || !userData) {
        return null;
      }

      try {
        return JSON.parse(userData) as User;
      } catch {
        return null;
      }
    },
    retry: false,
    staleTime: Infinity,
  });
}

/**
 * Check if user is authenticated
 */
export function useIsAuthenticated() {
  const { data: user, isLoading } = useAuth();
  return { isAuthenticated: !!user, isLoading };
}

/**
 * Login mutation
 */
export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginRequest) => login(credentials),
    onSuccess: async (result) => {
      if (result.success && result.data) {
        const { user, accessToken, refreshToken } = result.data;

        // Lưu user data (chỉ phần user, không kèm tokens)
        await SecureStore.setItemAsync(
          STORAGE_KEYS.USER_DATA,
          JSON.stringify(user),
        );

        // Lưu access token (JWT)
        await SecureStore.setItemAsync(
          STORAGE_KEYS.ACCESS_TOKEN,
          accessToken,
        );

        // Lưu refresh token (nếu có)
        if (refreshToken) {
          await SecureStore.setItemAsync(
            STORAGE_KEYS.REFRESH_TOKEN,
            refreshToken,
          );
        }

        // Invalidate auth query
        queryClient.invalidateQueries({ queryKey: AUTH_KEY });

        // Navigate to home
        router.replace(NAV_ROUTES.APP.HOME);
      }
    },
  });
}

/**
 * Logout mutation
 */
export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSettled: async () => {
      // Clear storage
      await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA);

      // Clear queries
      queryClient.clear();

      // Navigate to login
      router.replace(NAV_ROUTES.AUTH.LOGIN);
    },
  });
}
