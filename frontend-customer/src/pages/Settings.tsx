import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services';

export function SettingsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    promotions: true,
  });

  const [privacy, setPrivacy] = useState({
    showProfile: true,
    showEmail: false,
    allowTracking: true,
  });

  return (
    <div style={{
      minHeight: 'calc(100vh - 200px)',
      background: '#F8FAFC',
      padding: '40px 20px',
    }}>
      <div style={{
        maxWidth: 1000,
        margin: '0 auto',
      }}>
        {/* Page Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <button
              onClick={() => navigate('/profile')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 8,
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </button>
            <h1 style={{
              fontFamily: 'Manrope, sans-serif',
              fontSize: 28,
              fontWeight: 800,
              color: '#1E293B',
            }}>Cài đặt</h1>
          </div>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 14,
            color: '#64748B',
            marginLeft: 44,
          }}>Quản lý tài khoản và sở thích của bạn</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Notifications */}
          <SettingsSection title="Thông báo" icon="bell">
            <ToggleOption
              label="Thông báo qua Email"
              description="Nhận thông báo qua email về đơn hàng và khuyến mãi"
              checked={notifications.email}
              onChange={(v) => setNotifications(n => ({ ...n, email: v }))}
            />
            <ToggleOption
              label="Tin nhắn SMS"
              description="Nhận tin nhắn cập nhật trạng thái đơn hàng"
              checked={notifications.sms}
              onChange={(v) => setNotifications(n => ({ ...n, sms: v }))}
            />
            <ToggleOption
              label="Thông báo đẩy"
              description="Nhận thông báo tức thì từ ứng dụng"
              checked={notifications.push}
              onChange={(v) => setNotifications(n => ({ ...n, push: v }))}
            />
            <ToggleOption
              label="Khuyến mãi & Ưu đãi"
              description="Cập nhật về voucher mới và ưu đãi đặc biệt"
              checked={notifications.promotions}
              onChange={(v) => setNotifications(n => ({ ...n, promotions: v }))}
            />
          </SettingsSection>

          {/* Privacy */}
          <SettingsSection title="Quyền riêng tư" icon="shield">
            <ToggleOption
              label="Hiển thị hồ sơ công khai"
              description="Cho phép người khác xem thông tin hồ sơ của bạn"
              checked={privacy.showProfile}
              onChange={(v) => setPrivacy(p => ({ ...p, showProfile: v }))}
            />
            <ToggleOption
              label="Hiển thị email"
              description="Email của bạn sẽ hiển thị trên hồ sơ công khai"
              checked={privacy.showEmail}
              onChange={(v) => setPrivacy(p => ({ ...p, showEmail: v }))}
            />
            <ToggleOption
              label="Theo dõi hoạt động"
              description="Cho phép hệ thống ghi nhận hoạt động của bạn"
              checked={privacy.allowTracking}
              onChange={(v) => setPrivacy(p => ({ ...p, allowTracking: v }))}
            />
          </SettingsSection>

          {/* Security */}
          <SettingsSection title="Bảo mật" icon="lock">
            <button
              onClick={() => navigate('/settings/change-password')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                background: 'white',
                border: '1px solid #E2E8F0',
                borderRadius: 12,
                cursor: 'pointer',
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#0E76A8'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#E2E8F0'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: '#E8F4FA',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0E76A8" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 15,
                    fontWeight: 600,
                    color: '#1E293B',
                    marginBottom: 4,
                  }}>Đổi mật khẩu</div>
                  <div style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 13,
                    color: '#64748B',
                  }}>Cập nhật mật khẩu để bảo vệ tài khoản</div>
                </div>
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>

            <button
              onClick={() => navigate('/settings/sessions')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                background: 'white',
                border: '1px solid #E2E8F0',
                borderRadius: 12,
                cursor: 'pointer',
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#0E76A8'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#E2E8F0'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: '#FEF3C7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                    <line x1="8" y1="21" x2="16" y2="21"/>
                    <line x1="12" y1="17" x2="12" y2="21"/>
                  </svg>
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 15,
                    fontWeight: 600,
                    color: '#1E293B',
                    marginBottom: 4,
                  }}>Phiên đăng nhập</div>
                  <div style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 13,
                    color: '#64748B',
                  }}>Quản lý các thiết bị đã đăng nhập</div>
                </div>
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>

            <button
              onClick={() => navigate('/feedback')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                background: 'white',
                border: '1px solid #E2E8F0',
                borderRadius: 12,
                cursor: 'pointer',
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#0E76A8'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#E2E8F0'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: '#FEF2F2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 15,
                    fontWeight: 600,
                    color: '#1E293B',
                    marginBottom: 4,
                  }}>Phản hồi & Khiếu nại</div>
                  <div style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 13,
                    color: '#64748B',
                  }}>Gửi khiếu nại hoặc góp ý dịch vụ</div>
                </div>
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>

            <button
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                background: 'white',
                border: '1px solid #E2E8F0',
                borderRadius: 12,
                cursor: 'pointer',
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#EF4444'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#E2E8F0'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: '#FEE2E2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 15,
                    fontWeight: 600,
                    color: '#EF4444',
                    marginBottom: 4,
                  }}>Xóa tài khoản</div>
                  <div style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 13,
                    color: '#64748B',
                  }}>Tài khoản sẽ bị xóa vĩnh viễn</div>
                </div>
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>
          </SettingsSection>

          {/* Account Actions */}
          <SettingsSection title="Tài khoản" icon="user">
            <button
              onClick={async () => {
                if (confirm('Bạn có chắc muốn đăng xuất?')) {
                  localStorage.removeItem('access_token');
                  localStorage.removeItem('refresh_token');
                  localStorage.removeItem('user');
                  navigate('/logout');
                }
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '14px 20px',
                background: '#0E76A8',
                color: 'white',
                border: 'none',
                borderRadius: 12,
                fontFamily: 'Inter, sans-serif',
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#0A5C87'}
              onMouseLeave={e => e.currentTarget.style.background = '#0E76A8'}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Đăng xuất
            </button>
          </SettingsSection>
        </div>
      </div>
    </div>
  );
}

function SettingsSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: 'bell' | 'shield' | 'lock' | 'user';
  children: React.ReactNode;
}) {
  const icons = {
    bell: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
    ),
    shield: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    lock: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    ),
    user: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: 16,
      padding: 24,
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
        paddingBottom: 16,
        borderBottom: '1px solid #E2E8F0',
      }}>
        <div style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: '#E8F4FA',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#0E76A8',
        }}>
          {icons[icon]}
        </div>
        <h2 style={{
          fontFamily: 'Manrope, sans-serif',
          fontSize: 18,
          fontWeight: 700,
          color: '#1E293B',
        }}>{title}</h2>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {children}
      </div>
    </div>
  );
}

function ToggleOption({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 20px',
      background: '#F8FAFC',
      borderRadius: 12,
    }}>
      <div>
        <div style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 15,
          fontWeight: 600,
          color: '#1E293B',
          marginBottom: 4,
        }}>{label}</div>
        <div style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 13,
          color: '#64748B',
        }}>{description}</div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        style={{
          width: 48,
          height: 28,
          borderRadius: 14,
          background: checked ? '#0E76A8' : '#E2E8F0',
          border: 'none',
          cursor: 'pointer',
          position: 'relative',
          transition: 'background 0.2s',
        }}
      >
        <span style={{
          position: 'absolute',
          top: 4,
          left: checked ? 24 : 4,
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: 'white',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          transition: 'left 0.2s',
        }} />
      </button>
    </div>
  );
}
