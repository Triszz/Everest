import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// ── Types ───────────────────────────────────────────────────────────────────
interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phoneNumber: string;
  companyName: string;
  taxCode: string;
  businessLicenseUrl: string;
}

type FormField = keyof FormData;

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  fullName?: string;
  phoneNumber?: string;
  companyName?: string;
  taxCode?: string;
  businessLicenseUrl?: string;
  terms?: string;
  general?: string;
}

// Thứ tự ưu tiên scroll-to-first-error theo đúng thứ tự xuất hiện trong form.
const FIELD_ORDER: FormField[] = [
  'email',
  'password',
  'confirmPassword',
  'fullName',
  'phoneNumber',
  'companyName',
  'taxCode',
  'businessLicenseUrl',
];

// ── Validation ──────────────────────────────────────────────────────────────
function validateForm(data: FormData): FormErrors {
  const errors: FormErrors = {};

  // Email
  if (!data.email.trim()) {
    errors.email = 'Email không được để trống';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Email không đúng định dạng';
  }

  // Password — backend requires min 6 chars
  if (!data.password) {
    errors.password = 'Mật khẩu không được để trống';
  } else if (data.password.length < 6) {
    errors.password = 'Mật khẩu ít nhất 6 ký tự';
  }

  // Confirm password
  if (!data.confirmPassword) {
    errors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
  } else if (data.confirmPassword !== data.password) {
    errors.confirmPassword = 'Mật khẩu xác nhận không trùng khớp';
  }

  // Full name
  if (!data.fullName.trim()) {
    errors.fullName = 'Họ và tên không được để trống';
  } else if (data.fullName.trim().length < 2) {
    errors.fullName = 'Họ và tên ít nhất 2 ký tự';
  }

  // Phone number (required per business rule)
  if (!data.phoneNumber.trim()) {
    errors.phoneNumber = 'Số điện thoại không được để trống';
  } else if (!/^[0-9]{10,11}$/.test(data.phoneNumber)) {
    errors.phoneNumber = 'Số điện thoại chỉ chứa 10-11 chữ số';
  }

  // Company name
  if (!data.companyName.trim()) {
    errors.companyName = 'Tên doanh nghiệp không được để trống';
  }

  // Tax code
  if (!data.taxCode.trim()) {
    errors.taxCode = 'Mã số thuế không được để trống';
  } else if (data.taxCode.trim().length < 10) {
    errors.taxCode = 'Mã số thuế ít nhất 10 ký tự';
  }

  // Business license URL — optional in backend, validate format only if provided
  if (data.businessLicenseUrl.trim()) {
    try {
      new URL(data.businessLicenseUrl);
    } catch {
      errors.businessLicenseUrl = 'URL không hợp lệ (ví dụ: https://...)';
    }
  }

  return errors;
}

// ── Shared styles (matching customer registration) ──────────────────────────
const LABEL_STYLE: React.CSSProperties = {
  display: 'block',
  fontFamily: 'Inter, sans-serif',
  fontSize: 14,
  fontWeight: 600,
  color: '#1E293B',
  marginBottom: 8,
};

const INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  padding: '12px 16px',
  border: '1.5px solid #E2E8F0',
  borderRadius: 12,
  fontSize: 14,
  fontFamily: 'Inter, sans-serif',
  color: '#1E293B',
  background: '#F8FAFC',
  outline: 'none',
  transition: 'border-color 0.2s',
};

const INPUT_ERROR_STYLE: React.CSSProperties = {
  ...INPUT_STYLE,
  borderColor: '#EF4444',
};

const ERROR_TEXT_STYLE: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif',
  fontSize: 12,
  color: '#EF4444',
  marginTop: 4,
};

// ── API ─────────────────────────────────────────────────────────────────────
import { apiRegisterPartner } from '../services/auth.service';


