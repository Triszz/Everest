import { Request, Response, NextFunction } from "express";
import { Prisma } from "../generated/prisma/client";
import { ZodError } from "zod";

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code: string = "INTERNAL_ERROR",
  ) {
    super(message);
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  // Handle invalid JSON payload
  if (
    err instanceof SyntaxError &&
    "status" in err &&
    (err as any).status === 400 &&
    "body" in err
  ) {
    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: `Dữ liệu JSON không đúng định dạng: ${err.message}`,
      },
    });
  }

  // Payload too large — express.json / express.urlencoded emit a
  // SyntaxError-shaped error with `status === 413` and `type === 'entity.too.large'`.
  // Detect it on the type field (more reliable than status, which older
  // Express versions may not set) and translate to a clean HTTP 413.
  if (
    (err as any)?.type === "entity.too.large" ||
    (err as any)?.status === 413
  ) {
    return res.status(413).json({
      success: false,
      error: {
        code: "PAYLOAD_TOO_LARGE",
        message: "Dữ liệu gửi lên quá lớn. Vui lòng chọn ảnh có kích thước nhỏ hơn.",
      },
    });
  }

  // Prisma unique constraint
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    console.error("[Prisma Error]", {
      code: err.code,
      message: err.message,
      meta: err.meta,
      stack: err.stack,
    });
    if (err.code === "P2002") {
      return res.status(409).json({
        success: false,
        error: {
          code: "CONFLICT",
          message: "Dữ liệu đã tồn tại trong hệ thống",
        },
      });
    }
    if (err.code === "P2025") {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Không tìm thấy dữ liệu yêu cầu" },
      });
    }
    // Other Prisma errors — return full detail for debugging
    return res.status(400).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        meta: err.meta,
      },
    });
  }

  // Zod validation error — return full issues
  if (err instanceof ZodError) {
    console.error("[ZodError]", JSON.stringify(err.issues, null, 2));
    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Validation failed",
        issues: err.issues,
      },
    });
  }

  // AppError tự định nghĩa
  if (err instanceof AppError) {
    console.error("[AppError]", { statusCode: err.statusCode, code: err.code, message: err.message, stack: err.stack });
    return res.status(err.statusCode).json({
      success: false,
      error: { code: err.code, message: err.message },
    });
  }

  // Unexpected error — log full detail, return safe message
  console.error("[Unhandled Error]", {
    name: err.name,
    message: err.message,
    stack: err.stack,
    body: req.body,
  });
  return res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: err.message || "Đã xảy ra lỗi, vui lòng thử lại",
    },
  });
};
