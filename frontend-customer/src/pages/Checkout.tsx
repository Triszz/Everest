import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { cartApi, orderApi } from '../services/api';
import type { CartItem } from '../services/api';

export function Checkout() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loadingCart, setLoadingCart] = useState(true);
  const [cartError, setCartError] = useState<string | null>(null);

  const [buyerInfo, setBuyerInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
  });
  const [sendAsGift, setSendAsGift] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('atm');
  const [voucherCode, setVoucherCode] = useState('');
  const [applyingCode, setApplyingCode] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [discountError, setDiscountError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      if (confirm('Bạn cần đăng nhập để thanh toán. Đăng nhập ngay?')) {
        navigate('/login');
      } else {
        navigate('/cart');
      }
      return;
    }

    const user = localStorage.getItem('user');
    if (user) {
      try {
        const u = JSON.parse(user);
        setBuyerInfo({
          fullName: u.fullName || '',
          email: u.email || '',
          phone: u.phone || '',
        });
      } catch { /* ignore */ }
    }

    cartApi.getCart()
      .then(res => {
        if (res.success && res.data?.items) {
          setCartItems(res.data.items);
        } else if (res.data?.items?.length === 0) {
          navigate('/cart');
        }
      })
      .catch(err => setCartError(err.message))
      .finally(() => setLoadingCart(false));
  }, [navigate]);

  const subtotal = cartItems.reduce((sum, item) => sum + Number(item.voucher.salePrice) * item.quantity, 0);
  const total = subtotal - appliedDiscount;

  const formatPrice = (p: number) => p.toLocaleString('vi-VN') + 'đ';

  const handleApplyCode = async () => {
    if (!voucherCode.trim()) return;
    setApplyingCode(true);
    setDiscountError('');

    // ── Gọi API thật ──
    try {
      const res = await cartApi.applyCode(voucherCode.trim());
      if (res.success && res.data?.discount !== undefined) {
        setAppliedDiscount(res.data.discount);
        setDiscountError('');
      } else {
        setDiscountError(res.error?.message || 'Mã giảm giá không hợp lệ hoặc đã hết hạn.');
      }
    } catch {
      // ── Fallback: hardcoded codes cho dev mode (khi backend chưa hỗ trợ) ──
      await new Promise(r => setTimeout(r, 300));
      if (voucherCode.toUpperCase() === 'EVEREST10') {
        setAppliedDiscount(Math.round(subtotal * 0.1));
      } else if (voucherCode.toUpperCase() === 'SALE20') {
        setAppliedDiscount(Math.round(subtotal * 0.2));
      } else {
        setDiscountError('Mã giảm giá không hợp lệ hoặc đã hết hạn.');
      }
    } finally {
      setApplyingCode(false);
    }
  };

  const handleSubmit = async () => {
    if (!buyerInfo.fullName.trim() || !buyerInfo.email.trim() || !buyerInfo.phone.trim()) {
      alert('Vui lòng điền đầy đủ thông tin người mua.');
      return;
    }
    if (cartItems.length === 0) {
      navigate('/cart');
      return;
    }

    setSubmitting(true);
    try {
      // ── Step 1: create order ──
      const createRes = await orderApi.create({
        buyerInfo,
        items: cartItems.map(item => ({
          voucherId: item.voucherId,
          quantity: item.quantity,
        })),
        sendAsGift,
      });

      if (!createRes.success || !createRes.data?.orderId) {
        throw new Error(createRes.error?.message || 'Không thể tạo đơn hàng.');
      }

      // ── Step 2: checkout / payment ──
      const checkoutRes = await orderApi.checkout(createRes.data.orderId, {
        paymentMethod,
      });

      if (!checkoutRes.success) {
        throw new Error(checkoutRes.error?.message || 'Thanh toán thất bại.');
      }

      // ── Step 3: clear cart & redirect ──
      await cartApi.clearCart();
      navigate('/checkout/success', {
        state: { orderId: createRes.data.orderId },
      });
    } catch (err: any) {
      alert(err.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
      setSubmitting(false);
    }
  };

  if (loadingCart) {
    return (
      <div style={{ background: '#F8FAFC', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: '#0E76A8', margin: '0 auto 16px', display: 'block' }} />
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#64748B' }}>Đang tải giỏ hàng...</p>
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (cartError) {
    return (
      <div style={{ background: '#F8FAFC', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <p style={{ color: '#EF4444', fontFamily: 'Inter, sans-serif' }}>{cartError}</p>
        <Link to="/cart" style={{ color: '#0E76A8' }}>Quay lại giỏ hàng</Link>
      </div>
    );
  }

  const updateBuyer = (k: keyof typeof buyerInfo, v: string) =>
    setBuyerInfo(prev => ({ ...prev, [k]: v }));

  const inputStyle = {
    width: '100%', padding: '12px 14px', background: '#F1F5F9',
    border: '1.5px solid transparent', borderRadius: 10, fontSize: 14,
    color: '#1E293B', fontFamily: 'Inter, sans-serif', outline: 'none',
    boxSizing: 'border-box' as const,
  };

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh' }}>
      {/* Breadcrumb */}
      <div style={{ background: 'white', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '12px 24px' }}>
          <span style={{ fontSize: 13, color: '#64748B' }}>
            <Link to="/" style={{ color: '#0E76A8', textDecoration: 'none' }}>Trang chủ</Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <Link to="/cart" style={{ color: '#0E76A8', textDecoration: 'none' }}>Giỏ hàng</Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <span style={{ color: '#1E293B', fontWeight: 600 }}>Thanh toán</span>
          </span>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 24, alignItems: 'start' }}>

          {/* LEFT */}
          <div>
            {/* Buyer Info */}
            <div style={{ background: 'white', borderRadius: 16, padding: 28, boxShadow: '0 1px 2px rgba(0,0,0,0.04)', marginBottom: 16 }}>
              <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 800, color: '#1E293B', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, background: '#E0F2FE', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0E76A8" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                Thông tin người mua
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1E293B', marginBottom: 6 }}>Họ và tên</label>
                  <input type="text" placeholder="Nhập đầy đủ họ và tên" value={buyerInfo.fullName}
                    onChange={e => updateBuyer('fullName', e.target.value)}
                    style={inputStyle} onFocus={e => (e.currentTarget.style.borderColor = '#0E76A8')}
                    onBlur={e => (e.currentTarget.style.borderColor = 'transparent')} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1E293B', marginBottom: 6 }}>Email</label>
                    <input type="email" placeholder="example@email.com" value={buyerInfo.email}
                      onChange={e => updateBuyer('email', e.target.value)}
                      style={inputStyle} onFocus={e => (e.currentTarget.style.borderColor = '#0E76A8')}
                      onBlur={e => (e.currentTarget.style.borderColor = 'transparent')} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1E293B', marginBottom: 6 }}>Số điện thoại</label>
                    <input type="tel" placeholder="0xxx xxx xxx" value={buyerInfo.phone}
                      onChange={e => updateBuyer('phone', e.target.value)}
                      style={inputStyle} onFocus={e => (e.currentTarget.style.borderColor = '#0E76A8')}
                      onBlur={e => (e.currentTarget.style.borderColor = 'transparent')} />
                  </div>
                </div>
              </div>
            </div>

            {/* Gift toggle */}
            <div style={{ background: 'white', borderRadius: 16, padding: '20px 28px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, background: '#ECFDF5', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2">
                    <polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/>
                    <line x1="12" y1="22" x2="12" y2="7"/>
                    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
                    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
                  </svg>
                </div>
                <h3 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 700, color: '#1E293B' }}>Gửi tặng bạn bè</h3>
              </div>
              <button onClick={() => setSendAsGift(!sendAsGift)}
                style={{ width: 44, height: 24, borderRadius: 12, background: sendAsGift ? '#0E76A8' : '#CBD5E1', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', padding: 0 }}>
                <span style={{ position: 'absolute', top: 2, left: sendAsGift ? 22 : 2, width: 20, height: 20, borderRadius: '50%', background: 'white', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
              </button>
            </div>

            {/* Payment */}
            <div style={{ background: 'white', borderRadius: 16, padding: 28, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
              <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 800, color: '#1E293B', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, background: '#FEF3C7', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2">
                    <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
                  </svg>
                </div>
                Phương thức thanh toán
              </h2>

              {[
                { key: 'atm', label: 'ATM / Internet Banking', sub: 'Hỗ trợ tất cả ngân hàng nội địa' },
                { key: 'momo', label: 'Ví MoMo', sub: 'Thanh toán nhanh qua ứng dụng MoMo' },
                { key: 'visa', label: 'Thẻ Visa / Mastercard / JCB', sub: 'Thanh toán quốc tế bảo mật cao' },
              ].map(opt => (
                <label key={opt.key} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', border: paymentMethod === opt.key ? '2px solid #0E76A8' : '1.5px solid #E2E8F0', borderRadius: 12, background: 'white', cursor: 'pointer', marginBottom: 10, transition: 'all 0.2s' }}>
                  <input type="radio" name="payment" checked={paymentMethod === opt.key} onChange={() => setPaymentMethod(opt.key)} style={{ width: 18, height: 18, accentColor: '#0E76A8' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1E293B', marginBottom: 2 }}>{opt.label}</div>
                    <div style={{ fontSize: 12, color: '#64748B' }}>{opt.sub}</div>
                  </div>
                  {paymentMethod === opt.key && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0E76A8" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* RIGHT: Summary */}
          <div style={{ background: 'white', borderRadius: 16, padding: 28, boxShadow: '0 1px 2px rgba(0,0,0,0.04)', position: 'sticky', top: 88 }}>
            <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 800, color: '#1E293B', marginBottom: 20 }}>Tóm tắt đơn hàng</h2>

            {/* Cart items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #E2E8F0' }}>
              {cartItems.map(item => (
                <div key={item.voucherId} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <img src={item.voucher?.imageUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&h=200&fit=crop'} alt={item.voucher?.title}
                    style={{ width: 56, height: 56, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1E293B', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {item.voucher?.title || 'Voucher'}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: '#94A3B8' }}>SL: {String(item.quantity).padStart(2, '0')}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#1E293B' }}>{formatPrice(Number(item.voucher.salePrice) * item.quantity)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Discount code */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1E293B', marginBottom: 8 }}>Mã giảm giá</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input type="text" value={voucherCode} onChange={e => { setVoucherCode(e.target.value); setDiscountError(''); }}
                  placeholder="Nhập mã (thử: EVEREST10)"
                  style={{ flex: 1, padding: '10px 14px', background: '#F1F5F9', border: `1.5px solid ${discountError ? '#EF4444' : '#E2E8F0'}`, borderRadius: 10, fontSize: 13, fontFamily: 'Inter, sans-serif', fontWeight: 600, color: '#1E293B', outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#0E76A8')}
                  onBlur={e => (e.currentTarget.style.borderColor = discountError ? '#EF4444' : '#E2E8F0')} />
                <button onClick={handleApplyCode} disabled={applyingCode || !voucherCode.trim()}
                  style={{ padding: '10px 18px', background: applyingCode ? '#94A3B8' : '#0E76A8', color: 'white', border: 'none', borderRadius: 10, fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700, cursor: applyingCode || !voucherCode.trim() ? 'not-allowed' : 'pointer', transition: 'background 0.2s', whiteSpace: 'nowrap' }}>
                  {applyingCode ? '...' : 'Áp dụng'}
                </button>
              </div>
              {discountError && <p style={{ marginTop: 6, fontSize: 12, color: '#EF4444', fontFamily: 'Inter, sans-serif' }}>{discountError}</p>}
              {appliedDiscount > 0 && <p style={{ marginTop: 6, fontSize: 12, color: '#10B981', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>✓ Đã áp dụng mã giảm giá!</p>}
            </div>

            {/* Totals */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#64748B' }}>Tạm tính</span>
                <span style={{ color: '#1E293B', fontWeight: 600 }}>{formatPrice(subtotal)}</span>
              </div>
              {appliedDiscount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: '#64748B' }}>Giảm giá</span>
                  <span style={{ color: '#EF4444', fontWeight: 600 }}>-{formatPrice(appliedDiscount)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#64748B' }}>Phí dịch vụ</span>
                <span style={{ color: '#1E293B', fontWeight: 600 }}>Miễn phí</span>
              </div>
            </div>

            {/* Grand total */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 4 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#1E293B' }}>Tổng cộng</span>
                <span style={{ fontSize: 22, fontWeight: 800, color: '#0E76A8', fontFamily: 'Manrope, sans-serif' }}>{formatPrice(total)}</span>
              </div>
              <div style={{ textAlign: 'right', fontSize: 11, color: '#94A3B8', fontStyle: 'italic' }}>(Đã bao gồm VAT)</div>
            </div>

            {/* Pay button */}
            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={{ width: '100%', padding: '14px 0', background: submitting ? '#94A3B8' : '#0E76A8', color: 'white', border: 'none', borderRadius: 12, fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 800, cursor: submitting ? 'wait' : 'pointer', transition: 'background 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, letterSpacing: '0.5px' }}
              onMouseEnter={e => { if (!submitting) e.currentTarget.style.background = '#0A5C87'; }}
              onMouseLeave={e => { if (!submitting) e.currentTarget.style.background = '#0E76A8'; }}
            >
              {submitting ? (
                <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Đang xử lý...</>
              ) : (
                <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> THANH TOÁN NGAY</>
              )}
            </button>

            {/* Trust badges */}
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #E2E8F0', textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: '#94A3B8', letterSpacing: '1px', lineHeight: 1.6 }}>
                ĐẢM BẢO BẢO MẬT BỞI QUỐC TẾ PCI DSS
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
