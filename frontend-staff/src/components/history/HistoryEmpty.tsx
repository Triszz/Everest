/**
 * HistoryEmpty Component
 * ============================================================
 * Empty state cho history
 */

import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows, touchTarget } from "../../theme";

interface HistoryEmptyProps {
  onScanPress: () => void;
}

export function HistoryEmpty({ onScanPress }: HistoryEmptyProps) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.icon}>📋</Text>
        <Text style={styles.title}>Chưa có lịch sử</Text>
        <Text style={styles.description}>
          Bạn chưa xác nhận voucher nào. Hãy bắt đầu quét hoặc nhập mã voucher.
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={onScanPress}
          accessibilityLabel="Quét voucher"
          accessibilityHint="Mở màn hình quét QR để bắt đầu"
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>📷 Quét voucher</Text>
        </TouchableOpacity>
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
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    minHeight: touchTarget.min,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
});
