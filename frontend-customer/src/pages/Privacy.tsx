import { Eye } from 'lucide-react';
import { Breadcrumb } from '../components/Breadcrumb';

export function PrivacyPage() {
  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh' }}>
      <Breadcrumb
        items={[
          { label: 'Trang chủ', href: '/' },
          { label: 'Chính sách bảo mật' },
        ]}
        maxWidth={800}
      />

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ background: 'white', borderRadius: 20, padding: '40px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Eye size={28} style={{ color: '#10B981' }} />
            </div>
            <div>
              <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 26, fontWeight: 800, color: '#1E293B', margin: 0 }}>Chính sách bảo mật</h1>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#94A3B8', margin: '4px 0 0' }}>Cập nhật lần cuối: 01/01/2026</p>
            </div>
          </div>

          {[
            {
              title: '1. Mục đích thu thập dữ liệu',
              body: `Everest thu thập dữ liệu cá nhân với các mục đích: (a) Tạo và quản lý tài khoản người dùng; (b) Xử lý giao dịch mua voucher; (c) Gửi thông báo về đơn hàng và voucher; (d) Hỗ trợ khách hàng; (e) Cải thiện chất lượng dịch vụ; (f) Tuân thủ yêu cầu pháp lý.`,
            },
            {
              title: '2. Dữ liệu được thu thập',
              body: `Chúng tôi thu thập: (a) Thông tin tài khoản: họ tên, email, số điện thoại, mật khẩu (đã hash); (b) Thông tin giao dịch: lịch sử mua hàng, voucher đã sở hữu; (c) Dữ liệu sử dụng: thiết bị, IP, trình duyệt, thời gian truy cập; (d) Thông tin tùy chọn: sở thích nhận thông báo. Chúng tôi KHÔNG thu thập thông tin thẻ thanh toán — dữ liệu này được xử lý bởi cổng thanh toán bên thứ ba.`,
            },
            {
              title: '3. Cách sử dụng dữ liệu',
              body: `Dữ liệu của bạn được sử dụng để: (a) Cung cấp dịch vụ mua sắm voucher; (b) Gửi email xác nhận đơn hàng, mã voucher; (c) Gửi thông báo khuyến mãi (nếu bạn đồng ý); (d) Phát hiện và ngăn chặn gian lận; (e) Phân tích để cải thiện trải nghiệm người dùng. Everest cam kết không bán dữ liệu cá nhân cho bên thứ ba.`,
            },
            {
              title: '4. Chia sẻ dữ liệu',
              body: `Dữ liệu được chia sẻ trong các trường hợp: (a) Với đối tác cung cấp voucher — để phát hành và quản lý voucher bạn mua; (b) Với nhà cung cấp dịch vụ (hosting, thanh toán, email) — chỉ mức độ cần thiết để vận hành; (c) Theo yêu cầu pháp lý từ cơ quan có thẩm quyền. Tất cả các bên nhận dữ liệu đều bị ràng buộc bởi thỏa thuận bảo mật.`,
            },
            {
              title: '5. Bảo mật dữ liệu',
              body: `Everest áp dụng các biện pháp bảo mật: (a) Mã hóa dữ liệu khi truyền tải (TLS/SSL) và khi lưu trữ; (b) Mật khẩu được hash bằng bcrypt; (c) Kiểm soát truy cập nghiêm ngặt; (d) Giám sát hệ thống 24/7; (e) Backup dữ liệu định kỳ. Không có hệ thống nào là tuyệt đối an toàn, nhưng chúng tôi cam kết áp dụng các biện pháp tốt nhất trong khả năng.`,
            },
            {
              title: '6. Lưu trữ và xóa dữ liệu',
              body: `Dữ liệu được lưu trữ trong thời gian cần thiết cho mục đích thu thập. Cụ thể: (a) Thông tin tài khoản — lưu trữ cho đến khi bạn yêu cầu xóa; (b) Lịch sử giao dịch — lưu trữ theo quy định pháp luật (tối thiểu 5 năm); (c) Cookie — theo cài đặt trình duyệt của bạn. Bạn có quyền yêu cầu xóa dữ liệu cá nhân (trừ khi pháp luật yêu cầu lưu giữ).`,
            },
            {
              title: '7. Quyền của người dùng',
              body: `Bạn có quyền: (a) Truy cập dữ liệu cá nhân của mình; (b) Yêu cầu chỉnh sửa thông tin sai sót; (c) Yêu cầu xóa dữ liệu; (d) Phản đối việc xử lý dữ liệu cho mục đích tiếp thị; (e) Rút lại sự đồng ý bất kỳ lúc nào; (f) Khiếu nại với cơ quan bảo vệ dữ liệu. Để thực hiện quyền này, vui lòng liên hệ everest.support@gmail.com.`,
            },
            {
              title: '8. Cookies',
              body: `Nền tảng sử dụng cookie để: (a) Duy trì phiên đăng nhập; (b) Ghi nhớ sở thích người dùng; (c) Phân tích lưu lượng truy cập. Bạn có thể tắt cookie trong cài đặt trình duyệt, tuy nhiên một số tính năng có thể không hoạt động đúng.`,
            },
            {
              title: '9. Thay đổi chính sách',
              body: `Everest có thể cập nhật Chính sách bảo mật này theo thời gian. Thay đổi sẽ có hiệu lực khi được đăng tải trên Nền tảng kèm thông báo. Khuyến nghị bạn xem lại Chính sách định kỳ.`,
            },
            {
              title: '10. Liên hệ',
              body: `Nếu có câu hỏi về Chính sách bảo mật này, vui lòng liên hệ: Email: everest.support@gmail.com | Hotline: 1900 1234 (8:00 - 22:00, Thứ 2 - CN)`,
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
