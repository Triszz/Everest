import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  apiSendResetOtp,
  apiResendResetOtp,
  apiResetPasswordWithOtp,
} from '../services/auth.service';

// ── Inline icons (sync style với Login/Register — không thêm dependency) ──
const IconMail = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const IconArrowLeft = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const IconShield = ({ size = 48 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const IconKey = ({ size = 48 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="7" cy="14" r="5" />
    <path d="M10.5 10.5L20 1" />
    <path d="M18 3l3 3" />
    <path d="M14 7l3 3" />
  </svg>
);

const IconSpin = ({ size = 18, style }: { size?: number; style?: React.CSSProperties }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={style}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

// ────────────────────────────────────────────────────────────────────────────
// Shared visual styles — sync với LoginPage / RegisterPage của Partner.
// ────────────────────────────────────────────────────────────────────────────

const LABEL_STYLE: React.CSSProperties = {
  display: 'block',
  fontFamily: 'Inter, sans-serif',
  fontSize: 14,
  fontWeight: 600,
  color: '#1E293B',
  marginBottom: 8,
};

const INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  padding: '12px 16px',
  border: '1.5px solid #E2E8F0',
  borderRadius: 12,
  fontSize: 14,
  fontFamily: 'Inter, sans-serif',
  color: '#1E293B',
  background: '#F8FAFC',
  outline: 'none',
  transition: 'border-color 0.2s',
};

const INPUT_ERROR_STYLE: React.CSSProperties = {
  ...INPUT_STYLE,
  borderColor: '#EF4444',
};

const ERROR_TEXT_STYLE: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif',
  fontSize: 12,
  color: '#EF4444',
  marginTop: 4,
};

const PRIMARY_BUTTON_STYLE: React.CSSProperties = {
  width: '100%',
  padding: '14px',
  background: '#0E76A8',
  color: 'white',
  border: 'none',
  borderRadius: 12,
  fontSize: 15,
  fontFamily: 'Inter, sans-serif',
  fontWeight: 700,
  cursor: 'pointer',
  transition: 'background 0.2s',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
};

const PRIMARY_BUTTON_DISABLED_STYLE: React.CSSProperties = {
  ...PRIMARY_BUTTON_STYLE,
  background: '#94A3B8',
  cursor: 'not-allowed',
};

// ── Stepper panel (mobile dots) ────────────────────────────────────────────
function StepDots({ active }: { active: 1 | 2 | 3 }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
      {[1, 2, 3].map((s) => (
        <div
          key={s}
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: s <= active ? '#0E76A8' : '#E2E8F0',
            transition: 'background 0.2s',
          }}
        />
      ))}
    </div>
  );
}

// ── Left illustration panel ───────────────────────────────────────────────
function LeftPanel({
  title,
  subtitle,
  icon,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: 'none',
        flex: 1,
        background: 'linear-gradient(135deg, #0E76A8 0%, #1A8FC0 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
      className="hidden lg:flex"
    >
      <div style={{ position: 'absolute', inset: 0, opacity: 0.1 }}>
        <div
          style={{
            position: 'absolute',
            top: '15%',
            left: '10%',
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'white',
            filter: 'blur(60px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '20%',
            right: '15%',
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'white',
            filter: 'blur(80px)',
          }}
        />
      </div>
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 60,
          color: 'white',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            background: 'rgba(255,255,255,0.15)',
            borderRadius: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 32,
          }}
        >
          {icon}
        </div>
        <h2
          style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: 32,
            fontWeight: 800,
            marginBottom: 16,
          }}
        >
          {title}
        </h2>
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 16,
            opacity: 0.9,
            lineHeight: 1.6,
            maxWidth: 400,
          }}
        >
          {subtitle}
        </p>
      </div>
    </div>
  );
}

// ── Mobile logo (hiện ở < lg) ─────────────────────────────────────────────
function MobileLogo() {
  return (
    <div style={{ textAlign: 'center', marginBottom: 24 }} className="lg:hidden">
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 40,
            height: 40,
            background: '#0E76A8',
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M20 12v10H4V12" />
            <path d="M2 7h20v5H2z" />
            <path d="M12 22V7" />
            <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
            <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
          </svg>
        </div>
        <span
          style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: 24,
            fontWeight: 800,
            color: '#0E76A8',
          }}
        >
          Everest
        </span>
      </div>
    </div>
  );
}

// ── Form-level error banner ──────────────────────────────────────────────
function ErrorBanner({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div
      style={{
        padding: '12px 16px',
        background: '#FEF2F2',
        border: '1px solid #FECACA',
        borderRadius: 12,
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#EF4444' }}>
        {message}
      </span>
    </div>
  );
}

// ── Countdown hook ───────────────────────────────────────────────────────
function useCountdown(until: number | null): number {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!until) {
      setNow(Date.now());
      return;
    }
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [until]);
  if (!until) return 0;
  return Math.max(0, Math.ceil((until - now) / 1000));
}

