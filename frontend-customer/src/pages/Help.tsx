import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, Book, MessageSquare, Mail, Phone, ChevronRight, ExternalLink } from 'lucide-react';

const FAQS = [
  { q: 'Làm sao để mua voucher?', a: 'Chọn voucher → Thêm vào giỏ hàng → Tiến hành thanh toán → Nhận mã voucher qua email.' },
  { q: 'Voucher có thời hạn bao lâu?', a: 'Thời hạn sử dụng được ghi rõ trên mỗi voucher. Thông thường từ 30 đến 365 ngày kể từ ngày mua.' },
  { q: 'Có thể hoàn tiền voucher không?', a: 'Chính sách hoàn tiền tùy thuộc vào điều kiện của từng voucher. Vui lòng xem chi tiết tại trang voucher hoặc liên hệ hỗ trợ.' },
  { q: 'Mã voucher không hoạt động?', a: 'Hãy kiểm tra lại: (1) Hạn sử dụng, (2) Điều kiện áp dụng, (3) Địa điểm sử dụng. Nếu vẫn lỗi, gửi phản hồi tại mục "Phản hồi & Khiếu nại".' },
  { q: 'Làm sao để nhận voucher đã mua?', a: 'Sau khi thanh toán thành công, mã voucher và QR code sẽ hiển thị tại trang "Thành công" và được gửi qua email. Xem lại tại mục "Voucher của tôi".' },
  { q: 'Có thể tặng voucher cho người khác không?', a: 'Có! Khi checkout, bật tùy chọn "Gửi tặng bạn bè" và nhập thông tin người nhận.' },
  { q: 'Thông tin thẻ thanh toán có bảo mật không?', a: 'Toàn bộ giao dịch được mã hóa theo chuẩn PCI DSS quốc tế. Everest không lưu trữ thông tin thẻ của bạn.' },
];

const QUICK_ACTIONS = [
  { icon: MessageSquare, label: 'Chat với hỗ trợ viên', desc: 'Phản hồi trong 5 phút', color: '#0E76A8', bg: '#E8F4FA' },
  { icon: Mail, label: 'Gửi email hỗ trợ', desc: 'everest.support@gmail.com', color: '#7C3AED', bg: '#F5F3FF' },
  { icon: Phone, label: 'Hotline hỗ trợ', desc: '1900 1234 (8:00 - 22:00)', color: '#059669', bg: '#ECFDF5' },
];

export function HelpPage() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate('/settings')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 8, display: 'flex' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <HelpCircle size={22} style={{ color: '#0E76A8' }} />
            <div>
              <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 22, fontWeight: 800, color: '#1E293B', margin: 0 }}>Trợ giúp</h1>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#64748B', margin: 0 }}>Câu hỏi thường gặp và liên hệ hỗ trợ</p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '28px 24px' }}>
        {/* Quick contact */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 28 }}>
          {QUICK_ACTIONS.map(a => {
            const Icon = a.icon;
            return (
              <div key={a.label} style={{ background: 'white', borderRadius: 16, padding: 18, textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', cursor: 'pointer', transition: 'box-shadow 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(14,118,168,0.15)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)')}
              >
                <div style={{ width: 48, height: 48, borderRadius: 14, background: a.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <Icon size={24} style={{ color: a.color }} />
                </div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700, color: '#1E293B', marginBottom: 4 }}>{a.label}</div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#94A3B8' }}>{a.desc}</div>
              </div>
            );
          })}
        </div>

        {/* FAQ */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Book size={20} style={{ color: '#0E76A8' }} />
            <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 18, fontWeight: 800, color: '#1E293B', margin: 0 }}>Câu hỏi thường gặp</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {FAQS.map((faq, i) => (
              <div key={i} style={{ background: 'white', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: `1.5px solid ${openFaq === i ? '#BAE6FD' : '#F1F5F9'}`, transition: 'border-color 0.2s' }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: 12 }}
                >
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 700, color: '#1E293B', flex: 1 }}>{faq.q}</span>
                  <ChevronRight size={18} style={{ color: '#94A3B8', flexShrink: 0, transform: openFaq === i ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>
                {openFaq === i && (
                  <div style={{ padding: '0 18px 16px', borderTop: '1px solid #F1F5F9' }}>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#334155', lineHeight: 1.7, margin: '14px 0 0', paddingTop: 14 }}>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Still need help */}
        <div style={{ marginTop: 28, background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: 16, padding: 20, textAlign: 'center' }}>
          <HelpCircle size={32} style={{ color: '#0E76A8', margin: '0 auto 12px', display: 'block' }} />
          <h3 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 800, color: '#1E293B', marginBottom: 8 }}>Vẫn cần hỗ trợ?</h3>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#64748B', lineHeight: 1.6, marginBottom: 16 }}>
            Đội ngũ hỗ trợ của Everest sẵn sàng giúp bạn 24/7.
          </p>
          <button
            onClick={() => navigate('/feedback')}
            style={{ padding: '12px 28px', background: '#0E76A8', color: 'white', border: 'none', borderRadius: 12, fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#0A5C87')}
            onMouseLeave={e => (e.currentTarget.style.background = '#0E76A8')}
          >
            Gửi phản hồi ngay
          </button>
        </div>
      </div>
    </div>
  );
}
