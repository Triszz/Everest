import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';
// ── Reset Password Page ──────────────────────────────────────────────────────────
// Dùng khi user nhấn link trong email quên mật khẩu.
// Flow: Nhận token từ URL → nhập mật khẩu mới → submit → success
// API: PUT /api/auth/reset-password

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});

  // Validate on change
  useEffect(() => {
    if (errors.password || errors.confirm) {
      setErrors({});
    }
  }, [password, confirm]);

  const validate = () => {
    const errs: { password?: string; confirm?: string } = {};
    if (!password) errs.password = 'Vui lòng nhập mật khẩu mới.';
    else if (password.length < 6) errs.password = 'Mật khẩu phải có ít nhất 6 ký tự.';
    else if (password.length > 128) errs.password = 'Mật khẩu tối đa 128 ký tự.';
    if (!confirm) errs.confirm = 'Vui lòng xác nhận mật khẩu.';
    else if (confirm !== password) errs.confirm = 'Mật khẩu xác nhận không khớp.';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/auth/reset-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const json = await res.json();
      if (json.success) {
        setDone(true);
      } else {
        setError(json.error?.message || 'Không thể đặt lại mật khẩu. Liên kết có thể đã hết hạn hoặc không hợp lệ.');
      }
    } catch {
      setError('Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // ── Success ────────────────────────────────────────────────────────────────

  if (done) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', background: '#F8FAFC' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ width: '100%', maxWidth: 440, textAlign: 'center' }}>
            <div style={{ width: 80, height: 80, background: '#ECFDF5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', animation: 'scale-in 0.4s ease-out' }}>
              <CheckCircle2 size={40} style={{ color: '#10B981' }} />
            </div>
            <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 26, fontWeight: 800, color: '#1E293B', marginBottom: 12 }}>
              Đặt lại mật khẩu thành công!
            </h1>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, color: '#64748B', lineHeight: 1.6, marginBottom: 32 }}>
              Mật khẩu của bạn đã được thay đổi. Bây giờ bạn có thể đăng nhập với mật khẩu mới.
            </p>
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
              Đăng nhập ngay
            </Link>
          </div>
        </div>
        <style>{`@keyframes scale-in { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
      </div>
    );
  }

  // ── Form ─────────────────────────────────────────────────────────────────

  if (!token) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
        <div style={{ textAlign: 'center', padding: 24 }}>
          <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 18, fontWeight: 700, color: '#1E293B', marginBottom: 12 }}>
            Liên kết không hợp lệ
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#64748B', marginBottom: 24 }}>
            Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.
          </p>
          <Link to="/forgot-password" style={{ color: '#0E76A8', fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600 }}>
            Yêu cầu liên kết mới
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#F8FAFC' }}>
      {/* Left panel */}
      <div style={{
        display: 'none', flex: 1, background: 'linear-gradient(135deg, #0E76A8 0%, #1A8FC0 100%)',
        position: 'relative', overflow: 'hidden',
      }} className="hidden lg:flex">
        <div style={{ position: 'absolute', inset: 0, opacity: 0.1 }}>
          <div style={{ position: 'absolute', top: '15%', left: '10%', width: 300, height: 300, borderRadius: '50%', background: 'white', filter: 'blur(60px)' }} />
          <div style={{ position: 'absolute', bottom: '20%', right: '15%', width: 400, height: 400, borderRadius: '50%', background: 'white', filter: 'blur(80px)' }} />
        </div>
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 60, color: 'white', textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, background: 'rgba(255,255,255,0.15)', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 32 }}>
            <Lock size={48} strokeWidth={1.5} />
          </div>
          <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 32, fontWeight: 800, marginBottom: 16 }}>Đặt lại mật khẩu</h2>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, opacity: 0.9, lineHeight: 1.6, maxWidth: 400 }}>
            Nhập mật khẩu mới cho tài khoản của bạn. Đảm bảo mật khẩu mạnh và không trùng với mật khẩu cũ.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'white' }}>
        <div style={{ width: '100%', maxWidth: 440 }}>
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748B', textDecoration: 'none', marginBottom: 32, fontFamily: 'Inter, sans-serif' }}>
            ← Quay lại đăng nhập
          </Link>

          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 26, fontWeight: 800, color: '#1E293B', marginBottom: 8 }}>
              Tạo mật khẩu mới
            </h1>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#94A3B8', lineHeight: 1.5 }}>
              Nhập mật khẩu mới cho tài khoản của bạn.
            </p>
          </div>

          {error && (
            <div style={{ padding: '12px 16px', background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: 12, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span style={{ fontSize: 14, color: '#DC2626' }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* New password */}
            <div>
              <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: '#1E293B', marginBottom: 8 }}>
                Mật khẩu mới <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: undefined })); }}
                  placeholder="Mật khẩu mới"
                  autoComplete="new-password"
                  style={{
                    width: '100%', padding: '12px 44px 12px 44px',
                    border: `1.5px solid ${errors.password ? '#EF4444' : '#E2E8F0'}`,
                    borderRadius: 12, fontSize: 14, fontFamily: 'Inter, sans-serif',
                    color: '#1E293B', background: '#F8FAFC', outline: 'none', boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#0E76A8')}
                  onBlur={e => (e.currentTarget.style.borderColor = errors.password ? '#EF4444' : '#E2E8F0')}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#94A3B8', display: 'flex' }}
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p style={{ marginTop: 6, fontSize: 12, color: '#EF4444', fontFamily: 'Inter, sans-serif' }}>{errors.password}</p>}
            </div>

            {/* Confirm password */}
            <div>
              <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: '#1E293B', marginBottom: 8 }}>
                Xác nhận mật khẩu <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirm}
                  onChange={e => { setConfirm(e.target.value); setErrors(p => ({ ...p, confirm: undefined })); }}
                  placeholder="Nhập lại mật khẩu mới"
                  autoComplete="new-password"
                  style={{
                    width: '100%', padding: '12px 44px 12px 44px',
                    border: `1.5px solid ${errors.confirm ? '#EF4444' : '#E2E8F0'}`,
                    borderRadius: 12, fontSize: 14, fontFamily: 'Inter, sans-serif',
                    color: '#1E293B', background: '#F8FAFC', outline: 'none', boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#0E76A8')}
                  onBlur={e => (e.currentTarget.style.borderColor = errors.confirm ? '#EF4444' : '#E2E8F0')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(v => !v)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#94A3B8', display: 'flex' }}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirm && <p style={{ marginTop: 6, fontSize: 12, color: '#EF4444', fontFamily: 'Inter, sans-serif' }}>{errors.confirm}</p>}
            </div>

            {/* Strength hint */}
            {password.length >= 6 && (
              <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 10, padding: '10px 14px' }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#166534', margin: 0 }}>
                  Mật khẩu đủ điều kiện. Cần xác nhận để hoàn tất.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '14px', background: loading ? '#94A3B8' : '#0E76A8',
                color: 'white', border: 'none', borderRadius: 12,
                fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 700,
                cursor: loading ? 'wait' : 'pointer', transition: 'background 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#0A5C87'; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#0E76A8'; }}
            >
              {loading ? (
                <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Đang đặt lại...</>
              ) : 'Đặt lại mật khẩu'}
            </button>
          </form>
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
