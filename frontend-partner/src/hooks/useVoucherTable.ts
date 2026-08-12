import { useState, useEffect } from "react";
import { apiGetVoucherReportTable } from "../services/report.service";
import type {
  ReportFilters,
  VoucherReportData,
  VoucherSortBy,
} from "../types/report";

/**
 * Voucher table hook với hỗ trợ refresh qua `refreshKey`.
 *
 * Khi refreshKey thay đổi → re-fetch với filter/page/sort/search HIỆN TẠI.
 * Filter KHÔNG bị reset.
 */
export function useVoucherTable(
  filters: ReportFilters,
  page: number,
  sortBy: VoucherSortBy,
  sortOrder: "asc" | "desc",
  debouncedSearch: string,
  refreshKey?: number,
) {
  const [data, setData] = useState<VoucherReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    let cancelled = false;

    setData(null);
    setLoading(true);
    setError(null);

    apiGetVoucherReportTable({
      datePreset: filters.datePreset,
      fromDate: filters.fromDate,
      toDate: filters.toDate,
      page,
      limit: 10,
      sortBy,
      sortOrder,
      search: debouncedSearch,
    })
      .then((res) => { if (!cancelled) setData(res); })
      .catch((err: unknown) => {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : "Không thể cập nhật dữ liệu báo cáo. Vui lòng thử lại.";
          setError(msg);
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [
    filters.datePreset,
    filters.fromDate,
    filters.toDate,
    page,
    sortBy,
    sortOrder,
    debouncedSearch,
    refreshKey,
  ]);
  /* eslint-enable react-hooks/set-state-in-effect */

  return { data, loading, error };
}
