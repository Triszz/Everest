import { Router } from "express";
import { categoriesController } from "./categories.controller";

const router = Router();

router.get("/", categoriesController.listCategories);
router.get("/:id", categoriesController.getCategoryById);
router.get("/:id/vouchers", categoriesController.getCategoryVouchers);

export default router;
