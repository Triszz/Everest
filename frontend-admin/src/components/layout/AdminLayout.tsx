import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useIsMobile } from '../../hooks/useIsMobile'

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const isMobile = useIsMobile()

  return (
    <div className="admin-layout">
      {/* Top Header */}
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '3.5rem',
          background: 'linear-gradient(135deg, #1e293b 0%, #111c2d 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1rem',
          zIndex: 45,
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        }}
      >
        <button
          onClick={() => setMobileOpen(true)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.25rem',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>
            menu
          </span>
        </button>
        <div style={{ fontWeight: 700, fontSize: '1rem', letterSpacing: '0.05em' }}>
          VoucherFlow Admin
        </div>
        <div style={{ width: '28px' }} /> {/* spacer to center */}
      </header>

      {/* Sidebar Drawer Overlay */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 49,
            backdropFilter: 'blur(2px)',
          }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      <Sidebar
        mobileOpen={mobileOpen}
        onMobileToggle={() => setMobileOpen((o) => !o)}
      />

      <main 
        className="admin-main collapsed"
        style={{
          paddingTop: '5rem',
          paddingLeft: isMobile ? '1rem' : '2rem',
          paddingRight: isMobile ? '1rem' : '2rem',
        }}
      >
        <Outlet />
      </main>
    </div>
  )
}
