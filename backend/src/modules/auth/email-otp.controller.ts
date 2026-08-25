import { Request, Response } from "express";
import { ZodError } from "zod";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { AppError } from "../../middlewares/errorHandler";
import { emailOtpService } from "./email-otp.service";
import { prisma } from "../../config/prisma";
import {
  sendOtpSchema,
  verifyOtpSchema,
  resendOtpSchema,
} from "./email-otp.schemas";
import type { JwtPayload, Role } from "../../shared/types";

const parseBody = <T>(schema: { parse: (b: unknown) => T }, body: unknown): T => {
  try {
    return schema.parse(body);
  } catch (err) {
    if (err instanceof ZodError) {
      throw new AppError(err.issues[0].message, 400, "VALIDATION_ERROR");
    }
    throw err;
  }
};

const signAccessToken = (payload: JwtPayload) =>
  jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn:
      (process.env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"]) || "15m",
  });

const signRefreshToken = (userId: string) =>
  jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET!, {
    expiresIn:
      (process.env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions["expiresIn"]) ||
      "7d",
  });

export const emailOtpController = {
  /**
   * POST /auth/email-otp/send
   * Body: { email, purpose?, channel? }
   */
  send: asyncHandler(async (req: Request, res: Response) => {
    const input = parseBody(sendOtpSchema, req.body);
    const result = await emailOtpService.sendOtp(
      input.email,
      input.purpose,
      req.ip,
      undefined,
      input.channel,
    );
    res.json({ success: true, ...result });
  }),

  /**
   * POST /auth/email-otp/resend
   */
  resend: asyncHandler(async (req: Request, res: Response) => {
    const input = parseBody(resendOtpSchema, req.body);
    const result = await emailOtpService.resendOtp(
      input.email,
      input.purpose,
      req.ip,
      input.channel,
    );
    res.json({ success: true, ...result });
  }),

  /**
   * POST /auth/email-otp/verify
   *
   * Với REGISTER_VERIFY:
   *  - Cập nhật User.emailVerified = true
   *  - Tạo session + cấp accessToken + refreshToken
   *  - Trả về AuthResponse (auto-login)
   */
  verify: asyncHandler(async (req: Request, res: Response) => {
    const input = parseBody(verifyOtpSchema, req.body);
    const result = await emailOtpService.verifyOtp(
      input.email,
      input.code,
      input.purpose,
    );

    if (!result.ok) {
      throw new AppError(result.reason, 400, "OTP_INVALID");
    }

    if (input.purpose === "REGISTER_VERIFY") {
      const user = await prisma.user.findUnique({
        where: { email: result.email },
        select: {
          userId: true,
          email: true,
          fullName: true,
          role: true,
          status: true,
          partnerId: true,
          emailVerified: true,
        },
      });
      if (!user) {
        throw new AppError("Không tìm thấy tài khoản", 404, "NOT_FOUND");
      }

      // Đánh dấu verified (idempotent)
      if (!user.emailVerified) {
        await prisma.user.update({
          where: { userId: user.userId },
          data: {
            emailVerified: true,
            emailVerifiedAt: new Date(),
          },
        });
      }

      // Tạo session giống login flow
      const session = await prisma.userSession.create({
        data: {
          userId: user.userId,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      const payload: JwtPayload = {
        userId: user.userId,
        email: user.email,
        role: user.role as Role,
        sessionId: session.sessionId,
        ...(user.partnerId != null && { partnerId: user.partnerId }),
      };

      res.json({
        success: true,
        data: {
          accessToken: signAccessToken(payload),
          refreshToken: signRefreshToken(user.userId),
          sessionId: session.sessionId,
          user: {
            userId: user.userId,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            status: user.status,
            partnerId: user.partnerId,
          },
        },
        message: "Xác thực email thành công",
      });
      return;
    }

    // Purpose khác (RESET_PASSWORD, TWO_FA_LOGIN) — chưa dùng đến
    res.json({
      success: true,
      message: "Mã xác thực hợp lệ",
    });
  }),
};
