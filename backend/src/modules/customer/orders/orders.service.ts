import { prisma } from "../../../config/prisma";
import { AppError } from "../../../middlewares/errorHandler";
import type { CreateOrderInput, CheckoutInput } from "./orders.schemas";

// ── Helpers ────────────────────────────────────────────────────────────────────

function generateVoucherCode(voucherTitle: string, index: number): string {
  const prefix = voucherTitle
    .split(" ")
    .filter((w) => w.length > 0)
    .slice(0, 3)
    .map((w) => w[0].toUpperCase())
    .join("")
    .substring(0, 4);

  const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
  const seq = String(index).padStart(2, "0");

  return `EVR-${prefix}-${timestamp}${seq}`.substring(0, 20);
}

// ── Queries ────────────────────────────────────────────────────────────────────

export const ordersService = {
  // ── Create order (Pending) ───────────────────────────────────────────────────
  async createOrder(customerId: string, input: CreateOrderInput) {
    const { buyerInfo, items, sendAsGift } = input;

    if (items.length === 0) {
      throw new AppError("Đơn hàng phải có ít nhất 1 voucher", 400, "EMPTY_ORDER");
    }

    // RB-01 + RB-03 + RB-04 + RB-11: validate all vouchers
    const voucherIds = items.map((i) => i.voucherId);

    const vouchers = await prisma.voucher.findMany({
      where: { voucherId: { in: voucherIds } },
    });

    if (vouchers.length !== voucherIds.length) {
      throw new AppError("Một số voucher không tồn tại", 400, "VOUCHER_NOT_FOUND");
    }

    const now = new Date();
    let totalAmount = 0;

    for (const item of items) {
      const voucher = vouchers.find((v) => v.voucherId === item.voucherId)!;

      // RB-01: must be approved
      if (voucher.approvalStatus !== "Approved") {
        throw new AppError(
          `Voucher "${voucher.title}" chưa được duyệt`,
          400,
          "VOUCHER_NOT_APPROVED"
        );
      }

      // RB-03: must be within sale period
      if (now < voucher.startDate || now > voucher.endDate) {
        throw new AppError(
          `Voucher "${voucher.title}" không còn trong thời gian bán`,
          400,
          "VOUCHER_NOT_AVAILABLE"
        );
      }

      // RB-04 + RB-11: stock check
      if (voucher.availableQuantity < item.quantity) {
        throw new AppError(
          `Voucher "${voucher.title}" không đủ tồn kho. Chỉ còn ${voucher.availableQuantity}`,
          400,
          "INSUFFICIENT_STOCK"
        );
      }

      totalAmount += Number(voucher.salePrice) * item.quantity;
    }

    // Build order
    const order = await prisma.order.create({
      data: {
        customerId,
        totalAmount,
        isGift: sendAsGift,
        receiverEmail: sendAsGift ? buyerInfo.email : null,
        giftMessage: sendAsGift ? buyerInfo.email : null,
        paymentStatus: "Pending",
        orderItems: {
          create: items.map((item) => {
            const voucher = vouchers.find((v) => v.voucherId === item.voucherId)!;
            return {
              voucherId: item.voucherId,
              quantity: item.quantity,
              price: voucher.salePrice,
            };
          }),
        },
      },
      include: {
        orderItems: {
          include: {
            voucher: {
              select: {
                voucherId: true,
                title: true,
                imageUrl: true,
                salePrice: true,
                originalPrice: true,
                partner: { select: { companyName: true } },
              },
            },
          },
        },
      },
    });

    return {
      orderId: order.orderId,
      totalAmount: Number(order.totalAmount),
      paymentStatus: order.paymentStatus,
      isGift: order.isGift,
      createdAt: order.createdAt,
      orderItems: order.orderItems.map((item) => ({
        orderItemId: item.orderItemId,
        voucherId: item.voucherId,
        quantity: item.quantity,
        price: Number(item.price),
        voucher: {
          title: item.voucher.title,
          imageUrl: item.voucher.imageUrl,
          partner: item.voucher.partner.companyName,
        },
      })),
    };
  },

  // ── Checkout: mark paid + issue voucher codes ──────────────────────────────
  async checkoutOrder(customerId: string, orderId: number, input: CheckoutInput) {
    const { paymentMethod } = input;

    // Fetch order
    const order = await prisma.order.findFirst({
      where: { orderId, customerId },
      include: { orderItems: { include: { voucher: true } } },
    });

    if (!order) {
      throw new AppError("Không tìm thấy đơn hàng", 404, "ORDER_NOT_FOUND");
    }

    if (order.paymentStatus === "Paid") {
      throw new AppError("Đơn hàng đã thanh toán trước đó", 400, "ALREADY_PAID");
    }

    if (order.paymentStatus === "Cancelled") {
      throw new AppError("Đơn hàng đã bị hủy", 400, "ORDER_CANCELLED");
    }

    // RB-15: double-check stock at time of payment
    for (const item of order.orderItems) {
      const fresh = await prisma.voucher.findUnique({
        where: { voucherId: item.voucherId },
        select: { availableQuantity: true, title: true },
      });

      if (!fresh || fresh.availableQuantity < item.quantity) {
        throw new AppError(
          `Voucher "${item.voucher.title}" không đủ tồn kho tại thời điểm thanh toán. Vui lòng thử lại.`,
          409,
          "INSUFFICIENT_STOCK_AT_CHECKOUT"
        );
      }
    }

    // ── Transaction: pay + decrement stock + issue vouchers ─────────────────
    const result = await prisma.$transaction(async (tx) => {
      // 1. Mark as paid
      const updatedOrder = await tx.order.update({
        where: { orderId },
        data: {
          paymentStatus: "Paid",
          paymentMethod,
        },
        include: { orderItems: true },
      });

      // 2. Decrement stock for each item
      for (const item of order.orderItems) {
        await tx.voucher.update({
          where: { voucherId: item.voucherId },
          data: { availableQuantity: { decrement: item.quantity } },
        });
      }

      // 3. Issue voucher codes (RB-05)
      const issuedVouchers = [];
      for (const item of order.orderItems) {
        for (let i = 0; i < item.quantity; i++) {
          const code = generateVoucherCode(item.voucher.title, i + 1);
          const validTo = new Date();
          validTo.setDate(validTo.getDate() + (item.voucher.expiryDays || 30));

          const issued = await tx.issuedVoucher.create({
            data: {
              orderItemId: item.orderItemId,
              voucherCode: code,
              status: "Unused",
              validFrom: new Date(),
              validTo,
            },
          });

          issuedVouchers.push({
            issuedVoucherId: issued.issuedVoucherId,
            voucherCode: issued.voucherCode,
            status: issued.status,
            validFrom: issued.validFrom,
            validTo: issued.validTo,
            voucher: {
              title: item.voucher.title,
              imageUrl: item.voucher.imageUrl,
              expiryDays: item.voucher.expiryDays,
              partner: item.voucher.partner?.companyName,
            },
          });
        }
      }

      return { updatedOrder, issuedVouchers };
    });

    return {
      orderId: result.updatedOrder.orderId,
      paymentStatus: result.updatedOrder.paymentStatus,
      paymentMethod: result.updatedOrder.paymentMethod,
      issuedVouchers: result.issuedVouchers,
    };
  },

  // ── Cancel order ──────────────────────────────────────────────────────────────
  async cancelOrder(customerId: string, orderId: number) {
    const order = await prisma.order.findFirst({
      where: { orderId, customerId },
    });

    if (!order) {
      throw new AppError("Không tìm thấy đơn hàng", 404, "ORDER_NOT_FOUND");
    }

    if (order.paymentStatus === "Paid") {
      throw new AppError("Không thể hủy đơn đã thanh toán", 400, "CANNOT_CANCEL_PAID_ORDER");
    }

    if (order.paymentStatus === "Cancelled") {
      throw new AppError("Đơn hàng đã bị hủy trước đó", 400, "ALREADY_CANCELLED");
    }

    const cancelled = await prisma.order.update({
      where: { orderId },
      data: { paymentStatus: "Cancelled" },
    });

    // RB-13: no vouchers issued for cancelled order (order is Pending, so no IssuedVoucher was created)

    return {
      orderId: cancelled.orderId,
      paymentStatus: cancelled.paymentStatus,
      message: "Đơn hàng đã được hủy thành công",
    };
  },

  // ── List orders (paginated) ─────────────────────────────────────────────────
  async listOrders(customerId: string, page = 1, pageSize = 10) {
    const skip = (page - 1) * pageSize;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { customerId },
        include: {
          orderItems: {
            include: {
              voucher: {
                select: {
                  title: true,
                  imageUrl: true,
                  partner: { select: { companyName: true } },
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.order.count({ where: { customerId } }),
    ]);

    return {
      orders: orders.map((o) => ({
        orderId: o.orderId,
        totalAmount: Number(o.totalAmount),
        paymentStatus: o.paymentStatus,
        paymentMethod: o.paymentMethod,
        isGift: o.isGift,
        createdAt: o.createdAt,
        itemCount: o.orderItems.reduce((sum, i) => sum + i.quantity, 0),
        vouchers: o.orderItems.map((i) => ({
          title: i.voucher.title,
          imageUrl: i.voucher.imageUrl,
          partner: i.voucher.partner.companyName,
          quantity: i.quantity,
        })),
      })),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  },

  // ── Get order detail ─────────────────────────────────────────────────────────
  async getOrder(customerId: string, orderId: number) {
    const order = await prisma.order.findFirst({
      where: { orderId, customerId },
      include: {
        orderItems: {
          include: {
            voucher: {
              select: {
                voucherId: true,
                title: true,
                imageUrl: true,
                salePrice: true,
                expiryDays: true,
                partner: { select: { companyName: true } },
              },
            },
            issuedVouchers: true,
          },
        },
      },
    });

    if (!order) {
      throw new AppError("Không tìm thấy đơn hàng", 404, "ORDER_NOT_FOUND");
    }

    return {
      orderId: order.orderId,
      totalAmount: Number(order.totalAmount),
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      isGift: order.isGift,
      createdAt: order.createdAt,
      orderItems: order.orderItems.map((item) => ({
        orderItemId: item.orderItemId,
        voucherId: item.voucher.voucherId,
        quantity: item.quantity,
        price: Number(item.price),
        voucher: {
          title: item.voucher.title,
          imageUrl: item.voucher.imageUrl,
          partner: item.voucher.partner.companyName,
        },
        issuedVouchers: item.issuedVouchers.map((iv) => ({
          issuedVoucherId: iv.issuedVoucherId,
          voucherCode: iv.voucherCode,
          status: iv.status,
          validFrom: iv.validFrom,
          validTo: iv.validTo,
          usedAt: iv.usedAt,
        })),
      })),
    };
  },
};
