/**
 * FormInput Component
 * ============================================================
 * Reusable input với label và error
 */

import {
  View,
  TextInput,
  Text,
  StyleSheet,
  type TextInputProps,
} from "react-native";
import { colors, spacing, borderRadius, fontSize, touchTarget, shadows } from "../../theme";

interface FormInputProps extends TextInputProps {
  label?: string;
  error?: string;
  value: string;
  onChangeText: (text: string) => void;
}

export function FormInput({
  label,
  error,
  value,
  onChangeText,
  style,
  ...props
}: FormInputProps) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, error && styles.inputError, style]}
        placeholderTextColor={colors.textTertiary}
        value={value}
        onChangeText={onChangeText}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: "500",
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  input: {
    height: touchTarget.large,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  inputError: {
    borderColor: colors.danger,
  },
  errorText: {
    fontSize: fontSize.sm,
    color: colors.danger,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
});
