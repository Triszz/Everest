import nodemailer from "nodemailer";

/**
 * Email service — gửi OTP qua Gmail SMTP + App Password.
 *
 * Cấu hình qua env:
 *   EMAIL_FROM       : Tên + email hiển thị (VD: "Everest <no-reply@gmail.com>")
 *   GMAIL_USER       : Địa chỉ Gmail (VD: "no-reply@gmail.com")
 *   GMAIL_APP_PASSWORD: App Password 16 ký tự (KHÔNG phải mật khẩu Gmail thật)
 *
 * Trong dev, nếu thiếu env → fallback in OTP ra console (giống password.service).
 */

const FROM = process.env.EMAIL_FROM || process.env.GMAIL_USER || "Everest <noreply@everest.local>";
const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (transporter) return transporter;
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) return null;

  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD,
    },
  });
  return transporter;
}

export type OtpEmailParams = {
  to: string;
  code: string;
  ttlMinutes: number;
  purpose: "REGISTER_VERIFY" | "RESET_PASSWORD" | "TWO_FA_LOGIN";
};

const PURPOSE_LABEL: Record<OtpEmailParams["purpose"], { subject: string; title: string; intro: string }> = {
  REGISTER_VERIFY: {
    subject: "Mã xác thực đăng ký tài khoản Everest",
    title: "Xác thực email đăng ký",
    intro: "Cảm ơn bạn đã đăng ký tài khoản Everest. Vui lòng dùng mã bên dưới để hoàn tất xác thực email:",
  },
  RESET_PASSWORD: {
    subject: "Mã xác thực đặt lại mật khẩu Everest",
    title: "Đặt lại mật khẩu",
    intro: "Chúng tôi nhận được yêu cầu đặt lại mật khẩu. Dùng mã bên dưới để tiếp tục:",
  },
  TWO_FA_LOGIN: {
    subject: "Mã xác thực đăng nhập Everest",
    title: "Xác thực đăng nhập",
    intro: "Để hoàn tất đăng nhập, vui lòng nhập mã bên dưới:",
  },
};

function buildHtml(p: OtpEmailParams): string {
  const label = PURPOSE_LABEL[p.purpose];
  return `
<!DOCTYPE html>
<html lang="vi">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1E293B">
  <div style="max-width:480px;margin:40px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 12px rgba(15,23,42,0.06)">
    <div style="background:linear-gradient(135deg,#0E76A8 0%,#1A8FC0 100%);padding:32px 24px;text-align:center">
      <h1 style="margin:0;color:white;font-size:22px;font-weight:800">${label.title}</h1>
    </div>
    <div style="padding:32px 24px">
      <p style="font-size:15px;line-height:1.6;color:#475569;margin:0 0 24px">${label.intro}</p>
      <div style="font-size:36px;font-weight:800;letter-spacing:10px;color:#0E76A8;background:#F1F5F9;padding:20px 24px;border-radius:12px;text-align:center;margin:0 0 24px;font-family:'Courier New',monospace">
        ${p.code}
      </div>
      <p style="font-size:14px;color:#64748B;margin:0 0 8px">
        Mã có hiệu lực trong <strong style="color:#1E293B">${p.ttlMinutes} phút</strong>.
      </p>
      <p style="font-size:13px;color:#94A3B8;margin:24px 0 0;line-height:1.5">
        Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email. Tài khoản của bạn vẫn an toàn.
      </p>
    </div>
    <div style="background:#F8FAFC;padding:16px 24px;text-align:center;border-top:1px solid #E2E8F0">
      <p style="margin:0;font-size:12px;color:#94A3B8">© Everest — Nền tảng voucher & ưu đãi</p>
    </div>
  </div>
</body>
</html>`;
}

export type OrderEmailParams = {
  to: string;
  customerName: string;
  orderId: number;
  totalAmount: number;
  paymentMethod: string;
  items: Array<{
    title: string;
    partner: string;
    quantity: number;
    price: number;
    voucherCodes: string[];
    validFrom: Date;
    validTo: Date;
  }>;
};

