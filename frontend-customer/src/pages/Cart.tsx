import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2 } from 'lucide-react';

export function Cart() {
  const navigate = useNavigate();
  const [items, setItems] = useState([
    {
      id: 1,
      name: 'Combo Á - Âu',
      description: 'Bít tết bò + mì Ý',
      price: 299000,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop',
    },
    {
      id: 2,
      name: 'Set Lẩu Thái',
      description: 'Lẩu Thái hải sản',
      price: 399000,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=200&h=200&fit=crop',
    },
  ]);

  const updateQuantity = (id: number, delta: number) => {
    setItems(items =>
      items
        .map(item => (item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item))
        .filter(item => item.quantity > 0)
    );
  };

  const removeItem = (id: number) => {
    setItems(items => items.filter(item => item.id !== id));
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh' }}>
      {/* Breadcrumb */}
      <div style={{ background: 'white', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '12px 24px' }}>
          <span style={{ fontSize: 13, color: '#64748B' }}>
            <span style={{ color: '#0E76A8', cursor: 'pointer' }}>Giảm giá</span>
            <span style={{ margin: '0 8px' }}>/</span>
            <span style={{ color: '#0E76A8', cursor: 'pointer' }}>Nhà hàng</span>
            <span style={{ margin: '0 8px' }}>/</span>
            <span style={{ color: '#1E293B', fontWeight: 600 }}>Giỏ hàng</span>
          </span>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'start' }}>
          {/* LEFT: Cart items */}
          <div>
            <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 1px 2px rgba(0,0,0,0.04)', marginBottom: 16 }}>
              {items.map(item => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    gap: 16,
                    padding: '16px 0',
                    borderBottom: '1px solid #E2E8F0',
                  }}
                >
                  {/* Image */}
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{ width: 120, height: 100, borderRadius: 12, objectFit: 'cover' }}
                  />

                  {/* Info */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <h3 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 800, color: '#1E293B', marginBottom: 4 }}>
                          {item.name}
                        </h3>
                        <button
                          onClick={() => removeItem(item.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#94A3B8',
                            cursor: 'pointer',
                            padding: 4,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      <p style={{ fontSize: 13, color: '#64748B', marginBottom: 12 }}>{item.description}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: 16, fontWeight: 700, color: '#EF4444' }}>
                          {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#F8FAFC', borderRadius: 10, padding: '4px 8px', border: '1.5px solid #E2E8F0' }}>
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: 8,
                              border: 'none',
                              background: 'white',
                              color: '#1E293B',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                            }}
                          >
                            <Minus size={16} />
                          </button>
                          <span style={{ minWidth: 24, textAlign: 'center', fontWeight: 700, fontSize: 14, color: '#1E293B' }}>{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: 8,
                              border: 'none',
                              background: 'white',
                              color: '#1E293B',
                              cursor: 'pointer',
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
          <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
            <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 800, color: '#1E293B', marginBottom: 20 }}>
              Thông tin đơn hàng
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#64748B' }}>
                <span>Tạm tính</span>
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
      </div>
    </div>
  );
}
