import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { orderApi } from '../services';
import type { OrderSummary } from '../services';
import { formatPrice, formatDate, PAYMENT_STATUS_LABELS } from '../utils';
import { Loader2, Package, X, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';

type StatusTab = 'All' | 'Pending' | 'Paid' | 'Cancelled';

/** Map ngược từ PAYMENT_STATUS_LABELS (dùng color/bg). */
const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  Pending:   { label: PAYMENT_STATUS_LABELS.Pending.label,   bg: PAYMENT_STATUS_LABELS.Pending.bg,   text: PAYMENT_STATUS_LABELS.Pending.color },
  Paid:      { label: PAYMENT_STATUS_LABELS.Paid.label,      bg: PAYMENT_STATUS_LABELS.Paid.bg,      text: PAYMENT_STATUS_LABELS.Paid.color },
  Cancelled: { label: PAYMENT_STATUS_LABELS.Cancelled.label, bg: PAYMENT_STATUS_LABELS.Cancelled.bg, text: PAYMENT_STATUS_LABELS.Cancelled.color },
};

interface OrderRowProps {
  order: OrderSummary;
  onCancel: (id: number) => void;
  cancelling: boolean;
  cancellingId: number | null;
}

function OrderRow({ order, onCancel, cancelling, cancellingId }: OrderRowProps) {
  const cfg = STATUS_CONFIG[order.paymentStatus] ?? { label: order.paymentStatus, bg: '#F1F5F9', text: '#64748B' };

  return (
    <div style={{
      background: 'white',
      borderRadius: 14,
      padding: '20px 24px',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      boxShadow: '0 1px 4px rgba(14,118,168,0.05)',
      border: '1px solid #F1F5F9',
      marginBottom: 12,
    }}>
      {/* Icon */}
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: '#EFF6FF',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Package size={22} style={{ color: '#0E76A8' }} />
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
          <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 800, color: '#1E293B' }}>
            #{order.orderId}
          </span>
          <span style={{
            fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 6,
            background: cfg.bg, color: cfg.text,
          }}>
            {cfg.label}
          </span>
        </div>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#94A3B8', margin: 0 }}>
          {formatDate(order.createdAt)} · {order.itemCount} voucher{order.itemCount > 1 ? 's' : ''}
        </p>
      </div>

      {/* Amount */}
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 800, color: '#0E76A8' }}>
          {formatPrice(Number(order.totalAmount))}
        </div>
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#94A3B8' }}>
          {order.paymentMethod || '—'}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        {order.paymentStatus === 'Pending' && (
          <button
            onClick={() => onCancel(order.orderId)}
            disabled={cancelling}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px',
              background: cancelling && cancellingId === order.orderId ? '#FCA5A5' : '#FEE2E2',
              color: '#991B1B',
              border: 'none', borderRadius: 8,
              fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600,
              cursor: cancelling ? 'not-allowed' : 'pointer',
              opacity: cancelling && cancellingId !== order.orderId ? 0.6 : 1,
              transition: 'all 0.15s',
            }}
          >
            {cancelling && cancellingId === order.orderId
              ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />
              : <X size={12} />}
            Hủy
          </button>
        )}
        <Link
          to={`/checkout/success?orderId=${order.orderId}`}
          style={{
            padding: '8px 14px',
            background: '#0E76A8',
            color: 'white',
            borderRadius: 8,
            fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600,
            textDecoration: 'none',
            display: 'flex', alignItems: 'center',
          }}
        >
          Xem
        </Link>
      </div>
    </div>
  );
}

