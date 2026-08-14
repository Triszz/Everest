import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authFetch, handleResponse } from '../services/http';

interface NotificationPrefs {
  [key: string]: boolean;
}

const NOTIFICATION_TYPES = [
  { key: 'n1', label: 'Thông báo đơn hàng', description: 'Cập nhật trạng thái đơn hàng' },
  { key: 'n2', label: 'Voucher sắp hết hạn', description: 'Nhắc nhở khi voucher sắp hết hạn' },
  { key: 'n3', label: 'Khuyến mãi mới', description: 'Thông báo các chương trình khuyến mãi' },
  { key: 'n4', label: 'Tặng voucher', description: 'Khi có người tặng voucher cho bạn' },
  { key: 'n5', label: 'Đánh giá sản phẩm', description: 'Phản hồi về đánh giá của bạn' },
  { key: 'n6', label: 'Bảo mật tài khoản', description: 'Cảnh báo bảo mật quan trọng' },
  { key: 'n7', label: 'Tin tức từ partner', description: 'Cập nhật từ các đối tác' },
  { key: 'n8', label: 'Newsletter', description: 'Bản tin hàng tuần' },
  { key: 'n9', label: 'Khảo sát khách hàng', description: 'Lời mời tham gia khảo sát' },
];

export function NotificationsPage() {
  const navigate = useNavigate();
  const [prefs, setPrefs] = useState<NotificationPrefs>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const loadPrefs = async () => {
      try {
        const res = await authFetch('/api/customer/notifications/preferences');
        const data = await handleResponse<NotificationPrefs>(res);
        if (data.success) {
          setPrefs(data.data || {});
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    loadPrefs();
  }, []);

  const togglePref = (key: string) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const res = await authFetch('/api/customer/notifications/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prefs),
      });
      const data = await handleResponse(res);
      if (data.success) {
        setMessage('Đã lưu cài đặt thông báo!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err: any) {
      setMessage(err.message || 'Lỗi khi lưu cài đặt');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>
        Đang tải...
      </div>
    );
  }

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh' }}>
      <div style={{ background: 'white', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '12px 24px' }}>
          <span style={{ fontSize: 13, color: '#64748B' }}>
            <a onClick={() => navigate('/settings')} style={{ color: '#0E76A8', cursor: 'pointer' }}>
              Settings
            </a>
            <span style={{ margin: '0 8px' }}>/</span>
            <span style={{ color: '#1E293B', fontWeight: 600 }}>Notifications</span>
          </span>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ background: 'white', borderRadius: 16, padding: 28, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
          <h2 style={{ margin: '0 0 8px 0', fontSize: 20, fontWeight: 800, color: '#1E293B', fontFamily: 'Manrope, sans-serif' }}>
            Cài đặt thông báo
          </h2>
          <p style={{ margin: '0 0 24px 0', fontSize: 13, color: '#64748B' }}>
            Chọn các loại thông báo bạn muốn nhận
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {NOTIFICATION_TYPES.map((type) => (
              <div
                key={type.key}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: 16, background: '#F8FAFC', borderRadius: 12,
                }}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1E293B' }}>{type.label}</div>
                  <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>{type.description}</div>
                </div>
                <button
                  onClick={() => togglePref(type.key)}
                  style={{
                    width: 44, height: 24, borderRadius: 12,
                    background: prefs[type.key] ? '#0E76A8' : '#CBD5E1',
                    border: 'none', cursor: 'pointer',
                    position: 'relative', transition: 'background 0.2s', padding: 0,
                  }}
                >
                  <span style={{
                    position: 'absolute', top: 2, left: prefs[type.key] ? 22 : 2,
                    width: 20, height: 20, borderRadius: '50%',
                    background: 'white', transition: 'left 0.2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }} />
                </button>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: '10px 24px', background: saving ? '#94A3B8' : '#0E76A8',
                color: 'white', border: 'none', borderRadius: 10,
                fontSize: 14, fontWeight: 700, cursor: saving ? 'wait' : 'pointer',
                fontFamily: 'Manrope, sans-serif',
              }}
            >
              {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
            </button>
            {message && (
              <span style={{ fontSize: 13, color: message.includes('Lỗi') ? '#EF4444' : '#10B981', fontWeight: 600 }}>
                {message}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}