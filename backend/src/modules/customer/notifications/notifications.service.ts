/**
 * Notification Service
 * --------------------------------------------------------------
 * Quản lý notification preferences và notification messages của user.
 * - Preferences: cài đặt bật/tắt từng loại thông báo
 * - Notifications: các thông báo thực tế (order, voucher tặng, etc.)
 */
import { prisma } from "../../../config/prisma";
import { Prisma } from "../../../generated/prisma/client";
import type { UpdateNotificationsInput } from "./notifications.schemas";
import type { NotificationType } from "../../../generated/prisma/enums";
import { buildPagination } from "../shared";

const DEFAULT_PREFS: Record<string, boolean> = {
  n1: true, n2: true, n3: true, n4: true,
  n5: true, n6: true, n7: true, n8: true, n9: true,
};

export const notificationsService = {
  // ============= PREFERENCES =============

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

  // ============= NOTIFICATIONS =============

  /**
   * Tạo notification cho user.
   * @param userId - User nhận notification
   * @param type - Loại notification
   * @param title - Tiêu đề
   * @param message - Nội dung
   * @param data - Dữ liệu bổ sung (orderId, voucherCode, etc.)
   */
  async createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    data?: Record<string, unknown>,
  ) {
    return prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        data: (data ?? undefined) as Prisma.InputJsonValue,
      },
    });
  },

  /**
   * Tạo notification cho buyer khi thanh toán thành công.
   */
  async notifyOrderPurchased(customerId: string, orderId: number, totalAmount: number) {
    return this.createNotification(
      customerId,
      "ORDER_PAID",
      "Thanh toán thành công",
      `Đơn hàng #${orderId} đã được thanh toán thành công. Tổng thanh toán: ${totalAmount.toLocaleString("vi-VN")}₫`,
      { orderId, totalAmount },
    );
  },

  /**
   * Tạo notification cho người nhận khi được tặng voucher.
   */
  async notifyVoucherGiftReceived(
    receiverId: string,
    gifterName: string,
    voucherTitle: string,
    voucherCode: string,
    giftMessage?: string,
  ) {
    const title = `Bạn nhận được voucher tặng từ ${gifterName}!`;
    const message = giftMessage
      ? `"${giftMessage}" - Voucher "${voucherTitle}" đã được thêm vào tài khoản của bạn.`
      : `${gifterName} đã tặng bạn voucher "${voucherTitle}". Mã: ${voucherCode}`;

    return this.createNotification(
      receiverId,
      "VOUCHER_GIFT_RECEIVED",
      title,
      message,
      { gifterName, voucherTitle, voucherCode, giftMessage },
    );
  },

  /**
   * Lấy danh sách notifications của user (phân trang).
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
   * Lấy 1 notification theo ID (kiểm tra ownership).
   * Tự động đánh dấu là đã đọc nếu đang Unread.
   */
  async getNotificationById(userId: string, notificationId: number) {
    const notification = await prisma.notification.findFirst({
      where: { notificationId, userId },
    });
    if (!notification) return null;

    // Auto mark as read
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
   * Đếm số notification chưa đọc.
   */
  async getUnreadCount(userId: string): Promise<number> {
    return prisma.notification.count({
      where: { userId, status: "Unread" },
    });
  },

  /**
   * Đánh dấu 1 notification là đã đọc.
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
   * Đánh dấu tất cả notifications của user là đã đọc.
   */
  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, status: "Unread" },
      data: { status: "Read" },
    });
  },

  /**
   * Xóa 1 notification.
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