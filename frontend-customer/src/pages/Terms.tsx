import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export function TermsPage() {
  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '16px 24px' }}>
          <span style={{ fontSize: 13, color: '#64748B' }}>
            <Link to="/" style={{ color: '#0E76A8', textDecoration: 'none' }}>Trang chủ</Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <span style={{ color: '#1E293B', fontWeight: 600 }}>Điều khoản sử dụng</span>
          </span>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ background: 'white', borderRadius: 20, padding: '40px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: '#E8F4FA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={28} style={{ color: '#0E76A8' }} />
            </div>
            <div>
              <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 26, fontWeight: 800, color: '#1E293B', margin: 0 }}>Điều khoản sử dụng</h1>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#94A3B8', margin: '4px 0 0' }}>Cập nhật lần cuối: 01/01/2026</p>
            </div>
          </div>

          {[
            {
              title: '1. Chấp nhận điều khoản',
              body: `Bằng việc truy cập và sử dụng nền tảng Everest (sau đây gọi là "Nền tảng"), bạn xác nhận rằng đã đọc, hiểu và đồng ý bị ràng buộc bởi các Điều khoản sử dụng này. Nếu bạn không đồng ý với bất kỳ điều khoản nào, vui lòng không sử dụng Nền tảng.`,
            },
            {
              title: '2. Mô tả dịch vụ',
              body: `Everest là nền tảng thương mại điện tử cho phép người dùng mua voucher giảm giá từ các đối tác. Các voucher được phát hành bởi các đối tác bên thứ ba và Everest chỉ đóng vai trò trung gian phân phối. Everest không phải là nhà cung cấp dịch vụ hoặc sản phẩm của các đối tác.`,
            },
            {
              title: '3. Tài khoản người dùng',
              body: `Để sử dụng một số tính năng, bạn cần đăng ký tài khoản với thông tin chính xác. Bạn chịu trách nhiệm bảo mật thông tin tài khoản và mật khẩu. Mọi hoạt động dưới tài khoản của bạn đều là trách nhiệm của bạn. Bạn đồng ý thông báo ngay cho Everest khi phát hiện bất kỳ vi phạm bảo mật nào.`,
            },
            {
              title: '4. Mua hàng và thanh toán',
              body: `Khi mua voucher trên Nền tảng: (a) Bạn xác nhận đã đủ 18 tuổi hoặc có sự cho phép của người giám hộ; (b) Thanh toán phải được thực hiện qua các phương thức được hỗ trợ trên Nền tảng; (c) Voucher chỉ được phát hành sau khi thanh toán thành công; (d) Voucher không được phép bán lại hoặc chuyển nhượng cho bên thứ ba vì mục đích thương mại.`,
            },
            {
              title: '5. Chính sách hoàn tiền và hủy',
              body: `Chính sách hoàn tiền áp dụng theo điều kiện của từng voucher cụ thể. Thông thường: (a) Voucher chưa sử dụng có thể được hoàn trong vòng 7 ngày kể từ ngày mua nếu chưa hết hạn; (b) Voucher đã sử dụng hoặc hết hạn không được hoàn tiền; (c) Yêu cầu hủy/hòan phải được gửi qua kênh hỗ trợ của Everest.`,
            },
            {
              title: '6. Quyền sở hữu trí tuệ',
              body: `Toàn bộ nội dung trên Nền tảng bao gồm văn bản, hình ảnh, logo, thiết kế thuộc quyền sở hữu của Everest hoặc các bên cấp phép. Bạn không được phép sao chép, phân phối hoặc sử dụng vì mục đích thương mại khi chưa có sự đồng ý bằng văn bản.`,
            },
            {
              title: '7. Giới hạn trách nhiệm',
              body: `Everest không đảm bảo rằng: (a) Nền tảng sẽ hoạt động liên tục, không có lỗi; (b) Các thông tin trên Nền tảng luôn chính xác. Everest không chịu trách nhiệm về chất lượng, an toàn hoặc tính hợp pháp của sản phẩm/dịch vụ do đối tác cung cấp. Trách nhiệm của Everest trong mọi trường hợp không vượt quá số tiền bạn đã thanh toán cho giao dịch liên quan.`,
            },
            {
              title: '8. Quyền của Everest',
              body: `Everest có quyền: (a) Tạm ngừng hoặc chấm dứt tài khoản vi phạm Điều khoản; (b) Thay đổi, cập nhật Điều khoản mà không cần thông báo trước; (c) Cập nhật giá, điều kiện voucher theo thông báo từ đối tác; (d) Thu thập và xử lý dữ liệu theo Chính sách bảo mật.`,
            },
            {
              title: '9. Luật áp dụng',
              body: `Điều khoản này được điều chỉnh bởi luật pháp nước Cộng hòa Xã hội Chủ nghĩa Việt Nam. Mọi tranh chấp phát sinh sẽ được giải quyết trước tiên bằng thương lượng; nếu không thành, sẽ được đưa ra Tòa án có thẩm quyền tại TP. Hồ Chí Minh.`,
            },
            {
              title: '10. Liên hệ',
              body: `Nếu có câu hỏi về Điều khoản sử dụng này, vui lòng liên hệ: Email: everest.support@gmail.com | Hotline: 1900 1234 (8:00 - 22:00, Thứ 2 - CN)`,
            },
          ].map(section => (
            <div key={section.title} style={{ marginBottom: 28 }}>
              <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 17, fontWeight: 800, color: '#1E293B', marginBottom: 10 }}>{section.title}</h2>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#334155', lineHeight: 1.8, margin: 0 }}>{section.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
