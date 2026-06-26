import { prisma } from "../../../config/prisma";

export const bannersService = {
  async listActiveBanners() {
    const banners = await prisma.banner.findMany({
      where: {
        status: "Visible",
      },
      orderBy: {
        displayOrder: "asc",
      },
      select: {
        bannerId: true,
        title: true,
        imageUrl: true,
        targetUrl: true,
        displayOrder: true,
      },
    });

    return banners;
  },
};
