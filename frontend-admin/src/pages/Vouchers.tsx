import { useState } from 'react'
import { useToast } from '../components/shared/Toast'

type VoucherStatus = 'DRAFT' | 'PENDING_REVIEW' | 'REJECTED' | 'PUBLISHED' | 'PAUSED' | 'STOPPED' | 'EXPIRED' | 'SOLD_OUT'

interface Voucher {
  id: string
  code: string
  name: string
  partner: string
  category: string
  originalPrice: number
  salePrice: number
  quantityTotal: number
  quantitySold: number
  quantityUsed: number
  sellStart: string
  sellEnd: string
  validStart: string
  validEnd: string
  status: VoucherStatus
  submittedAt: string
  rejectedReason?: string
  imageUrl: string
  description: string
  conditions: string[]
}

const mockVouchers: Voucher[] = [
  {
    id: 'VCH-2024-001', code: 'VCH-001', name: 'Thưởng thức Cà phê Signature', partner: 'The Coffee House',
    category: 'Ẩm thực', originalPrice: 200000, salePrice: 150000, quantityTotal: 500, quantitySold: 320, quantityUsed: 245,
    sellStart: '01/01/2024', sellEnd: '30/06/2024', validStart: '01/01/2024', validEnd: '31/12/2024',
    status: 'PUBLISHED', submittedAt: '28/05/2024',
    imageUrl: '', description: 'Set menu bao gồm: Cà phê Signature, bánh ngọt đặc biệt và nước ép trái cây theo mùa.',
    conditions: ['Có hiệu lực đến 31/12/2024', 'Đặt bàn trước 24h qua hotline', 'Không áp dụng đồng thời với các CTKM khác'],
  },
  {
    id: 'VCH-2024-002', code: 'VCH-002', name: 'Gói 1 tháng Gym & Yoga', partner: 'California Fitness',
    category: 'Thể hình', originalPrice: 1500000, salePrice: 1200000, quantityTotal: 100, quantitySold: 72, quantityUsed: 58,
    sellStart: '15/02/2024', sellEnd: '31/12/2024', validStart: '01/03/2024', validEnd: '01/04/2024',
    status: 'PUBLISHED', submittedAt: '20/05/2024',
    imageUrl: '', description: 'Gói tập gym và yoga trong 1 tháng với huấn luyện viên cá nhân 2 buổi.',
    conditions: ['Gói 1 tháng kể từ ngày kích hoạt', 'Áp dụng tại tất cả chi nhánh', 'Không hoàn tiền'],
  },
  {
    id: 'VCH-2024-003', code: 'VCH-003', name: 'Cặp vé xem phim IMAX 4DX', partner: 'CGV Cinemas',
    category: 'Giải trí', originalPrice: 600000, salePrice: 450000, quantityTotal: 200, quantitySold: 145, quantityUsed: 130,
    sellStart: '01/04/2024', sellEnd: '31/12/2024', validStart: '01/04/2024', validEnd: '31/12/2024',
    status: 'PUBLISHED', submittedAt: '22/05/2024',
    imageUrl: '', description: '2 vé xem phim IMAX hoặc 4DX tại rạp CGV toàn quốc, không giới hạn suất chiếu.',
    conditions: ['Vé có giá trị đến 31/12/2024', 'Phải đặt trước qua app CGV', 'Không áp dụng vào ngày lễ'],
  },
  {
    id: 'VCH-2024-004', code: 'VCH-004', name: 'Combo Buffet Nướng Cao Cấp', partner: 'The Golden Grill',
    category: 'Ẩm thực', originalPrice: 990000, salePrice: 599000, quantityTotal: 100, quantitySold: 45, quantityUsed: 0,
    sellStart: '10/06/2024', sellEnd: '30/09/2024', validStart: '10/06/2024', validEnd: '30/09/2024',
    status: 'PENDING_REVIEW', submittedAt: '21/06/2024',
    imageUrl: '', description: 'Set menu buffet nướng cao cấp 5 món kèm 2 ly rượu vang. Áp dụng cho 2 người.',
    conditions: ['Cần đặt bàn trước 48h', 'Không áp dụng đồng thời với CTKM khác'],
  },
  {
    id: 'VCH-2024-005', code: 'VCH-005', name: 'Liệu trình Thải Độc Da', partner: 'Lotus Wellness',
    category: 'Làm đẹp & Spa', originalPrice: 1200000, salePrice: 899000, quantityTotal: 50, quantitySold: 0, quantityUsed: 0,
    sellStart: '01/08/2024', sellEnd: '31/12/2024', validStart: '01/08/2024', validEnd: '31/12/2024',
    status: 'PENDING_REVIEW', submittedAt: '21/06/2024',
    imageUrl: '', description: 'Liệu trình thải độc da 90 phút với sản phẩm organic nhập khẩu. Bao gồm tư vấn da liễu.',
    conditions: ['Chỉ áp dụng cho khách hàng từ 18 tuổi trở lên', 'Cần hẹn trước 24h'],
  },
  {
    id: 'VCH-2024-006', code: 'VCH-006', name: 'Tai Nghe Noise Canceling Pro', partner: 'TechZone Store',
    category: 'Điện tử', originalPrice: 3100000, salePrice: 2450000, quantityTotal: 20, quantitySold: 0, quantityUsed: 0,
    sellStart: '01/06/2024', sellEnd: '01/01/2025', validStart: '01/06/2024', validEnd: '01/01/2025',
    status: 'PENDING_REVIEW', submittedAt: '21/06/2024',
    imageUrl: '', description: 'Tai nghe không dây chống ồn chủ động ANC, pin 30h, sạc nhanh USB-C.',
    conditions: ['Bảo hành 12 tháng chính hãng', 'Không áp dụng đổi trả'],
  },
  {
    id: 'VCH-2024-007', code: 'VCH-007', name: 'Gói Spa Cao Cấp 3 Ngày', partner: 'Lotus Wellness',
    category: 'Làm đẹp & Spa', originalPrice: 2500000, salePrice: 1890000, quantityTotal: 30, quantitySold: 0, quantityUsed: 0,
    sellStart: '15/06/2024', sellEnd: '31/12/2024', validStart: '15/06/2024', validEnd: '31/12/2024',
    status: 'REJECTED', submittedAt: '18/06/2024', rejectedReason: 'Giá bán phải nhỏ hơn ít nhất 20% so với giá gốc theo quy định của sàn.',
    imageUrl: '', description: 'Gói spa cao cấp 3 ngày với massage, facial và body treatment.',
    conditions: [],
  },
]

