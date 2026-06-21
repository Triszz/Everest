import { useState } from 'react'
import { useToast } from '../components/shared/Toast'

type ActionType = 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT' | 'LOCK' | 'UNLOCK' | 'LOGIN' | 'LOGOUT' | 'PAYMENT' | 'REFUND' | 'CANCEL'
type TargetType = 'USER' | 'PARTNER' | 'VOUCHER' | 'ORDER' | 'ADMIN' | 'SYSTEM'

interface LogEntry {
  id: number
  timestamp: string
  actor: string
  actorType: 'ADMIN' | 'USER' | 'PARTNER' | 'SYSTEM'
  action: ActionType
  targetType: TargetType
  targetId: string
  description: string
  ipAddress: string
  userAgent: string
  oldValue?: string
  newValue?: string
}

const mockLogs: LogEntry[] = [
  { id: 1, timestamp: '21/06/2026 14:32:15', actor: 'Admin_Le', actorType: 'ADMIN', action: 'APPROVE', targetType: 'VOUCHER', targetId: 'VCH-2024-001', description: 'Phê duyệt voucher "Thưởng thức Cà phê Signature"', ipAddress: '192.168.1.10', userAgent: 'Chrome/125.0.0.0', oldValue: 'PENDING_REVIEW', newValue: 'PUBLISHED' },
  { id: 2, timestamp: '21/06/2026 14:28:44', actor: 'Admin_Minh', actorType: 'ADMIN', action: 'LOCK', targetType: 'USER', targetId: 'USR-12840', description: 'Khóa tài khoản "Trần Danh" do vi phạm chính sách', ipAddress: '192.168.1.15', userAgent: 'Firefox/126.0', oldValue: 'ACTIVE', newValue: 'LOCKED' },
  { id: 3, timestamp: '21/06/2026 14:15:22', actor: 'System', actorType: 'SYSTEM', action: 'CREATE', targetType: 'ORDER', targetId: 'ORD-2024-038', description: 'Tạo đơn hàng mới tự động', ipAddress: '127.0.0.1', userAgent: 'System' },
  { id: 4, timestamp: '21/06/2026 13:55:01', actor: 'Admin_Le', actorType: 'ADMIN', action: 'APPROVE', targetType: 'PARTNER', targetId: 'PAR-002', description: 'Phê duyệt đối tác "Grab Vietnam Co., Ltd"', ipAddress: '192.168.1.10', userAgent: 'Chrome/125.0.0.0', oldValue: 'PENDING', newValue: 'APPROVED' },
  { id: 5, timestamp: '21/06/2026 13:42:38', actor: 'Admin_Minh', actorType: 'ADMIN', action: 'REFUND', targetType: 'ORDER', targetId: 'ORD-2024-035', description: 'Hoàn tiền 899,000 đ cho đơn hàng #ORD-2024-035', ipAddress: '192.168.1.15', userAgent: 'Firefox/126.0', oldValue: 'PAID', newValue: 'REFUNDED' },
  { id: 6, timestamp: '21/06/2026 12:30:11', actor: 'Admin_Le', actorType: 'ADMIN', action: 'REJECT', targetType: 'VOUCHER', targetId: 'VCH-2024-007', description: 'Từ chối voucher "Gói Spa Cao Cấp 3 Ngày" — Giá bán không đủ chiết khấu', ipAddress: '192.168.1.10', userAgent: 'Chrome/125.0.0.0', oldValue: 'PENDING_REVIEW', newValue: 'REJECTED' },
  { id: 7, timestamp: '21/06/2026 11:15:55', actor: 'System', actorType: 'SYSTEM', action: 'PAYMENT', targetType: 'ORDER', targetId: 'ORD-2024-037', description: 'Thanh toán thành công qua ví điện tử', ipAddress: '127.0.0.1', userAgent: 'System' },
  { id: 8, timestamp: '21/06/2026 10:48:22', actor: 'Admin_Minh', actorType: 'ADMIN', action: 'UPDATE', targetType: 'PARTNER', targetId: 'PAR-001', description: 'Cập nhật thông tin chi nhánh "Lotte Mart Quận 7"', ipAddress: '192.168.1.15', userAgent: 'Firefox/126.0' },
  { id: 9, timestamp: '21/06/2026 09:30:00', actor: 'Admin_Le', actorType: 'ADMIN', action: 'LOGIN', targetType: 'ADMIN', targetId: 'ADM-001', description: 'Đăng nhập hệ thống quản trị', ipAddress: '192.168.1.10', userAgent: 'Chrome/125.0.0.0' },
  { id: 10, timestamp: '20/06/2026 18:20:33', actor: 'Admin_Minh', actorType: 'ADMIN', action: 'UNLOCK', targetType: 'USER', targetId: 'USR-12835', description: 'Mở khóa tài khoản "Nguyễn Thị X"', ipAddress: '192.168.1.15', userAgent: 'Firefox/126.0', oldValue: 'LOCKED', newValue: 'ACTIVE' },
  { id: 11, timestamp: '20/06/2026 17:05:19', actor: 'Admin_Le', actorType: 'ADMIN', action: 'DELETE', targetType: 'VOUCHER', targetId: 'VCH-2023-089', description: 'Xóa voucher ở trạng thái REJECTED', ipAddress: '192.168.1.10', userAgent: 'Chrome/125.0.0.0' },
  { id: 12, timestamp: '20/06/2026 15:42:08', actor: 'System', actorType: 'SYSTEM', action: 'CANCEL', targetType: 'ORDER', targetId: 'ORD-2024-030', description: 'Hệ thống tự động hủy đơn hàng do quá hạn thanh toán', ipAddress: '127.0.0.1', userAgent: 'System', oldValue: 'PENDING', newValue: 'CANCELLED' },
]

