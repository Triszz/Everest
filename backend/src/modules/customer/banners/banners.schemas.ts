import { z } from "zod";

export const bannerIdParamSchema = z.object({
  id: z.string().regex(/^\d+$/).transform(Number),
});

export type BannerIdParam = z.infer<typeof bannerIdParamSchema>;
