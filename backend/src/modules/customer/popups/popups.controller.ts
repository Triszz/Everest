import { Request, Response } from "express";
import { popupsService } from "./popups.service";
import { asyncHandler } from "../../../middlewares/asyncHandler";

export const popupsController = {
  getActivePopup: asyncHandler(async (_req: Request, res: Response) => {
    const popup = await popupsService.getActivePopup();
    res.json({ success: true, data: popup });
  }),

  listActivePopups: asyncHandler(async (_req: Request, res: Response) => {
    const popups = await popupsService.listActivePopups();
    res.json({ success: true, data: popups });
  }),
};