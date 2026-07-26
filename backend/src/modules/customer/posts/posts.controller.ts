import { Request, Response } from "express";
import { ZodError } from "zod";
import { z } from "zod";
import { postsService } from "./posts.service";
import { asyncHandler } from "../../../middlewares/asyncHandler";
import { AppError } from "../../../middlewares/errorHandler";

const listPostsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(50).optional().default(20),
});

const getPostByIdSchema = z.object({
  postId: z.string().regex(/^\d+$/, "postId phải là số nguyên").transform(Number),
});

export const postsController = {
  listPublishedPosts: asyncHandler(async (req: Request, res: Response) => {
    let query: z.infer<typeof listPostsQuerySchema>;
    try {
      query = listPostsQuerySchema.parse(req.query);
    } catch (err) {
      if (err instanceof ZodError) {
        throw new AppError(err.issues[0].message, 400, "VALIDATION_ERROR");
      }
      throw err;
    }
    const data = await postsService.listPublishedPosts(query.page, query.limit);
    res.json({ success: true, data });
  }),

  getPublishedPostById: asyncHandler(async (req: Request, res: Response) => {
    let params: z.infer<typeof getPostByIdSchema>;
    try {
      params = getPostByIdSchema.parse(req.params);
    } catch (err) {
      if (err instanceof ZodError) {
        throw new AppError(err.issues[0].message, 400, "VALIDATION_ERROR");
      }
      throw err;
    }
    const post = await postsService.getPublishedPostById(params.postId);
    if (!post) throw new AppError("Bài viết không tồn tại", 404, "NOT_FOUND");
    res.json({ success: true, data: post });
  }),
};