/**
 * Manual Input Screen
 * ============================================================
 * Màn hình nhập thủ công mã voucher
 *
 * Features:
 * - Input mã voucher với validation
 * - Gọi validate API
 * - Navigate đến Voucher Detail
 * - Hiển thị lỗi inline
 */

import { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { validateAndParseQr } from "../../src/utils/qr";
import { useValidateVoucher } from "../../src/hooks/useRedemption";
import { STATUS_CONFIG } from "../../src/constants";
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows, touchTarget } from "../../src/theme";
import { PrimaryButton } from "../../src/components/ui";
import { ResultBanner } from "../../src/components/voucher";
import type { RedemptionStatusCode } from "../../src/types";

export default function ManualInputScreen() {
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);
  const [voucherCode, setVoucherCode] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resultError, setResultError] = useState<{
    code: string;
    message: string;
  } | null>(null);

  const validateMutation = useValidateVoucher();

  // Validate input format
  const validateInput = useCallback((code: string): string | null => {
    if (!code.trim()) {
      return "Vui lòng nhập mã voucher";
    }

    const trimmed = code.trim();

    // Check length
    if (trimmed.length < 10) {
      return "Mã voucher quá ngắn";
    }

    // Check format (will be validated by normalizeVoucherCode).
    // source="manual" để error message phù hợp với màn nhập tay.
    const { isValid, error } = validateAndParseQr(trimmed, "manual");
    if (!isValid) {
      return error ?? "Mã voucher không hợp lệ";
    }

    return null;
  }, []);

  // Handle input change
  const handleInputChange = useCallback((text: string) => {
    // Auto uppercase
    const uppercased = text.toUpperCase();
    setVoucherCode(uppercased);
    setErrorMessage(null);
    setResultError(null);
  }, []);

  // Handle clear
  const handleClear = useCallback(() => {
    setVoucherCode("");
    setErrorMessage(null);
    setResultError(null);
    inputRef.current?.focus();
  }, []);

  // Handle submit
  const handleSubmit = useCallback(async () => {
    // Validate input
    const validationError = validateInput(voucherCode);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    // Clear errors
    setErrorMessage(null);
    setResultError(null);

    // Dismiss keyboard
    Keyboard.dismiss();

    try {
      const response = await validateMutation.mutateAsync(voucherCode);

      if (response.success && response.status === "VALID") {
        // Navigate to voucher detail - only pass IDs, use React Query for data
        router.push({
          pathname: "/(app)/voucher/[id]",
          params: {
            id: response.data.issuedVoucherId.toString(),
            voucherCode: voucherCode,
            isManual: "true",
          },
        });
      } else {
        // Show error
        const statusCode = response.status as RedemptionStatusCode;
        setResultError({
          code: statusCode,
          message: response.error?.message ?? STATUS_CONFIG[statusCode]?.label ?? "Lỗi không xác định",
        });
      }
    } catch {
      setResultError({
        code: "NETWORK_ERROR",
        message: "Không thể kết nối server. Vui lòng thử lại.",
      });
    }
  }, [voucherCode, validateInput, validateMutation, router]);

  // Handle retry
  const handleRetry = useCallback(() => {
    setResultError(null);
    inputRef.current?.focus();
  }, []);

  // Handle scan new
  const handleScanNew = useCallback(() => {
    router.replace("/(app)/scan");
  }, [router]);

  const isLoading = validateMutation.isPending;
  const hasInput = voucherCode.trim().length > 0;

  // Show result error
  if (resultError) {
    const statusConfig = STATUS_CONFIG[resultError.code as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.UNKNOWN_ERROR;

    return (
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <ResultBanner
            type="error"
            title={statusConfig.label}
            message={resultError.message}
            onPrimaryAction={handleRetry}
            onSecondaryAction={handleScanNew}
            primaryActionLabel="Nhập lại"
            secondaryActionLabel="Quét QR"
          />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityLabel="Quay lại"
            accessibilityRole="button"
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nhập mã voucher</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Title */}
          <Text style={styles.title}>Nhập mã voucher</Text>
          <Text style={styles.subtitle}>
            Quét hoặc nhập mã voucher để xác nhận sử dụng
          </Text>

          {/* Input */}
          <View style={styles.inputContainer}>
            <TextInput
              ref={inputRef}
              style={[styles.input, errorMessage && styles.inputError]}
              value={voucherCode}
              onChangeText={handleInputChange}
              placeholder="EVR-XXXX-XXXX"
              placeholderTextColor={colors.textTertiary}
              autoCapitalize="characters"
              autoCorrect={false}
              autoComplete="off"
              editable={!isLoading}
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
              accessibilityLabel="Mã voucher"
              accessibilityHint="Nhập mã voucher gồm 12 ký tự"
            />

            {/* Clear button */}
            {hasInput && !isLoading && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={handleClear}
                accessibilityLabel="Xóa mã voucher"
                accessibilityRole="button"
              >
                <Text style={styles.clearIcon}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Error message */}
          {errorMessage && (
            <Text
              style={styles.errorText}
              accessibilityLabel={errorMessage}
              role="alert"
            >
              {errorMessage}
            </Text>
          )}

          {/* Format hint */}
          {!errorMessage && !voucherCode && (
            <Text style={styles.hintText}>
              Định dạng: EVR-XXXX-XXXX (ví dụ: EVR-AB12-CD34)
            </Text>
          )}

          {/* Submit button */}
          <View style={styles.buttonContainer}>
            <PrimaryButton
              onPress={handleSubmit}
              disabled={!hasInput || isLoading}
              loading={isLoading}
              size="large"
              accessibilityLabel="Kiểm tra voucher"
              accessibilityHint="Kiểm tra mã voucher để xem chi tiết"
            >
              Kiểm tra
            </PrimaryButton>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 60,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: touchTarget.min,
    height: touchTarget.min,
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    fontSize: 28,
    color: colors.primary,
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  headerPlaceholder: {
    width: touchTarget.min,
  },
  content: {
    flex: 1,
    padding: spacing.xxl,
    paddingTop: spacing.xxl,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.xxl,
    lineHeight: 24,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    ...shadows.sm,
  },
  input: {
    flex: 1,
    height: 60,
    paddingHorizontal: spacing.lg,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    letterSpacing: 2,
  },
  inputError: {
    borderColor: colors.danger,
  },
  clearButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.sm,
  },
  clearIcon: {
    fontSize: 16,
    color: colors.textTertiary,
  },
  errorText: {
    fontSize: fontSize.sm,
    color: colors.danger,
    marginTop: spacing.sm,
  },
  hintText: {
    fontSize: fontSize.sm,
    color: colors.textTertiary,
    marginTop: spacing.sm,
  },
  buttonContainer: {
    marginTop: spacing.xxl,
  },
});
