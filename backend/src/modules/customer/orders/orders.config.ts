/**
 * Orders Config
 * --------------------------------------------------------------
 * Cấu hình liên quan đến vòng đời đơn hàng.
 */

/**
 * Thời gian (phút) mà đơn ở trạng thái Pending được phép tồn tại
 * trước khi auto-cancel.
 *
 * Lý do cần: khi user tạo order Pending mà chưa thanh toán, voucher
 * vẫn available cho người khác mua (vì createOrder KHÔNG trừ stock).
 * Sau PENDING_TTL_MIN phút, đơn Pending sẽ bị auto-cancel để tránh
 * "treo" vĩnh viễn trong DB.
 */
export const PENDING_TTL_MIN = 15;

/**
 * Cron interval (phút) cho auto-cancel job quét các order Pending hết hạn.
 */
export const EXPIRE_SWEEP_INTERVAL_MIN = 5;