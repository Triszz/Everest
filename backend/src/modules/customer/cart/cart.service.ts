import { prisma } from "../../../config/prisma";
import { AddToCartInput, UpdateCartItemInput } from "./cart.schemas";
import { AppError } from "../../../middlewares/errorHandler";

export const cartService = {
  async getCart(customerId: string) {
    const cartItems = await prisma.cartItem.findMany({
      where: { customerId },
      include: {
        voucher: {
          select: {
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
          },
        },
      },
      orderBy: { addedAt: "desc" },
    });

    const totalItems = cartItems.length;
    const totalAmount = cartItems.reduce(
      (sum, item) => sum + item.voucher.salePrice * item.quantity,
      0
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
        totalItems,
        totalAmount,
      },
    };
  },

  async addToCart(customerId: string, input: AddToCartInput) {
    const { voucher_id, quantity } = input;

    const voucher = await prisma.voucher.findUnique({
      where: { voucherId: voucher_id },
    });

    if (!voucher) {
      throw new AppError("Không tìm thấy voucher", 404, "VOUCHER_NOT_FOUND");
    }

    // RB-01: Kiểm tra voucher đã được duyệt
    if (voucher.approvalStatus !== "Approved") {
      throw new AppError(
        "Voucher chưa được duyệt",
        400,
        "VOUCHER_NOT_APPROVED"
      );
    }

    // RB-04: Kiểm tra thời gian bán
    const now = new Date();
    if (now < voucher.startDate || now > voucher.endDate) {
      throw new AppError("Voucher không còn trong thời gian bán", 400, "VOUCHER_NOT_AVAILABLE");
    }

    // RB-15: Kiểm tra tồn kho
    if (voucher.availableQuantity < quantity) {
      throw new AppError(
        `Số lượng tồn kho không đủ. Chỉ còn ${voucher.availableQuantity} voucher`,
        400,
        "INSUFFICIENT_STOCK"
      );
    }

    // Check nếu đã có trong cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        customerId_voucherId: {
          customerId,
          voucherId: voucher_id,
        },
      },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > voucher.availableQuantity) {
        throw new AppError(
          `Tổng số lượng vượt quá tồn kho. Chỉ còn ${voucher.availableQuantity} voucher`,
          400,
          "INSUFFICIENT_STOCK"
        );
      }

      const updated = await prisma.cartItem.update({
        where: { cartItemId: existingItem.cartItemId },
        data: { quantity: newQuantity },
        include: {
          voucher: {
            select: {
              voucherId: true,
              title: true,
              imageUrl: true,
              salePrice: true,
            },
          },
        },
      });

      return {
        message: "Cập nhật số lượng voucher trong giỏ hàng",
        item: updated,
      };
    }

    const newItem = await prisma.cartItem.create({
      data: {
        customerId,
        voucherId: voucher_id,
        quantity,
      },
      include: {
        voucher: {
          select: {
            voucherId: true,
            title: true,
            imageUrl: true,
            salePrice: true,
          },
        },
      },
    });

    return {
      message: "Thêm voucher vào giỏ hàng thành công",
      item: newItem,
    };
  },

  async updateCartItem(
    customerId: string,
    itemId: number,
    input: UpdateCartItemInput
  ) {
    const { quantity } = input;

    const cartItem = await prisma.cartItem.findUnique({
      where: { cartItemId: itemId },
      include: { voucher: true },
    });

    if (!cartItem) {
      throw new AppError("Không tìm thấy item trong giỏ hàng", 404, "CART_ITEM_NOT_FOUND");
    }

    if (cartItem.customerId !== customerId) {
      throw new AppError("Bạn không có quyền cập nhật item này", 403, "FORBIDDEN");
    }

    if (quantity > cartItem.voucher.availableQuantity) {
      throw new AppError(
        `Số lượng tồn kho không đủ. Chỉ còn ${cartItem.voucher.availableQuantity} voucher`,
        400,
        "INSUFFICIENT_STOCK"
      );
    }

    const updated = await prisma.cartItem.update({
      where: { cartItemId: itemId },
      data: { quantity },
      include: {
        voucher: {
          select: {
            voucherId: true,
            title: true,
            imageUrl: true,
            salePrice: true,
          },
        },
      },
    });

    return {
      message: "Cập nhật số lượng thành công",
      item: updated,
    };
  },

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

    await prisma.cartItem.delete({
      where: { cartItemId: itemId },
    });

    return { message: "Xóa item khỏi giỏ hàng thành công" };
  },

  async clearCart(customerId: string) {
    await prisma.cartItem.deleteMany({
      where: { customerId },
    });

    return { message: "Xóa toàn bộ giỏ hàng thành công" };
  },
};
