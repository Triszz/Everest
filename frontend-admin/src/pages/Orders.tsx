import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useOrderManagement } from '../hooks/useOrderManagement';
import type { OrderResponse, OrderPaymentStatus } from '../services/admin.service';

const paymentStatusConfig: Record<OrderPaymentStatus, { label: string; cls: string }> = {
  Pending: { label: 'Chờ thanh toán', cls: 'badge-pending' },
  Paid: { label: 'Đã thanh toán', cls: 'badge-active' },
  Cancelled: { label: 'Đã hủy', cls: 'badge-locked' },
  Refunded: { label: 'Đã hoàn tiền', cls: 'badge-info' },
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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId') || undefined;
  const {
    orders,
    isLoading,
    error,
    fetchOrders,
    updateFilters,
  } = useOrderManagement(userId);

  const [search, setSearch] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<'all' | OrderPaymentStatus>('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleSearch = () => {
    updateFilters({
      search,
      status: paymentStatusFilter === 'all' ? undefined : paymentStatusFilter,
      fromDate: fromDate ? new Date(`${fromDate}T00:00:00`).toISOString() : undefined,
      toDate: toDate ? new Date(`${toDate}T23:59:59.999`).toISOString() : undefined,
    });
  };

  const openDetail = (order: OrderResponse) => {
    navigate(`/orders/${order.orderId}`);
  };

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
      </div>

      {/* Filters */}
      <div className="admin-card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <span className="material-symbols-outlined" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-on-surface-variant)', fontSize: '20px' }}>search</span>
            <input
              className="admin-input"
              style={{ paddingLeft: '2.5rem', width: '100%' }}
              placeholder="Nhập mã đơn hàng..."
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
            <option value="Refunded">Đã hoàn tiền</option>
          </select>
          <label className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
            Ngày bắt đầu
            <input className="admin-input" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} title="Ngày bắt đầu đặt hàng" />
          </label>
          <label className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
            Ngày kết thúc
            <input className="admin-input" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} title="Ngày kết thúc đặt hàng" />
          </label>
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
                      <span className="badge badge-info">Đã hoàn tiền</span>
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
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
