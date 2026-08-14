import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Smartphone, KeyRound, AlertTriangle } from 'lucide-react';
import { Breadcrumb } from '../components/Breadcrumb';

export function SecurityPage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Lock,
      color: '#0E76A8', bg: '#E8F4FA',
      title: 'Mật khẩu mạnh',
      desc: 'Mật khẩu được hash bằng bcrypt. Khuyến nghị sử dụng kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt.',
      status: 'Bật',
      statusColor: '#10B981',
    },
    {
      icon: Smartphone,
      color: '#7C3AED', bg: '#F5F3FF',
      title: 'Xác thực 2 bước (2FA)',
      desc: 'Thêm lớp bảo mật bằng mã OTP qua SMS hoặc ứng dụng xác thực. (Đang phát triển)',
      status: 'Sắp có',
      statusColor: '#F59E0B',
    },
    {
      icon: KeyRound,
      color: '#059669', bg: '#ECFDF5',
      title: 'Đăng nhập an toàn',
      desc: 'Sử dụng JWT với access token + refresh token. Token được lưu trong bộ nhớ an toàn, tự động gia hạn khi hết hạn.',
      status: 'Bật',
      statusColor: '#10B981',
    },
    {
      icon: AlertTriangle,
      color: '#DC2626', bg: '#FEF2F2',
      title: 'Phát hiện đăng nhập lạ',
      desc: 'Hệ thống ghi nhận IP và thiết bị đăng nhập. Bạn sẽ nhận thông báo khi có đăng nhập từ thiết bị mới.',
      status: 'Bật',
      statusColor: '#10B981',
    },
  ];

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh' }}>
      <Breadcrumb
        backHref="/settings"
        items={[
          { label: 'Trang chủ', href: '/' },
          { label: 'Cài đặt', href: '/settings' },
          { label: 'Bảo mật' },
        ]}
      />

      {/* Title */}
      <div style={{ background: 'white', borderBottom: '1px solid #E2E8F0', padding: '16px 0' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <ShieldCheck size={22} style={{ color: '#0E76A8' }} />
          <div>
            <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 22, fontWeight: 800, color: '#1E293B', margin: 0 }}>Bảo mật</h1>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#64748B', margin: 0 }}>Các tính năng bảo mật tài khoản</p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '28px 24px' }}>
        {/* Overview card */}
        <div style={{ background: 'linear-gradient(135deg, #0E76A8 0%, #1A8FC0 100%)', borderRadius: 20, padding: 24, marginBottom: 24, color: 'white', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
          <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <ShieldCheck size={40} style={{ opacity: 0.9 }} />
            <div>
              <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 20, fontWeight: 800, marginBottom: 6 }}>Tài khoản của bạn được bảo vệ</h2>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, opacity: 0.9, lineHeight: 1.6 }}>
                Everest sử dụng các biện pháp bảo mật tiên tiến để bảo vệ thông tin và tài khoản của bạn.
              </p>
            </div>
          </div>
        </div>

        {/* Feature list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
          {features.map(f => {
            const Icon = f.icon;
            return (
              <div key={f.title} style={{ background: 'white', borderRadius: 16, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={22} style={{ color: f.color }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <h3 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 700, color: '#1E293B', margin: 0 }}>{f.title}</h3>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 700, color: f.statusColor, background: f.statusColor + '18', padding: '3px 10px', borderRadius: 99 }}>
                        {f.status}
                      </span>
                    </div>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#64748B', lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick actions */}
        <div style={{ background: 'white', borderRadius: 20, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 800, color: '#1E293B', marginBottom: 16 }}>Thao tác nhanh</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              onClick={() => navigate('/settings/change-password')}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: 12, cursor: 'pointer', transition: 'border-color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#0E76A8')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#E2E8F0')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Lock size={18} style={{ color: '#0E76A8' }} />
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: '#1E293B' }}>Đổi mật khẩu</span>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
            </button>
            <button
              onClick={() => navigate('/settings/sessions')}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: 12, cursor: 'pointer', transition: 'border-color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#0E76A8')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#E2E8F0')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Smartphone size={18} style={{ color: '#0E76A8' }} />
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: '#1E293B' }}>Quản lý phiên đăng nhập</span>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
