import { Router } from "express";
import { bannersController } from "./banners.controller";

const router = Router();

router.get("/", bannersController.listActiveBanners);

export default router;
