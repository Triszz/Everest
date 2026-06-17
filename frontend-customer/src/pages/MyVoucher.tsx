import { useState } from 'react';

export function MyVoucher() {
  const [vouchers] = useState([
    {
      id: 1,
      name: 'Giảm giá 50%',
      description: 'Áp dụng cho đơn hàng từ 100.000đ',
      price: 50,
      expiryDate: '30/06/2026',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200&h=200&fit=crop',
      status: 'active',
    },
    {
      id: 2,
      name: 'Freeship',
      description: 'Miễn phí vận chuyển đơn từ 200.000đ',
      price: 0,
      expiryDate: '15/07/2026',
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=200&h=200&fit=crop',
      status: 'active',
    },
    {
      id: 3,
      name: 'Giảm 30.000đ',
      description: 'Đơn hàng đầu tiên',
      price: 30,
      expiryDate: '31/12/2026',
      image: 'https://images.unsplash.com/photo-1556742077-0a6b6a4b7b6e?w=200&h=200&fit=crop',
      status: 'expired',
    },
  ]);

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
            <span style={{ color: '#1E293B', fontWeight: 600 }}>Voucher của tôi</span>
          </span>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
          {/* LEFT: Voucher List */}
          <div>
            <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 1px 2px rgba(0,0,0,0.04)', marginBottom: 16 }}>
              <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 800, color: '#1E293B', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 36,
                  height: 36,
                  background: '#FEF3C7',
                  borderRadius: 10,
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2">
                    <path d="M20 12v10H4V12"/>
                    <path d="M2 7h20v5H2z"/>
                    <path d="M12 22V7"/>
                    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
                    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
                  </svg>
                </span>
                Voucher đã lưu
              </h2>

              {vouchers.map(voucher => (
                <div
                  key={voucher.id}
                  style={{
                    display: 'flex',
                    gap: 16,
                    padding: '16px 0',
                    borderBottom: '1px solid #E2E8F0',
                    alignItems: 'center',
                    opacity: voucher.status === 'expired' ? 0.6 : 1,
                  }}
                >
                  {/* Image */}
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <img
                      src={voucher.image}
                      alt={voucher.name}
                      style={{ width: 120, height: 90, borderRadius: 12, objectFit: 'cover' }}
                    />
                    {voucher.status === 'expired' && (
                      <span style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(0,0,0,0.4)',
                        borderRadius: 12,
                        color: 'white',
                        fontSize: 12,
                        fontWeight: 700,
                      }}>
                        Hết hạn
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 6, minWidth: 0 }}>
                    <div>
                      <h3 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 700, color: '#1E293B', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {voucher.name}
                      </h3>
                      <p style={{ fontSize: 13, color: '#64748B', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{voucher.description}</p>
                      <span style={{ fontSize: 12, color: '#94A3B8' }}>HSD: {voucher.expiryDate}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#EF4444' }}>
                        {voucher.price > 0 ? `Giảm ${voucher.price}%` : 'Freeship'}
                      </span>
                      <button
                        disabled={voucher.status === 'expired'}
                        style={{
                          padding: '8px 20px',
                          background: voucher.status === 'expired' ? '#E2E8F0' : '#0E76A8',
                          color: voucher.status === 'expired' ? '#94A3B8' : 'white',
                          border: 'none',
                          borderRadius: 10,
                          fontFamily: 'Inter, sans-serif',
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: voucher.status === 'expired' ? 'not-allowed' : 'pointer',
                          transition: 'background 0.2s',
                        }}
                        onMouseEnter={e => {
                          if (voucher.status !== 'expired') {
                            e.currentTarget.style.background = '#0A5C87';
                          }
                        }}
                        onMouseLeave={e => {
                          if (voucher.status !== 'expired') {
                            e.currentTarget.style.background = '#0E76A8';
                          }
                        }}
                      >
                        Mua ngay
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Sidebar */}
          <div>
            {/* User Info Card */}
            <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 1px 2px rgba(0,0,0,0.04)', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: '#E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <div>
                  <h3 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 700, color: '#1E293B', marginBottom: 2 }}>
                    Nguyễn Văn A
                  </h3>
                  <p style={{ fontSize: 13, color: '#94A3B8' }}>0901234567</p>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: 'Thông tin tài khoản', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> },
                  { label: 'Địa chỉ của tôi', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> },
                  { label: 'Số điện thoại', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg> },
                  { label: 'Đổi mật khẩu', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 12px',
                      background: '#F8FAFC',
                      borderRadius: 10,
                      cursor: 'pointer',
                      color: '#1E293B',
                    }}
                  >
                    <span style={{ color: '#0E76A8' }}>{item.icon}</span>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Order History Card */}
            <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
              <h3 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 700, color: '#1E293B', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 36,
                  height: 36,
                  background: '#ECFDF5',
                  borderRadius: 10,
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                </span>
                Lịch sử đơn hàng
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { id: '1234', date: '20/06/2026', status: 'Đã giao', type: 'success' },
                  { id: '1233', date: '18/06/2026', status: 'Đang giao', type: 'warning' },
                  { id: '1230', date: '15/06/2026', status: 'Đã giao', type: 'success' },
                ].map(order => (
                  <div
                    key={order.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      background: '#F8FAFC',
                      borderRadius: 12,
                      border: '1px solid #E2E8F0',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#1E293B', marginBottom: 2 }}>Đơn hàng #{order.id}</div>
                      <div style={{ fontSize: 12, color: '#94A3B8' }}>{order.date}</div>
                    </div>
                    <span style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: order.type === 'success' ? '#10B981' : '#F59E0B',
                      background: order.type === 'success' ? '#ECFDF5' : '#FEF3C7',
                      padding: '4px 10px',
                      borderRadius: 6,
                    }}>
                      {order.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
