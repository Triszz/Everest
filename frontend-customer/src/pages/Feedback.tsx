import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageSquareWarning, Loader2, CheckCircle2, Send, ChevronRight } from 'lucide-react';
import { feedbackApi } from '../services/api';

// ── Feedback / Khiếu nại Page ────────────────────────────────────────────────
// Flow: Chọn loại → điền thông tin → gửi → success state
// API: feedbackApi.submit(data) — wire khi backend sẵn sàng
//       endpoint: POST /api/feedback

type FeedbackType = 'general' | 'order' | 'voucher' | 'complaint';

interface FormData {
  type: FeedbackType;
  subject: string;
  orderId: string;
  voucherCode: string;
  message: string;
  email: string;
  phone: string;
}

const FEEDBACK_TYPES: { key: FeedbackType; label: string; icon: string; description: string; color: string; bg: string }[] = [
  {
    key: 'general',
    label: 'Phản hồi chung',
    icon: '💬',
    description: 'Góp ý về dịch vụ, giao diện, tính năng',
    color: '#0E76A8',
    bg: '#E8F4FA',
  },
  {
    key: 'order',
    label: 'Vấn đề đơn hàng',
    icon: '📦',
    description: 'Lỗi thanh toán, chưa nhận được voucher',
    color: '#7C3AED',
    bg: '#F5F3FF',
  },
  {
    key: 'voucher',
    label: 'Sao chép mã voucher',
    icon: '🎫',
    description: 'Mã không hoạt động, thiếu thông tin',
    color: '#059669',
    bg: '#ECFDF5',
  },
  {
    key: 'complaint',
    label: 'Khiếu nại',
    icon: '⚠️',
    description: 'Phản ánh đối tác, vi phạm cam kết',
    color: '#DC2626',
    bg: '#FEF2F2',
  },
];

function formatCharCount(current: number, max: number) {
  if (current === 0) return `${max} ký tự tối đa`;
  return `${current} / ${max}`;
}

