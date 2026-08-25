import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authApi, ApiResponseError } from '../services';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;

export function VerifyEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const phone = searchParams.get('phone') || '';
  const initialChannel = (searchParams.get('channel') as 'email' | 'sms') || 'email';

  const [channel, setChannel] = useState<'email' | 'sms'>(initialChannel);
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Đếm ngược cooldown cho nút resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  // Auto-focus ô đầu tiên
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Hết cooldown lần đầu? → set 60
  useEffect(() => {
    setResendCooldown(RESEND_COOLDOWN);
  }, []);

  const handleChannelSwitch = async (newChannel: 'email' | 'sms') => {
    if (newChannel === channel) return;
    setChannel(newChannel);
    setError(null);
    setLoading(true);
    try {
      const res = await authApi.sendOtp(email, 'REGISTER_VERIFY', newChannel);
      if (res.success) {
        setSuccess(res.message || `Đã chuyển kênh gửi OTP qua ${newChannel === 'sms' ? 'SMS' : 'Email'}.`);
        setResendCooldown(RESEND_COOLDOWN);
        setDigits(Array(OTP_LENGTH).fill(''));
        inputRefs.current[0]?.focus();
      }
    } catch (err: any) {
      setError(err.message || 'Không thể gửi lại OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (idx: number, val: string) => {
    setError(null);
    // Chỉ nhận 1 chữ số
    const digit = val.replace(/\D/g, '').slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[idx] = digit;
      return next;
    });
    if (digit && idx < OTP_LENGTH - 1) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
    // Mũi tên trái/phải
    if (e.key === 'ArrowLeft' && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && idx < OTP_LENGTH - 1) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    setDigits((prev) => {
      const next = [...prev];
      for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
      return next;
    });
    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[focusIdx]?.focus();
  };

  const code = digits.join('');
  const canSubmit = code.length === OTP_LENGTH && !loading;

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!canSubmit) return;
    if (!email) {
      setError('Thiếu email. Vui lòng đăng ký lại.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await authApi.verifyOtp(email, code, 'REGISTER_VERIFY');
      if (response.success && response.data) {
        setSuccess('Xác thực thành công! Đang đăng nhập...');
        // Lưu tokens (auto-login)
        localStorage.setItem('access_token', response.data.accessToken);
        localStorage.setItem('refresh_token', response.data.refreshToken);
        if (response.data.sessionId) {
          localStorage.setItem('current_session_id', response.data.sessionId);
        }
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setTimeout(() => navigate('/'), 800);
      } else {
        setError(response.message || 'Mã OTP không hợp lệ.');
      }
    } catch (err: any) {
      const msg =
        err instanceof ApiResponseError
          ? err.message
          : err.message || 'Xác thực thất bại. Vui lòng thử lại.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || !email) return;
    setError(null);
    try {
      const res = await authApi.resendOtp(email, 'REGISTER_VERIFY', channel);
      if (res.success) {
        setSuccess(res.message || 'Đã gửi lại mã OTP.');
        setResendCooldown(RESEND_COOLDOWN);
        setDigits(Array(OTP_LENGTH).fill(''));
        inputRefs.current[0]?.focus();
      } else {
        setError('Không thể gửi lại mã.');
      }
    } catch (err: any) {
      const msg =
        err instanceof ApiResponseError
          ? err.message
          : err.message || 'Không thể gửi lại mã.';
      setError(msg);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#F8FAFC' }}>
      {/* Left side - Illustration */}
      <div style={{
        display: 'none',
        flex: 1,
        background: 'linear-gradient(135deg, #0E76A8 0%, #1A8FC0 100%)',
        position: 'relative',
        overflow: 'hidden',
      }} className="hidden lg:flex">
        <div style={{ position: 'absolute', inset: 0, opacity: 0.1 }}>
          <div style={{
            position: 'absolute', top: '20%', left: '15%', width: 320, height: 320,
            borderRadius: '50%', background: 'white', filter: 'blur(70px)',
          }} />
          <div style={{
            position: 'absolute', bottom: '20%', right: '15%', width: 260, height: 260,
            borderRadius: '50%', background: 'white', filter: 'blur(60px)',
          }} />
        </div>
        <div style={{
          position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column',
          justifyContent: 'center', alignItems: 'center', padding: 60,
          color: 'white', textAlign: 'center',
        }}>
          <div style={{
            width: 80, height: 80, background: 'rgba(255,255,255,0.15)',
            borderRadius: 24, display: 'flex', alignItems: 'center',
            justifyContent: 'center', marginBottom: 32,
          }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>
          <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 32, fontWeight: 800, marginBottom: 16 }}>
            Kiểm tra email của bạn
          </h2>
          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: 16, opacity: 0.9,
            lineHeight: 1.6, maxWidth: 400,
          }}>
            Chúng tôi đã gửi mã xác thực 6 số đến email của bạn. Mã có hiệu lực trong 5 phút.
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24, background: 'white',
      }}>
        <div style={{ width: '100%', maxWidth: 480 }}>
          <div style={{ marginBottom: 32, textAlign: 'center' }}>
            <h1 style={{
              fontFamily: 'Manrope, sans-serif', fontSize: 28, fontWeight: 800,
              color: '#1E293B', marginBottom: 8,
            }}>
              Xác thực tài khoản
            </h1>
            <p style={{
              fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#94A3B8', lineHeight: 1.6,
            }}>
              Nhập mã 6 số được gửi qua {channel === 'sms' ? 'SMS' : 'Email'} tới<br />
              <strong style={{ color: '#1E293B' }}>{channel === 'sms' && phone ? phone : email}</strong>
            </p>
          </div>

          {/* Chọn kênh nhận OTP (Email vs SMS) */}
          <div style={{
            marginBottom: 20,
            padding: 16,
            borderRadius: 12,
            background: '#F8FAFC',
            border: '1.5px solid #E2E8F0',
          }}>
            <div style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 13,
              fontWeight: 600,
              color: '#64748B',
              marginBottom: 10,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              Chọn phương thức nhận mã OTP:
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={() => handleChannelSwitch('email')}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: channel === 'email' ? '2px solid #0E76A8' : '1px solid #CBD5E1',
                  background: channel === 'email' ? '#EFF6FF' : '#FFFFFF',
                  fontWeight: channel === 'email' ? 700 : 500,
                  color: channel === 'email' ? '#0E76A8' : '#64748B',
                  fontSize: 13,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  transition: 'all 0.2s',
                }}
              >
                📧 Email
              </button>

              <button
                type="button"
                onClick={() => handleChannelSwitch('sms')}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: channel === 'sms' ? '2px solid #0E76A8' : '1px solid #CBD5E1',
                  background: channel === 'sms' ? '#EFF6FF' : '#FFFFFF',
                  fontWeight: channel === 'sms' ? 700 : 500,
                  color: channel === 'sms' ? '#0E76A8' : '#64748B',
                  fontSize: 13,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  transition: 'all 0.2s',
                }}
              >
                📱 Số điện thoại {phone ? `(${phone})` : ''}
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              padding: '12px 16px', background: '#FEE2E2', border: '1px solid #FECACA',
              borderRadius: 12, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span style={{ fontSize: 14, color: '#DC2626' }}>{error}</span>
            </div>
          )}

          {success && (
            <div style={{
              padding: '12px 16px', background: '#DCFCE7', border: '1px solid #BBF7D0',
              borderRadius: 12, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span style={{ fontSize: 14, color: '#15803D' }}>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{
              display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 24,
            }}>
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  onPaste={handlePaste}
                  disabled={loading}
                  style={{
                    width: 52, height: 64, textAlign: 'center',
                    fontSize: 28, fontWeight: 700, fontFamily: 'Manrope, monospace',
                    color: '#1E293B', background: '#F8FAFC',
                    border: `2px solid ${d ? '#0E76A8' : '#E2E8F0'}`,
                    borderRadius: 12, outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#0E76A8'; }}
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              style={{
                width: '100%', padding: '14px',
                background: canSubmit ? '#0E76A8' : '#94A3B8',
                color: 'white', border: 'none', borderRadius: 12,
                fontSize: 15, fontFamily: 'Inter, sans-serif', fontWeight: 700,
                cursor: canSubmit ? 'pointer' : 'not-allowed',
                transition: 'background 0.2s',
              }}
            >
              {loading ? 'Đang xác thực...' : 'Xác nhận'}
            </button>
          </form>

          <div style={{
            marginTop: 24, textAlign: 'center',
            fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#64748B',
          }}>
            Không nhận được mã?{' '}
            <button
              type="button"
              onClick={handleResend}
              disabled={resendCooldown > 0}
              style={{
                background: 'none', border: 'none', padding: 0,
                color: resendCooldown > 0 ? '#94A3B8' : '#0E76A8',
                cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                fontWeight: 700, fontSize: 14,
              }}
            >
              {resendCooldown > 0 ? `Gửi lại sau ${resendCooldown}s` : 'Gửi lại mã'}
            </button>
          </div>

          <p style={{
            textAlign: 'center', marginTop: 24,
            fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#64748B',
          }}>
            <Link to="/register" style={{ color: '#0E76A8', textDecoration: 'none', fontWeight: 600 }}>
              ← Quay lại đăng ký
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
