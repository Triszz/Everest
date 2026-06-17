import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { UtensilsCrossed, Wifi, ShoppingBag, Car } from 'lucide-react';

export function VoucherDetail() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<'overview' | 'howto' | 'faqs' | 'related'>('overview');
  const [qty, setQty] = useState(1);

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh' }}>
      {/* Breadcrumb + Back */}
      <div style={{ background: 'white', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '12px 24px' }}>
          <Link
            to="/vouchers"
            style={{ fontSize: 13, color: '#64748B', textDecoration: 'none', fontWeight: 500 }}
          >
            ← Quay lại Danh sách Voucher
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'start' }}>
          {/* LEFT: Image */}
          <div>
            <div
              style={{
                borderRadius: 16,
                overflow: 'hidden',
                background: 'white',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop"
                alt="Voucher"
                style={{ width: '100%', height: 360, objectFit: 'cover', display: 'block' }}
              />
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
                15.2k lượt xem
              </span>
            </div>
          </div>

          {/* RIGHT: Detail */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Badge + Title */}
            <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
                <span
                  style={{
                    background: '#0E76A8',
                    color: 'white',
                    fontSize: 12,
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: 999,
                  }}
                >
                  Khuyến mãi
                </span>
                <span
                  style={{
                    background: '#E8F4FA',
                    color: '#0E76A8',
                    fontSize: 12,
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: 999,
                  }}
                >
                  Phổ biến
                </span>
                <span
                  style={{
                    background: '#E8F4FA',
                    color: '#0E76A8',
                    fontSize: 12,
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: 999,
                  }}
                >
                  Mới nhất
                </span>
              </div>

              <h1
                style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: 26,
                  fontWeight: 800,
                  color: '#1E293B',
                  lineHeight: 1.3,
                  marginBottom: 12,
                }}
              >
                Giảm Giá 30% Tại Bami N'Steak
              </h1>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: '#E2E8F0',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 13,
                    color: '#64748B',
                  }}
                >
                  B
                </div>
                <span style={{ fontWeight: 600, color: '#1E293B', fontSize: 14 }}>Bami N'Steak</span>
                <span style={{ fontSize: 13, color: '#64748B' }}>
                  <span style={{ color: '#10B981', fontWeight: 700 }}>★ 4.9</span> (1.2k đánh giá)
                </span>
              </div>

              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 4 }}>Đã bán</div>
                  <div style={{ fontWeight: 700, color: '#1E293B' }}>231</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 4 }}>Đã lưu</div>
                  <div style={{ fontWeight: 700, color: '#1E293B' }}>89</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 4 }}>HSD</div>
                  <div style={{ fontWeight: 700, color: '#EF4444' }}>10/09/2026</div>
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
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 10,
                        border: '1.5px solid #E2E8F0',
                        background: 'white',
                        color: '#1E293B',
                        cursor: 'pointer',
                        fontWeight: 700,
                      }}
                    >
                      -
                    </button>
                    <span style={{ minWidth: 24, textAlign: 'center', fontWeight: 700 }}>{qty}</span>
                    <button
                      onClick={() => setQty(qty + 1)}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 10,
                        border: '1.5px solid #E2E8F0',
                        background: 'white',
                        color: '#1E293B',
                        cursor: 'pointer',
                        fontWeight: 700,
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, color: '#64748B', marginBottom: 4 }}>Thành tiền</div>
                  <div
                    style={{
                      fontFamily: 'Manrope, sans-serif',
                      fontSize: 26,
                      fontWeight: 800,
                      color: '#EF4444',
                    }}
                  >
                    119.700đ
                  </div>
                </div>
              </div>

              <button
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
                  marginBottom: 10,
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#0A5C87')}
                onMouseLeave={e => (e.currentTarget.style.background = '#0E76A8')}
              >
                Mua ngay
              </button>
              <button
                style={{
                  width: '100%',
                  padding: '14px 0',
                  background: 'white',
                  color: '#0E76A8',
                  border: '1.5px solid #E2E8F0',
                  borderRadius: 12,
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  transition: 'border-color 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#0E76A8')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#E2E8F0')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                Thêm vào giỏ hàng
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
            Giảm 30% tối đa 50k khi thanh toán online. Ưu đãi áp dụng 2-4 người, buffet trưa/tối không áp dụng cùng các khuyến mãi khác.
          </div>
        </div>

        {/* Service highlights */}
        <div style={{
          marginTop: 24,
          background: 'white',
          borderRadius: 16,
          padding: 24,
          boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 20,
        }}>
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

        {/* Tabs section */}
        <div style={{ marginTop: 32, background: 'white', borderRadius: 16, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
          <div
            style={{
              display: 'flex',
              borderBottom: '1px solid #E2E8F0',
              overflowX: 'auto',
            }}
          >
            {(['overview', 'howto', 'faqs', 'related'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1,
                  padding: '16px 12px',
                  border: 'none',
                  background: 'transparent',
                  fontSize: 14,
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 700,
                  color: activeTab === tab ? '#0E76A8' : '#64748B',
                  cursor: 'pointer',
                  borderBottom: activeTab === tab ? '2px solid #0E76A8' : '2px solid transparent',
                }}
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
              <div style={{ fontSize: 14, color: '#334155', lineHeight: 1.7 }}>
                Nhà hàng Bami N'Steak là chuỗi nhà hàng chuyên về bít tết và các món ăn Á - Âu, mang đến trải nghiệm ẩm thực đáng nhớ.
              </div>
            )}
            {activeTab === 'howto' && (
              <div style={{ fontSize: 14, color: '#334155', lineHeight: 1.7 }}>
                Bước 1: Chọn sản phẩm.<br />
                Bước 2: Chọn phương thức thanh toán.<br />
                Bước 3: Xác nhận đơn hàng.
              </div>
            )}
            {activeTab === 'faqs' && (
              <div style={{ fontSize: 14, color: '#334155', lineHeight: 1.7 }}>
                - Voucher có áp dụng ngày lễ không?<br />
                - Có thể hoàn tiền không?
              </div>
            )}
            {activeTab === 'related' && (
              <div style={{ fontSize: 14, color: '#334155', lineHeight: 1.7 }}>
                Các voucher liên quan sẽ hiển thị ở đây.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
