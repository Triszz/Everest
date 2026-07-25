import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Monitor, Smartphone, Globe, Clock, Trash2, Loader2, CheckCircle2 } from 'lucide-react';
import { authApi } from '../services/api';

function formatDate(d: Date) {
  return d.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

interface Session {
  id: string;
  device: string;
  browser: string;
  ip: string;
  location: string;
  lastActive: string;
  expiresAt: string;
  current: boolean;
}

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff} giây trước`;
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  return `${Math.floor(diff / 86400)} ngày trước`;
}

function detectDevice(userAgent: string): { label: string; Icon: typeof Monitor } {
  if (/mobile|android|iphone/i.test(userAgent)) return { label: 'Mobile', Icon: Smartphone };
  return { label: 'Desktop', Icon: Monitor };
}

export function SessionsPage() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loading, setLoading] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  // Load sessions on mount
  useEffect(() => {
    authApi.me().then(meRes => {
      if (!meRes.success) { navigate('/login'); return; }
      // Fetch sessions list
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/auth/sessions`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
      })
        .then(r => r.json())
        .then(data => {
          if (data.success) {
            const currentId = localStorage.getItem('current_session_id');
            setSessions(data.data.map((s: any) => ({
              ...s,
              lastActive: s.lastActive || s.createdAt,
              current: s.id === currentId,
            })));
          }
        })
        .catch(() => {})
        .finally(() => setLoadingSessions(false));
    });
  }, [navigate]);

  const handleRevoke = async (id: string) => {
    if (sessions.find(s => s.id === id)?.current) {
      alert('Bạn không thể đăng xuất phiên hiện tại.');
      return;
    }
    setLoading(id);
    try {
      const res = await authApi.revokeSession(id);
      if (res.success) {
        setSessions(prev => prev.filter(s => s.id !== id));
      } else {
        alert(res.error?.message || 'Không thể đăng xuất thiết bị.');
      }
    } catch {
      alert('Đã xảy ra lỗi.');
    } finally {
      setLoading(null);
    }
  };

  const handleRevokeAll = async () => {
    if (!confirm('Đăng xuất tất cả các thiết bị khác?')) return;
    setLoading('all');
    try {
      const res = await authApi.revokeAllOtherSessions();
      if (res.success) {
        setSessions(prev => prev.filter(s => s.current));
      } else {
        alert(res.error?.message || 'Không thể đăng xuất.');
      }
    } catch {
      alert('Đã xảy ra lỗi.');
    } finally {
      setLoading(null);
    }
  };

  const displayed = showAll ? sessions : sessions.slice(0, 2);

  if (loadingSessions) {
    return (
      <div style={{ background: '#F8FAFC', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: '#0E76A8' }} />
      </div>
    );
  }

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate('/settings')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 8, display: 'flex' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <div>
            <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 22, fontWeight: 800, color: '#1E293B', margin: 0 }}>Phiên đăng nhập</h1>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#64748B', margin: 0 }}>Quản lý các thiết bị đã đăng nhập</p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '28px 24px' }}>
        {/* Info banner */}
        <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 14, padding: '14px 18px', marginBottom: 24, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <Globe size={20} style={{ color: '#2563EB', flexShrink: 0, marginTop: 2 }} />
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#1D4ED8', lineHeight: 1.6, margin: 0 }}>
            Phiên hiện tại của bạn đang hoạt động trên <strong>Desktop / Chrome</strong>. Nếu phát hiện đăng nhập lạ, hãy đăng xuất ngay.
          </p>
        </div>

        {/* Session list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {displayed.map(session => {
            const { Icon } = detectDevice(session.browser);
            const isLoading = loading === session.id;
            return (
              <div
                key={session.id}
                style={{
                  background: 'white', borderRadius: 16, padding: 20,
                  border: `1.5px solid ${session.current ? '#BAE6FD' : '#F1F5F9'}`,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                  transition: 'border-color 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  {/* Icon */}
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: session.current ? '#E8F4FA' : '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={22} style={{ color: session.current ? '#0E76A8' : '#64748B' }} />
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 700, color: '#1E293B' }}>
                        {session.device}
                      </span>
                      {session.current && (
                        <span style={{ background: '#ECFDF5', color: '#10B981', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99, fontFamily: 'Inter, sans-serif' }}>
                          Phiên hiện tại
                        </span>
                      )}
                    </div>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#334155', marginBottom: 4 }}>{session.browser}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#64748B' }}>
                        <Globe size={12} /> {session.ip}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#64748B' }}>
                        📍 {session.location}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#64748B' }}>
                        <Clock size={12} /> {timeAgo(session.lastActive)}
                      </span>
                    </div>
                  </div>

                  {/* Revoke */}
                  {!session.current && (
                    <button
                      onClick={() => handleRevoke(session.id)}
                      disabled={isLoading}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '8px 14px',
                        background: 'white', color: '#EF4444',
                        border: '1.5px solid #FECACA', borderRadius: 10,
                        fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700,
                        cursor: isLoading ? 'wait' : 'pointer', flexShrink: 0,
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#FEF2F2'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'white'; }}
                    >
                      {isLoading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={14} />}
                      {isLoading ? 'Đang xóa...' : 'Đăng xuất'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Show more */}
        {sessions.length > 2 && (
          <button
            onClick={() => setShowAll(v => !v)}
            style={{ width: '100%', marginTop: 14, padding: '12px', background: 'white', color: '#0E76A8', border: '1.5px solid #BAE6FD', borderRadius: 12, fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
          >
            {showAll ? 'Thu gọn' : `Xem thêm (${sessions.length - 2} phiên khác)`}
          </button>
        )}

        {/* Danger zone */}
        <div style={{ marginTop: 32, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 16, padding: 20 }}>
          <h3 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 800, color: '#DC2626', marginBottom: 10 }}>Nguy hiểm</h3>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#7F1D1D', lineHeight: 1.6, marginBottom: 14 }}>
            Nếu bạn nghi ngờ tài khoản bị xâm nhập, hãy đăng xuất tất cả các thiết bị khác và đổi mật khẩu ngay.
          </p>
          <button
            onClick={handleRevokeAll}
            disabled={loading === 'all'}
            style={{ padding: '10px 20px', background: loading === 'all' ? '#FCA5A5' : '#DC2626', color: 'white', border: 'none', borderRadius: 10, fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700, cursor: loading === 'all' ? 'wait' : 'pointer', transition: 'background 0.2s' }}
            onMouseEnter={e => { if (loading !== 'all') e.currentTarget.style.background = '#B91C1C'; }}
            onMouseLeave={e => { if (loading !== 'all') e.currentTarget.style.background = '#DC2626'; }}
          >
            {loading === 'all' ? 'Đang đăng xuất...' : 'Đăng xuất tất cả thiết bị khác'}
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
