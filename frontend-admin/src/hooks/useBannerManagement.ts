import { useState, useCallback } from 'react';
import {
  adminBannersApi,
  type BannerResponse,
  type BannerStatus,
} from '../services/admin.service';
import type { PaginatedList } from '../services/admin.service';

export interface BannersFilter {
  search: string;
  status?: BannerStatus;
}

export interface CreateBannerPayload {
  title: string;
  imageUrl: string;
  status?: BannerStatus;
}

export interface UpdateBannerPayload {
  title?: string;
  imageUrl?: string;
}

export function useBannerManagement() {
  const [banners, setBanners] = useState<BannerResponse[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [filters, setFilters] = useState<BannersFilter>({
    search: '',
    status: undefined,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBanners = useCallback(
    async (targetPage = 1) => {
      setIsLoading(true);
      setError(null);
      try {
        const result: PaginatedList<BannerResponse> = await adminBannersApi.list({
          page: targetPage,
          limit,
          search: filters.search || undefined,
          status: filters.status,
        });
        setBanners(result.list);
        setTotal(result.total);
        setPage(result.page);
        setLimit(result.limit);
        setTotalPages(result.totalPages);
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : 'Không thể tải danh sách banner.';
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    },
    [filters, limit],
  );

  const createBanner = useCallback(
    async (body: CreateBannerPayload) => {
      setError(null);
      setIsSaving(true);
      try {
        const created = await adminBannersApi.create(body);
        await fetchBanners(1);
        return created;
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : 'Tạo banner thất bại.';
        setError(msg);
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [fetchBanners],
  );

  const updateBanner = useCallback(
    async (bannerId: number, body: UpdateBannerPayload) => {
      setError(null);
      setIsSaving(true);
      try {
        const updated = await adminBannersApi.update(bannerId, body);
        setBanners((prev) =>
          prev.map((b) => (b.bannerId === bannerId ? updated : b)),
        );
        return updated;
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : 'Cập nhật banner thất bại.';
        setError(msg);
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [],
  );

  const toggleBannerStatus = useCallback(
    async (bannerId: number, status: BannerStatus) => {
      setError(null);
      setIsSaving(true);
      try {
        const updated = await adminBannersApi.updateStatus(bannerId, { status });
        setBanners((prev) =>
          prev.map((b) => (b.bannerId === bannerId ? updated : b)),
        );
        return updated;
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : 'Đổi trạng thái banner thất bại.';
        setError(msg);
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [],
  );

  const deleteBanner = useCallback(
    async (bannerId: number) => {
      setError(null);
      setIsSaving(true);
      try {
        await adminBannersApi.delete(bannerId);
        setBanners((prev) => prev.filter((b) => b.bannerId !== bannerId));
        setTotal((prev) => Math.max(0, prev - 1));
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : 'Xóa banner thất bại.';
        setError(msg);
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [],
  );

  const updateFilters = useCallback(
    (next: Partial<BannersFilter>) => {
      setFilters((prev) => ({ ...prev, ...next }));
    },
    [],
  );

  const resetFilters = useCallback(() => {
    setFilters({ search: '', status: undefined });
  }, []);

  return {
    banners,
    page,
    limit,
    total,
    totalPages,
    filters,
    isLoading,
    isSaving,
    error,
    fetchBanners,
    createBanner,
    updateBanner,
    toggleBannerStatus,
    deleteBanner,
    updateFilters,
    resetFilters,
  };
}
