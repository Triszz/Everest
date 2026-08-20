/**
 * Redemption Hooks - React Query hooks cho voucher redemption
 */

import { useMutation } from "@tanstack/react-query";
import { validateVoucher, confirmVoucher } from "../services/redemption.service";
import type { ValidateResponse, ConfirmResponse } from "../types";

// Mutation hook for validate voucher
export function useValidateVoucher() {
  return useMutation<
    ValidateResponse,
    Error,
    string
  >({
    mutationFn: (voucherCode: string) => validateVoucher(voucherCode),
  });
}

// Mutation hook for confirm voucher
export function useConfirmVoucher() {
  return useMutation<
    ConfirmResponse,
    Error,
    { voucherCode: string; selectedBranchId?: number }
  >({
    mutationFn: ({ voucherCode, selectedBranchId }) =>
      confirmVoucher(voucherCode, selectedBranchId),
  });
}
