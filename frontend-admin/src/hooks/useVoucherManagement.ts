import { useState, useEffect, useCallback } from 'react';
import { adminVouchersApi } from '../services/admin.service';
import { useToast } from '../components/shared/Toast';

export type VoucherListItem = {
  voucherId: number;
  partnerId: number;
  categoryId: number;
  title: string;
  description: string | null;
  originalPrice: number | string;
  salePrice: number | string;
  totalQuantity: number;
  availableQuantity: number;
  startDate: string;
  endDate: string;
  approvalStatus: 'Draft' | 'Pending' | 'Approved' | 'Rejected';
  displayStatus: 'Visible' | 'Hidden';
  createdAt: string;
  updatedAt: string;
  category?: { categoryId: number; categoryName: string };
  partner?: { partnerId: number; companyName: string };
};

export interface VoucherStats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  totalIssued: number;
  totalUsed: number;
}

interface Filters {
  page: number;
  limit: number;
  search: string;
  approvalStatus: string;
  partnerId?: number;
}

export function useVoucherManagement(partnerId?: number) {
  const { showToast } = useToast();

  const [vouchers, setVouchers] = useState<VoucherListItem[]>([]);
  const [stats, setStats] = useState<VoucherStats | null>(null);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<Filters>({
    page: 1,
    limit: 20,
    search: '',
    approvalStatus: '',
    partnerId,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalPages = Math.ceil(total / filters.limit);

  const fetchVouchers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await adminVouchersApi.list({
        page: filters.page,
        limit: filters.limit,
        search: filters.search || undefined,
        partnerId: filters.partnerId,
        approvalStatus: filters.approvalStatus || undefined,
      });
      setVouchers(res.list as VoucherListItem[]);
      setTotal(res.total);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi tải danh sách voucher';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [filters, showToast]);

  const fetchStats = useCallback(async () => {
    setIsLoadingStats(true);
    try {
      const data = await adminVouchersApi.getStats();
      setStats(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi tải thống kê';
      showToast(msg, 'error');
    } finally {
      setIsLoadingStats(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const approveVoucher = useCallback(
    async (voucherId: number, note?: string) => {
      try {
        await adminVouchersApi.approve(voucherId, { note });
        showToast('Phê duyệt voucher thành công', 'success');
        setVouchers(prev => prev.map(v => v.voucherId === voucherId ? { ...v, approvalStatus: 'Approved' } : v));
        await fetchStats();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Lỗi khi phê duyệt voucher';
        showToast(msg, 'error');
      }
    },
    [fetchStats, showToast],
  );

  const rejectVoucher = useCallback(
    async (voucherId: number, reason: string) => {
      try {
        await adminVouchersApi.reject(voucherId, { reason });
        showToast('Từ chối voucher thành công', 'warning');
        setVouchers(prev => prev.map(v => v.voucherId === voucherId ? { ...v, approvalStatus: 'Rejected' } : v));
        await fetchStats();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Lỗi khi từ chối voucher';
        showToast(msg, 'error');
      }
    },
    [fetchStats, showToast],
  );

  const toggleDisplayStatus = useCallback(
    async (voucherId: number, displayStatus: 'Visible' | 'Hidden') => {
      try {
        await adminVouchersApi.setDisplayStatus(voucherId, { displayStatus });
        showToast(
          displayStatus === 'Visible' ? 'Hiển thị voucher thành công' : 'Ẩn voucher thành công',
          'success',
        );
        setVouchers(prev => prev.map(v => v.voucherId === voucherId ? { ...v, displayStatus } : v));
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Lỗi khi cập nhật trạng thái hiển thị';
        showToast(msg, 'error');
      }
    },
    [fetchVouchers, showToast],
  );

  const updateEndDate = useCallback(
    async (voucherId: number, endDate: string) => {
      try {
        const updated = await adminVouchersApi.updateDates(voucherId, { endDate });
        setVouchers((prev) => prev.map((v) => (
          v.voucherId === voucherId ? { ...v, endDate: updated.endDate ?? v.endDate, updatedAt: updated.updatedAt ?? v.updatedAt } : v
        )));
        return updated;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Lỗi khi cập nhật ngày kết thúc';
        showToast(msg, 'error');
        throw err;
      }
    },
    [showToast],
  );

  const expireNow = useCallback(
    async (voucherId: number) => {
      try {
        const updated = await adminVouchersApi.expireNow(voucherId);
        setVouchers((prev) => prev.map((v) => (
          v.voucherId === voucherId ? { ...v, endDate: updated.endDate ?? v.endDate, updatedAt: updated.updatedAt ?? v.updatedAt } : v
        )));
        showToast('Voucher đã được hết hạn', 'success');
        return updated;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Lỗi khi hết hạn voucher';
        showToast(msg, 'error');
        throw err;
      }
    },
    [showToast],
  );

  const updateFilters = useCallback((partial: Partial<Filters>) => {
    setFilters((prev) => ({ ...prev, ...partial, page: 1 }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ page: 1, limit: 20, search: '', approvalStatus: '', partnerId });
  }, [partnerId]);

  return {
    vouchers,
    stats,
    total,
    page: filters.page,
    limit: filters.limit,
    totalPages,
    filters,
    isLoading,
    isLoadingStats,
    error,
    fetchVouchers,
    fetchStats,
    approveVoucher,
    rejectVoucher,
    toggleDisplayStatus,
    updateEndDate,
    expireNow,
    updateFilters,
    resetFilters,
  };
}
