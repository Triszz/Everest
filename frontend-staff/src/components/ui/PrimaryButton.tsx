/**
 * PrimaryButton Component
 * ============================================================
 * Nút bấm chính với loading state và disabled
 */

import { type ReactNode } from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  type ViewStyle,
  type TextStyle,
} from "react-native";
import { colors, spacing, borderRadius, fontSize, fontWeight, touchTarget, shadows } from "../../theme";

interface PrimaryButtonProps {
  onPress: () => void;
  children: ReactNode;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary" | "danger";
  size?: "normal" | "large";
  style?: ViewStyle;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export function PrimaryButton({
  onPress,
  children,
  disabled = false,
  loading = false,
  variant = "primary",
  size = "normal",
  style,
  accessibilityLabel,
  accessibilityHint,
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;

  const buttonStyle: ViewStyle[] = [
    styles.button,
    styles[variant],
    size === "large" && styles.large,
    isDisabled && styles.disabled,
    style as ViewStyle,
  ].filter(Boolean) as ViewStyle[];

  const textStyle: TextStyle[] = [
    styles.text,
    styles[`${variant}Text` as keyof typeof styles] as TextStyle,
    isDisabled && styles.disabledText,
  ].filter(Boolean) as TextStyle[];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "secondary" ? colors.primary : colors.white}
          size="small"
        />
      ) : (
        <Text style={textStyle}>{children}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: touchTarget.large,
    borderRadius: borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    ...shadows.md,
  },
  large: {
    minHeight: 56,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  danger: {
    backgroundColor: colors.danger,
  },
  disabled: {
    backgroundColor: colors.textTertiary,
    borderColor: colors.textTertiary,
  },
  text: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  primaryText: {
    color: colors.white,
  },
  secondaryText: {
    color: colors.primary,
  },
  dangerText: {
    color: colors.white,
  },
  disabledText: {
    color: colors.textSecondary,
  },
});
