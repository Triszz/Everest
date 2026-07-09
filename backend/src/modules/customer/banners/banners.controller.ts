import { Request, Response } from "express";
import { bannersService } from "./banners.service";
import { asyncHandler } from "../../../middlewares/asyncHandler";

export const bannersController = {
  listActiveBanners: asyncHandler(async (_req: Request, res: Response) => {
    const banners = await bannersService.listActiveBanners();
    res.json({ success: true, data: banners });
  }),
};
