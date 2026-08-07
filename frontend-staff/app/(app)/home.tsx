/**
 * Home Screen
 * ============================================================
 * Màn hình Dashboard chính
 */

import { useCallback } from "react";
import {
  View,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth, useLogout, useDashboardStats, useRefreshDashboard } from "../../src/hooks";
import {
  DashboardHeader,
  TodaySummaryCard,
  QuickActionCard,
  RecentActivityCard,
} from "../../src/components/home";
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from "../../src/theme";
import type { RedemptionHistoryItem } from "../../src/types";

export default function HomeScreen() {
  const router = useRouter();
  const { data: user } = useAuth();
  const logoutMutation = useLogout();
  const { data: dashboardStats, isLoading, isError, refetch } = useDashboardStats(5);
  const refreshDashboard = useRefreshDashboard();

  // Handlers
  const handleLogout = useCallback(() => {
    logoutMutation.mutate();
  }, [logoutMutation]);

  const handleScanPress = useCallback(() => {
    router.push("/(app)/scan");
  }, [router]);

  const handleManualPress = useCallback(() => {
    router.push("/(app)/manual");
  }, [router]);

  const handleViewHistory = useCallback(() => {
    router.push("/(app)/history");
  }, [router]);

  const handleRefresh = useCallback(() => {
    refreshDashboard();
  }, [refreshDashboard]);

  // Loading state
  if (isLoading && !dashboardStats) {
    return (
      <View style={styles.container}>
        <DashboardHeader user={user} onLogout={handleLogout} />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <TodaySummaryCard isLoading />
          <QuickActionCard onScanPress={handleScanPress} onManualPress={handleManualPress} />
          <RecentActivityCard
            items={[]}
            isLoading
            onViewHistory={handleViewHistory}
            onScanPress={handleScanPress}
          />
        </ScrollView>
      </View>
    );
  }

  // Error state
  if (isError && !dashboardStats) {
    return (
      <View style={styles.container}>
        <DashboardHeader user={user} onLogout={handleLogout} />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={handleRefresh} />
          }
        >
          <ErrorState onRetry={handleRefresh} />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <DashboardHeader user={user} onLogout={handleLogout} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Summary Card */}
        <TodaySummaryCard
          summary={dashboardStats?.summary}
          isLoading={isLoading}
        />

        {/* Quick Actions */}
        <QuickActionCard
          onScanPress={handleScanPress}
          onManualPress={handleManualPress}
        />

        {/* Recent Activity */}
        <RecentActivityCard
          items={dashboardStats?.recentActivity ?? []}
          isLoading={isLoading}
          onViewHistory={handleViewHistory}
          onScanPress={handleScanPress}
        />
      </ScrollView>
    </View>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <View style={styles.errorContainer}>
      <View style={styles.errorCard}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>Không thể tải dữ liệu</Text>
        <Text style={styles.errorDesc}>
          Đã xảy ra lỗi khi tải dashboard. Vui lòng thử lại.
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={onRetry}
          accessibilityLabel="Thử lại"
          accessibilityHint="Tải lại dữ liệu dashboard"
          accessibilityRole="button"
        >
          <Text style={styles.retryButtonText}>🔄 Thử lại</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxxl,
    paddingTop: spacing.lg,
  },
  errorContainer: {
    marginTop: spacing.xxl,
    paddingHorizontal: spacing.xxl,
  },
  errorCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.xxl,
    alignItems: "center",
    ...shadows.sm,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  errorTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  errorDesc: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  retryButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
});
