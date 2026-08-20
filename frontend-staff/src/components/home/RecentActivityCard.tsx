/**
 * RecentActivityCard Component
 * ============================================================
 * Card hiển thị hoạt động gần đây
 */

import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from "../../theme";
import type { RedemptionHistoryItem } from "../../types";

interface RecentActivityCardProps {
  items: RedemptionHistoryItem[];
  isLoading?: boolean;
  onViewHistory: () => void;
  onScanPress: () => void;
}

export function RecentActivityCard({
  items,
  isLoading,
  onViewHistory,
  onScanPress,
}: RecentActivityCardProps) {
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Hoạt động gần đây</Text>
        <TouchableOpacity
          onPress={onViewHistory}
          accessibilityLabel="Xem lịch sử"
          accessibilityHint="Xem toàn bộ lịch sử xác nhận"
          accessibilityRole="button"
        >
          <Text style={styles.viewAllText}>Xem tất cả</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.list}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={styles.skeletonItem}>
              <View style={[styles.skeletonLine, { width: "40%" }]} />
              <View style={[styles.skeletonLine, { width: "25%" }]} />
            </View>
          ))}
        </View>
      ) : items.length === 0 ? (
        <EmptyActivityState onScanPress={onScanPress} />
      ) : (
        <View style={styles.list}>
          {items.slice(0, 5).map((item, index) => (
            <View key={item.issuedVoucherId} style={styles.item}>
              <View style={styles.itemContent}>
                <Text style={styles.voucherTitle} numberOfLines={1}>
                  {item.voucherTitle}
                </Text>
                <Text style={styles.customerName} numberOfLines={1}>
                  {item.customerName || "Khách hàng"}
                </Text>
              </View>
              <View style={styles.itemRight}>
                <Text style={styles.timeText}>{formatTime(item.usedAt)}</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>✓</Text>
                </View>
              </View>
              {index < items.length - 1 && <View style={styles.separator} />}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function EmptyActivityState({ onScanPress }: { onScanPress: () => void }) {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📋</Text>
      <Text style={styles.emptyTitle}>Chưa có giao dịch nào hôm nay</Text>
      <Text style={styles.emptyDesc}>
        Bắt đầu xác nhận voucher để theo dõi hoạt động
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={onScanPress}
        accessibilityLabel="Quét voucher"
        accessibilityHint="Mở camera để quét voucher"
        accessibilityRole="button"
      >
        <Text style={styles.emptyButtonText}>📷 Quét voucher</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.xxl,
    paddingHorizontal: spacing.xxl,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  viewAllText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
  list: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  item: {
    paddingVertical: spacing.sm,
  },
  itemContent: {
    flex: 1,
  },
  voucherTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  customerName: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  itemRight: {
    alignItems: "flex-end",
  },
  timeText: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
    marginBottom: spacing.xs,
  },
  statusBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.successBg,
    justifyContent: "center",
    alignItems: "center",
  },
  statusText: {
    fontSize: 12,
    color: colors.success,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginTop: spacing.sm,
  },
  skeletonItem: {
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  skeletonLine: {
    height: 14,
    backgroundColor: colors.border,
    borderRadius: borderRadius.sm,
  },
  emptyContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.xxl,
    alignItems: "center",
    ...shadows.sm,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptyDesc: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  emptyButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  emptyButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
});
