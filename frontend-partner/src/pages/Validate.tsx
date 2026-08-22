/**
 * Validate Voucher Page (Partner Web)
 * ============================================================
 * Flow 3 bước cho Partner_Owner:
 *   1. Nhập mã voucher → gọi /api/partner/redemption/validate
 *   2. Hiển thị thông tin voucher (nếu VALID)
 *   3. Nút "Xác nhận sử dụng voucher" → gọi /confirm
 *
 * KHÔNG dùng QR scanner. Chỉ nhập code bằng bàn phím.
 * Toàn bộ business logic (partner scope, approval, visibility, expiry,
 * used check, branch, transaction) đã có sẵn ở backend — chỉ wrap UI.
 */

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { REPORT_COLORS } from "../components/report/report.constants";
import {
  apiValidateVoucher,
  apiConfirmVoucher,
} from "../services/redemption.service";
import { apiGetRedemptionHistory } from "../services/history.service";
import { STATUS_META } from "../types/redemption";
import type {
  ValidateResponse,
  ConfirmResponse,
  ValidatedVoucherData,
  BranchInfo,
} from "../types/redemption";
import type { HistoryItem } from "../types/history";

const C = REPORT_COLORS;

// ── Helpers ────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Date range filter cho lịch sử ─────────────────────────────────────────

type HistoryDateRange = "all" | "today" | "7days" | "30days" | "365days";

const DATE_RANGE_LABELS: Record<HistoryDateRange, string> = {
  all: "Tất cả",
  today: "Hôm nay",
  "7days": "1 tuần",
  "30days": "1 tháng",
  "365days": "1 năm",
};

/**
 * Tính dateFrom/dateTo theo range.
 * Dùng LOCAL time (server đang chạy GMT+7 — cùng TZ user) để "Hôm nay"
 * đúng khung giờ local. dateFrom inclusive, dateTo inclusive cuối ngày.
 */
function computeDateRange(range: HistoryDateRange): {
  dateFrom: string | undefined;
  dateTo: string | undefined;
} {
  if (range === "all") return { dateFrom: undefined, dateTo: undefined };

  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  if (range === "today") {
    return { dateFrom: start.toISOString(), dateTo: end.toISOString() };
  }

  const days = range === "7days" ? 7 : range === "30days" ? 30 : 365;
  const from = new Date(start);
  from.setDate(from.getDate() - (days - 1)); // "1 tuần" = 7 ngày gần nhất bao gồm hôm nay

  return {
    dateFrom: from.toISOString(),
    dateTo: end.toISOString(),
  };
}

// ── Page ───────────────────────────────────────────────────────────────────

