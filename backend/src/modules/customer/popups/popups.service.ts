/**
 * Popup Service
 * --------------------------------------------------------------
 * Quản lý popup quảng cáo hiển thị khi khách truy cập trang chủ.
 * Dùng raw SQL ORDER BY RANDOM() — phù hợp với bảng nhỏ (vài chục popup).
 */
import { prisma } from "../../../config/prisma";

/** Shape trả về — khớp với các cột trong raw SELECT bên dưới. */
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
   * Lấy 1 popup ngẫu nhiên đang hiển thị.
   * Mỗi lần gọi trả về 1 popup khác nhau (rotation).
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
   * Lấy tất cả popup đang hiển thị.
   * Có thể dùng cho admin preview hoặc future carousel.
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