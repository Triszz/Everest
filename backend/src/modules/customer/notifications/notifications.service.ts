/**
 * Notification Preferences Service
 * --------------------------------------------------------------
 * Quản lý notification preferences của user.
 * Mỗi user có 1 record trong bảng NotificationPreference.
 * Preferences được lưu dạng JSON object { n1: true, n2: false, ... }.
 */
import { prisma } from "../../../config/prisma";
import type { UpdateNotificationsInput } from "./notifications.schemas";

const DEFAULT_PREFS: Record<string, boolean> = {
  n1: true, n2: true, n3: true, n4: true,
  n5: true, n6: true, n7: true, n8: true, n9: true,
};

export const notificationsService = {
  /**
   * Lấy preferences hiện tại của user.
   * Tạo record mới với default = true nếu chưa có.
   */
  async getPreferences(userId: string): Promise<Record<string, boolean>> {
    let pref = await prisma.notificationPreference.findUnique({
      where: { userId },
    });

    if (!pref) {
      pref = await prisma.notificationPreference.create({
        data: { userId, prefs: DEFAULT_PREFS },
      });
    }

    return pref.prefs as Record<string, boolean>;
  },

  /**
   * Cập nhật preferences (partial update — chỉ update các trường được gửi).
   */
  async updatePreferences(
    userId: string,
    input: UpdateNotificationsInput,
  ): Promise<Record<string, boolean>> {
    const current = await notificationsService.getPreferences(userId);
    const updated = { ...current, ...input };

    const pref = await prisma.notificationPreference.upsert({
      where: { userId },
      create: { userId, prefs: updated },
      update: { prefs: updated },
    });

    return pref.prefs as Record<string, boolean>;
  },
};