/**
 * CustomerCard Component
 * ============================================================
 * Hiển thị thông tin khách hàng
 */

import { View, Text, StyleSheet } from "react-native";
import type { CustomerInfo } from "../../types";
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from "../../theme";

interface CustomerCardProps {
  customer: CustomerInfo;
}

export function CustomerCard({ customer }: CustomerCardProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Thông tin khách hàng</Text>

      <View style={styles.content}>
        {/* Avatar placeholder */}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {customer.fullName?.charAt(0)?.toUpperCase() ?? "K"}
          </Text>
        </View>

        {/* Info */}
        <View style={styles.info}>
          {customer.fullName && (
            <View style={styles.row}>
              <Text style={styles.label}>Tên:</Text>
              <Text style={styles.value}>{customer.fullName}</Text>
            </View>
          )}

          <View style={styles.row}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value} numberOfLines={1}>
              {customer.email}
            </Text>
          </View>

          {customer.phoneNumber && (
            <View style={styles.row}>
              <Text style={styles.label}>Điện thoại:</Text>
              <Text style={styles.value}>{customer.phoneNumber}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  content: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.infoBg,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.info,
  },
  info: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    width: 80,
  },
  value: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    flex: 1,
  },
});
