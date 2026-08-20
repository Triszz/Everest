import { get } from "./api-client";
import type {
  AuditLogFilters,
  AuditLogsResponse,
} from "../types/audit";

const buildQuery = (filters: AuditLogFilters): string => {
  const params = new URLSearchParams();
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  if (filters.action) params.set("action", filters.action);
  if (filters.actorId) params.set("actorId", filters.actorId);
  if (filters.actorType) params.set("actorType", filters.actorType);
  if (filters.targetType) params.set("targetType", filters.targetType);
  if (filters.targetId) params.set("targetId", filters.targetId);
  if (filters.fromDate) params.set("fromDate", filters.fromDate);
  if (filters.toDate) params.set("toDate", filters.toDate);
  const q = params.toString();
  return q ? `?${q}` : "";
};

export const auditService = {
  list(filters: AuditLogFilters = {}) {
    return get<AuditLogsResponse>(`/api/admin/audit-logs${buildQuery(filters)}`, {
      auth: true,
    });
  },
};