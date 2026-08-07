/**
 * ResultBanner Component
 * ============================================================
 * Banner hiển thị kết quả confirm
 */

import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import {
  colors,
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
  shadows,
} from "../../theme";
import type { ConfirmSuccessData } from "../../types";

type ResultType = "success" | "error";

interface ResultBannerProps {
  type: ResultType;
  title: string;
  message: string;
  data?: ConfirmSuccessData;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
  primaryActionLabel?: string;
  secondaryActionLabel?: string;
}

export function ResultBanner({
  type,
  title,
  message,
  data,
  onPrimaryAction,
  onSecondaryAction,
  primaryActionLabel = "Quét voucher mới",
  secondaryActionLabel = "Quay lại Dashboard",
}: ResultBannerProps) {
  const isSuccess = type === "success";

  return (
    <View
      style={[
        styles.container,
        isSuccess ? styles.successContainer : styles.errorContainer,
      ]}
    >
      {/* Icon */}
      <View
        style={[
          styles.iconContainer,
          isSuccess ? styles.successIcon : styles.errorIcon,
        ]}
      >
        <Text style={styles.icon}>{isSuccess ? "✅" : "❌"}</Text>
      </View>

      {/* Title */}
      <Text
        style={[
          styles.title,
          isSuccess ? styles.successTitle : styles.errorTitle,
        ]}
      >
        {title}
      </Text>

      {/* Message */}
      <Text style={styles.message}>{message}</Text>

      {/* Data (if success) */}
      {data && isSuccess && (
        <View style={styles.dataContainer}>
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Mã voucher:</Text>
            <Text style={styles.dataValue}>{data.voucherCode}</Text>
          </View>
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Thời gian:</Text>
            <Text style={styles.dataValue}>
              {new Date(data.usedAt).toLocaleString("vi-VN")}
            </Text>
          </View>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        {onSecondaryAction && (
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onSecondaryAction}
            accessibilityLabel={secondaryActionLabel}
            accessibilityRole="button"
          >
            <Text style={styles.secondaryButtonText}>
              {secondaryActionLabel}
            </Text>
          </TouchableOpacity>
        )}

        {onPrimaryAction && (
          <TouchableOpacity
            style={[
              styles.primaryButton,
              !onSecondaryAction && styles.primaryButtonFull,
            ]}
            onPress={onPrimaryAction}
            accessibilityLabel={primaryActionLabel}
            accessibilityRole="button"
          >
            <Text style={styles.primaryButtonText}>{primaryActionLabel}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    alignItems: "center",
    ...shadows.lg,
  },
  successContainer: {
    backgroundColor: colors.white,
  },
  errorContainer: {
    backgroundColor: colors.white,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  successIcon: {
    backgroundColor: colors.successBg,
  },
  errorIcon: {
    backgroundColor: colors.dangerBg,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  successTitle: {
    color: colors.success,
  },
  errorTitle: {
    color: colors.danger,
  },
  message: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  dataContainer: {
    width: "100%",
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  dataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  dataLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  dataValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
  },
  actions: {
    width: "100%",
    gap: spacing.md,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: "center",
    minHeight: 48,
    justifyContent: "center",
  },
  primaryButtonFull: {
    flex: 1,
  },
  primaryButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
  secondaryButton: {
    backgroundColor: colors.white,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: "center",
    minHeight: 48,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
  },
});
