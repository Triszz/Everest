import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JwtPayload } from "../shared/types";

// Extend Express Request để có req.user ở khắp nơi
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticate = (
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
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Token không hợp lệ hoặc đã hết hạn",
      },
    });
  }
};
