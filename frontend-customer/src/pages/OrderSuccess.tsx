import { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { orderApi } from '../services';
import type { OrderDetail } from '../services';
import { formatPrice } from '../utils';
import { QRImage } from '../utils/QRImage';
import { Copy, Check, ShoppingBag, Home, Ticket } from 'lucide-react';
import Loading from '../components/Loading';
import { Breadcrumb } from '../components/Breadcrumb';

type VoucherDisplay = {
  code: string;
  voucherId: number;
  voucherTitle: string;
  partnerName: string;
  imageUrl: string | null;
  validTo: string;
  status: 'Unused' | 'Used' | 'Expired' | 'Locked' | 'Cancelled';
};

function buildVouchers(order: OrderDetail): VoucherDisplay[] {
  const items = order.orderItems || [];
  return items.flatMap((item) =>
    (item.issuedVouchers || []).map((iv) => {
      const partner = item.voucher?.partner;
      const partnerName = typeof partner === 'string' ? partner : partner?.companyName || '';
      return {
        code: iv.voucherCode,
        voucherId: item.voucherId,
        voucherTitle: item.voucher?.title || 'Voucher',
        partnerName,
        imageUrl: item.voucher?.imageUrl || null,
        validTo: iv.validTo,
        status: iv.status as VoucherDisplay['status'],
      };
    })
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return d;
  }
}
function statusLabel(s: string) {
  return s === 'Unused' ? 'Có thể sử dụng' : s === 'Used' ? 'Đã sử dụng' : s === 'Expired' ? 'Đã hết hạn' : 'Đã khóa';
}
function statusColor(s: string) {
  return s === 'Unused' ? { bg: '#ECFDF5', text: '#10B981' }
    : s === 'Used' ? { bg: '#FEF3C7', text: '#F59E0B' }
    : { bg: '#FEE2E2', text: '#EF4444' };
}

// ── Copy button ───────────────────────────────────────────────────────────────

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const el = document.createElement('textarea');
      el.value = code;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '8px 16px',
        background: copied ? '#ECFDF5' : '#0E76A8',
        color: copied ? '#10B981' : 'white',
        border: 'none', borderRadius: 10,
        fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700,
        cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0,
      }}
    >
      {copied ? <><Check size={14} /> Đã copy</> : <><Copy size={14} /> Copy mã</>}
    </button>
  );
}

// ── Voucher Card ──────────────────────────────────────────────────────────────

