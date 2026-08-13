import { asyncHandler } from "../../../middlewares/asyncHandler";
import { paymentService } from "./payment.service";
import { createPaymentSchema } from "./payment.schemas";
import { z } from "zod";

export const paymentController = {
  /**
   * POST /api/customer/payment/create
   * Tạo URL thanh toán VNPAY cho đơn hàng.
   * Body: { orderId: number }
   */
  createPaymentUrl: asyncHandler(async (req, res) => {
    const { orderId } = createPaymentSchema.parse(req.body);
    const customerId = req.user!.userId;

    const result = await paymentService.createPaymentUrl(customerId, orderId, req);

    res.json({ success: true, data: result });
  }),

  /**
   * GET /api/customer/payment/return
   * Xử lý khi user quay lại từ VNPAY (trình duyệt).
   * Chỉ trả thông tin hiển thị — không xử lý nghiệp vụ.
   */
  returnUrl: asyncHandler(async (req, res) => {
    const query = req.query as Record<string, string>;
    const result = paymentService.handleReturn(query);
    res.json(result);
  }),

  /**
   * POST /api/customer/payment/ipn
   * Webhook — VNPAY gọi server-to-server khi thanh toán xong.
   * Đây là nguồn xác thực chính thức.
   */
  ipn: asyncHandler(async (req, res) => {
    const query = req.query as Record<string, string>;
    const result = await paymentService.handleIpn(query);

    // VNPAY yêu cầu response có dạng text/plain
    res.status(200).type("text/plain").send(`RspCode=${result.code}&Message=${result.message}`);
  }),
};
