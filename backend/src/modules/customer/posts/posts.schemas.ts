/**
 * Post Schemas
 * --------------------------------------------------------------
 * Zod schemas cho validate query/params của Posts API.
 */
import { z } from "zod";

/** Query schema cho GET /api/posts */
export const listPostsQuery = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(50).optional().default(20),
});

/** Params schema cho GET /api/posts/:postId */
export const postIdParam = z.object({
  postId: z.string().regex(/^\d+$/, "postId phải là số nguyên"),
});

export type ListPostsQuery = z.infer<typeof listPostsQuery>;
export type PostIdParam = z.infer<typeof postIdParam>;