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
};
