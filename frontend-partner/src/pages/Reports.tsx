/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useMemo } from "react";
import { REPORT_COLORS } from "../components/report/report.constants";
import { KPICard } from "../components/report/KPICard";
import { RevenueChart } from "../components/report/RevenueChart";
import { VoucherPerfChart } from "../components/report/VoucherPerfChart";
import { StatusDistChart } from "../components/report/StatusDistChart";
import { DateFilter } from "../components/report/DateFilter";
import { VoucherReportTable } from "../components/report/VoucherReportTable";
import { useReportKPIs } from "../hooks/useReportKPIs";
import { useRevenueChart } from "../hooks/useRevenueChart";
import { useVoucherPerformance } from "../hooks/useVoucherPerformance";
import { useStatusDistribution } from "../hooks/useStatusDistribution";
import { useVoucherTable } from "../hooks/useVoucherTable";
import type {
  DatePreset,
  ReportFilters,
  RevenueGranularity,
  VoucherSortBy,
} from "../types/report";

// ── Design tokens ──────────────────────────────────────────────────────────────
const C = REPORT_COLORS;

// ── Granularity options ────────────────────────────────────────────────────────
const GRANULARITY_OPTIONS: { label: string; value: RevenueGranularity }[] = [
  { label: "Ngày", value: "day" },
  { label: "Tuần", value: "week" },
  { label: "Tháng", value: "month" },
];

// ── KPI icons ─────────────────────────────────────────────────────────────────
const revenueIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0E76A8" strokeWidth="2">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);
const issuedIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);
const soldIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2">
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);
const usageIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);
const liveIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2">
    <circle cx="12" cy="12" r="2" />
    <path d="M16.24 7.76a6 6 0 0 1 0 8.49" />
    <path d="M7.76 16.24a6 6 0 0 1 0-8.49" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    <path d="M4.93 19.07a10 10 0 0 1 0-14.14" />
  </svg>
);

