/**
 * Category Service
 * --------------------------------------------------------------
 * Quản lý danh mục voucher phía customer.
 * - Liệt kê category + đếm số voucher
 * - Lấy voucher trong 1 category (có filter/sort/pagination)
 */
import { prisma } from "../../../config/prisma";
import { Prisma } from "../../../generated/prisma/client";
import type { CategoryVoucherQuery } from "./categories.schemas";
import { AppError } from "../../../middlewares/errorHandler";
import {
  buildPagination,
  PARTNER_MINI_INCLUDE,
  VISIBLE_VOUCHER_WHERE,
} from "../shared";

export const categoriesService = {
  /**
   * Lấy tất cả category, sắp xếp theo tên A-Z.
   * Trả kèm `voucherCount` (số voucher đang active) cho UI sidebar/filter.
   */
  async listCategories() {
    const categories = await prisma.category.findMany({
      orderBy: { categoryName: "asc" },
      include: { _count: { select: { vouchers: true } } },
    });

    return categories.map((cat) => ({
      ...cat,
      voucherCount: cat._count.vouchers,
    }));
  },

  /**
   * Lấy chi tiết 1 category theo id. Throw 404 nếu không tồn tại.
   */
  async getCategoryById(id: number) {
    const category = await prisma.category.findUnique({
      where: { categoryId: id },
      include: { _count: { select: { vouchers: true } } },
    });
    if (!category) {
      throw new AppError("Không tìm thấy danh mục", 404, "CATEGORY_NOT_FOUND");
    }
    return {
      ...category,
      voucherCount: category._count.vouchers,
    };
  },

  /**
   * Lấy danh sách voucher thuộc 1 category.
   * Filter: chỉ voucher đã duyệt, đang hiển thị, còn hàng, đang trong thời gian bán.
   * Sort: price_asc | price_desc | popular | newest
   */
  async getCategoryVouchers(id: number, query: CategoryVoucherQuery) {
    const { page, limit, sort } = query;

    const category = await prisma.category.findUnique({
      where: { categoryId: id },
      select: { categoryId: true, categoryName: true },
    });
    if (!category) {
      throw new AppError("Không tìm thấy danh mục", 404, "CATEGORY_NOT_FOUND");
    }

    const where: Prisma.VoucherWhereInput = {
      categoryId: id,
      ...VISIBLE_VOUCHER_WHERE(),
    };

    // Build sort order
    const orderBy: Prisma.VoucherOrderByWithRelationInput = {};
    switch (sort) {
      case "price_asc":
        orderBy.salePrice = "asc";
        break;
      case "price_desc":
        orderBy.salePrice = "desc";
        break;
      case "popular":
        orderBy.orderItems = { _count: "desc" };
        break;
      case "newest":
      default:
        orderBy.createdAt = "desc";
        break;
    }

    const { skip, pagination } = buildPagination(page, limit, 0);

    const [vouchers, total] = await Promise.all([
      prisma.voucher.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          partner: { select: PARTNER_MINI_INCLUDE },
          _count: { select: { reviews: true } },
        },
      }),
      prisma.voucher.count({ where }),
    ]);

    // Batch-load avg rating → tránh N+1
    const ratings = await prisma.review.groupBy({
      by: ["voucherId"],
      where: { voucherId: { in: vouchers.map((v) => v.voucherId) } },
      _avg: { rating: true },
    });
    const ratingMap = new Map(ratings.map((r) => [r.voucherId, r._avg.rating ?? 0]));

    const vouchersWithRating = vouchers.map((v) => ({
      ...v,
      averageRating: ratingMap.get(v.voucherId) ?? 0,
      reviewCount: v._count.reviews,
    }));

    return {
      category,
      vouchers: vouchersWithRating,
      pagination: { ...pagination, total },
    };
  },
};