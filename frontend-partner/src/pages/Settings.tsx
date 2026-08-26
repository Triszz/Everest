import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  apiGetPartnerSettings,
  apiUpdatePartnerProfile,
} from '../services/partner-profile.service';
import {
  apiUpdateMyProfile,
  apiChangePassword,
} from '../services/auth.service';
import { ApiException } from '../services/api-client';
import { useAuth } from '../context/useAuth';
import type {
  PartnerSettingsResponse,
  UpdatePartnerProfileInput,
} from '../types/settings';

// ── Design tokens (matching every other Partner page) ────────────────────────
const C = {
  primary: '#0E76A8',
  primaryHover: '#0A5C87',
  text: '#1E293B',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
  bgPage: '#F8FAFC',
  error: '#EF4444',
  success: '#10B981',
} as const;

// ── Shared form styles ────────────────────────────────────────────────────────
const LABEL_STYLE: React.CSSProperties = {
  display: 'block',
  fontFamily: 'Inter, sans-serif',
  fontSize: 14,
  fontWeight: 600,
  color: C.text,
  marginBottom: 8,
};

const INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  border: `1.5px solid ${C.border}`,
  borderRadius: 10,
  fontSize: 14,
  fontFamily: 'Inter, sans-serif',
  color: C.text,
  background: '#F8FAFC',
  outline: 'none',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box' as const,
};

const INPUT_READONLY_STYLE: React.CSSProperties = {
  ...INPUT_STYLE,
  background: '#F1F5F9',
  color: C.textSecondary,
  cursor: 'not-allowed',
};

const INPUT_ERROR_STYLE: React.CSSProperties = {
  ...INPUT_STYLE,
  borderColor: C.error,
};

const ERROR_STYLE: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif',
  fontSize: 12,
  color: C.error,
  marginTop: 4,
};

const READONLY_VALUE_STYLE: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif',
  fontSize: 14,
  color: C.text,
  padding: '10px 14px',
  background: '#F8FAFC',
  border: `1.5px solid ${C.border}`,
  borderRadius: 10,
};

// ── Card wrapper ───────────────────────────────────────────────────────────────
function Card({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: 'white',
        borderRadius: 16,
        padding: 24,
        border: '1px solid #F1F5F9',
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
        width: '100%',
      }}
    >
      <h2
        style={{
          fontFamily: 'Manrope, sans-serif',
          fontSize: 16,
          fontWeight: 700,
          color: C.text,
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 32,
            height: 32,
            background: '#E8F4FA',
            borderRadius: 8,
          }}
        >
          {icon}
        </span>
        {title}
      </h2>
      {children}
    </div>
  );
}

// ── Field row ─────────────────────────────────────────────────────────────────
function Field({
  label,
  children,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={LABEL_STYLE}>{label}</label>
      {children}
    </div>
  );
}

// ── Readonly field ────────────────────────────────────────────────────────────
function ReadonlyField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={LABEL_STYLE}>{label}</label>
      <div style={READONLY_VALUE_STYLE}>{value || '—'}</div>
    </div>
  );
}

// ── Status badge ──────────────────────────────────────────────────────────────
const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  Pending: { bg: '#FEF3C7', color: '#92400E', label: 'Đang chờ duyệt' },
  Approved: { bg: '#D1FAE5', color: '#065F46', label: 'Đã duyệt' },
  Rejected: { bg: '#FEE2E2', color: '#991B1B', label: 'Từ chối' },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status] ?? { bg: '#F1F5F9', color: '#64748B', label: status };
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 10px',
        borderRadius: 20,
        background: s.bg,
        color: s.color,
        fontFamily: 'Inter, sans-serif',
        fontSize: 13,
        fontWeight: 600,
      }}
    >
      {s.label}
    </span>
  );
}

