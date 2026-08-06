import { useState, useEffect } from "react";
import { apiGetVoucherReportTable } from "../services/report.service";
import type {
  ReportFilters,
  VoucherReportData,
  VoucherSortBy,
} from "../types/report";

// Clearing stale data immediately when filters/sort/page change is intentional UX —
// old data must not linger while new data is being fetched.
export function useVoucherTable(
  filters: ReportFilters,
  page: number,
  sortBy: VoucherSortBy,
  sortOrder: "asc" | "desc",
  debouncedSearch: string,
) {
  const [data, setData] = useState<VoucherReportData | null>(null);
  const [loading, setLoading] = useState(true);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    let cancelled = false;

    setData(null);
    setLoading(true);

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
      .catch(() => { if (!cancelled) setData(null); })
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
  ]);
  /* eslint-enable react-hooks/set-state-in-effect */

  return { data, loading };
}
