import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { profileApi } from '../services/api';

export function ChangePasswordPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [show, setShow] = useState({ current: false, next: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (k: keyof typeof form, v: string) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k]) setErrors(e => ({ ...e, [k]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.current) e.current = 'Vui lòng nhập mật khẩu hiện tại.';
    if (!form.next) e.next = 'Vui lòng nhập mật khẩu mới.';
    else if (form.next.length < 8) e.next = 'Mật khẩu mới phải có ít nhất 8 ký tự.';
    if (!form.confirm) e.confirm = 'Vui lòng xác nhận mật khẩu mới.';
    else if (form.confirm !== form.next) e.confirm = 'Mật khẩu xác nhận không khớp.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await profileApi.changePassword({ currentPassword: form.current, newPassword: form.next });
      if (res.success) {
        setSuccess(true);
      } else {
        setErrors({ current: res.error?.message || 'Đổi mật khẩu thất bại.' });
      }
    } catch (err: any) {
      setErrors({ current: err.message || 'Đã xảy ra lỗi. Vui lòng thử lại.' });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ background: '#F8FAFC', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ background: 'white', borderRadius: 24, padding: '48px 40px', maxWidth: 480, width: '100%', textAlign: 'center', boxShadow: '0 8px 32px rgba(14,118,168,0.1)' }}>
          <div style={{ width: 88, height: 88, background: '#ECFDF5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', animation: 'scale-in 0.4s ease-out' }}>
            <CheckCircle2 size={44} style={{ color: '#10B981' }} />
          </div>
          <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 24, fontWeight: 800, color: '#1E293B', marginBottom: 12 }}>Đổi mật khẩu thành công!</h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, color: '#64748B', lineHeight: 1.6, marginBottom: 32 }}>
            Mật khẩu của bạn đã được cập nhật. Hãy sử dụng mật khẩu mới cho lần đăng nhập tiếp theo.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button onClick={() => navigate('/settings')} style={{ width: '100%', padding: '14px', background: '#0E76A8', color: 'white', border: 'none', borderRadius: 12, fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#0A5C87')}
              onMouseLeave={e => (e.currentTarget.style.background = '#0E76A8')}
            >
              Quay lại Cài đặt
            </button>
            <Link to="/" style={{ display: 'block', padding: '14px', background: 'white', color: '#0E76A8', textDecoration: 'none', borderRadius: 12, fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 700, border: '1.5px solid #E2E8F0', textAlign: 'center' }}>
              Về trang chủ
            </Link>
          </div>
        </div>
        <style>{`@keyframes scale-in { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
      </div>
    );
  }

  const inputStyle = (field: string) => ({
    width: '100%', padding: '12px 44px 12px 16px', border: `1.5px solid ${errors[field] ? '#EF4444' : '#E2E8F0'}`, borderRadius: 12,
    fontSize: 14, fontFamily: 'Inter, sans-serif', color: '#1E293B', background: '#F8FAFC', outline: 'none',
    boxSizing: 'border-box' as const, transition: 'border-color 0.2s',
  });

  const PasswordField = ({ field, label, placeholder, value }: { field: keyof typeof form; label: string; placeholder: string; value: string }) => (
    <div>
      <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: '#1E293B', marginBottom: 8 }}>
        {label} <span style={{ color: '#EF4444' }}>*</span>
      </label>
      <div style={{ position: 'relative' }}>
        <input
          type={show[field] ? 'text' : 'password'}
          value={value}
          onChange={e => update(field, e.target.value)}
          placeholder={placeholder}
          style={inputStyle(field)}
          onFocus={e => (e.currentTarget.style.borderColor = '#0E76A8')}
          onBlur={e => (e.currentTarget.style.borderColor = errors[field] ? '#EF4444' : '#E2E8F0')}
        />
        <button
          type="button"
          onClick={() => setShow(s => ({ ...s, [field]: !s[field] }))}
          style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', display: 'flex', padding: 0 }}
        >
          {show[field] ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {errors[field] && <p style={{ marginTop: 4, fontSize: 12, color: '#EF4444', fontFamily: 'Inter, sans-serif' }}>{errors[field]}</p>}
    </div>
  );

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate('/settings')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 8, display: 'flex', alignItems: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <div>
            <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 22, fontWeight: 800, color: '#1E293B', margin: 0 }}>Đổi mật khẩu</h1>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#64748B', margin: 0 }}>Cập nhật mật khẩu để bảo vệ tài khoản</p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '32px 24px' }}>
        {/* Tip */}
        <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 14, padding: '14px 18px', marginBottom: 28, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <ShieldCheck size={20} style={{ color: '#2563EB', flexShrink: 0, marginTop: 2 }} />
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#1D4ED8', lineHeight: 1.6, margin: 0 }}>
            Mật khẩu mới phải có ít nhất <strong>8 ký tự</strong>. Khuyến nghị sử dụng kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ background: 'white', borderRadius: 20, padding: 28, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <PasswordField field="current" label="Mật khẩu hiện tại" placeholder="Nhập mật khẩu hiện tại" value={form.current} />
          <PasswordField field="next" label="Mật khẩu mới" placeholder="Nhập mật khẩu mới" value={form.next} />
          <PasswordField field="confirm" label="Xác nhận mật khẩu mới" placeholder="Nhập lại mật khẩu mới" value={form.confirm} />

          {/* Strength indicator */}
          {form.next && (
            <div>
              <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
                {[
                  form.next.length >= 8,
                  /[A-Z]/.test(form.next),
                  /[0-9]/.test(form.next),
                  /[^A-Za-z0-9]/.test(form.next),
                ].map((ok, i) => (
                  <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: ok ? '#10B981' : '#E2E8F0', transition: 'background 0.3s' }} />
                ))}
              </div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#94A3B8', margin: 0 }}>
                {form.next.length < 8 ? 'Mật khẩu yếu' : form.next.length < 12 || !/[A-Z]/.test(form.next) ? 'Mật khẩu trung bình' : 'Mật khẩu mạnh'}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '14px', background: loading ? '#94A3B8' : '#0E76A8', color: 'white', border: 'none', borderRadius: 12, fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 700, cursor: loading ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background 0.2s' }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#0A5C87'; }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#0E76A8'; }}
          >
            {loading ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Đang cập nhật...</> : 'Cập nhật mật khẩu'}
          </button>
        </form>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
