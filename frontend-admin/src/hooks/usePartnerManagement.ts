import { useState, useEffect, useCallback, useRef } from 'react';
import { adminPartnersApi } from '../services/admin.service';
import type { PartnerResponse, PartnerStatus, PaginatedList } from '../services/admin.service';

export type PartnerSearchField = 'companyName' | 'partnerId' | 'phoneNumber' | 'email';

export interface PartnersFilter {
  search: string;
  searchField: PartnerSearchField;
  status: PartnerStatus | '';
  isLocked: '' | true | false;
}

const DEFAULT_FILTERS: PartnersFilter = {
  search: '',
  searchField: 'companyName',
  status: '',
  isLocked: '',
};

export function usePartnerManagement() {
  const [partners, setPartners] = useState<PartnerResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [filters, setFilters] = useState<PartnersFilter>(DEFAULT_FILTERS);
  const filtersRef = useRef<PartnersFilter>(DEFAULT_FILTERS);
  filtersRef.current = filters;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Detail partner viewing state
  const [selectedPartner, setSelectedPartner] = useState<PartnerResponse | null>(null);
  const [isFetchingDetail, setIsFetchingDetail] = useState(false);

  // Fetch partners list with current page and filters
  const fetchPartners = useCallback(async (
    targetPage = 1,
    overrides?: Partial<PartnersFilter>,
  ) => {
    setIsLoading(true);
    setError(null);
    const effective = overrides
      ? { ...filtersRef.current, ...overrides }
      : filtersRef.current;
    try {
      const apiParams = {
        page: targetPage,
        limit,
        search: effective.search || undefined,
        searchField: effective.searchField,
        status: effective.status || undefined,
        isLocked: effective.isLocked === '' ? undefined : effective.isLocked,
      };

      const result: PaginatedList<PartnerResponse> = await adminPartnersApi.list(apiParams);
      setPartners(result.list);
      setTotal(result.total);
      setPage(result.page);
      setLimit(result.limit);
      setTotalPages(result.totalPages);
      // Only sync filters state when overrides were provided so the filter inputs
      // mirror the most recent search. Avoid writing back the same object on the
      // auto-fetch useEffect, which would cause infinite re-renders.
      if (overrides) {
        setFilters(effective);
      }
    } catch (err: any) {
      console.error('Failed to fetch partners:', err);
      setError(err.message || 'Không thể tải danh sách đối tác. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  // Auto-fetch list on mount only (no filter dependency to avoid loops).
  useEffect(() => {
    fetchPartners(1);
  }, [fetchPartners]);

  // Fetch partner detail by ID
  const fetchPartnerDetail = useCallback(async (partnerId: number) => {
    setIsFetchingDetail(true);
    setError(null);
    try {
      const partner = await adminPartnersApi.getById(partnerId);
      setSelectedPartner(partner);
      return partner;
    } catch (err: any) {
      console.error('Failed to fetch partner details:', err);
      setError(err.message || 'Không thể tải chi tiết đối tác.');
      throw err;
    } finally {
      setIsFetchingDetail(false);
    }
  }, []);

  // Approve a partner registration
  const approvePartner = useCallback(async (partnerId: number, note?: string) => {
    setError(null);
    try {
      const updatedPartner = await adminPartnersApi.approve(partnerId, note ? { note } : undefined);

      // Update local state list
      setPartners((prevPartners) =>
        prevPartners.map((p) => (p.partnerId === partnerId ? updatedPartner : p))
      );

      // Update selected detail partner if applicable
      if (selectedPartner?.partnerId === partnerId) {
        setSelectedPartner(updatedPartner);
      }
      return updatedPartner;
    } catch (err: any) {
      console.error('Failed to approve partner:', err);
      setError(err.message || 'Phê duyệt đối tác thất bại.');
      throw err;
    }
  }, [selectedPartner]);

  // Reject a partner registration
  const rejectPartner = useCallback(async (partnerId: number, reason: string) => {
    setError(null);
    try {
      const updatedPartner = await adminPartnersApi.reject(partnerId, { reason });

      // Update local state list
      setPartners((prevPartners) =>
        prevPartners.map((p) => (p.partnerId === partnerId ? updatedPartner : p))
      );

      // Update selected detail partner if applicable
      if (selectedPartner?.partnerId === partnerId) {
        setSelectedPartner(updatedPartner);
      }
      return updatedPartner;
    } catch (err: any) {
      console.error('Failed to reject partner:', err);
      setError(err.message || 'Từ chối đối tác thất bại.');
      throw err;
    }
  }, [selectedPartner]);

  // Toggle partner locked/unlocked state (cascades to branches and cashiers)
  const togglePartnerLock = useCallback(async (partnerId: number, currentLocked: boolean, reason?: string) => {
    setError(null);
    try {
      const result = await adminPartnersApi.toggleLock(partnerId, {
        locked: !currentLocked,
        reason,
      });

      // Update local state list
      setPartners((prevPartners) =>
        prevPartners.map((p) => (p.partnerId === partnerId ? result.partner : p))
      );

      // Update selected detail partner if applicable
      if (selectedPartner?.partnerId === partnerId) {
        setSelectedPartner(result.partner);
      }
      return result;
    } catch (err: unknown) {
      console.error('Failed to toggle partner lock state:', err);
      const msg = err instanceof Error ? err.message : 'Không thể khóa/mở khóa tài khoản đối tác.';
      setError(msg);
      throw err;
    }
  }, [selectedPartner]);

  // Helper to update filters
  const updateFilters = useCallback((newFilters: Partial<PartnersFilter>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  return {
    partners,
    total,
    page,
    limit,
    totalPages,
    filters,
    isLoading,
    error,
    selectedPartner,
    isFetchingDetail,
    fetchPartners,
    fetchPartnerDetail,
    approvePartner,
    rejectPartner,
    togglePartnerLock,
    updateFilters,
    resetFilters,
    setSelectedPartner,
  };
}
