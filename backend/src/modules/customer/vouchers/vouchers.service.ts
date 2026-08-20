/**
 * Voucher Service
 * --------------------------------------------------------------
 * Core business logic cho customer-facing voucher:
 * - List voucher (search, filter, sort, paginate) — BR-CUS-03
 * - Featured voucher (trang chủ)
 * - Voucher detail + reviews
 */
import { prisma } from "../../../config/prisma";
import { Prisma } from "../../../generated/prisma/client";
import { AppError } from "../../../middlewares/errorHandler";
import type { VoucherQuery } from "./vouchers.schemas";
import {
  buildPagination,
  PARTNER_MINI_INCLUDE,
  CATEGORY_MINI_INCLUDE,
  VISIBLE_VOUCHER_WHERE,
} from "../shared";

export const vouchersService = {
  /**
   * Lấy danh sách voucher hiển thị cho customer.
   * Hỗ trợ filter: search, category(s), price range, partner, area, discount_min.
   * Sort: price_asc | price_desc | popular | newest.
   *
   * Lưu ý: discount_min được filter ở tầng JS (sau khi tính %)
   * vì Prisma không hỗ trợ computed field trong WHERE.
   */
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
      availability,
      sort,
      page,
      limit,
    } = query;

    const where: Prisma.VoucherWhereInput = {
      ...VISIBLE_VOUCHER_WHERE(),
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category_id) {
      where.categoryId = category_id;
    } else if (category_ids && category_ids.length > 0) {
      where.categoryId = { in: category_ids };
    }

    if (min_price !== undefined || max_price !== undefined) {
      const priceFilter: { gte?: number; lte?: number } = {};
      if (min_price !== undefined) priceFilter.gte = min_price;
      if (max_price !== undefined) priceFilter.lte = max_price;
      where.salePrice = priceFilter;
    }

    if (partner_id) {
      where.partnerId = partner_id;
    }
    if (partner_name) {
      where.partner = {
        companyName: { contains: partner_name, mode: "insensitive" },
      };
    }
    if (area) {
      where.voucherBranches = {
        some: { branch: { address: { contains: area, mode: "insensitive" } } },
      };
    }

    // Filter by availability (stock status)
    if (availability) {
      switch (availability) {
        case "available":
          // Còn bán: availableQuantity > 10
          where.availableQuantity = { gt: 10 };
          break;
        case "low_stock":
          // Sắp hết: 1 <= availableQuantity <= 10
          where.availableQuantity = { gte: 1, lte: 10 };
          break;
        case "sold_out":
          // Hết hàng: availableQuantity = 0
          where.availableQuantity = 0;
          break;
      }
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

    const { skip, pagination } = buildPagination(page, limit, 0);

    const [vouchers, total] = await Promise.all([
      prisma.voucher.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          partner: { select: PARTNER_MINI_INCLUDE },
          category: { select: CATEGORY_MINI_INCLUDE },
          _count: { select: { reviews: true } },
        },
      }),
      prisma.voucher.count({ where }),
    ]);

    // Batch-load avg rating
    const ratings = await prisma.review.groupBy({
      by: ["voucherId"],
      where: { voucherId: { in: vouchers.map((v) => v.voucherId) } },
      _avg: { rating: true },
    });
    const ratingMap = new Map(ratings.map((r) => [r.voucherId, r._avg.rating ?? 0]));

    const vouchersWithMeta = vouchers.map((v) => ({
      ...v,
      averageRating: ratingMap.get(v.voucherId) ?? 0,
      reviewCount: v._count.reviews,
      discountPercent:
        Number(v.originalPrice) > 0
          ? Math.round((1 - Number(v.salePrice) / Number(v.originalPrice)) * 100)
          : 0,
    }));

    const filtered =
      discount_min !== undefined
        ? vouchersWithMeta.filter((v) => v.discountPercent >= discount_min)
        : vouchersWithMeta;

    const filteredTotal = discount_min !== undefined ? filtered.length : total;
    return {
      vouchers: filtered,
      pagination: { ...pagination, total: filteredTotal },
    };
  },

  /**
   * Lấy 8 voucher nổi bật (mới nhất + còn hàng) cho trang chủ.
   * Không filter discount — dùng để show carousel.
   */
  async getFeaturedVouchers() {
    const vouchers = await prisma.voucher.findMany({
      where: VISIBLE_VOUCHER_WHERE(),
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        partner: { select: PARTNER_MINI_INCLUDE },
        category: { select: CATEGORY_MINI_INCLUDE },
        _count: { select: { reviews: true } },
      },
    });

    const ratings = await prisma.review.groupBy({
      by: ["voucherId"],
      where: { voucherId: { in: vouchers.map((v) => v.voucherId) } },
      _avg: { rating: true },
    });
    const ratingMap = new Map(ratings.map((r) => [r.voucherId, r._avg.rating ?? 0]));

    return vouchers.map((v) => ({
      ...v,
      averageRating: ratingMap.get(v.voucherId) ?? 0,
      reviewCount: v._count.reviews,
    }));
  },

  /**
   * Lấy chi tiết 1 voucher. Throw 404 nếu không tồn tại hoặc không khả dụng.
   */
  async getVoucherById(id: number) {
    const voucher = await prisma.voucher.findUnique({
      where: { voucherId: id },
      include: {
        partner: { select: PARTNER_MINI_INCLUDE },
        category: { select: CATEGORY_MINI_INCLUDE },
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
        _count: { select: { reviews: true } },
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
      averageRating: avgRating._avg.rating ?? 0,
      reviewCount: voucher._count.reviews,
    };
  },

  /**
   * Lấy danh sách review của 1 voucher (có phân trang).
   */
  async getVoucherReviews(id: number, page: number, limit: number) {
    const voucher = await prisma.voucher.findUnique({
      where: { voucherId: id },
      select: { voucherId: true },
    });
    if (!voucher) {
      throw new AppError("Không tìm thấy voucher", 404, "VOUCHER_NOT_FOUND");
    }

    const where = { voucherId: id };
    const { skip, pagination } = buildPagination(page, limit, 0);

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          customer: { select: { userId: true, fullName: true } },
        },
      }),
      prisma.review.count({ where }),
    ]);

    return { reviews, pagination: { ...pagination, total } };
  },

  /**
   * Lấy danh sách đối tác (đã approved) cho dropdown filter.
   * Gộp duplicate companyName và cộng dồn voucher count.
   */
  async listPartnersForFilter() {
    const partners = await prisma.partner.findMany({
      where: { status: "Approved" },
      select: {
        partnerId: true,
        companyName: true,
        _count: {
          select: {
            vouchers: { where: { approvalStatus: "Approved" } },
          },
        },
      },
      orderBy: { companyName: "asc" },
    });

    return partners
      .map((p) => ({
        partnerId: p.partnerId,
        companyName: p.companyName.trim(),
        voucherCount: p._count.vouchers,
      }))
      .sort((a, b) => a.companyName.localeCompare(b.companyName, "vi"));
  },
};