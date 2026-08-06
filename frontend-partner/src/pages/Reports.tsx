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

// ── Page ──────────────────────────────────────────────────────────────────────
export function ReportsPage() {
  // ── Date filter state ─────────────────────────────────────────────────────
  const [datePreset, setDatePreset] = useState<DatePreset | "custom">("last30days");
  const [fromDate, setFromDate] = useState<string>();
  const [toDate, setToDate] = useState<string>();
  const [granularity, setGranularity] = useState<RevenueGranularity>("day");

  // ── Table state ───────────────────────────────────────────────────────────
  const [tablePage, setTablePage] = useState(1);
  const [tableSortBy, setTableSortBy] = useState<VoucherSortBy>("revenue");
  const [tableSortOrder, setTableSortOrder] = useState<"asc" | "desc">("desc");
  const [tableSearch, setTableSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

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
  const { data: kpis, loading: loadingKPIs } = useReportKPIs(filters);
  const { data: perfChart, loading: loadingPerf } = useVoucherPerformance(filters);
  const { data: statusChart, loading: loadingStatus } = useStatusDistribution(filters);
  const { data: revenueChart, loading: loadingRevenue } = useRevenueChart(filters, granularity);
  const { data: tableData, loading: loadingTable } = useVoucherTable(
    filters, tablePage, tableSortBy, tableSortOrder, debouncedSearch,
  );

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
  };

  // Custom range Apply: only here do we commit the From/To to the actual
  // filter used by the data hooks, which triggers the report API calls.
  const handleCustomApply = (from: string, to: string) => {
    setDatePreset("custom");
    setFromDate(from);
    setToDate(to);
    setTablePage(1);
  };

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

  const handleRefresh = () => {
    setDatePreset("last30days");
    setFromDate(undefined);
    setToDate(undefined);
    setGranularity("day");
    setTablePage(1);
    setTableSortBy("revenue");
    setTableSortOrder("desc");
    setTableSearch("");
  };

  return (
    <div style={{ background: C.bgPage, minHeight: "100vh" }}>
      {/* ── Page Header (matching Vouchers/Branches) ─────────────────────── */}
      <div style={{
        background: "white",
        borderBottom: `1px solid ${C.border}`,
        padding: "24px 0",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexWrap: "wrap", gap: 16,
          }}>
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

            <button
              onClick={handleRefresh}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "10px 16px",
                border: `1.5px solid ${C.border}`, borderRadius: 10,
                background: "white",
                fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 600,
                color: C.textSecondary, cursor: "pointer", transition: "all 0.2s",
              }}
              onMouseEnter={e => {
                const b = e.currentTarget;
                b.style.borderColor = C.primary;
                b.style.color = C.primary;
              }}
              onMouseLeave={e => {
                const b = e.currentTarget;
                b.style.borderColor = C.border;
                b.style.color = C.textSecondary;
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
              Làm mới
            </button>
          </div>

          {/* ── Toolbar: Date filter ──────────────────────────────────── */}
          <div style={{ marginTop: 20 }}>
            <DateFilter
              value={datePreset}
              fromDate={fromDate}
              toDate={toDate}
              onChange={handleDatePresetChange}
              onApply={handleCustomApply}
            />
          </div>
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 24px 48px" }}>

        {/* KPI Cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 12,
          marginBottom: 24,
        }}>
          <KPICard
            title="Doanh thu" value={kpis?.revenue ?? 0}
            icon={revenueIcon} iconBg="#E8F4FA"
            loading={loadingKPIs} format="currency"
            color={C.primary} subtitle="Tổng doanh thu"
          />
          <KPICard
            title="Đã phát hành" value={kpis?.totalIssued ?? 0}
            icon={issuedIcon} iconBg="#EFF6FF"
            loading={loadingKPIs} format="number"
            color="#3B82F6" subtitle="Tổng voucher"
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
          <RevenueChart data={revenueChart ?? undefined} loading={loadingRevenue}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
                  onClick={() => setGranularity(opt.value)}
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
