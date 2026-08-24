/**
 * Post Service
 * --------------------------------------------------------------
 * Quản lý bài viết (blog/tin tức) hiển thị cho customer.
 * Customer chỉ đọc — việc tạo/sửa do admin/partner quản lý.
 */
import { prisma } from "../../../config/prisma";
import { buildPagination } from "../shared/helpers";

const POST_LIST_SELECT = {
  postId: true,
  title: true,
  content: true,
  imageUrl: true,
  createdAt: true,
  author: {
    select: {
      userId: true,
      fullName: true,
      avatar: true,
    },
  },
} as const;

export const postsService = {
  /**
   * Lấy danh sách bài viết đã published (status = Visible), có phân trang.
   */
  async listPublishedPosts(page: number = 1, limit: number = 20) {
    const VISIBLE = "Visible" as const;
    const where = { status: VISIBLE };
    const { skip, pagination } = buildPagination(page, limit, 0);

    const [items, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: POST_LIST_SELECT,
      }),
      prisma.post.count({ where }),
    ]);

    return { items, pagination: { ...pagination, total } };
  },

  /**
   * Lấy chi tiết 1 bài viết đã published.
   * Trả null nếu không tồn tại hoặc chưa published.
   */
  async getPublishedPostById(postId: number) {
    return prisma.post.findFirst({
      where: { postId, status: "Visible" },
      select: POST_LIST_SELECT,
    });
  },
};