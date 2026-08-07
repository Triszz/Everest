/**
 * ScanLoadingOverlay Component
 * ============================================================
 * Loading overlay hiển thị trong lúc validate
 */

import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from "../../theme";

interface ScanLoadingOverlayProps {
  message?: string;
}

export function ScanLoadingOverlay({
  message = "Đang kiểm tra voucher...",
}: ScanLoadingOverlayProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ActivityIndicator size="large" color={colors.white} />

        <Text style={styles.message}>{message}</Text>

        <Text style={styles.hint}>
          Vui lòng chờ trong giây lát
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  content: {
    backgroundColor: colors.textPrimary,
    borderRadius: borderRadius.lg,
    padding: spacing.xxl,
    alignItems: "center",
    minWidth: 200,
    ...shadows.lg,
  },
  message: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.white,
    marginTop: spacing.lg,
    textAlign: "center",
  },
  hint: {
    fontSize: fontSize.sm,
    color: "rgba(255,255,255,0.7)",
    marginTop: spacing.sm,
    textAlign: "center",
  },
});
