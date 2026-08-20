/**
 * Notification Service
 * --------------------------------------------------------------
 * Manages notification preferences and notification messages for users.
 * - Preferences: toggle on/off each notification type
 * - Notifications: actual messages (order, voucher gift, etc.)
 *
 * Mapping NotificationType -> preference keys (n1-n9):
 * - n1: Order notifications     -> ORDER_PAID, ORDER_PURCHASED
 * - n2: Voucher expiring       -> VOUCHER_EXPIRING
 * - n3: New promotions         -> SYSTEM (promo)
 * - n4: Voucher gift received   -> VOUCHER_GIFT_RECEIVED
 * - n5-n9: (not sent from backend yet)
 */
import { prisma } from "../../../config/prisma";
import { Prisma } from "../../../generated/prisma/client";
import type { UpdateNotificationsInput } from "./notifications.schemas";
import { NotificationType } from "../../../generated/prisma/enums";
import { buildPagination } from "../shared";

const DEFAULT_PREFS: Record<string, boolean> = {
  n1: true, n2: true, n3: true, n4: true,
  n5: true, n6: true, n7: true, n8: true, n9: true,
};

/**
 * Mapping from NotificationType -> preference key.
 * If type has no mapping -> notification is always sent (not gated by preference).
 */
const TYPE_TO_PREF_KEY: Partial<Record<NotificationType, string>> = {
  ORDER_PAID: "n1",
  ORDER_PURCHASED: "n1",
  VOUCHER_EXPIRING: "n2",
  VOUCHER_GIFT_RECEIVED: "n4",
};

export const notificationsService = {
  // ============= PREFERENCES =============

  /**
   * Get user preferences. Creates default record if none exists.
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
   * Update preferences (partial update).
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

  // ============= NOTIFICATIONS =============

  /**
   * Check if user has this notification type enabled in preferences.
   * Returns true if:
   * - No mapping for this type (always send)
   * - Preference is enabled (true)
   * - No preference record exists (default to true)
   */
  async isNotificationEnabled(
    userId: string,
    type: NotificationType,
  ): Promise<boolean> {
    const prefKey = TYPE_TO_PREF_KEY[type];
    if (!prefKey) {
      return true; // No mapping -> always send
    }

    const prefs = await this.getPreferences(userId);
    if (prefs[prefKey] === undefined) {
      return true; // No pref record -> default to enabled
    }

    return prefs[prefKey];
  },

  /**
   * Create a notification for a user.
   * ONLY creates if user has enabled this notification type in preferences.
   *
   * @param userId - Recipient user
   * @param type - Notification type
   * @param title - Title
   * @param message - Body text
   * @param data - Extra data (orderId, voucherCode, etc.)
   */
  async createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    data?: Record<string, unknown>,
  ) {
    const enabled = await this.isNotificationEnabled(userId, type);
    if (!enabled) {
      console.log(`[notifications] Skipped: user=${userId} type=${type} (disabled by preference)`);
      return null;
    }

    return prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        data: (data as Prisma.InputJsonValue) ?? undefined,
      },
    });
  },

  /**
   * Notify buyer when payment is successful.
   */
  async notifyOrderPurchased(customerId: string, orderId: number, totalAmount: number) {
    return this.createNotification(
      customerId,
      "ORDER_PAID",
      "Thanh toan thanh cong",
      `Don hang #${orderId} da duoc thanh toan. Tong: ${totalAmount.toLocaleString("vi-VN")}VND`,
      { orderId, totalAmount },
    );
  },

  /**
   * Notify receiver when they receive a voucher gift.
   */
  async notifyVoucherGiftReceived(
    receiverId: string,
    gifterName: string,
    voucherTitle: string,
    voucherCode: string,
    giftMessage?: string,
  ) {
    const title = `Ban nhan duoc voucher tang tu ${gifterName}!`;
    const message = giftMessage
      ? `"${giftMessage}" - Voucher "${voucherTitle}" da duoc them vao tai khoan.`
      : `${gifterName} da tang ban voucher "${voucherTitle}". Ma: ${voucherCode}`;

    return this.createNotification(
      receiverId,
      "VOUCHER_GIFT_RECEIVED",
      title,
      message,
      { gifterName, voucherTitle, voucherCode, giftMessage },
    );
  },

  /**
   * Get paginated notifications for a user.
   */
  async getNotifications(
    userId: string,
    page: number = 1,
    pageSize: number = 20,
  ) {
    const { skip, pagination } = buildPagination(page, pageSize, 0);

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.notification.count({ where: { userId } }),
      prisma.notification.count({ where: { userId, status: "Unread" } }),
    ]);

    return {
      notifications: notifications.map((n) => ({
        notificationId: n.notificationId,
        type: n.type,
        title: n.title,
        message: n.message,
        data: n.data as Record<string, unknown> | null,
        status: n.status,
        createdAt: n.createdAt,
      })),
      unreadCount,
      pagination: { ...pagination, total },
    };
  },

  /**
   * Get a single notification by ID (with ownership check).
   * Auto-marks as Read if currently Unread.
   */
  async getNotificationById(userId: string, notificationId: number) {
    const notification = await prisma.notification.findFirst({
      where: { notificationId, userId },
    });
    if (!notification) return null;

    if (notification.status === "Unread") {
      await prisma.notification.update({
        where: { notificationId },
        data: { status: "Read" },
      });
      notification.status = "Read";
    }

    return {
      notificationId: notification.notificationId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data as Record<string, unknown> | null,
      status: notification.status,
      createdAt: notification.createdAt,
    };
  },

  /**
   * Count unread notifications.
   */
  async getUnreadCount(userId: string): Promise<number> {
    return prisma.notification.count({
      where: { userId, status: "Unread" },
    });
  },

  /**
   * Mark one notification as read.
   */
  async markAsRead(userId: string, notificationId: number) {
    const notification = await prisma.notification.findFirst({
      where: { notificationId, userId },
    });

    if (!notification) return null;

    return prisma.notification.update({
      where: { notificationId },
      data: { status: "Read" },
    });
  },

  /**
   * Mark all notifications as read.
   */
  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, status: "Unread" },
      data: { status: "Read" },
    });
  },

  /**
   * Delete a notification.
   */
  async deleteNotification(userId: string, notificationId: number) {
    const notification = await prisma.notification.findFirst({
      where: { notificationId, userId },
    });

    if (!notification) return null;

    return prisma.notification.delete({
      where: { notificationId },
    });
  },
};
