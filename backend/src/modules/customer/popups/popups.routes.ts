import { Router } from "express";
import { popupsController } from "./popups.controller";

const router = Router();

router.get("/active", popupsController.getActivePopup);
router.get("/", popupsController.listActivePopups);

export default router;