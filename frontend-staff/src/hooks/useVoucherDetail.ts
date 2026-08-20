/**
 * useVoucherDetail Hook
 * ============================================================
 * Hook lấy voucher detail từ React Query cache hoặc API
 *
 * Cơ chế:
 * 1. Check cache trước (nếu đã validate trước đó)
 * 2. Nếu cache có → return cache
 * 3. Nếu cache không có → call API và cache
 *
 * Hai mode:
 * - mode='validate' (mặc định): gọi POST /partner/redemption/validate
 *   → Dùng cho flow scan/manual: voucher phải Unused.
 * - mode='detail': gọi GET /partner/redemption/voucher/:code
 *   → Dùng cho flow history: voucher có thể ở mọi trạng thái.
 */

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import {
  validateVoucher,
  getVoucherDetail,
} from "../services/redemption.service";
import type { ValidatedVoucherData, ValidateResponse } from "../types";

// Cache key pattern: ["voucher-detail", voucherCode, mode]
const voucherKeys = {
  detail: (voucherCode: string, mode: DetailMode) =>
    ["voucher-detail", voucherCode, mode] as const,
};

type DetailMode = "validate" | "detail";

interface UseVoucherDetailParams {
  voucherCode: string;
  initialData?: ValidatedVoucherData;
  enabled?: boolean;
  mode?: DetailMode;
}

export function useVoucherDetail({
  voucherCode,
  initialData,
  enabled = true,
  mode = "validate",
}: UseVoucherDetailParams): UseQueryResult<ValidateResponse, Error> & {
  voucherData: ValidatedVoucherData | null;
} {
  const query = useQuery<ValidateResponse, Error>({
    queryKey: voucherKeys.detail(voucherCode, mode),
    queryFn: async () =>
      mode === "detail"
        ? getVoucherDetail(voucherCode)
        : validateVoucher(voucherCode),
    enabled: enabled && !!voucherCode,
    staleTime: 1000 * 60 * 5, // 5 minutes - cache for navigation
    gcTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: false, // Don't refetch when window focuses (voucher data is immutable until used)
    refetchOnReconnect: true, // Refetch on reconnect (handle network issues)
    retry: 2, // Retry failed requests 2 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    initialData: initialData
      ? {
          success: true,
          status: "VALID",
          canConfirm: true,
          data: initialData,
          message: "From cache",
        }
      : undefined,
  });

  // Extract voucherData from response
  const voucherData =
    query.data?.success && query.data.status === "VALID"
      ? query.data.data
      : null;

  return {
    ...query,
    voucherData,
  };
}

/**
 * Invalidate voucher detail cache
 */
export function invalidateVoucherDetail(
  queryClient: {
    invalidateQueries: (config: { queryKey: readonly unknown[] }) => void;
  },
  voucherCode: string,
  mode: DetailMode = "validate",
) {
  queryClient.invalidateQueries({
    queryKey: voucherKeys.detail(voucherCode, mode),
  });
}
