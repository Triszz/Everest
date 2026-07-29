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
    const {
      search,
      category_id,
      category_ids,
      min_price,
      max_price,
      partner_id,
      partner_name,
      discount_min,
      area,
      sort,
      page,
      limit,
    } = query;

    const where: Prisma.VoucherWhereInput = {
      approvalStatus: "Approved",
      displayStatus: "Visible",
      availableQuantity: { gt: 0 },
      startDate: { lte: new Date() },
      endDate: { gte: new Date() },
    };

    // ── Search (title + description) ─────────────────────────────────
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // ── Category filter ───────────────────────────────────────────────
    if (category_id) {
      where.categoryId = category_id;
    } else if (category_ids && category_ids.length > 0) {
      where.categoryId = { in: category_ids };
    }

    // ── Price range ────────────────────────────────────────────────────
    if (min_price !== undefined) {
      where.salePrice = { ...(where.salePrice as object ?? {}), gte: min_price };
    }
    if (max_price !== undefined) {
      where.salePrice = { ...(where.salePrice as object ?? {}), lte: max_price };
    }

    // ── BR-CUS-03: Partner filter ──────────────────────────────────────
    if (partner_id) {
      where.partnerId = partner_id;
    }
    if (partner_name) {
      where.partner = { companyName: { contains: partner_name, mode: "insensitive" } };
    }

    // ── BR-CUS-03: Area filter (city/province từ branch address) ──────
    if (area) {
      where.voucherBranches = {
        some: {
          branch: {
            address: { contains: area, mode: "insensitive" },
          },
        },
      };
    }

    // ── Sort ────────────────────────────────────────────────────────────
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

    // ── Fetch vouchers ─────────────────────────────────────────────────
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

    // ── BR-CUS-03: Batch load avg ratings → tránh N+1 queries ─────────
    const voucherIds = vouchers.map((v) => v.voucherId);
    const ratings = await prisma.review.groupBy({
      by: ["voucherId"],
      where: { voucherId: { in: voucherIds } },
      _avg: { rating: true },
    });
    const ratingMap = new Map(ratings.map((r) => [r.voucherId, r._avg.rating ?? 0]));

    // ── BR-CUS-03: Tính discount % ─────────────────────────────────────
    const vouchersWithMeta = vouchers.map((v) => ({
      ...v,
      averageRating: ratingMap.get(v.voucherId) ?? 0,
      reviewCount: v._count.reviews,
      discountPercent:
        v.originalPrice > 0
          ? Math.round(
              (1 - Number(v.salePrice) / Number(v.originalPrice)) * 100
            )
          : 0,
    }));

    // ── BR-CUS-03: Filter discount_min (sau khi tính %) ─────────────────
    // Prisma không hỗ trợ computed field trong WHERE → lọc ở tầng JS
    const filtered =
      discount_min !== undefined
        ? vouchersWithMeta.filter((v) => v.discountPercent >= discount_min)
        : vouchersWithMeta;

    const pagination: PaginationResult = {
      page,
      limit,
      total: discount_min !== undefined ? filtered.length : total,
      totalPages: Math.ceil((discount_min !== undefined ? filtered.length : total) / limit),
    };

    return { vouchers: filtered, pagination };
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
