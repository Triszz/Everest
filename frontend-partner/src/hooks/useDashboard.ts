/**
 * Dashboard Hook
 * ============================================================
 * Custom hook (state + effect) gọi dashboard.service.
 * Cùng pattern với useReportKPIs / useVoucherTable trong cùng dự án.
 *
 * Hỗ trợ:
 * - `refetch()` để manual refresh (vd: khi user bấm nút Refresh)
 * - Tự động re-fetch khi `pathname` thay đổi (vd: navigate từ /validate
 *   về /dashboard) — đảm bảo Dashboard luôn thấy data mới nhất sau khi
 *   user thực hiện action ở trang khác.
 */

import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { apiGetDashboardStats, type DashboardData } from "../services/dashboard.service";

interface DashboardState {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  /** ISO timestamp string — dùng để hiển thị "Cập nhật lúc ..." */
  lastFetchedAt: string | null;
}

/**
 * Hook lấy dashboard stats cho Partner_Owner.
 * - summary: thống kê hôm nay (số voucher đã xác nhận sử dụng)
 * - recentActivity: N hoạt động gần nhất
 * - refetch(): trigger manual refresh (vd: sau khi confirm voucher ở /validate)
 */
export function useDashboardStats(recentLimit = 10): DashboardState & {
  refetch: () => void;
} {
  const [state, setState] = useState<DashboardState>({
    data: null,
    loading: true,
    error: null,
    lastFetchedAt: null,
  });
  const [reloadKey, setReloadKey] = useState(0);
  const location = useLocation();

  // ── Re-fetch khi pathname trở về /dashboard ─────────────────────────
  // Phát hiện chuyển từ trang khác (validate, vouchers...) về dashboard
  // và force một lần fetch mới để data luôn fresh.
  const prevPathRef = useCallbackRef(location.pathname);
  useEffect(() => {
    if (
      location.pathname === "/dashboard" &&
      prevPathRef.current !== "/dashboard" &&
      prevPathRef.current !== ""
    ) {
      setReloadKey((k) => k + 1);
    }
    prevPathRef.current = location.pathname;
  }, [location.pathname, prevPathRef]);

  useEffect(() => {
    let cancelled = false;

    setState((s) => ({ ...s, loading: true, error: null }));

    apiGetDashboardStats(recentLimit)
      .then((data) => {
        if (cancelled) return;
        // `apiGetDashboardStats` trả về `DashboardData` (đã được unwrap 1 lần bởi
        // api-client). KHÔNG gọi `.data` thêm — trước đây gọi nhầm khiến
        // `state.data` luôn undefined → UI hiển thị 0 dù backend trả đúng.
        setState({
          data,
          loading: false,
          error: null,
          lastFetchedAt: new Date().toISOString(),
        });
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setState({
          data: null,
          loading: false,
          error: err?.message ?? "Không thể tải dashboard",
          lastFetchedAt: null,
        });
      });

    return () => {
      cancelled = true;
    };
  }, [recentLimit, reloadKey]);

  const refetch = useCallback(() => {
    setReloadKey((k) => k + 1);
  }, []);

  return { ...state, refetch };
}

/**
 * Hook để giữ giá trị ref của một biến giữa các re-render mà KHÔNG gây
 * re-render khi giá trị đổi. Dùng để track "previous pathname" trong hook
 * mà không cần thêm state.
 */
function useCallbackRef<T>(value: T) {
  const ref = useState({ current: value })[0];
  ref.current = value;
  return ref;
}