import { useState, useCallback } from 'react';
import {
  adminPopupsApi,
  type PopupResponse,
  type PopupStatus,
} from '../services/admin.service';
import type { PaginatedList } from '../services/admin.service';

export interface PopupsFilter {
  search: string;
  status?: PopupStatus;
}

export interface CreatePopupPayload {
  title: string;
  body: string;
  imageUrl?: string | null;
  ctaLabel?: string | null;
  ctaTargetUrl?: string | null;
  status?: PopupStatus;
}

export interface UpdatePopupPayload {
  title?: string;
  body?: string;
  imageUrl?: string | null;
  ctaLabel?: string | null;
  ctaTargetUrl?: string | null;
}

export function usePopupManagement() {
  const [popups, setPopups] = useState<PopupResponse[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [filters, setFilters] = useState<PopupsFilter>({
    search: '',
    status: undefined,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPopups = useCallback(
    async (targetPage = 1) => {
      setIsLoading(true);
      setError(null);
      try {
        const result: PaginatedList<PopupResponse> = await adminPopupsApi.list({
          page: targetPage,
          limit,
          search: filters.search || undefined,
          status: filters.status,
        });
        setPopups(result.list);
        setTotal(result.total);
        setPage(result.page);
        setLimit(result.limit);
        setTotalPages(result.totalPages);
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : 'Không thể tải danh sách popup.';
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    },
    [filters, limit],
  );

  const createPopup = useCallback(
    async (body: CreatePopupPayload) => {
      setError(null);
      setIsSaving(true);
      try {
        const created = await adminPopupsApi.create(body);
        await fetchPopups(1);
        return created;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Tạo popup thất bại.';
        setError(msg);
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [fetchPopups],
  );

  const updatePopup = useCallback(
    async (popupId: number, body: UpdatePopupPayload) => {
      setError(null);
      setIsSaving(true);
      try {
        const updated = await adminPopupsApi.update(popupId, body);
        setPopups((prev) =>
          prev.map((p) => (p.popupId === popupId ? updated : p)),
        );
        return updated;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Cập nhật popup thất bại.';
        setError(msg);
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [],
  );

  const togglePopupStatus = useCallback(
    async (popupId: number, status: PopupStatus) => {
      setError(null);
      setIsSaving(true);
      try {
        const updated = await adminPopupsApi.updateStatus(popupId, { status });
        setPopups((prev) =>
          prev.map((p) => (p.popupId === popupId ? updated : p)),
        );
        return updated;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Đổi trạng thái popup thất bại.';
        setError(msg);
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [],
  );

  const deletePopup = useCallback(async (popupId: number) => {
    setError(null);
    setIsSaving(true);
    try {
      await adminPopupsApi.delete(popupId);
      setPopups((prev) => prev.filter((p) => p.popupId !== popupId));
      setTotal((prev) => Math.max(0, prev - 1));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Xóa popup thất bại.';
      setError(msg);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const updateFilters = useCallback((next: Partial<PopupsFilter>) => {
    setFilters((prev) => ({ ...prev, ...next }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ search: '', status: undefined });
  }, []);

  return {
    popups,
    page,
    limit,
    total,
    totalPages,
    filters,
    isLoading,
    isSaving,
    error,
    fetchPopups,
    createPopup,
    updatePopup,
    togglePopupStatus,
    deletePopup,
    updateFilters,
    resetFilters,
  };
}