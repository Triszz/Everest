import { useState } from 'react'
import { useToast } from '../components/shared/Toast'

type PartnerStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'LOCKED' | 'INACTIVE'

interface Branch {
  id: string
  name: string
  address: string
  province: string
  status: 'ACTIVE' | 'INACTIVE'
}

interface Partner {
  id: string
  businessName: string
  taxCode: string
  representative: string
  repPhone: string
  repEmail: string
  field: string
  status: PartnerStatus
  vouchers: number
  registeredAt: string
  branches: Branch[]
}

const mockPartners: Partner[] = [
  {
    id: 'PAR-001', businessName: 'Lotte Mart Vietnam', taxCode: '0304741634',
    representative: 'Nguyễn Văn A', repPhone: '0901234567', repEmail: 'a.nguyen@lotte.vn',
    field: 'Bán lẻ', status: 'PENDING', vouchers: 45, registeredAt: '24/05/2024',
    branches: [
      { id: 'BR-001', name: 'Lotte Mart Quận 7 (Flagship)', address: '469 Nguyễn Hữu Thọ, Q.7', province: 'TP. HCM', status: 'ACTIVE' },
      { id: 'BR-002', name: 'Lotte Mart Gò Vấp', address: '123 Nguyễn Oanh, Gò Vấp', province: 'TP. HCM', status: 'ACTIVE' },
    ],
  },
  {
    id: 'PAR-002', businessName: 'Grab Vietnam Co., Ltd', taxCode: '0312650437',
    representative: 'Trần Thị B', repPhone: '0902345678', repEmail: 'b.tran@grab.vn',
    field: 'Vận tải', status: 'APPROVED', vouchers: 120, registeredAt: '15/05/2024',
    branches: [
      { id: 'BR-003', name: 'Grab Head Office', address: '254 Nguyễn Văn Trỗi, Q.Phú Nhuận', province: 'TP. HCM', status: 'ACTIVE' },
    ],
  },
  {
    id: 'PAR-003', businessName: 'The Coffee House', taxCode: '0312847526',
    representative: 'Lê Văn C', repPhone: '0903456789', repEmail: 'c.le@coffeehouse.vn',
    field: 'F&B', status: 'LOCKED', vouchers: 0, registeredAt: '10/04/2024',
    branches: [],
  },
  {
    id: 'PAR-004', businessName: 'California Fitness', taxCode: '0312998765',
    representative: 'Phạm Duy D', repPhone: '0904567890', repEmail: 'd.pham@california.vn',
    field: 'Thể hình', status: 'APPROVED', vouchers: 30, registeredAt: '01/03/2024',
    branches: [
      { id: 'BR-004', name: 'California Fitness District 7', address: '88 Đường số 7, Q.7', province: 'TP. HCM', status: 'ACTIVE' },
    ],
  },
  {
    id: 'PAR-005', businessName: 'Lotus Wellness Center', taxCode: '0312109876',
    representative: 'Trần Thị E', repPhone: '0905678901', repEmail: 'e.tran@lotuswellness.vn',
    field: 'Làm đẹp & Spa', status: 'PENDING', vouchers: 28, registeredAt: '28/05/2024',
    branches: [],
  },
]

const statusConfig: Record<PartnerStatus, { label: string; cls: string }> = {
  PENDING: { label: 'Chờ duyệt', cls: 'badge-pending' },
  APPROVED: { label: 'Đã duyệt', cls: 'badge-active' },
  REJECTED: { label: 'Từ chối', cls: 'badge-locked' },
  LOCKED: { label: 'Bị khóa', cls: 'badge-locked' },
  INACTIVE: { label: 'Không hoạt động', cls: 'badge-info' },
}