function VoucherCard({ v }: { v: VoucherDisplay }) {
  const sc = statusColor(v.status);
  const isExpired = new Date(v.validTo) < new Date();

  return (
    <div style={{
      background: 'white',
      borderRadius: 16,
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(14,118,168,0.06)',
      border: '1px solid #F1F5F9',
    }}>
      <div style={{ padding: '20px 24px', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        {/* Thumbnail */}
        {v.imageUrl ? (
          <img src={v.imageUrl} alt={v.voucherTitle}
            style={{ width: 72, height: 72, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }} />
        ) : (
          <div style={{ width: 72, height: 72, borderRadius: 12, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Ticket size={28} style={{ color: '#94A3B8' }} />
          </div>
        )}

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 700, color: '#1E293B', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {v.voucherTitle}
          </h3>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#64748B', marginBottom: 8 }}>{v.partnerName}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: '#94A3B8' }}>
              Hạn: <span style={{ color: isExpired ? '#EF4444' : '#64748B', fontWeight: 600 }}>
                {isExpired ? 'Đã hết hạn' : `đến ${new Date(v.validTo).toLocaleDateString('vi-VN')}`}
              </span>
            </span>
            <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 6, background: sc.bg, color: sc.text }}>
              {statusLabel(v.status)}
            </span>
          </div>
        </div>

        {/* QR */}
        <div style={{ flexShrink: 0, textAlign: 'center' }}>
          <QRImage code={v.code} size={80} style={{ marginBottom: 4 }} />
          <span style={{ fontSize: 10, color: '#94A3B8' }}>Quét tại quán</span>
        </div>
      </div>

      {/* Code bar */}
      <div style={{ borderTop: '1px dashed #E2E8F0', padding: '14px 24px', background: '#FAFBFC', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 17, fontWeight: 800, color: '#1E293B', letterSpacing: 2 }}>
          {v.code}
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link
            to={`/voucher/${v.voucherId}`}
            style={{
              padding: '8px 16px', background: 'white', color: '#0E76A8',
              border: '1.5px solid #E2E8F0', borderRadius: 10,
              fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            Chi tiết
          </Link>
          <CopyButton code={v.code} />
        </div>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export function OrderSuccessPage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const queryOrderId = searchParams.get('orderId');
  const stateOrderId = (location.state as { orderId?: number } | null)?.orderId;
  const orderId = queryOrderId ?? (stateOrderId ? String(stateOrderId) : null);

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);

  const fetchOrder = useCallback(async () => {
    if (!orderId) {
      setError('Không tìm thấy mã đơn hàng.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await orderApi.getById(Number(orderId));
      if (res.success && res.data) {
        setOrder(res.data);
      } else {
        setError('Không tìm thấy đơn hàng này.');
      }
    } catch {
      setError('Đã xảy ra lỗi khi tải thông tin đơn hàng.');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  if (loading) {
    return <Loading size={48} />;
  }

  if (!order) {
    return (
      <div style={{ minHeight: '100vh', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ background: 'white', borderRadius: 20, padding: '48px 40px', maxWidth: 440, width: '100%', textAlign: 'center', boxShadow: '0 4px 24px rgba(14,118,168,0.08)' }}>
          <div style={{ width: 72, height: 72, background: '#FEE2E2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 22, fontWeight: 800, color: '#1E293B', marginBottom: 12 }}>Đã xảy ra lỗi</h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#64748B', marginBottom: 32 }}>Không thể tải thông tin đơn hàng.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button onClick={fetchOrder} style={{ padding: '14px', background: '#0E76A8', color: 'white', border: 'none', borderRadius: 12, fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>Thử lại</button>
            <Link to="/" style={{ display: 'block', padding: '14px', background: 'white', color: '#0E76A8', textDecoration: 'none', borderRadius: 12, fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 700, border: '1.5px solid #E2E8F0', textAlign: 'center' }}>Về trang chủ</Link>
          </div>
        </div>
      </div>
    );
  }

  const vouchers = buildVouchers(order);
  const expiryDays = order.orderItems?.[0]?.voucher?.expiryDays ?? 30;

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh' }}>
      <Breadcrumb
        showBack={false}
        items={[
          { label: 'Trang chủ', href: '/' },
          { label: 'Giỏ hàng', href: '/cart' },
          { label: 'Đặt hàng thành công' },
        ]}
        maxWidth={900}
      />

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>

        {/* ── Success Header ── */}
        <div style={{ background: 'white', borderRadius: 20, padding: '40px 32px', textAlign: 'center', marginBottom: 24, boxShadow: '0 2px 8px rgba(14,118,168,0.06)' }}>
          {/* Animated check */}
          <div style={{ position: 'relative', width: 88, height: 88, margin: '0 auto 24px' }}>
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              background: 'linear-gradient(135deg, #10B981, #059669)',
              animation: 'pulse-ring 0.6s ease-out',
            }} />
            <div style={{
              position: 'absolute', inset: 6, borderRadius: '50%', background: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </div>

          <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 26, fontWeight: 800, color: '#1E293B', marginBottom: 8 }}>
            Đặt hàng thành công!
          </h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, color: '#64748B', marginBottom: 20 }}>
            Cảm ơn bạn đã mua voucher tại Everest. Mã voucher đã được phát hành bên dưới.
          </p>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#F0F9FF', border: '1.5px solid #BAE6FD', borderRadius: 10, padding: '8px 16px', marginBottom: 4 }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#64748B' }}>Mã đơn hàng:</span>
            <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 800, color: '#0E76A8' }}>#{order.orderId}</span>
          </div>

          {/* Order info */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 16, flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 4 }}>Ngày đặt</div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: '#1E293B' }}>{formatDate(order.createdAt)}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 4 }}>Tổng tiền</div>
              <div style={{ fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 800, color: '#0E76A8' }}>{formatPrice(Number(order.totalAmount))}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 4 }}>Phương thức</div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: '#1E293B' }}>{order.paymentMethod || '—'}</div>
            </div>
          </div>
        </div>

        {/* ── Voucher Codes ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 18, fontWeight: 800, color: '#1E293B', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Ticket size={20} style={{ color: '#0E76A8' }} />
            Mã Voucher của bạn
            <span style={{ fontSize: 13, fontWeight: 400, color: '#94A3B8' }}>({vouchers.length} voucher)</span>
          </h2>

          {vouchers.map((v, idx) => (
            <VoucherCard key={idx} v={v} />
          ))}
        </div>

        {/* ── Note ── */}
        <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: 12, padding: '14px 18px', marginBottom: 24, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <svg width="18" height="18" style={{ color: '#0E76A8', flexShrink: 0, marginTop: 1 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#0369A1', lineHeight: 1.5, margin: 0 }}>
            Voucher đã được phát hành ngay sau khi thanh toán thành công. Mã có hiệu lực trong <strong>{expiryDays} ngày</strong> kể từ hôm nay.
            Hãy đến chi nhánh của đối tác và xuất trình mã QR hoặc mã số này để sử dụng voucher.
          </p>
        </div>

        {/* ── Actions ── */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link to="/my-voucher" style={{
            display: 'flex', alignItems: 'center', gap: 8, flex: 1, padding: '14px 20px',
            background: '#0E76A8', color: 'white', textDecoration: 'none', borderRadius: 14,
            fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 700,
            justifyContent: 'center', transition: 'background 0.2s',
          }}
            onMouseEnter={e => (e.currentTarget.style.background = '#0A5C87')}
            onMouseLeave={e => (e.currentTarget.style.background = '#0E76A8')}
          >
            <ShoppingBag size={18} />
            Xem voucher của tôi
          </Link>
          <Link to="/" style={{
            display: 'flex', alignItems: 'center', gap: 8, flex: 1, padding: '14px 20px',
            background: 'white', color: '#0E76A8', textDecoration: 'none', borderRadius: 14,
            fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 700,
            border: '1.5px solid #E2E8F0', justifyContent: 'center',
            transition: 'border-color 0.2s',
          }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = '#0E76A8')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = '#E2E8F0')}
          >
            <Home size={18} />
            Về trang chủ
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 0; }
          60% { transform: scale(1.1); opacity: 0.3; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