const actionConfig: Record<ActionType, { label: string; color: string; bg: string }> = {
  CREATE: { label: 'Tạo mới', color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
  UPDATE: { label: 'Cập nhật', color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
  DELETE: { label: 'Xóa', color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
  APPROVE: { label: 'Duyệt', color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
  REJECT: { label: 'Từ chối', color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
  LOCK: { label: 'Khóa', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  UNLOCK: { label: 'Mở khóa', color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
  LOGIN: { label: 'Đăng nhập', color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
  LOGOUT: { label: 'Đăng xuất', color: '#707880', bg: 'rgba(112,120,128,0.1)' },
  PAYMENT: { label: 'Thanh toán', color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
  REFUND: { label: 'Hoàn tiền', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  CANCEL: { label: 'Hủy', color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
}

const targetIcon: Record<TargetType, string> = {
  USER: 'person',
  PARTNER: 'store',
  VOUCHER: 'confirmation_number',
  ORDER: 'shopping_cart',
  ADMIN: 'admin_panel_settings',
  SYSTEM: 'computer',
}

export default function AuditLogs() {
  const { showToast } = useToast()
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState('all')
  const [targetFilter, setTargetFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null)

  const filtered = mockLogs.filter((log) => {
    const matchSearch =
      log.description.toLowerCase().includes(search.toLowerCase()) ||
      log.actor.toLowerCase().includes(search.toLowerCase()) ||
      log.targetId.toLowerCase().includes(search.toLowerCase()) ||
      log.ipAddress.includes(search)
    const matchAction = actionFilter === 'all' || log.action === actionFilter
    const matchTarget = targetFilter === 'all' || log.targetType === targetFilter
    return matchSearch && matchAction && matchTarget
  })

  const handleExport = () => {
    showToast('Đang xuất nhật ký ra file CSV...', 'info')
    setTimeout(() => showToast('Đã xuất thành công! File đã được tải về.', 'success'), 1500)
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="font-headline-lg" style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Nhật ký hệ thống</h1>
          <p className="font-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
            Truy vết toàn bộ thao tác trên hệ thống (RB-12).
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="admin-btn admin-btn-ghost" onClick={handleExport}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>file_download</span>
            Xuất CSV
          </button>
          <button className="admin-btn admin-btn-ghost" onClick={handleExport}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>table_chart</span>
            Xuất Excel
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Tổng nhật ký', value: mockLogs.length, color: '#3B82F6' },
          { label: 'Hành động hôm nay', value: mockLogs.filter((l) => l.timestamp.startsWith('21/06/2026')).length, color: '#10B981' },
          { label: 'Thao tác Admin', value: mockLogs.filter((l) => l.actorType === 'ADMIN').length, color: '#005c86' },
          { label: 'Cảnh báo', value: 0, color: '#EF4444' },
        ].map((s) => (
          <div key={s.label} className="admin-card" style={{ padding: '1rem', textAlign: 'center' }}>
            <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: '0.25rem', fontSize: '0.65rem' }}>{s.label}</p>
            <p className="font-headline-md" style={{ fontSize: '1.5rem', color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="admin-card" style={{ padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 250 }}>
            <span className="material-symbols-outlined" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-on-surface-variant)', fontSize: '18px' }}>
              search
            </span>
            <input
              className="admin-input"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Tìm mô tả, người thực hiện, ID, IP..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className="admin-input admin-select" style={{ width: 'auto' }} value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
            <option value="all">Tất cả hành động</option>
            <option value="CREATE">Tạo mới</option>
            <option value="UPDATE">Cập nhật</option>
            <option value="DELETE">Xóa</option>
            <option value="APPROVE">Duyệt</option>
            <option value="REJECT">Từ chối</option>
            <option value="LOCK">Khóa</option>
            <option value="UNLOCK">Mở khóa</option>
            <option value="PAYMENT">Thanh toán</option>
            <option value="REFUND">Hoàn tiền</option>
            <option value="CANCEL">Hủy</option>
          </select>
          <select className="admin-input admin-select" style={{ width: 'auto' }} value={targetFilter} onChange={(e) => setTargetFilter(e.target.value)}>
            <option value="all">Tất cả đối tượng</option>
            <option value="USER">Người dùng</option>
            <option value="PARTNER">Đối tác</option>
            <option value="VOUCHER">Voucher</option>
            <option value="ORDER">Đơn hàng</option>
            <option value="ADMIN">Admin</option>
            <option value="SYSTEM">Hệ thống</option>
          </select>
          <input className="admin-input" type="date" style={{ width: 'auto' }} value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          <span className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>→</span>
          <input className="admin-input" type="date" style={{ width: 'auto' }} value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </div>
      </div>

      {/* Logs Table */}
      <div className="admin-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Thời gian</th>
                <th>Người thực hiện</th>
                <th>Hành động</th>
                <th>Đối tượng</th>
                <th>Mô tả</th>
                <th>Địa chỉ IP</th>
                <th style={{ textAlign: 'right' }}>Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-on-surface-variant)' }}>
                    Không tìm thấy nhật ký nào.
                  </td>
                </tr>
              ) : (
                filtered.map((log) => {
                  const ac = actionConfig[log.action]
                  return (
                    <tr key={log.id}>
                      <td>
                        <span className="font-label-sm" style={{ color: 'var(--color-outline)', fontSize: '0.7rem', whiteSpace: 'nowrap' }}>
                          {log.timestamp}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div
                            style={{
                              width: '1.75rem', height: '1.75rem', borderRadius: '50%',
                              background: log.actorType === 'ADMIN' ? 'rgba(0,92,134,0.15)' : 'rgba(112,120,128,0.1)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '0.6rem', fontWeight: 700,
                              color: log.actorType === 'ADMIN' ? '#005c86' : '#707880',
                            }}
                          >
                            {log.actor.split('_').map((w) => w[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-body-sm" style={{ fontWeight: 600, fontSize: '0.8rem' }}>{log.actor}</p>
                            <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.6rem' }}>{log.actorType}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                            padding: '0.25rem 0.5rem', borderRadius: '9999px',
                            background: ac.bg, color: ac.color,
                            fontFamily: '"JetBrains Mono", monospace', fontSize: '0.65rem', fontWeight: 600,
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>
                            {log.action === 'APPROVE' || log.action === 'UNLOCK' ? 'check_circle' :
                             log.action === 'REJECT' || log.action === 'LOCK' || log.action === 'CANCEL' ? 'cancel' :
                             log.action === 'CREATE' ? 'add' :
                             log.action === 'DELETE' ? 'delete' :
                             log.action === 'UPDATE' ? 'edit' :
                             log.action === 'PAYMENT' ? 'payments' :
                             log.action === 'REFUND' ? 'attach_money' :
                             log.action === 'LOGIN' ? 'login' :
                             log.action === 'LOGOUT' ? 'logout' : 'history'}
                          </span>
                          {ac.label}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--color-on-surface-variant)' }}>
                            {targetIcon[log.targetType]}
                          </span>
                          <div>
                            <p className="font-body-sm" style={{ fontWeight: 600, fontSize: '0.8rem' }}>{log.targetType}</p>
                            <p className="font-label-sm" style={{ color: 'var(--color-outline)', fontSize: '0.65rem' }}>{log.targetId}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <p className="font-body-sm" style={{ fontSize: '0.8rem', lineHeight: 1.4, maxWidth: '400px' }}>
                          {log.description}
                        </p>
                      </td>
                      <td>
                        <span className="font-label-sm" style={{ color: 'var(--color-outline)', fontSize: '0.7rem' }}>{log.ipAddress}</span>
                      </td>
                      <td>
                        <button
                          className="admin-btn admin-btn-ghost"
                          style={{ padding: '0.25rem', fontSize: '0.7rem' }}
                          onClick={() => setSelectedLog(log)}
                          title="Xem chi tiết"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>info</span>
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--color-outline-variant)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p className="font-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
            Hiển thị {filtered.length} nhật ký
          </p>
          <div className="pagination">
            <button className="pagination-btn" disabled><span className="material-symbols-outlined" style={{ fontSize: '16px' }}>chevron_left</span></button>
            <button className="pagination-btn active">1</button>
            <button className="pagination-btn"><span className="material-symbols-outlined" style={{ fontSize: '16px' }}>chevron_right</span></button>
          </div>
        </div>
      </div>

      {/* Log Detail Panel */}
      {selectedLog && (
        <>
          <div className="side-panel-overlay" onClick={() => setSelectedLog(null)} />
          <div className="side-panel" style={{ width: '32rem' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-outline-variant)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="font-headline-md" style={{ fontSize: '1.25rem' }}>Chi tiết nhật ký</h3>
              <button onClick={() => setSelectedLog(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-on-surface-variant)' }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {[
                  { label: 'Mã nhật ký', value: `#LOG-${String(selectedLog.id).padStart(5, '0')}` },
                  { label: 'Thời gian', value: selectedLog.timestamp },
                  { label: 'Người thực hiện', value: selectedLog.actor },
                  { label: 'Loại actor', value: selectedLog.actorType },
                  { label: 'Hành động', value: actionConfig[selectedLog.action].label },
                  { label: 'Đối tượng', value: `${selectedLog.targetType} — ${selectedLog.targetId}` },
                  { label: 'Địa chỉ IP', value: selectedLog.ipAddress },
                  { label: 'User Agent', value: selectedLog.userAgent },
                ].map((item) => (
                  <div key={item.label} style={{ padding: '0.75rem', background: 'var(--color-surface-container-low)', borderRadius: '0.5rem' }}>
                    <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.65rem', marginBottom: '0.25rem' }}>{item.label}</p>
                    <p className="font-body-sm" style={{ fontWeight: 600, fontSize: '0.8rem', wordBreak: 'break-all' }}>{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Description */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 className="font-label-md" style={{ marginBottom: '0.5rem', color: 'var(--color-primary)', borderBottom: '1px solid rgba(0,92,134,0.2)', paddingBottom: '0.5rem' }}>
                  MÔ TẢ HÀNH ĐỘNG
                </h4>
                <p className="font-body-sm" style={{ lineHeight: 1.6, color: 'var(--color-on-surface-variant)' }}>
                  {selectedLog.description}
                </p>
              </div>

              {/* Diff */}
              {(selectedLog.oldValue || selectedLog.newValue) && (
                <div>
                  <h4 className="font-label-md" style={{ marginBottom: '0.5rem', color: 'var(--color-primary)', borderBottom: '1px solid rgba(0,92,134,0.2)', paddingBottom: '0.5rem' }}>
                    THAY ĐỔI DỮ LIỆU
                  </h4>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'stretch' }}>
                    <div style={{ flex: 1, padding: '0.75rem', background: 'rgba(239,68,68,0.08)', borderRadius: '0.5rem', border: '1px solid rgba(239,68,68,0.2)' }}>
                      <p className="font-label-sm" style={{ color: '#EF4444', fontSize: '0.65rem', marginBottom: '0.25rem' }}>TRƯỚC</p>
                      <p className="font-label-md" style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.8rem', color: '#EF4444' }}>
                        {selectedLog.oldValue || '—'}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span className="material-symbols-outlined" style={{ color: 'var(--color-on-surface-variant)', fontSize: '20px' }}>arrow_forward</span>
                    </div>
                    <div style={{ flex: 1, padding: '0.75rem', background: 'rgba(16,185,129,0.08)', borderRadius: '0.5rem', border: '1px solid rgba(16,185,129,0.2)' }}>
                      <p className="font-label-sm" style={{ color: '#10B981', fontSize: '0.65rem', marginBottom: '0.25rem' }}>SAU</p>
                      <p className="font-label-md" style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.8rem', color: '#10B981' }}>
                        {selectedLog.newValue || '—'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
