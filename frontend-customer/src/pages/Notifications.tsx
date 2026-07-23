import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Loader2 } from 'lucide-react';

const NOTIFICATION_GROUPS = [
  {
    title: 'Đơn hàng',
    notifications: [
      { id: 'n1', label: 'Thông báo khi đơn hàng được xác nhận', desc: 'Email + SMS' },
      { id: 'n2', label: 'Thông báo khi voucher được phát hành', desc: 'Email + Push' },
      { id: 'n3', label: 'Nhắc nhở voucher sắp hết hạn (3 ngày)', desc: 'Push notification' },
      { id: 'n4', label: 'Thông báo đơn hàng bị hủy', desc: 'Email + Push' },
    ],
  },
  {
    title: 'Khuyến mãi',
    notifications: [
      { id: 'n5', label: 'Voucher mới từ đối tác yêu thích', desc: 'Email + Push' },
      { id: 'n6', label: 'Flash sale & ưu đãi đặc biệt', desc: 'Push notification' },
      { id: 'n7', label: 'Cập nhật chương trình tích điểm', desc: 'Email' },
    ],
  },
  {
    title: 'Hệ thống',
    notifications: [
      { id: 'n8', label: 'Bảo mật: đăng nhập từ thiết bị mới', desc: 'Email + SMS' },
      { id: 'n9', label: 'Cập nhật điều khoản sử dụng', desc: 'Email' },
    ],
  },
];

export function NotificationsPage() {
  const navigate = useNavigate();
  const [state, setState] = useState<Record<string, boolean>>(
    Object.fromEntries(NOTIFICATION_GROUPS.flatMap(g => g.notifications.map(n => [n.id, true])))
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggle = (id: string) => {
    setState(s => ({ ...s, [id]: !s[id] }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    // ── TODO: wire profileApi.updateNotificationPrefs(state) ──
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const Toggle = ({ checked }: { checked: boolean }) => (
    <button
      onClick={() => {}}
      style={{
        width: 48, height: 28, borderRadius: 14, background: checked ? '#0E76A8' : '#E2E8F0',
        border: 'none', cursor: 'default', position: 'relative', transition: 'background 0.2s', pointerEvents: 'none',
      }}
    >
      <span style={{
        position: 'absolute', top: 4, left: checked ? 24 : 4, width: 20, height: 20,
        borderRadius: '50%', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left 0.2s',
      }} />
    </button>
  );

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate('/settings')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 8, display: 'flex' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Bell size={22} style={{ color: '#0E76A8' }} />
            <div>
              <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 22, fontWeight: 800, color: '#1E293B', margin: 0 }}>Thông báo</h1>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#64748B', margin: 0 }}>Quản lý kênh nhận thông báo</p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '28px 24px' }}>
        {NOTIFICATION_GROUPS.map(group => (
          <div key={group.title} style={{ background: 'white', borderRadius: 20, padding: 24, marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 800, color: '#1E293B', marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid #F1F5F9' }}>
              {group.title}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {group.notifications.map((n, i) => (
                <div
                  key={n.id}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 0',
                    borderBottom: i < group.notifications.length - 1 ? '1px solid #F8FAFC' : 'none',
                  }}
                >
                  <div>
                    <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: '#1E293B', marginBottom: 3 }}>
                      {n.label}
                    </div>
                    <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#94A3B8' }}>
                      {n.desc}
                    </div>
                  </div>
                  <button
                    onClick={() => toggle(n.id)}
                    style={{
                      width: 48, height: 28, borderRadius: 14,
                      background: state[n.id] ? '#0E76A8' : '#E2E8F0',
                      border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                    }}
                  >
                    <span style={{
                      position: 'absolute', top: 4, left: state[n.id] ? 24 : 4, width: 20, height: 20,
                      borderRadius: '50%', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left 0.2s',
                    }} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving}
          style={{ width: '100%', padding: '14px', background: saving ? '#94A3B8' : saved ? '#10B981' : '#0E76A8', color: 'white', border: 'none', borderRadius: 14, fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 700, cursor: saving ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background 0.3s', marginTop: 8 }}
        >
          {saving ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Đang lưu...</> : saved ? <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> Đã lưu!</> : 'Lưu thay đổi'}
        </button>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
