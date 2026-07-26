import { prisma } from "../../../config/prisma";

export const popupsService = {
  async getActivePopup() {
    return prisma.popup.findFirst({
      where: { status: "Visible" },
      orderBy: { updatedAt: "desc" },
      select: {
        popupId: true,
        title: true,
        body: true,
        imageUrl: true,
        ctaLabel: true,
        ctaTargetUrl: true,
        status: true,
      },
    });
  },

  async listActivePopups() {
    return prisma.popup.findMany({
      where: { status: "Visible" },
      orderBy: { updatedAt: "desc" },
      select: {
        popupId: true,
        title: true,
        body: true,
        imageUrl: true,
        ctaLabel: true,
        ctaTargetUrl: true,
        status: true,
      },
    });
  },
};