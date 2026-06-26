import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { categoryApi } from '../services/api';
import type { Category } from '../services/api';

// Default images for categories (in case API doesn't return images)
const DEFAULT_IMAGES: Record<number, string> = {
  1: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=1200&fit=crop',
  2: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=800&fit=crop',
  3: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=800&fit=crop',
  4: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=800&fit=crop',
};

export function DanhMucNoiBat() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    categoryApi.list()
      .then((res) => {
        if (res.success && res.data) {
          setCategories(res.data);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section style={{ padding: '64px 0', background: 'white' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          Đang tải danh mục...
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section style={{ padding: '64px 0', background: 'white' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', textAlign: 'center', color: '#EF4444' }}>
          Không thể tải danh mục: {error}
        </div>
      </section>
    );
  }

  // Get first category for large card, rest for smaller cards
  const mainCategory = categories[0];
  const otherCategories = categories.slice(1, 4);

  return (
    <section style={{ padding: '64px 0', background: 'white' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <h2 style={{
              fontFamily: 'Manrope, sans-serif',
              fontSize: 28,
              fontWeight: 800,
              color: '#1E293B',
              letterSpacing: '-0.5px',
            }}>
              Danh Mục Nổi Bật
            </h2>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#94A3B8', marginTop: 6 }}>
              Tìm kiếm ưu đãi theo sở thích của bạn
            </p>
          </div>
          <Link
            id="categories-view-all"
            to="/categories"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontFamily: 'Inter, sans-serif',
              fontSize: 14,
              fontWeight: 600,
              color: '#0E76A8',
              textDecoration: 'none',
              transition: 'gap 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.gap = '10px')}
            onMouseLeave={e => (e.currentTarget.style.gap = '6px')}
          >
            Tất cả danh mục
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Grid: 1 large left + right side */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: 'auto auto',
          gap: 16,
        }}>
          {/* Large card: First category */}
          {mainCategory && (
            <Link
              id={`category-${mainCategory.categoryId}`}
              to={`/category/${mainCategory.categoryId}`}
              style={{
                gridRow: '1 / 3',
                position: 'relative',
                borderRadius: 20,
                overflow: 'hidden',
                display: 'block',
                textDecoration: 'none',
                height: 400,
              }}
            >
              <img
                src={DEFAULT_IMAGES[mainCategory.categoryId] || DEFAULT_IMAGES[1]}
                alt={mainCategory.categoryName}
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.04)')}
                onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')}
              />
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)',
              }} />
              <div style={{ position: 'absolute', bottom: 24, left: 24 }}>
                <h3 style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: 26,
                  fontWeight: 800,
                  color: 'white',
                  letterSpacing: '-0.5px',
                }}>{mainCategory.categoryName}</h3>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 4 }}>
                  {mainCategory.voucherCount || 0} voucher
                </p>
              </div>
            </Link>
          )}

          {/* Second category - large right top */}
          {otherCategories[0] && (
            <Link
              id={`category-${otherCategories[0].categoryId}`}
              to={`/category/${otherCategories[0].categoryId}`}
              style={{
                position: 'relative',
                borderRadius: 20,
                overflow: 'hidden',
                display: 'block',
                textDecoration: 'none',
                height: 192,
              }}
            >
              <img
                src={DEFAULT_IMAGES[otherCategories[0].categoryId] || DEFAULT_IMAGES[2]}
                alt={otherCategories[0].categoryName}
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.04)')}
                onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')}
              />
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 60%)',
              }} />
              <div style={{ position: 'absolute', bottom: 16, left: 18 }}>
                <h3 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 18, fontWeight: 700, color: 'white' }}>{otherCategories[0].categoryName}</h3>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>
                  {otherCategories[0].voucherCount || 0} voucher
                </p>
              </div>
            </Link>
          )}

          {/* Bottom right: 2 smaller cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, height: 192 }}>
            {otherCategories.slice(1, 3).map((cat) => (
              <Link
                key={cat.categoryId}
                id={`category-${cat.categoryId}`}
                to={`/category/${cat.categoryId}`}
                style={{
                  position: 'relative',
                  borderRadius: 20,
                  overflow: 'hidden',
                  display: 'block',
                  textDecoration: 'none',
                  height: '100%',
                }}
              >
                <img
                  src={DEFAULT_IMAGES[cat.categoryId] || DEFAULT_IMAGES[3]}
                  alt={cat.categoryName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                  onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.06)')}
                  onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')}
                />
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 60%)',
                }} />
                <div style={{ position: 'absolute', bottom: 14, left: 14 }}>
                  <h3 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 700, color: 'white' }}>
                    {cat.categoryName}
                  </h3>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.8)' }}>
                    {cat.voucherCount || 0} voucher
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
