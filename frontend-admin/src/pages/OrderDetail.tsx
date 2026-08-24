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
      showToast('Đã ghi nhận hoàn tiền mô phỏng', 'success');
    } catch (error) { showToast(error instanceof Error ? error.message : 'Không thể hoàn tiền', 'error'); }
    finally { setSaving(false); }
  };

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center' }}>Đang tải đơn hàng...</div>;
  if (!order) return <div style={{ padding: '1.5rem' }}><button className="admin-btn admin-btn-ghost" onClick={() => navigate('/orders')}>Quay lại</button></div>;
  const cancelled = Boolean(order.cancelledAt) || order.paymentStatus === 'Cancelled';
  const refunded = Boolean(order.refundedAt);
  const canCancel = !cancelled && !refunded && (order.paymentStatus === 'Pending' || order.paymentStatus === 'Paid');
  const canMarkPaid = !cancelled && !refunded && order.paymentStatus === 'Pending';
  const canRefund = cancelled && !refunded && order.paymentStatus === 'Paid' && order.cancelledBy !== null && order.cancelledBy !== order.customerId;

  return (
    <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <button className="admin-btn admin-btn-ghost" onClick={() => navigate('/orders')}><span className="material-symbols-outlined">arrow_back</span>Đơn hàng</button>
        <div style={{ flex: 1 }}><h1 className="font-headline-lg" style={{ margin: 0 }}>Chi tiết đơn #{order.orderId}</h1><p className="font-label-sm">Tạo lúc {date(order.createdAt)}</p></div>
        {refunded ? <span className="badge badge-info">Đã hoàn tiền</span> : cancelled ? <span className="badge badge-locked">Đã hủy</span> : <span className="badge badge-active">{order.paymentStatus === 'Paid' ? 'Đã thanh toán' : 'Chờ thanh toán'}</span>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 20rem', gap: '1.5rem', alignItems: 'start' }}>
        <section className="admin-card" style={{ padding: '1.5rem' }}>
          <h3 className="font-title-md">Khách hàng</h3>
          <p>{order.customer?.fullName ?? '—'} · {order.customer?.email ?? order.receiverEmail ?? '—'}</p>
          <h3 className="font-title-md" style={{ marginTop: '1.5rem' }}>Sản phẩm</h3>
          {(order.orderItems ?? []).map((item) => <div key={item.orderItemId} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--color-outline-variant)' }}><span>{item.voucher?.title ?? `Voucher #${item.voucherId}`} × {item.quantity}</span><strong>{money(Number(item.price) * item.quantity)}</strong></div>)}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontWeight: 700 }}><span>Tổng cộng</span><span>{money(order.totalAmount)}</span></div>
        </section>

        <aside className="admin-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 className="font-title-md">Thao tác</h3>
          {canMarkPaid && (
            <section>
              <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: '0.5rem' }}>Thanh toán</p>
              <button className="admin-btn admin-btn-primary" style={{ width: '100%' }} onClick={markPaid} disabled={saving}>Ghi nhận đã thanh toán</button>
            </section>
          )}
          {canCancel && (
            <section style={{ paddingTop: '1rem', borderTop: '1px solid var(--color-outline-variant)' }}>
              <p className="font-label-sm" style={{ color: 'var(--color-error, #b91c1c)', marginBottom: '0.5rem' }}>Hủy đơn</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '0.75rem', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '0.5rem', background: 'rgba(239, 68, 68, 0.04)' }}>
                <textarea className="admin-input" placeholder="Lý do hủy đơn" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} />
                <button className="admin-btn admin-btn-danger" onClick={cancel} disabled={saving || !cancelReason.trim()}>Hủy đơn hàng</button>
              </div>
            </section>
          )}
          {canRefund && <><textarea className="admin-input" placeholder="Lý do hoàn tiền mô phỏng" value={refundReason} onChange={(e) => setRefundReason(e.target.value)} /><button className="admin-btn admin-btn-primary" onClick={refund} disabled={saving || !refundReason.trim()}>Hoàn tiền mô phỏng ({money(order.totalAmount)})</button></>}
          {refunded && <p className="font-label-sm">Đã hoàn {money(order.refundAmount ?? 0)} lúc {date(order.refundedAt)}</p>}
        </aside>
      </div>
    </div>
  );
}
