/**
 * StatusBadge Component
 * ============================================================
 * Hiển thị badge cho voucher status
 */

import { View, Text, StyleSheet } from "react-native";
import { STATUS_CONFIG } from "../../constants";
import { colors, spacing, borderRadius, fontSize, fontWeight } from "../../theme";
import type { RedemptionStatusCode } from "../../types";

interface StatusBadgeProps {
  status: RedemptionStatusCode;
  size?: "small" | "normal" | "large";
}

export function StatusBadge({ status, size = "normal" }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.UNKNOWN_ERROR;

  const sizeStyles = {
    small: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      fontSize: fontSize.xs,
    },
    normal: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      fontSize: fontSize.sm,
    },
    large: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      fontSize: fontSize.md,
    },
  };

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: config.bgColor },
        sizeStyles[size],
      ]}
      accessibilityLabel={`Trạng thái: ${config.label}`}
    >
      <Text style={[styles.text, { color: config.color }, sizeStyles[size]]}>
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: borderRadius.full,
    alignSelf: "flex-start",
  },
  text: {
    fontWeight: fontWeight.semibold,
  },
});
