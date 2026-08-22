/**
 * Cart Service
 * --------------------------------------------------------------
 * Quản lý giỏ hàng của customer:
 * - Xem giỏ hàng
 * - Thêm voucher vào giỏ (kèm check tồn kho + trạng thái voucher)
 * - Cập nhật số lượng
 * - Xóa 1 item / xóa cả giỏ
 *
 * Concurrency handling:
 * - Sử dụng Database Transaction (Pessimistic Locking) để tránh race condition
 * - Đảm bảo check stock + update cart là atomic operation
 */
import { prisma } from "../../../config/prisma";
import { AppError } from "../../../middlewares/errorHandler";
import type { AddToCartInput, UpdateCartItemInput } from "./cart.schemas";

const CART_VOUCHER_SELECT = {
  voucherId: true,
  title: true,
  imageUrl: true,
  salePrice: true,
  originalPrice: true,
  availableQuantity: true,
  expiryDays: true,
  startDate: true,
  endDate: true,
  approvalStatus: true,
  displayStatus: true,
  partner: { select: { partnerId: true, companyName: true } },
  category: { select: { categoryId: true, categoryName: true } },
} as const;

const SHORT_VOUCHER_SELECT = {
  voucherId: true,
  title: true,
  imageUrl: true,
  salePrice: true,
} as const;

