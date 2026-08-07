/**
 * OfflineState Component
 * ============================================================
 * Hiển thị khi mất kết nối Internet
 */

import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from "../../theme";

interface OfflineStateProps {
  onRetry?: () => void;
}

export function OfflineState({ onRetry }: OfflineStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.icon}>📡</Text>
        <Text style={styles.title}>Không có kết nối</Text>
        <Text style={styles.description}>
          Vui lòng kiểm tra kết nối Internet và thử lại.
        </Text>
        {onRetry && (
          <TouchableOpacity
            style={styles.retryButton}
            onPress={onRetry}
            accessibilityLabel="Thử lại"
            accessibilityHint="Kết nối lại để tải dữ liệu"
            accessibilityRole="button"
          >
            <Text style={styles.retryButtonText}>🔄 Thử lại</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xxl,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.xxl,
    alignItems: "center",
    width: "100%",
    maxWidth: 320,
    ...shadows.md,
  },
  icon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  description: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    minHeight: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  retryButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
});
