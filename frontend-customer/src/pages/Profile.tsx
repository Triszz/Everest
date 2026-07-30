import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileApi, type User as ApiUser } from '../services';
import Loading from '../components/Loading';

export function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchProfile = async () => {
      const stored = localStorage.getItem('user');
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch {
          // ignore parse error
        }
      }

      try {
        const res = await profileApi.getProfile();
        if (!cancelled && res.data) {
          setUser(res.data);
          localStorage.setItem('user', JSON.stringify(res.data));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Không thể tải thông tin người dùng');
          if (!stored) navigate('/login');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProfile();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    return null;
  }

  return (
    <div style={{
      minHeight: 'calc(100vh - 200px)',
      background: '#F8FAFC',
      padding: '40px 20px',
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
      }}>
        {/* Page Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: 28,
            fontWeight: 800,
            color: '#1E293B',
            marginBottom: 8,
          }}>Hồ sơ của tôi</h1>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 14,
            color: '#64748B',
          }}>Quản lý thông tin cá nhân của bạn</p>
          {error && (
            <div style={{
              marginTop: 12,
              padding: '10px 14px',
              background: '#FEF2F2',
              color: '#DC2626',
              borderRadius: 8,
              fontSize: 13,
              fontFamily: 'Inter, sans-serif',
            }}>
              {error}
            </div>
          )}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '280px 1fr',
          gap: 24,
        }}>
          {/* Left Sidebar */}
          <div style={{
            background: 'white',
            borderRadius: 16,
            padding: 24,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            height: 'fit-content',
          }}>
            {/* Avatar */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginBottom: 24,
            }}>
              <div style={{
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0E76A8 0%, #2DD4BF 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}>
                <span style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: 36,
                  fontWeight: 800,
                  color: 'white',
                }}>
                  {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <h3 style={{
                fontFamily: 'Manrope, sans-serif',
                fontSize: 18,
                fontWeight: 700,
                color: '#1E293B',
                marginBottom: 4,
              }}>{user.fullName}</h3>
              <span style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 13,
                color: '#64748B',
              }}>{user.email}</span>
            </div>

            {/* Menu */}
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <MenuItem active icon="user">
                Hồ sơ
              </MenuItem>
              <MenuItem icon="bell" onClick={() => navigate('/settings/notifications')}>
                Thông báo
              </MenuItem>
              <MenuItem icon="shield" onClick={() => navigate('/settings/security')}>
                Bảo mật
              </MenuItem>
              <MenuItem icon="help" onClick={() => navigate('/settings/help')}>
                Trợ giúp
              </MenuItem>
            </nav>
          </div>

          {/* Main Content */}
          <div style={{
            background: 'white',
            borderRadius: 16,
            padding: 32,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}>
            <h2 style={{
              fontFamily: 'Manrope, sans-serif',
              fontSize: 20,
              fontWeight: 700,
              color: '#1E293B',
              marginBottom: 24,
            }}>Thông tin cá nhân</h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 20,
            }}>
              <FormField label="Họ và tên" value={user.fullName || '-'} />
              <FormField label="Email" value={user.email || '-'} />
              <FormField label="Số điện thoại" value={user.phoneNumber || 'Chưa cập nhật'} />
              <FormField label="Vai trò" value={
                user.role === 'Customer' ? 'Khách hàng' :
                user.role === 'Admin' ? 'Quản trị viên' :
                user.role === 'Partner_Owner' ? 'Chủ đối tác' :
                user.role === 'Partner_Cashier' ? 'Thu ngân' : user.role
              } />
              <FormField label="Trạng thái" value={
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 12px',
                  background: user.status === 'Active' ? '#DCFCE7' : user.status === 'Inactive' ? '#FEF3C7' : '#FEE2E2',
                  color: user.status === 'Active' ? '#16A34A' : user.status === 'Inactive' ? '#D97706' : '#DC2626',
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: 600,
                }}>
                  <span style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: user.status === 'Active' ? '#16A34A' : user.status === 'Inactive' ? '#D97706' : '#DC2626',
                  }} />
                  {user.status === 'Active' ? 'Đang hoạt động' : user.status === 'Inactive' ? 'Chưa kích hoạt' : 'Đã khóa'}
                </span>
              } />
              <FormField label="Ngày tham gia" value={user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' }) : '-'} />
            </div>

            <div style={{
              marginTop: 32,
              paddingTop: 24,
              borderTop: '1px solid #E2E8F0',
              display: 'flex',
              gap: 12,
            }}>
              <button
                onClick={() => navigate('/settings/edit')}
                style={{
                  padding: '12px 24px',
                  background: '#0E76A8',
                  color: 'white',
                  border: 'none',
                  borderRadius: 10,
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#0A5C87'}
                onMouseLeave={e => e.currentTarget.style.background = '#0E76A8'}
              >
                Chỉnh sửa hồ sơ
              </button>
              <button
                onClick={() => navigate('/settings')}
                style={{
                  padding: '12px 24px',
                  background: 'white',
                  color: '#64748B',
                  border: '1.5px solid #E2E8F0',
                  borderRadius: 10,
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cài đặt khác
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function MenuItem({
  icon,
  children,
  active,
  onClick,
}: {
  icon: 'user' | 'bell' | 'shield' | 'help';
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  const icons = {
    user: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
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
    help: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
  };

  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 16px',
        background: active ? '#E8F4FA' : 'transparent',
        color: active ? '#0E76A8' : '#64748B',
        border: 'none',
        borderRadius: 10,
        fontFamily: 'Inter, sans-serif',
        fontSize: 14,
        fontWeight: active ? 600 : 500,
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.2s',
      }}
      onMouseEnter={e => {
        if (!active) {
          e.currentTarget.style.background = '#F8FAFC';
          e.currentTarget.style.color = '#1E293B';
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = '#64748B';
        }
      }}
    >
      {icons[icon]}
      {children}
    </button>
  );
}

function FormField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <label style={{
        display: 'block',
        fontFamily: 'Inter, sans-serif',
        fontSize: 13,
        fontWeight: 600,
        color: '#64748B',
        marginBottom: 8,
      }}>{label}</label>
      <div style={{
        fontFamily: 'Inter, sans-serif',
        fontSize: 15,
        color: '#1E293B',
        fontWeight: 500,
      }}>{value}</div>
    </div>
  );
}
