import { Request, Response } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { AppError } from "../../middlewares/errorHandler";
import {
  kpiFiltersSchema,
  revenueChartFiltersSchema,
  voucherPerfFiltersSchema,
  voucherReportFiltersSchema,
  reportFiltersSchema,
} from "./reports.schemas";
import * as reportsService from "./reports.service";

const requirePartnerId = (req: Request): number => {
  const partnerId = req.user?.partnerId;
  if (!partnerId) {
    throw new AppError("Không tìm thấy thông tin đối tác", 403, "FORBIDDEN");
  }
  return partnerId;
};

const normalizeQuery = (raw: Record<string, unknown>): Record<string, unknown> => {
  const out: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(raw)) {
    if (val === "" || val === null || val === undefined) {
      out[key] = undefined; // treat empty string / null as absent
    } else {
      out[key] = val;
    }
  }
  return out;
};

const parseQuery = (schema: any, raw: unknown) => {
  const normalized = normalizeQuery(raw as Record<string, unknown>);
  const result = schema.safeParse(normalized);
  if (!result.success) {
    const msgs = result.error.issues.map((i: any) => i.message).join("; ");
    throw new AppError(msgs, 400, "VALIDATION_ERROR");
  }
  return result.data;
};

export const reportsController = {
  // ── 1. KPIs ──────────────────────────────────────────────────────────────────
  getKPIs: asyncHandler(async (req: Request, res: Response) => {
    const partnerId = requirePartnerId(req);
    const params = parseQuery(kpiFiltersSchema, req.query);
    const data = await reportsService.getPartnerKPIs(partnerId, params);
    res.json({ success: true, data });
  }),

  // ── 2. Revenue chart ──────────────────────────────────────────────────────────
  getRevenueChart: asyncHandler(async (req: Request, res: Response) => {
    const partnerId = requirePartnerId(req);
    const params = parseQuery(revenueChartFiltersSchema, req.query);
    const data = await reportsService.getRevenueChart(partnerId, params);
    res.json({ success: true, data });
  }),

  // ── 3. Voucher performance (top sold) ───────────────────────────────────────
  getVoucherPerformance: asyncHandler(async (req: Request, res: Response) => {
    const partnerId = requirePartnerId(req);
    const params = parseQuery(voucherPerfFiltersSchema, req.query);
    const data = await reportsService.getVoucherPerformance(partnerId, params);
    res.json({ success: true, data });
  }),

  // ── 4. Voucher status distribution ──────────────────────────────────────────
  getVoucherStatusDistribution: asyncHandler(async (req: Request, res: Response) => {
    const partnerId = requirePartnerId(req);
    const params = parseQuery(reportFiltersSchema, req.query);
    const data = await reportsService.getVoucherStatusDistribution(partnerId, params);
    res.json({ success: true, data });
  }),

  // ── 5. Voucher detail table ─────────────────────────────────────────────────
  getVoucherReportTable: asyncHandler(async (req: Request, res: Response) => {
    const partnerId = requirePartnerId(req);
    const params = parseQuery(voucherReportFiltersSchema, req.query);
    const data = await reportsService.getVoucherReportTable(partnerId, params);
    res.json({ success: true, data });
  }),
};
