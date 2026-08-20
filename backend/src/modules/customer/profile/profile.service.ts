/**
 * Profile Service
 * --------------------------------------------------------------
 * Nghiệp vụ hồ sơ customer:
 * - Xem hồ sơ
 * - Cập nhật thông tin (fullName, phoneNumber)
 * - Đổi mật khẩu
 */
import bcrypt from "bcrypt";
import { prisma } from "../../../config/prisma";
import { AppError } from "../../../middlewares/errorHandler";
import type { UpdateProfileInput, ChangePasswordInput } from "./profile.schemas";

const SALT_ROUNDS = 12;

export const profileService = {
  /**
   * Lấy thông tin hồ sơ customer hiện tại.
   * Throw 404 nếu user không tồn tại.
   */
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { userId },
      select: {
        userId: true,
        email: true,
        phoneNumber: true,
        fullName: true,
        role: true,
        status: true,
        partnerId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) {
      throw new AppError("Người dùng không tồn tại", 404, "NOT_FOUND");
    }
    return user;
  },

  /**
   * Cập nhật thông tin hồ sơ.
   * Check trùng phoneNumber với user khác.
   */
  async updateProfile(userId: string, input: UpdateProfileInput) {
    if (input.phoneNumber) {
      const existing = await prisma.user.findFirst({
        where: { phoneNumber: input.phoneNumber, NOT: { userId } },
      });
      if (existing) {
        throw new AppError("Số điện thoại đã được sử dụng", 409, "CONFLICT");
      }
    }

    return prisma.user.update({
      where: { userId },
      data: {
        ...(input.fullName !== undefined && { fullName: input.fullName }),
        ...(input.phoneNumber !== undefined && { phoneNumber: input.phoneNumber }),
      },
      select: {
        userId: true,
        email: true,
        phoneNumber: true,
        fullName: true,
        role: true,
        status: true,
        updatedAt: true,
      },
    });
  },

  /**
   * Đổi mật khẩu. Verify mật khẩu hiện tại trước.
   * Throw nếu tài khoản không có password (ví dụ login qua OAuth).
   */
  async changePassword(userId: string, input: ChangePasswordInput) {
    const user = await prisma.user.findUnique({
      where: { userId },
      select: { passwordHash: true },
    });

    if (!user) {
      throw new AppError("Người dùng không tồn tại", 404, "NOT_FOUND");
    }
    if (!user.passwordHash) {
      throw new AppError(
        "Tài khoản không hỗ trợ đổi mật khẩu",
        400,
        "BAD_REQUEST",
      );
    }

    const valid = await bcrypt.compare(input.currentPassword, user.passwordHash);
    if (!valid) {
      throw new AppError(
        "Mật khẩu hiện tại không đúng",
        400,
        "VALIDATION_ERROR",
      );
    }

    const newHash = await bcrypt.hash(input.newPassword, SALT_ROUNDS);
    await prisma.user.update({
      where: { userId },
      data: { passwordHash: newHash },
    });
  },
};