export function ValidatePage() {
  const [voucherCode, setVoucherCode] = useState("");
  const [validateResult, setValidateResult] = useState<ValidateResponse | null>(null);
  const [confirmResult, setConfirmResult] = useState<ConfirmResponse | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState<number | undefined>(
    undefined,
  );
  const [validating, setValidating] = useState(false);
  const [validatingError, setValidatingError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  // History state — load danh sách redemptions gần đây (Owner: tất cả chi nhánh)
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  // Date range filter cho bảng lịch sử. "all" = không filter.
  const [dateRange, setDateRange] = useState<HistoryDateRange>("all");

  async function loadHistory(range: HistoryDateRange = dateRange) {
    setHistoryLoading(true);
    try {
      const { dateFrom, dateTo } = computeDateRange(range);
      const res = await apiGetRedemptionHistory({
        limit: 20,
        page: 1,
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo }),
      });
      setHistory(res.data);
    } catch {
      // Im lặng — bảng lịch sử là thông tin phụ, không block flow validate
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }

  useEffect(() => {
    loadHistory(dateRange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]);

  // ── Step 1: Submit → Validate ──────────────────────────────────────────
  async function handleValidate(e?: React.FormEvent) {
    e?.preventDefault();
    const code = voucherCode.trim();
    if (!code) {
      toast.error("Vui lòng nhập mã voucher");
      return;
    }

    setValidateResult(null);
    setConfirmResult(null);
    setValidatingError(null);
    setValidating(true);

    try {
      const res = await apiValidateVoucher(code);
      setValidateResult(res);

      if (res.success) {
        toast.success("Voucher hợp lệ");
        // Auto-select branch đầu tiên nếu có (cho Owner)
        const first = res.data.applicableBranches?.[0];
        if (first) setSelectedBranchId(first.branchId);
      } else {
        toast.error(res.error.message);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Không thể xác thực voucher";
      toast.error(message);
      setValidatingError(message);
      setValidateResult(null);
    } finally {
      setValidating(false);
    }
  }

  // ── Step 2: Reset ──────────────────────────────────────────────────────
  function handleReset() {
    setVoucherCode("");
    setValidateResult(null);
    setConfirmResult(null);
    setSelectedBranchId(undefined);
  }

  // ── Step 3: Confirm ────────────────────────────────────────────────────
  async function handleConfirm() {
    if (!validateResult?.success) return;
    const code = validateResult.data.voucherCode;

    setConfirming(true);
    try {
      const res = await apiConfirmVoucher(code, selectedBranchId);
      setConfirmResult(res);

      if (res.success) {
        toast.success(res.message);
        // Reload history để lịch sử cập nhật ngay
        loadHistory(dateRange);
      } else {
        toast.error(res.error.message);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Không thể xác nhận voucher";
      toast.error(message);
    } finally {
      setConfirming(false);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px" }}>
      <h1
        style={{
          fontFamily: "Manrope, sans-serif",
          fontSize: 28,
          fontWeight: 800,
          color: C.text,
          marginBottom: 8,
        }}
      >
        Xác thực Voucher
      </h1>
      <p
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: 14,
          color: C.textSecondary,
          marginBottom: 32,
        }}
      >
        Nhập mã voucher để kiểm tra và xác nhận sử dụng
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
          gap: 24,
          alignItems: "start",
        }}
      >
        {/* ── LEFT: Validate form + result ── */}
        <div>
          <form
            onSubmit={handleValidate}
            style={{
              background: C.bgCard,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              padding: 24,
              marginBottom: 24,
            }}
          >
            <label
              style={{
                display: "block",
                fontFamily: "Inter, sans-serif",
                fontSize: 13,
                fontWeight: 600,
                color: C.text,
                marginBottom: 8,
              }}
            >
              Mã voucher
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="text"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                placeholder="EVR-XXXX-XXXX"
                disabled={validating || !!confirmResult?.success}
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  border: `1.5px solid ${C.border}`,
                  borderRadius: 12,
                  fontSize: 14,
                  fontFamily: "Manrope, sans-serif",
                  fontWeight: 600,
                  letterSpacing: 1,
                  outline: "none",
                  background: C.bgPage,
                  color: C.text,
                  textTransform: "uppercase",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = C.primary;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = C.border;
                }}
              />
              <button
                type="submit"
                disabled={validating || !voucherCode.trim() || !!confirmResult?.success}
                style={{
                  padding: "12px 24px",
                  background: C.primary,
                  color: "white",
                  border: "none",
                  borderRadius: 12,
                  fontSize: 14,
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 700,
                  cursor: validating ? "not-allowed" : "pointer",
                  opacity: validating || !voucherCode.trim() ? 0.6 : 1,
                }}
              >
                {validating ? "Đang kiểm tra..." : "Kiểm tra"}
              </button>
            </div>
            {validatingError && (
              <div
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 12,
                  color: C.error,
                  marginTop: 8,
                }}
              >
                {validatingError}
              </div>
            )}
          </form>

          {/* ── Result card ── */}
          {validateResult && (
            <VoucherResult
              result={validateResult}
              confirming={confirming}
              selectedBranchId={selectedBranchId}
              onBranchChange={setSelectedBranchId}
              onConfirm={handleConfirm}
              onReset={handleReset}
              confirmResult={confirmResult}
            />
          )}
        </div>

        {/* ── RIGHT: History table ── */}
        <HistoryPanel
          items={history}
          loading={historyLoading}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
      </div>
    </div>
  );
}

