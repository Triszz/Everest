import { prisma } from "../../../config/prisma";

export const bannersService = {
  async listActiveBanners() {
    const banners = await prisma.banner.findMany({
      where: {
        status: "Visible",
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        bannerId: true,
        title: true,
        imageUrl: true,
        status: true,
      },
    });

    return banners;
  },
};
