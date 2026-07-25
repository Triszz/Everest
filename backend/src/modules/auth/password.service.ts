import bcrypt from "bcrypt";
import crypto from "crypto";
import { prisma } from "../../config/prisma";
import { AppError } from "../../middlewares/errorHandler";
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

    // Transaction: update password + mark token as used + revoke all refresh tokens
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.user.update({
        where: { userId: resetRecord.userId },
        data: { passwordHash: newHash },
      });

      await tx.passwordReset.update({
        where: { resetId: resetRecord.resetId },
        data: { usedAt: new Date() },
      });

      // Xóa tất cả refresh tokens cũ (force re-login)
      // NOTE: Nếu có bảng refresh_token → xóa ở đây
    });

    return { message: "Đặt lại mật khẩu thành công. Vui lòng đăng nhập với mật khẩu mới." };
  },
};
