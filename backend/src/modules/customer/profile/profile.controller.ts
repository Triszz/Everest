import { Request, Response } from "express";
import { ZodError } from "zod";
import { profileService } from "./profile.service";
import { asyncHandler } from "../../../middlewares/asyncHandler";
import { AppError } from "../../../middlewares/errorHandler";
import {
  updateProfileSchema,
  changePasswordSchema,
} from "./profile.schemas";
import { z } from "zod";

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

export const profileController = {
  /** GET /api/customer/profile/me */
  getProfile: asyncHandler(async (req: Request, res: Response) => {
    const data = await profileService.getProfile(req.user!.userId);
    res.json({ success: true, data });
  }),

  /** PUT /api/customer/profile/me */
  updateProfile: asyncHandler(async (req: Request, res: Response) => {
    const input = parseBody(updateProfileSchema, req.body);
    const data = await profileService.updateProfile(req.user!.userId, input);
    res.json({ success: true, data, message: "Cập nhật hồ sơ thành công" });
  }),

  /** PUT /api/customer/profile/password */
  changePassword: asyncHandler(async (req: Request, res: Response) => {
    const input = parseBody(changePasswordSchema, req.body);
    await profileService.changePassword(req.user!.userId, input);
    res.json({ success: true, data: null, message: "Đổi mật khẩu thành công" });
  }),
};
