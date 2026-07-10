import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileApi, type User } from '../services/api';

export function EditProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load current profile
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const stored = localStorage.getItem('user');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (!cancelled) {
            setUser(parsed);
            setFullName(parsed.fullName || '');
            setPhoneNumber(parsed.phoneNumber || '');
          }
        } catch { /* ignore */ }
      }

      try {
        const res = await profileApi.getProfile();
        if (!cancelled && res.data) {
          setUser(res.data);
          setFullName(res.data.fullName || '');
          setPhoneNumber(res.data.phoneNumber || '');
          localStorage.setItem('user', JSON.stringify(res.data));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Không thể tải thông tin');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!fullName.trim() || fullName.trim().length < 2) {
      setError('Họ và tên phải ít nhất 2 ký tự');
      return;
    }

    if (phoneNumber && !/^[0-9]{10,11}$/.test(phoneNumber)) {
      setError('Số điện thoại phải có 10-11 chữ số');
      return;
    }

    setSubmitting(true);
    try {
      const res = await profileApi.updateProfile({
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim() || null,
      });
      if (res.data) {
        setUser(res.data);
        localStorage.setItem('user', JSON.stringify(res.data));
        setSuccess('Cập nhật hồ sơ thành công!');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cập nhật thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: 'calc(100vh - 200px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          width: 40,
          height: 40,
          border: '3px solid #E2E8F0',
          borderTopColor: '#0E76A8',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
      </div>
    );
  }

  return (
    <div style={{
      minHeight: 'calc(100vh - 200px)',
      background: '#F8FAFC',
      padding: '40px 20px',
    }}>
      <div style={{
        maxWidth: 640,
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
            }}>Chỉnh sửa hồ sơ</h1>
          </div>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 14,
            color: '#64748B',
            marginLeft: 44,
          }}>Cập nhật thông tin cá nhân của bạn</p>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit}>
          <div style={{
            background: 'white',
            borderRadius: 16,
            padding: 32,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
          }}>
            {/* Avatar display */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              paddingBottom: 24,
              borderBottom: '1px solid #E2E8F0',
            }}>
              <div style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0E76A8 0%, #2DD4BF 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'Manrope, sans-serif',
                fontSize: 28,
                fontWeight: 800,
                color: 'white',
                flexShrink: 0,
              }}>
                {fullName?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div>
                <div style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: 16,
                  fontWeight: 700,
                  color: '#1E293B',
                  marginBottom: 4,
                }}>{fullName || 'Người dùng'}</div>
                <div style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 13,
                  color: '#64748B',
                }}>{user?.email}</div>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label style={{
                display: 'block',
                fontFamily: 'Inter, sans-serif',
                fontSize: 13,
                fontWeight: 600,
                color: '#374151',
                marginBottom: 8,
              }}>
                Họ và tên <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Nhập họ và tên"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1.5px solid #E2E8F0',
                  borderRadius: 10,
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 14,
                  color: '#1E293B',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.currentTarget.style.borderColor = '#0E76A8'}
                onBlur={e => e.currentTarget.style.borderColor = '#E2E8F0'}
              />
            </div>

            {/* Email (read-only) */}
            <div>
              <label style={{
                display: 'block',
                fontFamily: 'Inter, sans-serif',
                fontSize: 13,
                fontWeight: 600,
                color: '#374151',
                marginBottom: 8,
              }}>
                Email
              </label>
              <input
                type="email"
                value={user?.email || ''}
                readOnly
                disabled
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1.5px solid #E2E8F0',
                  borderRadius: 10,
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 14,
                  color: '#94A3B8',
                  background: '#F8FAFC',
                  boxSizing: 'border-box',
                  cursor: 'not-allowed',
                }}
              />
              <p style={{
                marginTop: 6,
                fontFamily: 'Inter, sans-serif',
                fontSize: 12,
                color: '#94A3B8',
              }}>Email không thể thay đổi</p>
            </div>

            {/* Phone Number */}
            <div>
              <label style={{
                display: 'block',
                fontFamily: 'Inter, sans-serif',
                fontSize: 13,
                fontWeight: 600,
                color: '#374151',
                marginBottom: 8,
              }}>
                Số điện thoại
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                placeholder="Nhập số điện thoại (10-11 số)"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1.5px solid #E2E8F0',
                  borderRadius: 10,
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 14,
                  color: '#1E293B',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.currentTarget.style.borderColor = '#0E76A8'}
                onBlur={e => e.currentTarget.style.borderColor = '#E2E8F0'}
              />
            </div>

            {/* Messages */}
            {error && (
              <div style={{
                padding: '12px 16px',
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: 10,
                fontFamily: 'Inter, sans-serif',
                fontSize: 13,
                color: '#DC2626',
              }}>
                {error}
              </div>
            )}

            {success && (
              <div style={{
                padding: '12px 16px',
                background: '#F0FDF4',
                border: '1px solid #BBF7D0',
                borderRadius: 10,
                fontFamily: 'Inter, sans-serif',
                fontSize: 13,
                color: '#16A34A',
              }}>
                {success}
              </div>
            )}

            {/* Actions */}
            <div style={{
              display: 'flex',
              gap: 12,
              paddingTop: 8,
            }}>
              <button
                type="button"
                onClick={() => navigate('/profile')}
                style={{
                  flex: 1,
                  padding: '13px 24px',
                  background: 'white',
                  color: '#64748B',
                  border: '1.5px solid #E2E8F0',
                  borderRadius: 10,
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#CBD5E1';
                  e.currentTarget.style.color = '#475569';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#E2E8F0';
                  e.currentTarget.style.color = '#64748B';
                }}
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  flex: 2,
                  padding: '13px 24px',
                  background: submitting ? '#94A3B8' : '#0E76A8',
                  color: 'white',
                  border: 'none',
                  borderRadius: 10,
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
                onMouseEnter={e => { if (!submitting) e.currentTarget.style.background = '#0A5C87'; }}
                onMouseLeave={e => { if (!submitting) e.currentTarget.style.background = '#0E76A8'; }}
              >
                {submitting ? (
                  <>
                    <span style={{
                      width: 16,
                      height: 16,
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: 'white',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                      display: 'inline-block',
                    }} />
                    Đang lưu...
                  </>
                ) : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
