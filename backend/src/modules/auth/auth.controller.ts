import { Request, Response } from "express";
import { ZodError } from "zod";
import { authService } from "./auth.service";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { AppError } from "../../middlewares/errorHandler";
import {
  loginSchema,
  registerCustomerSchema,
  registerPartnerSchema,
  refreshTokenSchema,
  changePasswordSchema,
} from "./auth.schemas";
import { z } from "zod";

const updateProfileSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  phoneNumber: z
    .string()
    .regex(/^[0-9]{10,11}$/)
    .optional()
    .nullable(),
});

const parseBody = <T>(schema: z.ZodType<T>, body: unknown): T => {
  try {
    return schema.parse(body);
  } catch (err) {
    if (err instanceof ZodError) {
      throw new AppError(err.issues[0].message, 400, "VALIDATION_ERROR");
    }
    throw err;
  }
};

export const authController = {
  login: asyncHandler(async (req: Request, res: Response) => {
    const input = parseBody(loginSchema, req.body);
    const data = await authService.login(input);
    res.json({ success: true, data });
  }),

  registerCustomer: asyncHandler(async (req: Request, res: Response) => {
    const input = parseBody(registerCustomerSchema, req.body);
    const data = await authService.registerCustomer(input);
    res.status(201).json({ success: true, data });
  }),

  registerPartner: asyncHandler(async (req: Request, res: Response) => {
    const input = parseBody(registerPartnerSchema, req.body);
    const data = await authService.registerPartner(input);
    res.status(201).json({
      success: true,
      data,
      message: "Đăng ký thành công. Tài khoản đang chờ Admin phê duyệt.",
    });
  }),

  refresh: asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = parseBody(refreshTokenSchema, req.body);
    const data = await authService.refreshAccessToken(refreshToken);
    res.json({ success: true, data });
  }),

  me: asyncHandler(async (req: Request, res: Response) => {
    const data = await authService.getMe(req.user!.userId);
    res.json({ success: true, data });
  }),

  changePassword: asyncHandler(async (req: Request, res: Response) => {
    const { currentPassword, newPassword } = parseBody(
      changePasswordSchema,
      req.body,
    );
    await authService.changePassword(
      req.user!.userId,
      currentPassword,
      newPassword,
    );
    res.json({ success: true, data: null, message: "Đổi mật khẩu thành công" });
  }),

  updateProfile: asyncHandler(async (req: Request, res: Response) => {
    const input = parseBody(updateProfileSchema, req.body);
    const data = await authService.updateProfile(req.user!.userId, input);
    res.json({ success: true, data });
  }),
};
