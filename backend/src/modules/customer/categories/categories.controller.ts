import { Request, Response } from "express";
import { ZodError } from "zod";
import { categoriesService } from "./categories.service";
import { asyncHandler } from "../../../middlewares/asyncHandler";
import { AppError } from "../../../middlewares/errorHandler";
import {
  categoryIdParam,
  categoryVoucherQuerySchema,
} from "./categories.schemas";

const parseIdParamOrThrow = (req: Request): number => {
  try {
    return categoryIdParam.parse(req.params).id;
  } catch {
    throw new AppError("ID danh mục không hợp lệ", 400, "VALIDATION_ERROR");
  }
};

const parseQueryOrThrow = <T>(
  schema: { parse: (v: unknown) => T },
  value: unknown,
): T => {
  try {
    return schema.parse(value);
  } catch (err) {
    if (err instanceof ZodError) {
      const issue = err.issues[0];
      throw new AppError(issue.message, 400, "VALIDATION_ERROR");
    }
    throw err;
  }
};

export const categoriesController = {
  listCategories: asyncHandler(async (_req: Request, res: Response) => {
    const categories = await categoriesService.listCategories();
    res.json({ success: true, data: categories });
  }),

  getCategoryById: asyncHandler(async (req: Request, res: Response) => {
    const id = parseIdParamOrThrow(req);
    const category = await categoriesService.getCategoryById(id);
    res.json({ success: true, data: category });
  }),

  getCategoryVouchers: asyncHandler(async (req: Request, res: Response) => {
    const id = parseIdParamOrThrow(req);
    const query = parseQueryOrThrow(categoryVoucherQuerySchema, req.query);
    const result = await categoriesService.getCategoryVouchers(id, query);
    res.json({ success: true, ...result });
  }),
};
