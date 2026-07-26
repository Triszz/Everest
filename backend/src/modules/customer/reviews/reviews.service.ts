import { prisma } from "../../../config/prisma";
import { AppError } from "../../../middlewares/errorHandler";
import type { CreateReviewInput } from "./reviews.schemas";

export const reviewsService = {
  async createReview(
    customerId: string,
    voucherId: number,
    input: CreateReviewInput
  ) {
    const { rating, comment, issuedVoucherId } = input;

    // Kiểm tra voucher tồn tại
    const voucher = await prisma.voucher.findUnique({
      where: { voucherId },
      select: { voucherId: true, title: true, approvalStatus: true },
    });

    if (!voucher) {
      throw new AppError("Không tìm thấy voucher", 404, "VOUCHER_NOT_FOUND");
    }

    if (voucher.approvalStatus !== "Approved") {
      throw new AppError("Voucher không khả dụng để đánh giá", 400, "VOUCHER_NOT_AVAILABLE");
    }

    // Kiểm tra issuedVoucher nếu có (đảm bảo customer đã mua voucher này)
    if (issuedVoucherId) {
      const issued = await prisma.issuedVoucher.findFirst({
        where: {
          issuedVoucherId,
          orderItem: {
            order: {
              customerId,
              paymentStatus: "Paid",
            },
            voucherId,
          },
        },
      });

      if (!issued) {
        throw new AppError("Bạn chưa mua voucher này", 403, "NOT_PURCHASED");
      }
    }

    // Kiểm tra đã đánh giá chưa (1 review / voucher / customer)
    const existing = await prisma.review.findFirst({
      where: { customerId, voucherId },
    });

    if (existing) {
      // Update instead of create
      const updated = await prisma.review.update({
        where: { reviewId: existing.reviewId },
        data: { rating, comment },
        include: {
          customer: {
            select: { userId: true, fullName: true },
          },
        },
      });

      return {
        reviewId: updated.reviewId,
        voucherId: updated.voucherId,
        rating: updated.rating,
        comment: updated.comment,
        createdAt: updated.createdAt,
        customer: updated.customer,
        updated: true,
      };
    }

    const review = await prisma.review.create({
      data: {
        customerId,
        voucherId,
        issuedVoucherId: issuedVoucherId ?? null,
        rating,
        comment,
      },
      include: {
        customer: {
          select: { userId: true, fullName: true },
        },
      },
    });

    return {
      reviewId: review.reviewId,
      voucherId: review.voucherId,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      customer: review.customer,
      updated: false,
    };
  },

  async listReviews(voucherId: number, page = 1, pageSize = 10) {
    const skip = (page - 1) * pageSize;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { voucherId },
        include: {
          customer: {
            select: { userId: true, fullName: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.review.count({ where: { voucherId } }),
    ]);

    return {
      reviews: reviews.map((r) => ({
        reviewId: r.reviewId,
        voucherId: r.voucherId,
        customerId: r.customerId,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
        customer: r.customer,
      })),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  },
};
