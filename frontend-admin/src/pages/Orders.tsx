import { useState } from 'react'
import { useToast } from '../components/shared/Toast'

type OrderStatus = 'PENDING' | 'PAID' | 'COMPLETED' | 'CANCELLED' | 'REFUND_PENDING' | 'REFUNDED'
type PaymentStatus = 'UNPAID' | 'PAID' | 'REFUNDED' | 'FAILED'
type PaymentMethod = 'WALLET' | 'BANK_TRANSFER' | 'COD'

interface Order {
  id: string
  code: string
  customerName: string
  customerEmail: string
  customerPhone: string
  items: { name: string; qty: number; price: number }[]
  totalAmount: number
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  orderStatus: OrderStatus
  createdAt: string
  note?: string
}

const mockOrders: Order[] = [
  { id: 'ORD-12842', code: 'ORD-2024-001', customerName: 'Nguyễn Văn A', customerEmail: 'vana.nguyen@email.com', customerPhone: '0901234567', items: [{ name: 'Combo Buffet Nướng Cao Cấp', qty: 1, price: 599000 }], totalAmount: 599000, paymentMethod: 'WALLET', paymentStatus: 'PAID', orderStatus: 'COMPLETED', createdAt: '20/06/2024 14:30' },
  { id: 'ORD-12841', code: 'ORD-2024-002', customerName: 'Lê Thị B', customerEmail: 'lethib@email.com', customerPhone: '0902345678', items: [{ name: 'Gói Gym 1 tháng', qty: 1, price: 1200000 }, { name: 'Combo Cafe Signature', qty: 2, price: 300000 }], totalAmount: 1800000, paymentMethod: 'BANK_TRANSFER', paymentStatus: 'PAID', orderStatus: 'PAID', createdAt: '21/06/2024 09:15' },
  { id: 'ORD-12840', code: 'ORD-2024-003', customerName: 'Trần Danh', customerEmail: 'danhtran@shop.com', customerPhone: '0903456789', items: [{ name: 'Tai Nghe ANC Pro', qty: 1, price: 2450000 }], totalAmount: 2450000, paymentMethod: 'COD', paymentStatus: 'UNPAID', orderStatus: 'PENDING', createdAt: '21/06/2024 11:45' },
  { id: 'ORD-12839', code: 'ORD-2024-004', customerName: 'Phạm Lan', customerEmail: 'lanpham@email.com', customerPhone: '0904567890', items: [{ name: 'Liệu trình Spa 90p', qty: 1, price: 899000 }], totalAmount: 899000, paymentMethod: 'WALLET', paymentStatus: 'REFUNDED', orderStatus: 'REFUNDED', createdAt: '18/06/2024 16:20', note: 'Khách hàng yêu cầu hủy do trùng lịch' },
  { id: 'ORD-12838', code: 'ORD-2024-005', customerName: 'Hoàng Minh', customerEmail: 'minhhoang@gmail.com', customerPhone: '0905678901', items: [{ name: 'Cặp vé IMAX', qty: 2, price: 450000 }], totalAmount: 900000, paymentMethod: 'BANK_TRANSFER', paymentStatus: 'PAID', orderStatus: 'COMPLETED', createdAt: '21/06/2024 08:00' },
  { id: 'ORD-12837', code: 'ORD-2024-006', customerName: 'Đỗ Thu Hà', customerEmail: 'thuha.do@email.com', customerPhone: '0906789012', items: [{ name: 'Combo Buffet Hải Sản', qty: 1, price: 1299000 }], totalAmount: 1299000, paymentMethod: 'WALLET', paymentStatus: 'FAILED', orderStatus: 'PENDING', createdAt: '21/06/2024 07:50' },
]

const orderStatusConfig: Record<OrderStatus, { label: string; cls: string }> = {
  PENDING: { label: 'Chờ xử lý', cls: 'badge-pending' },
  PAID: { label: 'Đã thanh toán', cls: 'badge-info' },
  COMPLETED: { label: 'Hoàn tất', cls: 'badge-active' },
  CANCELLED: { label: 'Đã hủy', cls: 'badge-locked' },
  REFUND_PENDING: { label: 'Chờ hoàn tiền', cls: 'badge-pending' },
  REFUNDED: { label: 'Đã hoàn tiền', cls: 'badge-locked' },
}

