/**
 * Post Controller
 * --------------------------------------------------------------
 * Controller gọi postsService, parse query/params qua schemas.
 */
import { Request, Response } from "express";
import { postsService } from "./posts.service";
import { asyncHandler } from "../../../middlewares/asyncHandler";
import { parseOrThrow, parseParams } from "../shared/helpers";
import { listPostsQuery, postIdParam } from "./posts.schemas";
import { AppError } from "../../../middlewares/errorHandler";

export const postsController = {
  /**
   * GET /api/posts?page=1&limit=20
   * Danh sách bài viết đã published, có phân trang.
   */
  listPublishedPosts: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = parseOrThrow(listPostsQuery, req.query);
    const data = await postsService.listPublishedPosts(page, limit);
    res.json({ success: true, data });
  }),

  /**
   * GET /api/posts/:postId
   * Chi tiết 1 bài viết. Trả 404 nếu không tồn tại hoặc chưa published.
   */
  getPublishedPostById: asyncHandler(async (req: Request, res: Response) => {
    const { postId: rawId } = parseParams(req, postIdParam);
    const postId = Number(rawId);
    const post = await postsService.getPublishedPostById(postId);
    if (!post) throw new AppError("Bài viết không tồn tại", 404, "NOT_FOUND");
    res.json({ success: true, data: post });
  }),
};