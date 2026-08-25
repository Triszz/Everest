import bcrypt from "bcrypt";
import crypto from "crypto";
import { prisma } from "../../config/prisma";
import { AppError } from "../../middlewares/errorHandler";
import { emailService } from "./email.service";
import type { OtpPurposeType } from "./email-otp.schemas";
import type { OtpPurpose } from "../../generated/prisma/client";

const OTP_TTL_MINUTES = 5;
const OTP_CODE_LENGTH = 6;
const MAX_VERIFY_ATTEMPTS = 5;
const RESEND_COOLDOWN_SECONDS = 60;
const CODE_BCRYPT_ROUNDS = 10;

type PurposeMap = OtpPurposeType;

/**
 * Sinh OTP 6 chữ số (leading zeros được pad).
 */
function generateCode(): string {
  const n = crypto.randomInt(0, 10 ** OTP_CODE_LENGTH);
  return n.toString().padStart(OTP_CODE_LENGTH, "0");
}

/**
 * Map từ input purpose (string literal) sang Prisma enum.
 */
function toPrismaPurpose(p: PurposeMap): OtpPurpose {
  return p as OtpPurpose;
}

export const emailOtpService = {
  /**
   * Sinh OTP mới, lưu DB (bcrypt code), gửi email.
   * - Xóa OTP cũ chưa consume của cùng email + purpose trước khi tạo mới.
   * - Trả về thông tin tối thiểu (không leak code qua response).
   */
  async sendOtp(
    email: string,
    purpose: PurposeMap,
    ipAddress?: string,
    userId?: string,
    channel: "email" | "sms" = "email",
  ) {
    const purposePrisma = toPrismaPurpose(purpose);

    // Rate limit: nếu OTP active còn hạn vừa gửi < 60s → chặn resend nhanh
    const lastOtp = await prisma.emailOtp.findFirst({
      where: {
        email,
        purpose: purposePrisma,
        consumedAt: null,
      },
      orderBy: { createdAt: "desc" },
    });

    if (lastOtp) {
      const ageMs = Date.now() - lastOtp.createdAt.getTime();
      if (ageMs < RESEND_COOLDOWN_SECONDS * 1000 && lastOtp.expiresAt > new Date()) {
        throw new AppError(
          `Vui lòng đợi ${RESEND_COOLDOWN_SECONDS} giây trước khi yêu cầu gửi lại mã`,
          429,
          "RATE_LIMIT",
        );
      }
    }

    // Xóa OTP cũ chưa consume (giữ lại DB sạch)
    await prisma.emailOtp.deleteMany({
      where: {
        email,
        purpose: purposePrisma,
        consumedAt: null,
      },
    });

    const code = generateCode();
    const codeHash = await bcrypt.hash(code, CODE_BCRYPT_ROUNDS);
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

    await prisma.emailOtp.create({
      data: {
        email,
        codeHash,
        purpose: purposePrisma,
        expiresAt,
        ipAddress: ipAddress ?? null,
        userId: userId ?? null,
      },
    });

    let sent = true;
    let message = "Mã xác thực đã được gửi đến email của bạn.";

    if (channel === "sms") {
      const user = await prisma.user.findFirst({
        where: { OR: [{ email }, ...(userId ? [{ userId }] : [])] },
        select: { phoneNumber: true },
      });
      const phoneDisplay = user?.phoneNumber || "số điện thoại của bạn";
      console.log(`[SMS OTP MOCK] Gửi OTP ${code} tới SĐT: ${phoneDisplay}`);
      message = `Mã OTP xác thực [${code}] đã được gửi qua SMS đến số điện thoại ${phoneDisplay}.`;
    } else {
      sent = await emailService.sendOtp({
        to: email,
        code,
        ttlMinutes: OTP_TTL_MINUTES,
        purpose,
      });
      message = sent
        ? "Mã xác thực đã được gửi đến email của bạn."
        : "Không thể gửi email lúc này. Vui lòng thử lại sau.";
    }

    return {
      message,
      expiresIn: OTP_TTL_MINUTES * 60,
      sent,
    };
  },

  /**
   * Verify OTP. Tùy `purpose` mà trả về khác nhau:
   *   - REGISTER_VERIFY: trả về userId để caller cập nhật emailVerified + cấp token.
   *   - RESET_PASSWORD  : trả về resetToken tạm thời để đổi password.
   *
   * Sau khi verify thành công → đánh consumedAt.
   * Sau 5 lần sai → tự hủy OTP đó (attempts đạt MAX).
   */
  async verifyOtp(
    email: string,
    code: string,
    purpose: PurposeMap,
  ): Promise<
    | { ok: true; userId: string | null; email: string }
    | { ok: false; reason: string }
  > {
    const purposePrisma = toPrismaPurpose(purpose);

    const otp = await prisma.emailOtp.findFirst({
      where: {
        email,
        purpose: purposePrisma,
        consumedAt: null,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otp) {
      return { ok: false, reason: "Mã xác thực không hợp lệ hoặc đã hết hạn" };
    }

    if (otp.expiresAt < new Date()) {
      return { ok: false, reason: "Mã xác thực đã hết hạn. Vui lòng yêu cầu mã mới." };
    }

    if (otp.attempts >= MAX_VERIFY_ATTEMPTS) {
      // Hết lượt thử → hủy OTP
      await prisma.emailOtp.update({
        where: { otpId: otp.otpId },
        data: { consumedAt: new Date() },
      });
      return {
        ok: false,
        reason: "Bạn đã nhập sai quá nhiều lần. Vui lòng yêu cầu mã mới.",
      };
    }

    const match = await bcrypt.compare(code, otp.codeHash);
    if (!match) {
      // Tăng attempts + kiểm tra vượt ngưỡng
      const newAttempts = otp.attempts + 1;
      const exhausted = newAttempts >= MAX_VERIFY_ATTEMPTS;
      await prisma.emailOtp.update({
        where: { otpId: otp.otpId },
        data: {
          attempts: newAttempts,
          ...(exhausted ? { consumedAt: new Date() } : {}),
        },
      });
      const remaining = MAX_VERIFY_ATTEMPTS - newAttempts;
      return {
        ok: false,
        reason:
          remaining > 0
            ? `Mã xác thực không đúng. Bạn còn ${remaining} lần thử.`
            : "Bạn đã nhập sai quá nhiều lần. Vui lòng yêu cầu mã mới.",
      };
    }

    // Đúng → mark consumed
    await prisma.emailOtp.update({
      where: { otpId: otp.otpId },
      data: { consumedAt: new Date() },
    });

    return { ok: true, userId: otp.userId, email: otp.email };
  },

  /**
   * Resend OTP. Đơn giản là gọi lại sendOtp (đã có rate limit bên trong).
   */
  async resendOtp(
    email: string,
    purpose: PurposeMap,
    ipAddress?: string,
    channel: "email" | "sms" = "email",
  ) {
    return this.sendOtp(email, purpose, ipAddress, undefined, channel);
  },
};
