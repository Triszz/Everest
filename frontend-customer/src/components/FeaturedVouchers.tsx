import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { voucherApi, cartApi } from '../services/api';
import type { Voucher } from '../services/api';
import { Loader2 } from 'lucide-react';

export function FeaturedVouchers() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    voucherApi.getFeatured()
      .then((res) => {
        if (res.success && res.data) {
          setVouchers(res.data);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section style={{ padding: '64px 0', background: '#F8FAFC' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          Đang tải voucher...
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section style={{ padding: '64px 0', background: '#F8FAFC' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', textAlign: 'center', color: '#EF4444' }}>
          Không thể tải voucher: {error}
        </div>
      </section>
    );
  }

  return (
    <section style={{ padding: '64px 0', background: '#F8FAFC' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>

        {/* Section Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2DD4BF" strokeWidth="2.5">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, color: '#2DD4BF', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Đang Thịnh Hành
              </span>
            </div>
            <h2 style={{
              fontFamily: 'Manrope, sans-serif',
              fontSize: 28,
              fontWeight: 800,
              color: '#1E293B',
              letterSpacing: '-0.5px',
            }}>
              Voucher Xu Hướng
            </h2>
          </div>
          <Link
            id="featured-view-all"
            to="/vouchers"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontFamily: 'Inter, sans-serif',
              fontSize: 14,
              fontWeight: 600,
              color: '#0E76A8',
              textDecoration: 'none',
            }}
            onMouseEnter={e => (e.currentTarget.style.gap = '10px')}
            onMouseLeave={e => (e.currentTarget.style.gap = '6px')}
          >
            Xem tất cả
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 20,
        }}>
          {vouchers.length === 0 ? (
            <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#64748B' }}>
              Hiện không có voucher nào
            </p>
          ) : (
            vouchers.map((voucher) => (
              <VoucherCard key={voucher.voucherId} voucher={voucher} />
            ))
          )}
        </div>

      </div>
    </section>
  );
}

function VoucherCard({ voucher, onAddToCart }: { voucher: Voucher; onAddToCart?: () => void }) {
  const formatPrice = (p: string | number) => Number(p).toLocaleString('vi-VN') + 'đ';
  const discount = voucher.originalPrice
    ? Math.round((1 - Number(voucher.salePrice) / Number(voucher.originalPrice)) * 100)
    : 0;
  const imageUrl = voucher.imageUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop';

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart) onAddToCart();
  };

  return (
    <Link
      id={`voucher-card-${voucher.voucherId}`}
      to={`/voucher/${voucher.voucherId}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: 'white',
        borderRadius: 16,
        overflow: 'hidden',
        textDecoration: 'none',
        border: '1px solid #F1F5F9',
        transition: 'all 0.25s ease',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 32px rgba(14,118,168,0.15)';
        e.currentTarget.style.borderColor = '#C4E3F3';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)';
        e.currentTarget.style.borderColor = '#F1F5F9';
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', height: 160, overflow: 'hidden' }}>
        <img
          src={imageUrl}
          alt={voucher.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
          onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.06)')}
          onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')}
        />
        {/* Discount badge */}
        <span style={{
          position: 'absolute',
          top: 10,
          left: 10,
          background: '#EF4444',
          color: 'white',
          fontFamily: 'Manrope, sans-serif',
          fontSize: 11,
          fontWeight: 700,
          padding: '3px 8px',
          borderRadius: 6,
        }}>
          -{discount}%
        </span>
        {/* Partner tag */}
        <span style={{
          position: 'absolute',
          bottom: 10,
          left: 10,
          background: 'rgba(0,0,0,0.55)',
          color: 'white',
          fontFamily: 'Inter, sans-serif',
          fontSize: 11,
          fontWeight: 500,
          padding: '3px 9px',
          borderRadius: 6,
          backdropFilter: 'blur(4px)',
        }}>
          {voucher.partner?.companyName || 'N/A'}
        </span>
      </div>

      {/* Info */}
      <div style={{ padding: '14px 16px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <h3 style={{
          fontFamily: 'Manrope, sans-serif',
          fontSize: 14,
          fontWeight: 700,
          color: '#1E293B',
          lineHeight: 1.45,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {voucher.title}
        </h3>

        {/* Rating */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="#F59E0B">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#64748B', fontWeight: 600 }}>
            {voucher.averageRating?.toFixed(1) || '0.0'}
          </span>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#94A3B8' }}>
            ({voucher.reviewCount || 0} đã bán)
          </span>
        </div>

        {/* Price row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
          <div>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#94A3B8', textDecoration: 'line-through', display: 'block' }}>
              {voucher.originalPrice ? formatPrice(voucher.originalPrice) : ''}
            </span>
            <span style={{
              fontFamily: 'Manrope, sans-serif',
              fontSize: 17,
              fontWeight: 800,
              color: '#0E76A8',
            }}>
              {formatPrice(voucher.salePrice)}
            </span>
          </div>
          <AddToCartButton voucherId={voucher.voucherId} />
        </div>
      </div>
    </Link>
  );
}

function AddToCartButton({ voucherId }: { voucherId: number }) {
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;

    const token = localStorage.getItem('access_token');
    if (!token) {
      if (confirm('Bạn cần đăng nhập để thêm vào giỏ hàng. Đăng nhập ngay?')) {
        window.location.href = '/login';
      }
      return;
    }

    try {
      setLoading(true);
      await cartApi.addToCart(voucherId, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err: any) {
      alert(err.message || 'Không thể thêm vào giỏ hàng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      aria-label="Thêm vào giỏ"
      onClick={handleAddToCart}
      disabled={loading}
      style={{
        width: 34,
        height: 34,
        background: added ? '#10B981' : '#E8F4FA',
        border: 'none',
        borderRadius: 9,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: loading ? 'wait' : 'pointer',
        transition: 'background 0.2s',
      }}
    >
      {loading ? (
        <Loader2 size={16} style={{ animation: 'spin 1s linear infinite', color: '#0E76A8' }} />
      ) : added ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0E76A8" strokeWidth="2.2">
          <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
      )}
    </button>
  );
}
