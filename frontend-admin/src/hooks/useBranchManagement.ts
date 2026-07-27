import { useState, useCallback } from 'react';
import { adminBranchesApi, type BranchResponse, type BranchDetailResponse } from '../services/admin.service';
import type { PaginatedList } from '../services/admin.service';

export interface BranchFilters {
  search: string;
  isLocked?: boolean;
  partnerId?: number;
}

export function useBranchManagement() {
  const [branches, setBranches] = useState<BranchResponse[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<BranchDetailResponse | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [filters, setFilters] = useState<BranchFilters>({
    search: '',
    isLocked: undefined,
    partnerId: undefined,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBranches = useCallback(
    async (targetPage = 1, overrideFilters?: Partial<BranchFilters>) => {
      setIsLoading(true);
      setError(null);
      try {
        const mergedFilters = { ...filters, ...overrideFilters };
        const result: PaginatedList<BranchResponse> = await adminBranchesApi.listAll({
          page: targetPage,
          limit,
          search: mergedFilters.search || undefined,
          isLocked: mergedFilters.isLocked,
          partnerId: mergedFilters.partnerId,
        });
        setBranches(result.list);
        setTotal(result.total);
        setPage(result.page);
        setLimit(result.limit);
        setTotalPages(result.totalPages);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Không thể tải danh sách chi nhánh.');
      } finally {
        setIsLoading(false);
      }
    },
    [filters, limit],
  );

  const fetchBranchDetail = useCallback(async (branchId: number) => {
    try {
      const detail = await adminBranchesApi.getByIdSimple(branchId);
      setSelectedBranch(detail);
      return detail;
    } catch {
      setSelectedBranch(null);
      return null;
    }
  }, []);

  const createBranch = useCallback(
    async (partnerId: number, body: { branchName: string; address: string; phoneNumber?: string }) => {
      setIsSaving(true);
      setError(null);
      try {
        const created = await adminBranchesApi.create(partnerId, body);
        setBranches((prev) => [created, ...prev]);
        return created;
      } finally {
        setIsSaving(false);
      }
    },
    [],
  );

  const updateBranch = useCallback(
    async (partnerId: number, branchId: number, body: { branchName?: string; address?: string; phoneNumber?: string | null }) => {
      setIsSaving(true);
      setError(null);
      try {
        const updated = await adminBranchesApi.update(partnerId, branchId, body);
        setBranches((prev) =>
          prev.map((b) => (b.branchId === branchId ? { ...b, ...updated } : b)),
        );
        if (selectedBranch?.branchId === branchId) {
          setSelectedBranch((prev) => (prev ? { ...prev, ...updated } : prev));
        }
        return updated;
      } finally {
        setIsSaving(false);
      }
    },
    [selectedBranch],
  );

  const deleteBranch = useCallback(async (partnerId: number, branchId: number) => {
    setIsSaving(true);
    setError(null);
    try {
      await adminBranchesApi.delete(partnerId, branchId);
      setBranches((prev) => prev.filter((b) => b.branchId !== branchId));
      if (selectedBranch?.branchId === branchId) setSelectedBranch(null);
    } finally {
      setIsSaving(false);
    }
  }, [selectedBranch]);

  const toggleBranchLock = useCallback(
    async (partnerId: number, branchId: number, locked: boolean) => {
      setIsSaving(true);
      setError(null);
      try {
        const updated = await adminBranchesApi.toggleLock(partnerId, branchId, { locked });
        setBranches((prev) =>
          prev.map((b) => (b.branchId === branchId ? { ...b, isLocked: updated.isLocked } : b)),
        );
        if (selectedBranch?.branchId === branchId) {
          setSelectedBranch((prev) => (prev ? { ...prev, isLocked: updated.isLocked } : prev));
        }
        return updated;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Lỗi khi khóa/mở khóa chi nhánh.';
        setError(msg);
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [selectedBranch],
  );

  const updateFilters = useCallback((next: Partial<BranchFilters>) => {
    setFilters((prev) => ({ ...prev, ...next }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ search: '', isLocked: undefined, partnerId: undefined });
  }, []);

  return {
    branches,
    selectedBranch,
    page,
    limit,
    total,
    totalPages,
    filters,
    isLoading,
    isSaving,
    error,
    fetchBranches,
    fetchBranchDetail,
    createBranch,
    updateBranch,
    deleteBranch,
    toggleBranchLock,
    updateFilters,
    resetFilters,
    setSelectedBranch,
  };
}