// ── Page ──────────────────────────────────────────────────────────────────────
export function ReportsPage() {
  // ── Date filter state ─────────────────────────────────────────────────────
  const [datePreset, setDatePreset] = useState<DatePreset | "custom">("last30days");
  const [fromDate, setFromDate] = useState<string>();
  const [toDate, setToDate] = useState<string>();
  const [granularity, setGranularity] = useState<RevenueGranularity>("day");
  // Offset for week/month revenue chart navigation:
  //   0  = current period (this week / this month)
  //   1  = previous period (last week / last month)
  //   -1 = next period (next week / next month — disabled when 0 or positive)
  // Reset to 0 when switching granularity or date preset/range.
  const [chartOffset, setChartOffset] = useState(0);

  // Reset chart offset whenever granularity changes, so the chart always
  // starts fresh (at "this period") rather than carrying over a stale offset.
  useEffect(() => {
    setChartOffset(0);
  }, [granularity]);

  // ── Table state ───────────────────────────────────────────────────────────
  const [tablePage, setTablePage] = useState(1);
  const [tableSortBy, setTableSortBy] = useState<VoucherSortBy>("revenue");
  const [tableSortOrder, setTableSortOrder] = useState<"asc" | "desc">("desc");
  const [tableSearch, setTableSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // ── Refresh state ─────────────────────────────────────────────────────────
  // refreshKey dùng làm dependency trigger cho tất cả hooks.
  // Mỗi lần user bấm "Làm mới", key tăng → useEffect re-run → fetch fresh data.
  // Filter KHÔNG bị reset.
  const [refreshKey, setRefreshKey] = useState(0);
  // isRefreshing = true khi user đã bấm refresh (key > 0) và hooks đang loading.
  const [isRefreshing, setIsRefreshing] = useState(false);
  // Error message hiển thị khi refresh thất bại.
  const [refreshError, setRefreshError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(tableSearch), 400);
    return () => clearTimeout(timer);
  }, [tableSearch]);

  // ── Shared filters (memoized) ──────────────────────────────────────────────
  const filters: ReportFilters = useMemo(() => ({
    datePreset: datePreset === "custom" ? undefined : datePreset,
    fromDate,
    toDate,
  }), [datePreset, fromDate, toDate]);

  // ── Independent data hooks ─────────────────────────────────────────────────
  // Tất cả hooks nhận refreshKey để trigger re-fetch khi user bấm "Làm mới".
  // Filter HIỆN TẠI được giữ nguyên.
  const { data: kpis, loading: loadingKPIs, error: errorKPIs } = useReportKPIs(filters, refreshKey);
  const { data: perfChart, loading: loadingPerf, error: errorPerf } = useVoucherPerformance(filters, refreshKey);
  const { data: statusChart, loading: loadingStatus, error: errorStatus } = useStatusDistribution(filters, refreshKey);
  const { data: revenueChart, loading: loadingRevenue, error: errorRevenue } = useRevenueChart(filters, granularity, refreshKey, chartOffset);
  const { data: tableData, loading: loadingTable, error: errorTable } = useVoucherTable(
    filters, tablePage, tableSortBy, tableSortOrder, debouncedSearch, refreshKey,
  );

  // ── Refresh UX: sync error from hooks into page-level refreshError ────────────
  // Sync first error from any hook into the refreshError state.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const firstError = errorKPIs ?? errorPerf ?? errorStatus ?? errorRevenue ?? errorTable;
    if (firstError && refreshKey > 0) {
      setRefreshError(firstError);
    }
  }, [errorKPIs, errorPerf, errorStatus, errorRevenue, errorTable, refreshKey]);

  // ── Refresh UX: set isRefreshing=true when user initiates refresh ─────────────────
  // Only triggers when refreshKey changes from 0 to > 0 (not on initial mount).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (refreshKey > 0) {
      setIsRefreshing(true);
    }
  }, [refreshKey]);

  // ── Refresh UX: track when ALL hooks finish loading ───────────────────────────
  // isRefreshing flips back to false when ALL hooks finish loading after a refresh.
  useEffect(() => {
    if (!loadingKPIs && !loadingPerf && !loadingStatus && !loadingRevenue && !loadingTable) {
      if (refreshKey > 0) {
        setIsRefreshing(false);
      }
    }
  }, [loadingKPIs, loadingPerf, loadingStatus, loadingRevenue, loadingTable, refreshKey]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  // Preset change: applied immediately (Hôm nay / 7 ngày / ...).
  const handleDatePresetChange = (preset: DatePreset | "custom") => {
    setDatePreset(preset);
    // Switching away from custom clears the custom range; switching to
    // custom keeps any previously-applied range visible until the user
    // edits and clicks Áp dụng (handled by DateFilter's draft state).
    if (preset !== "custom") {
      setFromDate(undefined);
      setToDate(undefined);
    }
    setTablePage(1);
    setChartOffset(0);
  };

  // Custom range Apply: only here do we commit the From/To to the actual
  // filter used by the data hooks, which triggers the report API calls.
  const handleCustomApply = (from: string, to: string) => {
    setDatePreset("custom");
    setFromDate(from);
    setToDate(to);
    setTablePage(1);
    setChartOffset(0);
  };

  const handleGranularityChange = (g: RevenueGranularity) => {
    setGranularity(g);
    setChartOffset(0);
  };

  const handleChartPrev = () => setChartOffset((o) => o + 1);
  const handleChartNext = () => setChartOffset((o) => o - 1);

  const handleSortChange = (sortBy: VoucherSortBy, sortOrder: "asc" | "desc") => {
    setTableSortBy(sortBy);
    setTableSortOrder(sortOrder);
    setTablePage(1);
  };

  const handleSearchChange = (search: string) => {
    setTableSearch(search);
    setTablePage(1);
  };

  const handlePageChange = (page: number) => {
    setTablePage(page);
  };

  /**
   * "Làm mới" — KHÔNG reset filter, chỉ trigger re-fetch.
   *
   * Cơ chế: tăng refreshKey → useEffect trong tất cả 5 hooks re-run
   * với filter HIỆN TẠI → fetch fresh data.
   *
   * Reset table page về 1 để đảm bảo UX consistent.
   * Reset sort/search về default để tránh mismatch với new data.
   */
  const handleRefresh = () => {
    setTablePage(1);
    setTableSortBy("revenue");
    setTableSortOrder("desc");
    setTableSearch("");
    // Tăng key để trigger re-fetch ở TẤT CẢ hooks
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="partner-page" style={{ background: C.bgPage, minHeight: "100vh" }}>
      {/* ── Page Header (matching Vouchers/Branches) ─────────────────────── */}
      <div style={{
        background: "white",
        borderBottom: `1px solid ${C.border}`,
        padding: "24px 0",
      }}>
        <div className="partner-container partner-flex-between" style={{ flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{
              fontFamily: "Manrope, sans-serif",
              fontSize: 28, fontWeight: 800,
              color: C.text, marginBottom: 4,
            }}>
              Báo cáo & Thống kê
            </h1>
            <p style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 14, color: C.textSecondary,
            }}>
              Theo dõi hiệu quả kinh doanh voucher của bạn
            </p>
          </div>

          {/* Refresh button với loading/error UX */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Error toast: hiển thị khi refresh thất bại */}
            {refreshError && (
              <span style={{
                fontFamily: "Inter, sans-serif", fontSize: 12, color: "#EF4444",
                fontWeight: 500,
              }}>
                {refreshError}
              </span>
            )}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              title={isRefreshing ? "Đang làm mới..." : "Làm mới dữ liệu"}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "10px 16px",
                border: `1.5px solid ${isRefreshing ? C.primary : C.border}`,
                borderRadius: 10,
                background: isRefreshing ? "#E8F4FA" : "white",
                fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 600,
                color: isRefreshing ? C.primary : C.textSecondary,
                cursor: isRefreshing ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                opacity: isRefreshing ? 0.8 : 1,
              }}
              onMouseEnter={e => {
                if (!isRefreshing) {
                  const b = e.currentTarget;
                  b.style.borderColor = C.primary;
                  b.style.color = C.primary;
                }
              }}
              onMouseLeave={e => {
                if (!isRefreshing) {
                  const b = e.currentTarget;
                  b.style.borderColor = C.border;
                  b.style.color = C.textSecondary;
                }
              }}
            >
              {/* Spinning icon khi loading */}
              <svg
                width="16" height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{
                  animation: isRefreshing ? "spin 1s linear infinite" : "none",
                }}
              >
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
              {isRefreshing ? "Đang làm mới" : "Làm mới"}
            </button>
          </div>
        </div>

        {/* ── Toolbar: Date filter ──────────────────────────────────── */}
        <div style={{ marginTop: 20 }} className="partner-container">
          <DateFilter
            value={datePreset}
            fromDate={fromDate}
            toDate={toDate}
            onChange={handleDatePresetChange}
            onApply={handleCustomApply}
          />
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────────────── */}
      <div className="partner-container" style={{ paddingTop: 24, paddingBottom: 48 }}>

        {/* KPI Cards */}
        <div className="partner-grid-5" style={{ marginBottom: 24 }}>
          <KPICard
            title="Doanh thu" value={kpis?.revenue ?? 0}
            icon={revenueIcon} iconBg="#E8F4FA"
            loading={loadingKPIs} format="currency"
            color={C.primary} subtitle="Tổng doanh thu"
          />
          <KPICard
            title="Tổng voucher" value={kpis?.totalCatalog ?? kpis?.totalIssued ?? 0}
            icon={issuedIcon} iconBg="#EFF6FF"
            loading={loadingKPIs} format="number"
            color="#3B82F6" subtitle="Tất cả voucher trong catalog"
          />
          <KPICard
            title="Đang bán" value={kpis?.totalLive ?? 0}
            icon={liveIcon} iconBg="#ECFDF5"
            loading={loadingKPIs} format="number"
            color={C.success} subtitle="Voucher đang live (Approved + Visible)"
          />
          <KPICard
            title="Đã bán" value={kpis?.totalSold ?? 0}
            icon={soldIcon} iconBg="#ECFDF5"
            loading={loadingKPIs} format="number"
            color={C.success} subtitle="Số lượng bán thành công"
          />
          <KPICard
            title="Tỷ lệ sử dụng" value={kpis?.usageRate ?? 0}
            icon={usageIcon} iconBg="#FFFBEB"
            loading={loadingKPIs} format="percent"
            color={C.warning} subtitle="Đã dùng / Đã bán"
          />
        </div>

        {/* Charts Row: Revenue + Status */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
          gap: 16, marginBottom: 16,
        }}>
          {/* Revenue Chart with inline granularity */}
          <RevenueChart
            data={revenueChart ?? undefined}
            loading={loadingRevenue}
            offset={chartOffset}
            onPrev={handleChartPrev}
            onNext={handleChartNext}
            canGoNext={chartOffset > -12}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{
                fontFamily: "Inter, sans-serif", fontSize: 12,
                color: C.textMuted,
              }}>
                Hiển thị theo:
              </span>
              {GRANULARITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleGranularityChange(opt.value)}
                  style={{
                    padding: "4px 12px", borderRadius: 6,
                    border: granularity === opt.value
                      ? `1.5px solid ${C.primary}` : `1px solid ${C.border}`,
                    background: granularity === opt.value ? "#E8F4FA" : "white",
                    color: granularity === opt.value ? C.primary : C.textSecondary,
                    fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </RevenueChart>

          <StatusDistChart data={statusChart ?? undefined} loading={loadingStatus} />
        </div>

        {/* Voucher Performance Chart */}
        <div style={{ marginBottom: 24 }}>
          <VoucherPerfChart data={perfChart ?? undefined} loading={loadingPerf} />
        </div>

        {/* Voucher Table */}
        <VoucherReportTable
          data={tableData?.data}
          pagination={tableData?.pagination}
          loading={loadingTable}
          sortBy={tableSortBy}
          sortOrder={tableSortOrder}
          search={tableSearch}
          onSortChange={handleSortChange}
          onPageChange={handlePageChange}
          onSearchChange={handleSearchChange}
        />
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
