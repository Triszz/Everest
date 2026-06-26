import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { bannerApi, type Banner } from '../services/api';

export function Hero() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    bannerApi.list().then((res) => {
      if (res.success && res.data) {
        setBanners(res.data);
      }
      setLoading(false);
    });
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  }, [banners.length]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [banners.length, nextSlide]);

  if (loading) {
    return (
      <section style={{ background: '#F8FAFC', padding: '64px 0 72px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ height: 400, background: '#E2E8F0', borderRadius: 16 }} />
        </div>
      </section>
    );
  }

  if (banners.length === 0) {
    return (
      <section style={{ background: 'linear-gradient(135deg, #F8FAFC 0%, #E8F4FA 50%, #F8FAFC 100%)', padding: '64px 0 72px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <HeroContent />
        </div>
      </section>
    );
  }

  const currentBanner = banners[currentIndex];

  return (
    <section style={{ background: '#F8FAFC', padding: '32px 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        {/* Banner Carousel */}
        <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', marginBottom: 24 }}>
          <Link
            to={currentBanner.targetUrl || '/vouchers'}
            style={{ display: 'block', textDecoration: 'none' }}
          >
            <div style={{
              position: 'relative',
              height: 380,
              background: `linear-gradient(135deg, #0E76A8 0%, #2DD4BF 100%)`,
              display: 'flex',
              alignItems: 'center',
              overflow: 'hidden',
            }}>
              {/* Background Image */}
              <img
                src={currentBanner.imageUrl}
                alt={currentBanner.title}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: 0.15,
                }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              {/* Content */}
              <div style={{ position: 'relative', zIndex: 1, padding: '40px 60px', maxWidth: 600 }}>
                <h2 style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: 'clamp(28px, 4vw, 42px)',
                  fontWeight: 800,
                  color: 'white',
                  lineHeight: 1.2,
                  marginBottom: 16,
                }}>
                  {currentBanner.title}
                </h2>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  fontSize: 13,
                  fontWeight: 600,
                  padding: '6px 14px',
                  borderRadius: 99,
                }}>
                  Xem ngay
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>
          </Link>

          {/* Navigation Arrows */}
          {banners.length > 1 && (
            <>
              <button
                onClick={(e) => { e.preventDefault(); prevSlide(); }}
                style={{
                  position: 'absolute',
                  left: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.9)',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  transition: 'all 0.2s',
                }}
                aria-label="Previous banner"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1E293B" strokeWidth="2.5">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button
                onClick={(e) => { e.preventDefault(); nextSlide(); }}
                style={{
                  position: 'absolute',
                  right: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.9)',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  transition: 'all 0.2s',
                }}
                aria-label="Next banner"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1E293B" strokeWidth="2.5">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>

              {/* Dots */}
              <div style={{
                position: 'absolute',
                bottom: 16,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: 8,
              }}>
                {banners.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => { e.preventDefault(); setCurrentIndex(index); }}
                    style={{
                      width: index === currentIndex ? 24 : 8,
                      height: 8,
                      borderRadius: 4,
                      background: index === currentIndex ? 'white' : 'rgba(255,255,255,0.5)',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      padding: 0,
                    }}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <HeroContent />
      </div>
    </section>
  );
}

function HeroContent() {
  return (
    <>
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
    </>
  );
}
