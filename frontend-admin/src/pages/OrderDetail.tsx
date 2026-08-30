import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../components/shared/Toast';
import { adminOrdersApi } from '../services/admin.service';
import type { OrderResponse } from '../services/admin.service';

const money = (value: string | number) => `${new Intl.NumberFormat('vi-VN').format(Number(value))} đ`;
const date = (value: string | null) => value ? new Date(value).toLocaleString('vi-VN') : '—';

export default function OrderDetail() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [refundReason, setRefundReason] = useState('');

  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 640;
  const isTablet = windowWidth >= 640 && windowWidth < 1024;

  useEffect(() => {
    if (!orderId) return;
    adminOrdersApi.getById(Number(orderId)).then(setOrder).catch((error: unknown) => {
      showToast(error instanceof Error ? error.message : 'Không thể tải đơn hàng', 'error');
    }).finally(() => setLoading(false));
  }, [orderId, showToast]);

  const markPaid = async () => {
    if (!order) return;
    setSaving(true);
    try {
      const updated = await adminOrdersApi.markPaid(order.orderId);
      setOrder({ ...order, paymentStatus: updated.paymentStatus, updatedAt: updated.updatedAt });
      showToast('Đã ghi nhận thanh toán', 'success');
    } catch (error) { showToast(error instanceof Error ? error.message : 'Không thể ghi nhận thanh toán', 'error'); }
    finally { setSaving(false); }
  };

  const cancel = async () => {
    if (!order || !cancelReason.trim()) return;
    setSaving(true);
    try {
      const updated = await adminOrdersApi.cancel(order.orderId, { reason: cancelReason.trim() });
      setOrder({ ...order, paymentStatus: updated.paymentStatus, cancelledAt: updated.cancelledAt, cancelledBy: updated.cancelledBy, cancelReason: updated.cancelReason, updatedAt: updated.updatedAt });
      setCancelReason('');
      showToast('Đã hủy đơn hàng', 'success');
    } catch (error) { showToast(error instanceof Error ? error.message : 'Không thể hủy đơn', 'error'); }
    finally { setSaving(false); }
  };

  const refund = async () => {
    if (!order || !refundReason.trim()) return;
    setSaving(true);
    try {
      const updated = await adminOrdersApi.refund(order.orderId, { reason: refundReason.trim() });
      setOrder({ ...order, refundedAt: updated.refundedAt, refundAmount: updated.refundAmount, refundReason: updated.refundReason, updatedAt: updated.updatedAt });
      setRefundReason('');
      showToast('Đã ghi nhận hoàn tiền mô phỏng', 'success');
    } catch (error) { showToast(error instanceof Error ? error.message : 'Không thể hoàn tiền', 'error'); }
    finally { setSaving(false); }
  };

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-on-surface-variant)' }}>Đang tải đơn hàng...</div>;
  if (!order) return (
    <div style={{ padding: '1.5rem' }}>
      <button className="admin-btn admin-btn-ghost" onClick={() => navigate('/orders')}>
        <span className="material-symbols-outlined">arrow_back</span>Quay lại
      </button>
    </div>
  );
  console.log(order);
  const cancelled = Boolean(order.cancelledAt);
  const refunded = Boolean(order.refundedAt);
  const canCancel = !cancelled && !refunded && (order.paymentStatus === 'Pending' || order.paymentStatus === 'Paid');
  const canMarkPaid = !cancelled && !refunded && order.paymentStatus === 'Pending';
  const canRefund = cancelled && !refunded && order.paymentStatus === 'Paid' && order.cancelledBy !== null && order.cancelledBy !== order.customerId;
  console.log(order.paymentStatus === 'Paid');

  const StatusBadge = () => {
    if (refunded) return <span className="badge badge-info">Đã hoàn tiền</span>;
    if (cancelled) return <span className="badge badge-locked">Đã hủy</span>;
    return <span className="badge badge-active">{order.paymentStatus === 'Paid' ? 'Đã thanh toán' : 'Chờ thanh toán'}</span>;
  };

  return (
    <div style={{ maxWidth: isMobile ? '100%' : '72rem', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button className="admin-btn admin-btn-ghost" onClick={() => navigate('/orders')} style={{ padding: '0.375rem 0.5rem' }}>
          <span className="material-symbols-outlined" style={{ fontSize: isMobile ? '18px' : '20px' }}>arrow_back</span>
          {!isMobile && 'Đơn hàng'}
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: isMobile ? '1rem' : '1.25rem', fontWeight: 600 }}>Đơn #{order.orderId}</h1>
          <p style={{ color: 'var(--color-on-surface-variant)', fontSize: isMobile ? '0.65rem' : '0.75rem', margin: '0.125rem 0 0' }}>Tạo {date(order.createdAt)}</p>
        </div>
        <StatusBadge />
      </div>

      {/* Mobile: stacked layout */}
      {isMobile ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Customer */}
          <div className="admin-card" style={{ padding: '0.875rem' }}>
            <h2 style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-on-surface-variant)' }}>Khách hàng</h2>
            <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{order.customer?.fullName ?? '—'}</p>
            <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.75rem' }}>{order.customer?.email ?? order.receiverEmail ?? '—'}</p>
          </div>

          {/* Items */}
          <div className="admin-card" style={{ padding: '0.875rem' }}>
            <h2 style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-on-surface-variant)' }}>Sản phẩm</h2>
            {(order.orderItems ?? []).map((item) => (
              <div key={item.orderItemId} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--color-outline-variant)' }}>
                <div>
                  <p style={{ fontSize: '0.8rem' }}>{item.voucher?.title ?? `Voucher #${item.voucherId}`}</p>
                  <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.7rem' }}>× {item.quantity}</p>
                </div>
                <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>{money(Number(item.price) * item.quantity)}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.75rem', fontWeight: 700 }}>
              <span>Tổng cộng</span>
              <span>{money(order.totalAmount)}</span>
            </div>
          </div>

          {/* Actions */}
          {(canMarkPaid || canCancel || canRefund || refunded) && (
            <div className="admin-card" style={{ padding: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <h2 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-on-surface-variant)' }}>Thao tác</h2>
              {canMarkPaid && (
                <button className="admin-btn admin-btn-primary" onClick={markPaid} disabled={saving}>{isMobile ? 'Thanh toán' : 'Ghi nhận thanh toán'}</button>
              )}
              {canCancel && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.75rem', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '0.5rem', background: 'rgba(239, 68, 68, 0.04)' }}>
                  <p style={{ color: 'var(--color-error)', fontSize: '0.75rem', fontWeight: 600 }}>Hủy đơn</p>
                  <textarea className="admin-input" placeholder="Lý do hủy đơn..." value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} rows={2} />
                  <button className="admin-btn admin-btn-danger" onClick={cancel} disabled={saving || !cancelReason.trim()}>Hủy đơn hàng</button>
                </div>
              )}
              {canRefund && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-on-surface-variant)' }}>Hoàn tiền tự động: <strong>{money(order.totalAmount)}</strong></p>
                  <textarea className="admin-input" placeholder="Lý do hoàn tiền..." value={refundReason} onChange={(e) => setRefundReason(e.target.value)} rows={2} />
                  <button className="admin-btn admin-btn-primary" onClick={refund} disabled={saving || !refundReason.trim()}>Hoàn tiền</button>
                </div>
              )}
              {refunded && (
                <p style={{ fontSize: '0.875rem', color: 'var(--color-on-surface-variant)' }}>
                  Đã hoàn {money(order.refundAmount ?? 0)} lúc {date(order.refundedAt)}
                </p>
              )}
            </div>
          )}
        </div>
      ) : isTablet ? (
        /* Tablet: stacked with sidebar */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="admin-card" style={{ padding: '1.25rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>Khách hàng</h2>
            <p style={{ fontWeight: 600 }}>{order.customer?.fullName ?? '—'}</p>
            <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.875rem' }}>{order.customer?.email ?? order.receiverEmail ?? '—'}</p>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, marginTop: '1.25rem', marginBottom: '0.75rem' }}>Sản phẩm</h2>
            {(order.orderItems ?? []).map((item) => (
              <div key={item.orderItemId} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.625rem 0', borderBottom: '1px solid var(--color-outline-variant)' }}>
                <span style={{ fontSize: '0.875rem' }}>
                  {item.voucher?.title ?? `Voucher #${item.voucherId}`} × {item.quantity}
                </span>
                <strong style={{ fontSize: '0.875rem' }}>{money(Number(item.price) * item.quantity)}</strong>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1rem', fontWeight: 700 }}>
              <span>Tổng cộng</span>
              <span>{money(order.totalAmount)}</span>
            </div>
          </div>

          <div className="admin-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>Thao tác</h2>
            {canMarkPaid && (
              <button className="admin-btn admin-btn-primary" style={{ width: '100%' }} onClick={markPaid} disabled={saving}>Ghi nhận đã thanh toán</button>
            )}
            {canCancel && (
              <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--color-outline-variant)' }}>
                <p style={{ color: 'var(--color-error)', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem' }}>Hủy đơn</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '0.75rem', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '0.5rem', background: 'rgba(239, 68, 68, 0.04)' }}>
                  <textarea className="admin-input" placeholder="Lý do hủy đơn" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} rows={2} />
                  <button className="admin-btn admin-btn-danger" onClick={cancel} disabled={saving || !cancelReason.trim()}>Hủy đơn hàng</button>
                </div>
              </div>
            )}
            {canRefund && (
              <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--color-outline-variant)' }}>
                <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.75rem', marginBottom: '0.5rem' }}>Hoàn tiền: <strong>{money(order.totalAmount)}</strong></p>
                <textarea className="admin-input" placeholder="Lý do hoàn tiền..." value={refundReason} onChange={(e) => setRefundReason(e.target.value)} rows={2} />
                <button className="admin-btn admin-btn-primary" style={{ marginTop: '0.5rem', width: '100%' }} onClick={refund} disabled={saving || !refundReason.trim()}>Hoàn tiền mô phỏng</button>
              </div>
            )}
            {refunded && (
              <p style={{ fontSize: '0.875rem', color: 'var(--color-on-surface-variant)' }}>
                Đã hoàn {money(order.refundAmount ?? 0)} lúc {date(order.refundedAt)}
              </p>
            )}
          </div>
        </div>
      ) : (
        /* Desktop: 2-column grid */
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 22rem', gap: '1.5rem', alignItems: 'start' }}>
          <section className="admin-card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>Khách hàng</h2>
            <p style={{ fontWeight: 600 }}>{order.customer?.fullName ?? '—'}</p>
            <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.875rem' }}>{order.customer?.email ?? order.receiverEmail ?? '—'}</p>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, marginTop: '1.5rem', marginBottom: '0.75rem' }}>Sản phẩm</h2>
            {(order.orderItems ?? []).map((item) => (
              <div key={item.orderItemId} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--color-outline-variant)' }}>
                <span style={{ fontSize: '0.875rem' }}>
                  {item.voucher?.title ?? `Voucher #${item.voucherId}`} × {item.quantity}
                </span>
                <strong style={{ fontSize: '0.875rem' }}>{money(Number(item.price) * item.quantity)}</strong>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1rem', fontWeight: 700 }}>
              <span>Tổng cộng</span>
              <span>{money(order.totalAmount)}</span>
            </div>
          </section>

          <aside className="admin-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>Thao tác</h2>
            {canMarkPaid && (
              <div>
                <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.75rem', marginBottom: '0.5rem' }}>Thanh toán</p>
                <button className="admin-btn admin-btn-primary" style={{ width: '100%' }} onClick={markPaid} disabled={saving}>Ghi nhận đã thanh toán</button>
              </div>
            )}
            {canCancel && (
              <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--color-outline-variant)' }}>
                <p style={{ color: 'var(--color-error)', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem' }}>Hủy đơn</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '0.75rem', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '0.5rem', background: 'rgba(239, 68, 68, 0.04)' }}>
                  <textarea className="admin-input" placeholder="Lý do hủy đơn" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} rows={2} />
                  <button className="admin-btn admin-btn-danger" onClick={cancel} disabled={saving || !cancelReason.trim()}>Hủy đơn hàng</button>
                </div>
              </div>
            )}
            {canRefund && (
              <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--color-outline-variant)' }}>
                <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.75rem', marginBottom: '0.5rem' }}>Hoàn tiền: <strong>{money(order.totalAmount)}</strong></p>
                <textarea className="admin-input" placeholder="Lý do hoàn tiền..." value={refundReason} onChange={(e) => setRefundReason(e.target.value)} rows={2} />
                <button className="admin-btn admin-btn-primary" style={{ marginTop: '0.5rem', width: '100%' }} onClick={refund} disabled={saving || !refundReason.trim()}>Hoàn tiền mô phỏng</button>
              </div>
            )}
            {refunded && (
              <p style={{ fontSize: '0.875rem', color: 'var(--color-on-surface-variant)' }}>
                Đã hoàn {money(order.refundAmount ?? 0)} lúc {date(order.refundedAt)}
              </p>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
