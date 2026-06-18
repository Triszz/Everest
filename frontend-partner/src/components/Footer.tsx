import { Link } from 'react-router-dom';
import LogoImg from '../assets/images/Logo.png';

const FOOTER_LINKS = {
  'Về Chúng Tôi': [
    { label: 'Giới thiệu', to: '/about' },
    { label: 'Tuyển dụng', to: '/careers' },
    { label: 'Báo chí', to: '/press' },
  ],
  'Hỗ Trợ Khách Hàng': [
    { label: 'Trung tâm trợ giúp', to: '/help' },
    { label: 'Quy trình hoàn tiền', to: '/refund' },
    { label: 'Chính sách bảo mật', to: '/privacy' },
  ],
  'Đối Tác': [
    { label: 'Đăng ký đối tác', to: '/register' },
    { label: 'Cổng thông tin Merchant', to: '/dashboard' },
    { label: 'Hợp tác doanh nghiệp', to: '/about' },
  ],
};

const SOCIAL_LINKS = [
  {
    label: 'Facebook',
    href: '#',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    label: 'Instagram',
    href: '#',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
  {
    label: 'Tiktok',
    href: '#',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V9.01a8.16 8.16 0 0 0 4.77 1.52V7.1a4.85 4.85 0 0 1-1-.41z" />
      </svg>
    ),
  },
];

export function Footer() {
  return (
    <footer style={{ background: '#F8FAFC', borderTop: '1px solid #E2E8F0' }}>
      {/* Main footer content */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '52px 24px 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr 1fr 1fr', gap: 48 }}>

          {/* Brand column */}
          <div>
            <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 16 }}>
              <img
                src={LogoImg}
                alt="VoucherFlow"
                style={{ width: 32, height: 32, objectFit: 'contain', borderRadius: 8 }}
              />
              <span style={{
                fontFamily: 'Manrope, sans-serif',
                fontSize: 18,
                fontWeight: 800,
                color: '#0E76A8',
              }}>
                VoucherFlow
              </span>
            </Link>
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 13,
              color: '#94A3B8',
              lineHeight: 1.75,
              marginBottom: 20,
            }}>
              Nền tảng hàng đầu mang đến những ưu đãi giá trị
              từ hàng tá thương hiệu uy tín, nhanh chóng, minh
              bạch và tiện lợi tại Việt Nam.
            </p>
            {/* Socials */}
            <div style={{ display: 'flex', gap: 10 }}>
              {SOCIAL_LINKS.map(s => (
                <a
                  key={s.label}
                  id={`footer-social-${s.label.toLowerCase()}`}
                  href={s.href}
                  aria-label={s.label}
                  style={{
                    width: 34,
                    height: 34,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 9,
                    background: 'white',
                    border: '1.5px solid #E2E8F0',
                    color: '#64748B',
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#0E76A8';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.borderColor = '#0E76A8';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.color = '#64748B';
                    e.currentTarget.style.borderColor = '#E2E8F0';
                  }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h4 style={{
                fontFamily: 'Manrope, sans-serif',
                fontSize: 14,
                fontWeight: 700,
                color: '#1E293B',
                marginBottom: 16,
                letterSpacing: '-0.2px',
              }}>
                {heading}
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {links.map(link => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 13,
                        color: '#94A3B8',
                        textDecoration: 'none',
                        transition: 'color 0.15s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#0E76A8')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#94A3B8')}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{
        borderTop: '1px solid #E2E8F0',
        padding: '16px 24px',
        maxWidth: 1200,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <p style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 12,
          color: '#94A3B8',
        }}>
          © 2024 VoucherFlow B2B2C Platform. All rights reserved.
        </p>
        <div style={{ display: 'flex', gap: 24 }}>
          {SOCIAL_LINKS.map(s => (
            <a
              key={s.label}
              href={s.href}
              aria-label={s.label}
              style={{
                color: '#94A3B8',
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#0E76A8')}
              onMouseLeave={e => (e.currentTarget.style.color = '#94A3B8')}
            >
              {s.icon}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
