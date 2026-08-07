/**
 * SegmentedFilter Component
 * ============================================================
 * Filter dạng segmented buttons
 */

import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows, touchTarget } from "../../theme";

export interface FilterOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedFilterProps<T extends string> {
  options: FilterOption<T>[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel?: string;
}

export function SegmentedFilter<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
}: SegmentedFilterProps<T>) {
  return (
    <View
      style={styles.container}
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
    >
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <TouchableOpacity
            key={option.value}
            style={[styles.segment, isActive && styles.segmentActive]}
            onPress={() => onChange(option.value)}
            accessibilityRole="tab"
            accessibilityLabel={option.label}
            accessibilityState={{ selected: isActive }}
            accessibilityHint={isActive ? "Đang chọn" : `Chọn ${option.label}`}
          >
            <Text style={[styles.text, isActive && styles.textActive]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: 4,
    ...shadows.sm,
  },
  segment: {
    flex: 1,
    minHeight: touchTarget.min,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  segmentActive: {
    backgroundColor: colors.primary,
  },
  text: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
  },
  textActive: {
    color: colors.white,
    fontWeight: fontWeight.semibold,
  },
});
