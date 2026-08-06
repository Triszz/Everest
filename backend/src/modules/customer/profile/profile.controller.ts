/**
 * Profile Controller
 * --------------------------------------------------------------
 * Xem và cập nhật hồ sơ customer.
 * Tất cả routes yêu cầu đăng nhập.
 */
import { Request, Response } from "express";
import { profileService } from "./profile.service";
import { asyncHandler } from "../../../middlewares/asyncHandler";
import { getCustomerId, parseOrThrow } from "../shared/helpers";
import { updateProfileSchema, changePasswordSchema } from "./profile.schemas";

export const profileController = {
  /**
   * GET /api/customer/profile/me — Lấy hồ sơ hiện tại.
   */
  getProfile: asyncHandler(async (req: Request, res: Response) => {
    const data = await profileService.getProfile(getCustomerId(req));
    res.json({ success: true, data });
  }),

  /**
   * PUT /api/customer/profile/me — Cập nhật thông tin hồ sơ.
   */
  updateProfile: asyncHandler(async (req: Request, res: Response) => {
    const input = parseOrThrow(updateProfileSchema, req.body);
    const data = await profileService.updateProfile(getCustomerId(req), input);
    res.json({ success: true, data, message: "Cập nhật hồ sơ thành công" });
  }),

  /**
   * PUT /api/customer/profile/password — Đổi mật khẩu.
   */
  changePassword: asyncHandler(async (req: Request, res: Response) => {
    const input = parseOrThrow(changePasswordSchema, req.body);
    await profileService.changePassword(getCustomerId(req), input);
    res.json({ success: true, data: null, message: "Đổi mật khẩu thành công" });
  }),
};