import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { voucherApi } from '../services/api';
import type { Voucher } from '../services/api';
import { Search, SlidersHorizontal, X, ChevronDown, Star, Loader2 } from 'lucide-react';

// ── Filter config ─────────────────────────────────────────────────────────────

const DISCOUNT_OPTIONS = [
  { label: 'Tất cả', value: '' },
  { label: 'Giảm ≥ 10%', value: '10' },
  { label: 'Giảm ≥ 20%', value: '20' },
  { label: 'Giảm ≥ 30%', value: '30' },
  { label: 'Giảm ≥ 50%', value: '50' },
];

const PRICE_OPTIONS = [
  { label: 'Tất cả mức giá', value: '' },
  { label: 'Dưới 50.000đ', value: '0-50000' },
  { label: '50.000đ – 100.000đ', value: '50000-100000' },
  { label: '100.000đ – 200.000đ', value: '100000-200000' },
  { label: 'Trên 200.000đ', value: '200000-999999999' },
];

const SORT_OPTIONS = [
  { label: 'Mới nhất', value: 'newest' },
  { label: 'Phổ biến nhất', value: 'popular' },
  { label: 'Giá: Thấp → Cao', value: 'price_asc' },
  { label: 'Giá: Cao → Thấp', value: 'price_desc' },
];

const MOCK_CATEGORIES = [
  { categoryId: 1, name: 'Ăn uống', emoji: '🍜' },
  { categoryId: 2, name: 'Cà phê', emoji: '☕' },
  { categoryId: 3, name: 'Fast food', emoji: '🍔' },
  { categoryId: 4, name: 'Trà sữa', emoji: '🧋' },
  { categoryId: 5, name: 'Pizza', emoji: '🍕' },
  { categoryId: 6, name: 'Bánh ngọt', emoji: '🧁' },
  { categoryId: 7, name: 'Gym & Fitness', emoji: '💪' },
  { categoryId: 8, name: 'Spa & Massage', emoji: '💆' },
];

// ── Filter chip ────────────────────────────────────────────────────────────────

interface FilterChip {
  key: string;
  label: string;
}

// ── Main ───────────────────────────────────────────────────────────────────────

