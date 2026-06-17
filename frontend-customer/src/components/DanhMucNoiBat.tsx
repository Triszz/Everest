import { Link } from 'react-router-dom';
import CatAmThuc from '../assets/images/cat_am_thuc.png';
import CatDuLich from '../assets/images/cat_du_lich.png';
import CatSacDep from '../assets/images/cat_sac_dep.png';
import CatMuaSam from '../assets/images/cat_mua_sam.png';

export function DanhMucNoiBat() {
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

        {/* Grid: 1 large left + 3 right */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: 'auto auto',
          gap: 16,
        }}>
          {/* Large card: Ẩm Thực */}
          <Link
            id="category-am-thuc"
            to="/category/1"
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
              src={CatAmThuc}
              alt="Ẩm Thực"
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
              }}>Ẩm Thực</h3>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 4 }}>
                Ưu đãi đến 50% tại các nhà hàng 5 sao
              </p>
            </div>
          </Link>

          {/* Du Lịch - large right top */}
          <Link
            id="category-du-lich"
            to="/category/2"
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
              src={CatDuLich}
              alt="Du Lịch"
              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
              onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.04)')}
              onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')}
            />
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 60%)',
            }} />
            <div style={{ position: 'absolute', bottom: 16, left: 18 }}>
              <h3 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 18, fontWeight: 700, color: 'white' }}>Du Lịch</h3>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>
                Khám phá Việt Nam với giá ưu đãi
              </p>
            </div>
          </Link>

          {/* Bottom right: 2 smaller cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, height: 192 }}>
            {[
              { id: 3, name: 'Sắc Đẹp', image: CatSacDep, slug: 'sac-dep' },
              { id: 4, name: 'Mua Sắm', image: CatMuaSam, slug: 'mua-sam' },
            ].map(cat => (
              <Link
                key={cat.id}
                id={`category-${cat.slug}`}
                to={`/category/${cat.id}`}
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
                  src={cat.image}
                  alt={cat.name}
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
                    {cat.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
