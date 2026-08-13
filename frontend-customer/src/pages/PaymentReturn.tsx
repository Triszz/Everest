/**
 * PaymentReturn page
 * ------------------------------------------------------------------
 * Trang xử lý khi user quay về từ VNPAY sau khi thanh toán.
 *
 * Flow:
 *  1. VNPAY redirect user về /payment/return?vnp_TxnRef=...&vnp_ResponseCode=...
 *  2. Page này verify với backend (check signature).
 *  3. Nếu isSuccess=true → chờ 3s rồi chuyển sang /checkout/success.
 *  4. Nếu thất bại → hiển thị thông báo + nút "Thử lại".
 *
 * Lưu ý: Việc cập nhật đơn hàng thực sự do backend IPN webhook xử lý.
 * Page này chỉ để hiển thị — đôi khi IPN chưa kịp xử lý xong khi user quay về.
 */
import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { paymentApi } from '../services';

export function PaymentReturn() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [paymentInfo, setPaymentInfo] = useState<{
    isSuccess: boolean;
    isVerified: boolean;
    orderId: number;
    message: string;
  } | null>(null);

  useEffect(() => {
    const verify = async () => {
      try {
        // Convert URLSearchParams → plain object (dùng cho fallback)
        const params: Record<string, string> = {};
        searchParams.forEach((value, key) => {
          params[key] = value;
        });

        // Truyền raw query string gốc từ URL để tránh double-encode vnp_SecureHash
        const result = await paymentApi.handleReturn(params, window.location.search);
        setPaymentInfo(result);
      } catch (err: any) {
        setPaymentInfo({
          isSuccess: false,
          isVerified: false,
          orderId: Number(searchParams.get('vnp_TxnRef')) || 0,
          message: err.message || 'Đã xảy ra lỗi khi xác thực thanh toán.',
        });
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [searchParams]);

  // Tự động chuyển sang trang success sau 3s nếu thành công
  useEffect(() => {
    if (paymentInfo?.isSuccess) {
      const timer = setTimeout(() => {
        navigate(`/checkout/success?orderId=${paymentInfo.orderId}`);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [paymentInfo, navigate]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <Loader2 size={48} style={{ color: '#0E76A8', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: '#64748B', fontFamily: 'Inter, sans-serif', fontSize: 14 }}>
          Đang xác thực kết quả thanh toán...
        </p>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!paymentInfo) return null;

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', padding: '60px 24px' }}>
      <div style={{ maxWidth: 480, margin: '0 auto', background: 'white', borderRadius: 20, padding: 40, boxShadow: '0 4px 16px rgba(0,0,0,0.06)', textAlign: 'center' }}>
        {paymentInfo.isSuccess ? (
          <>
            <div style={{ width: 80, height: 80, margin: '0 auto 20px', background: '#ECFDF5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={48} color="#10B981" />
            </div>
            <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 24, fontWeight: 800, color: '#1E293B', marginBottom: 12 }}>
              Thanh toán thành công!
            </h1>
            <p style={{ color: '#64748B', fontSize: 14, marginBottom: 8 }}>
              Mã đơn hàng: <strong style={{ color: '#1E293B' }}>#{paymentInfo.orderId}</strong>
            </p>
            <p style={{ color: '#94A3B8', fontSize: 13, marginBottom: 24 }}>
              {paymentInfo.message}
            </p>
            <p style={{ color: '#0E76A8', fontSize: 13, fontStyle: 'italic' }}>
              Đang chuyển đến trang chi tiết trong giây lát...
            </p>
          </>
        ) : (
          <>
            <div style={{ width: 80, height: 80, margin: '0 auto 20px', background: '#FEF2F2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <XCircle size={48} color="#EF4444" />
            </div>
            <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 24, fontWeight: 800, color: '#1E293B', marginBottom: 12 }}>
              Thanh toán không thành công
            </h1>
            <p style={{ color: '#64748B', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
              {paymentInfo.message}
            </p>
            {paymentInfo.orderId > 0 && (
              <p style={{ color: '#94A3B8', fontSize: 12, marginBottom: 24 }}>
                Mã đơn hàng: #{paymentInfo.orderId}
              </p>
            )}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                onClick={() => navigate(`/checkout?retry=${paymentInfo.orderId}`)}
                style={{ padding: '12px 24px', background: '#0E76A8', color: 'white', border: 'none', borderRadius: 10, fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
              >
                Thử lại
              </button>
              <Link
                to="/"
                style={{ padding: '12px 24px', background: 'white', color: '#64748B', border: '1.5px solid #E2E8F0', borderRadius: 10, fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}
              >
                Về trang chủ
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}