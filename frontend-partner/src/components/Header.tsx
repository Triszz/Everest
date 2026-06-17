import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import LogoImg from '../assets/images/Logo.png';
import { useAuth } from '../context/AuthContext';
import { getNavItems, getDefaultRoute } from '../config/navigation';

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Derive nav items from role (empty if not logged in)
  const navItems = user ? getNavItems(user.role) : [];
  const homeRoute = user ? getDefaultRoute(user.role) : '/login';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === '/dashboard' || location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
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
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>

          {/* Logo */}
          <Link to={homeRoute} id="nav-logo" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
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
            <span style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 11,
              fontWeight: 600,
              color: '#ffffff',
              background: '#0E76A8',
              padding: '2px 8px',
              borderRadius: 6,
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
            }}>
              Partner
            </span>
          </Link>

          {/* Desktop Nav — only show when logged in and has nav items */}
          {navItems.length > 0 && (
            <nav style={{ display: 'flex', alignItems: 'center', gap: 8 }} className="hidden lg:flex">
              {navItems.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  label={item.label}
                  isActive={isActive(item.to)}
                />
              ))}
            </nav>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {user ? (
              <>
                {/* Profile / Settings */}
                <Link
                  to="/settings"
                  id="header-settings"
                  aria-label="Cài đặt"
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
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </Link>

                {/* User name (desktop only) */}
                <span
                  className="hidden lg:inline"
                  style={{
                    display: 'none',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#1E293B',
                    maxWidth: 120,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {user.fullName}
                </span>

                {/* Logout button */}
                <button
                  id="header-logout"
                  onClick={handleLogout}
                  style={{
                    padding: '9px 20px',
                    background: 'white',
                    color: '#64748B',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 14,
                    fontWeight: 600,
                    borderRadius: 10,
                    border: '1.5px solid #E2E8F0',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  className="hidden lg:inline-block"
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#EF4444';
                    e.currentTarget.style.color = '#EF4444';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#E2E8F0';
                    e.currentTarget.style.color = '#64748B';
                  }}
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              /* Not logged in — show login button */
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
                Đăng nhập
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              id="header-mobile-toggle"
              aria-label="Toggle menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden"
              style={{
                display: 'none',
                width: 40,
                height: 40,
                alignItems: 'center',
                justifyContent: 'center',
                border: '1.5px solid #E2E8F0',
                borderRadius: 10,
                background: 'white',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {mobileMenuOpen ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1E293B" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1E293B" strokeWidth="2">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden"
          style={{
            display: 'block',
            borderTop: '1px solid #E2E8F0',
            background: 'white',
            padding: '12px 24px 16px',
          }}
        >
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {navItems.map(item => (
              <Link
                key={item.to}
                to={item.to}
                style={{
                  padding: '10px 14px',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 14,
                  fontWeight: isActive(item.to) ? 600 : 400,
                  color: isActive(item.to) ? '#0E76A8' : '#64748B',
                  textDecoration: 'none',
                  borderRadius: 8,
                  background: isActive(item.to) ? '#E8F4FA' : 'transparent',
                  transition: 'all 0.15s',
                }}
              >
                {item.label}
              </Link>
            ))}

            {user && (
              <>
                <div style={{ height: 1, background: '#E2E8F0', margin: '8px 0' }} />
                <Link
                  to="/settings"
                  style={{
                    padding: '10px 14px',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 14,
                    fontWeight: isActive('/settings') ? 600 : 400,
                    color: isActive('/settings') ? '#0E76A8' : '#64748B',
                    textDecoration: 'none',
                    borderRadius: 8,
                    background: isActive('/settings') ? '#E8F4FA' : 'transparent',
                    transition: 'all 0.15s',
                  }}
                >
                  Cài đặt tài khoản
                </Link>
                <button
                  onClick={handleLogout}
                  style={{
                    padding: '10px 14px',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#EF4444',
                    textDecoration: 'none',
                    borderRadius: 8,
                    background: 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  Đăng xuất
                </button>
              </>
            )}

            {!user && (
              <Link
                to="/login"
                style={{
                  padding: '10px 14px',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#0E76A8',
                  textDecoration: 'none',
                  borderRadius: 8,
                  transition: 'all 0.15s',
                }}
              >
                Đăng nhập
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

// ── NavLink sub-component (same pattern as customer) ────────────────────────
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