const statusConfig: Record<VoucherStatus, { label: string; cls: string }> = {
  DRAFT: { label: 'Nháp', cls: 'badge-info' },
  PENDING_REVIEW: { label: 'Chờ duyệt', cls: 'badge-pending' },
  REJECTED: { label: 'Từ chối', cls: 'badge-locked' },
  PUBLISHED: { label: 'Đã công bố', cls: 'badge-active' },
  PAUSED: { label: 'Tạm ngưng', cls: 'badge-pending' },
  STOPPED: { label: 'Ngừng bán', cls: 'badge-info' },
  EXPIRED: { label: 'Hết hạn', cls: 'badge-locked' },
  SOLD_OUT: { label: 'Hết hàng', cls: 'badge-locked' },
}

const categoryColors: Record<string, string> = {
  'Ẩm thực': '#7e4b00',
  'Thể hình': '#006b5f',
  'Giải trí': '#005c86',
  'Làm đẹp & Spa': '#7e4b00',
  'Điện tử': '#005c86',
}

const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n) + ' đ'

export default function Vouchers() {
  const { showToast } = useToast()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid')
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectTarget, setRejectTarget] = useState<string | null>(null)

  const filtered = mockVouchers.filter((v) => {
    const matchSearch = v.name.toLowerCase().includes(search.toLowerCase()) || v.code.toLowerCase().includes(search.toLowerCase()) || v.partner.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || v.status === statusFilter
    return matchSearch && matchStatus
  })

  const checkRB02 = (v: Voucher) => v.salePrice < v.originalPrice
  const checkRB03 = (v: Voucher) => Boolean(v.sellStart && v.sellEnd && v.validStart && v.validEnd)

  const handleApprove = (v: Voucher) => {
    if (!checkRB02(v)) {
      showToast('Vi phạm RB-02: Giá bán phải nhỏ hơn giá gốc!', 'error')
      return
    }
    if (!checkRB03(v)) {
      showToast('Vi phạm RB-03: Voucher phải có thời gian rõ ràng!', 'error')
      return
    }
    showToast(`Đã phê duyệt voucher ${v.code} — Trạng thái: PUBLISHED. Đã gửi thông báo cho ${v.partner}.`, 'success')
  }

  const handleReject = () => {
    if (!rejectTarget || !rejectReason.trim()) return
    showToast(`Đã từ chối voucher ${rejectTarget} — ${rejectReason}`, 'warning')
    setShowRejectModal(false)
    setRejectTarget(null)
    setRejectReason('')
  }

  const pendingCount = mockVouchers.filter((v) => v.status === 'PENDING_REVIEW').length

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="font-headline-lg" style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Kiểm duyệt voucher</h1>
          <p className="font-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
            Duyệt, từ chối và kiểm soát vòng đời voucher trên sàn.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span className="badge badge-pending">{pendingCount} đang chờ</span>
          <div style={{ display: 'flex', background: 'var(--color-surface-container-low)', borderRadius: '0.5rem', padding: '0.25rem' }}>
            {(['grid', 'list'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setViewMode(m)}
                style={{
                  padding: '0.375rem 0.75rem',
                  borderRadius: '0.25rem',
                  border: 'none',
                  cursor: 'pointer',
                  background: viewMode === m ? 'var(--color-surface-container-lowest)' : 'transparent',
                  color: 'var(--color-on-surface-variant)',
                  boxShadow: viewMode === m ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '0.75rem',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                  {m === 'grid' ? 'grid_view' : 'view_list'}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 250 }}>
            <span className="material-symbols-outlined" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-on-surface-variant)', fontSize: '18px' }}>
              search
            </span>
            <input
              className="admin-input"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Tìm kiếm mã, tên voucher, đối tác..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className="admin-input admin-select" style={{ width: 'auto' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">Tất cả trạng thái</option>
            <option value="PENDING_REVIEW">Chờ duyệt</option>
            <option value="PUBLISHED">Đã công bố</option>
            <option value="PAUSED">Tạm ngưng</option>
            <option value="REJECTED">Từ chối</option>
            <option value="STOPPED">Ngừng bán</option>
            <option value="EXPIRED">Hết hạn</option>
            <option value="SOLD_OUT">Hết hàng</option>
          </select>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {filtered.map((v) => {
            const sc = statusConfig[v.status]
            const lowStock = v.quantityTotal - v.quantitySold < v.quantityTotal * 0.1
            const discount = Math.round((1 - v.salePrice / v.originalPrice) * 100)
            const catColor = categoryColors[v.category] || '#005c86'

            return (
              <div
                key={v.id}
                className="admin-card"
                style={{
                  overflow: 'hidden',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer',
                  borderLeft: v.status === 'PENDING_REVIEW' ? '4px solid var(--color-warning-pending)' : undefined,
                }}
                onClick={() => setSelectedVoucher(v)}
              >
                {/* Card Header */}
                <div style={{ height: '6rem', background: 'linear-gradient(135deg, var(--color-surface-container-high) 0%, var(--color-surface-container) 100%)', display: 'flex', alignItems: 'flex-end', padding: '0.75rem', position: 'relative' }}>
                  <span
                    style={{
                      position: 'absolute', top: '0.75rem', left: '0.75rem',
                      padding: '0.25rem 0.625rem', borderRadius: '9999px',
                      background: catColor, color: 'white',
                      fontFamily: '"JetBrains Mono", monospace', fontSize: '0.65rem', fontWeight: 600,
                    }}
                  >
                    {v.category}
                  </span>
                  <span className={`badge ${sc.cls}`} style={{ position: 'absolute', top: '0.75rem', right: '0.75rem' }}>
                    {sc.label}
                  </span>
                </div>

                {/* Card Body */}
                <div style={{ padding: '1rem' }}>
                  <p className="font-label-sm" style={{ color: 'var(--color-outline)', fontSize: '0.65rem', marginBottom: '0.25rem' }}>{v.code}</p>
                  <h3 className="font-body-md" style={{ fontWeight: 600, marginBottom: '0.5rem', lineHeight: 1.3 }}>{v.name}</h3>
                  <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.65rem', marginBottom: '0.75rem' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '12px', verticalAlign: 'middle' }}>store</span>
                    {' '}{v.partner}
                  </p>

                  {/* Price */}
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span style={{ fontFamily: '"Manrope", sans-serif', fontWeight: 700, fontSize: '1.25rem', color: 'var(--color-primary)' }}>
                      {fmt(v.salePrice)}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-error-danger)', textDecoration: 'line-through' }}>
                      {fmt(v.originalPrice)}
                    </span>
                    <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--color-success-active)', background: 'rgba(16,185,129,0.1)', padding: '0.125rem 0.375rem', borderRadius: '9999px' }}>
                      -{discount}%
                    </span>
                  </div>

                  {/* Stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.375rem', marginBottom: '0.75rem' }}>
                    {[
                      { label: 'Tổng', value: v.quantityTotal },
                      { label: 'Đã bán', value: v.quantitySold },
                      { label: 'Đã dùng', value: v.quantityUsed },
                    ].map((s) => (
                      <div key={s.label} style={{ background: 'var(--color-surface-container-low)', padding: '0.375rem', borderRadius: '0.375rem', textAlign: 'center' }}>
                        <p className="font-label-sm" style={{ fontWeight: 700, color: 'var(--color-on-surface)', fontSize: '0.75rem' }}>{s.value}</p>
                        <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.6rem' }}>{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Progress bar */}
                  <div style={{ height: 4, background: 'var(--color-surface-container-high)', borderRadius: 2, marginBottom: '0.75rem', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${(v.quantitySold / v.quantityTotal) * 100}%`,
                        background: lowStock ? 'var(--color-error-danger)' : 'var(--color-primary)',
                        borderRadius: 2,
                        transition: 'width 0.3s',
                      }}
                    />
                  </div>

                  {/* Time */}
                  <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.65rem' }}>
                    Bán: {v.sellStart} → {v.sellEnd}
                  </p>
                  <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.65rem' }}>
                    SD: {v.validStart} → {v.validEnd}
                  </p>

                  {/* Actions */}
                  {v.status === 'PENDING_REVIEW' && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                      <button
                        className="admin-btn admin-btn-success"
                        style={{ flex: 1 }}
                        onClick={(e) => { e.stopPropagation(); handleApprove(v) }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check</span>
                        Duyệt
                      </button>
                      <button
                        className="admin-btn admin-btn-danger"
                        style={{ flex: 1 }}
                        onClick={(e) => { e.stopPropagation(); setRejectTarget(v.id); setShowRejectModal(true) }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
                        Từ chối
                      </button>
                    </div>
                  )}
                  {v.status === 'PUBLISHED' && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                      <button
                        className="admin-btn admin-btn-ghost"
                        style={{ flex: 1, fontSize: '0.75rem', padding: '0.375rem' }}
                        onClick={(e) => { e.stopPropagation(); showToast(`Đã tạm ngưng voucher ${v.code}`, 'warning'); setSelectedVoucher(null) }}
                      >
                        Tạm ngưng
                      </button>
                      <button
                        className="admin-btn admin-btn-danger"
                        style={{ flex: 1, fontSize: '0.75rem', padding: '0.375rem' }}
                        onClick={(e) => { e.stopPropagation(); showToast(`Đã ngừng bán voucher ${v.code}`, 'warning'); setSelectedVoucher(null) }}
                      >
                        Ngừng bán
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="admin-card" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Mã</th>
                  <th>Tên voucher</th>
                  <th>Đối tác</th>
                  <th>Danh mục</th>
                  <th style={{ textAlign: 'right' }}>Giá gốc</th>
                  <th style={{ textAlign: 'right' }}>Giá bán</th>
                  <th style={{ textAlign: 'right' }}>Đã bán/Tổng</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((v) => {
                  const sc = statusConfig[v.status]
                  return (
                    <tr key={v.id}>
                      <td><span className="font-label-sm" style={{ color: 'var(--color-outline)', fontSize: '0.7rem' }}>{v.code}</span></td>
                      <td>
                        <p className="font-body-sm" style={{ fontWeight: 600 }}>{v.name}</p>
                        <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.65rem' }}>Gửi: {v.submittedAt}</p>
                      </td>
                      <td><span className="font-body-sm">{v.partner}</span></td>
                      <td><span className="font-body-sm">{v.category}</span></td>
                      <td style={{ textAlign: 'right' }}>
                        <span className="font-label-md" style={{ color: 'var(--color-error-danger)', textDecoration: 'line-through', fontSize: '0.75rem' }}>{fmt(v.originalPrice)}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span className="font-label-md" style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{fmt(v.salePrice)}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span className="font-label-sm">{v.quantitySold}/{v.quantityTotal}</span>
                      </td>
                      <td><span className={`badge ${sc.cls}`}>{sc.label}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'flex-end' }}>
                          <button
                            className="admin-btn admin-btn-ghost"
                            style={{ padding: '0.25rem', fontSize: '0.7rem' }}
                            onClick={() => setSelectedVoucher(v)}
                            title="Xem chi tiết"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>visibility</span>
                          </button>
                          {v.status === 'PENDING_REVIEW' && (
                            <>
                              <button className="admin-btn admin-btn-success" style={{ padding: '0.25rem', fontSize: '0.7rem' }} onClick={() => handleApprove(v)}>
                                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check</span>
                              </button>
                              <button className="admin-btn admin-btn-danger" style={{ padding: '0.25rem', fontSize: '0.7rem' }} onClick={() => { setRejectTarget(v.id); setShowRejectModal(true) }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Voucher Detail Panel */}
      {selectedVoucher && (
        <>
          <div className="side-panel-overlay" onClick={() => setSelectedVoucher(null)} />
          <div className="side-panel" style={{ width: '38rem' }}>
            {/* Header */}
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-outline-variant)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p className="font-label-sm" style={{ color: 'var(--color-outline)', marginBottom: '0.25rem' }}>{selectedVoucher.code}</p>
                <h3 className="font-headline-md" style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{selectedVoucher.name}</h3>
                <p className="font-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '14px', verticalAlign: 'middle' }}>store</span>
                  {' '}{selectedVoucher.partner}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className={`badge ${statusConfig[selectedVoucher.status].cls}`}>{statusConfig[selectedVoucher.status].label}</span>
                <button onClick={() => setSelectedVoucher(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-on-surface-variant)' }}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            {/* Content */}
            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
              {/* Pricing */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ padding: '0.75rem', background: 'var(--color-surface-container-low)', borderRadius: '0.5rem', textAlign: 'center' }}>
                  <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: '0.25rem', fontSize: '0.65rem' }}>GIÁ GỐC</p>
                  <p className="font-label-md" style={{ color: 'var(--color-error-danger)', textDecoration: 'line-through', fontSize: '0.875rem' }}>{fmt(selectedVoucher.originalPrice)}</p>
                </div>
                <div style={{ padding: '0.75rem', background: 'var(--color-primary-container)', borderRadius: '0.5rem', textAlign: 'center' }}>
                  <p className="font-label-sm" style={{ color: 'var(--color-on-primary-container)', marginBottom: '0.25rem', fontSize: '0.65rem' }}>GIÁ BÁN</p>
                  <p className="font-label-md" style={{ color: 'var(--color-on-primary-container)', fontWeight: 700 }}>{fmt(selectedVoucher.salePrice)}</p>
                </div>
                <div style={{ padding: '0.75rem', background: 'rgba(16,185,129,0.1)', borderRadius: '0.5rem', textAlign: 'center' }}>
                  <p className="font-label-sm" style={{ color: 'var(--color-success-active)', marginBottom: '0.25rem', fontSize: '0.65rem' }}>GIẢM</p>
                  <p className="font-label-md" style={{ color: 'var(--color-success-active)', fontWeight: 700 }}>
                    {Math.round((1 - selectedVoucher.salePrice / selectedVoucher.originalPrice) * 100)}%
                  </p>
                </div>
              </div>

              {/* RB Compliance */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 className="font-label-md" style={{ marginBottom: '0.75rem', color: 'var(--color-primary)', borderBottom: '1px solid rgba(0,92,134,0.2)', paddingBottom: '0.5rem' }}>
                  KIỂM TRA TUÂN THỦ
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '0.75rem', borderRadius: '0.5rem',
                      background: checkRB02(selectedVoucher) ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                      border: `1px solid ${checkRB02(selectedVoucher) ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
                    }}
                  >
                    <span className="font-body-sm" style={{ color: checkRB02(selectedVoucher) ? 'var(--color-success-active)' : 'var(--color-error-danger)' }}>
                      RB-02: Giá bán &lt; Giá gốc
                    </span>
                    <span className="material-symbols-outlined" style={{ color: checkRB02(selectedVoucher) ? 'var(--color-success-active)' : 'var(--color-error-danger)', fontSize: '20px' }}>
                      {checkRB02(selectedVoucher) ? 'verified' : 'report'}
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '0.75rem', borderRadius: '0.5rem',
                      background: checkRB03(selectedVoucher) ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                      border: `1px solid ${checkRB03(selectedVoucher) ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
                    }}
                  >
                    <span className="font-body-sm" style={{ color: checkRB03(selectedVoucher) ? 'var(--color-success-active)' : 'var(--color-error-danger)' }}>
                      RB-03: Có thời gian rõ ràng
                    </span>
                    <span className="material-symbols-outlined" style={{ color: checkRB03(selectedVoucher) ? 'var(--color-success-active)' : 'var(--color-error-danger)', fontSize: '20px' }}>
                      {checkRB03(selectedVoucher) ? 'verified' : 'report'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quantity */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 className="font-label-md" style={{ marginBottom: '0.75rem', color: 'var(--color-primary)', borderBottom: '1px solid rgba(0,92,134,0.2)', paddingBottom: '0.5rem' }}>
                  SỐ LƯỢNG
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  {[
                    { label: 'Phát hành', value: selectedVoucher.quantityTotal, color: 'var(--color-on-surface)' },
                    { label: 'Đã bán', value: selectedVoucher.quantitySold, color: 'var(--color-primary)' },
                    { label: 'Đã sử dụng', value: selectedVoucher.quantityUsed, color: 'var(--color-success-active)' },
                  ].map((s) => (
                    <div key={s.label} style={{ textAlign: 'center', padding: '0.5rem', background: 'var(--color-surface-container-low)', borderRadius: '0.5rem' }}>
                      <p className="font-label-md" style={{ fontWeight: 700, color: s.color, fontSize: '1.125rem' }}>{s.value}</p>
                      <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.65rem' }}>{s.label}</p>
                    </div>
                  ))}
                </div>
                <div style={{ height: 8, background: 'var(--color-surface-container-high)', borderRadius: 4, marginTop: '0.75rem', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(selectedVoucher.quantitySold / selectedVoucher.quantityTotal) * 100}%`, background: 'var(--color-primary)', borderRadius: 4 }} />
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 className="font-label-md" style={{ marginBottom: '0.75rem', color: 'var(--color-primary)', borderBottom: '1px solid rgba(0,92,134,0.2)', paddingBottom: '0.5rem' }}>
                  MÔ TẢ
                </h4>
                <p className="font-body-sm" style={{ color: 'var(--color-on-surface-variant)', lineHeight: 1.6 }}>{selectedVoucher.description}</p>
              </div>

              {/* Conditions */}
              {selectedVoucher.conditions.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 className="font-label-md" style={{ marginBottom: '0.75rem', color: 'var(--color-primary)', borderBottom: '1px solid rgba(0,92,134,0.2)', paddingBottom: '0.5rem' }}>
                    ĐIỀU KIỆN SỬ DỤNG
                  </h4>
                  <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                    {selectedVoucher.conditions.map((c, i) => (
                      <li key={i} className="font-body-sm" style={{ color: 'var(--color-on-surface-variant)', lineHeight: 1.5 }}>
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Rejected reason */}
              {selectedVoucher.status === 'REJECTED' && selectedVoucher.rejectedReason && (
                <div style={{ padding: '1rem', background: 'var(--color-error-container)', borderRadius: '0.75rem', border: '1px solid rgba(239,68,68,0.2)', marginBottom: '1rem' }}>
                  <p className="font-label-md" style={{ color: 'var(--color-error-danger)', marginBottom: '0.25rem' }}>LÝ DO TỪ CHỐI</p>
                  <p className="font-body-sm" style={{ color: 'var(--color-on-error-container)' }}>{selectedVoucher.rejectedReason}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ padding: '1.5rem', borderTop: '1px solid var(--color-outline-variant)', display: 'flex', gap: '0.75rem' }}>
              {selectedVoucher.status === 'PENDING_REVIEW' && (
                <>
                  <button
                    className="admin-btn admin-btn-danger"
                    style={{ flex: 1 }}
                    onClick={() => { setRejectTarget(selectedVoucher.id); setShowRejectModal(true) }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>block</span>
                    Từ chối
                  </button>
                  <button
                    className="admin-btn admin-btn-success"
                    style={{ flex: 2 }}
                    onClick={() => { handleApprove(selectedVoucher); setSelectedVoucher(null) }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check_circle</span>
                    Phê duyệt
                  </button>
                </>
              )}
              {selectedVoucher.status === 'PUBLISHED' && (
                <>
                  <button
                    className="admin-btn admin-btn-ghost"
                    style={{ flex: 1 }}
                    onClick={() => { showToast(`Đã tạm ngưng voucher ${selectedVoucher.code}`, 'warning'); setSelectedVoucher(null) }}
                  >
                    Tạm ngưng
                  </button>
                  <button
                    className="admin-btn admin-btn-danger"
                    style={{ flex: 1 }}
                    onClick={() => { showToast(`Đã ngừng bán voucher ${selectedVoucher.code}`, 'warning'); setSelectedVoucher(null) }}
                  >
                    Ngừng bán
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* Reject Modal */}
      {showRejectModal && rejectTarget && (
        <>
          <div className="side-panel-overlay" onClick={() => { setShowRejectModal(false); setRejectTarget(null) }} />
          <div className="side-panel" style={{ width: '28rem' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-outline-variant)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="font-headline-md" style={{ fontSize: '1.25rem' }}>Từ chối voucher</h3>
              <button onClick={() => { setShowRejectModal(false); setRejectTarget(null) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-on-surface-variant)' }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div style={{ padding: '1.5rem', flex: 1 }}>
              <div style={{ marginBottom: '1rem' }}>
                <label className="font-label-sm" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-on-surface-variant)' }}>
                  Lý do từ chối <span style={{ color: 'var(--color-error-danger)' }}>*</span>
                </label>
                <textarea
                  className="admin-input"
                  style={{ resize: 'vertical', minHeight: '100px' }}
                  placeholder="Nhập lý do từ chối voucher..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              </div>
            </div>
            <div style={{ padding: '1.5rem', borderTop: '1px solid var(--color-outline-variant)', display: 'flex', gap: '0.75rem' }}>
              <button className="admin-btn admin-btn-ghost" style={{ flex: 1 }} onClick={() => { setShowRejectModal(false); setRejectTarget(null) }}>
                Hủy
              </button>
              <button className="admin-btn admin-btn-danger" style={{ flex: 2 }} onClick={handleReject} disabled={!rejectReason.trim()}>
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
