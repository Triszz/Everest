import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import LogoImg from '../assets/images/Logo.png';
import { cartApi, type User } from '../services';
import { NotificationBell } from './NotificationBell';

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check login status
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }
  }, [location.pathname]);

  // Fetch cart count
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setCartCount(0);
      return;
    }
    cartApi.getCart()
      .then(res => {
        if (res.success && res.data) {
          setCartCount(res.data.summary.totalItems);
        }
      })
      .catch(() => setCartCount(0));
  }, [location.pathname]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    setCartCount(0);
    setMenuOpen(false);
    window.location.href = '/logout';
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: scrolled ? 'rgba(255,255,255,0.97)' : '#ffffff',
        borderBottom: '1px solid #E2E8F0',
        backdropFilter: 'blur(8px)',
        transition: 'box-shadow 0.2s',
        boxShadow: scrolled ? '0 2px 16px rgba(14,118,168,0.08)' : 'none',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>

          {/* Logo */}
          <Link to="/" id="nav-logo" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <img
              src={LogoImg}
              alt="Everest Logo"
              style={{ width: 36, height: 36, objectFit: 'contain', borderRadius: 8 }}
            />
            <span style={{
              fontFamily: 'Manrope, sans-serif',
              fontSize: 20,
              fontWeight: 800,
              color: '#0E76A8',
              letterSpacing: '-0.3px',
            }}>
              Everest
            </span>
          </Link>

          {/* Nav */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <NavLink to="/" label="Marketplace" isActive={location.pathname === '/'} />
            <NavLink to="/vouchers" label="All Vouchers" isActive={location.pathname === '/vouchers'} />
            <NavLink to="/posts" label="Posts" isActive={location.pathname.startsWith('/posts')} />
            <NavLink to="/my-voucher" label="My Vouchers" isActive={location.pathname === '/my-voucher'} />
          </nav>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Notification Bell */}
            <NotificationBell isLoggedIn={isLoggedIn} />

            {/* Cart */}
            <Link
              to="/cart"
              id="header-cart"
              aria-label="Cart"
              style={{
                position: 'relative',
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1.5px solid #E2E8F0',
                borderRadius: 10,
                background: 'white',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textDecoration: 'none',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#0E76A8')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#E2E8F0')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1E293B" strokeWidth="2">
                <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute', top: -6, right: -6,
                  width: 18, height: 18,
                  background: '#EF4444',
                  color: 'white',
                  fontSize: 10, fontWeight: 700,
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {isLoggedIn ? (
              <div ref={menuRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setMenuOpen(v => !v)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '6px 12px',
                    background: menuOpen ? '#E8F4FA' : '#F8FAFC',
                    border: menuOpen ? '1.5px solid #BAE6FD' : '1.5px solid #E2E8F0',
                    borderRadius: 10,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { if (!menuOpen) e.currentTarget.style.background = '#E8F4FA'; e.currentTarget.style.borderColor = '#BAE6FD'; }}
                  onMouseLeave={e => { if (!menuOpen) { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.borderColor = '#E2E8F0'; } }}
                >
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: '#0E76A8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: 14,
                    fontWeight: 700,
                    fontFamily: 'Inter, sans-serif',
                  }}>
                    {user?.fullName?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#1E293B',
                  }}>
                    {user?.fullName?.split(' ').pop() || 'User'}
                  </span>
                  <svg
                    width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.5"
                    style={{ transition: 'transform 0.2s', transform: menuOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  >
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </button>

                {/* Dropdown */}
                {menuOpen && (
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: 200,
                    background: 'white',
                    border: '1px solid #E2E8F0',
                    borderRadius: 12,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    overflow: 'hidden',
                    animation: 'dropIn 0.15s ease-out',
                    zIndex: 100,
                  }}>
                    {/* User info */}
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid #F1F5F9' }}>
                      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700, color: '#1E293B' }}>
                        {user?.fullName || 'User'}
                      </div>
                      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#94A3B8', marginTop: 2 }}>
                        {user?.email || ''}
                      </div>
                    </div>
                    <DropdownItem to="/profile" icon="user" label="Profile" onClick={() => setMenuOpen(false)} />
                    <DropdownItem to="/orders" icon="orders" label="Đơn hàng của tôi" onClick={() => setMenuOpen(false)} />
                    <DropdownItem to="/settings" icon="settings" label="Settings" onClick={() => setMenuOpen(false)} />
                    <DropdownItem to="/settings/help" icon="help" label="Help & Support" onClick={() => setMenuOpen(false)} />
                    <div style={{ borderTop: '1px solid #F1F5F9', margin: '4px 0' }} />
                    <button
                      onClick={handleLogout}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '10px 16px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 13,
                        fontWeight: 600,
                        color: '#EF4444',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#FEF2F2'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                        <polyline points="16 17 21 12 16 7"/>
                        <line x1="21" y1="12" x2="9" y2="12"/>
                      </svg>
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                id="header-login"
                to="/login"
                style={{
                  padding: '9px 20px',
                  background: '#0E76A8',
                  color: 'white',
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: 14,
                  fontWeight: 700,
                  borderRadius: 10,
                  textDecoration: 'none',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#0A5C87')}
                onMouseLeave={e => (e.currentTarget.style.background = '#0E76A8')}
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </header>
  );
}

function NavLink({ to, label, isActive }: { to: string; label: string; isActive?: boolean }) {
  return (
    <Link
      to={to}
      style={{
        padding: '6px 14px',
        fontFamily: 'Inter, sans-serif',
        fontSize: 14,
        fontWeight: isActive ? 600 : 400,
        color: isActive ? '#0E76A8' : '#64748B',
        textDecoration: 'none',
        borderRadius: 8,
        borderBottom: isActive ? '2px solid #0E76A8' : '2px solid transparent',
        transition: 'color 0.2s',
        paddingBottom: isActive ? 4 : 6,
      }}
      onMouseEnter={e => {
        if (!isActive) e.currentTarget.style.color = '#0E76A8';
      }}
      onMouseLeave={e => {
        if (!isActive) e.currentTarget.style.color = '#64748B';
      }}
    >
      {label}
    </Link>
  );
}

function DropdownItem({ to, icon, label, onClick }: { to: string; icon: string; label: string; onClick: () => void }) {
  const icons: Record<string, React.ReactNode> = {
    user: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
    settings: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    ),
    help: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
    orders: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 0 1-8 0"/>
      </svg>
    ),
  };

  return (
    <Link
      to={to}
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 16px',
        textDecoration: 'none',
        fontFamily: 'Inter, sans-serif',
        fontSize: 13,
        fontWeight: 500,
        color: '#334155',
        transition: 'background 0.15s',
      }}
      onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
      onMouseLeave={e => e.currentTarget.style.background = 'none'}
    >
      {icons[icon]}
      {label}
    </Link>
  );
}
