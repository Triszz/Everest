import { Router } from "express";
import { postsController } from "./posts.controller";

const router = Router();

router.get("/", postsController.listPublishedPosts);
router.get("/:postId", postsController.getPublishedPostById);

export default router;