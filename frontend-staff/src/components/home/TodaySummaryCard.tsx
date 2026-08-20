/**
 * TodaySummaryCard Component
 * ============================================================
 * Card hiển thị tổng kết hôm nay
 */

import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from "../../theme";

export interface TodaySummary {
  confirmedCount: number;
  pendingCount: number;
  lastConfirmedAt: string | null;
}

interface TodaySummaryCardProps {
  summary?: TodaySummary;
  isLoading?: boolean;
}

export function TodaySummaryCard({ summary, isLoading }: TodaySummaryCardProps) {
  const formatTime = (isoString: string | null) => {
    if (!isoString) return "—";
    const date = new Date(isoString);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hôm nay</Text>

      {isLoading ? (
        <View style={styles.loadingRow}>
          <View style={[styles.skeleton, { width: 60 }]} />
          <View style={[styles.skeleton, { width: 60 }]} />
        </View>
      ) : (
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{summary?.confirmedCount ?? 0}</Text>
            <Text style={styles.statLabel}>Đã xác nhận</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.statItem}>
            <Text style={styles.statValue}>{summary?.pendingCount ?? 0}</Text>
            <Text style={styles.statLabel}>Đang chờ</Text>
          </View>
        </View>
      )}

      <View style={styles.lastRow}>
        <Text style={styles.lastLabel}>Lần xác nhận gần nhất:</Text>
        <Text style={styles.lastValue}>
          {isLoading ? "..." : formatTime(summary?.lastConfirmedAt ?? null)}
        </Text>
      </View>
    </View>
  );
}

// Skeleton placeholder
export function TodaySummarySkeleton() {
  return <TodaySummaryCard isLoading />;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginHorizontal: spacing.xxl,
    marginTop: -spacing.lg,
    ...shadows.md,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginBottom: spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: fontSize.display,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  statLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  lastRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  lastLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  lastValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
  },
  skeleton: {
    height: 32,
    backgroundColor: colors.border,
    borderRadius: borderRadius.sm,
    flex: 1,
    marginHorizontal: spacing.sm,
  },
});
