/**
 * Issued Voucher Controller
 * --------------------------------------------------------------
 * Parse query/params qua shared helpers, gọi issuedVouchersService.
 */
import { Request, Response } from "express";
import { issuedVouchersService } from "./issued-vouchers.service";
import { asyncHandler } from "../../../middlewares/asyncHandler";
import { getCustomerId, parseOrThrow, parseParams } from "../shared/helpers";
import { issuedVouchersQuery, issuedVoucherIdParam } from "./issued-vouchers.schemas";

export const issuedVouchersController = {
  /**
   * GET /api/customer/issued-vouchers?status=Unused&page=1&pageSize=20
   * Danh sách voucher đã mua (có filter status + phân trang).
   */
  list: asyncHandler(async (req: Request, res: Response) => {
    const customerId = getCustomerId(req);
    const query = parseOrThrow(issuedVouchersQuery, req.query);
    const result = await issuedVouchersService.listIssuedVouchers(customerId, query);
    res.json({
      success: true,
      data: result.vouchers,
      pagination: result.pagination,
    });
  }),

  /**
   * GET /api/customer/issued-vouchers/:issuedVoucherId
   * Chi tiết 1 voucher đã mua.
   */
  get: asyncHandler(async (req: Request, res: Response) => {
    const customerId = getCustomerId(req);
    const { issuedVoucherId } = parseParams(req, issuedVoucherIdParam);
    const voucher = await issuedVouchersService.getIssuedVoucher(
      customerId,
      issuedVoucherId,
    );
    res.json({ success: true, data: voucher });
  }),
};