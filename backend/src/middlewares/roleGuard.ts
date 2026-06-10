import { Request, Response, NextFunction } from "express";
import { Role } from "../shared/types";

export const roleGuard =
  (...roles: Role[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "Bạn không có quyền thực hiện thao tác này",
        },
      });
    }
    next();
  };
