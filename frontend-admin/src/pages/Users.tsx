import { useState } from 'react'
import { useToast } from '../components/shared/Toast'

type UserStatus = 'ACTIVE' | 'LOCKED' | 'SUSPENDED' | 'INACTIVE'
type UserRole = 'CUSTOMER' | 'PARTNER_STAFF' | 'ADMIN'

interface User {
  id: string
  name: string
  email: string
  phone: string
  role: UserRole
  status: UserStatus
  registeredAt: string
  lastActive: string
  orders: number
}

// Mock data
const mockUsers: User[] = [
  { id: 'USR-12842', name: 'Nguyễn Văn A', email: 'vana.nguyen@email.com', phone: '0901234567', role: 'CUSTOMER', status: 'ACTIVE', registeredAt: '12/05/2024', lastActive: '2 giờ trước', orders: 8 },
  { id: 'USR-12841', name: 'Lê Thị B', email: 'lethib@vflow.vn', phone: '0902345678', role: 'ADMIN', status: 'ACTIVE', registeredAt: '01/01/2023', lastActive: 'Vừa xong', orders: 0 },
  { id: 'USR-12840', name: 'Trần Danh', email: 'danhtran@shop.com', phone: '0903456789', role: 'PARTNER_STAFF', status: 'LOCKED', registeredAt: '15/03/2024', lastActive: '15/03/2024', orders: 3 },
  { id: 'USR-12839', name: 'Phạm Lan', email: 'lanpham@email.com', phone: '0904567890', role: 'CUSTOMER', status: 'ACTIVE', registeredAt: '20/05/2024', lastActive: 'Hôm qua', orders: 12 },
  { id: 'USR-12838', name: 'Hoàng Minh', email: 'minhhoang@gmail.com', phone: '0905678901', role: 'CUSTOMER', status: 'ACTIVE', registeredAt: '10/04/2024', lastActive: '3 giờ trước', orders: 5 },
  { id: 'USR-12837', name: 'Đỗ Thu Hà', email: 'thuha.do@email.com', phone: '0906789012', role: 'CUSTOMER', status: 'SUSPENDED', registeredAt: '05/02/2024', lastActive: '1 tuần trước', orders: 2 },
]

const statusConfig: Record<UserStatus, { label: string; cls: string }> = {
  ACTIVE: { label: 'Hoạt động', cls: 'badge-active' },
  LOCKED: { label: 'Bị khóa', cls: 'badge-locked' },
  SUSPENDED: { label: 'Tạm ngưng', cls: 'badge-pending' },
  INACTIVE: { label: 'Không hoạt động', cls: 'badge-info' },
}

const roleConfig: Record<UserRole, { label: string; bg: string; color: string }> = {
  CUSTOMER: { label: 'Customer', bg: 'rgba(0,107,95,0.1)', color: '#006b5f' },
  PARTNER_STAFF: { label: 'Partner Staff', bg: 'rgba(126,75,0,0.1)', color: '#7e4b00' },
  ADMIN: { label: 'Admin', bg: 'rgba(0,92,134,0.1)', color: '#005c86' },
}

const statusBadge = (status: UserStatus) => {
  const cfg = statusConfig[status]
  return (
    <span className={`badge ${cfg.cls}`}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
      {cfg.label}
    </span>
  )
}

