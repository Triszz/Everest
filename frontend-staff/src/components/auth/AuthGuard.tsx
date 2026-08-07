/**
 * AuthGuard Component
 * ============================================================
 * Bảo vệ routes yêu cầu authentication
 *
 * Features:
 * - Check token expiration (JWT)
 * - Redirect khi chưa login
 * - Prevent back to login when authenticated
 * - Handle loading state
 */

import { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter, useSegments } from "expo-router";
import { useAuth } from "../../hooks/useAuth";
import { isTokenExpired, clearAuthStorage } from "../../utils/auth";
import { colors } from "../../theme";
import type { ReactNode } from "react";

interface AuthGuardProps {
  children: ReactNode;
  loadingFallback?: ReactNode;
}

export function AuthGuard({ children, loadingFallback }: AuthGuardProps) {
  const router = useRouter();
  const segments = useSegments();
  const { data: user, isLoading: isAuthLoading } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  const isInAuthGroup = segments[0] === "(auth)";
  const isAuthenticated = !!user;

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check token expiration for additional security
        // Note: This is a client-side check only - backend still validates
        const { getStoredToken } = await import("../../utils/auth");
        const token = await getStoredToken();

        if (token && token.includes(".")) {
          if (isTokenExpired(token)) {
            // Token expired - clear and redirect
            await clearAuthStorage();
            if (!isInAuthGroup) {
              router.replace("/(auth)/login");
              return;
            }
          }
        }
      } catch {
        // Continue with normal auth check
      } finally {
        setIsChecking(false);
      }
    };

    if (!isAuthLoading) {
      checkAuth();
    }
  }, [isAuthLoading, isInAuthGroup]);

  useEffect(() => {
    // Skip if still checking auth or loading
    if (isChecking || isAuthLoading) return;

    // Not authenticated + not in auth group → redirect to login
    if (!isAuthenticated && !isInAuthGroup) {
      router.replace("/(auth)/login");
      return;
    }

    // Authenticated + in auth group → redirect to home
    if (isAuthenticated && isInAuthGroup) {
      router.replace("/(app)/home");
    }
  }, [isChecking, isAuthLoading, isAuthenticated, isInAuthGroup]);

  // Loading state
  if (isChecking || isAuthLoading) {
    if (loadingFallback) return <>{loadingFallback}</>;

    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Not authenticated + in auth group → show login (no redirect loop)
  if (!isAuthenticated && isInAuthGroup) {
    return <>{children}</>;
  }

  // Not authenticated + not in auth group → show loading (will redirect)
  if (!isAuthenticated) {
    if (loadingFallback) return <>{loadingFallback}</>;

    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Authenticated → show protected content
  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
});
