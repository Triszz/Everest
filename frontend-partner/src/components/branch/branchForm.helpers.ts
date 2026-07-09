import type { CreateBranchInput, UpdateBranchInput } from '../../types/branch';

// ── Design tokens (matching VoucherForm) ─────────────────────────────────────
export const BRANCH_FORM_COLORS = {
  primary: '#0E76A8',
  primaryHover: '#0A5C87',
  text: '#1E293B',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
  bgPage: '#F8FAFC',
  error: '#EF4444',
} as const;

export const BRANCH_FORM_LABEL_STYLE: React.CSSProperties = {
  display: 'block',
  fontFamily: 'Inter, sans-serif',
  fontSize: 14,
  fontWeight: 600,
  color: BRANCH_FORM_COLORS.text,
  marginBottom: 8,
};

export const BRANCH_INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  border: `1.5px solid ${BRANCH_FORM_COLORS.border}`,
  borderRadius: 10,
  fontSize: 14,
  fontFamily: 'Inter, sans-serif',
  color: BRANCH_FORM_COLORS.text,
  background: BRANCH_FORM_COLORS.bgPage,
  outline: 'none',
  transition: 'border-color 0.2s',
};

export const BRANCH_INPUT_ERROR_STYLE: React.CSSProperties = {
  ...BRANCH_INPUT_STYLE,
  borderColor: BRANCH_FORM_COLORS.error,
};

export const BRANCH_ERROR_TEXT: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif',
  fontSize: 12,
  color: BRANCH_FORM_COLORS.error,
  marginTop: 4,
};

export const BRANCH_HELP_TEXT: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif',
  fontSize: 12,
  color: BRANCH_FORM_COLORS.textMuted,
  marginTop: 4,
};

// ── Form data shape ─────────────────────────────────────────────────────────
export interface BranchFormData {
  branchName: string;
  address: string;
  phoneNumber: string;
}

export type BranchFormErrors = Partial<Record<keyof BranchFormData | 'general', string>>;

export const EMPTY_BRANCH_FORM: BranchFormData = {
  branchName: '',
  address: '',
  phoneNumber: '',
};

// ── Validation (matching backend schemas exactly) ─────────────────────────────
const PHONE_REGEX = /^[0-9]{10,11}$/;

export function validateBranchForm(data: BranchFormData): BranchFormErrors {
  const errors: BranchFormErrors = {};

  if (!data.branchName.trim()) {
    errors.branchName = 'Tên chi nhánh không được để trống';
  } else if (data.branchName.trim().length < 2) {
    errors.branchName = 'Tên chi nhánh phải có ít nhất 2 ký tự';
  } else if (data.branchName.trim().length > 150) {
    errors.branchName = 'Tên chi nhánh không được quá 150 ký tự';
  }

  if (!data.address.trim()) {
    errors.address = 'Địa chỉ không được để trống';
  } else if (data.address.trim().length < 5) {
    errors.address = 'Địa chỉ phải có ít nhất 5 ký tự';
  } else if (data.address.trim().length > 255) {
    errors.address = 'Địa chỉ không được quá 255 ký tự';
  }

  if (data.phoneNumber.trim() && !PHONE_REGEX.test(data.phoneNumber.trim())) {
    errors.phoneNumber = 'Số điện thoại phải là 10-11 chữ số';
  }

  return errors;
}

// ── Build payload ────────────────────────────────────────────────────────────
export function buildBranchPayload(
  data: BranchFormData,
): CreateBranchInput | UpdateBranchInput {
  return {
    branchName: data.branchName.trim(),
    address: data.address.trim(),
    phoneNumber: data.phoneNumber.trim() || undefined,
  };
}