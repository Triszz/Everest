/**
 * Payment Service — tích hợp VNPAY.
 *
 * Flow:
 *  1. createPaymentUrl(orderId) — tạo URL thanh toán VNPAY, redirect user sang đó
 *  2. handleIpn(req.query)      — VNPAY gọi webhook server-to-server khi thanh toán thành công
 *  3. handleReturn(req.query)   — user quay lại từ trình duyệt (chỉ hiển thị, KHÔNG xử lý nghiệp vụ)
 *
 * ▸ Đổi merchant: sửa biến trong .env (xem file config/vnpay.ts) — KHÔNG cần sửa code.
 */
import { VNPay, VnpLocale, ProductCode, HashAlgorithm, ignoreLogger, dateFormat, type VerifyReturnUrl } from "vnpay";
import { prisma } from "../../../config/prisma";
import { AppError } from "../../../middlewares/errorHandler";
import { emailService } from "../../auth/email.service";
import { vnpayConfig, validateVnpayConfig } from "../../../config/vnpay";

validateVnpayConfig();

const vnpay = new VNPay({
  tmnCode: vnpayConfig.tmnCode,
  secureSecret: vnpayConfig.hashSecret,
  vnpayHost: vnpayConfig.vnpayHost,
  testMode: vnpayConfig.testMode,
  hashAlgorithm: vnpayConfig.hashAlgorithm,
  loggerFn: ignoreLogger,
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Lấy IP thực của request (hỗ trợ proxy qua X-Forwarded-For). */
function getClientIp(req: { ip?: string; headers?: Record<string, string | string[] | undefined> }): string {
  const forwarded = req.headers?.["x-forwarded-for"];
  if (typeof forwarded === "string") return forwarded.split(",")[0].trim();
  if (Array.isArray(forwarded)) return String(forwarded[0]).split(",")[0].trim();
  return req.ip || "127.0.0.1";
}

/**
 * Lấy phương thức thanh toán VNPAY trả về (VD: "ATM", "VISA", "VNPAYQR"…).
 * Lưu vào DB thay vì lưu chuỗi cứng "vnpay" để sau này dễ nhận diện.
 */
function labelPaymentMethod(m: string): string {
  return m || "VNPAY";
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

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

async function processSuccessfulPayment(
  orderId: number,
  paymentMethod: string,
) {
  const order = await prisma.order.findFirst({
    where: { orderId },
    include: {
      customer: { select: { email: true, fullName: true } },
      orderItems: {
        include: {
          voucher: {
            select: {
              voucherId: true,
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

  if (!order) return;

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { orderId },
      data: { paymentStatus: "Paid", paymentMethod },
    });

    for (const item of order.orderItems) {
      await tx.voucher.update({
        where: { voucherId: item.voucher.voucherId },
        data: { availableQuantity: { decrement: item.quantity } },
      });

      const validTo = new Date();
      validTo.setDate(validTo.getDate() + (item.voucher.expiryDays || 30));

      for (let i = 0; i < item.quantity; i++) {
        await tx.issuedVoucher.create({
          data: {
            orderItemId: item.orderItemId,
            voucherCode: generateVoucherCode(item.voucher.title, i + 1),
            status: "Unused",
            validFrom: new Date(),
            validTo,
          },
        });
      }
    }
  });

  // Gửi email xác nhận (non-blocking)
  if (order.customer.email) {
    const priceByTitle = new Map(order.orderItems.map((oi) => [oi.voucher.title, Number(oi.price)]));

    const allIssued = await prisma.issuedVoucher.findMany({
      where: { orderItem: { orderId } },
      include: {
        orderItem: {
          include: {
            voucher: {
              select: { title: true, partner: { select: { companyName: true } } },
            },
          },
        },
      },
    });

    const items = allIssued.reduce<Array<{
      title: string;
      partner: string;
      quantity: number;
      price: number;
      voucherCodes: string[];
      validFrom: Date;
      validTo: Date;
    }>>((acc, iv) => {
      const key = `${iv.orderItem.voucher.title}|${iv.orderItem.voucher.partner.companyName}`;
      const existing = acc.find((a) => `${a.title}|${a.partner}` === key);
      if (existing) {
        existing.voucherCodes.push(iv.voucherCode);
      } else {
        acc.push({
          title: iv.orderItem.voucher.title,
          partner: iv.orderItem.voucher.partner.companyName,
          quantity: 1,
          price: priceByTitle.get(iv.orderItem.voucher.title) || 0,
          voucherCodes: [iv.voucherCode],
          validFrom: iv.validFrom,
          validTo: iv.validTo,
        });
      }
      return acc;
    }, []);

    try {
      await emailService.sendOrderConfirmation({
        to: order.customer.email,
        customerName: order.customer.fullName || "Khách hàng",
        orderId,
        totalAmount: Number(order.totalAmount),
        paymentMethod: labelPaymentMethod(paymentMethod),
        items,
      });
    } catch (err) {
      console.error("[payment.service] Gửi email xác nhận thất bại:", err);
    }
  }
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const paymentService = {
  /**
   * Bước 1 — Tạo URL thanh toán VNPAY.
   * Backend tạo URL, frontend redirect user sang đó.
   */
  async createPaymentUrl(
    customerId: string,
    orderId: number,
    req: { ip?: string; headers?: Record<string, string | string[] | undefined> },
  ) {
    const order = await prisma.order.findFirst({
      where: { orderId, customerId },
      select: { orderId: true, totalAmount: true, paymentStatus: true },
    });

    if (!order) throw new AppError("Không tìm thấy đơn hàng", 404, "ORDER_NOT_FOUND");
    if (order.paymentStatus === "Paid") throw new AppError("Đơn hàng đã thanh toán", 400, "ALREADY_PAID");
    if (order.paymentStatus === "Cancelled") throw new AppError("Đơn hàng đã bị hủy", 400, "ORDER_CANCELLED");

    // Amount: VND × 100 (VNPAY yêu cầu nhân 100)
    const amountVnd = Math.round(Number(order.totalAmount) * 100);

    // Tính thời gian hết hạn payment URL (mặc định 15 phút)
    const expireDate = new Date();
    expireDate.setMinutes(expireDate.getMinutes() + vnpayConfig.expireMinutes);

    const paymentUrl = vnpay.buildPaymentUrl({
      vnp_Amount: amountVnd,
      vnp_IpAddr: getClientIp(req),
      vnp_ReturnUrl: vnpayConfig.returnUrl,
      vnp_TxnRef: String(orderId),
      vnp_OrderInfo: `Thanh toan don hang #${orderId} - Everest`,
      vnp_Locale: VnpLocale.VN,
      vnp_OrderType: ProductCode.Other,
      vnp_CreateDate: dateFormat(new Date()),
      vnp_ExpireDate: dateFormat(expireDate),
    });

    console.log(`[VNPAY] Tạo payment URL cho order #${orderId}, amount=${amountVnd}`);
    console.log(`[VNPAY] Hash secret đang dùng: ${vnpayConfig.hashSecret.substring(0, 4)}...${vnpayConfig.hashSecret.slice(-4)}`);

    return { paymentUrl, orderId };
  },

  /**
   * Bước 2 — Xử lý IPN (webhook server-to-server).
   * Đây là nguồn xác thực thanh toán chính thức.
   */
  async handleIpn(query: Record<string, string>) {
    console.log("[VNPAY IPN] Query nhận được:", JSON.stringify(query, null, 2));

    const verify = vnpay.verifyReturnUrl(query as unknown as VerifyReturnUrl);

    console.log("[VNPAY IPN] Verify result:", verify);

    if (!verify.isVerified) {
      console.error("[VNPAY IPN] ❌ Chữ ký không hợp lệ. Query:", query);
      return { code: "97", message: "Sai chữ ký" };
    }

    const orderId = Number(query.vnp_TxnRef);
    const rspCode = query.vnp_ResponseCode;
    // Phương thức user chọn trên VNPAY (ATM/VISA/VNPAYQR…)
    const bankCode = query.vnp_BankCode || "VNPAY";

    if (rspCode !== "00") {
      console.warn(`[VNPAY IPN] Thanh toán thất bại cho order #${orderId}, rspCode=${rspCode}`);
      return { code: "00", message: "Da nhan thong tin" };
    }

    // Kiểm tra đơn đã xử lý chưa
    const order = await prisma.order.findFirst({
      where: { orderId },
      select: { paymentStatus: true },
    });

    if (!order) return { code: "01", message: "Không tìm thấy đơn hàng" };
    if (order.paymentStatus === "Paid") return { code: "00", message: "Da xu ly" };

    await processSuccessfulPayment(orderId, bankCode);

    return { code: "00", message: "Xu ly thanh toan thanh cong" };
  },

  /**
   * Bước 3 — Xử lý Return URL (từ trình duyệt).
   * KHÔNG xử lý nghiệp vụ ở đây — chỉ trả thông tin để frontend hiển thị.
   */
  handleReturn(query: Record<string, string>) {
    console.log("[VNPAY Return] Query nhận được:", JSON.stringify(query, null, 2));

    const verify = vnpay.verifyReturnUrl(query as unknown as VerifyReturnUrl);
    console.log("[VNPAY Return] Verify result:", verify);

    const orderId = Number(query.vnp_TxnRef);
    const rspCode = query.vnp_ResponseCode;

    return {
      isSuccess: verify.isVerified && rspCode === "00",
      isVerified: verify.isVerified,
      orderId,
      message: verify.isVerified
        ? rspCode === "00"
          ? "Thanh toán thành công. Vui lòng chờ xác nhận từ hệ thống."
          : "Thanh toán không thành công trên VNPAY."
        : "Xác thực chữ ký thất bại. Vui lòng liên hệ hỗ trợ.",
    };
  },
};
