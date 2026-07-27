import { Request, Response, NextFunction } from "express";

export const auditContext = (req: Request, _res: Response, next: NextFunction) => {
  const fwd = req.headers["x-forwarded-for"];
  const ipAddress = (typeof fwd === "string" ? fwd.split(",")[0]?.trim() : undefined) ?? req.ip ?? null;
  const userAgent = req.headers["user-agent"] ?? null;
  req.auditCtx = {
    ipAddress: ipAddress ?? undefined,
    userAgent: typeof userAgent === "string" ? userAgent : userAgent?.[0] ?? undefined,
  };
  next();
};

declare global {
  namespace Express {
    interface Request {
      auditCtx?: { ipAddress?: string; userAgent?: string };
    }
  }
}