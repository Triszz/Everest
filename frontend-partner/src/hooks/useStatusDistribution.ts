import { useState, useEffect } from "react";
import { apiGetStatusDistribution } from "../services/report.service";
import type { ReportFilters, StatusDistributionData } from "../types/report";

/**
 * Status distribution hook với hỗ trợ refresh qua `refreshKey`.
 */
export function useStatusDistribution(filters: ReportFilters, refreshKey?: number) {
  const [data, setData] = useState<StatusDistributionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    let cancelled = false;

    setData(null);
    setLoading(true);
    setError(null);

    apiGetStatusDistribution(filters)
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
    refreshKey,
  ]);
  /* eslint-enable react-hooks/set-state-in-effect */

  return { data, loading, error };
}
