import { prisma } from "../../../config/prisma";

export const postsService = {
  async listPublishedPosts(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      prisma.post.findMany({
        where: { status: "Visible" },
        skip,
        take: limit,
        orderBy: { publishedAt: "desc" },
        select: {
          postId: true,
          title: true,
          content: true,
          imageUrl: true,
          publishedAt: true,
          author: {
            select: {
              userId: true,
              fullName: true,
              avatar: true,
            },
          },
        },
      }),
      prisma.post.count({ where: { status: "Visible" } }),
    ]);
    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async getPublishedPostById(postId: number) {
    return prisma.post.findFirst({
      where: { postId, status: "Visible" },
      select: {
        postId: true,
        title: true,
        content: true,
        imageUrl: true,
        publishedAt: true,
        author: {
          select: {
            userId: true,
            fullName: true,
            avatar: true,
          },
        },
      },
    });
  },
};