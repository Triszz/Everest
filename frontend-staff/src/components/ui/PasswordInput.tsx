/**
 * PasswordInput Component
 * ============================================================
 * Input cho password với show/hide toggle
 */

import { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  type TextInputProps,
} from "react-native";
import { colors, spacing, borderRadius, fontSize, touchTarget, shadows } from "../../theme";

interface PasswordInputProps extends Omit<TextInputProps, "secureTextEntry"> {
  label?: string;
  error?: string;
  value: string;
  onChangeText: (text: string) => void;
}

export function PasswordInput({
  label,
  error,
  value,
  onChangeText,
  ...props
}: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputContainer, error && styles.inputError]}>
        <TextInput
          style={styles.input}
          placeholderTextColor={colors.textTertiary}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!isVisible}
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="password"
          {...props}
        />
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => setIsVisible(!isVisible)}
          accessibilityLabel={isVisible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          accessibilityRole="button"
        >
          <Text style={styles.toggleIcon}>{isVisible ? "🙈" : "👁️"}</Text>
        </TouchableOpacity>
      </View>
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
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  inputError: {
    borderColor: colors.danger,
  },
  input: {
    flex: 1,
    height: touchTarget.large,
    paddingHorizontal: spacing.lg,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  toggleButton: {
    width: touchTarget.min,
    height: touchTarget.min,
    justifyContent: "center",
    alignItems: "center",
    paddingRight: spacing.sm,
  },
  toggleIcon: {
    fontSize: 20,
  },
  errorText: {
    fontSize: fontSize.sm,
    color: colors.danger,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
});
