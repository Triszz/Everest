import { useCallback, useEffect, useState } from 'react';
import { auditService } from '../services/audit.service';
import type {
  AuditLog,
  AuditLogFilters,
  AuditLogsResponse,
} from '../types/audit';

export function useAuditLog(initial: AuditLogFilters = {}) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [actions, setActions] = useState<string[]>([]);
  const [page, setPage] = useState(initial.page ?? 1);
  const [limit, setLimit] = useState(initial.limit ?? 20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [filters, setFilters] = useState<AuditLogFilters>({
    action: initial.action,
    actorType: initial.actorType,
    targetType: initial.targetType,
    targetId: initial.targetId,
    actorId: initial.actorId,
    fromDate: initial.fromDate,
    toDate: initial.toDate,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await auditService.list({
        page,
        limit,
        ...filters,
      });
      // Backend trả: { success, data: { data, actions, pagination } }
      const payload = (res?.data ?? null) as AuditLogsResponse | null;
      const data = Array.isArray(payload?.data) ? payload.data : [];
      const actions = Array.isArray(payload?.actions) ? payload.actions : [];
      const pagination = payload?.pagination ?? { page: 1, limit: 20, total: 0, totalPages: 1 };
      setLogs(data);
      setActions(actions);
      setTotal(Number(pagination.total) || 0);
      setTotalPages(Number(pagination.totalPages) || 1);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Không thể tải audit log';
      setError(msg);
      setLogs([]);
      setActions([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page, limit, filters]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const updateFilters = (next: Partial<AuditLogFilters>) => {
    setPage(1);
    setFilters((prev) => ({ ...prev, ...next }));
  };

  const resetFilters = () => {
    setPage(1);
    setFilters({});
  };

  const refresh = fetchLogs;

  return {
    logs,
    actions,
    page,
    limit,
    total,
    totalPages,
    filters,
    loading,
    error,
    setPage,
    setLimit,
    updateFilters,
    resetFilters,
    refresh,
  };
}