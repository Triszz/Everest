/**
 * Review Service
 * --------------------------------------------------------------
 * Quản lý đánh giá voucher của customer:
 * - Tạo/cập nhật review (1 review / customer / voucher)
 * - Danh sách review của 1 voucher
 *
 * Customer chỉ được review khi đã mua voucher (có issued voucher).
 */
import { prisma } from "../../../config/prisma";
import { AppError } from "../../../middlewares/errorHandler";
import type { CreateReviewInput } from "./reviews.schemas";
import { buildPagination, CUSTOMER_MINI_SELECT } from "../shared";

export const reviewsService = {
  /**
   * Tạo review mới, hoặc cập nhật nếu customer đã review voucher này rồi.
   * Validate: voucher tồn tại + đã duyệt + customer đã mua (nếu truyền issuedVoucherId).
   */
  async createReview(
    customerId: string,
    voucherId: number,
    input: CreateReviewInput,
  ) {
    const { rating, comment, issuedVoucherId } = input;

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

    // Nếu có issuedVoucherId → verify customer sở hữu voucher (tự mua hoặc được tặng)
    if (issuedVoucherId) {
      const user = await prisma.user.findUnique({
        where: { userId: customerId },
        select: { email: true },
      });

      const issued = await prisma.issuedVoucher.findFirst({
        where: {
          issuedVoucherId,
          orderItem: {
            order: {
              paymentStatus: "Paid",
              OR: [
                { customerId, isGift: false },
                ...(user?.email
                  ? [{ isGift: true, receiverEmail: { equals: user.email, mode: "insensitive" as const } }]
                  : []),
              ],
            },
            voucherId,
          },
        },
      });
      if (!issued) {
        throw new AppError("Bạn chưa sở hữu voucher này", 403, "NOT_PURCHASED");
      }
    }

    // Đã review chưa? → update thay vì create
    const existing = await prisma.review.findFirst({
      where: { customerId, voucherId },
    });

    if (existing) {
      const updated = await prisma.review.update({
        where: { reviewId: existing.reviewId },
        data: { rating, comment },
        include: { customer: { select: CUSTOMER_MINI_SELECT } },
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
      include: { customer: { select: CUSTOMER_MINI_SELECT } },
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

  /**
   * Danh sách review của 1 voucher (public, có phân trang).
   */
  async listReviews(voucherId: number, page: number, pageSize: number) {
    const where = { voucherId };
    const { skip, pagination } = buildPagination(page, pageSize, 0);

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: { customer: { select: CUSTOMER_MINI_SELECT } },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.review.count({ where }),
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
      pagination: { ...pagination, total },
    };
  },
};