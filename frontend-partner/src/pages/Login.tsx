import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDefaultRoute } from '../config/navigation';

// ── Shared styles (matching customer login/register) ────────────────────────
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

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);

      // After login, auth state is updated — read user from localStorage
      // to determine redirect (context may not have re-rendered yet)
      const savedUser = localStorage.getItem('everest_partner_user');
      if (savedUser) {
        const user = JSON.parse(savedUser) as { role: 'Partner_Owner' | 'Partner_Cashier' };
        navigate(getDefaultRoute(user.role), { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng nhập thất bại');
    } finally {
      setIsLoading(false);
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
            position: 'absolute',
            top: '10%',
            left: '10%',
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'white',
            filter: 'blur(60px)',
          }} />
          <div style={{
            position: 'absolute',
            bottom: '20%',
            right: '15%',
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'white',
            filter: 'blur(80px)',
          }} />
        </div>
        <div style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 60,
          color: 'white',
          textAlign: 'center',
        }}>
          <div style={{
            width: 80,
            height: 80,
            background: 'rgba(255,255,255,0.15)',
            borderRadius: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 32,
          }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <h2 style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: 32,
            fontWeight: 800,
            marginBottom: 16,
          }}>Cổng đối tác Everest</h2>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 16,
            opacity: 0.9,
            lineHeight: 1.6,
            maxWidth: 400,
          }}>
            Đăng nhập để quản lý voucher, theo dõi doanh thu và phát triển kinh doanh cùng Everest.
          </p>
          <div style={{
            marginTop: 48,
            display: 'flex',
            gap: 24,
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 800 }}>10K+</div>
              <div style={{ fontSize: 13, opacity: 0.8 }}>Voucher</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 800 }}>500+</div>
              <div style={{ fontSize: 13, opacity: 0.8 }}>Đối tác</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 800 }}>1M+</div>
              <div style={{ fontSize: 13, opacity: 0.8 }}>Người dùng</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: 'white',
      }}>
        <div style={{ width: '100%', maxWidth: 440 }}>
          {/* Mobile Logo */}
          <div style={{ textAlign: 'center', marginBottom: 32 }} className="lg:hidden">
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 8,
            }}>
              <div style={{
                width: 40,
                height: 40,
                background: '#0E76A8',
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M20 12v10H4V12" />
                  <path d="M2 7h20v5H2z" />
                  <path d="M12 22V7" />
                  <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                  <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
                </svg>
              </div>
              <span style={{
                fontFamily: 'Manrope, sans-serif',
                fontSize: 24,
                fontWeight: 800,
                color: '#0E76A8',
              }}>Everest</span>
            </div>
          </div>

          <div style={{ marginBottom: 32 }}>
            <h1 style={{
              fontFamily: 'Manrope, sans-serif',
              fontSize: 28,
              fontWeight: 800,
              color: '#1E293B',
              marginBottom: 8,
            }}>Đăng nhập đối tác</h1>
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 14,
              color: '#94A3B8',
            }}>Chào mừng bạn quay trở lại!</p>
          </div>

          {/* Error banner */}
          {error && (
            <div style={{
              padding: '12px 16px',
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: 12,
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#EF4444' }}>
                {error}
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label htmlFor="login-email" style={LABEL_STYLE}>Email</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="email@example.com"
                required
                style={INPUT_STYLE}
                onFocus={e => (e.currentTarget.style.borderColor = '#0E76A8')}
                onBlur={e => (e.currentTarget.style.borderColor = '#E2E8F0')}
              />
            </div>

            <div>
              <label htmlFor="login-password" style={LABEL_STYLE}>Mật khẩu</label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                required
                style={INPUT_STYLE}
                onFocus={e => (e.currentTarget.style.borderColor = '#0E76A8')}
                onBlur={e => (e.currentTarget.style.borderColor = '#E2E8F0')}
              />
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 13,
                color: '#64748B',
                cursor: 'pointer',
              }}>
                <input type="checkbox" style={{ width: 16, height: 16, accentColor: '#0E76A8' }} />
                Ghi nhớ đăng nhập
              </label>
              <Link to="/forgot-password" style={{
                fontSize: 13,
                color: '#0E76A8',
                textDecoration: 'none',
                fontWeight: 600,
              }}>Quên mật khẩu?</Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '14px',
                background: isLoading ? '#94A3B8' : '#0E76A8',
                color: 'white',
                border: 'none',
                borderRadius: 12,
                fontSize: 15,
                fontFamily: 'Inter, sans-serif',
                fontWeight: 700,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
              onMouseEnter={e => { if (!isLoading) e.currentTarget.style.background = '#0A5C87'; }}
              onMouseLeave={e => { if (!isLoading) e.currentTarget.style.background = '#0E76A8'; }}
            >
              {isLoading && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              )}
              {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          <p style={{
            textAlign: 'center',
            marginTop: 24,
            fontFamily: 'Inter, sans-serif',
            fontSize: 14,
            color: '#64748B',
          }}>
            Chưa có tài khoản?{' '}
            <Link to="/register" style={{
              color: '#0E76A8',
              textDecoration: 'none',
              fontWeight: 700,
            }}>Đăng ký đối tác</Link>
          </p>
        </div>
      </div>

      {/* Spinner animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
