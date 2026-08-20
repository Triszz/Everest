/**
 * AppLogo Component
 * ============================================================
 * Logo cho màn hình Login
 */

import { View, Text, StyleSheet } from "react-native";
import { colors, borderRadius, shadows } from "../../theme";

interface AppLogoProps {
  size?: "normal" | "large";
}

export function AppLogo({ size = "normal" }: AppLogoProps) {
  const isLarge = size === "large";

  return (
    <View style={[styles.container, isLarge && styles.containerLarge]}>
      <View style={[styles.iconWrapper, isLarge && styles.iconWrapperLarge]}>
        <Text style={styles.icon}>🎫</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    ...shadows.lg,
  },
  containerLarge: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.xxl,
  },
  iconWrapper: {
    justifyContent: "center",
    alignItems: "center",
  },
  iconWrapperLarge: {},
  icon: {
    fontSize: 32,
  },
});
