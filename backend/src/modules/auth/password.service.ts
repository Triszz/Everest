import bcrypt from "bcrypt";
import crypto from "crypto";
import { prisma } from "../../config/prisma";
import { AppError } from "../../middlewares/errorHandler";
import { emailOtpService } from "./email-otp.service";
import type { OtpPurposeType } from "./email-otp.schemas";
import type { Prisma } from "../../generated/prisma/client";

const SALT_ROUNDS = 12;
const RESET_TOKEN_BYTES = 32;
const RESET_EXPIRY_HOURS = 24;

export const passwordService = {
  /**
   * B4: Gửi yêu cầu quên mật khẩu.
   * Luôn trả về success=true để tránh user enumeration.
   * Ghi PasswordReset record vào DB (hoặc gửi email trong thực tế).
   */
  async requestReset(email: string, ipAddress?: string) {
    const user = await prisma.user.findUnique({ where: { email } });

    // Luôn trả 200 để tránh user enumeration attack
    // Nếu user không tồn tại → vẫn return như bình thường (không leak thông tin)

    if (user) {
      // Xóa các token cũ chưa dùng
      await prisma.passwordReset.deleteMany({
        where: { userId: user.userId, usedAt: null },
      });

      // Tạo token mới
      const token = crypto.randomBytes(RESET_TOKEN_BYTES).toString("hex");
      const expiresAt = new Date(Date.now() + RESET_EXPIRY_HOURS * 60 * 60 * 1000);

      await prisma.passwordReset.create({
        data: {
          userId: user.userId,
          token,
          expiresAt,
          ipAddress: ipAddress ?? null,
        },
      });

      // TODO: Gửi email thực tế với link
      // Trong dev: log link ra console để test
      const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
      console.log(`[Password Reset] Email: ${email} | Link: ${resetLink}`);
    }

    return {
      message: "Nếu email tồn tại trong hệ thống, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu.",
    };
  },

  /**
   * B5: Đặt lại mật khẩu bằng token.
   * Token dùng 1 lần (usedAt được set).
   * Sau khi reset → revoke tất cả UserSession hiện có để đảm bảo các phiên cũ
   * không tiếp tục hoạt động với mật khẩu mới.
   */
  async resetPassword(token: string, newPassword: string) {
    if (!token || token.length < 10) {
      throw new AppError("Token không hợp lệ", 400, "INVALID_TOKEN");
    }

    const resetRecord = await prisma.passwordReset.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetRecord) {
      throw new AppError("Token không hợp lệ hoặc đã hết hạn", 400, "INVALID_TOKEN");
    }

    if (resetRecord.usedAt) {
      throw new AppError("Liên kết đặt lại mật khẩu đã được sử dụng", 400, "TOKEN_USED");
    }

    if (resetRecord.expiresAt < new Date()) {
      throw new AppError("Liên kết đặt lại mật khẩu đã hết hạn", 400, "TOKEN_EXPIRED");
    }

    if (!resetRecord.user.passwordHash) {
      throw new AppError("Tài khoản này không hỗ trợ đặt lại mật khẩu", 400, "INVALID_ACCOUNT");
    }

    const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Transaction: update password + mark token as used + revoke all sessions
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.user.update({
        where: { userId: resetRecord.userId },
        data: { passwordHash: newHash },
      });

      await tx.passwordReset.update({
        where: { resetId: resetRecord.resetId },
        data: { usedAt: new Date() },
      });

      // Revoke mọi session hiện có của user — đảm bảo các phiên cũ
      // (đang dùng access token cũ) không tiếp tục được authorize sau khi đổi pass.
      await tx.userSession.updateMany({
        where: { userId: resetRecord.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    });

    return { message: "Đặt lại mật khẩu thành công. Vui lòng đăng nhập với mật khẩu mới." };
  },

  /**
   * B5-OTP: Đặt lại mật khẩu bằng OTP (flow mobile / Partner).
   *
   * Flow:
   *  1. Verify OTP qua `emailOtpService.verifyOtp` với purpose = RESET_PASSWORD
   *     (đã bao gồm kiểm tra: tồn tại, chưa expire, chưa vượt attempt limit).
   *  2. Nếu OTP hợp lệ → tìm user theo email.
   *  3. Hash new password + update + revoke mọi UserSession của user.
   *
   * Lưu ý: `verifyOtp` đã đánh `consumedAt` trên OTP nên không thể reuse.
   */
  async resetPasswordWithOtp(
    email: string,
    code: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const verifyResult = await emailOtpService.verifyOtp(
      email,
      code,
      "RESET_PASSWORD" as OtpPurposeType,
    );

    if (!verifyResult.ok) {
      throw new AppError(verifyResult.reason, 400, "OTP_INVALID");
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new AppError("Không tìm thấy tài khoản", 404, "USER_NOT_FOUND");
    }

    if (!user.passwordHash) {
      // Tài khoản OAuth-only (Google/Facebook) không có passwordHash
      // → không thể reset bằng OTP. Yêu cầu user dùng Google login.
      throw new AppError(
        "Tài khoản này không hỗ trợ đặt lại mật khẩu bằng email",
        400,
        "INVALID_ACCOUNT",
      );
    }

    const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.user.update({
        where: { userId: user.userId },
        data: { passwordHash: newHash },
      });

      // Revoke mọi session hiện có — đảm bảo các access token cũ
      // không tiếp tục hoạt động sau khi mật khẩu đã đổi.
      await tx.userSession.updateMany({
        where: { userId: user.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    });

    return {
      message: "Đặt lại mật khẩu thành công. Vui lòng đăng nhập với mật khẩu mới.",
    };
  },
};
