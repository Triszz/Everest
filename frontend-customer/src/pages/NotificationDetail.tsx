/**
 * NotificationDetail — Trang xem chi tiết 1 thông báo
 * -------------------------------------------------------
 * Route: /notifications/:id
 *
 * - Fetch notification theo ID từ backend (auto mark-as-read)
 * - Hiển thị nội dung phong phú tùy loại:
 *     ORDER_PAID / ORDER_PURCHASED  → Card xanh + nút xem đơn hàng
 *     VOUCHER_GIFT_RECEIVED         → Card xanh lá + nút xem voucher
 *     Khác                          → Card xám generic
 * - Nút quay lại + xóa thông báo
 */
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { notificationApi } from '../services';
import type { Notification } from '../services';
import Loading from '../components/Loading';
import { Breadcrumb } from '../components/Breadcrumb';

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatFullDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleString('vi-VN', {
      weekday: 'long', day: '2-digit', month: '2-digit',
      year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

function formatCurrency(amount: number): string {
  return amount.toLocaleString('vi-VN') + '₫';
}

// ── Type-specific card components ──────────────────────────────────────────────

type NotifData = Record<string, unknown>;

function OrderPaidCard({ data }: { data: NotifData }) {
  const orderId = data?.orderId as number | undefined;
  const totalAmount = data?.totalAmount as number | undefined;

  return (
    <div style={{
      background: 'linear-gradient(135deg, #E0F2FE 0%, #F0F9FF 100%)',
      border: '1.5px solid #BAE6FD',
      borderRadius: 20,
      padding: '28px 32px',
      marginBottom: 24,
    }}>
      {/* Icon + title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <div style={{
          width: 60, height: 60,
          background: 'linear-gradient(135deg, #0E76A8, #1A8FC0)',
          borderRadius: 18,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(14,118,168,0.3)',
          flexShrink: 0,
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#0369A1', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
            Thanh toán thành công
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#0C4A6E', fontFamily: 'Manrope, sans-serif' }}>
            Đơn hàng đã được xác nhận
          </div>
        </div>
      </div>

      {/* Info grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: 12, marginBottom: 24,
      }}>
        {orderId && (
          <div style={{
            background: 'white', borderRadius: 12,
            padding: '16px 20px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          }}>
            <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
              Mã đơn hàng
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#0E76A8', fontFamily: 'Manrope, sans-serif' }}>
              #{orderId}
            </div>
          </div>
        )}
        {totalAmount !== undefined && (
          <div style={{
            background: 'white', borderRadius: 12,
            padding: '16px 20px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          }}>
            <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
              Tổng thanh toán
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#10B981', fontFamily: 'Manrope, sans-serif' }}>
              {formatCurrency(totalAmount)}
            </div>
          </div>
        )}
      </div>

      {/* Status badge */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        background: '#DCFCE7', border: '1px solid #86EFAC',
        borderRadius: 10, padding: '8px 14px', marginBottom: 20,
      }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: '#166534' }}>
          Thanh toán thành công · Voucher đã được cấp
        </span>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {orderId && (
          <Link
            to={`/checkout/success?orderId=${orderId}`}
            id="btn-view-order"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 22px',
              background: '#0E76A8', color: 'white',
              borderRadius: 12, textDecoration: 'none',
              fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 700,
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#0A5C87'}
            onMouseLeave={e => e.currentTarget.style.background = '#0E76A8'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            Xem chi tiết đơn hàng
          </Link>
        )}
        <Link
          to="/my-voucher"
          id="btn-view-my-vouchers"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '12px 22px',
            background: 'white', color: '#0E76A8',
            border: '1.5px solid #BAE6FD',
            borderRadius: 12, textDecoration: 'none',
            fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 700,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 12V22H4V12"/><path d="M22 7H2v5h20V7z"/>
            <path d="M12 22V7"/>
          </svg>
          Voucher của tôi
        </Link>
      </div>
    </div>
  );
}

function GiftReceivedCard({ data }: { data: NotifData }) {
  const gifterName = data?.gifterName as string | undefined;
  const voucherTitle = data?.voucherTitle as string | undefined;
  const voucherCode = data?.voucherCode as string | undefined;
  const giftMessage = data?.giftMessage as string | undefined;
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!voucherCode) return;
    try {
      await navigator.clipboard.writeText(voucherCode);
    } catch {
      const el = document.createElement('textarea');
      el.value = voucherCode;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%)',
      border: '1.5px solid #86EFAC',
      borderRadius: 20,
      padding: '28px 32px',
      marginBottom: 24,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Icon + title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <div style={{
          width: 60, height: 60,
          background: 'linear-gradient(135deg, #10B981, #059669)',
          borderRadius: 18,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(16,185,129,0.35)',
          flexShrink: 0,
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <polyline points="20 12 20 22 4 22 4 12"/>
            <rect x="2" y="7" width="20" height="5"/>
            <line x1="12" y1="22" x2="12" y2="7"/>
            <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
            <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#15803D', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
            Quà tặng từ bạn bè 🎁
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#14532D', fontFamily: 'Manrope, sans-serif' }}>
            Bạn nhận được voucher!
          </div>
        </div>
      </div>

      {/* Gift message */}
      {giftMessage && (
        <div style={{
          background: 'white',
          borderRadius: 14,
          padding: '18px 22px',
          marginBottom: 20,
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        }}>
          <div style={{
            fontSize: 11, fontWeight: 600, color: '#64748B',
            textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span>💬</span> Lời nhắn từ {gifterName || 'người tặng'}
          </div>
          <p style={{
            fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 600,
            color: '#1E293B', lineHeight: 1.5, margin: 0,
            fontStyle: 'italic',
          }}>
            "{giftMessage}"
          </p>
        </div>
      )}

      {/* Voucher details */}
      <div style={{
        background: 'white', borderRadius: 14, overflow: 'hidden',
        border: '1px solid #BBF7D0',
        boxShadow: '0 2px 8px rgba(16,185,129,0.1)',
        marginBottom: 20,
      }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px dashed #D1FAE5' }}>
          <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
            Voucher được tặng
          </div>
          <div style={{ fontSize: 17, fontWeight: 800, color: '#14532D', fontFamily: 'Manrope, sans-serif' }}>
            {voucherTitle || 'Voucher'}
          </div>
          {gifterName && (
            <div style={{ fontSize: 13, color: '#15803D', marginTop: 4, fontWeight: 500 }}>
              Từ: <strong>{gifterName}</strong>
            </div>
          )}
        </div>

        {voucherCode && (
          <div style={{
            padding: '14px 20px',
            background: '#F0FDF4',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
          }}>
            <div>
              <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600, marginBottom: 4 }}>Mã voucher</div>
              <div style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: 20,
                fontWeight: 800, color: '#14532D', letterSpacing: 3,
              }}>
                {voucherCode}
              </div>
            </div>
            <button
              id="btn-copy-voucher-code"
              onClick={handleCopy}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '10px 18px',
                background: copied ? '#DCFCE7' : '#10B981',
                color: copied ? '#15803D' : 'white',
                border: 'none', borderRadius: 10,
                fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700,
                cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0,
              }}
            >
              {copied ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                  Đã sao chép!
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                  Sao chép mã
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Link
          to="/my-voucher"
          id="btn-go-to-my-vouchers"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '12px 22px',
            background: '#10B981', color: 'white',
            borderRadius: 12, textDecoration: 'none',
            fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 700,
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#059669'}
          onMouseLeave={e => e.currentTarget.style.background = '#10B981'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 12V22H4V12"/><path d="M22 7H2v5h20V7z"/>
            <path d="M12 22V7"/>
          </svg>
          Xem voucher của tôi
        </Link>
        <Link
          to="/vouchers"
          id="btn-browse-more-vouchers"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '12px 22px',
            background: 'white', color: '#10B981',
            border: '1.5px solid #86EFAC',
            borderRadius: 12, textDecoration: 'none',
            fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 700,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          Khám phá thêm voucher
        </Link>
      </div>
    </div>
  );
}

function GenericCard({ notification }: { notification: Notification }) {
  const typeLabel: Record<string, string> = {
    VOUCHER_EXPIRING: 'Voucher sắp hết hạn',
    SYSTEM: 'Thông báo hệ thống',
    ORDER_PURCHASED: 'Đơn hàng',
  };
  const label = typeLabel[notification.type] || 'Thông báo';

  return (
    <div style={{
      background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
      border: '1.5px solid #E2E8F0',
      borderRadius: 20,
      padding: '28px 32px',
      marginBottom: 24,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
        <div style={{
          width: 60, height: 60,
          background: 'linear-gradient(135deg, #64748B, #475569)',
          borderRadius: 18,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(100,116,139,0.25)',
          flexShrink: 0,
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
            {label}
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#1E293B', fontFamily: 'Manrope, sans-serif' }}>
            {notification.title}
          </div>
        </div>
      </div>
      <p style={{
        fontFamily: 'Inter, sans-serif', fontSize: 15, color: '#475569',
        lineHeight: 1.7, margin: 0, background: 'white',
        borderRadius: 12, padding: '16px 20px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      }}>
        {notification.message}
      </p>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export function NotificationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [notification, setNotification] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchNotification = async () => {
      if (!id) { setError('ID thông báo không hợp lệ.'); setLoading(false); return; }
      try {
        setLoading(true);
        const res = await notificationApi.getById(Number(id));
        // Backend wraps in { success, data } — unwrap
        const n = (res as any).data ?? res;
        if (n?.notificationId) {
          setNotification(n as Notification);
        } else {
          setError('Không tìm thấy thông báo.');
        }
      } catch {
        setError('Không tìm thấy thông báo hoặc bạn không có quyền truy cập.');
      } finally {
        setLoading(false);
      }
    };
    fetchNotification();
  }, [id]);

  const handleDelete = async () => {
    if (!notification || !confirm('Xóa thông báo này?')) return;
    setDeleting(true);
    try {
      await notificationApi.delete(notification.notificationId);
      navigate('/notifications', { replace: true });
    } catch {
      setDeleting(false);
    }
  };

  if (loading) return <Loading />;

  if (error || !notification) {
    return (
      <div style={{ background: '#F8FAFC', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{
          background: 'white', borderRadius: 20, padding: '48px 40px',
          maxWidth: 440, width: '100%', textAlign: 'center',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        }}>
          <div style={{ width: 72, height: 72, background: '#FEE2E2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 20, fontWeight: 800, color: '#1E293B', marginBottom: 12 }}>
            Không tìm thấy thông báo
          </h2>
          <p style={{ fontSize: 14, color: '#64748B', marginBottom: 28 }}>{error}</p>
          <Link
            to="/notifications"
            style={{
              display: 'block', padding: '14px', background: '#0E76A8',
              color: 'white', textDecoration: 'none', borderRadius: 12,
              fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 700, textAlign: 'center',
            }}
          >
            Quay lại thông báo
          </Link>
        </div>
      </div>
    );
  }

  const data = (notification.data ?? {}) as NotifData;

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh' }}>
      <Breadcrumb
        backHref="/notifications"
        items={[
          { label: 'Trang chủ', href: '/' },
          { label: 'Thông báo', href: '/notifications' },
          { label: notification.title.length > 30 ? notification.title.slice(0, 30) + '...' : notification.title },
        ]}
        maxWidth={800}
      />

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px' }}>
        {/* ── Delete action (on the right) ── */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>

          <button
            id="btn-delete-notification"
            onClick={handleDelete}
            disabled={deleting}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '10px 18px',
              background: 'white', color: deleting ? '#94A3B8' : '#EF4444',
              border: `1.5px solid ${deleting ? '#E2E8F0' : '#FECACA'}`,
              borderRadius: 12, cursor: deleting ? 'wait' : 'pointer',
              fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600,
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { if (!deleting) e.currentTarget.style.background = '#FEE2E2'; }}
            onMouseLeave={e => { if (!deleting) e.currentTarget.style.background = 'white'; }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
            {deleting ? 'Đang xóa...' : 'Xóa thông báo'}
          </button>
        </div>

        {/* ── Notification meta header ── */}
        <div style={{
          background: 'white', borderRadius: 16,
          padding: '20px 28px', marginBottom: 20,
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}>
          <h1 style={{
            fontFamily: 'Manrope, sans-serif', fontSize: 20, fontWeight: 800,
            color: '#1E293B', margin: 0, marginBottom: 8,
          }}>
            {notification.title}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: '#94A3B8' }}>
              🕐 {formatFullDate(notification.createdAt)}
            </span>
            <span style={{
              fontSize: 11, fontWeight: 700,
              padding: '3px 10px', borderRadius: 99,
              background: notification.status === 'Unread' ? '#EFF6FF' : '#F1F5F9',
              color: notification.status === 'Unread' ? '#3B82F6' : '#94A3B8',
              textTransform: 'uppercase', letterSpacing: 0.5,
            }}>
              {notification.status === 'Unread' ? 'Chưa đọc' : 'Đã đọc'}
            </span>
          </div>
        </div>

        {/* ── Type-specific rich card ── */}
        {(notification.type === 'ORDER_PAID' || notification.type === 'ORDER_PURCHASED')
          ? <OrderPaidCard data={data} />
          : notification.type === 'VOUCHER_GIFT_RECEIVED'
          ? <GiftReceivedCard data={data} />
          : <GenericCard notification={notification} />
        }

        {/* ── Full message text ── */}
        <div style={{
          background: 'white', borderRadius: 16,
          padding: '20px 28px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}>
          <div style={{
            fontSize: 11, fontWeight: 700, color: '#94A3B8',
            textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12,
          }}>
            Nội dung thông báo
          </div>
          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: 15, color: '#334155',
            lineHeight: 1.7, margin: 0,
          }}>
            {notification.message}
          </p>
        </div>
      </div>
    </div>
  );
}
