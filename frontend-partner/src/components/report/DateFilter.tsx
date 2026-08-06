import { useState } from "react";
import { REPORT_COLORS } from "./report.constants";
import type { DatePreset } from "../../types/report";

const PRESETS: { label: string; value: DatePreset }[] = [
  { label: "Hôm nay", value: "today" },
  { label: "7 ngày", value: "last7days" },
  { label: "30 ngày", value: "last30days" },
  { label: "90 ngày", value: "last90days" },
  { label: "Năm nay", value: "thisYear" },
  { label: "Tùy chỉnh", value: "custom" },
];

interface DateFilterProps {
  value: DatePreset | "custom";
  fromDate?: string;
  toDate?: string;
  /** Called immediately when a preset chip is clicked. */
  onChange: (preset: DatePreset | "custom") => void;
  /**
   * Called only when the user clicks "Áp dụng" while in "custom" mode.
   * Receives the validated from/to strings.
   */
  onApply: (fromDate: string, toDate: string) => void;
}

export function DateFilter({ value, fromDate, toDate, onChange, onApply }: DateFilterProps) {
  const isCustom = value === "custom";

  // Local draft state — represents what the user is currently editing in the
  // date inputs. Only flushed to the parent via "Áp dụng".
  const [draftFrom, setDraftFrom] = useState<string>(fromDate ?? "");
  const [draftTo, setDraftTo] = useState<string>(toDate ?? "");

  // Resync the draft when the parent's applied range changes (preset switch,
  // external reset, or after Apply). Uses the "previous props" pattern
  // (mirrors VoucherForm.tsx) to stay compatible with the project's
  // react-hooks/set-state-in-effect lint rule.
  const [prevApplied, setPrevApplied] = useState({ fromDate, toDate });
  if (prevApplied.fromDate !== fromDate || prevApplied.toDate !== toDate) {
    setPrevApplied({ fromDate, toDate });
    setDraftFrom(fromDate ?? "");
    setDraftTo(toDate ?? "");
  }

  const handlePreset = (preset: DatePreset) => {
    onChange(preset);
  };

  // ── Validation for the "Áp dụng" button ───────────────────────────────────
  const hasBothDates = draftFrom !== "" && draftTo !== "";
  const rangeInvalid = hasBothDates && new Date(draftFrom) > new Date(draftTo);
  const unchanged = draftFrom === (fromDate ?? "") && draftTo === (toDate ?? "");
  const canApply = hasBothDates && !rangeInvalid && !unchanged;

  const handleApply = () => {
    if (!canApply) return;
    onApply(draftFrom, draftTo);
  };

  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
      {PRESETS.map((p) => (
        <button
          key={p.value}
          type="button"
          onClick={() => handlePreset(p.value)}
          style={{
            padding: "7px 16px",
            borderRadius: 8,
            border: value === p.value
              ? `1.5px solid ${REPORT_COLORS.primary}`
              : `1.5px solid ${REPORT_COLORS.border}`,
            background: value === p.value ? "#E8F4FA" : "white",
            color: value === p.value ? REPORT_COLORS.primary : REPORT_COLORS.textSecondary,
            fontFamily: "Inter, sans-serif",
            fontSize: 13, fontWeight: value === p.value ? 700 : 500,
            cursor: "pointer", transition: "all 0.15s",
          }}
        >
          {p.label}
        </button>
      ))}

      {isCustom && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <input
            type="date"
            value={draftFrom}
            max={draftTo || undefined}
            onChange={(e) => setDraftFrom(e.target.value)}
            style={{
              padding: "7px 12px", borderRadius: 8,
              border: `1.5px solid ${REPORT_COLORS.border}`,
              background: REPORT_COLORS.bgPage,
              fontFamily: "Inter, sans-serif", fontSize: 13,
              color: REPORT_COLORS.text, outline: "none",
            }}
          />
          <span style={{ fontSize: 12, color: REPORT_COLORS.textMuted }}>—</span>
          <input
            type="date"
            value={draftTo}
            min={draftFrom || undefined}
            onChange={(e) => setDraftTo(e.target.value)}
            style={{
              padding: "7px 12px", borderRadius: 8,
              border: `1.5px solid ${REPORT_COLORS.border}`,
              background: REPORT_COLORS.bgPage,
              fontFamily: "Inter, sans-serif", fontSize: 13,
              color: REPORT_COLORS.text, outline: "none",
            }}
          />
          <button
            type="button"
            onClick={handleApply}
            disabled={!canApply}
            style={{
              padding: "7px 16px", borderRadius: 8,
              border: `1.5px solid ${canApply ? REPORT_COLORS.primary : REPORT_COLORS.border}`,
              background: canApply ? REPORT_COLORS.primary : REPORT_COLORS.bgPage,
              color: canApply ? "white" : REPORT_COLORS.textMuted,
              fontFamily: "Inter, sans-serif",
              fontSize: 13, fontWeight: 700,
              cursor: canApply ? "pointer" : "not-allowed",
              transition: "all 0.15s",
            }}
          >
            Áp dụng
          </button>
          {rangeInvalid && (
            <span style={{
              fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 500,
              color: REPORT_COLORS.error,
            }}>
              Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc.
            </span>
          )}
        </div>
      )}
    </div>
  );
}
