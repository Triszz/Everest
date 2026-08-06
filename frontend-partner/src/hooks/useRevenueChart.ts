import { useState, useEffect } from "react";
import { apiGetRevenueChart } from "../services/report.service";
import type { ReportFilters, RevenueChartData, RevenueGranularity } from "../types/report";

// Clearing stale data immediately when filters change is intentional UX —
// old data must not linger while new data is being fetched.
export function useRevenueChart(filters: ReportFilters, granularity: RevenueGranularity) {
  const [data, setData] = useState<RevenueChartData | null>(null);
  const [loading, setLoading] = useState(true);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    let cancelled = false;

    setData(null);
    setLoading(true);

    apiGetRevenueChart({ ...filters, granularity })
      .then((res) => { if (!cancelled) setData(res); })
      .catch(() => { if (!cancelled) setData(null); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [
    filters.datePreset,
    filters.fromDate,
    filters.toDate,
    granularity,
  ]);
  /* eslint-enable react-hooks/set-state-in-effect */

  return { data, loading };
}
