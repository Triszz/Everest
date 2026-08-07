/**
 * BranchCard Component
 * ============================================================
 * Hiển thị danh sách chi nhánh áp dụng
 */

import { View, Text, StyleSheet } from "react-native";
import type { BranchInfo } from "../../types";
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from "../../theme";

interface BranchCardProps {
  branches: BranchInfo[];
  currentBranchId?: number;
  partnerName?: string;
}

export function BranchCard({
  branches,
  currentBranchId,
  partnerName,
}: BranchCardProps) {
  const currentBranch = branches.find((b) => b.branchId === currentBranchId);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Chi nhánh áp dụng</Text>

      {/* Partner name */}
      {partnerName && (
        <View style={styles.partnerRow}>
          <Text style={styles.partnerLabel}>Đối tác:</Text>
          <Text style={styles.partnerValue}>{partnerName}</Text>
        </View>
      )}

      {/* Current branch badge */}
      {currentBranch && (
        <View style={styles.currentBadge}>
          <Text style={styles.currentIcon}>📍</Text>
          <Text style={styles.currentText}>
            Chi nhánh hiện tại: {currentBranch.branchName}
          </Text>
        </View>
      )}

      {/* Branch list */}
      <View style={styles.list}>
        {branches.map((branch, index) => {
          const isCurrent = branch.branchId === currentBranchId;

          return (
            <View
              key={branch.branchId}
              style={[
                styles.branchItem,
                index < branches.length - 1 && styles.branchItemBorder,
              ]}
            >
              <View style={styles.branchContent}>
                <View style={styles.branchNameRow}>
                  <Text style={styles.branchIcon}>🏪</Text>
                  <Text
                    style={[
                      styles.branchName,
                      isCurrent && styles.branchNameCurrent,
                    ]}
                  >
                    {branch.branchName}
                  </Text>
                </View>

                {branch.address && (
                  <Text style={styles.branchAddress} numberOfLines={1}>
                    {branch.address}
                  </Text>
                )}

                {branch.phoneNumber && (
                  <Text style={styles.branchPhone}>{branch.phoneNumber}</Text>
                )}
              </View>

              {isCurrent && (
                <View style={styles.currentTag}>
                  <Text style={styles.currentTagText}>Hiện tại</Text>
                </View>
              )}
            </View>
          );
        })}
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
  partnerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  partnerLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginRight: spacing.sm,
  },
  partnerValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
    flex: 1,
  },
  currentBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.successBg,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.md,
  },
  currentIcon: {
    fontSize: fontSize.sm,
    marginRight: spacing.xs,
  },
  currentText: {
    fontSize: fontSize.sm,
    color: colors.success,
    fontWeight: fontWeight.medium,
  },
  list: {
    gap: 0,
  },
  branchItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  branchItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  branchContent: {
    flex: 1,
  },
  branchNameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  branchIcon: {
    fontSize: fontSize.sm,
    marginRight: spacing.xs,
  },
  branchName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
  },
  branchNameCurrent: {
    color: colors.primary,
  },
  branchAddress: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.lg,
    marginBottom: spacing.xs,
  },
  branchPhone: {
    fontSize: fontSize.sm,
    color: colors.textTertiary,
    marginLeft: spacing.lg,
  },
  currentTag: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  currentTagText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
});
