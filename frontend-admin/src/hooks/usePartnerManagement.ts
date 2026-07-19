import { useState, useEffect, useCallback } from 'react';
import { adminPartnersApi } from '../services/admin.service';
import type { PartnerResponse, PartnerStatus, PaginatedList } from '../services/admin.service';

export interface PartnersFilter {
  search: string;
  status: PartnerStatus | '';
}

export function usePartnerManagement() {
  const [partners, setPartners] = useState<PartnerResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [filters, setFilters] = useState<PartnersFilter>({
    search: '',
    status: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Detail partner viewing state
  const [selectedPartner, setSelectedPartner] = useState<PartnerResponse | null>(null);
  const [isFetchingDetail, setIsFetchingDetail] = useState(false);

  // Fetch partners list with current page and filters
  const fetchPartners = useCallback(async (targetPage = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const apiParams = {
        page: targetPage,
        limit,
        search: filters.search || undefined,
        status: filters.status || undefined,
      };

      const result: PaginatedList<PartnerResponse> = await adminPartnersApi.list(apiParams);
      setPartners(result.list);
      setTotal(result.total);
      setPage(result.page);
      setLimit(result.limit);
      setTotalPages(result.totalPages);
    } catch (err: any) {
      console.error('Failed to fetch partners:', err);
      setError(err.message || 'Không thể tải danh sách đối tác. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  }, [filters, limit]);

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

  // Toggle partner locked/unlocked state
  const togglePartnerLock = useCallback(async (partnerId: number, currentLocked: boolean, reason?: string) => {
    setError(null);
    try {
      const updatedPartner = await adminPartnersApi.toggleLock(partnerId, {
        locked: !currentLocked,
        reason,
      });

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
      console.error('Failed to toggle partner lock state:', err);
      setError(err.message || 'Không thể khóa/mở khóa tài khoản đối tác.');
      throw err;
    }
  }, [selectedPartner]);

  // Helper to update filters
  const updateFilters = useCallback((newFilters: Partial<PartnersFilter>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      status: '',
    });
  }, []);

  // Auto-fetch list when filters or page parameters trigger (initial load)
  useEffect(() => {
    fetchPartners(1);
  }, [fetchPartners]);

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
