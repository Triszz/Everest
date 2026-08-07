/**
 * Redemption Service
 * ============================================================
 * Validate, Confirm và Get-detail voucher
 */

import { apiClient } from "../api/client";
import type {
  ValidateResponse,
  ConfirmResponse,
  RedemptionStatusCode,
} from "../types";

/**
 * Validate voucher - kiểm tra voucher có thể xác nhận hay không
 */
export async function validateVoucher(
  voucherCode: string,
): Promise<ValidateResponse> {
  try {
    const response = await apiClient.post<ValidateResponse>(
      "/partner/redemption/validate",
      { voucherCode },
    );
    return response.data;
  } catch (error: unknown) {
    const apiError = error as {
      response?: { data?: ValidateResponse };
      message?: string;
    };
    const errorData = apiError.response?.data;

    if (errorData) {
      return errorData;
    }

    // Network error
    return {
      success: false,
      status: "UNKNOWN_ERROR" as RedemptionStatusCode,
      canConfirm: false,
      error: {
        code: "NETWORK_ERROR",
        message: "Không thể kết nối server. Vui lòng kiểm tra mạng.",
      },
    };
  }
}

/**
 * Lấy chi tiết voucher cho mọi trạng thái (kể cả Used).
 * Endpoint: GET /partner/redemption/voucher/:voucherCode
 * Dùng cho navigation từ History — tránh bị validate trả về ALREADY_USED.
 */
export async function getVoucherDetail(
  voucherCode: string,
): Promise<ValidateResponse> {
  try {
    const response = await apiClient.get<ValidateResponse>(
      `/partner/redemption/voucher/${encodeURIComponent(voucherCode)}`,
    );
    return response.data;
  } catch (error: unknown) {
    const apiError = error as {
      response?: { data?: ValidateResponse };
      message?: string;
    };
    const errorData = apiError.response?.data;

    if (errorData) {
      return errorData;
    }

    return {
      success: false,
      status: "UNKNOWN_ERROR" as RedemptionStatusCode,
      canConfirm: false,
      error: {
        code: "NETWORK_ERROR",
        message: "Không thể kết nối server. Vui lòng kiểm tra mạng.",
      },
    };
  }
}

/**
 * Confirm voucher - xác nhận voucher đã được sử dụng
 */
export async function confirmVoucher(
  voucherCode: string,
  selectedBranchId?: number,
): Promise<ConfirmResponse> {
  try {
    const response = await apiClient.post<ConfirmResponse>(
      "/partner/redemption/confirm",
      { voucherCode, selectedBranchId },
    );
    return response.data;
  } catch (error: unknown) {
    const apiError = error as {
      response?: { data?: ConfirmResponse };
      message?: string;
    };
    const errorData = apiError.response?.data;

    if (errorData) {
      return errorData;
    }

    // Network error
    return {
      success: false,
      status: "UNKNOWN_ERROR" as RedemptionStatusCode,
      canConfirm: false,
      error: {
        code: "NETWORK_ERROR",
        message: "Không thể kết nối server. Vui lòng kiểm tra mạng.",
      },
    };
  }
}