export default function Partners() {
  const { showToast } = useToast()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectTarget, setRejectTarget] = useState<{ id: string; action: 'REJECT' | 'LOCK' } | null>(null)

  const filtered = mockPartners.filter((p) => {
    const matchSearch =
      p.businessName.toLowerCase().includes(search.toLowerCase()) ||
      p.taxCode.includes(search) ||
      p.representative.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || p.status === statusFilter
    return matchSearch && matchStatus
  })

  const handleApprove = (partner: Partner) => {
    showToast(`Đã phê duyệt đối tác ${partner.businessName} — Đã gửi thông báo.`, 'success')
  }

  const handleReject = () => {
    if (!rejectTarget || !rejectReason.trim()) return
    showToast(`Đã từ chối đối tác ${rejectTarget.id} — ${rejectReason}`, 'warning')
    setShowRejectModal(false)
    setRejectTarget(null)
    setRejectReason('')
  }

  const openReject = (partner: Partner, action: 'REJECT' | 'LOCK') => {
    setRejectTarget({ id: partner.id, action })
    setShowRejectModal(true)
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="font-headline-lg" style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Quản lý đối tác</h1>
          <p className="font-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
            Duyệt hồ sơ, quản lý chi nhánh và trạng thái đối tác.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div className="admin-card" style={{ padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--color-warning-pending)', fontSize: '20px' }}>pending_actions</span>
            <div>
              <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.65rem' }}>ĐANG CHỜ</p>
              <p className="font-headline-md" style={{ fontSize: '1.25rem' }}>{mockPartners.filter(p => p.status === 'PENDING').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Tổng đối tác', value: '128', color: '#3B82F6' },
          { label: 'Chờ duyệt', value: '12', color: '#F59E0B' },
          { label: 'Đã duyệt', value: '98', color: '#10B981' },
          { label: 'Bị khóa', value: '5', color: '#EF4444' },
          { label: 'Tổng voucher', value: '1,250', color: '#005c86' },
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
              placeholder="Tìm kiếm tên doanh nghiệp, MST, người đại diện..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className="admin-input admin-select" style={{ width: 'auto' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">Tất cả trạng thái</option>
            <option value="PENDING">Chờ duyệt</option>
            <option value="APPROVED">Đã duyệt</option>
            <option value="REJECTED">Từ chối</option>
            <option value="LOCKED">Bị khóa</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="admin-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên doanh nghiệp</th>
                <th>Người đại diện</th>
                <th>Lĩnh vực</th>
                <th>Trạng thái</th>
                <th>Voucher</th>
                <th>Ngày đăng ký</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((partner) => {
                const sc = statusConfig[partner.status]
                return (
                  <tr key={partner.id}>
                    <td><span className="font-label-sm" style={{ color: 'var(--color-outline)', fontSize: '0.7rem' }}>{partner.id}</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          style={{
                            width: '2.25rem', height: '2.25rem', borderRadius: '0.5rem',
                            background: 'var(--color-secondary-container)', color: 'var(--color-on-secondary-container)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 700, fontSize: '0.8rem', flexShrink: 0,
                          }}
                        >
                          {partner.businessName[0]}
                        </div>
                        <div>
                          <p className="font-body-sm" style={{ fontWeight: 600 }}>{partner.businessName}</p>
                          <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.65rem' }}>MST: {partner.taxCode}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <p className="font-body-sm">{partner.representative}</p>
                      <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.65rem' }}>{partner.repPhone}</p>
                    </td>
                    <td><span className="font-body-sm">{partner.field}</span></td>
                    <td>
                      <span className={`badge ${sc.cls}`}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
                        {sc.label}
                      </span>
                    </td>
                    <td><span className="font-label-md">{partner.vouchers}</span></td>
                    <td><span className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>{partner.registeredAt}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'flex-end' }}>
                        <button
                          className="admin-btn admin-btn-ghost"
                          style={{ padding: '0.375rem 0.625rem', fontSize: '0.75rem' }}
                          onClick={() => setSelectedPartner(partner)}
                          title="Xem chi tiết"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>visibility</span>
                          Chi tiết
                        </button>
                        {partner.status === 'PENDING' && (
                          <>
                            <button
                              className="admin-btn admin-btn-success"
                              style={{ padding: '0.375rem 0.625rem', fontSize: '0.75rem' }}
                              onClick={() => handleApprove(partner)}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check</span>
                              Duyệt
                            </button>
                            <button
                              className="admin-btn admin-btn-danger"
                              style={{ padding: '0.375rem 0.625rem', fontSize: '0.75rem' }}
                              onClick={() => openReject(partner, 'REJECT')}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
                            </button>
                          </>
                        )}
                        {partner.status === 'APPROVED' && (
                          <button
                            className="admin-btn admin-btn-danger"
                            style={{ padding: '0.375rem 0.625rem', fontSize: '0.75rem' }}
                            onClick={() => openReject(partner, 'LOCK')}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>block</span>
                            Khóa
                          </button>
                        )}
                        {partner.status === 'LOCKED' && (
                          <button
                            className="admin-btn admin-btn-success"
                            style={{ padding: '0.375rem 0.625rem', fontSize: '0.75rem' }}
                            onClick={() => showToast(`Đã mở khóa đối tác ${partner.id}`, 'success')}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>lock_open</span>
                            Mở khóa
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
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--color-outline-variant)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p className="font-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
            Hiển thị 1-{Math.min(10, filtered.length)} trên tổng số {mockPartners.length} đối tác
          </p>
          <div className="pagination">
            <button className="pagination-btn" disabled><span className="material-symbols-outlined" style={{ fontSize: '16px' }}>chevron_left</span></button>
            <button className="pagination-btn active">1</button>
            <button className="pagination-btn"><span className="material-symbols-outlined" style={{ fontSize: '16px' }}>chevron_right</span></button>
          </div>
        </div>
      </div>

      {/* Partner Detail Panel */}
      {selectedPartner && (
        <>
          <div className="side-panel-overlay" onClick={() => setSelectedPartner(null)} />
          <div className="side-panel">
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-outline-variant)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '3rem', height: '3rem', borderRadius: '0.5rem', background: 'var(--color-secondary-container)', color: 'var(--color-on-secondary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.25rem' }}>
                  {selectedPartner.businessName[0]}
                </div>
                <div>
                  <h3 className="font-headline-md" style={{ fontSize: '1.25rem' }}>{selectedPartner.businessName}</h3>
                  <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.65rem' }}>Đăng ký {selectedPartner.registeredAt}</p>
                </div>
              </div>
              <button onClick={() => setSelectedPartner(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-on-surface-variant)' }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
              {/* Info Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                  { label: 'Mã số thuế', value: selectedPartner.taxCode },
                  { label: 'Lĩnh vực', value: selectedPartner.field },
                  { label: 'Trạng thái', value: '' },
                ].map((item) => (
                  <div key={item.label}>
                    <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: '0.25rem', fontSize: '0.65rem' }}>{item.label}</p>
                    {item.label === 'Trạng thái' ? (
                      <span className={`badge ${statusConfig[selectedPartner.status].cls}`}>
                        {statusConfig[selectedPartner.status].label}
                      </span>
                    ) : (
                      <p className="font-body-md" style={{ fontWeight: 500 }}>{item.value}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Representative */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 className="font-label-md" style={{ marginBottom: '0.75rem', color: 'var(--color-primary)', borderBottom: '1px solid rgba(0,92,134,0.2)', paddingBottom: '0.5rem' }}>NGƯỜI ĐẠI DIỆN</h4>
                <div style={{ background: 'var(--color-surface-container-low)', padding: '1rem', borderRadius: '0.75rem' }}>
                  <p className="font-body-md" style={{ fontWeight: 600 }}>{selectedPartner.representative}</p>
                  <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>mail</span>
                      {selectedPartner.repEmail}
                    </p>
                    <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>call</span>
                      {selectedPartner.repPhone}
                    </p>
                  </div>
                </div>
              </div>

              {/* Branches */}
              <div>
                <h4 className="font-label-md" style={{ marginBottom: '0.75rem', color: 'var(--color-primary)', borderBottom: '1px solid rgba(0,92,134,0.2)', paddingBottom: '0.5rem' }}>
                  CHI NHÁNH ({selectedPartner.branches.length})
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {selectedPartner.branches.length === 0 ? (
                    <p className="font-body-sm" style={{ color: 'var(--color-on-surface-variant)', textAlign: 'center', padding: '1rem' }}>
                      Chưa có chi nhánh nào
                    </p>
                  ) : (
                    selectedPartner.branches.map((branch) => (
                      <div key={branch.id} style={{ padding: '0.75rem', background: 'var(--color-surface-container-low)', borderRadius: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <p className="font-body-sm" style={{ fontWeight: 600 }}>{branch.name}</p>
                          <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.65rem' }}>{branch.address}</p>
                        </div>
                        <span className={`badge ${branch.status === 'ACTIVE' ? 'badge-active' : 'badge-info'}`} style={{ fontSize: '0.6rem' }}>
                          {branch.status === 'ACTIVE' ? 'Hoạt động' : 'Ngừng'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ padding: '1.5rem', borderTop: '1px solid var(--color-outline-variant)', display: 'flex', gap: '0.75rem' }}>
              <button
                className="admin-btn admin-btn-danger"
                style={{ flex: 1 }}
                onClick={() => {
                  setSelectedPartner(null)
                  openReject(selectedPartner, selectedPartner.status === 'APPROVED' ? 'LOCK' : 'REJECT')
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>block</span>
                {selectedPartner.status === 'PENDING' ? 'Từ chối' : 'Khóa đối tác'}
              </button>
              <button
                className="admin-btn admin-btn-success"
                style={{ flex: 2 }}
                onClick={() => { handleApprove(selectedPartner); setSelectedPartner(null) }}
                disabled={selectedPartner.status !== 'PENDING'}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check_circle</span>
                Phê duyệt đối tác
              </button>
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
              <h3 className="font-headline-md" style={{ fontSize: '1.25rem' }}>
                {rejectTarget.action === 'LOCK' ? 'Khóa đối tác' : 'Từ chối đối tác'}
              </h3>
              <button onClick={() => { setShowRejectModal(false); setRejectTarget(null) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-on-surface-variant)' }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div style={{ padding: '1.5rem', flex: 1 }}>
              <div style={{ marginBottom: '1rem' }}>
                <label className="font-label-sm" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-on-surface-variant)' }}>
                  Lý do <span style={{ color: 'var(--color-error-danger)' }}>*</span>
                </label>
                <textarea
                  className="admin-input"
                  style={{ resize: 'vertical', minHeight: '100px' }}
                  placeholder="Nhập lý do từ chối/khóa đối tác..."
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
                Xác nhận {rejectTarget.action === 'LOCK' ? 'khóa' : 'từ chối'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