// ── Result Component ───────────────────────────────────────────────────────

function VoucherResult({
  result,
  confirming,
  selectedBranchId,
  onBranchChange,
  onConfirm,
  onReset,
  confirmResult,
}: {
  result: ValidateResponse;
  confirming: boolean;
  selectedBranchId: number | undefined;
  onBranchChange: (id: number | undefined) => void;
  onConfirm: () => void;
  onReset: () => void;
  confirmResult: ConfirmResponse | null;
}) {
  // ── Error case ──
  if (!result.success) {
    const meta = STATUS_META[result.status];
    return (
      <div
        style={{
          background: C.bgCard,
          border: `1px solid ${meta.color}33`,
          borderRadius: 12,
          padding: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 12,
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "6px 12px",
              borderRadius: 999,
              fontFamily: "Inter, sans-serif",
              fontSize: 12,
              fontWeight: 700,
              color: meta.color,
              background: meta.bgColor,
            }}
          >
            {meta.label}
          </span>
        </div>
        <p
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: 14,
            color: C.text,
            marginBottom: 16,
          }}
        >
          {result.error.message}
        </p>
        <button
          onClick={onReset}
          style={{
            padding: "10px 20px",
            background: C.bgPage,
            color: C.text,
            border: `1px solid ${C.border}`,
            borderRadius: 10,
            fontSize: 13,
            fontFamily: "Inter, sans-serif",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Kiểm tra mã khác
        </button>
      </div>
    );
  }

  // ── Success case ──
  const data: ValidatedVoucherData = result.data;

  // Nếu đã confirm thành công → success banner
  if (confirmResult?.success) {
    const usedAt = confirmResult.data.usedAt
      ? formatDate(confirmResult.data.usedAt)
      : "—";
    // Ưu tiên branchName từ backend (đã được fix). Fallback lookup ở client
    // phòng trường hợp response cũ không có branchName.
    const branchNameFromBackend = confirmResult.data.branchName;
    const branch =
      branchNameFromBackend ??
      data.applicableBranches.find(
        (b: BranchInfo) => b.branchId === confirmResult.data.usedAtBranchId,
      )?.branchName ??
      null;

    return (
      <div
        style={{
          background: C.bgCard,
          border: `1px solid #10B981`,
          borderRadius: 12,
          padding: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "#ECFDF5",
              color: "#10B981",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div>
            <h2
              style={{
                fontFamily: "Manrope, sans-serif",
                fontSize: 18,
                fontWeight: 800,
                color: C.text,
                margin: 0,
              }}
            >
              Xác nhận sử dụng thành công
            </h2>
            <p
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: 13,
                color: C.textSecondary,
                margin: 0,
              }}
            >
              Voucher đã được đánh dấu sử dụng
            </p>
          </div>
        </div>

        <div
          style={{
            padding: 16,
            background: C.bgPage,
            borderRadius: 10,
            marginBottom: 16,
          }}
        >
          <DetailRow label="Mã voucher" value={confirmResult.data.voucherCode} mono />
          <DetailRow label="Thời gian sử dụng" value={usedAt} />
          <DetailRow
            label="Chi nhánh"
            value={branch ?? `Branch #${confirmResult.data.usedAtBranchId}`}
          />
        </div>

        <button
          onClick={onReset}
          style={{
            width: "100%",
            padding: "12px",
            background: C.primary,
            color: "white",
            border: "none",
            borderRadius: 10,
            fontSize: 14,
            fontFamily: "Inter, sans-serif",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Xác thực mã khác
        </button>
      </div>
    );
  }

  // ── Valid → show info + confirm button ──
  return (
    <div
      style={{
        background: C.bgCard,
        border: `1px solid #10B981`,
        borderRadius: 12,
        padding: 24,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "6px 12px",
            borderRadius: 999,
            fontFamily: "Inter, sans-serif",
            fontSize: 12,
            fontWeight: 700,
            color: "#10B981",
            background: "#ECFDF5",
          }}
        >
          Hợp lệ
        </span>
      </div>

      {/* Voucher info */}
      <h2
        style={{
          fontFamily: "Manrope, sans-serif",
          fontSize: 20,
          fontWeight: 800,
          color: C.text,
          margin: "0 0 4px",
        }}
      >
        {data.voucher.title}
      </h2>
      <p
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: 13,
          color: C.textSecondary,
          margin: "0 0 16px",
        }}
      >
        {data.voucher.partnerName}
      </p>

      <div
        style={{
          padding: 16,
          background: C.bgPage,
          borderRadius: 10,
          marginBottom: 16,
        }}
      >
        <DetailRow label="Mã voucher" value={data.voucherCode} mono />
        <DetailRow label="Khách hàng" value={data.customer.fullName ?? "—"} />
        <DetailRow label="Email" value={data.customer.email} />
        {data.customer.phoneNumber && (
          <DetailRow label="Số điện thoại" value={data.customer.phoneNumber} />
        )}
        <DetailRow label="Hiệu lực từ" value={formatDate(data.validFrom)} />
        <DetailRow label="Hết hạn" value={formatDate(data.validTo)} />
      </div>

      {/* Branch selection (Owner có thể chọn; chỉ 1 branch thì auto-chọn) */}
      {data.applicableBranches.length > 1 && (
        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              display: "block",
              fontFamily: "Inter, sans-serif",
              fontSize: 13,
              fontWeight: 600,
              color: C.text,
              marginBottom: 8,
            }}
          >
            Chi nhánh xác nhận
          </label>
          <select
            value={selectedBranchId ?? ""}
            onChange={(e) => onBranchChange(Number(e.target.value))}
            style={{
              width: "100%",
              padding: "10px 12px",
              border: `1.5px solid ${C.border}`,
              borderRadius: 10,
              fontSize: 14,
              fontFamily: "Inter, sans-serif",
              color: C.text,
              background: C.bgPage,
            }}
          >
            {data.applicableBranches.map((b) => (
              <option key={b.branchId} value={b.branchId}>
                {b.branchName}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={onReset}
          style={{
            flex: 1,
            padding: "12px",
            background: C.bgPage,
            color: C.text,
            border: `1px solid ${C.border}`,
            borderRadius: 10,
            fontSize: 14,
            fontFamily: "Inter, sans-serif",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Hủy
        </button>
        <button
          onClick={onConfirm}
          disabled={confirming}
          style={{
            flex: 2,
            padding: "12px",
            background: "#10B981",
            color: "white",
            border: "none",
            borderRadius: 10,
            fontSize: 14,
            fontFamily: "Inter, sans-serif",
            fontWeight: 700,
            cursor: confirming ? "not-allowed" : "pointer",
            opacity: confirming ? 0.6 : 1,
          }}
        >
          {confirming ? "Đang xác nhận..." : "Xác nhận sử dụng voucher"}
        </button>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "6px 0",
        borderBottom: `1px solid ${C.border}`,
        fontFamily: "Inter, sans-serif",
        fontSize: 13,
      }}
    >
      <span style={{ color: C.textSecondary }}>{label}</span>
      <span
        style={{
          color: C.text,
          fontWeight: 600,
          fontFamily: mono ? "Manrope, sans-serif" : "Inter, sans-serif",
          letterSpacing: mono ? 1 : 0,
        }}
      >
        {value}
      </span>
    </div>
  );
}

// ── History Panel ─────────────────────────────────────────────────────────

function formatShort(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function HistoryPanel({
  items,
  loading,
  dateRange,
  onDateRangeChange,
}: {
  items: HistoryItem[];
  loading: boolean;
  dateRange: HistoryDateRange;
  onDateRangeChange: (r: HistoryDateRange) => void;
}) {
  return (
    <div
      style={{
        background: C.bgCard,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        overflow: "hidden",
        position: "sticky",
        top: 16,
      }}
    >
      <div
        style={{
          padding: "16px 20px",
          borderBottom: `1px solid ${C.border}`,
          background: C.bgPage,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <h2
            style={{
              fontFamily: "Manrope, sans-serif",
              fontSize: 16,
              fontWeight: 700,
              color: C.text,
              margin: 0,
            }}
          >
            Lịch sử xác thực
          </h2>
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 12,
              color: C.textMuted,
            }}
          >
            {items.length} giao dịch
          </span>
        </div>

        {/* Date range pills */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
          }}
        >
          {(Object.keys(DATE_RANGE_LABELS) as HistoryDateRange[]).map((r) => {
            const active = r === dateRange;
            return (
              <button
                key={r}
                type="button"
                onClick={() => onDateRangeChange(r)}
                disabled={loading}
                style={{
                  padding: "6px 12px",
                  background: active ? C.primary : C.bgCard,
                  color: active ? "#FFFFFF" : C.text,
                  border: `1px solid ${active ? C.primary : C.border}`,
                  borderRadius: 999,
                  fontSize: 12,
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 600,
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading && !active ? 0.6 : 1,
                  transition: "all 0.15s",
                }}
              >
                {DATE_RANGE_LABELS[r]}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div
          style={{
            padding: "32px 16px",
            textAlign: "center",
            fontFamily: "Inter, sans-serif",
            fontSize: 13,
            color: C.textMuted,
          }}
        >
          Đang tải...
        </div>
      ) : items.length === 0 ? (
        <div
          style={{
            padding: "48px 16px",
            textAlign: "center",
            fontFamily: "Inter, sans-serif",
            fontSize: 13,
            color: C.textMuted,
          }}
        >
          Chưa có giao dịch xác thực nào
        </div>
      ) : (
        <div style={{ maxHeight: 640, overflowY: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ position: "sticky", top: 0, background: C.bgCard, zIndex: 1 }}>
              <tr>
                <HTh>Mã</HTh>
                <HTh>Khách hàng</HTh>
                <HTh>Chi nhánh</HTh>
                <HTh align="right">Thời gian</HTh>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr
                  key={it.issuedVoucherId}
                  style={{ borderBottom: `1px solid ${C.border}` }}
                >
                  <td style={{ padding: "12px 16px" }}>
                    <div
                      style={{
                        fontFamily: "Manrope, sans-serif",
                        fontSize: 13,
                        fontWeight: 700,
                        color: C.primary,
                      }}
                    >
                      {it.voucherCode}
                    </div>
                    <div
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: 11,
                        color: C.textMuted,
                        marginTop: 2,
                        maxWidth: 200,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={it.voucherTitle}
                    >
                      {it.voucherTitle}
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: 13,
                        color: C.text,
                        maxWidth: 160,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={it.customerName ?? it.customerEmail}
                    >
                      {it.customerName ?? it.customerEmail}
                    </div>
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      fontFamily: "Inter, sans-serif",
                      fontSize: 13,
                      color: C.text,
                    }}
                  >
                    {it.branchName}
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      textAlign: "right",
                      fontFamily: "Inter, sans-serif",
                      fontSize: 12,
                      color: C.textSecondary,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {formatShort(it.usedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function HTh({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      style={{
        padding: "10px 16px",
        textAlign: align,
        fontFamily: "Manrope, sans-serif",
        fontSize: 12,
        fontWeight: 700,
        color: C.textSecondary,
        textTransform: "uppercase",
        letterSpacing: 0.5,
      }}
    >
      {children}
    </th>
  );
}