/**
 * HistorySkeleton Component
 * ============================================================
 * Skeleton loader cho history list
 */

import { View, StyleSheet } from "react-native";
import { colors, spacing, borderRadius, shadows } from "../../theme";

interface HistorySkeletonProps {
  count?: number;
}

export function HistorySkeleton({ count = 5 }: HistorySkeletonProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.item}>
          <View style={[styles.bar, { width: "70%" }]} />
          <View style={[styles.bar, { width: "40%", marginTop: 8 }]} />
          <View style={[styles.bar, { width: "85%", marginTop: 12, height: 8 }]} />
          <View
            style={[
              styles.bar,
              { width: "60%", marginTop: 8, height: 8 },
            ]}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
  },
  item: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  bar: {
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.borderLight,
  },
});
