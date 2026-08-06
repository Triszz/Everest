/**
 * Feedback Service
 * --------------------------------------------------------------
 * Nghiệp vụ Feedback:
 *
 * Customer (public/auth):
 *   - submit: gửi phản hồi/kiến nghị mới
 *
 * Admin (authenticate + roleGuard):
 *   - list/listById/updateStatus
 *
 * Lưu ý: toàn bộ functions đều trong 1 file service vì
 * Prisma model Feedback là DUY NHẤT. Admin/partner/customer
 * chỉ khác nhau ở query WHERE (ai được phép truy cập).
 */
import { prisma } from "../../../config/prisma";
import { AppError } from "../../../middlewares/errorHandler";
import type { SubmitFeedbackInput } from "./feedback.schemas";
import { buildPagination } from "../shared";

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Sinh ticket ID ngẫu nhiên cho feedback. */
function generateTicketId(): string {
  const prefix = "FBK";
  const timestamp = Date.now().toString(36).toUpperCase().slice(-5);
  const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${timestamp}-${rand}`.substring(0, 20);
}

// ── Customer ─────────────────────────────────────────────────────────────────

export const feedbackService = {
  /**
   * Gửi phản hồi mới (customer hoặc guest).
   * @param input Dữ liệu form feedback
   * @param customerId Optional — nếu đã đăng nhập thì gắn vào feedback
   * @param ipAddress IP của người gửi (để trace spam)
   */
  async submit(
    input: SubmitFeedbackInput,
    customerId?: string,
    ipAddress?: string,
  ) {
    const { type, subject, message, email, phone, orderId, voucherCode } = input;

    // Nếu truyền orderId → verify đơn tồn tại + thuộc về customer
    if (orderId) {
      const order = await prisma.order.findUnique({
        where: { orderId },
        select: { orderId: true, customerId: true },
      });
      if (!order) {
        throw new AppError("Không tìm thấy đơn hàng này", 400, "BAD_REQUEST");
      }
      if (customerId && order.customerId !== customerId) {
        throw new AppError(
          "Bạn không có quyền phản hồi cho đơn hàng này",
          403,
          "FORBIDDEN",
        );
      }
    }

    const feedback = await prisma.feedback.create({
      data: {
        customerId: customerId ?? null,
        type,
        subject,
        message,
        email,
        phone: phone ?? null,
        orderId: orderId ?? null,
        voucherCode: voucherCode ?? null,
        status: "Open",
        ticketId: generateTicketId(),
        ipAddress: ipAddress ?? null,
      },
    });

    return {
      ticketId: feedback.ticketId,
      feedbackId: feedback.feedbackId,
      status: feedback.status,
      createdAt: feedback.createdAt,
    };
  },

  // ── Admin ─────────────────────────────────────────────────────────────────

  /**
   * Danh sách feedback cho admin (phân trang + filter).
   */
  async list(query: {
    status?: string;
    type?: string;
    page?: number;
    pageSize?: number;
  }) {
    const { status, type, page = 1, pageSize = 20 } = query;
    const { skip, pagination } = buildPagination(page, pageSize, 0);

    const where = {
      ...(status ? { status } : {}),
      ...(type ? { type } : {}),
    };

    const [feedbacks, total] = await Promise.all([
      prisma.feedback.findMany({
        where,
        include: {
          customer: { select: { userId: true, fullName: true, email: true } },
          order: { select: { orderId: true, totalAmount: true, paymentStatus: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.feedback.count({ where }),
    ]);

    return {
      feedbacks: feedbacks.map((f) => ({
        feedbackId: f.feedbackId,
        ticketId: f.ticketId,
        type: f.type,
        subject: f.subject,
        status: f.status,
        email: f.email,
        phone: f.phone,
        orderId: f.orderId,
        voucherCode: f.voucherCode,
        createdAt: f.createdAt,
        customer: f.customer
          ? { userId: f.customer.userId, fullName: f.customer.fullName, email: f.customer.email }
          : null,
      })),
      pagination: { ...pagination, total },
    };
  },

  /**
   * Chi tiết 1 feedback (admin).
   */
  async getById(feedbackId: number) {
    const feedback = await prisma.feedback.findUnique({
      where: { feedbackId },
      include: {
        customer: { select: { userId: true, fullName: true, email: true } },
        order: { select: { orderId: true, totalAmount: true, paymentStatus: true, createdAt: true } },
      },
    });

    if (!feedback) return null;

    return {
      feedbackId: feedback.feedbackId,
      ticketId: feedback.ticketId,
      type: feedback.type,
      subject: feedback.subject,
      message: feedback.message,
      email: feedback.email,
      phone: feedback.phone,
      status: feedback.status,
      orderId: feedback.orderId,
      voucherCode: feedback.voucherCode,
      ipAddress: feedback.ipAddress,
      createdAt: feedback.createdAt,
      updatedAt: feedback.updatedAt,
      customer: feedback.customer
        ? { userId: feedback.customer.userId, fullName: feedback.customer.fullName }
        : null,
      order: feedback.order,
    };
  },

  /**
   * Cập nhật trạng thái feedback (admin).
   */
  async updateStatus(feedbackId: number, status: string) {
    const ALLOWED = ["Open", "InProgress", "Resolved", "Closed"];
    if (!ALLOWED.includes(status)) {
      throw new AppError("Trạng thái không hợp lệ", 400, "BAD_REQUEST");
    }

    const feedback = await prisma.feedback.findUnique({ where: { feedbackId } });
    if (!feedback) {
      throw new AppError("Không tìm thấy phản hồi", 404, "NOT_FOUND");
    }

    const updated = await prisma.feedback.update({
      where: { feedbackId },
      data: { status },
    });

    return {
      feedbackId: updated.feedbackId,
      ticketId: updated.ticketId,
      status: updated.status,
    };
  },
};