import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { authApi } from '../services';

// ── Forgot Password Page ─────────────────────────────────────────────────────
// Flow: Nhập email → loading → Màn hình xác nhận gửi email

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateEmail = (value: string) => {
    if (!value.trim()) return 'Vui lòng nhập địa chỉ email.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Email không hợp lệ.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validateEmail(email);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const res = await authApi.forgotPassword(email);
      if (res.success) {
        setSubmitted(true);
      } else {
        setError(res.error?.message || 'Gửi yêu cầu thất bại. Vui lòng thử lại.');
      }
    } catch {
      setError('Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // ── Success State ─────────────────────────────────────────────────────────

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', background: '#F8FAFC' }}>
        {/* Left panel */}
        <div style={{
          display: 'none',
          flex: 1,
          background: 'linear-gradient(135deg, #0E76A8 0%, #1A8FC0 100%)',
          position: 'relative',
          overflow: 'hidden',
        }} className="hidden lg:flex">
          <div style={{ position: 'absolute', inset: 0, opacity: 0.1 }}>
            <div style={{ position: 'absolute', top: '15%', left: '10%', width: 300, height: 300, borderRadius: '50%', background: 'white', filter: 'blur(60px)' }} />
            <div style={{ position: 'absolute', bottom: '20%', right: '15%', width: 400, height: 400, borderRadius: '50%', background: 'white', filter: 'blur(80px)' }} />
          </div>
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 60, color: 'white', textAlign: 'center' }}>
            <div style={{ width: 80, height: 80, background: 'rgba(255,255,255,0.15)', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 32 }}>
              <ShieldCheck size={48} strokeWidth={1.5} />
            </div>
            <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 32, fontWeight: 800, marginBottom: 16 }}>An toàn & Bảo mật</h2>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, opacity: 0.9, lineHeight: 1.6, maxWidth: 400 }}>
              Chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu đến email của bạn một cách an toàn.
            </p>
          </div>
        </div>

        {/* Right panel */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'white' }}>
          <div style={{ width: '100%', maxWidth: 440 }}>
            {/* Back to login */}
            <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748B', textDecoration: 'none', marginBottom: 32, fontFamily: 'Inter, sans-serif' }}>
              <ArrowLeft size={14} />
              Quay lại đăng nhập
            </Link>

            {/* Success icon */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
              <div style={{ width: 80, height: 80, background: '#ECFDF5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'scale-in 0.4s ease-out' }}>
                <CheckCircle2 size={40} style={{ color: '#10B981' }} />
              </div>
            </div>

            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 26, fontWeight: 800, color: '#1E293B', marginBottom: 12 }}>Kiểm tra hộp thư của bạn!</h1>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#64748B', lineHeight: 1.6 }}>
                Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến
              </p>
              <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 700, color: '#0E76A8', marginTop: 4 }}>
                {email}
              </p>
            </div>

            {/* Instructions card */}
            <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: 16, padding: '16px 18px', marginBottom: 24 }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#0369A1', lineHeight: 1.6, margin: 0 }}>
                <strong>Bước tiếp theo:</strong> Mở email và nhấn vào liên kết "Đặt lại mật khẩu".
                Liên kết có hiệu lực trong <strong>24 giờ</strong>.
                Nếu không thấy email, hãy kiểm tra thư mục <strong>Spam</strong>.
              </p>
            </div>

            {/* Resend */}
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#64748B', marginBottom: 8 }}>
                Không nhận được email?
              </p>
              <button
                onClick={() => { setSubmitted(false); setEmail(''); }}
                style={{ background: 'none', border: 'none', fontSize: 13, fontWeight: 700, color: '#0E76A8', cursor: 'pointer', fontFamily: 'Inter, sans-serif', textDecoration: 'underline' }}
              >
                Gửi lại
              </button>
            </div>

            {/* Back to login button */}
            <Link
              to="/login"
              style={{
                display: 'block', width: '100%', padding: '14px',
                background: '#0E76A8', color: 'white', textDecoration: 'none',
                borderRadius: 12, fontFamily: 'Inter, sans-serif', fontSize: 15,
                fontWeight: 700, textAlign: 'center', transition: 'background 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#0A5C87')}
              onMouseLeave={e => (e.currentTarget.style.background = '#0E76A8')}
            >
              Quay lại đăng nhập
            </Link>
          </div>
        </div>

        <style>{`
          @keyframes scale-in {
            from { transform: scale(0.5); opacity: 0; }
            to   { transform: scale(1);   opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  // ── Form State ───────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#F8FAFC' }}>
      {/* Left panel */}
      <div style={{
        display: 'none',
        flex: 1,
        background: 'linear-gradient(135deg, #0E76A8 0%, #1A8FC0 100%)',
        position: 'relative',
        overflow: 'hidden',
      }} className="hidden lg:flex">
        <div style={{ position: 'absolute', inset: 0, opacity: 0.1 }}>
          <div style={{ position: 'absolute', top: '15%', left: '10%', width: 300, height: 300, borderRadius: '50%', background: 'white', filter: 'blur(60px)' }} />
          <div style={{ position: 'absolute', bottom: '20%', right: '15%', width: 400, height: 400, borderRadius: '50%', background: 'white', filter: 'blur(80px)' }} />
        </div>
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 60, color: 'white', textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, background: 'rgba(255,255,255,0.15)', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 32 }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 32, fontWeight: 800, marginBottom: 16 }}>Không nhớ mật khẩu?</h2>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, opacity: 0.9, lineHeight: 1.6, maxWidth: 400 }}>
            Nhập email đã đăng ký, chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu cho bạn một cách an toàn.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'white' }}>
        <div style={{ width: '100%', maxWidth: 440 }}>
          {/* Mobile logo */}
          <div style={{ textAlign: 'center', marginBottom: 32 }} className="lg:hidden">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 40, height: 40, background: '#0E76A8', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M20 12v10H4V12"/>
                  <path d="M2 7h20v5H2z"/>
                  <path d="M12 22V7"/>
                  <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
                  <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
                </svg>
              </div>
              <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 24, fontWeight: 800, color: '#0E76A8' }}>Everest</span>
            </div>
          </div>

          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 28, fontWeight: 800, color: '#1E293B', marginBottom: 8 }}>
              Quên mật khẩu
            </h1>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#94A3B8', lineHeight: 1.5 }}>
              Nhập email đã đăng ký tài khoản Everest. Chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu cho bạn.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div style={{ padding: '12px 16px', background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: 12, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span style={{ fontSize: 14, color: '#DC2626' }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Email field */}
            <div>
              <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: '#1E293B', marginBottom: 8 }}>
                Địa chỉ email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(null); }}
                  placeholder="email@example.com"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px 12px 44px',
                    border: `1.5px solid ${error ? '#EF4444' : '#E2E8F0'}`,
                    borderRadius: 12,
                    fontSize: 14,
                    fontFamily: 'Inter, sans-serif',
                    color: '#1E293B',
                    background: '#F8FAFC',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#0E76A8')}
                  onBlur={e => (e.currentTarget.style.borderColor = error ? '#EF4444' : '#E2E8F0')}
                />
              </div>
              {error && (
                <p style={{ marginTop: 6, fontSize: 12, color: '#EF4444', fontFamily: 'Inter, sans-serif' }}>{error}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                background: loading ? '#94A3B8' : '#0E76A8',
                color: 'white',
                border: 'none',
                borderRadius: 12,
                fontSize: 15,
                fontFamily: 'Inter, sans-serif',
                fontWeight: 700,
                cursor: loading ? 'wait' : 'pointer',
                transition: 'background 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#0A5C87'; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#0E76A8'; }}
            >
              {loading ? (
                <>
                  <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  Đang gửi yêu cầu...
                </>
              ) : (
                'Gửi yêu cầu'
              )}
            </button>
          </form>

          {/* Back to login */}
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <Link
              to="/login"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, color: '#64748B', textDecoration: 'none', fontFamily: 'Inter, sans-serif' }}
            >
              <ArrowLeft size={14} />
              Quay lại đăng nhập
            </Link>
          </div>

          {/* Sign up */}
          <p style={{ textAlign: 'center', marginTop: 16, fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#64748B' }}>
            Chưa có tài khoản?{' '}
            <Link to="/register" style={{ color: '#0E76A8', textDecoration: 'none', fontWeight: 700 }}>
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
