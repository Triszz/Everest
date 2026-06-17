import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

export function RegisterPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/login');
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
            top: '15%',
            right: '10%',
            width: 350,
            height: 350,
            borderRadius: '50%',
            background: 'white',
            filter: 'blur(70px)',
          }} />
          <div style={{
            position: 'absolute',
            bottom: '15%',
            left: '10%',
            width: 280,
            height: 280,
            borderRadius: '50%',
            background: 'white',
            filter: 'blur(60px)',
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
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="8.5" cy="7" r="4"/>
              <line x1="20" y1="8" x2="20" y2="14"/>
              <line x1="23" y1="11" x2="17" y2="11"/>
            </svg>
          </div>
          <h2 style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: 32,
            fontWeight: 800,
            marginBottom: 16,
          }}>Tham gia cùng chúng tôi</h2>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 16,
            opacity: 0.9,
            lineHeight: 1.6,
            maxWidth: 400,
          }}>
            Đăng ký tài khoản để nhận ưu đãi độc quyền, theo dõi voucher yêu thích và trải nghiệm mua sắm thông minh.
          </p>
          <div style={{
            marginTop: 48,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            width: '100%',
            maxWidth: 320,
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.12)',
              padding: '16px 20px',
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}>
              <div style={{
                width: 44,
                height: 44,
                background: 'rgba(255,255,255,0.2)',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
              }}>🎁</div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>Ưu đãi thành viên</div>
                <div style={{ fontSize: 13, opacity: 0.8 }}>Giảm thêm 10% đơn đầu</div>
              </div>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.12)',
              padding: '16px 20px',
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}>
              <div style={{
                width: 44,
                height: 44,
                background: 'rgba(255,255,255,0.2)',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
              }}>⭐</div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>Tích điểm đổi quà</div>
                <div style={{ fontSize: 13, opacity: 0.8 }}>Mỗi đơn hàng đều được thưởng</div>
              </div>
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
        <div style={{ width: '100%', maxWidth: 480 }}>
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
                  <path d="M20 12v10H4V12"/>
                  <path d="M2 7h20v5H2z"/>
                  <path d="M12 22V7"/>
                  <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
                  <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
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
            }}>Đăng ký tài khoản</h1>
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 14,
              color: '#94A3B8',
            }}>Tạo tài khoản để bắt đầu tiết kiệm ngay!</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{
                display: 'block',
                fontFamily: 'Inter, sans-serif',
                fontSize: 14,
                fontWeight: 600,
                color: '#1E293B',
                marginBottom: 8,
              }}>Họ và tên</label>
              <input
                id="register-name"
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Nguyễn Văn A"
                required
                style={{
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
                }}
                onFocus={e => (e.currentTarget.style.borderColor = '#0E76A8')}
                onBlur={e => (e.currentTarget.style.borderColor = '#E2E8F0')}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontFamily: 'Inter, sans-serif',
                fontSize: 14,
                fontWeight: 600,
                color: '#1E293B',
                marginBottom: 8,
              }}>Email</label>
              <input
                id="register-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="email@example.com"
                required
                style={{
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
                }}
                onFocus={e => (e.currentTarget.style.borderColor = '#0E76A8')}
                onBlur={e => (e.currentTarget.style.borderColor = '#E2E8F0')}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontFamily: 'Inter, sans-serif',
                fontSize: 14,
                fontWeight: 600,
                color: '#1E293B',
                marginBottom: 8,
              }}>Số điện thoại</label>
              <input
                id="register-phone"
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="0912 345 678"
                style={{
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
                }}
                onFocus={e => (e.currentTarget.style.borderColor = '#0E76A8')}
                onBlur={e => (e.currentTarget.style.borderColor = '#E2E8F0')}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontFamily: 'Inter, sans-serif',
                fontSize: 14,
                fontWeight: 600,
                color: '#1E293B',
                marginBottom: 8,
              }}>Mật khẩu</label>
              <input
                id="register-password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Tối thiểu 8 ký tự"
                required
                style={{
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
                }}
                onFocus={e => (e.currentTarget.style.borderColor = '#0E76A8')}
                onBlur={e => (e.currentTarget.style.borderColor = '#E2E8F0')}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontFamily: 'Inter, sans-serif',
                fontSize: 14,
                fontWeight: 600,
                color: '#1E293B',
                marginBottom: 8,
              }}>Xác nhận mật khẩu</label>
              <input
                id="register-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu"
                required
                style={{
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
                }}
                onFocus={e => (e.currentTarget.style.borderColor = '#0E76A8')}
                onBlur={e => (e.currentTarget.style.borderColor = '#E2E8F0')}
              />
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
            }}>
              <input type="checkbox" id="register-terms" required style={{ marginTop: 2, accentColor: '#0E76A8' }} />
              <label htmlFor="register-terms" style={{
                fontSize: 13,
                color: '#64748B',
                lineHeight: 1.5,
              }}>
                Tôi đồng ý với <Link to="/terms" style={{ color: '#0E76A8', textDecoration: 'none', fontWeight: 600 }}>Điều khoản sử dụng</Link> và <Link to="/privacy" style={{ color: '#0E76A8', textDecoration: 'none', fontWeight: 600 }}>Chính sách bảo mật</Link>
              </label>
            </div>

            <button
              type="submit"
              style={{
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
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#0A5C87')}
              onMouseLeave={e => (e.currentTarget.style.background = '#0E76A8')}
            >
              Đăng ký
            </button>
          </form>

          <p style={{
            textAlign: 'center',
            marginTop: 24,
            fontFamily: 'Inter, sans-serif',
            fontSize: 14,
            color: '#64748B',
          }}>
            Đã có tài khoản?{' '}
            <Link to="/login" style={{
              color: '#0E76A8',
              textDecoration: 'none',
              fontWeight: 700,
            }}>Đăng nhập ngay</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
