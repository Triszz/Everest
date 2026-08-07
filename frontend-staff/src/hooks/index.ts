/**
 * Hooks Index
 */

export { useAuth, useLogin, useLogout, useIsAuthenticated } from "./useAuth";
export { useValidateVoucher, useConfirmVoucher } from "./useRedemption";
export { useDashboardStats, useTodaySummary, useRecentActivity, useRefreshDashboard } from "./useDashboard";
export { useCameraPermission, type PermissionStatus } from "./useCameraPermission";
export { useVoucherDetail, invalidateVoucherDetail } from "./useVoucherDetail";
export { useHistoryInfinite, historyKeys } from "./useHistory";
