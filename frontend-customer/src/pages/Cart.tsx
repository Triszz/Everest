import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { cartApi } from '../services';
import type { Cart, CartItem } from '../services';
import { Breadcrumb } from '../components/Breadcrumb';
import { formatPrice } from '../utils';
import Loading from '../components/Loading';

export function CartPage() {
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
    return <Loading />;
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
      <Breadcrumb
        items={[
          { label: 'Trang chủ', href: '/' },
          { label: 'Giỏ hàng' },
        ]}
      />

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
                      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                        {/* Quantity control */}
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 0,
                          background: '#F8FAFC',
                          borderRadius: 10,
                          border: '1.5px solid #E2E8F0',
                          overflow: 'hidden',
                        }}>
                          <button
                            onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                            disabled={actionLoading === item.cartItemId || item.quantity <= 1}
                            style={{
                              width: 34,
                              height: 34,
                              border: 'none',
                              background: 'transparent',
                              color: item.quantity <= 1 ? '#CBD5E1' : '#1E293B',
                              cursor: item.quantity <= 1 ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'background 0.15s',
                              fontSize: 16,
                              fontWeight: 600,
                            }}
                            onMouseEnter={e => {
                              if (item.quantity > 1) e.currentTarget.style.background = '#E2E8F0';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = 'transparent';
                            }}
                          >
                            −
                          </button>
                          <div style={{
                            width: 1,
                            height: 18,
                            background: '#E2E8F0',
                          }} />
                          <span style={{
                            minWidth: 36,
                            textAlign: 'center',
                            fontWeight: 700,
                            fontSize: 14,
                            color: '#1E293B',
                            fontFamily: 'Inter, sans-serif',
                            userSelect: 'none',
                          }}>
                            {actionLoading === item.cartItemId ? '...' : item.quantity}
                          </span>
                          <div style={{
                            width: 1,
                            height: 18,
                            background: '#E2E8F0',
                          }} />
                          <button
                            onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                            disabled={actionLoading === item.cartItemId || item.quantity >= item.voucher.availableQuantity}
                            style={{
                              width: 34,
                              height: 34,
                              border: 'none',
                              background: 'transparent',
                              color: item.quantity >= item.voucher.availableQuantity ? '#CBD5E1' : '#1E293B',
                              cursor: item.quantity >= item.voucher.availableQuantity ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'background 0.15s',
                              fontSize: 16,
                              fontWeight: 600,
                            }}
                            onMouseEnter={e => {
                              if (item.quantity < item.voucher.availableQuantity) e.currentTarget.style.background = '#E2E8F0';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = 'transparent';
                            }}
                          >
                            +
                          </button>
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
                <span style={{ fontSize: 18, fontWeight: 800, color: '#EF4444' }}>{formatPrice(total)}</span>
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
