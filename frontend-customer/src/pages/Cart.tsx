import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, Loader2 } from 'lucide-react';
import { cartApi, Cart, CartItem } from '../services/api';

export function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await cartApi.getCart();
      if (response.success && response.data) {
        setCart(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Không thể tải giỏ hàng');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const updateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    try {
      setActionLoading(itemId);
      await cartApi.updateCartItem(itemId, newQuantity);
      await fetchCart();
    } catch (err: any) {
      alert(err.message || 'Cập nhật thất bại');
    } finally {
      setActionLoading(null);
    }
  };

  const removeItem = async (itemId: number) => {
    if (!confirm('Bạn có chắc muốn xóa item này?')) return;
    try {
      setActionLoading(itemId);
      await cartApi.removeCartItem(itemId);
      await fetchCart();
    } catch (err: any) {
      alert(err.message || 'Xóa thất bại');
    } finally {
      setActionLoading(null);
    }
  };

  const clearCart = async () => {
    if (!confirm('Bạn có chắc muốn xóa toàn bộ giỏ hàng?')) return;
    try {
      setLoading(true);
      await cartApi.clearCart();
      await fetchCart();
    } catch (err: any) {
      alert(err.message || 'Xóa thất bại');
      setLoading(false);
    }
  };

  if (loading && !cart) {
    return (
      <div style={{ background: '#F8FAFC', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: '#0E76A8' }} />
          <p style={{ marginTop: 16, color: '#64748B' }}>Đang tải giỏ hàng...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ background: '#F8FAFC', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: 32 }}>
          <p style={{ color: '#EF4444', marginBottom: 16 }}>{error}</p>
          <button
            onClick={fetchCart}
            style={{
              padding: '10px 24px',
              background: '#0E76A8',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
            }}
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const items = cart?.items || [];
  const total = cart?.summary.totalAmount || 0;

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh' }}>
      {/* Breadcrumb */}
      <div style={{ background: 'white', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '12px 24px' }}>
          <span style={{ fontSize: 13, color: '#64748B' }}>
            <span style={{ color: '#0E76A8', cursor: 'pointer' }}>Trang chủ</span>
            <span style={{ margin: '0 8px' }}>/</span>
            <span style={{ color: '#1E293B', fontWeight: 600 }}>Giỏ hàng</span>
          </span>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: 16 }}>
            <ShoppingBag size={64} style={{ color: '#CBD5E1', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1E293B', marginBottom: 8 }}>Giỏ hàng trống</h3>
            <p style={{ color: '#64748B', marginBottom: 24 }}>Hãy thêm voucher vào giỏ hàng của bạn</p>
            <button
              onClick={() => navigate('/vouchers')}
              style={{
                padding: '12px 32px',
                background: '#0E76A8',
                color: 'white',
                border: 'none',
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Khám phá voucher
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'start' }}>
            {/* LEFT: Cart items */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1E293B' }}>
                  Giỏ hàng ({items.length} sản phẩm)
                </h2>
                <button
                  onClick={clearCart}
                  style={{
                    padding: '8px 16px',
                    background: '#FEE2E2',
                    color: '#EF4444',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Xóa tất cả
                </button>
              </div>

              <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
                {items.map(item => (
                  <div
                    key={item.cartItemId}
                    style={{
                      display: 'flex',
                      gap: 16,
                      padding: '16px 0',
                      borderBottom: '1px solid #E2E8F0',
                    }}
                  >
                    {/* Image */}
                    <img
                      src={item.voucher.imageUrl || 'https://via.placeholder.com/120x100?text=Voucher'}
                      alt={item.voucher.title}
                      style={{ width: 120, height: 100, borderRadius: 12, objectFit: 'cover' }}
                    />

                    {/* Info */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                          <div>
                            <h3 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 700, color: '#1E293B', marginBottom: 4 }}>
                              {item.voucher.title}
                            </h3>
                            <p style={{ fontSize: 12, color: '#64748B', marginBottom: 4 }}>
                              {item.voucher.partner.companyName}
                            </p>
                            <p style={{ fontSize: 12, color: '#64748B' }}>
                              {item.voucher.expiryDays} ngày sử dụng
                            </p>
                          </div>
                          <button
                            onClick={() => removeItem(item.cartItemId)}
                            disabled={actionLoading === item.cartItemId}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#94A3B8',
                              cursor: 'pointer',
                              padding: 4,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              opacity: actionLoading === item.cartItemId ? 0.5 : 1,
                            }}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                          <div>
                            <span style={{ fontSize: 14, fontWeight: 700, color: '#EF4444' }}>
                              {(item.voucher.salePrice * item.quantity).toLocaleString('vi-VN')}đ
                            </span>
                            {item.voucher.originalPrice > item.voucher.salePrice && (
                              <span style={{ fontSize: 12, color: '#94A3B8', textDecoration: 'line-through', marginLeft: 8 }}>
                                {item.voucher.originalPrice.toLocaleString('vi-VN')}đ
                              </span>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#F8FAFC', borderRadius: 10, padding: '4px 8px', border: '1.5px solid #E2E8F0' }}>
                            <button
                              onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                              disabled={actionLoading === item.cartItemId || item.quantity <= 1}
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: 8,
                                border: 'none',
                                background: 'white',
                                color: '#1E293B',
                                cursor: item.quantity <= 1 ? 'not-allowed' : 'pointer',
                                opacity: item.quantity <= 1 ? 0.5 : 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                              }}
                            >
                              <Minus size={16} />
                            </button>
                            <span style={{ minWidth: 24, textAlign: 'center', fontWeight: 700, fontSize: 14, color: '#1E293B' }}>
                              {actionLoading === item.cartItemId ? '...' : item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                              disabled={actionLoading === item.cartItemId || item.quantity >= item.voucher.availableQuantity}
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: 8,
                                border: 'none',
                                background: 'white',
                                color: '#1E293B',
                                cursor: item.quantity >= item.voucher.availableQuantity ? 'not-allowed' : 'pointer',
                                opacity: item.quantity >= item.voucher.availableQuantity ? 0.5 : 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                              }}
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: Order summary */}
            <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 1px 2px rgba(0,0,0,0.04)', position: 'sticky', top: 24 }}>
              <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 800, color: '#1E293B', marginBottom: 20 }}>
                Thông tin đơn hàng
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#64748B' }}>
                  <span>Tạm tính ({items.length} sản phẩm)</span>
                  <span style={{ color: '#1E293B', fontWeight: 600 }}>{total.toLocaleString('vi-VN')}đ</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#64748B' }}>
                  <span>Phí vận chuyển</span>
                  <span style={{ color: '#10B981', fontWeight: 600 }}>Miễn phí</span>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '16px 0',
                  borderTop: '1.5px solid #E2E8F0',
                  borderBottom: '1.5px solid #E2E8F0',
                  marginBottom: 16,
                }}
              >
                <span style={{ fontSize: 15, fontWeight: 700, color: '#1E293B' }}>Tổng cộng</span>
                <span style={{ fontSize: 18, fontWeight: 800, color: '#EF4444' }}>{total.toLocaleString('vi-VN')}đ</span>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                style={{
                  width: '100%',
                  padding: '14px 0',
                  background: '#0E76A8',
                  color: 'white',
                  border: 'none',
                  borderRadius: 12,
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#0A5C87')}
                onMouseLeave={e => (e.currentTarget.style.background = '#0E76A8')}
              >
                Mua ngay
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
