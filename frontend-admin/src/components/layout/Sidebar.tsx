import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'

const navItems = [
  { path: '/', label: 'Dashboard', icon: 'insights' },
  { path: '/users', label: 'Người dùng', icon: 'group' },
  { path: '/partners', label: 'Đối tác', icon: 'store' },
  { path: '/vouchers', label: 'Voucher', icon: 'confirmation_number' },
  { path: '/orders', label: 'Đơn hàng', icon: 'shopping_cart' },
  { path: '/content', label: 'Nội dung', icon: 'article' },
  { path: '/audit-logs', label: 'Nhật ký', icon: 'history_edu' },
]

interface SidebarProps {
  mobileOpen: boolean
  onMobileToggle: () => void
}

export default function Sidebar({ mobileOpen, onMobileToggle }: SidebarProps) {
  const { user, logout } = useAuth()
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  const sidebarStyle: React.CSSProperties = {
    background: 'linear-gradient(180deg, #1e293b 0%, #111c2d 100%)',
    width: '18rem',
    minHeight: '100vh',
    position: 'fixed',
    left: mobileOpen ? 0 : '-18rem',
    top: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    padding: '1rem',
    zIndex: 50,
    boxShadow: '4px 0 16px rgba(0,0,0,0.2)',
    transition: 'left 0.25s ease',
    overflow: 'hidden',
  }

  return (
    <>
      {/* Sidebar */}
      <aside style={sidebarStyle}>
        {/* Logo / User */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '2rem',
          padding: '0.5rem',
          overflow: 'hidden',
          justifyContent: 'flex-start',
          position: 'relative',
        }}>
          <div
            style={{
              width: '2.25rem',
              height: '2.25rem',
              borderRadius: '0.5rem',
              background: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span className="material-symbols-outlined" style={{ color: 'white', fontSize: '18px' }}>
              admin_panel_settings
            </span>
          </div>
          <div style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
            <div style={{
              color: 'white', fontSize: '1rem', lineHeight: 1.2,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }} title={user?.fullName || 'Admin Console'}>
              {user?.fullName || 'Admin Console'}
            </div>
            <div style={{
              color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }} title={user?.email || 'System Administrator'}>
              {user?.email || 'System Administrator'}
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          {navItems.map((item) => (
            <div key={item.path} style={{ position: 'relative' }}>
              <NavLink
                to={item.path}
                end={item.path === '/'}
                onClick={() => {
                  if (mobileOpen) {
                    onMobileToggle()
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.625rem 1rem',
                  borderRadius: '0.5rem',
                  color: 'rgba(255,255,255,0.7)',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  transition: 'all 0.15s',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  justifyContent: 'flex-start',
                }}
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                onMouseEnter={() => setHoveredItem(item.path)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px', flexShrink: 0 }}>
                  {item.icon}
                </span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.label}
                </span>
              </NavLink>
            </div>
          ))}

          {/* Logout */}
          <div style={{ marginTop: 'auto', position: 'relative' }}>
            <button
              onClick={() => {
                logout()
                if (mobileOpen) {
                  onMobileToggle()
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.625rem 1rem',
                borderRadius: '0.5rem',
                color: '#fca5a5',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: '0.875rem',
                transition: 'all 0.15s',
                justifyContent: 'flex-start',
                width: '100%',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239, 68, 68, 0.1)'; (e.currentTarget as HTMLButtonElement).style.color = '#f87171' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = '#fca5a5' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px', flexShrink: 0 }}>
                logout
              </span>
              <span>Đăng xuất</span>
            </button>
          </div>
        </nav>

        {/* Footer */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem', marginTop: '1rem' }}>
          <div style={{ padding: '0.5rem 1rem', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>
            © 2026 VoucherFlow
          </div>
        </div>
      </aside>
    </>
  )
}