// ─────────────────────────────────────────────────────────────────────────
// 3 bước của wizard
//   1. Nhập email → gửi OTP
//   2. Nhập OTP (gửi lại OTP ở đây)
//   3. Nhập mật khẩu mới + verify OTP lần cuối → reset → redirect Login
// ─────────────────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3;

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState('');
  const [otpExpiresAt, setOtpExpiresAt] = useState<number | null>(null);

  // Step 1 state
  const [emailErr, setEmailErr] = useState<string>('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailBannerErr, setEmailBannerErr] = useState<string | null>(null);

  // Step 2 state
  const [otp, setOtp] = useState('');
  const [otpErr, setOtpErr] = useState<string>('');
  const [resendLoading, setResendLoading] = useState(false);

  // Step 3 state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwErr, setPwErr] = useState<{ new?: string; confirm?: string }>({});
  const [pwBannerErr, setPwBannerErr] = useState<string | null>(null);
  const [pwLoading, setPwLoading] = useState(false);

  const resendCountdown = useCountdown(otpExpiresAt);

  // ── Validators ──
  const validateEmail = (val: string): string | null => {
    if (!val.trim()) return 'Email không được để trống';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return 'Email không đúng định dạng';
    return null;
  };

  const validatePassword = (val: string): string | null => {
    if (!val) return 'Mật khẩu không được để trống';
    if (val.length < 6) return 'Mật khẩu ít nhất 6 ký tự';
    if (val.length > 128) return 'Mật khẩu tối đa 128 ký tự';
    return null;
  };

  // ── Step 1 → 2 ──
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailBannerErr(null);
    const err = validateEmail(email);
    if (err) {
      setEmailErr(err);
      return;
    }
    setEmailErr('');
    setEmailLoading(true);
    try {
      const res = await apiSendResetOtp(email);
      const ttl = res.expiresIn ?? 300;
      setOtpExpiresAt(Date.now() + ttl * 1000);
      toast.success('Đã gửi mã xác thực đến email của bạn');
      setStep(2);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Không thể gửi mã xác thực. Vui lòng thử lại.';
      setEmailBannerErr(msg);
    } finally {
      setEmailLoading(false);
    }
  };

  // ── Step 2: resend OTP ──
  const handleResendOtp = async () => {
    if (resendCountdown > 0 || resendLoading) return;
    try {
      const res = await apiResendResetOtp(email);
      const ttl = res.expiresIn ?? 300;
      setOtpExpiresAt(Date.now() + ttl * 1000);
      setOtp('');
      toast.success('Đã gửi lại mã xác thực');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Không thể gửi lại mã. Vui lòng thử lại.';
      toast.error(msg);
    } finally {
      setResendLoading(false);
    }
  };

  // ── Step 2 → 3 (chỉ validate OTP format; backend verify sẽ chạy ở step 3) ──
  const handleProceedToReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      setOtpErr('Vui lòng nhập mã xác thực');
      return;
    }
    if (!/^\d{6}$/.test(otp)) {
      setOtpErr('Mã xác thực phải gồm đúng 6 chữ số');
      return;
    }
    setOtpErr('');
    setStep(3);
  };

  // ── Step 3: verify OTP + reset password trong 1 call ──
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwBannerErr(null);
    const newErr = validatePassword(newPassword);
    const confirmErr =
      !confirmPassword
        ? 'Vui lòng xác nhận mật khẩu'
        : confirmPassword !== newPassword
          ? 'Mật khẩu xác nhận không trùng khớp'
          : null;

    if (newErr || confirmErr) {
      setPwErr({ new: newErr ?? undefined, confirm: confirmErr ?? undefined });
      return;
    }
    setPwErr({});
    setPwLoading(true);
    try {
      const res = await apiResetPasswordWithOtp(email, otp, newPassword);
      toast.success(res.message || 'Đặt lại mật khẩu thành công');
      // Backend reset xong sẽ tự revoke mọi session hiện tại,
      // nên ở frontend ta không cần làm gì thêm.
      // Redirect về Login (replace để user không back về màn nhập nữa).
      setTimeout(() => navigate('/login', { replace: true }), 1200);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Đặt lại mật khẩu thất bại. Vui lòng thử lại.';
      setPwBannerErr(msg);
      // Nếu OTP sai/hết hạn → đẩy user về step 2 để gửi lại
      if (
        msg.includes('Mã xác thực') ||
        msg.includes('OTP') ||
        msg.includes('hết hạn') ||
        msg.includes('không đúng') ||
        msg.includes('sử dụng')
      ) {
        setTimeout(() => {
          setStep(2);
          setOtp('');
          setOtpExpiresAt(null);
        }, 500);
      }
    } finally {
      setPwLoading(false);
    }
  };

  // ──────────────────────────────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#F8FAFC' }}>
      {/* Left illustration — đổi theo step */}
      {step === 1 && (
        <LeftPanel
          title="Không nhớ mật khẩu?"
          subtitle="Nhập email đã đăng ký, chúng tôi sẽ gửi mã xác thực để bạn đặt lại mật khẩu một cách an toàn."
          icon={<IconKey size={48} />}
        />
      )}
      {step === 2 && (
        <LeftPanel
          title="Kiểm tra email của bạn"
          subtitle="Chúng tôi đã gửi mã xác thực 6 số đến email của bạn. Mã có hiệu lực trong 5 phút."
          icon={<IconMail size={48} />}
        />
      )}
      {step === 3 && (
        <LeftPanel
          title="Đặt lại mật khẩu mới"
          subtitle="Vui lòng chọn mật khẩu mới mạnh để bảo vệ tài khoản đối tác của bạn."
          icon={<IconShield size={48} />}
        />
      )}

      {/* Right content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          background: 'white',
        }}
      >
        <div style={{ width: '100%', maxWidth: 440 }}>
          <MobileLogo />

          {/* Step dots (mobile only) */}
          <div className="lg:hidden">
            <StepDots active={step} />
          </div>

          {/* Back to login link */}
          <Link
            to="/login"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              color: '#64748B',
              textDecoration: 'none',
              marginBottom: 24,
              fontFamily: 'Inter, sans-serif',
            }}
          >
            <IconArrowLeft size={14} />
            Quay lại đăng nhập
          </Link>

          {/* ── STEP 1: nhập email ── */}
          {step === 1 && (
            <>
              <div style={{ marginBottom: 24 }}>
                <h1
                  style={{
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: 28,
                    fontWeight: 800,
                    color: '#1E293B',
                    marginBottom: 8,
                  }}
                >
                  Quên mật khẩu
                </h1>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#94A3B8', lineHeight: 1.5 }}>
                  Nhập email tài khoản đối tác để nhận mã xác thực.
                </p>
              </div>

              <ErrorBanner message={emailBannerErr} />

              <form onSubmit={handleSendEmail} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label htmlFor="forgot-email" style={LABEL_STYLE}>
                    Email <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    id="forgot-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailErr) setEmailErr('');
                      if (emailBannerErr) setEmailBannerErr(null);
                    }}
                    placeholder="email@example.com"
                    style={emailErr ? INPUT_ERROR_STYLE : INPUT_STYLE}
                    onFocus={(e) =>
                      (e.currentTarget.style.borderColor = emailErr ? '#EF4444' : '#0E76A8')
                    }
                    onBlur={(e) =>
                      (e.currentTarget.style.borderColor = emailErr ? '#EF4444' : '#E2E8F0')
                    }
                  />
                  {emailErr && <div style={ERROR_TEXT_STYLE}>{emailErr}</div>}
                </div>

                <button
                  type="submit"
                  disabled={emailLoading}
                  style={emailLoading ? PRIMARY_BUTTON_DISABLED_STYLE : PRIMARY_BUTTON_STYLE}
                  onMouseEnter={(e) => {
                    if (!emailLoading) e.currentTarget.style.background = '#0A5C87';
                  }}
                  onMouseLeave={(e) => {
                    if (!emailLoading) e.currentTarget.style.background = '#0E76A8';
                  }}
                >
                  {emailLoading && (
                    <IconSpin size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  )}
                  {emailLoading ? 'Đang gửi...' : 'Gửi mã xác thực'}
                </button>
              </form>
            </>
          )}

          {/* ── STEP 2: OTP ── */}
          {step === 2 && (
            <>
              <div style={{ marginBottom: 24 }}>
                <h1
                  style={{
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: 28,
                    fontWeight: 800,
                    color: '#1E293B',
                    marginBottom: 8,
                  }}
                >
                  Nhập mã xác thực
                </h1>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#94A3B8', lineHeight: 1.5 }}>
                  Mã xác thực đã được gửi đến email{' '}
                  <strong style={{ color: '#0E76A8' }}>{email}</strong>. Vui lòng kiểm tra cả thư
                  mục Spam.
                </p>
              </div>

              <form
                onSubmit={handleProceedToReset}
                style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
              >
                <div>
                  <label htmlFor="forgot-otp" style={LABEL_STYLE}>
                    Mã xác thực <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    id="forgot-otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => {
                      const onlyDigits = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setOtp(onlyDigits);
                      if (otpErr) setOtpErr('');
                    }}
                    placeholder="123456"
                    style={{
                      ...(otpErr ? INPUT_ERROR_STYLE : INPUT_STYLE),
                      fontSize: 22,
                      letterSpacing: 8,
                      textAlign: 'center',
                      fontFamily: 'Courier New, monospace',
                      fontWeight: 700,
                    }}
                    onFocus={(e) =>
                      (e.currentTarget.style.borderColor = otpErr ? '#EF4444' : '#0E76A8')
                    }
                    onBlur={(e) =>
                      (e.currentTarget.style.borderColor = otpErr ? '#EF4444' : '#E2E8F0')
                    }
                  />
                  {otpErr && <div style={ERROR_TEXT_STYLE}>{otpErr}</div>}
                </div>

                <button
                  type="submit"
                  style={PRIMARY_BUTTON_STYLE}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#0A5C87')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#0E76A8')}
                >
                  Tiếp tục
                </button>

                <div style={{ textAlign: 'center', marginTop: 4 }}>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendCountdown > 0}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: 13,
                      fontWeight: 600,
                      fontFamily: 'Inter, sans-serif',
                      color: resendCountdown > 0 ? '#94A3B8' : '#0E76A8',
                      cursor: resendCountdown > 0 ? 'not-allowed' : 'pointer',
                      textDecoration: resendCountdown > 0 ? 'none' : 'underline',
                    }}
                  >
                    {resendCountdown > 0
                      ? `Gửi lại mã (${resendCountdown}s)`
                      : 'Gửi lại mã'}
                  </button>
                </div>
              </form>
            </>
          )}

          {/* ── STEP 3: đặt lại mật khẩu + verify OTP ── */}
          {step === 3 && (
            <>
              <div style={{ marginBottom: 24 }}>
                <h1
                  style={{
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: 28,
                    fontWeight: 800,
                    color: '#1E293B',
                    marginBottom: 8,
                  }}
                >
                  Đặt lại mật khẩu
                </h1>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#94A3B8', lineHeight: 1.5 }}>
                  Vui lòng nhập mật khẩu mới cho tài khoản{' '}
                  <strong style={{ color: '#0E76A8' }}>{email}</strong>.
                </p>
              </div>

              <ErrorBanner message={pwBannerErr} />

              <form
                onSubmit={handleResetPassword}
                style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
              >
                <div>
                  <label htmlFor="forgot-new-password" style={LABEL_STYLE}>
                    Mật khẩu mới <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    id="forgot-new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (pwErr.new) setPwErr((p) => ({ ...p, new: undefined }));
                      if (pwBannerErr) setPwBannerErr(null);
                    }}
                    placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                    style={pwErr.new ? INPUT_ERROR_STYLE : INPUT_STYLE}
                    onFocus={(e) =>
                      (e.currentTarget.style.borderColor = pwErr.new ? '#EF4444' : '#0E76A8')
                    }
                    onBlur={(e) =>
                      (e.currentTarget.style.borderColor = pwErr.new ? '#EF4444' : '#E2E8F0')
                    }
                  />
                  {pwErr.new && <div style={ERROR_TEXT_STYLE}>{pwErr.new}</div>}
                </div>

                <div>
                  <label htmlFor="forgot-confirm-password" style={LABEL_STYLE}>
                    Xác nhận mật khẩu mới <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    id="forgot-confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (pwErr.confirm) setPwErr((p) => ({ ...p, confirm: undefined }));
                      if (pwBannerErr) setPwBannerErr(null);
                    }}
                    placeholder="Nhập lại mật khẩu mới"
                    style={pwErr.confirm ? INPUT_ERROR_STYLE : INPUT_STYLE}
                    onFocus={(e) =>
                      (e.currentTarget.style.borderColor = pwErr.confirm ? '#EF4444' : '#0E76A8')
                    }
                    onBlur={(e) =>
                      (e.currentTarget.style.borderColor = pwErr.confirm ? '#EF4444' : '#E2E8F0')
                    }
                  />
                  {pwErr.confirm && <div style={ERROR_TEXT_STYLE}>{pwErr.confirm}</div>}
                </div>

                <button
                  type="submit"
                  disabled={pwLoading}
                  style={pwLoading ? PRIMARY_BUTTON_DISABLED_STYLE : PRIMARY_BUTTON_STYLE}
                  onMouseEnter={(e) => {
                    if (!pwLoading) e.currentTarget.style.background = '#0A5C87';
                  }}
                  onMouseLeave={(e) => {
                    if (!pwLoading) e.currentTarget.style.background = '#0E76A8';
                  }}
                >
                  {pwLoading && (
                    <IconSpin size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  )}
                  {pwLoading ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
