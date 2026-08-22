/**
 * Login Screen
 * ============================================================
 * Màn hình đăng nhập chuyên nghiệp cho Staff Partner
 *
 * Thiết kế theo phong cách Grab Merchant / ShopeeFood Merchant / POS
 */

import { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLogin } from "../../src/hooks/useAuth";
import { PrimaryButton, PasswordInput, FormInput, AppLogo } from "../../src/components/ui";
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows, touchTarget } from "../../src/theme";
import { ENV } from "../../src/constants";

// Validation schema
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email không được để trống")
    .email("Email không hợp lệ"),
  password: z
    .string()
    .min(1, "Mật khẩu không được để trống")
    .min(6, "Mật khẩu tối thiểu 6 ký tự"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const router = useRouter();
  const loginMutation = useLogin();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onBlur",
  });

  // Handle successful login
  useEffect(() => {
    if (loginMutation.isSuccess && loginMutation.data) {
      if (!loginMutation.data.success) {
        // Show error from backend
        if (loginMutation.data.error) {
          Alert.alert(
            "Đăng nhập thất bại",
            loginMutation.data.error.message,
            [{ text: "Đã hiểu" }],
          );
        }
      }
      // Success case handled by useLogin hook (navigates to home)
    }
  }, [loginMutation.isSuccess, loginMutation.data]);

  const onSubmit = async (data: LoginFormData) => {
    await loginMutation.mutateAsync(data);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <AppLogo size="large" />
          <Text style={styles.appName}>Everest Staff</Text>
          <Text style={styles.subtitle}>Voucher Redemption</Text>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Đăng nhập</Text>
          <Text style={styles.formSubtitle}>
            Nhập thông tin để bắt đầu
          </Text>

          {/* Email Field */}
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <FormInput
                label="Email"
                placeholder="Nhập email của bạn"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.email?.message}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="emailAddress"
                autoFocus
                returnKeyType="next"
                accessibilityLabel="Email"
                accessibilityHint="Nhập địa chỉ email của bạn"
              />
            )}
          />

          {/* Password Field */}
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <PasswordInput
                label="Mật khẩu"
                placeholder="Nhập mật khẩu"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
                returnKeyType="done"
                onSubmitEditing={handleSubmit(onSubmit)}
                accessibilityLabel="Mật khẩu"
                accessibilityHint="Nhập mật khẩu của bạn"
              />
            )}
          />

          {/* Remember & Forgot */}
          <View style={styles.rememberRow}>
            <TouchableOpacity
              style={styles.forgotButton}
              onPress={() => router.push("/(auth)/forgot-password")}
              accessibilityLabel="Quên mật khẩu"
              accessibilityRole="link"
            >
              <Text style={styles.forgotText}>Quên mật khẩu?</Text>
            </TouchableOpacity>
          </View>

          {/* Submit Button */}
          <PrimaryButton
            onPress={handleSubmit(onSubmit)}
            loading={loginMutation.isPending}
            disabled={loginMutation.isPending}
            size="large"
            accessibilityLabel="Đăng nhập"
            accessibilityHint="Nhấn để đăng nhập vào ứng dụng"
          >
            Đăng nhập
          </PrimaryButton>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Chỉ dành cho nhân viên đối tác
          </Text>
          <Text style={styles.versionText}>
            Version {ENV.APP.VERSION}
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xxxl,
  },

  // Header
  header: {
    alignItems: "center",
    marginBottom: spacing.xxxl,
  },
  appName: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },

  // Form Card
  formCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    ...shadows.lg,
  },
  formTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  formSubtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.xxl,
  },

  // Remember & Forgot
  rememberRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: spacing.xl,
  },
  forgotButton: {
    padding: spacing.xs,
    minHeight: touchTarget.min,
    justifyContent: "center",
  },
  forgotText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },

  // Footer
  footer: {
    alignItems: "center",
    marginTop: spacing.xxxl,
    gap: spacing.sm,
  },
  footerText: {
    fontSize: fontSize.sm,
    color: colors.textTertiary,
  },
  versionText: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
  },
});
