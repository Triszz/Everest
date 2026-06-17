import { Link } from 'react-router-dom';

export function LogoutSuccessPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#F8FAFC',
      padding: 24,
    }}>
      <div style={{
        background: 'white',
        borderRadius: 20,
        padding: '48px 40px',
        maxWidth: 420,
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 4px 24px rgba(14,118,168,0.08)',
      }}>
        <div style={{
          width: 80,
          height: 80,
          background: '#E8FAFA',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2DD4BF" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h1 style={{
          fontFamily: 'Manrope, sans-serif',
          fontSize: 24,
          fontWeight: 800,
          color: '#1E293B',
          marginBottom: 12,
        }}>Đăng xuất thành công</h1>

        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 14,
          color: '#64748B',
          lineHeight: 1.6,
          marginBottom: 32,
        }}>
          Cảm ơn bạn đã sử dụng Everest. Hẹn gặp lại bạn trong những chuyến mua sắm tiếp theo!
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Link
            to="/login"
            style={{
              display: 'block',
              padding: '14px',
              background: '#0E76A8',
              color: 'white',
              textDecoration: 'none',
              borderRadius: 12,
              fontFamily: 'Inter, sans-serif',
              fontSize: 15,
              fontWeight: 700,
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#0A5C87')}
            onMouseLeave={e => (e.currentTarget.style.background = '#0E76A8')}
          >
            Đăng nhập lại
          </Link>
          <Link
            to="/"
            style={{
              display: 'block',
              padding: '14px',
              background: 'white',
              color: '#0E76A8',
              textDecoration: 'none',
              borderRadius: 12,
              fontFamily: 'Inter, sans-serif',
              fontSize: 15,
              fontWeight: 700,
              border: '1.5px solid #E2E8F0',
              transition: 'border-color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = '#0E76A8')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = '#E2E8F0')}
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