// ── Primary button ─────────────────────────────────────────────────────────────
function PrimaryButton({
  onClick,
  disabled,
  loading,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        padding: '10px 24px',
        background: disabled || loading ? C.textMuted : C.primary,
        color: 'white',
        border: 'none',
        borderRadius: 10,
        fontFamily: 'Inter, sans-serif',
        fontSize: 14,
        fontWeight: 700,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        transition: 'background 0.2s',
      }}
      onMouseEnter={e => {
        if (!disabled && !loading) e.currentTarget.style.background = C.primaryHover;
      }}
      onMouseLeave={e => {
        if (!disabled && !loading) e.currentTarget.style.background = C.primary;
      }}
    >
      {loading ? 'Đang lưu...' : children}
    </button>
  );
}

// ── Text input ────────────────────────────────────────────────────────────────
function TextInput({
  value,
  onChange,
  placeholder,
  type = 'text',
  error,
  onBlur,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  error?: string;
  onBlur?: () => void;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={error ? INPUT_ERROR_STYLE : focused ? { ...INPUT_STYLE, borderColor: C.primary } : INPUT_STYLE}
        onFocus={() => setFocused(true)}
        onBlur={() => { setFocused(false); onBlur?.(); }}
      />
      {error && <div style={ERROR_STYLE}>{error}</div>}
    </>
  );
}

// ── URL preview ────────────────────────────────────────────────────────────────
function UrlDisplay({ url }: { url: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 14px',
        background: '#F8FAFC',
        border: `1.5px solid ${C.border}`,
        borderRadius: 10,
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.primary} strokeWidth="2">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 14,
          color: C.primary,
          textDecoration: 'none',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          flex: 1,
        }}
      >
        {url}
      </a>
    </div>
  );
}

