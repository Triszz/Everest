import { useState, useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { categoryApi } from '../services';
import type { Voucher } from '../services';
import { formatPrice } from '../utils';
import { Breadcrumb } from '../components/Breadcrumb';

export function CategoryPage() {
  const { id } = useParams<{ id: string }>();
  const [category, setCategory] = useState<{ categoryId: number; categoryName: string } | null>(null);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = Number(searchParams.get('page')) || 1;
  const sort = searchParams.get('sort') || 'newest';

  useEffect(() => {
    if (!id) return;

    categoryApi.getVouchers(Number(id), {
      page: currentPage,
      sort: sort as 'price_asc' | 'price_desc' | 'popular' | 'newest',
    })
      .then((res) => {
        if (res.success) {
          setCategory(res.category);
          setVouchers(res.vouchers);
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
  }, [id, currentPage, sort]);

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

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh' }}>
      <Breadcrumb
        backHref="/vouchers"
        items={[
          { label: 'Trang chủ', href: '/' },
          { label: 'Danh mục', href: '/vouchers' },
          { label: category?.categoryName || 'Đang tải...' },
        ]}
      />

      {/* Category Title + Sort */}
      <div style={{ background: 'white', borderBottom: '1px solid #E2E8F0', padding: '20px 0' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 26, fontWeight: 800, color: '#1E293B', margin: 0 }}>
            {category?.categoryName || 'Danh mục'}
          </h1>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => updateParams('sort', e.target.value)}
            style={{
              padding: '8px 14px',
              border: '1.5px solid #E2E8F0',
              borderRadius: 10,
              fontSize: 14,
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="newest">Mới nhất</option>
            <option value="popular">Phổ biến</option>
            <option value="price_asc">Giá: Thấp đến Cao</option>
            <option value="price_desc">Giá: Cao đến Thấp</option>
          </select>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: '#64748B' }}>Đang tải...</p>
        ) : error ? (
          <p style={{ textAlign: 'center', color: '#EF4444' }}>{error}</p>
        ) : vouchers.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#64748B' }}>Không có voucher nào trong danh mục này</p>
        ) : (
          <>
            <p style={{ marginBottom: 24, color: '#64748B' }}>
              Tìm thấy {pagination.total} voucher
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
              {vouchers.map((voucher) => {
                const discount = voucher.originalPrice
                  ? Math.round((1 - Number(voucher.salePrice) / Number(voucher.originalPrice)) * 100)
                  : 0;
                const imageUrl = voucher.imageUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop';
                const daysLeft = voucher.endDate
                  ? Math.max(0, Math.ceil((new Date(voucher.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
                  : null;
                const isExpiringSoon = daysLeft !== null && daysLeft <= 5;

                return (
                  <Link
                    key={voucher.voucherId}
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
                    onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 12px 32px rgba(14,118,168,0.15)';
                    }}
                    onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)';
                    }}
                  >
                    <div style={{ position: 'relative', height: 160, overflow: 'hidden' }}>
                      <img src={imageUrl} alt={voucher.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <span style={{ position: 'absolute', top: 10, left: 10, background: '#EF4444', color: 'white', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6 }}>
                        -{discount}%
                      </span>
                      <span style={{ position: 'absolute', bottom: 10, left: 10, background: 'rgba(0,0,0,0.55)', color: 'white', fontSize: 11, fontWeight: 500, padding: '3px 9px', borderRadius: 6 }}>
                        {voucher.partner?.companyName || 'N/A'}
                      </span>
                    </div>
                    <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1E293B', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {voucher.title}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ color: '#F59E0B' }}>★</span>
                        <span style={{ fontSize: 12, color: '#64748B' }}>{voucher.averageRating?.toFixed(1) || '0.0'}</span>
                        <span style={{ fontSize: 11, color: '#94A3B8' }}>({voucher.reviewCount || 0})</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                        <div>
                          <span style={{ fontSize: 12, color: '#94A3B8', textDecoration: 'line-through', display: 'block' }}>{formatPrice(voucher.originalPrice)}</span>
                          <span style={{ fontSize: 17, fontWeight: 800, color: '#0E76A8' }}>{formatPrice(voucher.salePrice)}</span>
                        </div>
                      </div>

                      {/* Countdown dưới giá - chỉ khi ≤5 ngày */}
                      {isExpiringSoon && (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '4px 8px',
                            borderRadius: 6,
                            fontSize: 11,
                            fontWeight: 700,
                            fontFamily: 'Inter, sans-serif',
                            color: 'white',
                            alignSelf: 'flex-start',
                            background:
                              daysLeft === 0
                                ? 'rgba(15, 23, 42, 0.92)'
                                : daysLeft === 1
                                  ? 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)'
                                  : 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
                            boxShadow: '0 2px 6px rgba(239, 68, 68, 0.35)',
                          }}
                        >
                          <Clock size={11} />
                          {daysLeft === 0
                            ? 'Hết hạn hôm nay'
                            : daysLeft === 1
                              ? 'Còn 1 ngày'
                              : `Còn ${daysLeft} ngày`}
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32 }}>
                <button
                  disabled={currentPage === 1}
                  onClick={() => updateParams('page', String(currentPage - 1))}
                  style={{ padding: '8px 16px', border: '1px solid #E2E8F0', borderRadius: 8, background: 'white', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}
                >
                  ←
                </button>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => updateParams('page', String(page))}
                    style={{
                      padding: '8px 16px',
                      border: page === currentPage ? '2px solid #0E76A8' : '1px solid #E2E8F0',
                      borderRadius: 8,
                      background: page === currentPage ? '#E8F4FA' : 'white',
                      color: page === currentPage ? '#0E76A8' : '#64748B',
                      fontWeight: page === currentPage ? 700 : 400,
                      cursor: 'pointer',
                    }}
                  >
                    {page}
                  </button>
                ))}
                <button
                  disabled={currentPage === pagination.totalPages}
                  onClick={() => updateParams('page', String(currentPage + 1))}
                  style={{ padding: '8px 16px', border: '1px solid #E2E8F0', borderRadius: 8, background: 'white', cursor: currentPage === pagination.totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === pagination.totalPages ? 0.5 : 1 }}
                >
                  →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
