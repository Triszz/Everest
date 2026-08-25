import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useOrderManagement } from '../hooks/useOrderManagement';
import type { OrderResponse, OrderPaymentStatus } from '../services/admin.service';
import { useIsMobile } from '../hooks/useIsMobile';

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

function StatusBadge({ order }: { order: OrderResponse }) {
  if (order.refundedAt) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
        <span className="badge badge-info">Đã hoàn tiền</span>
        <span className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.7rem' }}>
          {formatDate(order.refundedAt)}
        </span>
      </div>
    );
  }
  if (order.cancelledAt) {
    return <span className="badge badge-locked">Đã hủy</span>;
  }
  const config: Record<OrderPaymentStatus, { label: string; cls: string }> = {
    Pending: { label: 'Chờ thanh toán', cls: 'badge-pending' },
    Paid: { label: 'Đã thanh toán', cls: 'badge-active' },
    Cancelled: { label: 'Đã hủy', cls: 'badge-locked' },
    Refunded: { label: 'Đã hoàn tiền', cls: 'badge-info' },
  };
  const cfg = config[order.paymentStatus];
  return <span className={`badge ${cfg.cls}`}>{cfg.label}</span>;
}

function OrderCard({ order, onOpen }: { order: OrderResponse; onOpen: () => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="admin-card" style={{ padding: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>#{order.orderId}</span>
          {order.isGift && <span className="badge badge-info">Quà tặng</span>}
          <StatusBadge order={order} />
        </div>
        <button className="admin-btn admin-btn-ghost" style={{ padding: '0.25rem' }} onClick={onOpen}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>visibility</span>
        </button>
      </div>

      {/* Customer */}
      <div>
        <p style={{ color: 'var(--color-on-surface-variant)', marginBottom: '0.125rem', fontSize: '0.65rem' }}>Khách hàng</p>
        <p style={{ fontWeight: 600, fontSize: '0.8rem' }}>{order.customer?.fullName ?? '—'}</p>
        <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.7rem' }}>{order.customer?.email ?? order.receiverEmail ?? '—'}</p>
      </div>

      {/* Summary */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <p style={{ color: 'var(--color-on-surface-variant)', marginBottom: '0.125rem', fontSize: '0.65rem' }}>Tổng tiền</p>
          <p style={{ fontWeight: 700, fontSize: '0.875rem' }}>{fmtVnd(order.totalAmount)}</p>
          {order.refundedAt && (
            <p style={{ color: 'var(--color-error)', fontSize: '0.7rem' }}>
              Hoàn {fmtVnd(order.refundAmount ?? 0)}
            </p>
          )}
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ color: 'var(--color-on-surface-variant)', marginBottom: '0.125rem', fontSize: '0.65rem' }}>Ngày tạo</p>
          <p style={{ fontSize: '0.7rem' }}>{formatDate(order.createdAt)}</p>
        </div>
      </div>

      {/* Expandable */}
      <button
        className="admin-btn admin-btn-ghost"
        style={{ fontSize: '0.7rem', padding: '0.25rem 0', alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
        onClick={() => setExpanded(!expanded)}
      >
        <span style={{ fontSize: '12px', transition: 'transform 0.2s', transform: expanded ? 'rotate(90deg)' : 'none', display: 'inline-block' }}>
          ▶
        </span>
        {order.orderItems?.length ?? 0} sản phẩm
      </button>

      {expanded && (
        <div style={{ borderTop: '1px solid var(--color-outline-variant)', paddingTop: '0.5rem' }}>
          {(order.orderItems ?? []).map((item) => (
            <div key={item.orderItemId} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0' }}>
              <span style={{ fontSize: '0.7rem' }}>{item.voucher?.title ?? `Voucher #${item.voucherId}`} × {item.quantity}</span>
              <span style={{ fontWeight: 600, fontSize: '0.75rem' }}>{fmtVnd(Number(item.price) * item.quantity)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Orders() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId') || undefined;
  const { orders, isLoading, error, fetchOrders, updateFilters } = useOrderManagement(userId);

  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isTablet = windowWidth >= 640 && windowWidth < 1024;

  const [search, setSearch] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<'all' | OrderPaymentStatus>('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleSearch = () => {
    updateFilters({
      search,
      status: paymentStatusFilter === 'all' ? undefined : paymentStatusFilter,
      fromDate: fromDate ? new Date(`${fromDate}T00:00:00`).toISOString() : undefined,
      toDate: toDate ? new Date(`${toDate}T23:59:59.999`).toISOString() : undefined,
    });
  };

  const openDetail = (order: OrderResponse) => navigate(`/orders/${order.orderId}`);

  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.paymentStatus === 'Pending' && !o.cancelledAt).length;
  const cancelledOrders = orders.filter((o) => Boolean(o.cancelledAt)).length;

  const getStatsGridClass = () => {
    if (isMobile) return 'grid-cols-3';
    if (isTablet) return 'grid-cols-3';
    return 'grid-cols-3';
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: isMobile ? '1rem' : '1.5rem' }}>
        <h1 style={{ fontSize: isMobile ? '1.5rem' : '1.5rem', fontWeight: 600, marginBottom: '0.25rem' }}>Quản lý đơn hàng</h1>
        <p style={{ color: 'var(--color-on-surface-variant)', fontSize: isMobile ? '0.8rem' : '0.875rem' }}>Tra cứu, giám sát và xử lý đơn hàng.</p>
      </div>

      {/* Stats */}
      <div className={`grid ${getStatsGridClass()} gap-3 mb-4`}>
        <div className="admin-card" style={{ padding: isMobile ? '0.625rem' : '1rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--color-on-surface-variant)', fontSize: isMobile ? '0.6rem' : '0.7rem', marginBottom: '0.125rem' }}>Tổng đơn</p>
          <p style={{ fontSize: isMobile ? '1.125rem' : '1.5rem', fontWeight: 700 }}>{totalOrders}</p>
        </div>
        <div className="admin-card" style={{ padding: isMobile ? '0.625rem' : '1rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--color-on-surface-variant)', fontSize: isMobile ? '0.6rem' : '0.7rem', marginBottom: '0.125rem' }}>Chờ TT</p>
          <p style={{ fontSize: isMobile ? '1.125rem' : '1.5rem', fontWeight: 700, color: 'var(--color-tertiary, #f59e0b)' }}>{pendingOrders}</p>
        </div>
        <div className="admin-card" style={{ padding: isMobile ? '0.625rem' : '1rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--color-on-surface-variant)', fontSize: isMobile ? '0.6rem' : '0.7rem', marginBottom: '0.125rem' }}>Đã hủy</p>
          <p style={{ fontSize: isMobile ? '1.125rem' : '1.5rem', fontWeight: 700, color: 'var(--color-error, #b91c1c)' }}>{cancelledOrders}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-card" style={{ padding: isMobile ? '0.75rem' : '1rem', marginBottom: '1.5rem' }}>
        <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-row lg:items-end'} gap-2`}>
          <div style={{ position: 'relative', flex: isMobile ? 'unset' : 1 }}>
            <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-on-surface-variant)', fontSize: '20px' }} className="material-symbols-outlined">search</span>
            <input
              className="admin-input"
              style={{ paddingLeft: '2.5rem', width: '100%' }}
              placeholder="Mã đơn..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <select
            className={`admin-input w-full ${isMobile ? '' : 'lg:w-auto lg:min-w-[140px]'}`}
            value={paymentStatusFilter}
            onChange={(e) => setPaymentStatusFilter(e.target.value as 'all' | OrderPaymentStatus)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="Pending">Chờ thanh toán</option>
            <option value="Paid">Đã thanh toán</option>
            <option value="Cancelled">Đã hủy</option>
            <option value="Refunded">Đã hoàn tiền</option>
          </select>
          <label className={`${isMobile ? 'w-full' : 'lg:w-auto lg:min-w-[120px]'}`} style={{ color: 'var(--color-on-surface-variant)' }}>
            <span style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.25rem' }}>Từ ngày</span>
            <input className="admin-input" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </label>
          <label className={`${isMobile ? 'w-full' : 'lg:w-auto lg:min-w-[120px]'}`} style={{ color: 'var(--color-on-surface-variant)' }}>
            <span style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.25rem' }}>Đến ngày</span>
            <input className="admin-input" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </label>
          <button className={`admin-btn admin-btn-primary ${isMobile ? 'w-full' : 'lg:w-auto lg:shrink-0'}`} onClick={handleSearch} style={{ height: isMobile ? '2.25rem' : '2.5rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>filter_list</span>
            {isMobile ? '' : 'Lọc'}
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-on-surface-variant)' }}>Đang tải...</div>
      ) : error ? (
        <div style={{ padding: '1.5rem', color: 'var(--color-error)' }}>{error}</div>
      ) : orders.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-on-surface-variant)', background: 'var(--color-surface-container-lowest)', borderRadius: '0.75rem', border: '1px solid var(--color-outline-variant)' }}>Chưa có đơn hàng nào.</div>
      ) : isMobile || isTablet ? (
        /* Mobile/Tablet Cards */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {orders.map((order) => (
            <OrderCard key={order.orderId} order={order} onOpen={() => openDetail(order)} />
          ))}
        </div>
      ) : (
        /* Desktop Table */
        <div className="admin-card" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ minWidth: '80px' }}>Mã đơn</th>
                  <th style={{ minWidth: '180px' }}>Khách hàng</th>
                  <th style={{ minWidth: '100px' }}>Voucher</th>
                  <th style={{ minWidth: '120px' }}>Số tiền</th>
                  <th style={{ minWidth: '120px' }}>Thanh toán</th>
                  <th style={{ minWidth: '140px' }}>Ngày tạo</th>
                  <th style={{ textAlign: 'right', minWidth: '80px' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.orderId}>
                    <td>
                      <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>#{order.orderId}</span>
                      {order.isGift && <span className="badge badge-info" style={{ marginLeft: '0.5rem' }}>Quà tặng</span>}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{order.customer?.fullName ?? '—'}</div>
                      <div style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.75rem' }}>{order.customer?.email ?? order.receiverEmail ?? '—'}</div>
                    </td>
                    <td>
                      <div style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.75rem' }}>{order.orderItems?.length ?? 0} sản phẩm</div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{fmtVnd(order.totalAmount)}</span>
                      {order.refundedAt && (
                        <div style={{ color: 'var(--color-error)', fontSize: '0.75rem' }}>
                          - Hoàn: {fmtVnd(order.refundAmount ?? 0)}
                        </div>
                      )}
                    </td>
                    <td><StatusBadge order={order} /></td>
                    <td>
                      <span style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.75rem' }}>{formatDate(order.createdAt)}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button className="admin-btn admin-btn-ghost" style={{ padding: '0.375rem' }} onClick={() => openDetail(order)}>
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>visibility</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
