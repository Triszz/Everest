import { prisma } from "../../../config/prisma";
import type { SubmitFeedbackInput } from "./feedback.schemas";

// ── Helpers ────────────────────────────────────────────────────────────────────

function generateTicketId(): string {
  const prefix = "FBK";
  const timestamp = Date.now().toString(36).toUpperCase().slice(-5);
  const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${timestamp}-${rand}`.substring(0, 20);
}

// ── Service ────────────────────────────────────────────────────────────────────

export const feedbackService = {
  /**
   * Submit a new feedback/ticket.
   * customerId is optional — guests can also submit (email required).
   */
  async submit(input: SubmitFeedbackInput, customerId?: string, ipAddress?: string) {
    const { type, subject, message, email, phone, orderId, voucherCode } = input;

    // Validate orderId if provided
    if (orderId) {
      const order = await prisma.order.findUnique({
        where: { orderId },
        select: { orderId: true, customerId: true },
      });
      if (!order) {
        throw new Error("Không tìm thấy đơn hàng này.");
      }
      // If customer is logged in, verify they own the order
      if (customerId && order.customerId !== customerId) {
        throw new Error("Bạn không có quyền phản hồi cho đơn hàng này.");
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

  /**
   * List feedbacks for admin.
   * Returns paginated list with optional filters.
   */
  async list(query: {
    status?: string;
    type?: string;
    page?: number;
    pageSize?: number;
  }) {
    const { status, type, page = 1, pageSize = 20 } = query;
    const skip = (page - 1) * pageSize;

    const where = {
      ...(status ? { status } : {}),
      ...(type ? { type } : {}),
    };

    const [feedbacks, total] = await Promise.all([
      prisma.feedback.findMany({
        where,
        include: {
          customer: {
            select: {
              userId: true,
              fullName: true,
              email: true,
            },
          },
          order: {
            select: {
              orderId: true,
              totalAmount: true,
              paymentStatus: true,
            },
          },
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
          ? {
              userId: f.customer.userId,
              fullName: f.customer.fullName,
              email: f.customer.email,
            }
          : null,
      })),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  },

  /**
   * Update feedback status (admin only).
   */
  async updateStatus(feedbackId: number, status: string) {
    const ALLOWED = ["Open", "InProgress", "Resolved", "Closed"];
    if (!ALLOWED.includes(status)) {
      throw new Error("Trạng thái không hợp lệ.");
    }

    const feedback = await prisma.feedback.findUnique({
      where: { feedbackId },
    });

    if (!feedback) {
      throw new Error("Không tìm thấy phản hồi.");
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

  /**
   * Get single feedback (admin).
   */
  async getById(feedbackId: number) {
    const feedback = await prisma.feedback.findUnique({
      where: { feedbackId },
      include: {
        customer: {
          select: { userId: true, fullName: true, email: true },
        },
        order: {
          select: {
            orderId: true,
            totalAmount: true,
            paymentStatus: true,
            createdAt: true,
          },
        },
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
};
