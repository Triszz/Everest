import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useToast } from '../components/shared/Toast'
import { useVoucherManagement } from '../hooks/useVoucherManagement'

type VoucherStatus = 'DRAFT' | 'PENDING_REVIEW' | 'REJECTED' | 'PUBLISHED' | 'PAUSED' | 'STOPPED' | 'EXPIRED' | 'SOLD_OUT'

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

function isVoucherExpired(endDate: string, now: number) {
  return new Date(endDate).getTime() <= now
}

const categoryColors: Record<string, string> = {
  'Ẩm thực': '#7e4b00',
  'Thể hình': '#006b5f',
  'Giải trí': '#005c86',
  'Làm đẹp & Spa': '#7e4b00',
  'Điện tử': '#005c86',
}

const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n) + ' đ'

function mapApprovalStatus(s?: string): VoucherStatus {
  switch (s) {
    case 'Draft': return 'DRAFT'
    case 'Pending': return 'PENDING_REVIEW'
    case 'Rejected': return 'REJECTED'
    case 'Approved': return 'PUBLISHED'
    default: return 'DRAFT'
  }
}

export default function Vouchers() {
  const { showToast } = useToast()
  const [searchParams] = useSearchParams()
  const partnerIdValue = searchParams.get('partnerId')
  const partnerId = partnerIdValue && /^\d+$/.test(partnerIdValue) ? Number(partnerIdValue) : undefined
  const {
    vouchers, stats, total, page, totalPages, filters,
    isLoading, isLoadingStats,
    approveVoucher, rejectVoucher, toggleDisplayStatus,
    updateEndDate, expireNow,
    updateFilters, resetFilters,
  } = useVoucherManagement(partnerId)

  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid')
  const [selectedVoucher, setSelectedVoucher] = useState<typeof vouchers[0] | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectTargetId, setRejectTargetId] = useState<number | null>(null)
  const [editingEndDate, setEditingEndDate] = useState('')
  const [isSavingEndDate, setIsSavingEndDate] = useState(false)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000)
    return () => window.clearInterval(timer)
  }, [])

  const toDateTimeLocal = (value: string) => {
    const date = new Date(value)
    const offset = date.getTimezoneOffset() * 60000
    return new Date(date.getTime() - offset).toISOString().slice(0, 16)
  }

  const openVoucherDetail = (voucher: typeof vouchers[0]) => {
    setSelectedVoucher(voucher)
    setEditingEndDate(toDateTimeLocal(voucher.endDate))
  }

  const handleSaveEndDate = async () => {
    if (!selectedVoucher || !editingEndDate) return
    if (new Date(editingEndDate) <= new Date(selectedVoucher.startDate)) {
      showToast('Ngày kết thúc phải lớn hơn ngày bắt đầu', 'error')
      return
    }
    setIsSavingEndDate(true)
    try {
      const updated = await updateEndDate(selectedVoucher.voucherId, new Date(editingEndDate).toISOString())
      setSelectedVoucher((previous) => previous ? { ...previous, endDate: updated.endDate ?? previous.endDate, updatedAt: updated.updatedAt ?? previous.updatedAt } : previous)
      showToast('Đã cập nhật ngày kết thúc', 'success')
    } finally {
      setIsSavingEndDate(false)
    }
  }

  const handleExpireNow = async () => {
    if (!selectedVoucher) return
    setIsSavingEndDate(true)
    try {
      const updated = await expireNow(selectedVoucher.voucherId)
      setSelectedVoucher((previous) => previous ? { ...previous, endDate: updated.endDate ?? previous.endDate, updatedAt: updated.updatedAt ?? previous.updatedAt } : previous)
      if (updated.endDate) setEditingEndDate(toDateTimeLocal(updated.endDate))
    } finally {
      setIsSavingEndDate(false)
    }
  }

  const openRejectModal = (voucherId: number) => {
    setRejectTargetId(voucherId)
    setRejectReason('')
    setShowRejectModal(true)
  }

  const handleReject = async () => {
    if (!rejectTargetId || !rejectReason.trim()) return
    await rejectVoucher(rejectTargetId, rejectReason)
    setShowRejectModal(false)
    setRejectTargetId(null)
    setRejectReason('')
  }

  const handleApprove = async (v: typeof vouchers[0]) => {
    if (Number(v.salePrice) >= Number(v.originalPrice)) {
      showToast('Vi phạm RB-02: Giá bán phải nhỏ hơn giá gốc!', 'error')
      return
    }
    if (!v.startDate || !v.endDate) {
      showToast('Vi phạm RB-03: Voucher phải có thời gian rõ ràng!', 'error')
      return
    }
    await approveVoucher(v.voucherId)
  }

  const handleToggleDisplay = async (v: typeof vouchers[0], displayStatus: 'Visible' | 'Hidden') => {
    await toggleDisplayStatus(v.voucherId, displayStatus)
    setSelectedVoucher(null)
  }

  const pendingCount = stats?.pending ?? 0

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="font-headline-lg" style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>
            {partnerId ? `Voucher của đối tác #${partnerId}` : 'Kiểm duyệt voucher'}
          </h1>
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

      {/* Stats Cards */}
      {isLoadingStats ? (
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          {[...Array(7)].map((_, i) => (
            <div key={i} style={{ flex: 1, minWidth: 120, height: 80, background: 'var(--color-surface-container-low)', borderRadius: '0.75rem', animation: 'pulse 1.5s infinite' }} />
          ))}
        </div>
      ) : stats ? (
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          {[
            { label: 'Tổng voucher', value: stats.total, color: 'var(--color-on-surface)' },
            { label: 'Đã duyệt', value: stats.approved, color: 'var(--color-success-active)' },
            { label: 'Chờ duyệt', value: stats.pending, color: 'var(--color-warning-pending)' },
            { label: 'Từ chối', value: stats.rejected, color: 'var(--color-error-danger)' },
            { label: 'Phát hành', value: stats.totalIssued, color: 'var(--color-primary)' },
            { label: 'Đã bán', value: stats.totalIssued - (stats.totalIssued - stats.totalIssued), color: 'var(--color-primary)' },
            { label: 'Đã sử dụng', value: stats.totalUsed, color: 'var(--color-success-active)' },
          ].map((s) => (
            <div key={s.label} style={{ flex: 1, minWidth: 120, background: 'var(--color-surface-container-low)', borderRadius: '0.75rem', padding: '0.875rem 1rem', borderLeft: `3px solid ${s.color}` }}>
              <p style={{ fontFamily: '"Manrope", sans-serif', fontWeight: 700, fontSize: '1.5rem', color: s.color, lineHeight: 1 }}>
                {s.value.toLocaleString('vi-VN')}
              </p>
              <p style={{ fontSize: '0.65rem', color: 'var(--color-on-surface-variant)', marginTop: '0.25rem', fontWeight: 500 }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>
      ) : null}

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
              value={filters.search}
              onChange={(e) => updateFilters({ search: e.target.value })}
            />
          </div>
          <select
            className="admin-input admin-select"
            style={{ width: 'auto' }}
            value={filters.approvalStatus}
            onChange={(e) => updateFilters({ approvalStatus: e.target.value })}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="Draft">Nháp</option>
            <option value="Pending">Chờ duyệt</option>
            <option value="Approved">Đã duyệt</option>
            <option value="Rejected">Từ chối</option>
          </select>
          <button className="admin-btn admin-btn-ghost" onClick={resetFilters}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>filter_alt_off</span>
            Reset
          </button>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ height: 300, background: 'var(--color-surface-container-low)', borderRadius: '0.75rem', animation: 'pulse 1.5s infinite' }} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && vouchers.length === 0 && (
        <div className="admin-card" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-on-surface-variant)' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 48, opacity: 0.4 }}>local_offer</span>
          <p className="font-body-md" style={{ marginTop: '0.75rem' }}>Không có voucher nào</p>
        </div>
      )}

      {/* Grid View */}
      {!isLoading && viewMode === 'grid' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {vouchers.map((v) => {
            const expired = isVoucherExpired(v.endDate, now)
            const status = expired ? 'EXPIRED' : mapApprovalStatus(v.approvalStatus)
            const sc = statusConfig[status]
            const sold = v.totalQuantity - v.availableQuantity
            const lowStock = v.availableQuantity < v.totalQuantity * 0.1
            const discount = Math.round((1 - Number(v.salePrice) / Number(v.originalPrice)) * 100)
            const catColor = categoryColors[v.category?.categoryName ?? ''] || '#005c86'

            return (
              <div
                key={v.voucherId}
                className="admin-card"
                style={{
                  overflow: 'hidden',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer',
                  borderLeft: status === 'PENDING_REVIEW' ? '4px solid var(--color-warning-pending)' : undefined,
                }}
                          onClick={() => openVoucherDetail(v)}
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
                    {v.category?.categoryName ?? '—'}
                  </span>
                  <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem' }}>
                    <span className={`badge ${sc.cls}`}>
                      {sc.label}
                    </span>
                    <span className={`badge ${v.displayStatus === 'Visible' ? 'badge-active' : 'badge-info'}`}>
                      {v.displayStatus === 'Visible' ? 'Đang hiện' : 'Đang ẩn'}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div style={{ padding: '1rem' }}>
                  <p className="font-label-sm" style={{ color: 'var(--color-outline)', fontSize: '0.65rem', marginBottom: '0.25rem' }}>
                    #{v.voucherId}
                  </p>
                  <h3 className="font-body-md" style={{ fontWeight: 600, marginBottom: '0.5rem', lineHeight: 1.3 }}>{v.title}</h3>
                  <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.65rem', marginBottom: '0.75rem' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '12px', verticalAlign: 'middle' }}>store</span>
                    {' '}{v.partner?.companyName ?? '—'}
                  </p>

                  {/* Price */}
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span style={{ fontFamily: '"Manrope", sans-serif', fontWeight: 700, fontSize: '1.25rem', color: 'var(--color-primary)' }}>
                      {fmt(Number(v.salePrice))}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-error-danger)', textDecoration: 'line-through' }}>
                      {fmt(Number(v.originalPrice))}
                    </span>
                    <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--color-success-active)', background: 'rgba(16,185,129,0.1)', padding: '0.125rem 0.375rem', borderRadius: '9999px' }}>
                      -{discount}%
                    </span>
                  </div>

                  {/* Stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.375rem', marginBottom: '0.75rem' }}>
                    {[
                      { label: 'Tổng', value: v.totalQuantity },
                      { label: 'Đã bán', value: sold },
                      { label: 'Đã dùng', value: stats?.totalUsed ?? 0 },
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
                        width: `${v.totalQuantity ? (sold / v.totalQuantity) * 100 : 0}%`,
                        background: lowStock ? 'var(--color-error-danger)' : 'var(--color-primary)',
                        borderRadius: 2,
                        transition: 'width 0.3s',
                      }}
                    />
                  </div>

                  {/* Time */}
                  <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.65rem' }}>
                    Từ: {new Date(v.startDate).toLocaleDateString('vi-VN')} → {new Date(v.endDate).toLocaleDateString('vi-VN')}
                  </p>

                  {/* Actions */}
                  {status === 'PENDING_REVIEW' && (
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
                        onClick={(e) => { e.stopPropagation(); openRejectModal(v.voucherId) }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
                        Từ chối
                      </button>
                    </div>
                  )}
                  {status !== 'PENDING_REVIEW' && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                      <button
                        className="admin-btn admin-btn-ghost"
                        style={{ flex: 1, fontSize: '0.75rem', padding: '0.375rem' }}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleToggleDisplay(v, v.displayStatus === 'Visible' ? 'Hidden' : 'Visible')
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                          {v.displayStatus === 'Visible' ? 'visibility_off' : 'visibility'}
                        </span>
                        {v.displayStatus === 'Visible' ? 'Đang hiện' : 'Đang ẩn'}
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
      {!isLoading && viewMode === 'list' && (
        <div className="admin-card" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên voucher</th>
                  <th>Đối tác</th>
                  <th>Danh mục</th>
                  <th style={{ textAlign: 'right' }}>Giá gốc</th>
                  <th style={{ textAlign: 'right' }}>Giá bán</th>
                  <th style={{ textAlign: 'right' }}>Đã bán/Tổng</th>
                  <th>Hiển thị</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {vouchers.map((v) => {
                  const expired = isVoucherExpired(v.endDate, now)
                  const status = expired ? 'EXPIRED' : mapApprovalStatus(v.approvalStatus)
                  const sc = statusConfig[status]
                  const sold = v.totalQuantity - v.availableQuantity
                  return (
                    <tr key={v.voucherId}>
                      <td><span className="font-label-sm" style={{ color: 'var(--color-outline)', fontSize: '0.7rem' }}>#{v.voucherId}</span></td>
                      <td>
                        <p className="font-body-sm" style={{ fontWeight: 600 }}>{v.title}</p>
                        <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.65rem' }}>
                          {new Date(v.createdAt).toLocaleDateString('vi-VN')}
                        </p>
                      </td>
                      <td><span className="font-body-sm">{v.partner?.companyName ?? '—'}</span></td>
                      <td><span className="font-body-sm">{v.category?.categoryName ?? '—'}</span></td>
                      <td style={{ textAlign: 'right' }}>
                        <span className="font-label-md" style={{ color: 'var(--color-error-danger)', textDecoration: 'line-through', fontSize: '0.75rem' }}>{fmt(Number(v.originalPrice))}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span className="font-label-md" style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{fmt(Number(v.salePrice))}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span className="font-label-sm">{sold}/{v.totalQuantity}</span>
                      </td>
                      <td>
                        <span className={`badge ${v.displayStatus === 'Visible' ? 'badge-active' : 'badge-info'}`}>
                          {v.displayStatus === 'Visible' ? 'Đang hiện' : 'Đang ẩn'}
                        </span>
                      </td>
                      <td><span className={`badge ${sc.cls}`}>{sc.label}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'flex-end' }}>
                          <button
                            className="admin-btn admin-btn-ghost"
                            style={{ padding: '0.25rem', fontSize: '0.7rem' }}
                              onClick={() => openVoucherDetail(v)}
                            title="Xem chi tiết"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>visibility</span>
                          </button>
                          {status === 'PENDING_REVIEW' && (
                            <>
                              <button className="admin-btn admin-btn-success" style={{ padding: '0.25rem', fontSize: '0.7rem' }} onClick={() => handleApprove(v)}>
                                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check</span>
                              </button>
                              <button className="admin-btn admin-btn-danger" style={{ padding: '0.25rem', fontSize: '0.7rem' }} onClick={() => openRejectModal(v.voucherId)}>
                                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
                              </button>
                            </>
                          )}
                          {status !== 'PENDING_REVIEW' && (
                            <button
                              className="admin-btn admin-btn-ghost"
                              style={{ padding: '0.25rem', fontSize: '0.7rem' }}
                              onClick={() => handleToggleDisplay(v, v.displayStatus === 'Visible' ? 'Hidden' : 'Visible')}
                              title={v.displayStatus === 'Visible' ? 'Ẩn voucher' : 'Hiện voucher'}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                                {v.displayStatus === 'Visible' ? 'visibility_off' : 'visibility'}
                              </span>
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', borderTop: '1px solid var(--color-outline-variant)' }}>
              <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
                Trang {page} / {totalPages} · {total} voucher
              </p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="admin-btn admin-btn-ghost" disabled={page <= 1} onClick={() => updateFilters({ page: page - 1 })}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_left</span>
                </button>
                <button className="admin-btn admin-btn-ghost" disabled={page >= totalPages} onClick={() => updateFilters({ page: page + 1 })}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_right</span>
                </button>
              </div>
            </div>
          )}
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
                <p className="font-label-sm" style={{ color: 'var(--color-outline)', marginBottom: '0.25rem' }}>#{selectedVoucher.voucherId}</p>
                <h3 className="font-headline-md" style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{selectedVoucher.title}</h3>
                <p className="font-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '14px', verticalAlign: 'middle' }}>store</span>
                  {' '}{selectedVoucher.partner?.companyName ?? '—'}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className={`badge ${isVoucherExpired(selectedVoucher.endDate, now) ? 'badge-locked' : statusConfig[mapApprovalStatus(selectedVoucher.approvalStatus)].cls}`}>
                  {isVoucherExpired(selectedVoucher.endDate, now) ? 'Đã hết hạn' : statusConfig[mapApprovalStatus(selectedVoucher.approvalStatus)].label}
                </span>
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
                  <p className="font-label-md" style={{ color: 'var(--color-error-danger)', textDecoration: 'line-through', fontSize: '0.875rem' }}>{fmt(Number(selectedVoucher.originalPrice))}</p>
                </div>
                <div style={{ padding: '0.75rem', background: 'var(--color-primary-container)', borderRadius: '0.5rem', textAlign: 'center' }}>
                  <p className="font-label-sm" style={{ color: 'var(--color-on-primary-container)', marginBottom: '0.25rem', fontSize: '0.65rem' }}>GIÁ BÁN</p>
                  <p className="font-label-md" style={{ color: 'var(--color-on-primary-container)', fontWeight: 700 }}>{fmt(Number(selectedVoucher.salePrice))}</p>
                </div>
                <div style={{ padding: '0.75rem', background: 'rgba(16,185,129,0.1)', borderRadius: '0.5rem', textAlign: 'center' }}>
                  <p className="font-label-sm" style={{ color: 'var(--color-success-active)', marginBottom: '0.25rem', fontSize: '0.65rem' }}>GIẢM</p>
                  <p className="font-label-md" style={{ color: 'var(--color-success-active)', fontWeight: 700 }}>
                    {Math.round((1 - Number(selectedVoucher.salePrice) / Number(selectedVoucher.originalPrice)) * 100)}%
                  </p>
                </div>
              </div>

              {/* RB Compliance */}
              {/* <div style={{ marginBottom: '1.5rem' }}>
                <h4 className="font-label-md" style={{ marginBottom: '0.75rem', color: 'var(--color-primary)', borderBottom: '1px solid rgba(0,92,134,0.2)', paddingBottom: '0.5rem' }}>
                  KIỂM TRA TUÂN THỦ
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {[
                    { label: 'RB-02: Giá bán < Giá gốc', ok: Number(selectedVoucher.salePrice) < Number(selectedVoucher.originalPrice) },
                    { label: 'RB-03: Có thời gian rõ ràng', ok: Boolean(selectedVoucher.startDate && selectedVoucher.endDate) },
                  ].map((r) => (
                    <div key={r.label} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '0.75rem', borderRadius: '0.5rem',
                      background: r.ok ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                      border: `1px solid ${r.ok ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
                    }}>
                      <span className="font-body-sm" style={{ color: r.ok ? 'var(--color-success-active)' : 'var(--color-error-danger)' }}>
                        {r.label}
                      </span>
                      <span className="material-symbols-outlined" style={{ color: r.ok ? 'var(--color-success-active)' : 'var(--color-error-danger)', fontSize: '20px' }}>
                        {r.ok ? 'verified' : 'report'}
                      </span>
                    </div>
                  ))}
                </div>
              </div> */}

              {/* Quantity */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 className="font-label-md" style={{ marginBottom: '0.75rem', color: 'var(--color-primary)', borderBottom: '1px solid rgba(0,92,134,0.2)', paddingBottom: '0.5rem' }}>
                  SỐ LƯỢNG
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  {[
                    { label: 'Phát hành', value: selectedVoucher.totalQuantity, color: 'var(--color-on-surface)' },
                    { label: 'Đã bán', value: selectedVoucher.totalQuantity - selectedVoucher.availableQuantity, color: 'var(--color-primary)' },
                    { label: 'Đã sử dụng', value: stats?.totalUsed ?? 0, color: 'var(--color-success-active)' },
                  ].map((s) => (
                    <div key={s.label} style={{ textAlign: 'center', padding: '0.5rem', background: 'var(--color-surface-container-low)', borderRadius: '0.5rem' }}>
                      <p className="font-label-md" style={{ fontWeight: 700, color: s.color, fontSize: '1.125rem' }}>{s.value}</p>
                      <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.65rem' }}>{s.label}</p>
                    </div>
                  ))}
                </div>
                <div style={{ height: 8, background: 'var(--color-surface-container-high)', borderRadius: 4, marginTop: '0.75rem', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${selectedVoucher.totalQuantity ? ((selectedVoucher.totalQuantity - selectedVoucher.availableQuantity) / selectedVoucher.totalQuantity) * 100 : 0}%`,
                    background: 'var(--color-primary)',
                    borderRadius: 4,
                  }} />
                </div>
              </div>

              {/* End date */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 className="font-label-md" style={{ marginBottom: '0.75rem', color: 'var(--color-primary)', borderBottom: '1px solid rgba(0,92,134,0.2)', paddingBottom: '0.5rem' }}>
                  THỜI GIAN VOUCHER
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', alignItems: 'end' }}>
                  <label className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
                    Bắt đầu
                    <input className="admin-input" style={{ marginTop: '0.35rem' }} type="datetime-local" value={toDateTimeLocal(selectedVoucher.startDate)} readOnly />
                  </label>
                  <label className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
                    Kết thúc
                    <input className="admin-input" style={{ marginTop: '0.35rem' }} type="datetime-local" value={editingEndDate} onChange={(event) => setEditingEndDate(event.target.value)} min={toDateTimeLocal(selectedVoucher.startDate)} />
                  </label>
                </div>
                <button type="button" className="admin-btn admin-btn-danger" style={{ marginTop: '0.75rem' }} onClick={handleExpireNow} disabled={isSavingEndDate}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>timer_off</span>
                  {isSavingEndDate ? 'Đang xử lý...' : 'Hết hạn ngay'}
                </button>
                <button className="admin-btn admin-btn-primary" style={{ marginTop: '0.75rem' }} onClick={handleSaveEndDate} disabled={isSavingEndDate}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>save</span>
                  {isSavingEndDate ? 'Đang lưu...' : 'Lưu thời gian'}
                </button>
              </div>

              {/* Display Status */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 className="font-label-md" style={{ marginBottom: '0.75rem', color: 'var(--color-primary)', borderBottom: '1px solid rgba(0,92,134,0.2)', paddingBottom: '0.5rem' }}>
                  TRẠNG THÁI HIỂN THỊ
                </h4>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {selectedVoucher.displayStatus === 'Hidden' ? (
                    <button
                      className="admin-btn admin-btn-success"
                      onClick={() => handleToggleDisplay(selectedVoucher, 'Visible')}
                      disabled={false}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>visibility</span>
                      Đang ẩn
                    </button>
                  ) : (
                    <button
                      className="admin-btn admin-btn-danger"
                      onClick={() => handleToggleDisplay(selectedVoucher, 'Hidden')}
                      disabled={false}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>visibility_off</span>
                      Đang hiện
                    </button>
                  )}
                </div>
              </div>

              {/* Description */}
              {selectedVoucher.description && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 className="font-label-md" style={{ marginBottom: '0.75rem', color: 'var(--color-primary)', borderBottom: '1px solid rgba(0,92,134,0.2)', paddingBottom: '0.5rem' }}>
                    MÔ TẢ
                  </h4>
                  <p className="font-body-sm" style={{ color: 'var(--color-on-surface-variant)', lineHeight: 1.6 }}>{selectedVoucher.description}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ padding: '1.5rem', borderTop: '1px solid var(--color-outline-variant)', display: 'flex', gap: '0.75rem' }}>
              {mapApprovalStatus(selectedVoucher.approvalStatus) === 'PENDING_REVIEW' && (
                <>
                  <button
                    className="admin-btn admin-btn-danger"
                    style={{ flex: 1 }}
                    onClick={() => { setSelectedVoucher(null); openRejectModal(selectedVoucher.voucherId) }}
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
            </div>
          </div>
        </>
      )}

      {/* Reject Modal */}
      {showRejectModal && rejectTargetId !== null && (
        <>
          <div className="side-panel-overlay" onClick={() => { setShowRejectModal(false); setRejectTargetId(null) }} />
          <div className="side-panel" style={{ width: '28rem' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-outline-variant)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="font-headline-md" style={{ fontSize: '1.25rem' }}>Từ chối voucher</h3>
              <button onClick={() => { setShowRejectModal(false); setRejectTargetId(null) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-on-surface-variant)' }}>
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
                  placeholder="Nhập lý do từ chối voucher (tối thiểu 10 ký tự)..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
                <p className="font-label-sm" style={{ color: rejectReason.length < 10 ? 'var(--color-error-danger)' : 'var(--color-success-active)', marginTop: '0.25rem' }}>
                  {rejectReason.length}/10 ký tự tối thiểu
                </p>
              </div>
            </div>
            <div style={{ padding: '1.5rem', borderTop: '1px solid var(--color-outline-variant)', display: 'flex', gap: '0.75rem' }}>
              <button className="admin-btn admin-btn-ghost" style={{ flex: 1 }} onClick={() => { setShowRejectModal(false); setRejectTargetId(null) }}>
                Hủy
              </button>
              <button className="admin-btn admin-btn-danger" style={{ flex: 2 }} onClick={handleReject} disabled={rejectReason.trim().length < 10}>
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
