import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { UtensilsCrossed, Wifi, ShoppingBag, Car, Loader2, CheckCircle2, MapPin, CalendarRange, Clock, Phone } from 'lucide-react';
import { voucherApi, cartApi, reviewApi } from '../services';
import type { Voucher, Review } from '../services';
import { formatPrice, formatDate, formatDateTime } from '../utils';
import Loading from './Loading';
import { Breadcrumb } from './Breadcrumb';

export function VoucherDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [voucher, setVoucher] = useState<Voucher | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'howto' | 'faqs' | 'related'>('overview');
  const [qty, setQty] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    if (!id) return;

    Promise.all([
      voucherApi.getById(Number(id)),
      voucherApi.getReviews(Number(id)),
    ])
      .then(([voucherRes, reviewsRes]) => {
        if (voucherRes.success && voucherRes.data) {
          setVoucher(voucherRes.data);
        }
        if (reviewsRes.success && reviewsRes.data) {
          setReviews(reviewsRes.data);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <Loading />;
  }

  if (error || !voucher) {
    return (
      <div style={{ background: '#F8FAFC', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <p style={{ color: '#EF4444' }}>{error || 'Không tìm thấy voucher'}</p>
        <Link to="/" style={{ color: '#0E76A8' }}>Quay về trang chủ</Link>
      </div>
    );
  }

  const discount = voucher.originalPrice
    ? Math.round((1 - Number(voucher.salePrice) / Number(voucher.originalPrice)) * 100)
    : 0;
  const totalPrice = Number(voucher.salePrice) * qty;
  const imageUrl = voucher.imageUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop';

  // BR-CUS-03: Tính số ngày còn lại từ endDate → hiển thị countdown overlay
  const daysLeft = (() => {
    if (!voucher.endDate) return null;
    const end = new Date(voucher.endDate).getTime();
    const now = Date.now();
    return Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
  })();
  const isExpiringSoon = daysLeft !== null && daysLeft <= 5;

  const handleAddToCart = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      if (confirm('Bạn cần đăng nhập để thêm vào giỏ hàng. Đăng nhập ngay?')) {
        window.location.href = '/login';
      }
      return;
    }

    try {
      setAddingToCart(true);
      await cartApi.addToCart(voucher.voucherId, qty);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    } catch (err: any) {
      alert(err.message || 'Không thể thêm vào giỏ hàng');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      if (confirm('Bạn cần đăng nhập để mua. Đăng nhập ngay?')) {
        window.location.href = '/login';
      }
      return;
    }

    try {
      setAddingToCart(true);
      const res = await cartApi.addToCart(voucher.voucherId, qty);
      // Ghi nhớ cartItemId vừa được thêm để trang /cart mặc định chỉ tick chọn
      // sản phẩm này (không tính các sản phẩm khác trong giỏ).
      // Backend trả về `data.item` (xem cartApi.addToCart). Fallback: nếu không có
      // thì cartItemId sẽ được Cart page tự resolve bằng (voucherId) khi load.
      const newItemId = res?.data?.item?.cartItemId;
      if (newItemId) {
        sessionStorage.setItem('buyNowItemId', String(newItemId));
      } else {
        // Không có cartItemId thì ghi nhớ voucherId để Cart dò lại khi render
        sessionStorage.setItem('buyNowVoucherId', String(voucher.voucherId));
      }
      navigate('/cart');
    } catch (err: any) {
      alert(err.message || 'Không thể thêm vào giỏ hàng');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    if (!token) {
      if (confirm('Bạn cần đăng nhập để gửi đánh giá. Đăng nhập ngay?')) {
        navigate('/login');
      }
      return;
    }
    if (!reviewComment.trim()) return;

    setSubmittingReview(true);
    try {
      const res = await reviewApi.create(voucher.voucherId, {
        rating: reviewRating,
        comment: reviewComment,
      });
      if (res.success) {
        setReviewSuccess(true);
        setReviewComment('');
        setReviewRating(5);
        setShowReviewForm(false);
        // Reload reviews to show the newly created one
        const reviewsRes = await voucherApi.getReviews(voucher.voucherId);
        if (reviewsRes.success && reviewsRes.data) {
          setReviews(reviewsRes.data);
        }
        setTimeout(() => setReviewSuccess(false), 3000);
      } else {
        throw new Error(res.error?.message || 'Gửi đánh giá thất bại.');
      }
    } catch (err: any) {
      alert(err.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh' }}>
      <Breadcrumb
        items={[
          { label: 'Trang chủ', href: '/' },
          { label: 'Khám phá Voucher', href: '/vouchers' },
          { label: voucher.title },
        ]}
      />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'start' }}>
          {/* LEFT: Image */}
          <div>
            <div
              style={{
                position: 'relative',
                borderRadius: 16,
                overflow: 'hidden',
                background: 'white',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              }}
            >
              <img
                src={imageUrl}
                alt={voucher.title}
                style={{ width: '100%', height: 360, objectFit: 'cover', display: 'block' }}
              />

              {/* Countdown badge - hiển thị trên ảnh khi còn ≤ 5 ngày */}
              {isExpiringSoon && (
                <div
                  style={{
                    position: 'absolute',
                    top: 16,
                    left: 16,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 14px',
                    background: daysLeft === 0
                      ? 'rgba(15, 23, 42, 0.92)'
                      : 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                    color: 'white',
                    borderRadius: 12,
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
                    fontFamily: 'Manrope, sans-serif',
                    animation: 'pulse 1.5s ease-in-out infinite',
                  }}
                >
                  <Clock size={18} />
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.9, lineHeight: 1.2 }}>
                      {daysLeft === 0 ? 'Hết hạn hôm nay' : 'Sắp hết hạn'}
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 800, lineHeight: 1.2 }}>
                      {daysLeft === 0
                        ? 'Hết hạn!'
                        : daysLeft === 1
                          ? 'Còn 1 ngày'
                          : `Còn ${daysLeft} ngày`}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Meta row */}
            <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, color: '#64748B', display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 12v10H4V12"/><path d="M2 7h20v5H2z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
                </svg>
                Mã giảm giá được cập nhật hàng ngày
              </span>
              <span style={{ fontSize: 13, color: '#64748B', display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                </svg>
                {voucher.reviewCount || 0} đánh giá
              </span>
            </div>
          </div>

          {/* RIGHT: Detail */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Badge + Title */}
            <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
                <span style={{ background: '#0E76A8', color: 'white', fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 999 }}>
                  -{discount}%
                </span>
                <span style={{ background: '#E8F4FA', color: '#0E76A8', fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 999 }}>
                  Phổ biến
                </span>
              </div>

              <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 26, fontWeight: 800, color: '#1E293B', lineHeight: 1.3, marginBottom: 12 }}>
                {voucher.title}
              </h1>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#E2E8F0', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#64748B' }}>
                  {(voucher.partner?.companyName || 'P')[0].toUpperCase()}
                </div>
                <span style={{ fontWeight: 600, color: '#1E293B', fontSize: 14 }}>{voucher.partner?.companyName || 'N/A'}</span>
                <span style={{ fontSize: 13, color: '#64748B' }}>
                  <span style={{ color: '#10B981', fontWeight: 700 }}>★ {voucher.averageRating?.toFixed(1) || '0.0'}</span> ({voucher.reviewCount || 0} đánh giá)
                </span>
              </div>

              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 4 }}>Đã bán</div>
                  <div style={{ fontWeight: 700, color: '#1E293B' }}>{voucher.totalQuantity - voucher.availableQuantity}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 4 }}>Còn lại</div>
                  <div style={{ fontWeight: 700, color: '#1E293B' }}>{voucher.availableQuantity}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 4 }}>HSD</div>
                  <div style={{
                    fontWeight: 700,
                    color: isExpiringSoon ? '#EF4444' : '#1E293B',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}>
                    {isExpiringSoon && <Clock size={14} />}
                    {daysLeft === 0 ? 'Hết hạn hôm nay' : `Còn ${daysLeft ?? voucher.expiryDays} ngày`}
                  </div>
                </div>
              </div>
            </div>

            {/* Action */}
            <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 13, color: '#64748B', marginBottom: 4 }}>Số lượng</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <button
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      style={{ width: 32, height: 32, borderRadius: 10, border: '1.5px solid #E2E8F0', background: 'white', color: '#1E293B', cursor: 'pointer', fontWeight: 700 }}
                    >
                      -
                    </button>
                    <span style={{ minWidth: 24, textAlign: 'center', fontWeight: 700 }}>{qty}</span>
                    <button
                      onClick={() => setQty(qty + 1)}
                      style={{ width: 32, height: 32, borderRadius: 10, border: '1.5px solid #E2E8F0', background: 'white', color: '#1E293B', cursor: 'pointer', fontWeight: 700 }}
                    >
                      +
                    </button>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, color: '#64748B', marginBottom: 4 }}>Thành tiền</div>
                  <div style={{ fontFamily: 'Manrope, sans-serif', fontSize: 26, fontWeight: 800, color: '#EF4444' }}>
                    {formatPrice(totalPrice)}
                  </div>
                </div>
              </div>

              <button
                onClick={handleBuyNow}
                disabled={addingToCart}
                style={{ width: '100%', padding: '14px 0', background: '#0E76A8', color: 'white', border: 'none', borderRadius: 12, fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 700, cursor: addingToCart ? 'wait' : 'pointer', opacity: addingToCart ? 0.7 : 1, marginBottom: 10 }}
              >
                Mua ngay
              </button>
              <button
                onClick={handleAddToCart}
                disabled={addingToCart}
                style={{ width: '100%', padding: '14px 0', background: addedToCart ? '#10B981' : 'white', color: addedToCart ? 'white' : '#0E76A8', border: '1.5px solid #E2E8F0', borderRadius: 12, fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 700, cursor: addingToCart ? 'wait' : 'pointer', opacity: addingToCart ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
              >
                {addedToCart ? (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Đã thêm vào giỏ!
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                    </svg>
                    Thêm vào giỏ hàng
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Intro */}
        <div style={{ marginTop: 32, background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <h3 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 800, color: '#1E293B' }}>Giới thiệu</h3>
            <span style={{ fontSize: 13, color: '#0E76A8', fontWeight: 700, cursor: 'pointer' }}>Chi tiết</span>
          </div>
          <div style={{ fontSize: 14, color: '#334155', lineHeight: 1.7 }}>
            {voucher.description || 'Không có mô tả'}
          </div>
        </div>

        {/* Service highlights */}
        <div style={{ marginTop: 24, background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 1px 2px rgba(0,0,0,0.04)', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
          {[
            { icon: <UtensilsCrossed size={32} color="#0E76A8" />, label: 'Fine Dining' },
            { icon: <Wifi size={32} color="#0E76A8" />, label: 'Free wifi' },
            { icon: <ShoppingBag size={32} color="#0E76A8" />, label: 'Take away' },
            { icon: <Car size={32} color="#0E76A8" />, label: 'Free parking' },
          ].map(item => (
            <div key={item.label} style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>{item.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1E293B' }}>{item.label}</div>
            </div>
          ))}
        </div>

        {/* Thời gian áp dụng + Chi nhánh — grid 2 cột */}
        <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Thời gian */}
          <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#E8F4FA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CalendarRange size={18} color="#0E76A8" />
              </div>
              <h3 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 800, color: '#1E293B', margin: 0 }}>
                Thời gian áp dụng
              </h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ background: '#F8FAFC', borderRadius: 12, padding: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, fontFamily: 'Inter, sans-serif' }}>
                  Ngày mở bán
                </div>
                <div style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 700, color: '#0E76A8' }}>
                  {formatDate(voucher.startDate)}
                </div>
              </div>
              <div style={{ background: '#FEF2F2', borderRadius: 12, padding: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, fontFamily: 'Inter, sans-serif' }}>
                  Ngày đóng bán
                </div>
                <div style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 700, color: '#EF4444' }}>
                  {formatDate(voucher.endDate)}
                </div>
              </div>
            </div>
            {isExpiringSoon && (
              <div style={{
                marginTop: 12,
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 12px',
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: 10,
                fontSize: 13,
                color: '#991B1B',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
              }}>
                <Clock size={14} />
                {daysLeft === 0
                  ? '⚠️ Voucher hết hạn hôm nay - hãy sử dụng ngay!'
                  : `⚠️ Voucher sắp hết hạn - chỉ còn ${daysLeft} ngày`}
              </div>
            )}
          </div>

          {/* Chi nhánh áp dụng */}
          <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MapPin size={18} color="#10B981" />
              </div>
              <h3 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 800, color: '#1E293B', margin: 0 }}>
                Chi nhánh áp dụng
                {voucher.voucherBranches && voucher.voucherBranches.length > 0 && (
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#64748B', marginLeft: 8 }}>
                    ({voucher.voucherBranches.length})
                  </span>
                )}
              </h3>
            </div>
            {voucher.voucherBranches && voucher.voucherBranches.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 260, overflowY: 'auto' }}>
                {voucher.voucherBranches.map((vb) => (
                  <div
                    key={vb.branch.branchId}
                    style={{
                      padding: 12,
                      background: '#F8FAFC',
                      borderRadius: 10,
                      border: '1px solid #E2E8F0',
                    }}
                  >
                    <div style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 700, color: '#1E293B', marginBottom: 4 }}>
                      {vb.branch.branchName}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 13, color: '#475569', marginBottom: 3, fontFamily: 'Inter, sans-serif' }}>
                      <MapPin size={13} color="#94A3B8" style={{ marginTop: 2, flexShrink: 0 }} />
                      <span>{vb.branch.address}</span>
                    </div>
                    {vb.branch.phoneNumber && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#0E76A8', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                        <Phone size={13} />
                        <a href={`tel:${vb.branch.phoneNumber}`} style={{ color: '#0E76A8', textDecoration: 'none' }}>
                          {vb.branch.phoneNumber}
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '24px 12px', textAlign: 'center', color: '#94A3B8', fontSize: 13, fontFamily: 'Inter, sans-serif' }}>
                <MapPin size={28} color="#CBD5E1" style={{ marginBottom: 8 }} />
                <div>Áp dụng tại tất cả chi nhánh của đối tác.</div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs section */}
        <div style={{ marginTop: 32, background: 'white', borderRadius: 16, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', overflowX: 'auto' }}>
            {(['overview', 'howto', 'faqs', 'related'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{ flex: 1, padding: '16px 12px', border: 'none', background: 'transparent', fontSize: 14, fontFamily: 'Inter, sans-serif', fontWeight: 700, color: activeTab === tab ? '#0E76A8' : '#64748B', cursor: 'pointer', borderBottom: activeTab === tab ? '2px solid #0E76A8' : '2px solid transparent' }}
              >
                {tab === 'overview' && 'Tổng quan'}
                {tab === 'howto' && 'Cách sử dụng'}
                {tab === 'faqs' && 'Câu hỏi thường gặp'}
                {tab === 'related' && 'Liên quan'}
              </button>
            ))}
          </div>

          <div style={{ padding: 24 }}>
            {activeTab === 'overview' && (
              <div>
                {/* Review header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <h4 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 800, color: '#1E293B', margin: 0 }}>
                    Đánh giá từ khách hàng
                    <span style={{ fontSize: 13, fontWeight: 400, color: '#64748B', marginLeft: 8 }}>({reviews.length})</span>
                  </h4>
                  {!showReviewForm && (
                    <button
                      onClick={() => setShowReviewForm(!showReviewForm)}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#0E76A8', color: 'white', border: 'none', borderRadius: 10, fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#0A5C87')}
                      onMouseLeave={e => (e.currentTarget.style.background = '#0E76A8')}
                    >
                      Viết đánh giá
                    </button>
                  )}
                </div>

                {/* Review form */}
                {showReviewForm && (
                  <form onSubmit={handleReviewSubmit} style={{ background: '#F8FAFC', border: '1.5px solid #BAE6FD', borderRadius: 16, padding: 20, marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                      <h5 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 700, color: '#1E293B', margin: 0 }}>Đánh giá của bạn</h5>
                      <button type="button" onClick={() => setShowReviewForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', fontSize: 20, lineHeight: 1 }}>×</button>
                    </div>
                    {/* Stars */}
                    <div style={{ display: 'flex', gap: 4, marginBottom: 14, alignItems: 'center' }}>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#64748B', marginRight: 4 }}>Điểm:</span>
                      {[1, 2, 3, 4, 5].map(star => (
                        <button key={star} type="button" onClick={() => setReviewRating(star)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 28, lineHeight: 1, padding: '2px 0' }}>
                          <svg width="28" height="28" viewBox="0 0 24 24" fill={star <= reviewRating ? '#F59E0B' : 'none'} stroke={star <= reviewRating ? '#F59E0B' : '#CBD5E1'} strokeWidth="1.5">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                        </button>
                      ))}
                      <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 700, color: '#F59E0B', marginLeft: 4 }}>{reviewRating}/5</span>
                    </div>
                    {/* Textarea */}
                    <div style={{ marginBottom: 14 }}>
                      <textarea
                        value={reviewComment}
                        onChange={e => setReviewComment(e.target.value)}
                        placeholder="Chia sẻ trải nghiệm của bạn về voucher này..."
                        rows={4}
                        required
                        style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #E2E8F0', borderRadius: 12, fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#1E293B', background: 'white', outline: 'none', resize: 'vertical', lineHeight: 1.6, boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                        onFocus={e => (e.currentTarget.style.borderColor = '#0E76A8')}
                        onBlur={e => (e.currentTarget.style.borderColor = '#E2E8F0')}
                      />
                      <p style={{ marginTop: 6, fontSize: 12, color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>Tối thiểu 10 ký tự. {reviewComment.length} / 500</p>
                    </div>
                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                      <button type="button" onClick={() => setShowReviewForm(false)} style={{ padding: '9px 20px', background: 'white', color: '#64748B', border: '1.5px solid #E2E8F0', borderRadius: 10, fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Hủy</button>
                      <button type="submit" disabled={submittingReview || reviewComment.trim().length < 10} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 20px', background: submittingReview || reviewComment.trim().length < 10 ? '#E2E8F0' : '#10B981', color: 'white', border: 'none', borderRadius: 10, fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700, cursor: submittingReview || reviewComment.trim().length < 10 ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}>
                        {submittingReview ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Đang gửi...</> : 'Gửi đánh giá'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Success toast */}
                {reviewSuccess && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 10, marginBottom: 16 }}>
                    <CheckCircle2 size={18} style={{ color: '#10B981', flexShrink: 0 }} />
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#065F46', fontWeight: 600 }}>Cảm ơn bạn! Đánh giá đã được gửi thành công.</span>
                  </div>
                )}

                {/* Review list */}
                {reviews.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {reviews.map(review => (
                      <div key={review.reviewId} style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#0E76A8', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                            {(review.customer?.fullName || 'K')[0].toUpperCase()}
                          </div>
                          <div>
                            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 700, color: '#1E293B' }}>{review.customer?.fullName || 'Khách hàng'}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 2 }}>
                              {[1, 2, 3, 4, 5].map(s => (
                                <svg key={s} width="13" height="13" viewBox="0 0 24 24" fill={s <= review.rating ? '#F59E0B' : 'none'} stroke={s <= review.rating ? '#F59E0B' : '#CBD5E1'} strokeWidth="1.5">
                                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                </svg>
                              ))}
                            </div>
                          </div>
                          <span style={{ marginLeft: 'auto', fontSize: 12, color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>{formatDate(review.createdAt)}</span>
                        </div>
                        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#334155', lineHeight: 1.6, margin: '4px 0 0 46px' }}>{review.comment || 'Không có bình luận'}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '32px 0' }}>
                    <div style={{ fontSize: 48, marginBottom: 8, opacity: 0.3 }}>★</div>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#94A3B8' }}>Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
                  </div>
                )}
              </div>
            )}
            {activeTab === 'howto' && (
              <div style={{ fontSize: 14, color: '#334155', lineHeight: 1.7 }}>
                Bước 1: Chọn sản phẩm và số lượng.<br />
                Bước 2: Thêm vào giỏ hàng hoặc mua ngay.<br />
                Bước 3: Chọn phương thức thanh toán.<br />
                Bước 4: Xác nhận đơn hàng và nhận mã voucher.
              </div>
            )}
            {activeTab === 'faqs' && (
              <div style={{ fontSize: 14, color: '#334155', lineHeight: 1.7 }}>
                - Voucher có áp dụng ngày lễ không?<br />
                - Có thể hoàn tiền không?<br />
                - Làm sao để sử dụng voucher?
              </div>
            )}
            {activeTab === 'related' && (
              <p style={{ fontSize: 14, color: '#64748B' }}>
                Các voucher liên quan sẽ hiển thị ở đây.
              </p>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.03); } }
      `}</style>
    </div>
  );
}
