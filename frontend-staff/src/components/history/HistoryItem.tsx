/**
 * HistoryItem Component
 * ============================================================
 * Item hiển thị trong History list
 */

import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import type { RedemptionHistoryItem } from "../../types";
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows, touchTarget } from "../../theme";

interface HistoryItemProps {
  item: RedemptionHistoryItem;
  onPress: () => void;
}

export function HistoryItemComponent({ item, onPress }: HistoryItemProps) {
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityLabel={`Voucher ${item.voucherCode} - ${item.voucherTitle}`}
      accessibilityHint="Nhấn để xem chi tiết voucher"
      accessibilityRole="button"
    >
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>
          {item.voucherTitle}
        </Text>
        <Text style={styles.code}>{item.voucherCode}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.icon}>👤</Text>
        <Text style={styles.value} numberOfLines={1}>
          {item.customerName ?? item.customerEmail}
        </Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <Text style={styles.icon}>📍</Text>
          <Text style={styles.footerText} numberOfLines={1}>
            {item.branchName}
          </Text>
        </View>

        <View style={styles.footerItem}>
          <Text style={styles.icon}>🕐</Text>
          <Text style={styles.footerText}>
            {formatDate(item.usedAt)} • {formatTime(item.usedAt)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    minHeight: touchTarget.large,
    ...shadows.sm,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginRight: spacing.sm,
  },
  code: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.primary,
    fontFamily: "monospace",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  value: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
    flex: 1,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
  },
  footerItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  footerText: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
    marginLeft: spacing.xs,
    flex: 1,
  },
  icon: {
    fontSize: fontSize.sm,
  },
});
