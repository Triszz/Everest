import { Link } from 'react-router-dom';

export function Hero() {
  return (
    <section style={{ background: 'linear-gradient(135deg, #F8FAFC 0%, #E8F4FA 50%, #F8FAFC 100%)', padding: '64px 0 72px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>

        {/* Badge */}
        <div style={{ marginBottom: 24 }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'linear-gradient(90deg, #0E76A8, #2DD4BF)',
            color: 'white',
            fontSize: 12,
            fontFamily: 'Manrope, sans-serif',
            fontWeight: 700,
            padding: '5px 14px',
            borderRadius: 99,
            letterSpacing: '0.3px',
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            Ưu Đãi Đặc Biệt Tháng 12
          </span>
        </div>

        {/* Headline */}
        <h1 style={{
          fontFamily: 'Manrope, sans-serif',
          fontSize: 'clamp(36px, 5vw, 56px)',
          fontWeight: 800,
          color: '#1E293B',
          lineHeight: 1.15,
          letterSpacing: '-1px',
          maxWidth: 560,
          marginBottom: 20,
        }}>
          Mở khóa thế giới{' '}
          <span style={{
            background: 'linear-gradient(90deg, #0E76A8, #2DD4BF)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Tiết Kiệm
          </span>{' '}
          đỉnh cao
        </h1>

        {/* Subtitle */}
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 16,
          color: '#64748B',
          lineHeight: 1.75,
          maxWidth: 500,
          marginBottom: 36,
        }}>
          Trải nghiệm hàng ngàn voucher từ các thương hiệu hàng đầu Việt Nam. Từ ẩm thực tinh tế
          đến những chuyến du lịch xa hoa, chúng tôi mang giá trị tốt nhất đến tay bạn.
        </p>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <Link
            id="hero-cta-primary"
            to="/vouchers"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '13px 28px',
              background: '#0E76A8',
              color: 'white',
              fontFamily: 'Manrope, sans-serif',
              fontSize: 15,
              fontWeight: 700,
              borderRadius: 12,
              textDecoration: 'none',
              transition: 'all 0.2s',
              boxShadow: '0 4px 18px rgba(14,118,168,0.35)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#0A5C87';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 6px 24px rgba(14,118,168,0.45)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#0E76A8';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 18px rgba(14,118,168,0.35)';
            }}
          >
            Khám Phá Ngay
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>

          <Link
            id="hero-cta-secondary"
            to="/collections"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '13px 28px',
              background: 'white',
              color: '#1E293B',
              fontFamily: 'Manrope, sans-serif',
              fontSize: 15,
              fontWeight: 600,
              borderRadius: 12,
              textDecoration: 'none',
              border: '1.5px solid #E2E8F0',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#0E76A8';
              e.currentTarget.style.color = '#0E76A8';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = '#E2E8F0';
              e.currentTarget.style.color = '#1E293B';
            }}
          >
            Xem Bộ Sưu Tập
          </Link>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 36, marginTop: 48, flexWrap: 'wrap' }}>
          {[
            { value: '10K+', label: 'Voucher hiện có' },
            { value: '500+', label: 'Thương hiệu đối tác' },
            { value: '70%', label: 'Tiết kiệm tối đa' },
          ].map((stat, i) => (
            <div key={i}>
              <p style={{
                fontFamily: 'Manrope, sans-serif',
                fontSize: 24,
                fontWeight: 800,
                color: '#0E76A8',
                lineHeight: 1,
              }}>
                {stat.value}
              </p>
              <p style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 13,
                color: '#94A3B8',
                marginTop: 4,
              }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
