import { prisma } from "../../../config/prisma";
import type { UpdateNotificationsInput } from "./notifications.schemas";

export const notificationsService = {
  /**
   * Lấy preferences của user.
   * Tạo record mới với default = true nếu chưa có.
   */
  async getPreferences(userId: string) {
    let pref = await prisma.notificationPreference.findUnique({
      where: { userId },
    });

    if (!pref) {
      // Tạo với default all true
      const defaultPrefs: Record<string, boolean> = {
        n1: true, n2: true, n3: true, n4: true,
        n5: true, n6: true, n7: true, n8: true, n9: true,
      };
      pref = await prisma.notificationPreference.create({
        data: { userId, prefs: defaultPrefs },
      });
    }

    return pref.prefs as Record<string, boolean>;
  },

  /**
   * Cập nhật preferences.
   * Chỉ update các trường được gửi (partial update).
   */
  async updatePreferences(userId: string, input: UpdateNotificationsInput) {
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