const paymentStatusConfig: Record<PaymentStatus, { label: string; cls: string }> = {
  UNPAID: { label: 'Chưa thanh toán', cls: 'badge-pending' },
  PAID: { label: 'Đã thanh toán', cls: 'badge-active' },
  REFUNDED: { label: 'Đã hoàn tiền', cls: 'badge-locked' },
  FAILED: { label: 'Thanh toán lỗi', cls: 'badge-locked' },
}

const paymentMethodLabel: Record<PaymentMethod, string> = {
  WALLET: 'Ví điện tử',
  BANK_TRANSFER: 'Chuyển khoản',
  COD: 'COD',
}

const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n) + ' đ'

export default function Orders() {
  const { showToast } = useToast()
  const [search, setSearch] = useState('')
  const [orderStatusFilter, setOrderStatusFilter] = useState('all')
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showRefundModal, setShowRefundModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [refundAmount, setRefundAmount] = useState('')
  const [cancelReason, setCancelReason] = useState('')
  const [targetOrder, setTargetOrder] = useState<Order | null>(null)

  const filtered = mockOrders.filter((o) => {
    const matchSearch =
      o.code.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.customerPhone.includes(search)
    const matchOrderStatus = orderStatusFilter === 'all' || o.orderStatus === orderStatusFilter
    const matchPaymentStatus = paymentStatusFilter === 'all' || o.paymentStatus === paymentStatusFilter
    return matchSearch && matchOrderStatus && matchPaymentStatus
  })

  const totalRevenue = mockOrders.filter((o) => o.paymentStatus === 'PAID' || o.paymentStatus === 'REFUNDED').reduce((sum, o) => sum + (o.paymentStatus === 'REFUNDED' ? 0 : o.totalAmount), 0)
  const totalOrders = mockOrders.length
  const pendingOrders = mockOrders.filter((o) => o.orderStatus === 'PENDING').length
  const cancelledOrders = mockOrders.filter((o) => o.orderStatus === 'CANCELLED' || o.orderStatus === 'REFUNDED').length

  const openRefund = (order: Order) => {
    setTargetOrder(order)
    setRefundAmount(order.totalAmount.toString())
    setShowRefundModal(true)
  }

  const openCancel = (order: Order) => {
    setTargetOrder(order)
    setCancelReason('')
    setShowCancelModal(true)
  }

  const handleConfirmPayment = (order: Order) => {
    showToast(`Đã xác nhận thanh toán thủ công cho đơn ${order.code}.`, 'success')
  }

  const handleRefund = () => {
    if (!targetOrder || !refundAmount) return
    showToast(`Đã hoàn tiền ${fmt(Number(refundAmount))} cho đơn ${targetOrder.code}.`, 'success')
    setShowRefundModal(false)
    setTargetOrder(null)
    setRefundAmount('')
  }

  const handleCancel = () => {
    if (!targetOrder || !cancelReason.trim()) return
    if (targetOrder.paymentStatus === 'PAID' && targetOrder.orderStatus !== 'CANCELLED') {
      showToast(`Đơn đã thanh toán. Cần xử lý hoàn tiền trước khi hủy.`, 'warning')
      setShowCancelModal(false)
      openRefund(targetOrder)
      return
    }
    showToast(`Đã hủy đơn ${targetOrder.code} — ${cancelReason}`, 'warning')
    setShowCancelModal(false)
    setTargetOrder(null)
    setCancelReason('')
  }

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
        <button className="admin-btn admin-btn-ghost">
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>file_download</span>
          Xuất báo cáo
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Tổng đơn hàng', value: totalOrders, color: '#3B82F6' },
          { label: 'Đơn chờ xử lý', value: pendingOrders, color: '#F59E0B' },
          { label: 'Đơn đã hủy', value: cancelledOrders, color: '#EF4444' },
          { label: 'Tổng doanh thu', value: fmt(totalRevenue), color: '#10B981', isText: true },
        ].map((s) => (
          <div key={s.label} className="admin-card" style={{ padding: '1rem', textAlign: 'center' }}>
            <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: '0.25rem', fontSize: '0.65rem' }}>{s.label}</p>
            <p className="font-headline-md" style={{ fontSize: '1.5rem', color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="admin-card" style={{ padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 250 }}>
            <span className="material-symbols-outlined" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-on-surface-variant)', fontSize: '18px' }}>
              search
            </span>
            <input
              className="admin-input"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Tìm mã đơn, tên khách hàng, SĐT..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className="admin-input admin-select" style={{ width: 'auto' }} value={orderStatusFilter} onChange={(e) => setOrderStatusFilter(e.target.value)}>
            <option value="all">Trạng thái: Tất cả</option>
            <option value="PENDING">Chờ xử lý</option>
            <option value="PAID">Đã thanh toán</option>
            <option value="COMPLETED">Hoàn tất</option>
            <option value="CANCELLED">Đã hủy</option>
            <option value="REFUNDED">Đã hoàn tiền</option>
          </select>
          <select className="admin-input admin-select" style={{ width: 'auto' }} value={paymentStatusFilter} onChange={(e) => setPaymentStatusFilter(e.target.value)}>
            <option value="all">Thanh toán: Tất cả</option>
            <option value="UNPAID">Chưa thanh toán</option>
            <option value="PAID">Đã thanh toán</option>
            <option value="REFUNDED">Đã hoàn tiền</option>
            <option value="FAILED">Thanh toán lỗi</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="admin-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Đơn hàng</th>
                <th style={{ textAlign: 'right' }}>Tổng tiền</th>
                <th>Thanh toán</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => {
                const osc = orderStatusConfig[order.orderStatus]
                const psc = paymentStatusConfig[order.paymentStatus]
                return (
                  <tr key={order.id}>
                    <td><span className="font-label-sm" style={{ color: 'var(--color-outline)', fontSize: '0.7rem' }}>{order.code}</span></td>
                    <td>
                      <p className="font-body-sm" style={{ fontWeight: 600 }}>{order.customerName}</p>
                      <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.65rem' }}>{order.customerPhone}</p>
                    </td>
                    <td>
                      {order.items.map((item, i) => (
                        <p key={i} className="font-body-sm" style={{ fontSize: '0.75rem' }}>
                          {item.qty}x {item.name}
                        </p>
                      ))}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className="font-label-md" style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{fmt(order.totalAmount)}</span>
                    </td>
                    <td>
                      <p className="font-body-sm" style={{ fontSize: '0.75rem' }}>{paymentMethodLabel[order.paymentMethod]}</p>
                      <span className={`badge ${psc.cls}`} style={{ fontSize: '0.6rem' }}>{psc.label}</span>
                    </td>
                    <td><span className={`badge ${osc.cls}`}>{osc.label}</span></td>
                    <td><span className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.7rem' }}>{order.createdAt}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'flex-end' }}>
                        <button
                          className="admin-btn admin-btn-ghost"
                          style={{ padding: '0.25rem', fontSize: '0.7rem' }}
                          onClick={() => setSelectedOrder(order)}
                          title="Xem chi tiết"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>visibility</span>
                        </button>
                        {(order.orderStatus === 'PENDING' && order.paymentStatus === 'UNPAID') && (
                          <button
                            className="admin-btn admin-btn-primary"
                            style={{ padding: '0.25rem', fontSize: '0.7rem' }}
                            onClick={() => handleConfirmPayment(order)}
                            title="Xác nhận thanh toán"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>payments</span>
                          </button>
                        )}
                        {(order.paymentStatus === 'PAID') && (
                          <button
                            className="admin-btn admin-btn-danger"
                            style={{ padding: '0.25rem', fontSize: '0.7rem' }}
                            onClick={() => openCancel(order)}
                            title="Hủy đơn"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>cancel</span>
                          </button>
                        )}
                        {(order.paymentStatus === 'PAID' || order.paymentStatus === 'UNPAID') && (
                          <button
                            className="admin-btn admin-btn-ghost"
                            style={{ padding: '0.25rem', fontSize: '0.7rem', color: '#F59E0B' }}
                            onClick={() => openRefund(order)}
                            title="Hoàn tiền"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>attach_money</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--color-outline-variant)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p className="font-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>Hiển thị 1-{Math.min(10, filtered.length)} trên {mockOrders.length} đơn hàng</p>
          <div className="pagination">
            <button className="pagination-btn" disabled><span className="material-symbols-outlined" style={{ fontSize: '16px' }}>chevron_left</span></button>
            <button className="pagination-btn active">1</button>
            <button className="pagination-btn"><span className="material-symbols-outlined" style={{ fontSize: '16px' }}>chevron_right</span></button>
          </div>
        </div>
      </div>

      {/* Order Detail Panel */}
      {selectedOrder && (
        <>
          <div className="side-panel-overlay" onClick={() => setSelectedOrder(null)} />
          <div className="side-panel" style={{ width: '32rem' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-outline-variant)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p className="font-label-sm" style={{ color: 'var(--color-outline)', marginBottom: '0.25rem' }}>MÃ ĐƠN HÀNG</p>
                <h3 className="font-headline-md" style={{ fontSize: '1.25rem' }}>{selectedOrder.code}</h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className={`badge ${orderStatusConfig[selectedOrder.orderStatus].cls}`}>{orderStatusConfig[selectedOrder.orderStatus].label}</span>
                <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-on-surface-variant)' }}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
              {/* Customer info */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 className="font-label-md" style={{ marginBottom: '0.75rem', color: 'var(--color-primary)', borderBottom: '1px solid rgba(0,92,134,0.2)', paddingBottom: '0.5rem' }}>
                  THÔNG TIN KHÁCH HÀNG
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.65rem', marginBottom: '0.125rem' }}>Tên</p>
                    <p className="font-body-sm" style={{ fontWeight: 600 }}>{selectedOrder.customerName}</p>
                  </div>
                  <div>
                    <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.65rem', marginBottom: '0.125rem' }}>SĐT</p>
                    <p className="font-body-sm">{selectedOrder.customerPhone}</p>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.65rem', marginBottom: '0.125rem' }}>Email</p>
                    <p className="font-body-sm">{selectedOrder.customerEmail}</p>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 className="font-label-md" style={{ marginBottom: '0.75rem', color: 'var(--color-primary)', borderBottom: '1px solid rgba(0,92,134,0.2)', paddingBottom: '0.5rem' }}>
                  SẢN PHẨM TRONG ĐƠN
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--color-surface-container-low)', borderRadius: '0.5rem' }}>
                      <div>
                        <p className="font-body-sm" style={{ fontWeight: 600 }}>{item.name}</p>
                        <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.65rem' }}>SL: {item.qty}</p>
                      </div>
                      <span className="font-label-md" style={{ fontWeight: 700 }}>{fmt(item.price)}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0.75rem', background: 'var(--color-primary-container)', borderRadius: '0.5rem', marginTop: '0.5rem' }}>
                  <span className="font-label-md" style={{ fontWeight: 700, color: 'var(--color-on-primary-container)' }}>
                    Tổng cộng: {fmt(selectedOrder.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Payment */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 className="font-label-md" style={{ marginBottom: '0.75rem', color: 'var(--color-primary)', borderBottom: '1px solid rgba(0,92,134,0.2)', paddingBottom: '0.5rem' }}>
                  THANH TOÁN
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div style={{ padding: '0.75rem', background: 'var(--color-surface-container-low)', borderRadius: '0.5rem' }}>
                    <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.65rem', marginBottom: '0.25rem' }}>Phương thức</p>
                    <p className="font-body-sm" style={{ fontWeight: 600 }}>{paymentMethodLabel[selectedOrder.paymentMethod]}</p>
                  </div>
                  <div style={{ padding: '0.75rem', background: 'var(--color-surface-container-low)', borderRadius: '0.5rem' }}>
                    <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.65rem', marginBottom: '0.25rem' }}>Trạng thái TT</p>
                    <span className={`badge ${paymentStatusConfig[selectedOrder.paymentStatus].cls}`}>
                      {paymentStatusConfig[selectedOrder.paymentStatus].label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Note */}
              {selectedOrder.note && (
                <div style={{ padding: '0.75rem', background: 'var(--color-surface-container-low)', borderRadius: '0.5rem', borderLeft: '3px solid var(--color-outline)' }}>
                  <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.65rem', marginBottom: '0.25rem' }}>GHI CHÚ</p>
                  <p className="font-body-sm">{selectedOrder.note}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ padding: '1.5rem', borderTop: '1px solid var(--color-outline-variant)', display: 'flex', gap: '0.75rem' }}>
              {(selectedOrder.orderStatus === 'PENDING' && selectedOrder.paymentStatus === 'UNPAID') && (
                <button
                  className="admin-btn admin-btn-primary"
                  style={{ flex: 1 }}
                  onClick={() => { handleConfirmPayment(selectedOrder); setSelectedOrder(null) }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>payments</span>
                  Xác nhận thanh toán
                </button>
              )}
              <button
                className="admin-btn admin-btn-danger"
                style={{ flex: 1 }}
                onClick={() => { setSelectedOrder(null); openCancel(selectedOrder) }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>cancel</span>
                Hủy đơn hàng
              </button>
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
              <div style={{ padding: '1rem', background: targetOrder.paymentStatus === 'PAID' ? 'var(--color-error-container)' : 'var(--color-surface-container-low)', borderRadius: '0.75rem', marginBottom: '1rem', border: `1px solid ${targetOrder.paymentStatus === 'PAID' ? 'rgba(239,68,68,0.2)' : 'var(--color-outline-variant)'}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="material-symbols-outlined" style={{ color: targetOrder.paymentStatus === 'PAID' ? 'var(--color-error-danger)' : 'var(--color-on-surface-variant)', fontSize: '20px' }}>
                    {targetOrder.paymentStatus === 'PAID' ? 'warning' : 'info'}
                  </span>
                  <p className="font-body-sm" style={{ color: targetOrder.paymentStatus === 'PAID' ? 'var(--color-on-error-container)' : 'var(--color-on-surface-variant)' }}>
                    {targetOrder.paymentStatus === 'PAID'
                      ? `Đơn đã thanh toán ${fmt(targetOrder.totalAmount)}. Cần xử lý hoàn tiền trước.`
                      : `Đơn chưa thanh toán. Có thể hủy trực tiếp.`}
                  </p>
                </div>
              </div>
              <div>
                <label className="font-label-sm" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-on-surface-variant)' }}>
                  Lý do hủy <span style={{ color: 'var(--color-error-danger)' }}>*</span>
                </label>
                <textarea
                  className="admin-input"
                  style={{ resize: 'vertical', minHeight: '100px' }}
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
                disabled={!cancelReason.trim()}
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
              <h3 className="font-headline-md" style={{ fontSize: '1.25rem' }}>Hoàn tiền</h3>
              <button onClick={() => { setShowRefundModal(false); setTargetOrder(null) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-on-surface-variant)' }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div style={{ padding: '1.5rem', flex: 1 }}>
              <div style={{ marginBottom: '1rem' }}>
                <p className="font-label-sm" style={{ marginBottom: '0.5rem', color: 'var(--color-on-surface-variant)' }}>Số tiền hoàn (đ)</p>
                <input
                  className="admin-input"
                  type="number"
                  placeholder={targetOrder.totalAmount.toString()}
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                />
                <p className="font-label-sm" style={{ marginTop: '0.25rem', color: 'var(--color-on-surface-variant)', fontSize: '0.65rem' }}>
                  Tối đa: {fmt(targetOrder.totalAmount)}
                </p>
              </div>
            </div>
            <div style={{ padding: '1.5rem', borderTop: '1px solid var(--color-outline-variant)', display: 'flex', gap: '0.75rem' }}>
              <button className="admin-btn admin-btn-ghost" style={{ flex: 1 }} onClick={() => { setShowRefundModal(false); setTargetOrder(null) }}>
                Hủy
              </button>
              <button
                className="admin-btn admin-btn-success"
                style={{ flex: 2 }}
                onClick={handleRefund}
                disabled={!refundAmount || Number(refundAmount) <= 0}
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