export function VouchersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchParams.get('search') || '');
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>();

  // Filter state from URL
  const currentPage = Number(searchParams.get('page')) || 1;
  const sort = searchParams.get('sort') || 'newest';
  const search = searchParams.get('search') || '';
  const categoryId = searchParams.get('category_id') || '';
  const discount = searchParams.get('discount') || '';
  const priceRange = searchParams.get('price') || '';

  // Derive active filter chips for display
  const activeFilters: FilterChip[] = [
    ...(categoryId ? [{ key: 'category_id', label: MOCK_CATEGORIES.find(c => String(c.categoryId) === categoryId)?.name || 'Danh mục' }] : []),
    ...(discount ? [{ key: 'discount', label: `Giảm ≥ ${discount}%` }] : []),
    ...(priceRange ? [{ key: 'price', label: PRICE_OPTIONS.find(p => p.value === priceRange)?.label || 'Khoảng giá' }] : []),
  ];

  // Debounced search
  const updateParams = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const removeFilter = (key: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete(key);
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('category_id');
    newParams.delete('discount');
    newParams.delete('price');
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleSearchChange = (value: string) => {
    setLocalSearch(value);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      updateParams('search', value);
    }, 400);
  };

  useEffect(() => {
    setLoading(true);
    voucherApi.list({
      page: currentPage,
      sort: sort as 'price_asc' | 'price_desc' | 'popular' | 'newest',
      search: search || undefined,
      category_id: categoryId ? Number(categoryId) : undefined,
    })
      .then((res) => {
        if (res.success && res.data) {
          // Client-side discount filter (backend doesn't support yet)
          let data = res.data;
          if (discount) {
            data = data.filter(v => {
              if (!v.originalPrice) return false;
              const pct = Math.round((1 - Number(v.salePrice) / Number(v.originalPrice)) * 100);
              return pct >= Number(discount);
            });
          }
          if (priceRange) {
            const [min, max] = priceRange.split('-').map(Number);
            data = data.filter(v => {
              const p = Number(v.salePrice);
              return p >= min && p <= max;
            });
          }
          setVouchers(data);
          if (res.pagination) {
            setPagination({
              page: res.pagination.page,
              totalPages: res.pagination.totalPages,
              total: res.pagination.total,
            });
          }
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [currentPage, sort, search, categoryId, discount, priceRange]);

  const formatPrice = (p: string | number) => Number(p).toLocaleString('vi-VN') + 'đ';

  const hasActiveFilters = activeFilters.length > 0;

  // ── Filter Drawer (mobile-friendly, also shown as sidebar on desktop) ───────

  const FilterPanel = ({ className = '' }: { className?: string }) => (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Sort */}
      <div>
        <h3 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 800, color: '#1E293B', marginBottom: 12 }}>Sắp xếp</h3>
        <select
          value={sort}
          onChange={e => updateParams('sort', e.target.value)}
          style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E2E8F0', borderRadius: 10, fontSize: 13, fontFamily: 'Inter, sans-serif', color: '#1E293B', background: 'white', cursor: 'pointer', outline: 'none' }}
        >
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Category */}
      <div>
        <h3 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 800, color: '#1E293B', marginBottom: 12 }}>Danh mục</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <button
            onClick={() => updateParams('category_id', '')}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '9px 12px', borderRadius: 10,
              background: !categoryId ? '#E8F4FA' : 'transparent',
              border: !categoryId ? '1.5px solid #BAE6FD' : '1.5px solid #E2E8F0',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: !categoryId ? 700 : 400, color: !categoryId ? '#0E76A8' : '#64748B' }}>Tất cả</span>
          </button>
          {MOCK_CATEGORIES.map(cat => (
            <button
              key={cat.categoryId}
              onClick={() => updateParams('category_id', String(cat.categoryId))}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '9px 12px', borderRadius: 10,
                background: categoryId === String(cat.categoryId) ? '#E8F4FA' : 'transparent',
                border: categoryId === String(cat.categoryId) ? '1.5px solid #BAE6FD' : '1.5px solid transparent',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              <span style={{ fontSize: 15 }}>{cat.emoji}</span>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: categoryId === String(cat.categoryId) ? 700 : 400, color: categoryId === String(cat.categoryId) ? '#0E76A8' : '#334155', flex: 1, textAlign: 'left' }}>
                {cat.name}
              </span>
              {categoryId === String(cat.categoryId) && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0E76A8" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Discount */}
      <div>
        <h3 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 800, color: '#1E293B', marginBottom: 12 }}>Mức giảm giá</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {DISCOUNT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => updateParams('discount', opt.value)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '9px 12px', borderRadius: 10,
                background: discount === opt.value ? '#FEF3C7' : 'transparent',
                border: discount === opt.value ? '1.5px solid #FDE68A' : '1.5px solid #E2E8F0',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: discount === opt.value ? 700 : 400, color: discount === opt.value ? '#92400E' : '#334155' }}>
                {opt.label}
              </span>
              {discount === opt.value && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div>
        <h3 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 800, color: '#1E293B', marginBottom: 12 }}>Khoảng giá</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {PRICE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => updateParams('price', opt.value)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '9px 12px', borderRadius: 10,
                background: priceRange === opt.value ? '#ECFDF5' : 'transparent',
                border: priceRange === opt.value ? '1.5px solid #6EE7B7' : '1.5px solid #E2E8F0',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: priceRange === opt.value ? 700 : 400, color: priceRange === opt.value ? '#065F46' : '#334155' }}>
                {opt.label}
              </span>
              {priceRange === opt.value && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Clear all */}
      {hasActiveFilters && (
        <button
          onClick={clearAllFilters}
          style={{
            padding: '10px',
            background: 'white', color: '#EF4444',
            border: '1.5px solid #FECACA', borderRadius: 10,
            fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700,
            cursor: 'pointer', transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#FEF2F2'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'white'; }}
        >
          Xóa tất cả bộ lọc
        </button>
      )}
    </div>
  );

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh' }}>
      {/* ── Header ── */}
      <div style={{ background: 'white', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '20px 24px 0' }}>
          {/* Breadcrumb */}
          <div style={{ marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: '#64748B' }}>
              <Link to="/" style={{ color: '#0E76A8', textDecoration: 'none' }}>Trang chủ</Link>
              <span style={{ margin: '0 8px' }}>/</span>
              <span style={{ color: '#1E293B', fontWeight: 600 }}>Danh sách voucher</span>
            </span>
          </div>

          <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 26, fontWeight: 800, color: '#1E293B', marginBottom: 16 }}>
            Khám phá Voucher
          </h1>

          {/* Search bar */}
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Tìm kiếm voucher, đối tác, danh mục..."
              value={localSearch}
              onChange={e => handleSearchChange(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px 12px 44px',
                border: '1.5px solid #E2E8F0',
                borderRadius: 12,
                fontSize: 14,
                fontFamily: 'Inter, sans-serif',
                color: '#1E293B',
                background: '#F8FAFC',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = '#0E76A8')}
              onBlur={e => (e.currentTarget.style.borderColor = '#E2E8F0')}
            />
            {localSearch && (
              <button
                onClick={() => { setLocalSearch(''); updateParams('search', ''); }}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', display: 'flex', alignItems: 'center' }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Category scroll chips */}
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 16, scrollbarWidth: 'none' }}>
            {MOCK_CATEGORIES.map(cat => (
              <button
                key={cat.categoryId}
                onClick={() => updateParams('category_id', categoryId === String(cat.categoryId) ? '' : String(cat.categoryId))}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 14px',
                  background: categoryId === String(cat.categoryId) ? '#0E76A8' : 'white',
                  color: categoryId === String(cat.categoryId) ? 'white' : '#334155',
                  border: categoryId === String(cat.categoryId) ? '1.5px solid #0E76A8' : '1.5px solid #E2E8F0',
                  borderRadius: 99,
                  fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                  transition: 'all 0.15s',
                }}
              >
                <span style={{ fontSize: 14 }}>{cat.emoji}</span>
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main layout: sidebar + grid ── */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px', display: 'grid', gridTemplateColumns: '240px 1fr', gap: 24, alignItems: 'start' }}>

        {/* ── Left sidebar filter ── */}
        <div style={{ background: 'white', borderRadius: 16, padding: 20, border: '1px solid #F1F5F9', position: 'sticky', top: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          {/* Sidebar header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #F1F5F9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <SlidersHorizontal size={16} style={{ color: '#0E76A8' }} />
              <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 800, color: '#1E293B', margin: 0 }}>Bộ lọc</h2>
            </div>
            {hasActiveFilters && (
              <span style={{ background: '#0E76A8', color: 'white', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99 }}>
                {activeFilters.length}
              </span>
            )}
          </div>

          {/* Mobile: show as drawer */}
          <div className="desktop-filter">
            <FilterPanel />
          </div>

          {/* Mobile: button to open drawer */}
          <div className="mobile-filter" style={{ display: 'none' }}>
            <button
              onClick={() => setShowFilterDrawer(true)}
              style={{
                width: '100%', padding: '12px',
                background: 'white', color: '#0E76A8',
                border: '1.5px solid #BAE6FD', borderRadius: 12,
                fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 700,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              <SlidersHorizontal size={16} />
              Mở bộ lọc
            </button>
          </div>
        </div>

        {/* ── Right: results ── */}
        <div>
          {/* Results header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
            {/* Active filter chips */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', flex: 1 }}>
              {activeFilters.map(f => (
                <span
                  key={f.key}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '4px 10px 4px 12px',
                    background: '#E8F4FA', color: '#0E76A8',
                    border: '1px solid #BAE6FD', borderRadius: 99,
                    fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600,
                  }}
                >
                  {f.label}
                  <button
                    onClick={() => removeFilter(f.key)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0E76A8', padding: 0, display: 'flex', alignItems: 'center', marginLeft: 2 }}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#EF4444', fontFamily: 'Inter, sans-serif', fontWeight: 600, textDecoration: 'underline', padding: '4px 4px' }}
                >
                  Xóa hết
                </button>
              )}
            </div>

            {/* Count */}
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#64748B', whiteSpace: 'nowrap' }}>
              {loading ? '...' : `${vouchers.length} voucher`}
              {(search || categoryId || discount || priceRange) && !loading && ` được tìm thấy`}
            </span>
          </div>

          {/* Mobile filter chips row */}
          <div className="mobile-filter-chips" style={{ display: 'none', marginBottom: 12 }}>
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
              <button
                onClick={() => setShowFilterDrawer(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: 'white', border: '1.5px solid #E2E8F0', borderRadius: 99, cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: '#334155', whiteSpace: 'nowrap', flexShrink: 0 }}
              >
                <SlidersHorizontal size={12} />
                Bộ lọc
                {hasActiveFilters && <span style={{ background: '#0E76A8', color: 'white', fontSize: 10, fontWeight: 700, padding: '0 5px', borderRadius: 99 }}>{activeFilters.length}</span>}
              </button>
              {activeFilters.map(f => (
                <span key={f.key} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 10px', background: '#E8F4FA', color: '#0E76A8', border: '1px solid #BAE6FD', borderRadius: 99, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>
                  {f.label}
                  <button onClick={() => removeFilter(f.key)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0E76A8', display: 'flex', padding: 0 }}><X size={10} /></button>
                </span>
              ))}
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 80 }}>
              <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: '#0E76A8' }} />
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div style={{ textAlign: 'center', padding: 60, background: 'white', borderRadius: 16 }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, color: '#EF4444', marginBottom: 16 }}>{error}</p>
              <button onClick={() => window.location.reload()} style={{ padding: '10px 24px', background: '#0E76A8', color: 'white', border: 'none', borderRadius: 10, fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                Thử lại
              </button>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && vouchers.length === 0 && (
            <div style={{ textAlign: 'center', padding: 60, background: 'white', borderRadius: 16 }}>
              <div style={{ fontSize: 56, marginBottom: 16, opacity: 0.3 }}>🔍</div>
              <h3 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 18, fontWeight: 800, color: '#1E293B', marginBottom: 8 }}>Không tìm thấy voucher</h3>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#64748B', marginBottom: 20 }}>
                Thử thay đổi từ khóa hoặc bộ lọc
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  style={{ padding: '10px 24px', background: '#0E76A8', color: 'white', border: 'none', borderRadius: 10, fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
          )}

          {/* Grid */}
          {!loading && !error && vouchers.length > 0 && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 18 }}>
                {vouchers.map((voucher) => {
                  const discount_pct = voucher.originalPrice
                    ? Math.round((1 - Number(voucher.salePrice) / Number(voucher.originalPrice)) * 100)
                    : 0;
                  const img = voucher.imageUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop';

                  return (
                    <Link
                      key={voucher.voucherId}
                      to={`/voucher/${voucher.voucherId}`}
                      style={{
                        display: 'flex', flexDirection: 'column',
                        background: 'white', borderRadius: 16,
                        overflow: 'hidden', textDecoration: 'none',
                        border: '1px solid #F1F5F9',
                        transition: 'all 0.25s ease',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 12px 32px rgba(14,118,168,0.14)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)';
                      }}
                    >
                      {/* Image */}
                      <div style={{ position: 'relative', height: 150, overflow: 'hidden', flexShrink: 0 }}>
                        <img src={img} alt={voucher.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        {discount_pct > 0 && (
                          <span style={{ position: 'absolute', top: 8, left: 8, background: '#EF4444', color: 'white', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6 }}>
                            -{discount_pct}%
                          </span>
                        )}
                        <span style={{ position: 'absolute', bottom: 8, left: 8, background: 'rgba(0,0,0,0.55)', color: 'white', fontSize: 11, fontWeight: 500, padding: '3px 8px', borderRadius: 6 }}>
                          {voucher.partner?.companyName || 'N/A'}
                        </span>
                      </div>

                      {/* Info */}
                      <div style={{ padding: '12px 14px 14px', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700, color: '#1E293B', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.4, margin: 0 }}>
                          {voucher.title}
                        </h3>

                        {/* Rating */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Star size={11} style={{ color: '#F59E0B', fill: '#F59E0B' }} />
                          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 700, color: '#F59E0B' }}>{voucher.averageRating?.toFixed(1) || '0.0'}</span>
                          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#94A3B8' }}>({voucher.reviewCount || 0})</span>
                        </div>

                        {/* Price */}
                        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                          <div>
                            {voucher.originalPrice && (
                              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#94A3B8', textDecoration: 'line-through', display: 'block' }}>
                                {formatPrice(voucher.originalPrice)}
                              </span>
                            )}
                            <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 800, color: '#0E76A8' }}>
                              {formatPrice(voucher.salePrice)}
                            </span>
                          </div>
                          {voucher.availableQuantity < 10 && (
                            <span style={{ fontSize: 10, fontWeight: 700, color: '#EF4444', background: '#FEE2E2', padding: '2px 6px', borderRadius: 4 }}>
                              Còn ít
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 36 }}>
                  <button
                    disabled={currentPage === 1}
                    onClick={() => updateParams('page', String(currentPage - 1))}
                    style={{ width: 36, height: 36, border: '1px solid #E2E8F0', borderRadius: 8, background: 'white', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                  </button>
                  {Array.from({ length: Math.min(pagination.totalPages, 7) }, (_, i) => {
                    const p = i + 1;
                    return (
                      <button
                        key={p}
                        onClick={() => updateParams('page', String(p))}
                        style={{
                          width: 36, height: 36, borderRadius: 8,
                          background: currentPage === p ? '#0E76A8' : 'white',
                          color: currentPage === p ? 'white' : '#64748B',
                          border: currentPage === p ? '1.5px solid #0E76A8' : '1px solid #E2E8F0',
                          fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: currentPage === p ? 700 : 400,
                          cursor: 'pointer',
                        }}
                      >
                        {p}
                      </button>
                    );
                  })}
                  <button
                    disabled={currentPage === pagination.totalPages}
                    onClick={() => updateParams('page', String(currentPage + 1))}
                    style={{ width: 36, height: 36, border: '1px solid #E2E8F0', borderRadius: 8, background: 'white', cursor: currentPage === pagination.totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === pagination.totalPages ? 0.4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Mobile filter drawer ── */}
      {showFilterDrawer && (
        <div
          onClick={() => setShowFilterDrawer(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-end' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'white', borderRadius: '20px 20px 0 0',
              width: '100%', maxHeight: '85vh', overflowY: 'auto',
              padding: '24px 20px 40px',
              animation: 'slideUp 0.25s ease-out',
            }}
          >
            {/* Drawer handle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 18, fontWeight: 800, color: '#1E293B', margin: 0 }}>Bộ lọc</h2>
              <button
                onClick={() => setShowFilterDrawer(false)}
                style={{ width: 32, height: 32, borderRadius: '50%', background: '#F1F5F9', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={16} style={{ color: '#64748B' }} />
              </button>
            </div>
            <FilterPanel />
            <button
              onClick={() => setShowFilterDrawer(false)}
              style={{
                width: '100%', padding: '14px', marginTop: 20,
                background: '#0E76A8', color: 'white',
                border: 'none', borderRadius: 12,
                fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Xem kết quả
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @media (max-width: 768px) {
          .desktop-filter { display: none !important; }
          .mobile-filter { display: block !important; }
          .mobile-filter-chips { display: flex !important; }
        }
        @media (min-width: 769px) {
          .mobile-filter { display: none !important; }
          .mobile-filter-chips { display: none !important; }
        }
      `}</style>
    </div>
  );
}
