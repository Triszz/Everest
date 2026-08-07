/**
 * SearchNoResults Component
 * ============================================================
 * Empty state khi search không có kết quả
 */

import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows, touchTarget } from "../../theme";

interface SearchNoResultsProps {
  searchQuery?: string;
  onClearFilter: () => void;
}

export function SearchNoResults({
  searchQuery,
  onClearFilter,
}: SearchNoResultsProps) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.icon}>🔍</Text>
        <Text style={styles.title}>Không tìm thấy kết quả</Text>
        <Text style={styles.description}>
          {searchQuery
            ? `Không có voucher nào khớp với "${searchQuery}"`
            : "Không có voucher nào trong khoảng thời gian này"}
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={onClearFilter}
          accessibilityLabel="Xóa bộ lọc"
          accessibilityHint="Xóa tất cả bộ lọc để xem toàn bộ lịch sử"
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>Xóa bộ lọc</Text>
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
