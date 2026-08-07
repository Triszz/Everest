/**
 * QuickActionCard Component
 * ============================================================
 * Card hành động nhanh - Quét QR và Nhập mã
 */

import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows, touchTarget } from "../../theme";

interface QuickActionCardProps {
  onScanPress: () => void;
  onManualPress: () => void;
}

export function QuickActionCard({ onScanPress, onManualPress }: QuickActionCardProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Thao tác nhanh</Text>

      <View style={styles.cardsRow}>
        {/* Scan QR Card */}
        <TouchableOpacity
          style={styles.card}
          onPress={onScanPress}
          activeOpacity={0.8}
          accessibilityLabel="Quét mã QR"
          accessibilityHint="Mở camera để quét mã voucher"
          accessibilityRole="button"
        >
          <View style={[styles.iconContainer, { backgroundColor: colors.successBg }]}>
            <Text style={styles.icon}>📷</Text>
          </View>
          <Text style={styles.cardTitle}>Quét QR</Text>
          <Text style={styles.cardDesc}>Quét mã voucher</Text>
        </TouchableOpacity>

        {/* Manual Input Card */}
        <TouchableOpacity
          style={styles.card}
          onPress={onManualPress}
          activeOpacity={0.8}
          accessibilityLabel="Nhập mã voucher"
          accessibilityHint="Nhập mã voucher thủ công"
          accessibilityRole="button"
        >
          <View style={[styles.iconContainer, { backgroundColor: colors.infoBg }]}>
            <Text style={styles.icon}>⌨️</Text>
          </View>
          <Text style={styles.cardTitle}>Nhập mã</Text>
          <Text style={styles.cardDesc}>Nhập mã thủ công</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.xxl,
    paddingHorizontal: spacing.xxl,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  cardsRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  card: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: "center",
    minHeight: 120,
    ...shadows.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  icon: {
    fontSize: 24,
  },
  cardTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  cardDesc: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textAlign: "center",
  },
});
