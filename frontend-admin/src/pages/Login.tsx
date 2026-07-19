import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Field validation states
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setEmailError(null);
    setPasswordError(null);

    // Basic Validation
    let hasError = false;
    if (!email) {
      setEmailError('Email không được để trống');
      hasError = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Email không hợp lệ');
      hasError = true;
    }

    if (!password) {
      setPasswordError('Mật khẩu không được để trống');
      hasError = true;
    } else if (password.length < 6) {
      setPasswordError('Mật khẩu phải tối thiểu 6 ký tự');
      hasError = true;
    }

    if (hasError) return;

    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 50% 50%, #1e1b4b 0%, #0f172a 100%)',
      position: 'relative',
      overflow: 'hidden',
      padding: '1.5rem',
    }}>
      {/* Decorative Glowing Mesh Orbs */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '15%',
        width: '35vw',
        height: '35vw',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(99, 102, 241, 0) 70%)',
        filter: 'blur(40px)',
        pointerEvents: 'none',
        animation: 'pulseGlow 8s infinite alternate',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '10%',
        right: '15%',
        width: '40vw',
        height: '40vw',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(20, 184, 166, 0.12) 0%, rgba(20, 184, 166, 0) 70%)',
        filter: 'blur(50px)',
        pointerEvents: 'none',
        animation: 'pulseGlow 12s infinite alternate-reverse',
      }} />

      {/* Glassmorphic Container */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '460px',
        background: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '1.5rem',
        padding: '2.5rem 2rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        zIndex: 10,
        transition: 'transform 0.3s ease',
      }}>
        {/* Logo and Branding Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '3.75rem',
            height: '3.75rem',
            background: 'linear-gradient(135deg, var(--color-primary) 0%, #0284c7 100%)',
            borderRadius: '1rem',
            boxShadow: '0 0 20px rgba(0, 92, 134, 0.4)',
            marginBottom: '1rem',
            animation: 'floatIcon 4s ease-in-out infinite',
          }}>
            <span className="material-symbols-outlined" style={{ color: '#ffffff', fontSize: '32px' }}>
              admin_panel_settings
            </span>
          </div>
          <h1 className="font-headline-lg" style={{
            color: '#ffffff',
            fontSize: '1.75rem',
            fontWeight: 700,
            letterSpacing: '-0.025em',
            marginBottom: '0.375rem',
          }}>
            VoucherFlow Admin
          </h1>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.875rem',
            color: '#94a3b8',
          }}>
            Bảng điều khiển hệ thống Everest
          </p>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: '0.75rem',
            padding: '0.75rem 1rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}>
            <span className="material-symbols-outlined" style={{ color: '#ef4444', fontSize: '20px' }}>
              error
            </span>
            <span style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.85rem',
              color: '#fca5a5',
              lineHeight: 1.4,
            }}>
              {error}
            </span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Email Input */}
          <div>
            <label htmlFor="admin-login-email" style={{
              display: 'block',
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#cbd5e1',
              marginBottom: '0.5rem',
            }}>
              Tài khoản email
            </label>
            <div style={{ position: 'relative' }}>
              <span className="material-symbols-outlined" style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748b',
                fontSize: '20px',
              }}>
                mail
              </span>
              <input
                id="admin-login-email"
                type="email"
                placeholder="admin@everest.vn"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError(null);
                }}
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.75rem',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: emailError ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '0.75rem',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.875rem',
                  color: '#ffffff',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  boxShadow: emailError ? '0 0 0 3px rgba(239, 68, 68, 0.15)' : 'none',
                }}
                onFocus={(e) => {
                  if (!emailError) {
                    e.currentTarget.style.borderColor = 'var(--color-primary)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 92, 134, 0.25)';
                  }
                }}
                onBlur={(e) => {
                  if (!emailError) {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              />
            </div>
            {emailError && (
              <span style={{
                display: 'block',
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.75rem',
                color: '#f87171',
                marginTop: '0.375rem',
              }}>
                {emailError}
              </span>
            )}
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="admin-login-password" style={{
              display: 'block',
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#cbd5e1',
              marginBottom: '0.5rem',
            }}>
              Mật khẩu
            </label>
            <div style={{ position: 'relative' }}>
              <span className="material-symbols-outlined" style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748b',
                fontSize: '20px',
              }}>
                lock
              </span>
              <input
                id="admin-login-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError(null);
                }}
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.75rem',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: passwordError ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '0.75rem',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.875rem',
                  color: '#ffffff',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  boxShadow: passwordError ? '0 0 0 3px rgba(239, 68, 68, 0.15)' : 'none',
                }}
                onFocus={(e) => {
                  if (!passwordError) {
                    e.currentTarget.style.borderColor = 'var(--color-primary)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 92, 134, 0.25)';
                  }
                }}
                onBlur={(e) => {
                  if (!passwordError) {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              />
            </div>
            {passwordError && (
              <span style={{
                display: 'block',
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.75rem',
                color: '#f87171',
                marginTop: '0.375rem',
              }}>
                {passwordError}
              </span>
            )}
          </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '0.875rem',
            background: 'linear-gradient(135deg, var(--color-primary) 0%, #0284c7 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '0.75rem',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 15px rgba(0, 92, 134, 0.3)',
            transition: 'all 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.625rem',
            marginTop: '1rem',
          }}
          onMouseEnter={(e) => {
            if (!isLoading) {
              e.currentTarget.style.opacity = '0.92';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 92, 134, 0.45)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoading) {
              e.currentTarget.style.opacity = '1';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 92, 134, 0.3)';
            }
          }}
          onMouseDown={(e) => {
            if (!isLoading) e.currentTarget.style.transform = 'translateY(1px)';
          }}
          onMouseUp={(e) => {
            if (!isLoading) e.currentTarget.style.transform = 'translateY(-1px)';
          }}
        >
          {isLoading ? (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 1s linear infinite' }}>
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              <span>ĐANG XỬ LÝ...</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                login
              </span>
              <span>ĐĂNG NHẬP</span>
            </>
          )}
        </button>
      </form>
    </div>

    {/* Global CSS for Animations */}
    <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulseGlow {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.15); opacity: 1; }
        }
        @keyframes floatIcon {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
  </div>
  );
}
