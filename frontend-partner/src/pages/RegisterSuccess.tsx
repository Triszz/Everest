import { Link } from 'react-router-dom';

export function RegisterSuccessPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#F8FAFC' }}>
      {/* Left side - Illustration (same as Register) */}
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
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <h2 style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: 32,
            fontWeight: 800,
            marginBottom: 16,
          }}>Chào mừng đối tác mới!</h2>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 16,
            opacity: 0.9,
            lineHeight: 1.6,
            maxWidth: 400,
          }}>
            Bạn đã hoàn tất bước đăng ký. Hãy chờ đội ngũ Admin xác nhận để bắt đầu hành trình kinh doanh cùng Everest.
          </p>
        </div>
      </div>

      {/* Right side - Success message */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: 'white',
      }}>
        <div style={{ width: '100%', maxWidth: 480, textAlign: 'center' }}>
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

          {/* Success icon */}
          <div style={{
            width: 80,
            height: 80,
            background: '#ECFDF5',
            borderRadius: '50%',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 24,
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>

          <h1 style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: 28,
            fontWeight: 800,
            color: '#1E293B',
            marginBottom: 12,
          }}>Đăng ký thành công!</h1>

          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 15,
            color: '#64748B',
            lineHeight: 1.7,
            marginBottom: 8,
          }}>
            Tài khoản đối tác của bạn đã được tạo thành công và đang <strong style={{ color: '#F59E0B' }}>chờ Admin phê duyệt</strong>.
          </p>

          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 14,
            color: '#94A3B8',
            lineHeight: 1.6,
            marginBottom: 32,
          }}>
            Bạn sẽ nhận được thông báo qua email khi tài khoản được kích hoạt. Quá trình này thường mất 1-2 ngày làm việc.
          </p>

          {/* Info card */}
          <div style={{
            background: '#F0F9FF',
            border: '1px solid #BAE6FD',
            borderRadius: 16,
            padding: '20px 24px',
            marginBottom: 32,
            textAlign: 'left',
          }}>
            <div style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 13,
              fontWeight: 600,
              color: '#0E76A8',
              marginBottom: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0E76A8" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              Các bước tiếp theo
            </div>
            <ul style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 13,
              color: '#64748B',
              lineHeight: 1.8,
              paddingLeft: 20,
              margin: 0,
            }}>
              <li>Kiểm tra email xác nhận đăng ký</li>
              <li>Chờ Admin phê duyệt tài khoản (1-2 ngày)</li>
              <li>Đăng nhập và bắt đầu tạo voucher</li>
            </ul>
          </div>

          <Link
            to="/login"
            style={{
              display: 'inline-block',
              padding: '14px 48px',
              background: '#0E76A8',
              color: 'white',
              border: 'none',
              borderRadius: 12,
              fontSize: 15,
              fontFamily: 'Inter, sans-serif',
              fontWeight: 700,
              textDecoration: 'none',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#0A5C87')}
            onMouseLeave={e => (e.currentTarget.style.background = '#0E76A8')}
          >
            Đi đến trang đăng nhập
          </Link>

          <p style={{
            marginTop: 16,
            fontFamily: 'Inter, sans-serif',
            fontSize: 13,
            color: '#94A3B8',
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
