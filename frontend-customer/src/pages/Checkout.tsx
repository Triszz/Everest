import { useState } from 'react';
import { Link } from 'react-router-dom';

export function Checkout() {
  const [buyerInfo, setBuyerInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
  });

  const [sendAsGift, setSendAsGift] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('atm');
  const [voucherCode, setVoucherCode] = useState('VOUCHER100');

  const orderItems = [
    {
      id: 1,
      name: 'Voucher Buffet Tối Hải Sản 5 Sao - Sheraton Saigon Hotel',
      quantity: 2,
      price: 890000,
      image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=200&h=200&fit=crop',
    },
  ];

  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = 178000;
  const serviceFee: number = 0;
  const total = subtotal - discount + serviceFee;

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
          {/* LEFT: Forms */}
          <div>
            {/* Buyer Info */}
            <div style={{ background: 'white', borderRadius: 16, padding: 28, boxShadow: '0 1px 2px rgba(0,0,0,0.04)', marginBottom: 16 }}>
              <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 800, color: '#1E293B', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 36,
                  height: 36,
                  background: '#E0F2FE',
                  borderRadius: 10,
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0E76A8" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </span>
                Thông tin người mua
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1E293B', marginBottom: 6 }}>
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập đầy đủ họ và tên"
                    value={buyerInfo.fullName}
                    onChange={e => setBuyerInfo({ ...buyerInfo, fullName: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      background: '#F1F5F9',
                      border: '1.5px solid transparent',
                      borderRadius: 10,
                      fontSize: 14,
                      color: '#1E293B',
                      fontFamily: 'Inter, sans-serif',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                    onFocus={e => (e.currentTarget.style.borderColor = '#0E76A8')}
                    onBlur={e => (e.currentTarget.style.borderColor = 'transparent')}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1E293B', marginBottom: 6 }}>
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="example@email.com"
                      value={buyerInfo.email}
                      onChange={e => setBuyerInfo({ ...buyerInfo, email: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        background: '#F1F5F9',
                        border: '1.5px solid transparent',
                        borderRadius: 10,
                        fontSize: 14,
                        color: '#1E293B',
                        fontFamily: 'Inter, sans-serif',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                      onFocus={e => (e.currentTarget.style.borderColor = '#0E76A8')}
                      onBlur={e => (e.currentTarget.style.borderColor = 'transparent')}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1E293B', marginBottom: 6 }}>
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      placeholder="0xxx xxx xxx"
                      value={buyerInfo.phone}
                      onChange={e => setBuyerInfo({ ...buyerInfo, phone: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        background: '#F1F5F9',
                        border: '1.5px solid transparent',
                        borderRadius: 10,
                        fontSize: 14,
                        color: '#1E293B',
                        fontFamily: 'Inter, sans-serif',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                      onFocus={e => (e.currentTarget.style.borderColor = '#0E76A8')}
                      onBlur={e => (e.currentTarget.style.borderColor = 'transparent')}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Send as Gift */}
            <div style={{ background: 'white', borderRadius: 16, padding: '20px 28px', boxShadow: '0 1px 2px rgba(0,0,0,0.04)', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
                    <polyline points="20 12 20 22 4 22 4 12"/>
                    <rect x="2" y="7" width="20" height="5"/>
                    <line x1="12" y1="22" x2="12" y2="7"/>
                    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
                    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
                  </svg>
                </span>
                <h3 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 700, color: '#1E293B' }}>
                  Gửi tặng bạn bè
                </h3>
              </div>

              <button
                onClick={() => setSendAsGift(!sendAsGift)}
                aria-checked={sendAsGift}
                role="switch"
                style={{
                  width: 44,
                  height: 24,
                  borderRadius: 12,
                  background: sendAsGift ? '#0E76A8' : '#CBD5E1',
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'background 0.2s',
                  padding: 0,
                }}
              >
                <span style={{
                  position: 'absolute',
                  top: 2,
                  left: sendAsGift ? 22 : 2,
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: 'white',
                  transition: 'left 0.2s',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }} />
              </button>
            </div>

            {/* Payment Method */}
            <div style={{ background: 'white', borderRadius: 16, padding: 28, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
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
                    <rect x="2" y="5" width="20" height="14" rx="2"/>
                    <line x1="2" y1="10" x2="22" y2="10"/>
                  </svg>
                </span>
                Phương thức thanh toán
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* ATM Option */}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '16px 18px',
                    border: paymentMethod === 'atm' ? '2px solid #0E76A8' : '1.5px solid #E2E8F0',
                    borderRadius: 12,
                    background: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    if (paymentMethod !== 'atm') {
                      e.currentTarget.style.borderColor = '#CBD5E1';
                    }
                  }}
                  onMouseLeave={e => {
                    if (paymentMethod !== 'atm') {
                      e.currentTarget.style.borderColor = '#E2E8F0';
                    }
                  }}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'atm'}
                    onChange={() => setPaymentMethod('atm')}
                    style={{ width: 18, height: 18, accentColor: '#0E76A8' }}
                  />
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0E76A8" strokeWidth="2">
                    <path d="M3 21h18"/>
                    <path d="M3 10h18"/>
                    <path d="M5 6l7-3 7 3"/>
                    <path d="M4 10v11"/>
                    <path d="M20 10v11"/>
                    <path d="M8 14v3"/>
                    <path d="M12 14v3"/>
                    <path d="M16 14v3"/>
                  </svg>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1E293B', marginBottom: 2 }}>
                      ATM / Internet Banking
                    </div>
                    <div style={{ fontSize: 12, color: '#64748B' }}>
                      Hỗ trợ tất cả ngân hàng nội địa
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <div style={{ width: 28, height: 18, background: '#F1F5F9', borderRadius: 4, border: '1px solid #E2E8F0' }} />
                    <div style={{ width: 28, height: 18, background: '#F1F5F9', borderRadius: 4, border: '1px solid #E2E8F0' }} />
                  </div>
                </label>

                {/* MoMo Option */}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '16px 18px',
                    border: paymentMethod === 'momo' ? '2px solid #0E76A8' : '1.5px solid #E2E8F0',
                    borderRadius: 12,
                    background: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    if (paymentMethod !== 'momo') {
                      e.currentTarget.style.borderColor = '#CBD5E1';
                    }
                  }}
                  onMouseLeave={e => {
                    if (paymentMethod !== 'momo') {
                      e.currentTarget.style.borderColor = '#E2E8F0';
                    }
                  }}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'momo'}
                    onChange={() => setPaymentMethod('momo')}
                    style={{ width: 18, height: 18, accentColor: '#0E76A8' }}
                  />
                  <div style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    background: '#A82B72',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: 12,
                    fontWeight: 800,
                    fontFamily: 'Manrope, sans-serif',
                  }}>
                    M
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1E293B', marginBottom: 2 }}>
                      Ví MoMo
                    </div>
                    <div style={{ fontSize: 12, color: '#64748B' }}>
                      Thanh toán nhanh qua ứng dụng MoMo
                    </div>
                  </div>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M9 12l2 2 4-4"/>
                  </svg>
                </label>

                {/* Visa/Mastercard Option */}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '16px 18px',
                    border: paymentMethod === 'visa' ? '2px solid #0E76A8' : '1.5px solid #E2E8F0',
                    borderRadius: 12,
                    background: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    if (paymentMethod !== 'visa') {
                      e.currentTarget.style.borderColor = '#CBD5E1';
                    }
                  }}
                  onMouseLeave={e => {
                    if (paymentMethod !== 'visa') {
                      e.currentTarget.style.borderColor = '#E2E8F0';
                    }
                  }}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'visa'}
                    onChange={() => setPaymentMethod('visa')}
                    style={{ width: 18, height: 18, accentColor: '#0E76A8' }}
                  />
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1E293B" strokeWidth="2">
                    <rect x="2" y="5" width="20" height="14" rx="2"/>
                    <line x1="2" y1="10" x2="22" y2="10"/>
                  </svg>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1E293B', marginBottom: 2 }}>
                      Thẻ Visa / Mastercard / JCB
                    </div>
                    <div style={{ fontSize: 12, color: '#64748B' }}>
                      Thanh toán quốc tế bảo mật cao
                    </div>
                  </div>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                </label>
              </div>
            </div>
          </div>

          {/* RIGHT: Order Summary */}
          <div style={{ background: 'white', borderRadius: 16, padding: 28, boxShadow: '0 1px 2px rgba(0,0,0,0.04)', position: 'sticky', top: 88 }}>
            <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 800, color: '#1E293B', marginBottom: 20 }}>
              Tóm tắt đơn hàng
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #E2E8F0' }}>
              {orderItems.map(item => (
                <div key={item.id} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{ width: 56, height: 56, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#1E293B',
                      marginBottom: 4,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}>
                      {item.name}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: '#94A3B8' }}>SL: {String(item.quantity).padStart(2, '0')}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#1E293B' }}>
                        {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Voucher Code */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1E293B', marginBottom: 8 }}>
                Mã giảm giá
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  value={voucherCode}
                  onChange={e => setVoucherCode(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    background: '#F1F5F9',
                    border: '1.5px solid transparent',
                    borderRadius: 10,
                    fontSize: 13,
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 600,
                    color: '#1E293B',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                <button
                  style={{
                    padding: '10px 18px',
                    background: '#0E76A8',
                    color: 'white',
                    border: 'none',
                    borderRadius: 10,
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#0A5C87')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#0E76A8')}
                >
                  Áp dụng
                </button>
              </div>
            </div>

            {/* Summary */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#64748B' }}>Tạm tính</span>
                <span style={{ color: '#1E293B', fontWeight: 600 }}>{subtotal.toLocaleString('vi-VN')}đ</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#64748B' }}>Giảm giá (10%)</span>
                <span style={{ color: '#EF4444', fontWeight: 600 }}>-{discount.toLocaleString('vi-VN')}đ</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#64748B' }}>Phí dịch vụ</span>
                <span style={{ color: '#1E293B', fontWeight: 600 }}>{serviceFee === 0 ? 'Miễn phí' : `${serviceFee.toLocaleString('vi-VN')}đ`}</span>
              </div>
            </div>

            {/* Total */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 4 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#1E293B' }}>Tổng cộng</span>
                <span style={{ fontSize: 22, fontWeight: 800, color: '#0E76A8', fontFamily: 'Manrope, sans-serif' }}>
                  {total.toLocaleString('vi-VN')}đ
                </span>
              </div>
              <div style={{ textAlign: 'right', fontSize: 11, color: '#94A3B8', fontStyle: 'italic' }}>
                (Đã bao gồm VAT)
              </div>
            </div>

            {/* Pay Button */}
            <button
              style={{
                width: '100%',
                padding: '14px 0',
                background: '#0E76A8',
                color: 'white',
                border: 'none',
                borderRadius: 12,
                fontFamily: 'Manrope, sans-serif',
                fontSize: 15,
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'background 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                letterSpacing: '0.5px',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#0A5C87')}
              onMouseLeave={e => (e.currentTarget.style.background = '#0E76A8')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              THANH TOÁN NGAY
            </button>

            {/* Trust badges */}
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #E2E8F0', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 32, height: 20, background: '#F1F5F9', borderRadius: 4, border: '1px solid #E2E8F0' }} />
                <div style={{ width: 32, height: 20, background: '#F1F5F9', borderRadius: 4, border: '1px solid #E2E8F0' }} />
                <div style={{ width: 32, height: 20, background: '#F1F5F9', borderRadius: 4, border: '1px solid #E2E8F0' }} />
              </div>
              <div style={{ fontSize: 10, color: '#94A3B8', letterSpacing: '1px', lineHeight: 1.6 }}>
                ĐẢM BẢO BẢO MẬT BỞI QUỐC TẾ PCI<br/>DSS
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
