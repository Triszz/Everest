import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JwtPayload } from "../shared/types";
import { prisma } from "../config/prisma";

// Extend Express Request để có req.user ở khắp nơi
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Vui lòng đăng nhập" },
    });
  }
  try {
    const payload = jwt.verify(
      authHeader.split(" ")[1],
      process.env.JWT_SECRET!,
    ) as JwtPayload;

    // BR-AUTH: Kiểm tra trạng thái tài khoản người dùng trong cơ sở dữ liệu
    const user = await prisma.user.findUnique({
      where: { userId: payload.userId },
      select: { status: true },
    });

    if (!user || user.status !== "Active") {
      return res.status(401).json({
        success: false,
        error: {
          code: "ACCOUNT_LOCKED",
          message: "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.",
        },
      });
    }

    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Token không hợp lệ hoặc đã hết hạn",
      },
    });
  }
};
