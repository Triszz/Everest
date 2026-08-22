/**
 * Idempotency Service
 * --------------------------------------------------------------
 * Xử lý idempotency key để tránh duplicate operations.
 * - Lưu key + response vào DB
 * - Nếu key đã tồn tại → trả về response đã cache
 * - Auto-cleanup keys đã hết hạn
 */
import { prisma } from "../../config/prisma";
import { AppError } from "../middlewares/errorHandler";

const IDEMPOTENCY_KEY_EXPIRY_HOURS = 24;

export const idempotencyService = {
  /**
   * Kiểm tra và lấy response đã cache nếu key tồn tại.
   * @returns Cached response hoặc null nếu key chưa tồn tại
   */
  async checkKey(key: string): Promise<{ entityId: number; response: any } | null> {
    const record = await prisma.idempotencyKey.findUnique({
      where: { key },
    });

    if (!record) return null;

    // Check expiration
    if (record.expiresAt < new Date()) {
      // Key expired, treat as new
      return null;
    }

    return {
      entityId: record.entityId!,
      response: record.response,
    };
  },

  /**
   * Lưu idempotency key với response.
   * @param key Idempotency key
   * @param entityType Loại entity (order, payment, etc.)
   * @param entityId ID của entity được tạo
   * @param response Response để cache
   */
  async saveKey(
    key: string,
    entityType: string,
    entityId: number,
    response: any,
  ): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + IDEMPOTENCY_KEY_EXPIRY_HOURS);

    await prisma.idempotencyKey.upsert({
      where: { key },
      update: {
        entityId,
        response,
        expiresAt,
      },
      create: {
        key,
        entityType,
        entityId,
        response,
        expiresAt,
      },
    });
  },

  /**
   * Xóa idempotency key (sau khi operation hoàn tất thành công).
   */
  async deleteKey(key: string): Promise<void> {
    await prisma.idempotencyKey.deleteMany({
      where: { key },
    });
  },

  /**
   * Cleanup expired keys (nên chạy định kỳ bằng cron job hoặc call manual).
   */
  async cleanupExpired(): Promise<number> {
    const result = await prisma.idempotencyKey.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });
    return result.count;
  },
};

/**
 * Helper để wrap một function với idempotency check.
 * Nếu key đã tồn tại → trả về cached response.
 * Nếu chưa → thực hiện function và lưu response.
 */
export async function withIdempotency<T>(
  key: string,
  entityType: string,
  operation: () => Promise<{ id: number; response: T }>,
): Promise<{ id: number; response: T; isCached: boolean }> {
  // Check existing key
  const cached = await idempotencyService.checkKey(key);
  if (cached) {
    return {
      id: cached.entityId,
      response: cached.response,
      isCached: true,
    };
  }

  // Execute operation
  const result = await operation();

  // Save to cache
  await idempotencyService.saveKey(key, entityType, result.id, result.response);

  return {
    id: result.id,
    response: result.response,
    isCached: false,
  };
}
