/**
 * Order Service
 * --------------------------------------------------------------
 * Core nghiệp vụ đặt hàng cho customer:
 * - Tạo đơn (Pending) sau khi validate tồn kho + trạng thái voucher
 * - Checkout: đánh dấu Paid + trừ tồn kho + phát hành voucher code
 * - Hủy đơn (chỉ khi Pending hoặc restore stock nếu đã Paid)
 * - Xem danh sách + chi tiết đơn
 */
import { prisma } from "../../../config/prisma";
import { AppError } from "../../../middlewares/errorHandler";
import { emailService } from "../../auth/email.service";
import type { CreateOrderInput, CheckoutInput } from "./orders.schemas";
import { buildPagination } from "../shared";
import crypto from "crypto";

/**
 * Sinh mã voucher code duy nhất cho từng issued voucher.
 * Format : EVR-XXXX-XXXX  (prefix cố định + 8 ký tự ngẫu nhiên)
 * Entropy : crypto.randomBytes + rejection sampling → 8 chars → log₂(56⁸) ≈ 45.6 bits
 * Retry   : tối đa 3 lần nếu bị trùng @unique trong DB
 */
/**
 * Alphabet cho voucher code — 56 ký tự.
 * Loại bỏ I, O (uppercase), i, l, o (lowercase) và 1 (digit) để tránh nhầm lẫn khi nhập tay.
 * Alphabet này PHẢI khớp với VOUCHER_CODE_REGEX trong src/shared/utils/voucher-code.ts.
 */
const VOUCHER_CODE_CHARS =
  "023456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz";
const VOUCHER_CODE_ALPHABET_SIZE = VOUCHER_CODE_CHARS.length; // 56
const VOUCHER_CODE_LENGTH = 8;
const MAX_RETRY = 3;

/**
 * Sinh 8 ký tự ngẫu nhiên uniform (rejection sampling).
 * Tránh modulo bias hoàn toàn.
 */
function generateVoucherCode(): string {
  const result: string[] = [];
  // 256 % 56 = 32, loại bỏ 32 giá trị byte (224-255) để đạt uniform distribution
  const mask = VOUCHER_CODE_ALPHABET_SIZE * 4; // 224 — floor(256/56)*56

  for (let i = 0; i < VOUCHER_CODE_LENGTH; i++) {
    let byte: number;
    do {
      byte = crypto.randomBytes(1)[0];
    } while (byte >= mask); // rejection sampling
    result.push(VOUCHER_CODE_CHARS[byte % VOUCHER_CODE_ALPHABET_SIZE]);
  }

  const raw = result.join("");
  return `EVR-${raw.slice(0, 4)}-${raw.slice(4)}`;
}

/** Sinh code có retry trên @unique collision */
async function generateUniqueVoucherCode(tx: {
  issuedVoucher: { findUnique: (args: { where: { voucherCode: string } }) => Promise<unknown> };
}): Promise<string> {
  for (let attempt = 0; attempt < MAX_RETRY; attempt++) {
    const code = generateVoucherCode();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existing = await (tx as any).issuedVoucher.findUnique({
      where: { voucherCode: code },
    });
    if (!existing) return code;
  }
  throw new AppError(
    "Không thể sinh mã voucher duy nhất. Vui lòng thử lại.",
    500,
    "VOUCHER_CODE_GENERATION_FAILED",
  );
}

const ORDER_ITEM_SELECT = {
  orderItemId: true,
  voucherId: true,
  quantity: true,
  price: true,
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
} as const;