function buildOrderHtml(p: OrderEmailParams): string {
  const fmt = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

  const itemsHtml = p.items
    .map(
      (item) => `
      <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:16px;margin-bottom:12px">
        <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:8px">
          <div>
            <p style="margin:0;font-size:14px;font-weight:700;color:#1E293B">${item.title}</p>
            <p style="margin:4px 0 0;font-size:12px;color:#64748B">${item.partner}</p>
          </div>
          <div style="text-align:right">
            <p style="margin:0;font-size:14px;font-weight:700;color:#1E293B">${fmt.format(item.price * item.quantity)}</p>
            <p style="margin:4px 0 0;font-size:12px;color:#64748B">× ${item.quantity}</p>
          </div>
        </div>
        <div style="background:#EFF6FF;border:1px solid #BFDBFE;border-radius:8px;padding:10px 14px">
          <p style="margin:0 0 6px;font-size:11px;font-weight:600;color:#1D4ED8;text-transform:uppercase;letter-spacing:0.5px">Mã voucher</p>
          ${item.voucherCodes
            .map(
              (code) => `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
              <span style="font-family:'Courier New',monospace;font-size:15px;font-weight:700;color:#0E76A8;letter-spacing:1px">${code}</span>
            </div>
          `,
            )
            .join("")}
          <p style="margin:8px 0 0;font-size:11px;color:#64748B">
            Hiệu lực: ${new Date(item.validFrom).toLocaleDateString("vi-VN")} → ${new Date(item.validTo).toLocaleDateString("vi-VN")}
          </p>
        </div>
      </div>
    `,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="vi">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1E293B">
  <div style="max-width:560px;margin:40px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 12px rgba(15,23,42,0.06)">
    <div style="background:linear-gradient(135deg,#0E76A8 0%,#1A8FC0 100%);padding:32px 24px;text-align:center">
      <h1 style="margin:0;color:white;font-size:22px;font-weight:800">Thanh toán thành công!</h1>
      <p style="margin:8px 0 0;font-size:14px;color:rgba(255,255,255,0.85)">Cảm ơn bạn đã mua voucher tại Everest</p>
    </div>
    <div style="padding:32px 24px">
      <p style="font-size:15px;line-height:1.6;color:#475569;margin:0 0 24px">
        Xin chào <strong style="color:#1E293B">${p.customerName}</strong>!
        Chúng tôi đã nhận thanh toán cho đơn hàng <strong style="color:#0E76A8">#${p.orderId}</strong>.
        Dưới đây là thông tin voucher của bạn:
      </p>
      ${itemsHtml}
      <div style="background:#F1F5F9;border-radius:12px;padding:16px 20px;margin-top:8px">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px">
          <span style="font-size:13px;color:#64748B">Phương thức thanh toán</span>
          <span style="font-size:13px;font-weight:600;color:#1E293B">${p.paymentMethod.toUpperCase()}</span>
        </div>
        <div style="display:flex;justify-content:space-between;border-top:1px solid #E2E8F0;padding-top:12px;margin-top:4px">
          <span style="font-size:16px;font-weight:700;color:#1E293B">Tổng cộng</span>
          <span style="font-size:18px;font-weight:800;color:#0E76A8">${fmt.format(p.totalAmount)}</span>
        </div>
      </div>
      <p style="font-size:13px;color:#94A3B8;margin:24px 0 0;line-height:1.5">
        Hãy lưu lại các mã voucher bên trên. Bạn có thể xem lại đơn hàng và mã voucher tại trang
        <strong>Đơn hàng của tôi</strong> trong ứng dụng Everest bất cứ lúc nào.
      </p>
    </div>
    <div style="background:#F8FAFC;padding:16px 24px;text-align:center;border-top:1px solid #E2E8F0">
      <p style="margin:0;font-size:12px;color:#94A3B8">© Everest — Nền tảng voucher & ưu đãi</p>
    </div>
  </div>
</body>
</html>`;
}

export type PasswordResetEmailParams = {
  to: string;
  resetLink: string;
};

function buildPasswordResetHtml(p: PasswordResetEmailParams): string {
  return `<!DOCTYPE html>
<html lang="vi">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1E293B">
  <div style="max-width:520px;margin:40px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 12px rgba(15,23,42,0.06)">
    <div style="background:linear-gradient(135deg,#0E76A8 0%,#1A8FC0 100%);padding:32px 24px;text-align:center">
      <h1 style="margin:0;color:white;font-size:22px;font-weight:800">Đặt lại mật khẩu Everest</h1>
    </div>
    <div style="padding:32px 24px">
      <p style="font-size:15px;line-height:1.6;color:#475569;margin:0 0 24px">
        Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản Everest của bạn (<strong style="color:#1E293B">${p.to}</strong>).
      </p>
      <div style="text-align:center;margin:32px 0">
        <a href="${p.resetLink}" style="display:inline-block;padding:14px 28px;background:#0E76A8;color:white;text-decoration:none;border-radius:12px;font-weight:700;font-size:15px">
          Đặt lại mật khẩu ngay
        </a>
      </div>
      <p style="font-size:13px;color:#64748B;margin:0 0 8px">
        Hoặc copy liên kết này dán vào trình duyệt:<br>
        <a href="${p.resetLink}" style="color:#0E76A8;word-break:break-all">${p.resetLink}</a>
      </p>
      <p style="font-size:13px;color:#94A3B8;margin:24px 0 0;line-height:1.5">
        Liên kết này có hiệu lực trong 24 giờ. Nếu bạn không gửi yêu cầu này, vui lòng bỏ qua email. Tài khoản của bạn vẫn an toàn.
      </p>
    </div>
    <div style="background:#F8FAFC;padding:16px 24px;text-align:center;border-top:1px solid #E2E8F0">
      <p style="margin:0;font-size:12px;color:#94A3B8">© Everest — Nền tảng voucher & ưu đãi</p>
    </div>
  </div>
</body>
</html>`;
}

export const emailService = {
  /** Gửi mã OTP qua Gmail. Trả về true nếu thành công. */
  async sendOtp({ to, code, ttlMinutes, purpose }: OtpEmailParams): Promise<boolean> {
    const t = getTransporter();
    const label = PURPOSE_LABEL[purpose];

    // Dev fallback: không có Gmail config → in ra console để test
    if (!t) {
      console.log(
        `\n📧 [DEV EMAIL] To: ${to}\n   Subject: ${label.subject}\n   OTP: ${code}\n   TTL: ${ttlMinutes}m\n`,
      );
      return true;
    }

    try {
      await t.sendMail({
        from: FROM,
        to,
        subject: label.subject,
        html: buildHtml({ to, code, ttlMinutes, purpose }),
      });
      return true;
    } catch (err) {
      console.error(`[email.service] Gửi email thất bại tới ${to}:`, err);
      // Vẫn in OTP ra console để dev debug được
      console.log(`[email.service] DEV fallback OTP for ${to}: ${code}`);
      return false;
    }
  },

  /** Gửi email liên kết Đặt lại mật khẩu (Password Reset Link) qua Gmail. */
  async sendPasswordResetLink({ to, resetLink }: PasswordResetEmailParams): Promise<boolean> {
    const t = getTransporter();

    if (!t) {
      console.log(
        `\n📧 [DEV EMAIL RESET LINK] To: ${to}\n   Link: ${resetLink}\n`,
      );
      return true;
    }

    try {
      await t.sendMail({
        from: FROM,
        to,
        subject: "Hướng dẫn đặt lại mật khẩu Everest",
        html: buildPasswordResetHtml({ to, resetLink }),
      });
      return true;
    } catch (err) {
      console.error(`[email.service] Gửi reset link thất bại tới ${to}:`, err);
      console.log(`[email.service] DEV fallback reset link for ${to}: ${resetLink}`);
      return false;
    }
  },

  /**
   * Gửi email xác nhận đơn hàng sau khi thanh toán thành công.
   * Chứa mã voucher, thông tin voucher, tổng tiền.
   * Không throw — lỗi gửi email không được coi là thất bại thanh toán.
   */
  async sendOrderConfirmation(params: OrderEmailParams): Promise<void> {
    const t = getTransporter();

    if (!t) {
      console.log("\n📧 [DEV EMAIL] Xác nhận đơn hàng:\n", JSON.stringify(params, null, 2));
      return;
    }

    try {
      await t.sendMail({
        from: FROM,
        to: params.to,
        subject: `Xác nhận thanh toán đơn hàng #${params.orderId} — Everest`,
        html: buildOrderHtml(params),
      });
    } catch (err) {
      console.error("[email.service] Gửi email xác nhận đơn hàng thất bại:", err);
    }
  },
};