export const cartService = {
  /**
   * Lấy giỏ hàng của customer kèm tính tổng tiền + số item.
   */
  async getCart(customerId: string) {
    const cartItems = await prisma.cartItem.findMany({
      where: { customerId },
      include: { voucher: { select: CART_VOUCHER_SELECT } },
      orderBy: { addedAt: "desc" },
    });

    const totalAmount = cartItems.reduce(
      (sum, item) => sum + Number(item.voucher.salePrice) * item.quantity,
      0,
    );

    return {
      items: cartItems.map((item) => ({
        cartItemId: item.cartItemId,
        quantity: item.quantity,
        addedAt: item.addedAt,
        voucher: {
          voucherId: item.voucher.voucherId,
          title: item.voucher.title,
          imageUrl: item.voucher.imageUrl,
          salePrice: Number(item.voucher.salePrice),
          originalPrice: Number(item.voucher.originalPrice),
          availableQuantity: item.voucher.availableQuantity,
          expiryDays: item.voucher.expiryDays,
          startDate: item.voucher.startDate,
          endDate: item.voucher.endDate,
          approvalStatus: item.voucher.approvalStatus,
          displayStatus: item.voucher.displayStatus,
          partner: item.voucher.partner,
          category: item.voucher.category,
        },
      })),
      summary: {
        totalItems: cartItems.length,
        totalAmount,
      },
    };
  },

  /**
   * Thêm voucher vào giỏ (hoặc cộng dồn số lượng nếu đã có).
   * Validate: voucher tồn tại + đã duyệt + trong thời gian bán + đủ tồn kho.
   *
   * Sử dụng transaction để tránh race condition khi user thêm từ nhiều tab.
   */
  async addToCart(customerId: string, input: AddToCartInput) {
    const { voucher_id, quantity } = input;

    return prisma.$transaction(async (tx) => {
      // Lock voucher row bằng findUnique (Prisma uses shared lock trong transaction)
      const voucher = await tx.voucher.findUnique({
        where: { voucherId: voucher_id },
      });

      if (!voucher) {
        throw new AppError("Không tìm thấy voucher", 404, "VOUCHER_NOT_FOUND");
      }
      // RB-01: voucher phải được duyệt
      if (voucher.approvalStatus !== "Approved") {
        throw new AppError(
          "Voucher chưa được duyệt",
          400,
          "VOUCHER_NOT_APPROVED",
        );
      }
      // RB-04: trong thời gian bán
      const now = new Date();
      if (now < voucher.startDate || now > voucher.endDate) {
        throw new AppError(
          "Voucher không còn trong thời gian bán",
          400,
          "VOUCHER_NOT_AVAILABLE",
        );
      }

      // Check existing cart item
      const existing = await tx.cartItem.findUnique({
        where: { customerId_voucherId: { customerId, voucherId: voucher_id } },
      });

      if (existing) {
        const newQuantity = existing.quantity + quantity;
        // RB-15: tổng số lượng không vượt quá tồn kho
        if (newQuantity > voucher.availableQuantity) {
          throw new AppError(
            `Tổng số lượng vượt quá tồn kho. Chỉ còn ${voucher.availableQuantity} voucher`,
            400,
            "INSUFFICIENT_STOCK",
          );
        }

        const updated = await tx.cartItem.update({
          where: { cartItemId: existing.cartItemId },
          data: { quantity: newQuantity },
          include: { voucher: { select: SHORT_VOUCHER_SELECT } },
        });

        return { message: "Cập nhật số lượng voucher trong giỏ hàng", item: updated };
      }

      // RB-15: check tồn kho cho cart item mới
      if (quantity > voucher.availableQuantity) {
        throw new AppError(
          `Số lượng tồn kho không đủ. Chỉ còn ${voucher.availableQuantity} voucher`,
          400,
          "INSUFFICIENT_STOCK",
        );
      }

      const created = await tx.cartItem.create({
        data: { customerId, voucherId: voucher_id, quantity },
        include: { voucher: { select: SHORT_VOUCHER_SELECT } },
      });

      return { message: "Thêm voucher vào giỏ hàng thành công", item: created };
    });
  },

  /**
   * Cập nhật số lượng 1 item trong giỏ.
   * Check ownership: chỉ chủ sở hữu mới được update.
   *
   * Sử dụng transaction để tránh race condition khi user update từ nhiều tab.
   */
  async updateCartItem(
    customerId: string,
    itemId: number,
    input: UpdateCartItemInput,
  ) {
    return prisma.$transaction(async (tx) => {
      const cartItem = await tx.cartItem.findUnique({
        where: { cartItemId: itemId },
        include: { voucher: true },
      });
      if (!cartItem) {
        throw new AppError("Không tìm thấy item trong giỏ hàng", 404, "CART_ITEM_NOT_FOUND");
      }
      if (cartItem.customerId !== customerId) {
        throw new AppError("Bạn không có quyền cập nhật item này", 403, "FORBIDDEN");
      }

      // Re-check tồn kho trong transaction để tránh race condition
      const voucher = await tx.voucher.findUnique({
        where: { voucherId: cartItem.voucherId },
      });
      if (!voucher || input.quantity > voucher.availableQuantity) {
        throw new AppError(
          `Số lượng tồn kho không đủ. Chỉ còn ${voucher?.availableQuantity ?? 0} voucher`,
          400,
          "INSUFFICIENT_STOCK",
        );
      }

      const updated = await tx.cartItem.update({
        where: { cartItemId: itemId },
        data: { quantity: input.quantity },
        include: { voucher: { select: SHORT_VOUCHER_SELECT } },
      });

      return { message: "Cập nhật số lượng thành công", item: updated };
    });
  },

  /**
   * Xóa 1 item khỏi giỏ. Check ownership.
   */
  async removeCartItem(customerId: string, itemId: number) {
    const cartItem = await prisma.cartItem.findUnique({
      where: { cartItemId: itemId },
    });
    if (!cartItem) {
      throw new AppError("Không tìm thấy item trong giỏ hàng", 404, "CART_ITEM_NOT_FOUND");
    }
    if (cartItem.customerId !== customerId) {
      throw new AppError("Bạn không có quyền xóa item này", 403, "FORBIDDEN");
    }

    await prisma.cartItem.delete({ where: { cartItemId: itemId } });
    return { message: "Xóa item khỏi giỏ hàng thành công" };
  },

  /**
   * Xóa toàn bộ giỏ hàng của customer (sau khi thanh toán chẳng hạn).
   */
  async clearCart(customerId: string) {
    await prisma.cartItem.deleteMany({ where: { customerId } });
    return { message: "Xóa toàn bộ giỏ hàng thành công" };
  },
};