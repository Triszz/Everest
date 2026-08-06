import { useState, useEffect } from "react";
import { apiGetVoucherPerformance } from "../services/report.service";
import type { ReportFilters, VoucherPerformanceData } from "../types/report";

// Clearing stale data immediately when filters change is intentional UX —
// old data must not linger while new data is being fetched.
export function useVoucherPerformance(filters: ReportFilters) {
  const [data, setData] = useState<VoucherPerformanceData | null>(null);
  const [loading, setLoading] = useState(true);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    let cancelled = false;

    setData(null);
    setLoading(true);

    apiGetVoucherPerformance({ ...filters, limit: 10 })
      .then((res) => { if (!cancelled) setData(res); })
      .catch(() => { if (!cancelled) setData(null); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [
    filters.datePreset,
    filters.fromDate,
    filters.toDate,
  ]);
  /* eslint-enable react-hooks/set-state-in-effect */

  return { data, loading };
}
