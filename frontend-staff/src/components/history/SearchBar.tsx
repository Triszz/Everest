/**
 * SearchBar Component
 * ============================================================
 * Search bar với debounce, clear button, và loading indicator
 */

import { useState, useEffect, useRef } from "react";
import { View, TextInput, StyleSheet, TouchableOpacity, Text, ActivityIndicator } from "react-native";
import { colors, spacing, borderRadius, fontSize, fontWeight, touchTarget, shadows } from "../../theme";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  debounceMs?: number;
  isLoading?: boolean;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = "Tìm kiếm...",
  debounceMs = 400,
  isLoading = false,
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChangeText(localValue);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localValue, debounceMs, onChangeText, value]);

  const handleClear = () => {
    setLocalValue("");
    onChangeText("");
    // Keep focus after clear
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const showClear = localValue.length > 0 && !isLoading;

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🔍</Text>

      <TextInput
        ref={inputRef}
        style={styles.input}
        value={localValue}
        onChangeText={setLocalValue}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        accessibilityLabel="Tìm kiếm voucher"
        accessibilityHint="Nhập mã voucher hoặc tên khách hàng"
      />

      {isLoading && (
        <ActivityIndicator
          size="small"
          color={colors.primary}
          style={styles.indicator}
          accessibilityLabel="Đang tìm kiếm"
        />
      )}

      {showClear && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={handleClear}
          accessibilityLabel="Xóa tìm kiếm"
          accessibilityRole="button"
        >
          <Text style={styles.clearIcon}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: touchTarget.min,
    paddingHorizontal: spacing.md,
    ...shadows.sm,
  },
  icon: {
    fontSize: fontSize.md,
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    height: touchTarget.min,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    paddingVertical: 0,
  },
  indicator: {
    marginLeft: spacing.sm,
  },
  clearButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: spacing.xs,
  },
  clearIcon: {
    fontSize: 14,
    color: colors.textTertiary,
  },
});
