/**
 * Orders Expiry Sweeper
 * --------------------------------------------------------------
 * Job chạy định kỳ quét các order ở trạng thái Pending đã quá hạn
 * (`expiresAt < now`) và chuyển sang Cancelled.
 *
 * Lý do tồn tại:
 *  - Khi user tạo đơn Pending mà không thanh toán, voucher vẫn available
 *    cho người khác (vì createOrder KHÔNG trừ stock).
 *  - Sau PENDING_TTL_MIN phút, đơn Pending sẽ bị auto-cancel để tránh
 *    "treo" vĩnh viễn, giải phóng reservation semantics (nếu sau này
 *    thêm reservation).
 *  - Vì trạng thái Pending không trừ stock nên cancel job không cần
 *    restore stock. Chỉ đơn Paid mới cần restore.
 *
 * Cách dùng:
 *  - Gọi `startExpirySweeper()` 1 lần trong app.ts khi server boot.
 *  - Trong test có thể gọi trực tiếp `sweepExpiredOrders()`.
 */
import { prisma } from "../../../config/prisma";
import { EXPIRE_SWEEP_INTERVAL_MIN } from "./orders.config";

/**
 * Quét và cancel tất cả order Pending đã hết hạn.
 * Trả về số order bị cancel (để log / monitoring).
 */
export async function sweepExpiredOrders(): Promise<number> {
  const now = new Date();

  // 1) Tìm các order Pending hết hạn
  const expired = await prisma.order.findMany({
    where: {
      paymentStatus: "Pending",
      expiresAt: { lt: now, not: null },
    },
    select: { orderId: true, customerId: true },
    take: 100, // batch limit mỗi lượt quét
  });

  if (expired.length === 0) return 0;

  // 2) Update sang Cancelled
  const ids = expired.map((o) => o.orderId);
  const result = await prisma.order.updateMany({
    where: { orderId: { in: ids }, paymentStatus: "Pending" },
    data: {
      paymentStatus: "Cancelled",
      cancelledAt: now,
      cancelReason: "Auto-cancelled: payment timeout",
      expiresAt: null,
    },
  });

  console.log(
    `[orders] Sweep cancelled ${result.count} expired Pending orders (ids: ${ids.join(", ")})`,
  );
  return result.count;
}

let sweeperHandle: NodeJS.Timeout | null = null;

/**
 * Khởi động sweeper interval. Gọi 1 lần khi server boot.
 * Không khởi động trong test mode (NODE_ENV === 'test').
 */
export function startExpirySweeper() {
  if (sweeperHandle) return;
  if (process.env.NODE_ENV === "test") return;

  const intervalMs = EXPIRE_SWEEP_INTERVAL_MIN * 60 * 1000;
  sweeperHandle = setInterval(() => {
    sweepExpiredOrders().catch((err) => {
      console.error("[orders] Sweep job error:", err);
    });
  }, intervalMs);

  // Chạy 1 lần ngay khi boot để dọn dẹp những đơn cũ đã hết hạn
  sweepExpiredOrders().catch((err) => {
    console.error("[orders] Initial sweep error:", err);
  });

  console.log(
    `[orders] Expiry sweeper started — interval ${EXPIRE_SWEEP_INTERVAL_MIN} min`,
  );
}

/**
 * Dừng sweeper (dùng cho graceful shutdown / test teardown).
 */
export function stopExpirySweeper() {
  if (sweeperHandle) {
    clearInterval(sweeperHandle);
    sweeperHandle = null;
  }
}