export const ordersService = {
  /**
   * Tạo đơn hàng mới ở trạng thái Pending.
   * Validate: voucher tồn tại + đã duyệt + trong thời gian bán + đủ tồn kho.
   * KHÔNG trừ tồn kho ở bước này (chờ checkout).
   */
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

      if (voucher.approvalStatus !== "Approved") {
        throw new AppError(
          `Voucher "${voucher.title}" chưa được duyệt`,
          400,
          "VOUCHER_NOT_APPROVED",
        );
      }
      if (now < voucher.startDate || now > voucher.endDate) {
        throw new AppError(
          `Voucher "${voucher.title}" không còn trong thời gian bán`,
          400,
          "VOUCHER_NOT_AVAILABLE",
        );
      }
      if (voucher.availableQuantity < item.quantity) {
        throw new AppError(
          `Voucher "${voucher.title}" không đủ tồn kho. Chỉ còn ${voucher.availableQuantity}`,
          400,
          "INSUFFICIENT_STOCK",
        );
      }

      totalAmount += Number(voucher.salePrice) * item.quantity;
    }

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

  /**
   * Thanh toán đơn (mô phỏng):
   * - Double-check tồn kho tại thời điểm thanh toán
   * - Trong transaction: mark Paid → trừ tồn kho → phát hành voucher codes
   */
  async checkoutOrder(customerId: string, orderId: number, input: CheckoutInput) {
    const { paymentMethod } = input;

    const order = await prisma.order.findFirst({
      where: { orderId, customerId },
      include: {
        customer: { select: { email: true, fullName: true } },
        orderItems: {
          include: {
            voucher: {
              select: {
                title: true,
                imageUrl: true,
                expiryDays: true,
                partner: { select: { companyName: true } },
              },
            },
          },
        },
      },
    });

    if (!order) throw new AppError("Không tìm thấy đơn hàng", 404, "ORDER_NOT_FOUND");
    if (order.paymentStatus === "Paid") {
      throw new AppError("Đơn hàng đã thanh toán trước đó", 400, "ALREADY_PAID");
    }
    if (order.paymentStatus === "Cancelled") {
      throw new AppError("Đơn hàng đã bị hủy", 400, "ORDER_CANCELLED");
    }

    // RB-15: re-check stock tại thời điểm thanh toán
    for (const item of order.orderItems) {
      const fresh = await prisma.voucher.findUnique({
        where: { voucherId: item.voucherId },
        select: { availableQuantity: true, title: true },
      });
      if (!fresh || fresh.availableQuantity < item.quantity) {
        throw new AppError(
          `Voucher "${item.voucher.title}" không đủ tồn kho tại thời điểm thanh toán. Vui lòng thử lại.`,
          409,
          "INSUFFICIENT_STOCK_AT_CHECKOUT",
        );
      }
    }

    // Transaction: pay + decrement stock + issue voucher codes (RB-05)
    const result = await prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { orderId },
        data: { paymentStatus: "Paid", paymentMethod },
        include: { orderItems: true },
      });

      // Trừ tồn kho
      for (const item of order.orderItems) {
        await tx.voucher.update({
          where: { voucherId: item.voucherId },
          data: { availableQuantity: { decrement: item.quantity } },
        });
      }

      // Phát hành voucher code
      const issuedVouchers = [];
      for (const item of order.orderItems) {
        for (let i = 0; i < item.quantity; i++) {
          // Chuẩn hóa về UPPERCASE trước khi insert.
          // Lý do: generator alphabet chứa cả chữ thường (a-z, không có i,l,o).
          // PostgreSQL VARCHAR collation mặc định là case-sensitive,
          // nên nếu insert giữ nguyên mixed-case, các query sau
          // (findUnique với code đã normalize thành UPPERCASE) sẽ trả về NULL.
          const code = (await generateUniqueVoucherCode(tx)).toUpperCase();
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

    // Gửi email xác nhận (không blocking — không ảnh hưởng kết quả thanh toán)
    const customerEmail = order.customer?.email;
    const customerName = order.customer?.fullName || "Khách hàng";
    if (customerEmail) {
      // Map price về từ orderItems (issuedVouchers không chứa price)
      const priceByVoucher = new Map(
        order.orderItems.map((oi) => [oi.voucher.title, Number(oi.price)]),
      );

      emailService.sendOrderConfirmation({
        to: customerEmail,
        customerName,
        orderId,
        totalAmount: Number(order.totalAmount),
        paymentMethod: paymentMethod || "unknown",
        items: result.issuedVouchers.reduce<Array<{
          title: string;
          partner: string;
          quantity: number;
          price: number;
          voucherCodes: string[];
          validFrom: Date;
          validTo: Date;
        }>>((acc, iv) => {
          const existing = acc.find(
            (a) =>
              a.title === iv.voucher.title &&
              a.partner === iv.voucher.partner,
          );
          if (existing) {
            existing.voucherCodes.push(iv.voucherCode);
          } else {
            acc.push({
              title: iv.voucher.title,
              partner: iv.voucher.partner || "",
              quantity: 1,
              price: priceByVoucher.get(iv.voucher.title) || 0,
              voucherCodes: [iv.voucherCode],
              validFrom: iv.validFrom,
              validTo: iv.validTo,
            });
          }
          return acc;
        }, []),
      });
    }

    return {
      orderId: result.updatedOrder.orderId,
      paymentStatus: result.updatedOrder.paymentStatus,
      paymentMethod: result.updatedOrder.paymentMethod,
      issuedVouchers: result.issuedVouchers,
    };
  },

  /**
   * Hủy đơn hàng.
   * - Nếu Pending → chỉ cần mark Cancelled.
   * - Nếu Paid → restore tồn kho + hủy tất cả issued vouchers trong transaction.
   */
  async cancelOrder(customerId: string, orderId: number) {
    const order = await prisma.order.findFirst({
      where: { orderId, customerId },
      include: { orderItems: { include: { issuedVouchers: true } } },
    });

    if (!order) throw new AppError("Không tìm thấy đơn hàng", 404, "ORDER_NOT_FOUND");
    if (order.paymentStatus === "Cancelled") {
      throw new AppError("Đơn hàng đã bị hủy trước đó", 400, "ALREADY_CANCELLED");
    }

    // Cancel the order
    const cancelled = await prisma.order.update({
      where: { orderId },
      data: { paymentStatus: "Cancelled" },
    });

    // RB-13: nếu đơn đã paid (đã checkout) → restore stock + hủy issued vouchers
    if (order.paymentStatus === "Pending") {
      // Pending = chưa checkout → chưa có issued voucher → không cần restore
      return {
        orderId: cancelled.orderId,
        paymentStatus: cancelled.paymentStatus,
        message: "Đơn hàng đã được hủy thành công",
      };
    }

    // Paid → restore stock + hủy tất cả issued vouchers
    await prisma.$transaction(async (tx) => {
      for (const item of order.orderItems) {
        await tx.voucher.update({
          where: { voucherId: item.voucherId },
          data: { availableQuantity: { increment: item.quantity } },
        });
        await tx.issuedVoucher.updateMany({
          where: { orderItemId: item.orderItemId },
          data: { status: "Cancelled" as any },
        });
      }
    });

    return {
      orderId: cancelled.orderId,
      paymentStatus: cancelled.paymentStatus,
      message: "Đơn hàng đã được hủy thành công",
    };
  },

  /**
   * Danh sách đơn hàng của customer (có phân trang).
   */
  async listOrders(customerId: string, page: number, pageSize: number) {
    const where = { customerId };
    const { skip, pagination } = buildPagination(page, pageSize, 0);

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
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
      prisma.order.count({ where }),
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
      pagination: { ...pagination, total },
    };
  },

  /**
   * Chi tiết 1 đơn hàng (kèm issued vouchers).
   */
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

    if (!order) throw new AppError("Không tìm thấy đơn hàng", 404, "ORDER_NOT_FOUND");

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