/**
 * ScannerHeader Component
 * ============================================================
 * Header cho màn hình scan
 */

import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors, spacing, fontSize, fontWeight, touchTarget } from "../../theme";

interface ScannerHeaderProps {
  onBack: () => void;
}

export function ScannerHeader({ onBack }: ScannerHeaderProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={onBack}
        accessibilityLabel="Quay lại"
        accessibilityHint="Quay về màn hình trước"
        accessibilityRole="button"
      >
        <Text style={styles.backIcon}>←</Text>
      </TouchableOpacity>

      <View style={styles.titleContainer}>
        <Text style={styles.title}>Quét Voucher</Text>
      </View>

      <View style={styles.placeholder} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 60,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  backButton: {
    width: touchTarget.min,
    height: touchTarget.min,
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    fontSize: 28,
    color: colors.white,
    fontWeight: fontWeight.bold,
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  placeholder: {
    width: touchTarget.min,
  },
});
