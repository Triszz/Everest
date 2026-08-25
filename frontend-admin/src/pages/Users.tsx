import { useUsersManagement } from '../hooks/useUsersManagement'
import { useToast } from '../components/shared/Toast'
import type { UserResponse, UserRole, AccountStatus } from '../services/admin.service'
import { useIsMobile } from '../hooks/useIsMobile'

// ── Config ────────────────────────────────────────────────────────────────────

const statusConfig: Record<AccountStatus, { label: string; cls: string }> = {
  Active: { label: 'Hoạt động', cls: 'badge-active' },
  Banned: { label: 'Bị khóa', cls: 'badge-locked' },
}

const roleConfig: Record<UserRole, { label: string; bg: string; color: string }> = {
  Customer: { label: 'Customer', bg: 'rgba(0,107,95,0.1)', color: '#006b5f' },
  Partner_Owner: { label: 'Partner Owner', bg: 'rgba(126,75,0,0.1)', color: '#7e4b00' },
  Partner_Cashier: { label: 'Partner Cashier', bg: 'rgba(126,75,0,0.1)', color: '#7e4b00' },
  Admin: { label: 'Admin', bg: 'rgba(0,92,134,0.1)', color: '#005c86' },
}

function statusBadge(status: AccountStatus) {
  if (status === 'Active') return null;
  const cfg = statusConfig[status];
  return (
    <span className={`badge ${cfg.cls}`}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
      {cfg.label}
    </span>
  );
}

function roleChip(role: UserRole) {
  const cfg = roleConfig[role]
  return (
    <span
      style={{
        padding: '0.125rem 0.5rem',
        borderRadius: '0.25rem',
        background: cfg.bg,
        color: cfg.color,
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: '0.65rem',
        fontWeight: 600,
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
      }}
    >
      {cfg.label}
    </span>
  )
}

