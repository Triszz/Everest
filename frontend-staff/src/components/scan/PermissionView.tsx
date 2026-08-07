/**
 * PermissionView Component
 * ============================================================
 * Hiển thị khi camera permission bị denied
 */

import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows, touchTarget } from "../../theme";
import { PrimaryButton } from "../ui";

interface PermissionViewProps {
  onRequestPermission: () => void;
  onOpenSettings: () => void;
  isDenied: boolean;
}

export function PermissionView({
  onRequestPermission,
  onOpenSettings,
  isDenied,
}: PermissionViewProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>📷</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>
          {isDenied ? "Quyền Camera bị từ chối" : "Cần quyền Camera"}
        </Text>

        {/* Description */}
        <Text style={styles.description}>
          {isDenied
            ? "Bạn đã từ chối quyền truy cập Camera. Vui lòng cấp quyền để quét mã voucher."
            : "Ứng dụng cần quyền truy cập Camera để quét mã voucher."}
        </Text>

        {/* Buttons */}
        <View style={styles.buttons}>
          {!isDenied ? (
            <PrimaryButton
              onPress={onRequestPermission}
              size="large"
              accessibilityLabel="Cấp quyền Camera"
              accessibilityHint="Cho phép ứng dụng truy cập Camera"
            >
              📷 Cấp quyền
            </PrimaryButton>
          ) : (
            <>
              <PrimaryButton
                onPress={onRequestPermission}
                size="large"
                accessibilityLabel="Thử lại"
                accessibilityHint="Yêu cầu cấp quyền Camera"
              >
                🔄 Thử lại
              </PrimaryButton>

              <TouchableOpacity
                style={styles.settingsButton}
                onPress={onOpenSettings}
                accessibilityLabel="Mở cài đặt"
                accessibilityHint="Mở cài đặt ứng dụng để cấp quyền"
                accessibilityRole="button"
              >
                <Text style={styles.settingsButtonText}>⚙️ Mở cài đặt</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xxl,
  },
  content: {
    alignItems: "center",
    maxWidth: 320,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.infoBg,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  icon: {
    fontSize: 48,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  description: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: spacing.xxl,
  },
  buttons: {
    width: "100%",
    gap: spacing.md,
  },
  settingsButton: {
    height: touchTarget.large,
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.md,
  },
  settingsButtonText: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
});
