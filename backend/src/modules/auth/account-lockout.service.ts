/**
 * Account Lockout Service
 * --------------------------------------------------------------
 * Xử lý account lockout sau nhiều lần đăng nhập thất bại.
 * - Lock tài khoản sau MAX_FAILED_ATTEMPTS lần thất bại
 * - Auto-unlock sau LOCKOUT_DURATION phút
 * - Reset counter khi đăng nhập thành công
 */
import { prisma } from "../../config/prisma";
import { AppError } from "../../middlewares/errorHandler";

// Cấu hình lockout
const MAX_FAILED_ATTEMPTS = 5; // Số lần thất bại trước khi lock
const LOCKOUT_DURATION_MINUTES = 15; // Thời gian lockout (phút)
const RESET_AFTER_SUCCESS = true; // Reset counter khi login thành công

export const accountLockoutService = {
  /**
   * Kiểm tra xem tài khoản có đang bị lock không.
   * @returns true nếu account bị lock
   */
  async isLocked(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { userId },
      select: { lockoutUntil: true },
    });

    if (!user) return false;

    // Nếu lockoutUntil > now → vẫn đang bị lock
    if (user.lockoutUntil && user.lockoutUntil > new Date()) {
      return true;
    }

    // Nếu lockout đã hết hạn → auto-unlock
    if (user.lockoutUntil && user.lockoutUntil <= new Date()) {
      await this.unlock(userId);
    }

    return false;
  },

  /**
   * Kiểm tra và throw error nếu account bị lock.
   * Dùng trong login flow.
   */
  async checkLockout(email: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { userId: true, lockoutUntil: true, failedLoginAttempts: true },
    });

    if (!user) return; // User chưa tồn tại, không check

    // Auto-unlock nếu đã hết thời gian lock
    if (user.lockoutUntil && user.lockoutUntil <= new Date()) {
      await this.unlock(user.userId);
      return;
    }

    // Nếu đang bị lock
    if (user.lockoutUntil && user.lockoutUntil > new Date()) {
      const remainingMinutes = Math.ceil(
        (user.lockoutUntil.getTime() - Date.now()) / 60000,
      );
      throw new AppError(
        `Tài khoản đang bị khóa tạm thời. Vui lòng thử lại sau ${remainingMinutes} phút.`,
        423, // 423 Locked
        "ACCOUNT_LOCKED",
      );
    }
  },

  /**
   * Ghi nhận đăng nhập thất bại.
   * Tăng counter và lock nếu đạt ngưỡng.
   * @returns Thông tin về trạng thái lockout
   */
  async recordFailedAttempt(email: string): Promise<{
    attemptsRemaining: number;
    isLocked: boolean;
    lockoutUntil?: Date;
  }> {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { userId: true, failedLoginAttempts: true, lockoutUntil: true },
    });

    if (!user) {
      // User không tồn tại - không cần lock (có thể là brute force)
      return { attemptsRemaining: MAX_FAILED_ATTEMPTS, isLocked: false };
    }

    // Nếu đang bị lock, không tăng counter nữa
    if (user.lockoutUntil && user.lockoutUntil > new Date()) {
      return {
        attemptsRemaining: 0,
        isLocked: true,
        lockoutUntil: user.lockoutUntil,
      };
    }

    const newAttempts = user.failedLoginAttempts + 1;
    const attemptsRemaining = Math.max(0, MAX_FAILED_ATTEMPTS - newAttempts);

    // Tính toán lockout
    const lockoutUntil =
      newAttempts >= MAX_FAILED_ATTEMPTS
        ? new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000)
        : null;

    await prisma.user.update({
      where: { userId: user.userId },
      data: {
        failedLoginAttempts: newAttempts,
        ...(lockoutUntil && { lockoutUntil }),
      },
    });

    if (lockoutUntil) {
      console.log(
        `[AccountLockout] User ${email} locked until ${lockoutUntil.toISOString()}`,
      );
    }

    return {
      attemptsRemaining,
      isLocked: newAttempts >= MAX_FAILED_ATTEMPTS,
      lockoutUntil: lockoutUntil || undefined,
    };
  },

  /**
   * Reset counter khi đăng nhập thành công.
   */
  async recordSuccessfulLogin(email: string): Promise<void> {
    if (!RESET_AFTER_SUCCESS) return;

    const user = await prisma.user.findUnique({
      where: { email },
      select: { userId: true, failedLoginAttempts: true },
    });

    if (!user || user.failedLoginAttempts === 0) return;

    await prisma.user.update({
      where: { userId: user.userId },
      data: {
        failedLoginAttempts: 0,
        lockoutUntil: null,
      },
    });
  },

  /**
   * Unlock tài khoản (admin có thể gọi).
   */
  async unlock(userId: string): Promise<void> {
    await prisma.user.update({
      where: { userId },
      data: {
        failedLoginAttempts: 0,
        lockoutUntil: null,
      },
    });
  },

  /**
   * Get lockout status của user.
   */
  async getStatus(userId: string): Promise<{
    isLocked: boolean;
    failedAttempts: number;
    attemptsRemaining: number;
    lockoutUntil: Date | null;
  }> {
    const user = await prisma.user.findUnique({
      where: { userId },
      select: {
        failedLoginAttempts: true,
        lockoutUntil: true,
      },
    });

    if (!user) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    const isLocked =
      user.lockoutUntil !== null && user.lockoutUntil > new Date();

    return {
      isLocked,
      failedAttempts: user.failedLoginAttempts,
      attemptsRemaining: Math.max(0, MAX_FAILED_ATTEMPTS - user.failedLoginAttempts),
      lockoutUntil: user.lockoutUntil,
    };
  },
};
