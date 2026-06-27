import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import LogoImg from '../assets/images/Logo.png';
import { cartApi } from '../services/api';

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
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

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    setCartCount(0);
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
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
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
          <nav style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <NavLink to="/" label="Marketplace" isActive={location.pathname === '/'} />
            <NavLink to="/my-voucher" label="My Vouchers" isActive={location.pathname === '/my-voucher'} />
            <NavLink to="/rewards" label="Rewards" isActive={location.pathname === '/rewards'} />
          </nav>

          {/* Search + Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Search bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: '#F8FAFC',
              border: '1.5px solid #E2E8F0',
              borderRadius: 10,
              padding: '8px 14px',
              width: 240,
              transition: 'border-color 0.2s',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.2">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input
                id="header-search"
                type="text"
                placeholder="Tìm kiếm voucher ẩm thực, du lịch..."
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  fontSize: 13,
                  color: '#64748B',
                  width: '100%',
                  fontFamily: 'Inter, sans-serif',
                }}
              />
            </div>

            {/* Cart */}
            <Link
              to="/cart"
              id="header-cart"
              aria-label="Giỏ hàng"
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

            {/* User Menu or Login */}
            {isLoggedIn ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 12px',
                  background: '#F8FAFC',
                  borderRadius: 10,
                }}>
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
                </div>
                <button
                  onClick={handleLogout}
                  style={{
                    padding: '9px 16px',
                    background: '#FEF2F2',
                    color: '#EF4444',
                    border: 'none',
                    borderRadius: 10,
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#FEE2E2')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#FEF2F2')}
                >
                  Đăng xuất
                </button>
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
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      </div>
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
