import { prisma } from "../../../config/prisma";
import { Prisma } from "../../../generated/prisma/client";
import { CategoryVoucherQuery } from "./categories.schemas";
import { AppError } from "../../../middlewares/errorHandler";

interface PaginationResult {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const categoriesService = {
  async listCategories() {
    const categories = await prisma.category.findMany({
      orderBy: { categoryName: "asc" },
      include: {
        _count: {
          select: { vouchers: true },
        },
      },
    });

    return categories.map((cat) => ({
      ...cat,
      voucherCount: cat._count.vouchers,
    }));
  },

  async getCategoryById(id: number) {
    const category = await prisma.category.findUnique({
      where: { categoryId: id },
      include: {
        _count: {
          select: { vouchers: true },
        },
      },
    });

    if (!category) {
      throw new AppError("Không tìm thấy danh mục", 404, "CATEGORY_NOT_FOUND");
    }

    return {
      ...category,
      voucherCount: category._count.vouchers,
    };
  },

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
      approvalStatus: "Approved",
      displayStatus: "Visible",
      availableQuantity: { gt: 0 },
      startDate: { lte: new Date() },
      endDate: { gte: new Date() },
    };

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

    const skip = (page - 1) * limit;

    const [vouchers, total] = await Promise.all([
      prisma.voucher.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          partner: {
            select: {
              partnerId: true,
              companyName: true,
            },
          },
          _count: {
            select: { reviews: true },
          },
        },
      }),
      prisma.voucher.count({ where }),
    ]);

    const pagination: PaginationResult = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };

    const vouchersWithRating = await Promise.all(
      vouchers.map(async (voucher) => {
        const avgRating = await prisma.review.aggregate({
          where: { voucherId: voucher.voucherId },
          _avg: { rating: true },
        });
        return {
          ...voucher,
          averageRating: avgRating._avg.rating || 0,
          reviewCount: voucher._count.reviews,
        };
      }),
    );

    return {
      category,
      vouchers: vouchersWithRating,
      pagination,
    };
  },
};
