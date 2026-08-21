import { useState, useCallback } from 'react';
import {
  adminOrdersApi,
  type OrderResponse,
  type OrderPaymentStatus,
} from '../services/admin.service';
import type { PaginatedList } from '../services/admin.service';

export interface OrdersFilter {
  search: string;
  paymentStatus?: OrderPaymentStatus;
  status?: OrderPaymentStatus | 'Refunded';
  userId?: string;
  fromDate?: string;
  toDate?: string;
}

export interface CancelOrderPayload {
  reason: string;
}

export interface RefundOrderPayload {
  reason: string;
  amount?: number;
}

export function useOrderManagement(userId?: string) {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [filters, setFilters] = useState<OrdersFilter>({
    search: '',
    paymentStatus: undefined,
    userId,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(
    async (targetPage = 1) => {
      setIsLoading(true);
      setError(null);
      try {
        const result: PaginatedList<OrderResponse> = await adminOrdersApi.list({
          page: targetPage,
          limit,
          search: filters.search || undefined,
          paymentStatus: filters.paymentStatus,
          status: filters.status,
          userId: filters.userId,
          fromDate: filters.fromDate || undefined,
          toDate: filters.toDate || undefined,
        });
        setOrders(result.list);
        setTotal(result.total);
        setPage(result.page);
        setLimit(result.limit);
        setTotalPages(result.totalPages);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Không thể tải danh sách đơn hàng.');
      } finally {
        setIsLoading(false);
      }
    },
    [filters, limit],
  );

  const cancelOrder = useCallback(
    async (orderId: number, payload: CancelOrderPayload) => {
      setIsSaving(true);
      setError(null);
      try {
        const updated = await adminOrdersApi.cancel(orderId, payload);
        setOrders((prev) =>
          prev.map((o) =>
            o.orderId === orderId
              ? {
                  ...o,
                  paymentStatus: updated.paymentStatus,
                  cancelledAt: updated.cancelledAt,
                  cancelReason: updated.cancelReason,
                  updatedAt: updated.updatedAt,
                }
              : o,
          ),
        );
        return updated;
      } finally {
        setIsSaving(false);
      }
    },
    [],
  );

  const refundOrder = useCallback(
    async (orderId: number, payload: RefundOrderPayload) => {
      setIsSaving(true);
      setError(null);
      try {
        const updated = await adminOrdersApi.refund(orderId, payload);
        setOrders((prev) =>
          prev.map((o) =>
            o.orderId === orderId
              ? {
                  ...o,
                  refundedAt: updated.refundedAt,
                  refundAmount: updated.refundAmount,
                  updatedAt: updated.updatedAt,
                }
              : o,
          ),
        );
        return updated;
      } finally {
        setIsSaving(false);
      }
    },
    [],
  );

  const markOrderPaid = useCallback(async (orderId: number) => {
    setIsSaving(true);
    setError(null);
    try {
      const updated = await adminOrdersApi.markPaid(orderId);
      setOrders((prev) => prev.map((order) => order.orderId === orderId
        ? { ...order, paymentStatus: updated.paymentStatus, updatedAt: updated.updatedAt }
        : order));
      return updated;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const updateFilters = useCallback((next: Partial<OrdersFilter>) => {
    setFilters((prev) => ({ ...prev, ...next }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ search: '', paymentStatus: undefined, status: undefined, userId });
  }, [userId]);

  return {
    orders,
    page,
    limit,
    total,
    totalPages,
    filters,
    isLoading,
    isSaving,
    error,
    fetchOrders,
    cancelOrder,
    refundOrder,
    markOrderPaid,
    updateFilters,
    resetFilters,
  };
}