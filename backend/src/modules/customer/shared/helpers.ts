/**
 * Shared helpers cho toàn bộ customer modules.
 *
 * Gom các tiện ích bị trùng lặp giữa nhiều module (parse zod, build pagination,
 * lấy customerId từ req) để giữ code trong từng module ngắn gọn, dễ đọc.
 *
 * Không chứa logic nghiệp vụ — chỉ là plumbing.
 */
import { Request } from "express";
import { ZodError, ZodSchema } from "zod";
import { AppError } from "../../../middlewares/errorHandler";

// ── Pagination ────────────────────────────────────────────────────────────────

/** Cấu trúc phân trang chuẩn trả về cho FE. */
export interface PaginationResult {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Tính offset + object phân trang cho Prisma findMany.
 * @param page  Trang hiện tại (1-indexed).
 * @param limit Số bản ghi / trang.
 * @param total Tổng số bản ghi (sau khi count).
 */
export function buildPagination(
  page: number,
  limit: number,
  total: number,
): { skip: number; pagination: PaginationResult } {
  return {
    skip: (page - 1) * limit,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

// ── Zod parsing helpers ───────────────────────────────────────────────────────

/**
 * Parse body/query/params qua Zod schema. Khi fail → throw AppError 400
 * để errorHandler middleware xử lý thống nhất.
 *
 * @example
 *   const input = parseOrThrow(createOrderSchema, req.body);
 */
export function parseOrThrow<T>(schema: ZodSchema<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (!result.success) {
    const issue = result.error.issues[0];
    throw new AppError(
      issue?.message ?? "Dữ liệu không hợp lệ",
      400,
      "VALIDATION_ERROR",
    );
  }
  return result.data;
}

/**
 * Parse req.params qua schema. Khi fail → throw AppError 400 với field name rõ ràng.
 * Thường dùng cho các route `/:id`, `/:voucherId`, ...
 *
 * @example
 *   const { id } = parseParams(req, { id: "voucherId" }, voucherIdParam);
 */
export function parseParams<T>(
  req: Request,
  schema: ZodSchema<T>,
): T {
  try {
    return schema.parse(req.params);
  } catch (err) {
    if (err instanceof ZodError) {
      throw new AppError(
        "Tham số URL không hợp lệ",
        400,
        "VALIDATION_ERROR",
      );
    }
    throw err;
  }
}

// ── Customer identification ──────────────────────────────────────────────────

/**
 * Lấy userId từ request (đã qua middleware `authenticate`).
 * Throw 401 nếu chưa đăng nhập.
 */
export function getCustomerId(req: Request): string {
  const id = req.user?.userId;
  if (!id) {
    throw new AppError("Chưa đăng nhập", 401, "UNAUTHORIZED");
  }
  return id;
}