function avatar(name: string | null | undefined, role: UserRole) {
  const initials = (name ?? '')
    .split(' ')
    .filter((n) => n.length > 0)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  const cfg = roleConfig[role]
  return (
    <div
      style={{
        width: '2.25rem',
        height: '2.25rem',
        borderRadius: '50%',
        background: cfg.bg,
        color: cfg.color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: '0.8rem',
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  )
}

function formatDate(iso: string) {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(iso))
}

function UserCard({
  user,
  onToggleLock,
  onChangeRole,
}: {
  user: UserResponse
  onToggleLock: (user: UserResponse) => void
  onChangeRole: (user: UserResponse, role: UserRole) => void
}) {
  return (
    <div className="admin-card" style={{ padding: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', minWidth: 0 }}>
          {avatar(user.fullName, user.role)}
          <div style={{ minWidth: 0 }}>
            <p className="font-body-sm" style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.875rem' }}>{user.fullName}</p>
            <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.6rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
            {user.phoneNumber && (
              <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.6rem' }}>{user.phoneNumber}</p>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem', flexShrink: 0 }}>
          {roleChip(user.role)}
          {statusBadge(user.status) || <span className="badge badge-active">Hoạt động</span>}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(191, 199, 208, 0.1)', paddingTop: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <span className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.65rem' }}>
          Đăng ký: {formatDate(user.createdAt)}
        </span>
        <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {user.status === 'Banned' ? (
            <button
              className="admin-btn admin-btn-success"
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', height: '1.75rem' }}
              onClick={() => onToggleLock(user)}
              title="Mở khóa"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>lock_open</span>
            </button>
          ) : (
            <button
              className="admin-btn admin-btn-danger"
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', height: '1.75rem' }}
              onClick={() => onToggleLock(user)}
              title="Khóa"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>block</span>
            </button>
          )}

          {user.role === 'Partner_Owner' || user.role === 'Partner_Cashier' ? null : (
            <select
              className="admin-input admin-select"
              style={{ width: 'auto', padding: '0.25rem 1.75rem 0.25rem 0.5rem', fontSize: '0.7rem', height: '1.75rem' }}
              value={user.role}
              onChange={(e) => onChangeRole(user, e.target.value as UserRole)}
            >
              <option value="Customer">Customer</option>
              <option value="Admin">Admin</option>
            </select>
          )}

          <button
            className="admin-btn admin-btn-ghost"
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', height: '1.75rem' }}
            onClick={() => window.location.assign(`/orders?userId=${user.userId}`)}
          >
            Đơn hàng
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Users() {
  const { showToast } = useToast()
  const isMobile = useIsMobile()
  const {
    users,
    total,
    page,
    totalPages,
    filters,
    isLoading,
    error,
    fetchUsers,
    toggleUserLock,
    updateUserRole,
    updateFilters,
  } = useUsersManagement()

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleToggleLock = async (user: UserResponse) => {
    try {
      const action = user.status === 'Banned' ? 'mở khóa' : 'khóa'
      await toggleUserLock(user.userId, user.status)
      showToast(`Đã ${action} tài khoản ${user.fullName}`, 'success')
    } catch {
      showToast('Không thể thay đổi trạng thái tài khoản. Vui lòng thử lại.', 'error')
    }
  }

  const handleChangeRole = async (user: UserResponse, newRole: UserRole) => {
    if (user.role === 'Partner_Owner' || user.role === 'Partner_Cashier') return
    if (newRole === 'Partner_Owner' || newRole === 'Partner_Cashier') {
      showToast('Chỉ có thể chọn Admin hoặc Customer cho tài khoản này.', 'error')
      return
    }
    if (newRole === user.role) return
    try {
      await updateUserRole(user.userId, newRole)
      showToast(`Đã cập nhật vai trò thành ${roleConfig[newRole].label}`, 'success')
    } catch {
      showToast('Không thể cập nhật vai trò. Vui lòng thử lại.', 'error')
    }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="font-headline-lg" style={{ fontSize: isMobile ? '1.5rem' : '2rem', marginBottom: '0.25rem' }}>Quản lý người dùng</h1>
          <p className="font-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
            Tra cứu, khóa/mở khóa và phân quyền người dùng trên hệ thống.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-card" style={{ padding: isMobile ? '0.75rem' : '1rem', marginBottom: '1rem' }}>
        <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-row'} gap-2`}>
          <div style={{ position: 'relative', flex: 1 }}>
            <span className="material-symbols-outlined" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-on-surface-variant)', fontSize: '18px' }}>
              search
            </span>
            <input
              className="admin-input"
              style={{ paddingLeft: '2.5rem', width: '100%' }}
              placeholder="Tìm kiếm tên, email, SĐT..."
              value={filters.search}
              onChange={(e) => updateFilters({ search: e.target.value })}
            />
          </div>
          <select
            className="admin-input admin-select"
            value={filters.role}
            onChange={(e) => updateFilters({ role: e.target.value as UserRole | '' })}
          >
            <option value="">Tất cả vai trò</option>
            <option value="Customer">Customer</option>
            <option value="Partner_Owner">Partner Owner</option>
            <option value="Partner_Cashier">Partner Cashier</option>
            <option value="Admin">Admin</option>
          </select>
          <select
            className="admin-input admin-select"
            value={filters.status}
            onChange={(e) => updateFilters({ status: e.target.value as AccountStatus | '' })}
          >
            <option value="">Trạng thái: Tất cả</option>
            <option value="Active">Hoạt động</option>
            <option value="Banned">Bị khóa</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {error && (
        <div style={{ padding: '1rem', background: 'var(--color-error-container)', color: 'var(--color-error-danger)', borderRadius: '0.5rem', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-on-surface-variant)' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '2rem', animation: 'spin 1s linear infinite' }}>progress_activity</span>
          <p style={{ marginTop: '0.5rem' }}>Đang tải...</p>
        </div>
      ) : (users ?? []).length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-on-surface-variant)', background: 'var(--color-surface-container-lowest)', borderRadius: '0.75rem', border: '1px solid var(--color-outline-variant)' }}>
          Không tìm thấy người dùng nào.
        </div>
      ) : isMobile ? (
        /* Mobile Cards List */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '1.5rem' }}>
          {(users ?? []).map((user) => (
            <UserCard
              key={user.userId}
              user={user}
              onToggleLock={handleToggleLock}
              onChangeRole={handleChangeRole}
            />
          ))}
        </div>
      ) : (
        /* Desktop Table */
        <div className="admin-card" style={{ overflow: 'hidden', marginBottom: '1.5rem' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ minWidth: '100px' }}>ID</th>
                  <th style={{ minWidth: '220px' }}>Người dùng</th>
                  <th style={{ minWidth: '140px' }}>Vai trò</th>
                  <th style={{ minWidth: '100px' }}>Trạng thái</th>
                  <th style={{ minWidth: '120px' }}>Ngày đăng ký</th>
                  <th style={{ textAlign: 'right', minWidth: '280px' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {(users ?? []).map((user) => (
                  <tr key={user.userId}>
                    <td>
                      <span className="font-label-sm" style={{ color: 'var(--color-outline)', fontSize: '0.7rem' }}>
                        {user.userId.slice(0, 8)}...
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {avatar(user.fullName, user.role)}
                        <div>
                          <p className="font-body-sm" style={{ fontWeight: 600 }}>{user.fullName}</p>
                          <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.65rem' }}>{user.email}</p>
                          {user.phoneNumber && (
                            <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.65rem' }}>{user.phoneNumber}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>{roleChip(user.role)}</td>
                    <td>{statusBadge(user.status)}</td>
                    <td>
                      <span className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>{formatDate(user.createdAt)}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        {user.status === 'Banned' ? (
                          <button
                            className="admin-btn admin-btn-success"
                            style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}
                            onClick={() => handleToggleLock(user)}
                            title="Mở khóa"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>lock_open</span>
                          </button>
                        ) : (
                          <button
                            className="admin-btn admin-btn-danger"
                            style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}
                            onClick={() => handleToggleLock(user)}
                            title="Khóa"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>block</span>
                          </button>
                        )}
                        {user.role === 'Partner_Owner' || user.role === 'Partner_Cashier' ? (
                          roleChip(user.role)
                        ) : (
                          <select
                            className="admin-input admin-select"
                            style={{ width: 'auto', padding: '0.375rem 2rem 0.375rem 0.5rem', fontSize: '0.7rem' }}
                            value={user.role}
                            onChange={(e) => handleChangeRole(user, e.target.value as UserRole)}
                          >
                            <option value="Customer">Customer</option>
                            <option value="Admin">Admin</option>
                          </select>
                        )}
                        <button
                          className="admin-btn admin-btn-ghost"
                          style={{ padding: '0.375rem 0.625rem', fontSize: '0.7rem' }}
                          onClick={() => window.location.assign(`/orders?userId=${user.userId}`)}
                          title="Xem đơn hàng"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>receipt_long</span>
                          Đơn hàng
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

      {/* Pagination (Common) */}
      {!isLoading && (users ?? []).length > 0 && (
        <div className="admin-card" style={{ padding: isMobile ? '0.75rem' : '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <p className="font-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
            Hiển thị {(users ?? []).length} trên tổng số {(total ?? 0).toLocaleString('vi-VN')} người dùng
          </p>
          <div className="pagination">
            <button
              className="pagination-btn"
              disabled={page <= 1}
              onClick={() => fetchUsers(page - 1)}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>chevron_left</span>
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const start = Math.max(1, page - 2)
              const num = start + i
              if (num > totalPages) return null
              return (
                <button
                  key={num}
                  className={`pagination-btn ${num === page ? 'active' : ''}`}
                  onClick={() => fetchUsers(num)}
                >
                  {num}
                </button>
              )
            })}
            <button
              className="pagination-btn"
              disabled={page >= totalPages}
              onClick={() => fetchUsers(page + 1)}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>chevron_right</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
