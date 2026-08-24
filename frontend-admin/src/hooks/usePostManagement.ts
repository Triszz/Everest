import { useState, useCallback } from 'react';
import {
  adminPostsApi,
  type PostResponse,
  type PostStatus,
} from '../services/admin.service';
import type { PaginatedList } from '../services/admin.service';

export interface PostsFilter {
  search: string;
  status?: PostStatus;
}

export interface CreatePostPayload {
  title: string;
  content: string;
  imageUrl?: string | null;
  status?: PostStatus;
}

export interface UpdatePostPayload {
  title?: string;
  content?: string;
  imageUrl?: string | null;
  status?: PostStatus;
}

export function usePostManagement() {
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [filters, setFilters] = useState<PostsFilter>({
    search: '',
    status: undefined,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(
    async (targetPage = 1) => {
      setIsLoading(true);
      setError(null);
      try {
        const result: PaginatedList<PostResponse> = await adminPostsApi.list({
          page: targetPage,
          limit,
          search: filters.search || undefined,
          status: filters.status,
        });
        setPosts(result.list);
        setTotal(result.total);
        setPage(result.page);
        setLimit(result.limit);
        setTotalPages(result.totalPages);
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : 'Không thể tải danh sách bài viết.';
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    },
    [filters, limit],
  );

  const createPost = useCallback(
    async (body: CreatePostPayload) => {
      setError(null);
      setIsSaving(true);
      try {
        const created = await adminPostsApi.create(body);
        await fetchPosts(1);
        return created;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Tạo bài viết thất bại.';
        setError(msg);
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [fetchPosts],
  );

  const updatePost = useCallback(
    async (postId: number, body: UpdatePostPayload) => {
      setError(null);
      setIsSaving(true);
      try {
        const updated = await adminPostsApi.update(postId, body);
        setPosts((prev) =>
          prev.map((p) => (p.postId === postId ? updated : p)),
        );
        return updated;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Cập nhật bài viết thất bại.';
        setError(msg);
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [],
  );

  const togglePostStatus = useCallback(
    async (postId: number, status: PostStatus) => {
      setError(null);
      setIsSaving(true);
      try {
        const updated = await adminPostsApi.updateStatus(postId, { status });
        setPosts((prev) =>
          prev.map((p) => (p.postId === postId ? updated : p)),
        );
        return updated;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Đổi trạng thái bài viết thất bại.';
        setError(msg);
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [],
  );

  const deletePost = useCallback(async (postId: number) => {
    setError(null);
    setIsSaving(true);
    try {
      await adminPostsApi.delete(postId);
      setPosts((prev) => prev.filter((p) => p.postId !== postId));
      setTotal((prev) => Math.max(0, prev - 1));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Xóa bài viết thất bại.';
      setError(msg);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const updateFilters = useCallback((next: Partial<PostsFilter>) => {
    setFilters((prev) => ({ ...prev, ...next }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ search: '', status: undefined });
  }, []);

  return {
    posts,
    page,
    limit,
    total,
    totalPages,
    filters,
    isLoading,
    isSaving,
    error,
    fetchPosts,
    createPost,
    updatePost,
    togglePostStatus,
    deletePost,
    updateFilters,
    resetFilters,
  };
}