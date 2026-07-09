import { prisma } from "../../../config/prisma";
import { Prisma } from "../../../generated/prisma/client";
import { VoucherQuery } from "./vouchers.schemas";
import { AppError } from "../../../middlewares/errorHandler";

interface PaginationResult {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const vouchersService = {
  async listVouchers(query: VoucherQuery) {
    const { search, category_id, min_price, max_price, sort, page, limit } = query;

    const where: Prisma.VoucherWhereInput = {
      approvalStatus: "Approved",
      displayStatus: "Visible",
      availableQuantity: { gt: 0 },
      startDate: { lte: new Date() },
      endDate: { gte: new Date() },
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category_id) {
      where.categoryId = category_id;
    }

    if (min_price !== undefined) {
      where.salePrice = { ...where.salePrice as object, gte: min_price };
    }

    if (max_price !== undefined) {
      where.salePrice = { ...where.salePrice as object, lte: max_price };
    }

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
          category: {
            select: {
              categoryId: true,
              categoryName: true,
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

    return { vouchers: vouchersWithRating, pagination };
  },

  async getFeaturedVouchers() {
    const now = new Date();

    const vouchers = await prisma.voucher.findMany({
      where: {
        approvalStatus: "Approved",
        displayStatus: "Visible",
        availableQuantity: { gt: 0 },
        startDate: { lte: now },
        endDate: { gte: now },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        partner: {
          select: {
            partnerId: true,
            companyName: true,
          },
        },
        category: {
          select: {
            categoryId: true,
            categoryName: true,
          },
        },
        _count: {
          select: { reviews: true },
        },
      },
    });

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

    return vouchersWithRating;
  },

  async getVoucherById(id: number) {
    const voucher = await prisma.voucher.findUnique({
      where: { voucherId: id },
      include: {
        partner: {
          select: {
            partnerId: true,
            companyName: true,
          },
        },
        category: {
          select: {
            categoryId: true,
            categoryName: true,
          },
        },
        voucherBranches: {
          include: {
            branch: {
              select: {
                branchId: true,
                branchName: true,
                address: true,
                phoneNumber: true,
              },
            },
          },
        },
        _count: {
          select: { reviews: true },
        },
      },
    });

    if (!voucher) {
      throw new AppError("Không tìm thấy voucher", 404, "VOUCHER_NOT_FOUND");
    }

    if (
      voucher.approvalStatus !== "Approved" ||
      voucher.displayStatus !== "Visible"
    ) {
      throw new AppError("Voucher không khả dụng", 404, "VOUCHER_NOT_AVAILABLE");
    }

    const avgRating = await prisma.review.aggregate({
      where: { voucherId: id },
      _avg: { rating: true },
    });

    return {
      ...voucher,
      averageRating: avgRating._avg.rating || 0,
      reviewCount: voucher._count.reviews,
    };
  },

  async getVoucherReviews(id: number, page: number, limit: number) {
    const voucher = await prisma.voucher.findUnique({
      where: { voucherId: id },
      select: { voucherId: true },
    });

    if (!voucher) {
      throw new AppError("Không tìm thấy voucher", 404, "VOUCHER_NOT_FOUND");
    }

    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { voucherId: id },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          customer: {
            select: {
              userId: true,
              fullName: true,
            },
          },
        },
      }),
      prisma.review.count({ where: { voucherId: id } }),
    ]);

    const pagination: PaginationResult = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };

    return { reviews, pagination };
  },
};
