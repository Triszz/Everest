import { prisma } from "../../../config/prisma";

// Shape returned by the raw query — mirrors the select fields
export type PopupSelect = {
  popupId: number;
  title: string | null;
  body: string | null;
  imageUrl: string | null;
  ctaLabel: string | null;
  ctaTargetUrl: string | null;
  status: string | null;
};

export const popupsService = {
  /**
   * Lấy 1 popup visible ngẫu nhiên.
   * Dùng ORDER BY RANDOM() — chạy trong PostgreSQL, phù hợp với bảng nhỏ/trung bình.
   */
  async getRandomPopup(): Promise<PopupSelect | null> {
    const result = await prisma.$queryRaw<PopupSelect[]>`
      SELECT "popup_id"  AS "popupId",
             "title",
             "body",
             "image_url"  AS "imageUrl",
             "cta_label"  AS "ctaLabel",
             "cta_target_url" AS "ctaTargetUrl",
             "status"
      FROM   "popups"
      WHERE  "status" = 'Visible'
      ORDER  BY RANDOM()
      LIMIT  1
    `;
    return result[0] ?? null;
  },

  /**
   * Lấy tất cả popup visible (dùng cho admin hoặc future carousel).
   */
  async listActivePopups(): Promise<PopupSelect[]> {
    return prisma.$queryRaw<PopupSelect[]>`
      SELECT "popup_id"  AS "popupId",
             "title",
             "body",
             "image_url"  AS "imageUrl",
             "cta_label"  AS "ctaLabel",
             "cta_target_url" AS "ctaTargetUrl",
             "status"
      FROM   "popups"
      WHERE  "status" = 'Visible'
    `;
  },
};