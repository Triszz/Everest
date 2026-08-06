/**
 * Post Routes
 * --------------------------------------------------------------
 * Mount trong app.ts ở prefix `/api/posts`.
 * Public — không yêu cầu auth.
 */
import { Router } from "express";
import { postsController } from "./posts.controller";

const router = Router();

/** GET /api/posts — Danh sách bài viết đã published (có phân trang) */
router.get("/", postsController.listPublishedPosts);

/** GET /api/posts/:postId — Chi tiết bài viết */
router.get("/:postId", postsController.getPublishedPostById);

export default router;