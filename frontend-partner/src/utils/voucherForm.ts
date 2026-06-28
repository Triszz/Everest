import type { VoucherDetail } from '../types/voucher';
import type { VoucherFormData } from '../components/voucher/VoucherForm';

/**
 * Convert an ISO 8601 datetime string (e.g. "2026-07-01T10:30:00.000Z")
 * into the `YYYY-MM-DDTHH:mm` format expected by `<input type="datetime-local">`.
 *
 * Uses the user's local timezone so the displayed time matches what they
 * entered when creating the voucher (input was naive local time).
 */
export function isoToLocalInput(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}`
  );
}

/**
 * Map a backend `VoucherDetail` into the `VoucherFormData` shape
 * consumed by `<VoucherForm>` in edit mode.
 *
 * - Numeric fields are stringified for controlled inputs.
 * - Dates are converted to datetime-local format.
 * - Branch selection is derived from `voucherBranches[].branch.branchId`.
 */
export function voucherDetailToFormData(v: VoucherDetail): VoucherFormData {
  return {
    title: v.title,
    description: v.description ?? '',
    categoryId: v.categoryId ? String(v.categoryId) : '',
    originalPrice: String(v.originalPrice),
    salePrice: String(v.salePrice),
    totalQuantity: String(v.totalQuantity),
    imageUrl: v.imageUrl ?? '',
    startDate: isoToLocalInput(v.startDate),
    endDate: isoToLocalInput(v.endDate),
    expiryDays: String(v.expiryDays),
    applicationCondition: v.applicationCondition ?? '',
    branchIds: v.voucherBranches?.map(vb => vb.branch.branchId) ?? [],
  };
}