import { Request, Response } from "express";
import { popupsService } from "./popups.service";
import { asyncHandler } from "../../../middlewares/asyncHandler";

export const popupsController = {
  getActivePopup: asyncHandler(async (_req: Request, res: Response) => {
    // Random 1 popup visible mỗi lần gọi
    const popup = await popupsService.getRandomPopup();
    res.json({ success: true, data: popup });
  }),

  listActivePopups: asyncHandler(async (_req: Request, res: Response) => {
    const popups = await popupsService.listActivePopups();
    res.json({ success: true, data: popups });
  }),
};