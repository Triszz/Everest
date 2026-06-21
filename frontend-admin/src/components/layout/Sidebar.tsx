import { NavLink } from 'react-router-dom'

const navItems = [
  { path: '/', label: 'Dashboard', icon: 'insights' },
  { path: '/users', label: 'Người dùng', icon: 'group' },
  { path: '/partners', label: 'Đối tác', icon: 'store' },
  { path: '/vouchers', label: 'Voucher', icon: 'confirmation_number' },
  { path: '/orders', label: 'Đơn hàng', icon: 'shopping_cart' },
  { path: '/content', label: 'Nội dung', icon: 'article' },
  { path: '/audit-logs', label: 'Nhật ký', icon: 'history_edu' },
]

export default function Sidebar() {
  return (
    <aside
      style={{
        background: 'linear-gradient(180deg, #1e293b 0%, #111c2d 100%)',
        width: '18rem',
        minHeight: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        display: 'flex',
        flexDirection: 'column',
        padding: '1rem',
        zIndex: 40,
        boxShadow: '4px 0 16px rgba(0,0,0,0.1)',
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem', padding: '0.5rem' }}>
        <div
          style={{
            width: '2.5rem',
            height: '2.5rem',
            borderRadius: '0.5rem',
            background: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span className="material-symbols-outlined" style={{ color: 'white', fontSize: '20px' }}>
            admin_panel_settings
          </span>
        </div>
        <div>
          <div className="font-headline-md" style={{ color: 'white', fontSize: '1.25rem', lineHeight: 1.2 }}>
            Admin Console
          </div>
          <div className="font-label-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Super Admin
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1 }}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
              {item.icon}
            </span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem', marginTop: '1rem' }}>
        <div style={{ padding: '0.5rem 1rem', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>
          © 2026 VoucherFlow
        </div>
      </div>
    </aside>
  )
}