// ── Component ───────────────────────────────────────────────────────────────
export function RegisterPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phoneNumber: '',
    companyName: '',
    taxCode: '',
    businessLicenseUrl: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);

  // ── Refs for scroll-to-first-error ──
  const fieldRefs = useRef<Partial<Record<FormField, HTMLInputElement | null>>>({});
  const termsRef = useRef<HTMLInputElement | null>(null);

  const updateField = (field: FormField) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    // Clear field error on change
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = '#0E76A8';
  };

  const handleBlur = (field: FormField) => (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = errors[field] ? '#EF4444' : '#E2E8F0';
  };

  /**
   * Tìm field lỗi đầu tiên theo thứ tự FIELD_ORDER, scroll + focus.
   * Ưu tiên lỗi terms (nếu có) chỉ khi không còn lỗi field nào khác.
   */
  const focusFirstError = (nextErrors: FormErrors) => {
    // Tìm field lỗi đầu tiên theo thứ tự xuất hiện trong form
    for (const field of FIELD_ORDER) {
      if (nextErrors[field]) {
        const el = fieldRefs.current[field];
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Focus sau khi scroll (focus ngay gây jump trên Safari)
          requestAnimationFrame(() => el.focus({ preventScroll: true }));
          return;
        }
      }
    }

    // Nếu không có field nào lỗi nhưng terms chưa tick → focus checkbox
    if (nextErrors.terms && termsRef.current) {
      termsRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      requestAnimationFrame(() => termsRef.current?.focus({ preventScroll: true }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm(formData);
    const allErrors: FormErrors = { ...validationErrors };
    if (!agreedTerms) {
      allErrors.terms = 'Bạn phải đồng ý với Điều khoản sử dụng và Chính sách bảo mật.';
    }

    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      focusFirstError(allErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await apiRegisterPartner({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        companyName: formData.companyName,
        taxCode: formData.taxCode,
        businessLicenseUrl: formData.businessLicenseUrl || undefined,
      });

      navigate('/register/success');
    } catch (err) {
      setErrors({
        general: err instanceof Error ? err.message : 'Đăng ký thất bại. Vui lòng thử lại.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getInputStyle = (field: FormField): React.CSSProperties =>
    errors[field] ? INPUT_ERROR_STYLE : INPUT_STYLE;

  // Helper: clear terms error khi user tick
  const handleTermsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAgreedTerms(e.target.checked);
    if (errors.terms) {
      setErrors(prev => {
        const next = { ...prev };
        delete next.terms;
        return next;
      });
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#F8FAFC' }}>
      {/* Left side - Illustration (matching customer layout exactly) */}
      <div style={{
        display: 'none',
        flex: 1,
        background: 'linear-gradient(135deg, #0E76A8 0%, #1A8FC0 100%)',
        position: 'relative',
        overflow: 'hidden',
      }} className="hidden lg:flex">
        <div style={{ position: 'absolute', inset: 0, opacity: 0.1 }}>
          <div style={{
            position: 'absolute',
            top: '15%',
            right: '10%',
            width: 350,
            height: 350,
            borderRadius: '50%',
            background: 'white',
            filter: 'blur(70px)',
          }} />
          <div style={{
            position: 'absolute',
            bottom: '15%',
            left: '10%',
            width: 280,
            height: 280,
            borderRadius: '50%',
            background: 'white',
            filter: 'blur(60px)',
          }} />
        </div>
        <div style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 60,
          color: 'white',
          textAlign: 'center',
        }}>
          <div style={{
            width: 80,
            height: 80,
            background: 'rgba(255,255,255,0.15)',
            borderRadius: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 32,
          }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <h2 style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: 32,
            fontWeight: 800,
            marginBottom: 16,
          }}>Trở thành đối tác Everest</h2>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 16,
            opacity: 0.9,
            lineHeight: 1.6,
            maxWidth: 400,
          }}>
            Phát hành voucher, tiếp cận hàng triệu khách hàng và tăng trưởng doanh thu cùng nền tảng hàng đầu.
          </p>
          <div style={{
            marginTop: 48,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            width: '100%',
            maxWidth: 320,
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.12)',
              padding: '16px 20px',
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}>
              <div style={{
                width: 44,
                height: 44,
                background: 'rgba(255,255,255,0.2)',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
              }}>📈</div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>Tăng trưởng doanh thu</div>
                <div style={{ fontSize: 13, opacity: 0.8 }}>Tiếp cận hàng triệu khách hàng</div>
              </div>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.12)',
              padding: '16px 20px',
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}>
              <div style={{
                width: 44,
                height: 44,
                background: 'rgba(255,255,255,0.2)',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
              }}>🎯</div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>Quản lý voucher dễ dàng</div>
                <div style={{ fontSize: 13, opacity: 0.8 }}>Dashboard thông minh, trực quan</div>
              </div>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.12)',
              padding: '16px 20px',
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}>
              <div style={{
                width: 44,
                height: 44,
                background: 'rgba(255,255,255,0.2)',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
              }}>🤝</div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>Hỗ trợ tận tình</div>
                <div style={{ fontSize: 13, opacity: 0.8 }}>Đội ngũ hỗ trợ 24/7</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: 'white',
      }}>
        <div style={{ width: '100%', maxWidth: 480 }}>
          {/* Mobile Logo */}
          <div style={{ textAlign: 'center', marginBottom: 32 }} className="lg:hidden">
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 8,
            }}>
              <div style={{
                width: 40,
                height: 40,
                background: '#0E76A8',
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M20 12v10H4V12" />
                  <path d="M2 7h20v5H2z" />
                  <path d="M12 22V7" />
                  <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                  <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
                </svg>
              </div>
              <span style={{
                fontFamily: 'Manrope, sans-serif',
                fontSize: 24,
                fontWeight: 800,
                color: '#0E76A8',
              }}>Everest</span>
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <h1 style={{
              fontFamily: 'Manrope, sans-serif',
              fontSize: 28,
              fontWeight: 800,
              color: '#1E293B',
              marginBottom: 8,
            }}>Đăng ký đối tác</h1>
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 14,
              color: '#94A3B8',
            }}>Tạo tài khoản doanh nghiệp để bắt đầu phát hành voucher</p>
          </div>

          {/* General error */}
          {errors.general && (
            <div style={{
              padding: '12px 16px',
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: 12,
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#EF4444' }}>
                {errors.general}
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* ── Section: Thông tin tài khoản ── */}
            <div style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 12,
              fontWeight: 600,
              color: '#94A3B8',
              textTransform: 'uppercase',
              letterSpacing: 1,
              marginBottom: -4,
            }}>Thông tin tài khoản</div>

            {/* Email */}
            <div>
              <label htmlFor="register-email" style={LABEL_STYLE}>Email <span style={{ color: '#EF4444' }}>*</span></label>
              <input
                id="register-email"
                ref={el => { fieldRefs.current.email = el; }}
                type="email"
                value={formData.email}
                onChange={updateField('email')}
                placeholder="email@example.com"
                style={getInputStyle('email')}
                onFocus={handleFocus}
                onBlur={handleBlur('email')}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'register-email-error' : undefined}
              />
              {errors.email && (
                <div id="register-email-error" style={ERROR_TEXT_STYLE}>
                  {errors.email}
                </div>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="register-password" style={LABEL_STYLE}>Mật khẩu <span style={{ color: '#EF4444' }}>*</span></label>
              <input
                id="register-password"
                ref={el => { fieldRefs.current.password = el; }}
                type="password"
                value={formData.password}
                onChange={updateField('password')}
                placeholder="Tối thiểu 8 ký tự, chữ hoa, chữ thường, số"
                style={getInputStyle('password')}
                onFocus={handleFocus}
                onBlur={handleBlur('password')}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'register-password-error' : undefined}
              />
              {errors.password && (
                <div id="register-password-error" style={ERROR_TEXT_STYLE}>
                  {errors.password}
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label htmlFor="register-confirm-password" style={LABEL_STYLE}>Xác nhận mật khẩu <span style={{ color: '#EF4444' }}>*</span></label>
              <input
                id="register-confirm-password"
                ref={el => { fieldRefs.current.confirmPassword = el; }}
                type="password"
                value={formData.confirmPassword}
                onChange={updateField('confirmPassword')}
                placeholder="Nhập lại mật khẩu"
                style={getInputStyle('confirmPassword')}
                onFocus={handleFocus}
                onBlur={handleBlur('confirmPassword')}
                aria-invalid={!!errors.confirmPassword}
                aria-describedby={errors.confirmPassword ? 'register-confirm-password-error' : undefined}
              />
              {errors.confirmPassword && (
                <div id="register-confirm-password-error" style={ERROR_TEXT_STYLE}>
                  {errors.confirmPassword}
                </div>
              )}
            </div>

            {/* ── Section: Thông tin cá nhân ── */}
            <div style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 12,
              fontWeight: 600,
              color: '#94A3B8',
              textTransform: 'uppercase',
              letterSpacing: 1,
              marginTop: 8,
              marginBottom: -4,
            }}>Thông tin cá nhân</div>

            {/* Full name */}
            <div>
              <label htmlFor="register-name" style={LABEL_STYLE}>Họ và tên <span style={{ color: '#EF4444' }}>*</span></label>
              <input
                id="register-name"
                ref={el => { fieldRefs.current.fullName = el; }}
                type="text"
                value={formData.fullName}
                onChange={updateField('fullName')}
                placeholder="Nguyễn Văn A"
                style={getInputStyle('fullName')}
                onFocus={handleFocus}
                onBlur={handleBlur('fullName')}
                aria-invalid={!!errors.fullName}
                aria-describedby={errors.fullName ? 'register-name-error' : undefined}
              />
              {errors.fullName && (
                <div id="register-name-error" style={ERROR_TEXT_STYLE}>
                  {errors.fullName}
                </div>
              )}
            </div>

            {/* Phone number */}
            <div>
              <label htmlFor="register-phone" style={LABEL_STYLE}>Số điện thoại <span style={{ color: '#EF4444' }}>*</span></label>
              <input
                id="register-phone"
                ref={el => { fieldRefs.current.phoneNumber = el; }}
                type="tel"
                value={formData.phoneNumber}
                onChange={updateField('phoneNumber')}
                placeholder="0912 345 678"
                style={getInputStyle('phoneNumber')}
                onFocus={handleFocus}
                onBlur={handleBlur('phoneNumber')}
                aria-invalid={!!errors.phoneNumber}
                aria-describedby={errors.phoneNumber ? 'register-phone-error' : undefined}
              />
              {errors.phoneNumber && (
                <div id="register-phone-error" style={ERROR_TEXT_STYLE}>
                  {errors.phoneNumber}
                </div>
              )}
            </div>

            {/* ── Section: Thông tin doanh nghiệp ── */}
            <div style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 12,
              fontWeight: 600,
              color: '#94A3B8',
              textTransform: 'uppercase',
              letterSpacing: 1,
              marginTop: 8,
              marginBottom: -4,
            }}>Thông tin doanh nghiệp</div>

            {/* Company name */}
            <div>
              <label htmlFor="register-company" style={LABEL_STYLE}>Tên doanh nghiệp <span style={{ color: '#EF4444' }}>*</span></label>
              <input
                id="register-company"
                ref={el => { fieldRefs.current.companyName = el; }}
                type="text"
                value={formData.companyName}
                onChange={updateField('companyName')}
                placeholder="Công ty TNHH ABC"
                style={getInputStyle('companyName')}
                onFocus={handleFocus}
                onBlur={handleBlur('companyName')}
                aria-invalid={!!errors.companyName}
                aria-describedby={errors.companyName ? 'register-company-error' : undefined}
              />
              {errors.companyName && (
                <div id="register-company-error" style={ERROR_TEXT_STYLE}>
                  {errors.companyName}
                </div>
              )}
            </div>

            {/* Tax code */}
            <div>
              <label htmlFor="register-tax" style={LABEL_STYLE}>Mã số thuế <span style={{ color: '#EF4444' }}>*</span></label>
              <input
                id="register-tax"
                ref={el => { fieldRefs.current.taxCode = el; }}
                type="text"
                value={formData.taxCode}
                onChange={updateField('taxCode')}
                placeholder="0123456789"
                style={getInputStyle('taxCode')}
                onFocus={handleFocus}
                onBlur={handleBlur('taxCode')}
                aria-invalid={!!errors.taxCode}
                aria-describedby={errors.taxCode ? 'register-tax-error' : undefined}
              />
              {errors.taxCode && (
                <div id="register-tax-error" style={ERROR_TEXT_STYLE}>
                  {errors.taxCode}
                </div>
              )}
            </div>

            {/* Business license URL */}
            <div>
              <label htmlFor="register-license" style={LABEL_STYLE}>URL giấy phép kinh doanh</label>
              <input
                id="register-license"
                ref={el => { fieldRefs.current.businessLicenseUrl = el; }}
                type="url"
                value={formData.businessLicenseUrl}
                onChange={updateField('businessLicenseUrl')}
                placeholder="https://example.com/giay-phep.pdf"
                style={getInputStyle('businessLicenseUrl')}
                onFocus={handleFocus}
                onBlur={handleBlur('businessLicenseUrl')}
                aria-invalid={!!errors.businessLicenseUrl}
                aria-describedby={errors.businessLicenseUrl ? 'register-license-error' : undefined}
              />
              {errors.businessLicenseUrl && (
                <div id="register-license-error" style={ERROR_TEXT_STYLE}>
                  {errors.businessLicenseUrl}
                </div>
              )}
            </div>

            {/* Terms */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
              }}>
                <input
                  type="checkbox"
                  id="register-terms"
                  ref={termsRef}
                  checked={agreedTerms}
                  onChange={handleTermsChange}
                  aria-invalid={!!errors.terms}
                  aria-describedby={errors.terms ? 'register-terms-error' : undefined}
                  style={{ marginTop: 2, accentColor: '#0E76A8' }}
                />
                <label htmlFor="register-terms" style={{
                  fontSize: 13,
                  color: '#64748B',
                  lineHeight: 1.5,
                }}>
                  Tôi đồng ý với <Link to="/terms" style={{ color: '#0E76A8', textDecoration: 'none', fontWeight: 600 }}>Điều khoản sử dụng</Link> và <Link to="/privacy" style={{ color: '#0E76A8', textDecoration: 'none', fontWeight: 600 }}>Chính sách bảo mật</Link>
                </label>
              </div>
              {errors.terms && (
                <div
                  id="register-terms-error"
                  role="alert"
                  style={{
                    ...ERROR_TEXT_STYLE,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    marginTop: 2,
                    marginLeft: 26,
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.2" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>{errors.terms}</span>
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '14px',
                background: isLoading ? '#94A3B8' : '#0E76A8',
                color: 'white',
                border: 'none',
                borderRadius: 12,
                fontSize: 15,
                fontFamily: 'Inter, sans-serif',
                fontWeight: 700,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
              onMouseEnter={e => { if (!isLoading) e.currentTarget.style.background = '#0A5C87'; }}
              onMouseLeave={e => { if (!isLoading) e.currentTarget.style.background = '#0E76A8'; }}
            >
              {isLoading && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              )}
              {isLoading ? 'Đang xử lý...' : 'Đăng ký đối tác'}
            </button>
          </form>

          <p style={{
            textAlign: 'center',
            marginTop: 24,
            fontFamily: 'Inter, sans-serif',
            fontSize: 14,
            color: '#64748B',
          }}>
            Đã có tài khoản?{' '}
            <Link to="/login" style={{
              color: '#0E76A8',
              textDecoration: 'none',
              fontWeight: 700,
            }}>Đăng nhập ngay</Link>
          </p>
        </div>
      </div>

      {/* Spinner animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}