export default function Users() {
  const { showToast } = useToast()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showLockModal, setShowLockModal] = useState(false)
  const [lockReason, setLockReason] = useState('')

  const filtered = mockUsers.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.includes(search) ||
      u.id.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === 'all' || u.role === roleFilter
    const matchStatus = statusFilter === 'all' || u.status === statusFilter
    return matchSearch && matchRole && matchStatus
  })

  const handleLock = () => {
    if (!selectedUser || !lockReason.trim()) return
    showToast(`Đã khóa tài khoản ${selectedUser.id} — ${lockReason}`, 'warning')
    setShowLockModal(false)
    setSelectedUser(null)
    setLockReason('')
  }

  const handleUnlock = (user: User) => {
    showToast(`Đã mở khóa tài khoản ${user.id}`, 'success')
  }

  const handleChangeRole = (user: User, role: UserRole) => {
    if (role === 'ADMIN') {
      showToast('Không thể tự phân quyền Admin cho người dùng.', 'error')
      return
    }
    showToast(`Đã cập nhật vai trò ${user.id} → ${roleConfig[role].label}`, 'success')
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="font-headline-lg" style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Quản lý người dùng</h1>
          <p className="font-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
            Tra cứu, khóa/mở khóa và phân quyền người dùng trên hệ thống.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="admin-btn admin-btn-ghost">
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>file_download</span>
            Xuất báo cáo
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Tổng người dùng', value: '12,842', color: '#3B82F6' },
          { label: 'Đang hoạt động', value: '11,204', color: '#10B981' },
          { label: 'Tài khoản bị khóa', value: '24', color: '#EF4444' },
          { label: 'Staff Online', value: '12', color: '#005c86' },
        ].map((s) => (
          <div key={s.label} className="admin-card" style={{ padding: '1rem', textAlign: 'center' }}>
            <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: '0.25rem' }}>{s.label}</p>
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
              placeholder="Tìm kiếm tên, email, SĐT, ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className="admin-input admin-select" style={{ width: 'auto' }} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="all">Tất cả vai trò</option>
            <option value="CUSTOMER">Customer</option>
            <option value="PARTNER_STAFF">Partner Staff</option>
            <option value="ADMIN">Admin</option>
          </select>
          <select className="admin-input admin-select" style={{ width: 'auto' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">Trạng thái: Tất cả</option>
            <option value="ACTIVE">Hoạt động</option>
            <option value="LOCKED">Bị khóa</option>
            <option value="SUSPENDED">Tạm ngưng</option>
            <option value="INACTIVE">Không hoạt động</option>
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
                <th>Người dùng</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>Đơn hàng</th>
                <th>Ngày đăng ký</th>
                <th>Hoạt động cuối</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-on-surface-variant)' }}>
                    Không tìm thấy người dùng nào.
                  </td>
                </tr>
              ) : (
                filtered.map((user) => {
                  const rc = roleConfig[user.role]
                  return (
                    <tr key={user.id}>
                      <td>
                        <span className="font-label-sm" style={{ color: 'var(--color-outline)', fontSize: '0.7rem' }}>{user.id}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div
                            style={{
                              width: '2.25rem',
                              height: '2.25rem',
                              borderRadius: '50%',
                              background: rc.bg,
                              color: rc.color,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '0.8rem',
                              flexShrink: 0,
                            }}
                          >
                            {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-body-sm" style={{ fontWeight: 600 }}>{user.name}</p>
                            <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.65rem' }}>{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          style={{
                            padding: '0.125rem 0.5rem',
                            borderRadius: '0.25rem',
                            background: rc.bg,
                            color: rc.color,
                            fontFamily: '"JetBrains Mono", monospace',
                            fontSize: '0.65rem',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                          }}
                        >
                          {rc.label}
                        </span>
                      </td>
                      <td>{statusBadge(user.status)}</td>
                      <td>
                        <span className="font-label-md">{user.orders}</span>
                      </td>
                      <td>
                        <span className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>{user.registeredAt}</span>
                      </td>
                      <td>
                        <span className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>{user.lastActive}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'flex-end' }}>
                          {user.status === 'LOCKED' ? (
                            <button
                              className="admin-btn admin-btn-success"
                              style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}
                              onClick={() => handleUnlock(user)}
                              title="Mở khóa"
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>lock_open</span>
                            </button>
                          ) : (
                            <button
                              className="admin-btn admin-btn-danger"
                              style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}
                              onClick={() => { setSelectedUser(user); setShowLockModal(true) }}
                              title="Khóa"
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>block</span>
                            </button>
                          )}
                          <select
                            className="admin-input admin-select"
                            style={{ width: 'auto', padding: '0.375rem 2rem 0.375rem 0.5rem', fontSize: '0.7rem' }}
                            value={user.role}
                            onChange={(e) => handleChangeRole(user, e.target.value as UserRole)}
                          >
                            <option value="CUSTOMER">Customer</option>
                            <option value="PARTNER_STAFF">Partner Staff</option>
                            <option value="ADMIN">Admin</option>
                          </select>
                        </div>
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
            Hiển thị 1-{Math.min(10, filtered.length)} trên tổng số {mockUsers.length} người dùng
          </p>
          <div className="pagination">
            <button className="pagination-btn" disabled>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>chevron_left</span>
            </button>
            <button className="pagination-btn active">1</button>
            <button className="pagination-btn">2</button>
            <button className="pagination-btn">3</button>
            <span className="font-label-sm" style={{ color: 'var(--color-outline)', padding: '0 0.25rem' }}>...</span>
            <button className="pagination-btn">1284</button>
            <button className="pagination-btn">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Lock Modal */}
      {showLockModal && selectedUser && (
        <>
          <div className="side-panel-overlay" onClick={() => setShowLockModal(false)} />
          <div className="side-panel" style={{ width: '28rem' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-outline-variant)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="font-headline-md" style={{ fontSize: '1.25rem' }}>Khóa tài khoản</h3>
              <button
                onClick={() => setShowLockModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-on-surface-variant)' }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div style={{ padding: '1.5rem', flex: 1 }}>
              <div style={{ padding: '1rem', background: 'var(--color-error-container)', borderRadius: '0.75rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--color-error-danger)', fontSize: '24px' }}>warning</span>
                <p className="font-body-sm" style={{ color: 'var(--color-on-error-container)' }}>
                  Tài khoản <strong>{selectedUser.id}</strong> sẽ bị khóa và không thể đăng nhập.
                </p>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label className="font-label-sm" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-on-surface-variant)' }}>
                  Lý do khóa <span style={{ color: 'var(--color-error-danger)' }}>*</span>
                </label>
                <textarea
                  className="admin-input"
                  style={{ resize: 'vertical', minHeight: '100px' }}
                  placeholder="Nhập lý do khóa tài khoản..."
                  value={lockReason}
                  onChange={(e) => setLockReason(e.target.value)}
                />
              </div>
            </div>
            <div style={{ padding: '1.5rem', borderTop: '1px solid var(--color-outline-variant)', display: 'flex', gap: '0.75rem' }}>
              <button className="admin-btn admin-btn-ghost" style={{ flex: 1 }} onClick={() => setShowLockModal(false)}>
                Hủy
              </button>
              <button
                className="admin-btn admin-btn-danger"
                style={{ flex: 2 }}
                onClick={handleLock}
                disabled={!lockReason.trim()}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>block</span>
                Xác nhận khóa
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