export function FeedbackPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormData>({
    type: 'general',
    subject: '',
    orderId: '',
    voucherCode: '',
    message: '',
    email: '',
    phone: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedId, setSubmittedId] = useState('');

  const update = (field: keyof FormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const errs: Partial<Record<keyof FormData, string>> = {};
    if (!form.subject.trim()) errs.subject = 'Vui lòng nhập tiêu đề.';
    if (form.subject.trim().length < 10) errs.subject = 'Tiêu đề phải có ít nhất 10 ký tự.';
    if (!form.message.trim()) errs.message = 'Vui lòng nhập nội dung.';
    if (form.message.trim().length < 20) errs.message = 'Nội dung phải có ít nhất 20 ký tự.';
    if (!form.email.trim()) errs.email = 'Vui lòng nhập email.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Email không hợp lệ.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    try {
      const res = await feedbackApi.submit({
        type: form.type,
        subject: form.subject,
        orderId: form.orderId || undefined,
        voucherCode: form.voucherCode || undefined,
        message: form.message,
        email: form.email,
        phone: form.phone || undefined,
      });

      if (res.success && res.data?.ticketId) {
        setSubmittedId(res.data.ticketId);
        setSubmitted(true);
      } else {
        throw new Error(res.error?.message || 'Gửi phản hồi thất bại.');
      }
    } catch (err: any) {
      alert(err.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // ── Success State ─────────────────────────────────────────────────────────

  if (submitted) {
    return (
      <div style={{ background: '#F8FAFC', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ background: 'white', borderRadius: 24, padding: '48px 40px', maxWidth: 520, width: '100%', textAlign: 'center', boxShadow: '0 8px 32px rgba(14,118,168,0.1)' }}>
          {/* Icon */}
          <div style={{ width: 88, height: 88, background: '#ECFDF5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', animation: 'scale-in 0.4s ease-out' }}>
            <CheckCircle2 size={44} style={{ color: '#10B981' }} />
          </div>

          <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 24, fontWeight: 800, color: '#1E293B', marginBottom: 12 }}>
            Đã gửi thành công!
          </h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, color: '#64748B', lineHeight: 1.6, marginBottom: 16 }}>
            Cảm ơn bạn đã phản hồi. Chúng tôi sẽ xử lý và phản hồi trong vòng <strong style={{ color: '#0E76A8' }}>24 giờ</strong>.
          </p>

          {/* Ticket ID */}
          <div style={{ background: '#F0F9FF', border: '1.5px solid #BAE6FD', borderRadius: 12, padding: '12px 20px', marginBottom: 24 }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#64748B', marginBottom: 4 }}>Mã phản hồi của bạn</p>
            <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 20, fontWeight: 800, color: '#0E76A8', letterSpacing: 2 }}>
              {submittedId}
            </p>
          </div>

          {/* Note */}
          <div style={{ background: '#F8FAFC', borderRadius: 12, padding: '12px 16px', marginBottom: 28, textAlign: 'left' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#64748B', lineHeight: 1.6, margin: 0 }}>
              📧 Chúng tôi sẽ gửi thông báo đến email <strong style={{ color: '#1E293B' }}>{form.email}</strong> khi có cập nhật.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              onClick={() => { setSubmitted(false); setForm({ type: 'general', subject: '', orderId: '', voucherCode: '', message: '', email: '', phone: '' }); }}
              style={{ padding: '13px', background: '#0E76A8', color: 'white', border: 'none', borderRadius: 12, fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#0A5C87')}
              onMouseLeave={e => (e.currentTarget.style.background = '#0E76A8')}
            >
              Gửi phản hồi khác
            </button>
            <Link
              to="/"
              style={{ display: 'block', padding: '13px', background: 'white', color: '#0E76A8', textDecoration: 'none', borderRadius: 12, fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 700, border: '1.5px solid #E2E8F0', textAlign: 'center', transition: 'border-color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#0E76A8')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#E2E8F0')}
            >
              Về trang chủ
            </Link>
          </div>
        </div>

        <style>{`
          @keyframes scale-in { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        `}</style>
      </div>
    );
  }

  // ── Form State ───────────────────────────────────────────────────────────

  const selectedType = FEEDBACK_TYPES.find(t => t.key === form.type)!;

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh' }}>
      {/* Breadcrumb */}
      <div style={{ background: 'white', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '12px 24px' }}>
          <span style={{ fontSize: 13, color: '#64748B' }}>
            <Link to="/" style={{ color: '#0E76A8', textDecoration: 'none' }}>Trang chủ</Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <span style={{ color: '#1E293B', fontWeight: 600 }}>Gửi phản hồi & Khiếu nại</span>
          </span>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>
        {/* Page header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 26, fontWeight: 800, color: '#1E293B', marginBottom: 8 }}>
            Gửi phản hồi & Khiếu nại
          </h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, color: '#64748B' }}>
            Chúng tôi luôn lắng nghe ý kiến của bạn. Phản hồi trong vòng <strong style={{ color: '#0E76A8' }}>24 giờ</strong>.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Loại phản hồi */}
          <div style={{ background: 'white', borderRadius: 20, padding: 28, marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 17, fontWeight: 800, color: '#1E293B', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 28, height: 28, borderRadius: '50%', background: '#0E76A8', color: 'white', fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>1</span>
              Chọn loại phản hồi
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 12 }}>
              {FEEDBACK_TYPES.map(t => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => update('type', t.key)}
                  style={{
                    padding: '16px 14px',
                    background: form.type === t.key ? t.bg : '#F8FAFC',
                    border: `2px solid ${form.type === t.key ? t.color : '#E2E8F0'}`,
                    borderRadius: 14,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{t.icon}</div>
                  <div style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 700, color: form.type === t.key ? t.color : '#1E293B', marginBottom: 4 }}>
                    {t.label}
                  </div>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#64748B', lineHeight: 1.4 }}>
                    {t.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Thông tin */}
          <div style={{ background: 'white', borderRadius: 20, padding: 28, marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 17, fontWeight: 800, color: '#1E293B', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 28, height: 28, borderRadius: '50%', background: '#0E76A8', color: 'white', fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>2</span>
              Thông tin chi tiết
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Tiêu đề */}
              <div>
                <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: '#1E293B', marginBottom: 8 }}>
                  Tiêu đề <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={e => update('subject', e.target.value)}
                  placeholder="Mô tả ngắn gọn vấn đề của bạn"
                  maxLength={100}
                  style={{ width: '100%', padding: '12px 16px', border: `1.5px solid ${errors.subject ? '#EF4444' : '#E2E8F0'}`, borderRadius: 12, fontSize: 14, fontFamily: 'Inter, sans-serif', color: '#1E293B', background: '#F8FAFC', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#0E76A8')}
                  onBlur={e => (e.currentTarget.style.borderColor = errors.subject ? '#EF4444' : '#E2E8F0')}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  {errors.subject ? <span style={{ fontSize: 12, color: '#EF4444', fontFamily: 'Inter, sans-serif' }}>{errors.subject}</span>
                    : <span />}
                  <span style={{ fontSize: 11, color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>{formatCharCount(form.subject.length, 100)}</span>
                </div>
              </div>

              {/* Mã đơn hàng / mã voucher — conditional */}
              {(form.type === 'order' || form.type === 'voucher' || form.type === 'complaint') && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  {form.type !== 'voucher' && (
                    <div>
                      <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: '#1E293B', marginBottom: 8 }}>
                        Mã đơn hàng
                        {form.type === 'complaint' && <span style={{ color: '#EF4444' }}> *</span>}
                      </label>
                      <input
                        type="text"
                        value={form.orderId}
                        onChange={e => update('orderId', e.target.value)}
                        placeholder="VD: #10047"
                        style={{ width: '100%', padding: '12px 16px', border: '1.5px solid #E2E8F0', borderRadius: 12, fontSize: 14, fontFamily: 'Inter, sans-serif', color: '#1E293B', background: '#F8FAFC', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                        onFocus={e => (e.currentTarget.style.borderColor = '#0E76A8')}
                        onBlur={e => (e.currentTarget.style.borderColor = '#E2E8F0')}
                      />
                    </div>
                  )}
                  {(form.type === 'voucher' || form.type === 'complaint') && (
                    <div>
                      <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: '#1E293B', marginBottom: 8 }}>
                        Mã voucher
                        {form.type === 'complaint' && <span style={{ color: '#EF4444' }}> *</span>}
                      </label>
                      <input
                        type="text"
                        value={form.voucherCode}
                        onChange={e => update('voucherCode', e.target.value)}
                        placeholder="VD: EVR-KAFF-7291"
                        style={{ width: '100%', padding: '12px 16px', border: '1.5px solid #E2E8F0', borderRadius: 12, fontSize: 14, fontFamily: 'Inter, sans-serif', color: '#1E293B', background: '#F8FAFC', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                        onFocus={e => (e.currentTarget.style.borderColor = '#0E76A8')}
                        onBlur={e => (e.currentTarget.style.borderColor = '#E2E8F0')}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Nội dung */}
              <div>
                <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: '#1E293B', marginBottom: 8 }}>
                  Nội dung <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <textarea
                  value={form.message}
                  onChange={e => update('message', e.target.value)}
                  placeholder={`Mô tả chi tiết vấn đề của bạn về "${selectedType.label.toLowerCase()}"...\n\nVí dụ:\n- Vấn đề: Mã voucher không quét được tại quán.\n- Thời gian xảy ra: 15/07/2026\n- Chi nhánh: Highlands Coffee Nguyễn Trãi`}
                  rows={7}
                  maxLength={1000}
                  style={{ width: '100%', padding: '12px 16px', border: `1.5px solid ${errors.message ? '#EF4444' : '#E2E8F0'}`, borderRadius: 12, fontSize: 14, fontFamily: 'Inter, sans-serif', color: '#1E293B', background: '#F8FAFC', outline: 'none', resize: 'vertical', lineHeight: 1.7, boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#0E76A8')}
                  onBlur={e => (e.currentTarget.style.borderColor = errors.message ? '#EF4444' : '#E2E8F0')}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  {errors.message ? <span style={{ fontSize: 12, color: '#EF4444', fontFamily: 'Inter, sans-serif' }}>{errors.message}</span> : <span />}
                  <span style={{ fontSize: 11, color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>{formatCharCount(form.message.length, 1000)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Thông tin liên hệ */}
          <div style={{ background: 'white', borderRadius: 20, padding: 28, marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 17, fontWeight: 800, color: '#1E293B', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 28, height: 28, borderRadius: '50%', background: '#0E76A8', color: 'white', fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>3</span>
              Thông tin liên hệ
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: '#1E293B', marginBottom: 8 }}>
                  Email <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => update('email', e.target.value)}
                  placeholder="email@example.com"
                  style={{ width: '100%', padding: '12px 16px', border: `1.5px solid ${errors.email ? '#EF4444' : '#E2E8F0'}`, borderRadius: 12, fontSize: 14, fontFamily: 'Inter, sans-serif', color: '#1E293B', background: '#F8FAFC', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#0E76A8')}
                  onBlur={e => (e.currentTarget.style.borderColor = errors.email ? '#EF4444' : '#E2E8F0')}
                />
                {errors.email && <p style={{ marginTop: 4, fontSize: 12, color: '#EF4444', fontFamily: 'Inter, sans-serif' }}>{errors.email}</p>}
              </div>

              <div>
                <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: '#1E293B', marginBottom: 8 }}>
                  Số điện thoại <span style={{ color: '#94A3B8', fontWeight: 400 }}>(tùy chọn)</span>
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => update('phone', e.target.value)}
                  placeholder="0901234567"
                  style={{ width: '100%', padding: '12px 16px', border: '1.5px solid #E2E8F0', borderRadius: 12, fontSize: 14, fontFamily: 'Inter, sans-serif', color: '#1E293B', background: '#F8FAFC', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#0E76A8')}
                  onBlur={e => (e.currentTarget.style.borderColor = '#E2E8F0')}
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '16px',
              background: loading ? '#94A3B8' : '#0E76A8',
              color: 'white', border: 'none', borderRadius: 14,
              fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 700,
              cursor: loading ? 'wait' : 'pointer',
              transition: 'background 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#0A5C87'; }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#0E76A8'; }}
          >
            {loading ? (
              <><Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> Đang gửi phản hồi...</>
            ) : (
              <><Send size={18} /> Gửi phản hồi</>
            )}
          </button>

          {/* Disclaimer */}
          <p style={{ marginTop: 16, fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#94A3B8', textAlign: 'center', lineHeight: 1.6 }}>
            Bằng cách gửi phản hồi, bạn đồng ý với{' '}
            <span style={{ color: '#0E76A8', cursor: 'pointer' }}>Điều khoản sử dụng</span> của Everest.
            Thông tin cá nhân của bạn sẽ được bảo mật theo{' '}
            <span style={{ color: '#0E76A8', cursor: 'pointer' }}>Chính sách bảo mật</span>.
          </p>
        </form>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
