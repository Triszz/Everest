/**
 * Forgot Password Screen (Staff Mobile)
 * ============================================================
 * 3-step OTP flow đồng bộ với Partner Web hiện tại:
 *   1. Nhập email → POST /auth/email-otp/send
 *   2. Nhập 6 số OTP (chỉ validate format ở FE; KHÔNG pre-verify)
 *   3. Nhập mật khẩu mới + xác nhận → POST /auth/reset-password-otp
 *
 * Backend tự verify + consume OTP trong bước 3.
 * Endpoint reuse hoàn toàn từ Partner Web — không tạo endpoint mới.
 *
 * Phù hợp cho cả Partner_Owner và Partner_Cashier (vì flow chỉ cần email).
 */

import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  TextInput,
  type NativeSyntheticEvent,
  type TextInputKeyPressEventData,
} from "react-native";
import { useRouter } from "expo-router";
import {
  PrimaryButton,
  FormInput,
  PasswordInput,
  AppLogo,
} from "../../src/components/ui";
import { colors, spacing, fontSize, fontWeight, borderRadius, touchTarget } from "../../src/theme";
import { VALIDATION } from "../../src/constants";
import {
  requestPasswordReset,
  resendPasswordReset,
  resetPasswordWithOtp,
} from "../../src/services/auth.service";

type Step = "email" | "otp" | "password" | "done";

// ── Step indicators ────────────────────────────────────────────────────────
const STEP_LABELS: Record<Step, string> = {
  email: "Nhập email",
  otp: "Xác thực OTP",
  password: "Mật khẩu mới",
  done: "Hoàn tất",
};

