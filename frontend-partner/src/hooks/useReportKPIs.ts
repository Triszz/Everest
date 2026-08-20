import { useState, useEffect } from "react";
import { apiGetKPIs } from "../services/report.service";
import type { PartnerKPIs, ReportFilters } from "../types/report";

/**
 * KPIs hook với hỗ trợ refresh qua `refreshKey`.
 *
 * @param filters     - datePreset / fromDate / toDate
 * @param refreshKey  - số thay đổi mỗi khi user bấm "Làm mới".
 *                      Dùng Date.now() hoặc counter. Effect re-run khi key đổi
 *                      → fetch fresh data mà KHÔNG cần React Query.
 */
export function useReportKPIs(filters: ReportFilters, refreshKey?: number) {
  const [data, setData] = useState<PartnerKPIs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    let cancelled = false;

    setData(null);
    setLoading(true);
    setError(null);

    apiGetKPIs(filters)
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
    // refreshKey nằm TRONG dependency array để trigger re-fetch khi user refresh
    refreshKey,
  ]);
  /* eslint-enable react-hooks/set-state-in-effect */

  return { data, loading, error };
}
