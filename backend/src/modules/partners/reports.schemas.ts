import { z } from "zod";

// ── Date range presets ─────────────────────────────────────────────────────────
export const datePresetSchema = z.enum([
  "today",
  "last7days",
  "last30days",
  "last90days",
  "thisYear",
  "custom",
]);

// ── Revenue chart group-by granularity ────────────────────────────────────────
export const revenueGranularitySchema = z.enum(["day", "week", "month"]);

// ── Shared filter schema — base (no refinement yet) ──────────────────────────
// Note: fromDate / toDate are YYYY-MM-DD strings (HTML <input type="date">),
// not full ISO datetimes. Use .date() to validate.
const baseFilters = z.object({
  fromDate: z.string().date().optional(),
  toDate: z.string().date().optional(),
  datePreset: datePresetSchema.optional(),
  voucherId: z.coerce.number().int().positive().optional().nullable().optional(),
  branchId: z.coerce.number().int().positive().optional().nullable().optional(),
});

// Refined version used by all report endpoints
export const reportFiltersSchema = baseFilters.refine(
  (data) => {
    const hasFromDate = !!data.fromDate;
    const hasToDate = !!data.toDate;
    const hasPreset = !!data.datePreset;
    const isCustomPreset = data.datePreset === "custom";

    // ✔ Only datePreset (no custom dates) → valid
    if (hasPreset && !hasFromDate && !hasToDate) return true;

    // ✔ Only fromDate + toDate (no preset) → valid
    if (hasFromDate && hasToDate && !hasPreset) return true;

    // ✔ datePreset = "custom" with both dates → valid
    if (isCustomPreset && hasFromDate && hasToDate) return true;

    // ❌ Mixed: preset (non-custom) with custom dates
    if (hasPreset && !isCustomPreset && (hasFromDate || hasToDate)) return false;

    // ❌ One date only
    if (hasFromDate !== hasToDate) return false;

    return true;
  },
  {
    message: "Chỉ chọn một trong hai: ngày cụ thể hoặc khoảng thời gian",
  },
);

// ── KPIs endpoint: same filters as base ───────────────────────────────────────
// No extra fields; voucherId/branchId are already nullable in baseFilters
export const kpiFiltersSchema = reportFiltersSchema.safeExtend({});

// ── Revenue chart params ───────────────────────────────────────────────────────
// `offset` shifts the date window back/forward by N units (weeks or months)
// depending on granularity. Positive = past, negative = future.
//   e.g. offset=1 with granularity="week" → previous week.
//        offset=2 with granularity="month" → 2 months ago.
export const revenueChartFiltersSchema = reportFiltersSchema.safeExtend({
  granularity: revenueGranularitySchema.default("day"),
  offset: z.coerce.number().int().min(-52).max(520).default(0),
});

// ── Voucher performance chart ─────────────────────────────────────────────────
export const voucherPerfFiltersSchema = reportFiltersSchema.safeExtend({
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

// ── Voucher detail table ───────────────────────────────────────────────────────
export const voucherReportFiltersSchema = reportFiltersSchema.safeExtend({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z
    .enum(["title", "issued", "totalQuantity", "isLive", "sold", "used", "soldRate", "revenue", "usageRate", "status"])
    .default("revenue"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  search: z.string().max(200).optional(),
});
