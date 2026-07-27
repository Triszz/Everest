import { useState, useEffect } from 'react';
import { useToast } from '../components/shared/Toast';
import { useOrderManagement } from '../hooks/useOrderManagement';
import { adminOrdersApi } from '../services/admin.service';
import type { OrderResponse, OrderPaymentStatus } from '../services/admin.service';

const paymentStatusConfig: Record<OrderPaymentStatus, { label: string; cls: string }> = {
  Pending: { label: 'Chờ thanh toán', cls: 'badge-pending' },
  Paid: { label: 'Đã thanh toán', cls: 'badge-active' },
  Cancelled: { label: 'Đã hủy', cls: 'badge-locked' },
};

const fmtVnd = (n: string | number) => {
  const num = typeof n === 'string' ? Number(n) : n;
  return new Intl.NumberFormat('vi-VN').format(num) + ' đ';
};

const formatDate = (iso: string | null): string => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function Orders() {
  const { showToast } = useToast();
  const {
    orders,
    isLoading,
    isSaving,
    error,
    fetchOrders,
    cancelOrder,
    refundOrder,
  } = useOrderManagement();

  const [search, setSearch] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<'all' | OrderPaymentStatus>('all');
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [targetOrder, setTargetOrder] = useState<OrderResponse | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleSearch = () => {
    fetchOrders(1);
  };

  const openRefund = (order: OrderResponse) => {
    setTargetOrder(order);
    setRefundAmount(order.totalAmount);
    setRefundReason('');
    setShowRefundModal(true);
  };

  const openCancel = (order: OrderResponse) => {
    setTargetOrder(order);
    setCancelReason('');
    setShowCancelModal(true);
  };

  const handleCancel = async () => {
    if (!targetOrder || !cancelReason.trim()) return;
    try {
      await cancelOrder(targetOrder.orderId, { reason: cancelReason.trim() });
      showToast(`Đã hủy đơn #${targetOrder.orderId}`, 'success');
      setShowCancelModal(false);
      setTargetOrder(null);
      setCancelReason('');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Lỗi khi hủy đơn', 'error');
    }
  };

  const handleRefund = async () => {
    if (!targetOrder || !refundReason.trim()) {
      showToast('Vui lòng nhập lý do hoàn tiền', 'error');
      return;
    }
    const amount = Number(refundAmount);
    if (!amount || amount <= 0) {
      showToast('Số tiền hoàn phải lớn hơn 0', 'error');
      return;
    }
    try {
      await refundOrder(targetOrder.orderId, {
        reason: refundReason.trim(),
        amount,
      });
      showToast(
        `Đã ghi nhận hoàn tiền (giả lập) ${fmtVnd(amount)} cho đơn #${targetOrder.orderId}`,
        'success',
      );
      setShowRefundModal(false);
      setTargetOrder(null);
      setRefundAmount('');
      setRefundReason('');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Lỗi khi hoàn tiền', 'error');
    }
  };

  const openDetail = async (order: OrderResponse) => {
    try {
      const detail = await adminOrdersApi.getById(order.orderId);
      setSelectedOrder(detail);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Không thể tải chi tiết', 'error');
    }
  };

  const totalRevenue = orders
    .filter((o) => o.paymentStatus === 'Paid' && !o.refundedAt)
    .reduce((sum, o) => sum + Number(o.totalAmount), 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.paymentStatus === 'Pending').length;
  const cancelledOrders = orders.filter((o) => o.paymentStatus === 'Cancelled').length;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="font-headline-lg" style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Quản lý đơn hàng</h1>
          <p className="font-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
            Tra cứu, giám sát và xử lý đơn hàng trên hệ thống.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="admin-card" style={{ padding: '1.25rem' }}>
          <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: '0.5rem' }}>Tổng đơn</p>
          <p className="font-headline-md" style={{ fontSize: '1.75rem', fontWeight: 700 }}>{totalOrders}</p>
        </div>
        <div className="admin-card" style={{ padding: '1.25rem' }}>
          <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: '0.5rem' }}>Chờ thanh toán</p>
          <p className="font-headline-md" style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-tertiary, #f59e0b)' }}>{pendingOrders}</p>
        </div>
        <div className="admin-card" style={{ padding: '1.25rem' }}>
          <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: '0.5rem' }}>Đã hủy</p>
          <p className="font-headline-md" style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-error, #b91c1c)' }}>{cancelledOrders}</p>
        </div>
        <div className="admin-card" style={{ padding: '1.25rem' }}>
          <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: '0.5rem' }}>Doanh thu (chưa hoàn)</p>
          <p className="font-headline-md" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary)' }}>{fmtVnd(totalRevenue)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <span className="material-symbols-outlined" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-on-surface-variant)', fontSize: '20px' }}>search</span>
            <input
              className="admin-input"
              style={{ paddingLeft: '2.5rem', width: '100%' }}
              placeholder="Tìm theo mã đơn, tên, email khách..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
            />
          </div>
          <select
            className="admin-input"
            style={{ width: 'auto', minWidth: '180px' }}
            value={paymentStatusFilter}
            onChange={(e) => {
              setPaymentStatusFilter(e.target.value as 'all' | OrderPaymentStatus);
            }}
          >
            <option value="all">Tất cả thanh toán</option>
            <option value="Pending">Chờ thanh toán</option>
            <option value="Paid">Đã thanh toán</option>
            <option value="Cancelled">Đã hủy</option>
          </select>
          <button className="admin-btn admin-btn-primary" onClick={handleSearch}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>filter_list</span>
            Lọc
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="admin-card" style={{ overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-on-surface-variant)' }}>Đang tải...</div>
        ) : error ? (
          <div style={{ padding: '1.5rem', color: 'var(--color-error)' }}>{error}</div>
        ) : orders.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-on-surface-variant)' }}>Chưa có đơn hàng nào.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Voucher</th>
                <th>Số tiền</th>
                <th>Thanh toán</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.orderId}>
                  <td>
                    <span className="font-body-sm" style={{ fontWeight: 600 }}>#{order.orderId}</span>
                    {order.isGift && (
                      <span className="badge badge-info" style={{ marginLeft: '0.5rem' }}>Quà tặng</span>
                    )}
                  </td>
                  <td>
                    <div className="font-body-sm" style={{ fontWeight: 600 }}>{order.customer?.fullName ?? '—'}</div>
                    <div className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>{order.customer?.email ?? order.receiverEmail ?? '—'}</div>
                  </td>
                  <td>
                    <div className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
                      {order.orderItems?.length ?? 0} sản phẩm
                    </div>
                  </td>
                  <td>
                    <span className="font-body-sm" style={{ fontWeight: 600 }}>{fmtVnd(order.totalAmount)}</span>
                    {order.refundedAt && (
                      <div className="font-label-sm" style={{ color: 'var(--color-error, #b91c1c)' }}>
                        - Hoàn: {fmtVnd(order.refundAmount ?? 0)}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${paymentStatusConfig[order.paymentStatus].cls}`}>
                      {paymentStatusConfig[order.paymentStatus].label}
                    </span>
                  </td>
                  <td>
                    {order.refundedAt ? (
                      <span className="badge badge-locked">Đã hoàn tiền</span>
                    ) : order.cancelledAt ? (
                      <span className="badge badge-locked">Đã hủy</span>
                    ) : order.paymentStatus === 'Paid' ? (
                      <span className="badge badge-active">Hoạt động</span>
                    ) : (
                      <span className="badge badge-pending">Chờ</span>
                    )}
                  </td>
                  <td>
                    <span className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>{formatDate(order.createdAt)}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'flex-end' }}>
                      <button
                        className="admin-btn admin-btn-ghost"
                        style={{ padding: '0.25rem', fontSize: '0.7rem' }}
                        onClick={() => openDetail(order)}
                        title="Xem chi tiết"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>visibility</span>
                      </button>
                      {order.paymentStatus === 'Paid' && !order.refundedAt && (
                        <>
                          <button
                            className="admin-btn admin-btn-ghost"
                            style={{ padding: '0.25rem', fontSize: '0.7rem', color: '#F59E0B' }}
                            onClick={() => openRefund(order)}
                            title="Hoàn tiền"
                            disabled={isSaving}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>attach_money</span>
                          </button>
                          <button
                            className="admin-btn admin-btn-danger"
                            style={{ padding: '0.25rem', fontSize: '0.7rem' }}
                            onClick={() => openCancel(order)}
                            title="Hủy đơn"
                            disabled={isSaving}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>cancel</span>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Order Detail Panel */}
      {selectedOrder && (
        <>
          <div className="side-panel-overlay" onClick={() => setSelectedOrder(null)} />
          <div className="side-panel" style={{ width: '32rem' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-outline-variant)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p className="font-label-sm" style={{ color: 'var(--color-outline)', marginBottom: '0.25rem' }}>MÃ ĐƠN HÀNG</p>
                <h3 className="font-headline-md" style={{ fontSize: '1.25rem' }}>#{selectedOrder.orderId}</h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className={`badge ${paymentStatusConfig[selectedOrder.paymentStatus].cls}`}>
                  {paymentStatusConfig[selectedOrder.paymentStatus].label}
                </span>
                <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-on-surface-variant)' }}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 className="font-label-md" style={{ marginBottom: '0.75rem', color: 'var(--color-primary)', borderBottom: '1px solid rgba(0,92,134,0.2)', paddingBottom: '0.5rem' }}>
                  THÔNG TIN KHÁCH HÀNG
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.65rem', marginBottom: '0.125rem' }}>Tên</p>
                    <p className="font-body-sm" style={{ fontWeight: 600 }}>{selectedOrder.customer?.fullName ?? '—'}</p>
                  </div>
                  <div>
                    <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.65rem', marginBottom: '0.125rem' }}>SĐT</p>
                    <p className="font-body-sm">{selectedOrder.customer?.phoneNumber ?? '—'}</p>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.65rem', marginBottom: '0.125rem' }}>Email</p>
                    <p className="font-body-sm">{selectedOrder.customer?.email ?? selectedOrder.receiverEmail ?? '—'}</p>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <h4 className="font-label-md" style={{ marginBottom: '0.75rem', color: 'var(--color-primary)', borderBottom: '1px solid rgba(0,92,134,0.2)', paddingBottom: '0.5rem' }}>
                  SẢN PHẨM TRONG ĐƠN
                </h4>
                {(selectedOrder.orderItems ?? []).map((oi) => (
                  <div key={oi.orderItemId} style={{ display: 'flex', gap: '0.75rem', padding: '0.5rem 0', borderBottom: '1px solid var(--color-outline-variant)' }}>
                    <div style={{ flex: 1 }}>
                      <p className="font-body-sm" style={{ fontWeight: 600 }}>{oi.voucher?.title ?? `Voucher #${oi.voucherId}`}</p>
                      <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>SL: {oi.quantity} × {fmtVnd(oi.price)}</p>
                      {(oi.issuedVouchers ?? []).length > 0 && (
                        <div className="font-label-sm" style={{ marginTop: '0.25rem', color: 'var(--color-on-surface-variant)' }}>
                          Mã: {oi.issuedVouchers!.map((iv) => iv.voucherCode).join(', ')}
                        </div>
                      )}
                    </div>
                    <div className="font-body-sm" style={{ fontWeight: 600, alignSelf: 'center' }}>
                      {fmtVnd(Number(oi.price) * oi.quantity)}
                    </div>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '2px solid var(--color-primary)' }}>
                  <span className="font-label-md" style={{ fontWeight: 700 }}>Tổng cộng</span>
                  <span className="font-headline-sm" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>{fmtVnd(selectedOrder.totalAmount)}</span>
                </div>
              </div>

              {(selectedOrder.cancelledAt || selectedOrder.refundedAt) && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 className="font-label-md" style={{ marginBottom: '0.75rem', color: 'var(--color-primary)', borderBottom: '1px solid rgba(0,92,134,0.2)', paddingBottom: '0.5rem' }}>
                    LỊCH SỬ
                  </h4>
                  {selectedOrder.cancelledAt && (
                    <div style={{ padding: '0.75rem', background: 'var(--color-error-container, #fee2e2)', borderRadius: '0.5rem', marginBottom: '0.5rem' }}>
                      <p className="font-body-sm" style={{ fontWeight: 600 }}>Đã hủy lúc {formatDate(selectedOrder.cancelledAt)}</p>
                      {selectedOrder.cancelReason && (
                        <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>Lý do: {selectedOrder.cancelReason}</p>
                      )}
                    </div>
                  )}
                  {selectedOrder.refundedAt && (
                    <div style={{ padding: '0.75rem', background: 'var(--color-tertiary-container, #fef3c7)', borderRadius: '0.5rem' }}>
                      <p className="font-body-sm" style={{ fontWeight: 600 }}>Đã hoàn tiền lúc {formatDate(selectedOrder.refundedAt)}</p>
                      <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
                        Số tiền: {fmtVnd(selectedOrder.refundAmount ?? 0)}
                      </p>
                      {selectedOrder.refundReason && (
                        <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>Lý do: {selectedOrder.refundReason}</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Cancel Modal */}
      {showCancelModal && targetOrder && (
        <>
          <div className="side-panel-overlay" onClick={() => { setShowCancelModal(false); setTargetOrder(null) }} />
          <div className="side-panel" style={{ width: '28rem' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-outline-variant)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="font-headline-md" style={{ fontSize: '1.25rem' }}>Hủy đơn hàng</h3>
              <button onClick={() => { setShowCancelModal(false); setTargetOrder(null) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-on-surface-variant)' }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div style={{ padding: '1.5rem', flex: 1 }}>
              <div className="admin-card" style={{ padding: '1rem', marginBottom: '1rem' }}>
                <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>Đơn hàng</p>
                <p className="font-body-sm" style={{ fontWeight: 600 }}>#{targetOrder.orderId} · {fmtVnd(targetOrder.totalAmount)}</p>
                <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>Khách: {targetOrder.customer?.fullName}</p>
              </div>
              <div style={{ padding: '0.75rem', background: 'var(--color-tertiary-container, #fef3c7)', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
                  ⚠️ Hủy đơn sẽ tự động:
                  <br />• Chuyển trạng thái thanh toán thành <strong>Cancelled</strong>
                  <br />• Đánh dấu các mã voucher đã phát hành là <strong>Expired</strong>
                  <br />• Hoàn lại số lượng voucher vào kho đối tác
                  {targetOrder.paymentStatus === 'Paid' && (
                    <>
                      <br />• Đơn này đang ở trạng thái <strong>Đã thanh toán</strong> — bạn nên <strong>hoàn tiền</strong> trước khi hủy.
                    </>
                  )}
                </p>
              </div>
              <div>
                <label className="font-label-sm" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-on-surface-variant)' }}>
                  Lý do hủy <span style={{ color: 'var(--color-error-danger)' }}>*</span>
                </label>
                <textarea
                  className="admin-input"
                  style={{ resize: 'vertical', minHeight: '100px', width: '100%' }}
                  placeholder="Nhập lý do hủy đơn hàng..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                />
              </div>
            </div>
            <div style={{ padding: '1.5rem', borderTop: '1px solid var(--color-outline-variant)', display: 'flex', gap: '0.75rem' }}>
              <button className="admin-btn admin-btn-ghost" style={{ flex: 1 }} onClick={() => { setShowCancelModal(false); setTargetOrder(null) }}>
                Hủy thao tác
              </button>
              <button
                className="admin-btn admin-btn-danger"
                style={{ flex: 2 }}
                onClick={handleCancel}
                disabled={!cancelReason.trim() || isSaving}
              >
                Xác nhận hủy đơn
              </button>
            </div>
          </div>
        </>
      )}

      {/* Refund Modal */}
      {showRefundModal && targetOrder && (
        <>
          <div className="side-panel-overlay" onClick={() => { setShowRefundModal(false); setTargetOrder(null) }} />
          <div className="side-panel" style={{ width: '28rem' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-outline-variant)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="font-headline-md" style={{ fontSize: '1.25rem' }}>Hoàn tiền (giả lập)</h3>
              <button onClick={() => { setShowRefundModal(false); setTargetOrder(null) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-on-surface-variant)' }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div style={{ padding: '1.5rem', flex: 1 }}>
              <div className="admin-card" style={{ padding: '1rem', marginBottom: '1rem' }}>
                <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>Đơn hàng</p>
                <p className="font-body-sm" style={{ fontWeight: 600 }}>#{targetOrder.orderId} · {fmtVnd(targetOrder.totalAmount)}</p>
                <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>Khách: {targetOrder.customer?.fullName}</p>
              </div>
              <div style={{ padding: '0.75rem', background: 'var(--color-tertiary-container, #fef3c7)', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
                  ℹ️ Đây là <strong>giả lập</strong>: hệ thống chỉ ghi nhận thời gian, số tiền và lý do hoàn tiền. Không tích hợp cổng thanh toán thực.
                </p>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label className="font-label-sm" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-on-surface-variant)' }}>
                  Số tiền hoàn (đ) <span style={{ color: 'var(--color-error-danger)' }}>*</span>
                </label>
                <input
                  className="admin-input"
                  style={{ width: '100%' }}
                  type="number"
                  placeholder={targetOrder.totalAmount}
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                />
                <p className="font-label-sm" style={{ marginTop: '0.25rem', color: 'var(--color-on-surface-variant)' }}>
                  Tối đa: {fmtVnd(targetOrder.totalAmount)}
                </p>
              </div>
              <div>
                <label className="font-label-sm" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-on-surface-variant)' }}>
                  Lý do hoàn tiền <span style={{ color: 'var(--color-error-danger)' }}>*</span>
                </label>
                <textarea
                  className="admin-input"
                  style={{ resize: 'vertical', minHeight: '80px', width: '100%' }}
                  placeholder="Nhập lý do hoàn tiền..."
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                />
              </div>
            </div>
            <div style={{ padding: '1.5rem', borderTop: '1px solid var(--color-outline-variant)', display: 'flex', gap: '0.75rem' }}>
              <button className="admin-btn admin-btn-ghost" style={{ flex: 1 }} onClick={() => { setShowRefundModal(false); setTargetOrder(null) }}>
                Hủy
              </button>
              <button
                className="admin-btn admin-btn-primary"
                style={{ flex: 2 }}
                onClick={handleRefund}
                disabled={!refundAmount || Number(refundAmount) <= 0 || !refundReason.trim() || isSaving}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>attach_money</span>
                Xác nhận hoàn tiền
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}