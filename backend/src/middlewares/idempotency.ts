import { Request, Response, NextFunction } from "express";

interface IdempotencyRecord {
  status: "IN_PROGRESS" | "COMPLETED";
  statusCode?: number;
  body?: any;
  expiresAt: number;
}

const DEFAULT_TTL_MS = 15 * 60 * 1000; // 15 phút
const store = new Map<string, IdempotencyRecord>();

// Tự động dọn dẹp các key đã hết hạn mỗi 5 phút
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of store.entries()) {
    if (record.expiresAt < now) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Middleware Idempotency Key
 * Chống trùng lặp request ghi/tạo dữ liệu (Order, Payment, Redemption)
 */
export const idempotency = (ttlMs = DEFAULT_TTL_MS) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = (req.headers["x-idempotency-key"] ||
      req.headers["idempotency-key"]) as string | undefined;

    // Nếu client không truyền Idempotency Key -> cho qua bình thường
    if (!key) {
      return next();
    }

    const now = Date.now();
    const record = store.get(key);

    if (record && record.expiresAt > now) {
      if (record.status === "IN_PROGRESS") {
        return res.status(409).json({
          success: false,
          error: {
            code: "IDEMPOTENCY_CONCURRENT",
            message: "Yêu cầu đang được xử lý, vui lòng không nhấn liên tục.",
          },
        });
      }

      if (
        record.status === "COMPLETED" &&
        record.statusCode &&
        record.body !== undefined
      ) {
        res.setHeader("X-Idempotency-Replayed", "true");
        return res.status(record.statusCode).json(record.body);
      }
    }

    // Đánh dấu key đang được xử lý
    store.set(key, {
      status: "IN_PROGRESS",
      expiresAt: now + ttlMs,
    });

    // Overwrite res.json để lưu lại response sau khi controller thực thi thành công
    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      if (res.statusCode < 500) {
        store.set(key, {
          status: "COMPLETED",
          statusCode: res.statusCode,
          body,
          expiresAt: Date.now() + ttlMs,
        });
      } else {
        // Lỗi 5xx từ server -> giải phóng key để client có thể retry lại
        store.delete(key);
      }
      return originalJson(body);
    };

    next();
  };
};