// ── Settings page ─────────────────────────────────────────────────────────────
export function SettingsPage() {
  const { updateUser } = useAuth();

  // ── Data ──────────────────────────────────────────────────────────────
  const [data, setData] = useState<PartnerSettingsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // ── Card 1: Account info ───────────────────────────────────────────────
  const [accountForm, setAccountForm] = useState({ fullName: '', phoneNumber: '' });
  const [accountErrors, setAccountErrors] = useState<{ fullName?: string; phoneNumber?: string }>({});
  const [savingAccount, setSavingAccount] = useState(false);

  // ── Card 3: Representative ─────────────────────────────────────────────
  const [repForm, setRepForm] = useState({
    representativeName: '',
    representativePosition: '',
    representativePhone: '',
    representativeEmail: '',
  });
  const [repErrors, setRepErrors] = useState<Record<string, string>>({});
  const [savingRep, setSavingRep] = useState(false);

  // ── Card 4: Business license ────────────────────────────────────────────
  const [licenseForm, setLicenseForm] = useState({ businessLicenseUrl: '' });
  const [licenseError, setLicenseError] = useState<string>('');
  const [savingLicense, setSavingLicense] = useState(false);

  // ── Card 5: Password ───────────────────────────────────────────────────
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwdErrors, setPwdErrors] = useState<{ currentPassword?: string; newPassword?: string; confirmPassword?: string }>({});
  const [savingPwd, setSavingPwd] = useState(false);

  // ── Load data ───────────────────────────────────────────────────────────
  const load = async () => {
    try {
      const d = await apiGetPartnerSettings();
      setData(d);
      setAccountForm({ fullName: d.user.fullName, phoneNumber: d.user.phoneNumber ?? '' });
      setRepForm({
        representativeName: d.partner.representativeName ?? '',
        representativePosition: d.partner.representativePosition ?? '',
        representativePhone: d.partner.representativePhone ?? '',
        representativeEmail: d.partner.representativeEmail ?? '',
      });
      setLicenseForm({ businessLicenseUrl: d.partner.businessLicenseUrl ?? '' });
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : 'Không thể tải thông tin');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (cancelled) return;
      await load();
    })();
    return () => { cancelled = true; };
  }, []);

  // ── Validation helpers ─────────────────────────────────────────────────
  const PHONE_REGEX = /^[0-9]{10,11}$/;

  function validateAccount() {
    const e: typeof accountErrors = {};
    if (!accountForm.fullName.trim()) e.fullName = 'Họ tên không được để trống';
    else if (accountForm.fullName.trim().length < 2) e.fullName = 'Họ tên phải có ít nhất 2 ký tự';
    if (accountForm.phoneNumber.trim() && !PHONE_REGEX.test(accountForm.phoneNumber.trim())) {
      e.phoneNumber = 'Số điện thoại phải là 10-11 chữ số';
    }
    setAccountErrors(e);
    return Object.keys(e).length === 0;
  }

  function validateRep() {
    const e: Record<string, string> = {};
    if (!repForm.representativeName.trim()) e.representativeName = 'Tên người đại diện không được để trống';
    if (repForm.representativePhone.trim() && !PHONE_REGEX.test(repForm.representativePhone.trim())) {
      e.representativePhone = 'Số điện thoại phải là 10-11 chữ số';
    }
    if (repForm.representativeEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(repForm.representativeEmail.trim())) {
      e.representativeEmail = 'Email không hợp lệ';
    }
    setRepErrors(e);
    return Object.keys(e).length === 0;
  }

  function validateLicense() {
    const val = licenseForm.businessLicenseUrl.trim();
    if (val && !/^https?:\/\/.+/.test(val)) {
      setLicenseError('URL phải bắt đầu bằng http:// hoặc https://');
      return false;
    }
    setLicenseError('');
    return true;
  }

  function validatePassword() {
    const e: typeof pwdErrors = {};
    if (!pwdForm.currentPassword) e.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
    if (!pwdForm.newPassword) e.newPassword = 'Vui lòng nhập mật khẩu mới';
    else if (pwdForm.newPassword.length < 6) e.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự';
    if (pwdForm.newPassword !== pwdForm.confirmPassword) e.confirmPassword = 'Mật khẩu xác nhận không khớp';
    setPwdErrors(e);
    return Object.keys(e).length === 0;
  }

  // ── Submit handlers ────────────────────────────────────────────────────
  const handleSaveAccount = async () => {
    if (!validateAccount()) return;
    setSavingAccount(true);
    try {
      const updated = await apiUpdateMyProfile({
        fullName: accountForm.fullName.trim(),
        phoneNumber: accountForm.phoneNumber.trim() || null,
      });
      updateUser({ fullName: updated.fullName });
      toast.success('Cập nhật thông tin tài khoản thành công');
    } catch (err) {
      toast.error(err instanceof ApiException ? err.message : 'Cập nhật thất bại');
    } finally {
      setSavingAccount(false);
    }
  };

  const handleSaveRep = async () => {
    if (!validateRep()) return;
    setSavingRep(true);
    try {
      const input: UpdatePartnerProfileInput = {
        representativeName: repForm.representativeName.trim() || null,
        representativePosition: repForm.representativePosition.trim() || null,
        representativePhone: repForm.representativePhone.trim() || null,
        representativeEmail: repForm.representativeEmail.trim() || null,
      };
      await apiUpdatePartnerProfile(input);
      toast.success('Cập nhật thông tin người đại diện thành công');
      load();
    } catch (err) {
      toast.error(err instanceof ApiException ? err.message : 'Cập nhật thất bại');
    } finally {
      setSavingRep(false);
    }
  };

  const handleSaveLicense = async () => {
    if (!validateLicense()) return;
    setSavingLicense(true);
    try {
      await apiUpdatePartnerProfile({
        businessLicenseUrl: licenseForm.businessLicenseUrl.trim() || null,
      });
      toast.success('Cập nhật giấy phép kinh doanh thành công');
      load();
    } catch (err) {
      toast.error(err instanceof ApiException ? err.message : 'Cập nhật thất bại');
    } finally {
      setSavingLicense(false);
    }
  };

  const handleChangePassword = async () => {
    if (!validatePassword()) return;
    setSavingPwd(true);
    try {
      await apiChangePassword({
        currentPassword: pwdForm.currentPassword,
        newPassword: pwdForm.newPassword,
      });
      toast.success('Đổi mật khẩu thành công');
      setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err instanceof ApiException ? err.message : 'Đổi mật khẩu thất bại');
    } finally {
      setSavingPwd(false);
    }
  };

  // ── Loading state ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ background: C.bgPage, minHeight: '100vh' }}>
        <div className="partner-container" style={{ paddingTop: 48, paddingBottom: 48 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{
              height: 200, borderRadius: 16, background: 'white',
              marginBottom: 20, border: '1px solid #F1F5F9',
              animation: 'pulse 1.5s ease-in-out infinite',
            }} />
          ))}
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div style={{ background: C.bgPage, minHeight: '100vh' }}>
        <div className="partner-container" style={{ paddingTop: 48, paddingBottom: 48, textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '12px 20px', background: '#FEF2F2', border: '1px solid #FECACA',
            borderRadius: 10, color: '#991B1B',
            fontFamily: 'Inter, sans-serif', fontSize: 14,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {fetchError}
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const canSaveAccount = accountForm.fullName.trim() !== data.user.fullName
    || (accountForm.phoneNumber.trim() || null) !== data.user.phoneNumber;
  const canSaveRep = repForm.representativeName.trim() !== (data.partner.representativeName ?? '')
    || repForm.representativePosition.trim() !== (data.partner.representativePosition ?? '')
    || (repForm.representativePhone.trim() || null) !== data.partner.representativePhone
    || (repForm.representativeEmail.trim() || null) !== data.partner.representativeEmail;
  const canSaveLicense = (licenseForm.businessLicenseUrl.trim() || null) !== data.partner.businessLicenseUrl;

  return (
    <div style={{ background: C.bgPage, minHeight: '100vh' }}>
      {/* ── Page Header ───────────────────────────────────────────── */}
      <div style={{
        background: 'white',
        borderBottom: `1px solid ${C.border}`,
        padding: '24px 0',
      }}>
        <div className="partner-container">
          <div>
            <h1 style={{
              fontFamily: 'Manrope, sans-serif',
              fontSize: 28,
              fontWeight: 800,
              color: C.text,
              marginBottom: 4,
            }}>
              Cài đặt tài khoản
            </h1>
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 14,
              color: C.textSecondary,
            }}>
              Quản lý thông tin doanh nghiệp và tài khoản của bạn.
            </p>
          </div>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────── */}
      <div className="partner-container" style={{ paddingTop: 24, paddingBottom: 48, display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Card 1: Thông tin tài khoản */}
        <Card
          title="Thông tin tài khoản"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.primary} strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            <Field label="Họ tên">
              <TextInput
                value={accountForm.fullName}
                onChange={v => setAccountForm(f => ({ ...f, fullName: v }))}
                placeholder="Nhập họ tên"
                error={accountErrors.fullName}
                onBlur={() => { if (accountErrors.fullName) validateAccount(); }}
              />
            </Field>
            <Field label="Email">
              <input type="email" value={data.user.email} readOnly style={INPUT_READONLY_STYLE} />
            </Field>
            <Field label="Số điện thoại">
              <TextInput
                value={accountForm.phoneNumber}
                onChange={v => setAccountForm(f => ({ ...f, phoneNumber: v }))}
                placeholder="Nhập số điện thoại"
                error={accountErrors.phoneNumber}
                onBlur={() => { if (accountErrors.phoneNumber) validateAccount(); }}
              />
            </Field>
          </div>
          <div style={{ marginTop: 20 }}>
            <PrimaryButton
              onClick={handleSaveAccount}
              disabled={!canSaveAccount}
              loading={savingAccount}
            >
              Cập nhật
            </PrimaryButton>
          </div>
        </Card>

        {/* Card 2: Thông tin doanh nghiệp */}
        <Card
          title="Thông tin doanh nghiệp"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.primary} strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /></svg>}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            <ReadonlyField label="Tên công ty" value={data.partner.companyName} />
            <ReadonlyField label="Mã số thuế" value={data.partner.taxCode} />
          </div>
          <div style={{ marginTop: 16 }}>
            <label style={LABEL_STYLE}>Trạng thái</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#F8FAFC', border: `1.5px solid ${C.border}`, borderRadius: 10 }}>
              <StatusBadge status={data.partner.status} />
            </div>
          </div>
        </Card>

        {/* Card 3: Người đại diện */}
        <Card
          title="Người đại diện"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.primary} strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            <Field label="Tên người đại diện">
              <TextInput
                value={repForm.representativeName}
                onChange={v => setRepForm(f => ({ ...f, representativeName: v }))}
                placeholder="Nhập tên người đại diện"
                error={repErrors.representativeName}
                onBlur={() => { if (repErrors.representativeName) validateRep(); }}
              />
            </Field>
            <Field label="Chức vụ">
              <TextInput
                value={repForm.representativePosition}
                onChange={v => setRepForm(f => ({ ...f, representativePosition: v }))}
                placeholder="Ví dụ: Giám đốc, Tổng giám đốc"
                error={repErrors.representativePosition}
              />
            </Field>
            <Field label="Số điện thoại">
              <TextInput
                value={repForm.representativePhone}
                onChange={v => setRepForm(f => ({ ...f, representativePhone: v }))}
                placeholder="Nhập số điện thoại"
                error={repErrors.representativePhone}
                onBlur={() => { if (repErrors.representativePhone) validateRep(); }}
              />
            </Field>
            <Field label="Email">
              <TextInput
                value={repForm.representativeEmail}
                onChange={v => setRepForm(f => ({ ...f, representativeEmail: v }))}
                placeholder="Nhập email"
                error={repErrors.representativeEmail}
                onBlur={() => { if (repErrors.representativeEmail) validateRep(); }}
              />
            </Field>
          </div>
          <div style={{ marginTop: 20 }}>
            <PrimaryButton
              onClick={handleSaveRep}
              disabled={!canSaveRep}
              loading={savingRep}
            >
              Cập nhật
            </PrimaryButton>
          </div>
        </Card>

        {/* Card 4: Thông tin pháp lý */}
        <Card
          title="Thông tin pháp lý"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.primary} strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>}
        >
          <Field label="URL Giấy phép kinh doanh">
            {data.partner.businessLicenseUrl ? (
              <UrlDisplay url={data.partner.businessLicenseUrl} />
            ) : (
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: C.textMuted, marginBottom: 8 }}>
                Chưa cung cấp
              </div>
            )}
          </Field>
          <Field label="Cập nhật URL giấy phép">
            <TextInput
              value={licenseForm.businessLicenseUrl}
              onChange={v => setLicenseForm({ businessLicenseUrl: v })}
              placeholder="https://example.com/license.pdf"
              error={licenseError}
              onBlur={() => { if (licenseError) validateLicense(); }}
            />
          </Field>
          <div style={{ marginTop: 20 }}>
            <PrimaryButton
              onClick={handleSaveLicense}
              disabled={!canSaveLicense}
              loading={savingLicense}
            >
              Cập nhật
            </PrimaryButton>
          </div>
        </Card>

        {/* Card 5: Đổi mật khẩu */}
        <Card
          title="Đổi mật khẩu"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.primary} strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            <Field label="Mật khẩu hiện tại">
              <TextInput
                value={pwdForm.currentPassword}
                onChange={v => setPwdForm(f => ({ ...f, currentPassword: v }))}
                placeholder="Nhập mật khẩu hiện tại"
                type="password"
                error={pwdErrors.currentPassword}
                onBlur={() => { if (pwdErrors.currentPassword) validatePassword(); }}
              />
            </Field>
            <Field label="Mật khẩu mới">
              <TextInput
                value={pwdForm.newPassword}
                onChange={v => setPwdForm(f => ({ ...f, newPassword: v }))}
                placeholder="Ít nhất 6 ký tự"
                type="password"
                error={pwdErrors.newPassword}
                onBlur={() => { if (pwdErrors.newPassword) validatePassword(); }}
              />
            </Field>
            <Field label="Xác nhận mật khẩu mới">
              <TextInput
                value={pwdForm.confirmPassword}
                onChange={v => setPwdForm(f => ({ ...f, confirmPassword: v }))}
                placeholder="Nhập lại mật khẩu mới"
                type="password"
                error={pwdErrors.confirmPassword}
                onBlur={() => { if (pwdErrors.confirmPassword) validatePassword(); }}
              />
            </Field>
          </div>
          <div style={{ marginTop: 20 }}>
            <PrimaryButton onClick={handleChangePassword} loading={savingPwd}>
              Đổi mật khẩu
            </PrimaryButton>
          </div>
        </Card>

      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
