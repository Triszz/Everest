/**
 * DashboardHeader Component
 * ============================================================
 * Header hiển thị thông tin user đang đăng nhập
 */

import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors, spacing, borderRadius, fontSize, fontWeight, touchTarget } from "../../theme";
import type { User } from "../../types";

interface DashboardHeaderProps {
  user: User | null | undefined;
  onLogout: () => void;
}

export function DashboardHeader({ user, onLogout }: DashboardHeaderProps) {
  const roleLabel = user?.role === "Partner_Owner" ? "Chủ cửa hàng" : "Thu ngân";

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.greeting}>Xin chào!</Text>
        <Text style={styles.userName}>{user?.fullName || "Nhân viên"}</Text>

        <View style={styles.badgeRow}>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{roleLabel}</Text>
          </View>
        </View>

        {user?.branchName && (
          <View style={styles.branchRow}>
            <Text style={styles.branchIcon}>📍</Text>
            <Text style={styles.branchText}>{user.branchName}</Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={onLogout}
        accessibilityLabel="Đăng xuất"
        accessibilityHint="Nhấn để đăng xuất khỏi ứng dụng"
        accessibilityRole="button"
      >
        <Text style={styles.logoutIcon}>🚪</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    paddingTop: 60,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.xxl,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  content: {
    flex: 1,
  },
  greeting: {
    fontSize: fontSize.md,
    color: colors.white,
    opacity: 0.8,
    marginBottom: spacing.xs,
  },
  userName: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.sm,
  },
  badgeRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  roleBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  roleText: {
    fontSize: fontSize.sm,
    color: colors.white,
    fontWeight: fontWeight.medium,
  },
  branchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  branchIcon: {
    fontSize: fontSize.sm,
  },
  branchText: {
    fontSize: fontSize.sm,
    color: colors.white,
    opacity: 0.9,
  },
  logoutButton: {
    width: touchTarget.min,
    height: touchTarget.min,
    justifyContent: "center",
    alignItems: "center",
  },
  logoutIcon: {
    fontSize: 24,
  },
});
