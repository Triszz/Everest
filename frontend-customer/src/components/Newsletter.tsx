import { useState } from 'react';

export function Newsletter() {
  const [email, setEmail] = useState('');

  return (
    <section style={{
      background: 'linear-gradient(135deg, #0E76A8 0%, #0A5C87 40%, #1E293B 100%)',
      padding: '64px 0',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative circles */}
      <div style={{
        position: 'absolute', top: -80, right: -80,
        width: 320, height: 320,
        background: 'rgba(45,212,191,0.08)',
        borderRadius: '50%',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: -60, left: '30%',
        width: 200, height: 200,
        background: 'rgba(45,212,191,0.06)',
        borderRadius: '50%',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', position: 'relative' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: 48,
          alignItems: 'center',
        }}>
          {/* Left */}
          <div>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(45,212,191,0.2)',
              color: '#2DD4BF',
              fontSize: 12,
              fontFamily: 'Manrope, sans-serif',
              fontWeight: 700,
              padding: '4px 12px',
              borderRadius: 99,
              marginBottom: 16,
              border: '1px solid rgba(45,212,191,0.3)',
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              Newsletter
            </span>
            <h2 style={{
              fontFamily: 'Manrope, sans-serif',
              fontSize: 28,
              fontWeight: 800,
              color: 'white',
              letterSpacing: '-0.5px',
              marginBottom: 10,
            }}>
              Nhận Ưu Đãi Độc Quyền
            </h2>
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 14,
              color: 'rgba(255,255,255,0.7)',
              lineHeight: 1.7,
              maxWidth: 480,
            }}>
              Đăng ký để không bao giờ bỏ lỡ những voucher giới hạn và chương trình quà tặng
              hàng tuần từ VoucherFlow.
            </p>
          </div>

          {/* Right: Form */}
          <div style={{ minWidth: 360 }}>
            <form
              id="newsletter-form"
              onSubmit={(e) => { e.preventDefault(); setEmail(''); }}
              style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
            >
              <div style={{ display: 'flex', gap: 10 }}>
                <input
                  id="newsletter-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Địa chỉ email của bạn"
                  required
                  style={{
                    flex: 1,
                    padding: '13px 18px',
                    borderRadius: 12,
                    border: '1.5px solid rgba(255,255,255,0.15)',
                    background: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 14,
                    outline: 'none',
                    backdropFilter: 'blur(8px)',
                  }}
                />
                <button
                  type="submit"
                  style={{
                    padding: '13px 24px',
                    background: '#2DD4BF',
                    color: '#1E293B',
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: 14,
                    fontWeight: 800,
                    borderRadius: 12,
                    border: 'none',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#1FB8A5';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = '#2DD4BF';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  Gửi
                </button>
              </div>
              <p style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 11,
                color: 'rgba(255,255,255,0.45)',
                lineHeight: 1.6,
              }}>
                Bằng cách đăng ký, bạn đồng ý với{' '}
                <span style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'underline', cursor: 'pointer' }}>
                  Chính sách bảo mật
                </span>{' '}
                của chúng tôi.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
