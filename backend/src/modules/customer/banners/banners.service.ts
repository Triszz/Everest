/**
 * Banner Service
 * --------------------------------------------------------------
 * Quản lý banner quảng cáo hiển thị trên customer UI (carousel trang chủ).
 * Chỉ đọc — không có endpoint tạo/sửa từ phía customer (do admin/partner quản lý).
 */
import { prisma } from "../../../config/prisma";

export const bannersService = {
  /**
   * Lấy tất cả banner đang hiển thị (status = Visible), sắp xếp mới nhất trước.
   * Dùng cho carousel trang chủ customer.
   */
  async listActiveBanners() {
    return prisma.banner.findMany({
      where: { status: "Visible" },
      orderBy: { createdAt: "desc" },
      select: {
        bannerId: true,
        title: true,
        imageUrl: true,
        status: true,
      },
    });
  },
};