// OTP resend cooldown = mirror backend RESEND_COOLDOWN_SECONDS = 60s
const RESEND_COOLDOWN_SECONDS = 60;

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>("email");

  // ── Step 1 state ──
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  // ── Step 2 state ──
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [resendCountdown, setResendCountdown] = useState(0);
  const otpInputsRef = useRef<Array<TextInput | null>>([]);

  // ── Step 3 state ──
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // ── Countdown timer ──
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setInterval(() => {
      setResendCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCountdown]);

  // ── Helpers ──
  const isValidEmail = (val: string) => VALIDATION.EMAIL.PATTERN.test(val.trim());
  const isOtpComplete = otpDigits.every((d) => d.length === 1);

  // ── Step 1 → 2: Send OTP ──
  async function handleSendOtp() {
    setEmailError(null);
    if (!isValidEmail(email)) {
      setEmailError("Email không hợp lệ");
      return;
    }

    setSending(true);
    try {
      const res = await requestPasswordReset(email.trim().toLowerCase());
      if (res.success) {
        // Backend always returns 200 (anti-enumeration). Move to OTP step.
        setCurrentStep("otp");
        setResendCountdown(RESEND_COOLDOWN_SECONDS);
      } else {
        setEmailError(res.error?.message ?? "Không thể gửi mã OTP");
      }
    } catch {
      setEmailError("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setSending(false);
    }
  }

  // ── Step 2 → 3: Validate OTP format (NO backend call) ──
  function handleVerifyOtp() {
    setOtpError(null);
    const code = otpDigits.join("");
    if (!/^\d{6}$/.test(code)) {
      setOtpError("Mã OTP phải gồm 6 chữ số");
      return;
    }
    // Đúng format → chuyển sang step 3. Backend sẽ verify OTP khi reset.
    setCurrentStep("password");
  }

  // ── Step 2: Resend OTP ──
  async function handleResendOtp() {
    if (resendCountdown > 0) return;
    setOtpError(null);
    try {
      const res = await resendPasswordReset(email.trim().toLowerCase());
      if (res.success) {
        setResendCountdown(RESEND_COOLDOWN_SECONDS);
        setOtpDigits(["", "", "", "", "", ""]);
        // Focus first input
        setTimeout(() => otpInputsRef.current[0]?.focus(), 100);
      } else {
        // Nếu backend vẫn rate-limit, cập nhật countdown
        if (res.error?.code === "RATE_LIMIT") {
          setResendCountdown(RESEND_COOLDOWN_SECONDS);
        }
        setOtpError(res.error?.message ?? "Không thể gửi lại mã");
      }
    } catch {
      setOtpError("Lỗi kết nối. Vui lòng thử lại.");
    }
  }

  // ── Step 3 → Done: Reset password ──
  async function handleResetPassword() {
    setPasswordError(null);

    if (newPassword.length < VALIDATION.PASSWORD.MIN_LENGTH) {
      setPasswordError(`Mật khẩu phải có ít nhất ${VALIDATION.PASSWORD.MIN_LENGTH} ký tự`);
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Mật khẩu xác nhận không khớp");
      return;
    }

    setSubmitting(true);
    try {
      const code = otpDigits.join("");
      const res = await resetPasswordWithOtp(
        email.trim().toLowerCase(),
        code,
        newPassword,
      );
      if (res.success) {
        setCurrentStep("done");
      } else {
        // Lỗi OTP sai/hết hạn → hiển thị inline, cho user thử lại
        setPasswordError(res.error?.message ?? "Không thể đặt lại mật khẩu");
      }
    } catch {
      setPasswordError("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── OTP digit input handler ──
  function setOtpDigit(index: number, value: string) {
    const digit = value.replace(/[^0-9]/g, "").slice(-1); // chỉ lấy 1 số cuối
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);

    // Auto-focus next
    if (digit && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  }

  function setOtpKey(
    index: number,
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
  ) {
    // Backspace từ input rỗng → focus prev
    if (e.nativeEvent.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  }

  // ── Render ──
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
          <Text style={styles.appName}>Quên mật khẩu</Text>
          <Text style={styles.subtitle}>{STEP_LABELS[currentStep]}</Text>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          {currentStep === "email" && (
            <>
              <Text style={styles.helpText}>
                Nhập email tài khoản của bạn. Chúng tôi sẽ gửi mã OTP để đặt lại mật khẩu.
              </Text>
              <FormInput
                label="Email"
                placeholder="Nhập email của bạn"
                value={email}
                onChangeText={setEmail}
                error={emailError ?? undefined}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="emailAddress"
                autoFocus
                returnKeyType="send"
                onSubmitEditing={handleSendOtp}
                accessibilityLabel="Email"
                accessibilityHint="Nhập email đã đăng ký để nhận mã OTP"
              />
              <PrimaryButton
                onPress={handleSendOtp}
                loading={sending}
                disabled={sending || !email.trim()}
                size="large"
                accessibilityLabel="Gửi mã OTP"
                accessibilityHint="Gửi mã OTP đến email của bạn"
              >
                Gửi mã OTP
              </PrimaryButton>
            </>
          )}

          {currentStep === "otp" && (
            <>
              <Text style={styles.helpText}>
                Mã OTP đã được gửi đến <Text style={styles.email}>{email}</Text>.
                Vui lòng kiểm tra hộp thư và nhập mã gồm 6 chữ số.
              </Text>

              {/* OTP input row */}
              <View style={styles.otpRow}>
                {otpDigits.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(el) => {
                      otpInputsRef.current[index] = el;
                    }}
                    value={digit}
                    onChangeText={(value) => setOtpDigit(index, value)}
                    onKeyPress={(e) => setOtpKey(index, e)}
                    keyboardType="number-pad"
                    maxLength={1}
                    style={styles.otpInput}
                    selectTextOnFocus
                    accessibilityLabel={`OTP digit ${index + 1}`}
                  />
                ))}
              </View>

              {otpError && <Text style={styles.error}>{otpError}</Text>}

              <PrimaryButton
                onPress={handleVerifyOtp}
                disabled={!isOtpComplete}
                size="large"
                accessibilityLabel="Tiếp tục"
                accessibilityHint="Tiếp tục đến bước đặt mật khẩu mới"
              >
                Tiếp tục
              </PrimaryButton>

              {/* Resend */}
              <TouchableOpacity
                onPress={handleResendOtp}
                disabled={resendCountdown > 0}
                style={styles.resendBtn}
                accessibilityRole="button"
                accessibilityLabel={
                  resendCountdown > 0
                    ? `Gửi lại mã sau ${resendCountdown} giây`
                    : "Gửi lại mã OTP"
                }
              >
                <Text
                  style={[
                    styles.resendText,
                    resendCountdown > 0 && styles.resendTextDisabled,
                  ]}
                >
                  {resendCountdown > 0
                    ? `Gửi lại mã (${resendCountdown}s)`
                    : "Gửi lại mã"}
                </Text>
              </TouchableOpacity>
            </>
          )}

          {currentStep === "password" && (
            <>
              <Text style={styles.helpText}>
                Đặt mật khẩu mới cho tài khoản của bạn.
              </Text>
              <PasswordInput
                label="Mật khẩu mới"
                placeholder="Nhập mật khẩu mới"
                value={newPassword}
                onChangeText={setNewPassword}
                error={passwordError ?? undefined}
                returnKeyType="next"
                accessibilityLabel="Mật khẩu mới"
                accessibilityHint="Nhập mật khẩu mới ít nhất 6 ký tự"
              />
              <PasswordInput
                label="Xác nhận mật khẩu"
                placeholder="Nhập lại mật khẩu mới"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                returnKeyType="done"
                onSubmitEditing={handleResetPassword}
                accessibilityLabel="Xác nhận mật khẩu"
                accessibilityHint="Nhập lại mật khẩu để xác nhận"
              />
              <PrimaryButton
                onPress={handleResetPassword}
                loading={submitting}
                disabled={submitting || !newPassword || !confirmPassword}
                size="large"
                accessibilityLabel="Đặt lại mật khẩu"
                accessibilityHint="Xác nhận đặt lại mật khẩu"
              >
                Đặt lại mật khẩu
              </PrimaryButton>
            </>
          )}

          {currentStep === "done" && (
            <>
              <View style={styles.successIcon}>
                <Text style={styles.successIconText}>✓</Text>
              </View>
              <Text style={styles.successTitle}>Đặt lại mật khẩu thành công</Text>
              <Text style={styles.helpText}>
                Bạn có thể đăng nhập với mật khẩu mới ngay bây giờ.
              </Text>
              <PrimaryButton
                onPress={() => router.replace("/(auth)/login")}
                size="large"
                accessibilityLabel="Về màn hình đăng nhập"
                accessibilityHint="Quay lại màn hình đăng nhập để đăng nhập với mật khẩu mới"
              >
                Về đăng nhập
              </PrimaryButton>
            </>
          )}

          {/* Back to login link (steps 1-3 only) */}
          {currentStep !== "done" && (
            <TouchableOpacity
              onPress={() => router.replace("/(auth)/login")}
              style={styles.backLink}
              accessibilityRole="link"
              accessibilityLabel="Quay lại đăng nhập"
            >
              <Text style={styles.backLinkText}>← Quay lại đăng nhập</Text>
            </TouchableOpacity>
          )}
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
  header: {
    alignItems: "center",
    marginBottom: spacing.xxl,
  },
  appName: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  formCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
  },
  helpText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  email: {
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  otpInput: {
    width: 44,
    height: 52,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    textAlign: "center",
    color: colors.textPrimary,
    backgroundColor: colors.background,
  },
  error: {
    fontSize: fontSize.sm,
    color: colors.danger,
    marginBottom: spacing.md,
  },
  resendBtn: {
    marginTop: spacing.lg,
    alignItems: "center",
    minHeight: touchTarget.min,
    justifyContent: "center",
  },
  resendText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
  resendTextDisabled: {
    color: colors.textTertiary,
  },
  backLink: {
    marginTop: spacing.lg,
    alignItems: "center",
    minHeight: touchTarget.min,
    justifyContent: "center",
  },
  backLinkText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#ECFDF5",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  successIconText: {
    fontSize: 32,
    color: "#10B981",
    fontWeight: fontWeight.bold,
  },
  successTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: spacing.md,
  },
});