export function OrdersPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<StatusTab>('All');
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const fetchOrders = useCallback(async (page = 1) => {
    const token = localStorage.getItem('access_token');
    if (!token) { navigate('/login'); return; }

    try {
      setLoading(true);
      setError(null);
      const res = await orderApi.listMine({ page, pageSize: pagination.pageSize });
      if (res.success && res.data) {
        setOrders(res.data);
        if (res.pagination) setPagination(res.pagination);
      } else {
        setError('Không thể tải danh sách đơn hàng.');
      }
    } catch {
      setError('Đã xảy ra lỗi khi tải đơn hàng.');
    } finally {
      setLoading(false);
    }
  }, [navigate, pagination.pageSize]);

  useEffect(() => { fetchOrders(1); }, [fetchOrders]);

  const handleCancel = async (orderId: number) => {
    if (!confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;
    try {
      setCancelling(true);
      setCancellingId(orderId);
      const res = await orderApi.cancel(orderId);
      if (res.success) {
        setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, paymentStatus: 'Cancelled' as const } : o));
      } else {
        alert(res.error?.message || 'Không thể hủy đơn hàng.');
      }
    } catch {
      alert('Đã xảy ra lỗi khi hủy đơn hàng.');
    } finally {
      setCancelling(false);
      setCancellingId(null);
    }
  };

  const filtered = tab === 'All' ? orders : orders.filter(o => o.paymentStatus === tab);

  const tabs: StatusTab[] = ['All', 'Pending', 'Paid', 'Cancelled'];

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh' }}>
      {/* Breadcrumb */}
      <div style={{ background: 'white', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '12px 24px' }}>
          <span style={{ fontSize: 13, color: '#64748B' }}>
            <Link to="/" style={{ color: '#0E76A8', textDecoration: 'none' }}>Trang chủ</Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <span style={{ color: '#1E293B', fontWeight: 600 }}>Đơn hàng của tôi</span>
          </span>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 24, fontWeight: 800, color: '#1E293B', marginBottom: 4 }}>
            Đơn hàng của tôi
          </h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#94A3B8', margin: 0 }}>
            Theo dõi và quản lý các đơn hàng của bạn
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: '#F1F5F9', borderRadius: 12, padding: 4, width: 'fit-content' }}>
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: '8px 18px',
                borderRadius: 8,
                border: 'none',
                fontFamily: 'Inter, sans-serif',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                background: tab === t ? 'white' : 'transparent',
                color: tab === t ? '#0E76A8' : '#64748B',
                boxShadow: tab === t ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              {t === 'All' ? 'Tất cả' : t === 'Pending' ? 'Chờ thanh toán' : t === 'Paid' ? 'Đã thanh toán' : 'Đã hủy'}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: '#0E76A8', margin: '0 auto' }} />
            <p style={{ marginTop: 16, color: '#64748B', fontFamily: 'Inter, sans-serif', fontSize: 14 }}>Đang tải đơn hàng...</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: 16, border: '1px solid #FEE2E2' }}>
            <AlertTriangle size={36} style={{ color: '#EF4444', margin: '0 auto 12px' }} />
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#DC2626' }}>{error}</p>
            <button onClick={() => fetchOrders()} style={{
              marginTop: 12, padding: '8px 20px', background: '#0E76A8', color: 'white',
              border: 'none', borderRadius: 8, fontFamily: 'Inter, sans-serif', fontSize: 13,
              fontWeight: 600, cursor: 'pointer',
            }}>Thử lại</button>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', background: 'white', borderRadius: 16 }}>
            <Package size={48} style={{ color: '#CBD5E1', margin: '0 auto 16px' }} />
            <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 700, color: '#64748B', marginBottom: 8 }}>
              {tab === 'All' ? 'Bạn chưa có đơn hàng nào' : `Không có đơn hàng nào (${tab === 'Pending' ? 'Chờ thanh toán' : tab === 'Paid' ? 'Đã thanh toán' : 'Đã hủy'})`}
            </p>
            <Link to="/vouchers" style={{
              display: 'inline-block', marginTop: 8, padding: '10px 24px',
              background: '#0E76A8', color: 'white', textDecoration: 'none', borderRadius: 10,
              fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600,
            }}>Khám phá voucher</Link>
          </div>
        ) : (
          <>
            {filtered.map(order => (
              <OrderRow
                key={order.orderId}
                order={order}
                onCancel={handleCancel}
                cancelling={cancelling}
                cancellingId={cancellingId}
              />
            ))}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 24 }}>
                <button
                  onClick={() => fetchOrders(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    padding: '8px 16px', background: 'white',
                    border: '1px solid #E2E8F0', borderRadius: 8,
                    fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600,
                    color: pagination.page <= 1 ? '#CBD5E1' : '#0E76A8',
                    cursor: pagination.page <= 1 ? 'not-allowed' : 'pointer',
                  }}
                >
                  <ChevronLeft size={14} /> Trước
                </button>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#64748B' }}>
                  Trang {pagination.page} / {pagination.totalPages}
                </span>
                <button
                  onClick={() => fetchOrders(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    padding: '8px 16px', background: 'white',
                    border: '1px solid #E2E8F0', borderRadius: 8,
                    fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600,
                    color: pagination.page >= pagination.totalPages ? '#CBD5E1' : '#0E76A8',
                    cursor: pagination.page >= pagination.totalPages ? 'not-allowed' : 'pointer',
                  }}
                >
                  Sau <ChevronRight size={14} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
