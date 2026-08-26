import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiGetBranch } from "../services/branch.service";
import { ApiException } from "../services/api-client";
import { CashierManagement } from "../components/branch/CashierManagement";
import type { BranchDetail } from "../types/branch";

// ── Design tokens ───────────────────────────────────────────────────────────────
const COLORS = {
  primary: "#0E76A8",
  primaryHover: "#0A5C87",
  text: "#1E293B",
  textSecondary: "#64748B",
  textMuted: "#94A3B8",
  border: "#E2E8F0",
  bgPage: "#F8FAFC",
  error: "#EF4444",
  success: "#10B981",
  warning: "#F59E0B",
} as const;

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Component ───────────────────────────────────────────────────────────────
export function BranchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const parsedId = id ? Number(id) : NaN;
  const branchId = Number.isFinite(parsedId) && parsedId > 0 ? parsedId : null;
  const invalidId = branchId === null;

  const [branch, setBranch] = useState<BranchDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const fetchBranch = async (idToLoad: number) => {
    try {
      const data = await apiGetBranch(idToLoad);
      setBranch(data);
    } catch (err) {
      if (err instanceof ApiException && err.statusCode === 404) {
        setNotFound(true);
      } else {
        setError(
          err instanceof Error
            ? err.message
            : "Không thể tải chi tiết chi nhánh",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (invalidId) return;
    let cancelled = false;
    (async () => {
      if (cancelled) return;
      await fetchBranch(branchId!);
    })();
    return () => {
      cancelled = true;
    };
    // We intentionally do not depend on `fetchBranch` — it captures the latest
    // state setters via React's stable references. branchId is the real driver.
  }, [branchId, invalidId]);

  const handleBack = () => navigate("/branches");

  return (
    <div style={{ background: COLORS.bgPage, minHeight: "100vh" }}>
      {/* ── Page Header ──────────────────────────────── */}
      <div
        style={{
          background: "white",
          borderBottom: `1px solid ${COLORS.border}`,
          padding: "24px 0",
        }}
      >
        <div className="partner-container">
          {/* Breadcrumb */}
          <div
            style={{
              marginBottom: 12,
              fontSize: 13,
              color: COLORS.textSecondary,
            }}
          >
            <Link
              to="/branches"
              style={{
                color: COLORS.primary,
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Quản lý Chi nhánh
            </Link>
            <span style={{ margin: "0 8px" }}>/</span>
            <span style={{ color: COLORS.text, fontWeight: 600 }}>
              Chi tiết chi nhánh
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <div>
              <h1
                style={{
                  fontFamily: "Manrope, sans-serif",
                  fontSize: 28,
                  fontWeight: 800,
                  color: COLORS.text,
                  marginBottom: 4,
                }}
              >
                Chi tiết Chi nhánh
              </h1>
              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 14,
                  color: COLORS.textSecondary,
                }}
              >
                Xem thông tin chi tiết của chi nhánh
              </p>
            </div>
            <button
              type="button"
              onClick={handleBack}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "10px 18px",
                background: "white",
                color: COLORS.textSecondary,
                fontFamily: "Inter, sans-serif",
                fontSize: 14,
                fontWeight: 600,
                borderRadius: 10,
                border: `1.5px solid ${COLORS.border}`,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = COLORS.primary;
                e.currentTarget.style.color = COLORS.primary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = COLORS.border;
                e.currentTarget.style.color = COLORS.textSecondary;
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Quay lại
            </button>
          </div>
        </div>
      </div>

      {/* ── Content ───────────────────────────────────── */}
      <div
        className="partner-container" style={{ paddingTop: 24, paddingBottom: 48 }}
      >
        {loading ? (
          <DetailSkeleton />
        ) : invalidId || notFound ? (
          <EmptyState
            icon={
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke={COLORS.textMuted}
                strokeWidth="1.5"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            }
            title="Không tìm thấy chi nhánh"
            description="Chi nhánh này không tồn tại hoặc đã bị xóa."
            action={
              <button
                onClick={handleBack}
                style={{
                  padding: "10px 24px",
                  background: COLORS.primary,
                  color: "white",
                  border: "none",
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Quay lại danh sách
              </button>
            }
          />
        ) : error ? (
          <EmptyState
            icon={
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke={COLORS.error}
                strokeWidth="1.5"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            }
            title="Đã xảy ra lỗi"
            description={error}
            action={
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: "10px 24px",
                  background: COLORS.primary,
                  color: "white",
                  border: "none",
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Thử lại
              </button>
            }
          />
        ) : branch ? (
          <BranchDetailView
            branch={branch}
            onRefresh={() => branch && fetchBranch(branch.branchId)}
          />
        ) : null}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}

// ── Detail view ────────────────────────────────────────────────────────────────
function BranchDetailView({
  branch,
  onRefresh,
}: {
  branch: BranchDetail;
  onRefresh: () => void;
}) {
  return (
    <div
      className="detail-split-grid"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 380px",
        gap: 24,
        alignItems: "start",
      }}
    >
      {/* LEFT: Info */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Card: Thông tin chi nhánh */}
        <InfoCard
          title="Thông tin chi nhánh"
          iconBg="#E8F4FA"
          iconColor={COLORS.primary}
        >
          <Field label="Tên chi nhánh" value={branch.branchName} />
          <Field label="Địa chỉ" value={branch.address} multiline />
          <Field label="Tỉnh/Thành phố" value={branch.city} />
          <Field label="Số điện thoại" value={branch.phoneNumber} />
          <Field label="Ngày tạo" value={formatDate(branch.createdAt)} />
        </InfoCard>

        {/* Card: Voucher áp dụng */}
        <InfoCard
          title="Voucher áp dụng"
          iconBg="#ECFDF5"
          iconColor={COLORS.success}
          headerExtra={
            <Link
              to={`/vouchers/create?branch=${branch.branchId}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 14px",
                background: COLORS.primary,
                color: "white",
                fontFamily: "Inter, sans-serif",
                fontSize: 12,
                fontWeight: 700,
                borderRadius: 8,
                textDecoration: "none",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = COLORS.primaryHover)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = COLORS.primary)
              }
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Tạo Voucher cho chi nhánh
            </Link>
          }
        >
          {branch.voucherBranches.length === 0 ? (
            <EmptyVoucherList branchId={branch.branchId} />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {branch.voucherBranches.map((vb) => (
                <BranchVoucherItem
                  key={vb.voucher.voucherId}
                  voucher={vb.voucher}
                />
              ))}
            </div>
          )}
        </InfoCard>
      </div>

      {/* RIGHT: Sidebar */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 20,
          position: "sticky",
          top: 24,
        }}
      >
        {/* Edit CTA */}
        <Link
          to={`/branches/${branch.branchId}/edit`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            width: "100%",
            padding: "12px 24px",
            background: COLORS.primary,
            color: "white",
            border: "none",
            borderRadius: 10,
            fontFamily: "Inter, sans-serif",
            fontSize: 14,
            fontWeight: 700,
            textDecoration: "none",
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = COLORS.primaryHover)
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = COLORS.primary)
          }
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Chỉnh sửa chi nhánh
        </Link>

        {/* Cashier Management */}
        <CashierManagement branch={branch} onRefresh={onRefresh} />
      </div>
    </div>
  );
}

// ── Voucher item trong Branch Detail ─────────────────────────────────────────────
function BranchVoucherItem({
  voucher,
}: {
  voucher: NonNullable<BranchDetail["voucherBranches"][number]>["voucher"];
}) {
  const approvalLabel =
    voucher.approvalStatus === "Approved"
      ? "Đã duyệt"
      : voucher.approvalStatus === "Draft"
        ? "Nháp"
        : voucher.approvalStatus === "Pending"
          ? "Chờ duyệt"
          : "Từ chối";
  const approvalColor =
    voucher.approvalStatus === "Approved"
      ? COLORS.success
      : voucher.approvalStatus === "Rejected"
        ? COLORS.error
        : "#F59E0B";
  const approvalBg =
    voucher.approvalStatus === "Approved"
      ? "#ECFDF5"
      : voucher.approvalStatus === "Rejected"
        ? "#FEF2F2"
        : "#FEF3C7";

  // Sale + original price
  const saleText = Number(voucher.salePrice).toLocaleString("vi-VN") + "đ";
  const originalText =
    Number(voucher.originalPrice).toLocaleString("vi-VN") + "đ";
  const discount = Math.round(
    (1 - Number(voucher.salePrice) / Number(voucher.originalPrice)) * 100,
  );

  // Period
  const periodText = `${formatDateShort(voucher.startDate)} – ${formatDateShort(voucher.endDate)}`;

  const imageUrl =
    voucher.imageUrl ||
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop";

  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        padding: 12,
        background: COLORS.bgPage,
        borderRadius: 12,
        border: "1px solid #F1F5F9",
        transition: "all 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#F8FAFC";
        e.currentTarget.style.borderColor = COLORS.primary;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = COLORS.bgPage;
        e.currentTarget.style.borderColor = "#F1F5F9";
      }}
    >
      {/* Thumbnail */}
      <img
        src={imageUrl}
        alt={voucher.title}
        style={{
          width: 80,
          height: 60,
          borderRadius: 10,
          objectFit: "cover",
          flexShrink: 0,
        }}
      />

      {/* Info */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            flexWrap: "wrap",
          }}
        >
          <h4
            style={{
              fontFamily: "Manrope, sans-serif",
              fontSize: 14,
              fontWeight: 700,
              color: COLORS.text,
              margin: 0,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              flex: 1,
              minWidth: 0,
            }}
          >
            {voucher.title}
          </h4>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: approvalColor,
              background: approvalBg,
              padding: "2px 8px",
              borderRadius: 5,
              whiteSpace: "nowrap",
            }}
          >
            {approvalLabel}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 12,
            color: COLORS.textSecondary,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{ display: "inline-flex", alignItems: "center", gap: 3 }}
          >
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
              <line x1="4" y1="22" x2="4" y2="15" />
            </svg>
            {voucher.category.categoryName}
          </span>
          <span>
            SL: {voucher.availableQuantity}/{voucher.totalQuantity}
          </span>
          <span>{periodText}</span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 8,
            marginTop: 2,
          }}
        >
          <span
            style={{
              fontSize: 11,
              color: COLORS.textMuted,
              textDecoration: "line-through",
            }}
          >
            {originalText}
          </span>
          <span
            style={{ fontSize: 15, fontWeight: 800, color: COLORS.primary }}
          >
            {saleText}
          </span>
          {discount > 0 && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "white",
                background: COLORS.error,
                padding: "1px 6px",
                borderRadius: 5,
              }}
            >
              -{discount}%
            </span>
          )}
        </div>
      </div>

      {/* View action */}
      <Link
        to={`/vouchers/${voucher.voucherId}`}
        style={{
          alignSelf: "center",
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          padding: "7px 12px",
          border: `1px solid ${COLORS.border}`,
          borderRadius: 8,
          fontSize: 12,
          fontWeight: 600,
          color: COLORS.textSecondary,
          background: "white",
          textDecoration: "none",
          flexShrink: 0,
          transition: "all 0.15s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = COLORS.primary;
          e.currentTarget.style.color = COLORS.primary;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = COLORS.border;
          e.currentTarget.style.color = COLORS.textSecondary;
        }}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        Xem
      </Link>
    </div>
  );
}

// Empty state trong Voucher list (CTA inline)
function EmptyVoucherList({ branchId }: { branchId: number }) {
  return (
    <div
      style={{
        padding: "28px 20px",
        textAlign: "center",
        background: "white",
        borderRadius: 12,
        border: `1px dashed ${COLORS.border}`,
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: "#F1F5F9",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 10,
        }}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke={COLORS.textMuted}
          strokeWidth="1.5"
        >
          <path d="M20 12v10H4V12" />
          <path d="M2 7h20v5H2z" />
          <path d="M12 22V7" />
          <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
          <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
        </svg>
      </div>
      <p
        style={{
          fontSize: 13,
          color: COLORS.textSecondary,
          marginBottom: 14,
          margin: "0 0 14px 0",
        }}
      >
        Chưa có voucher nào áp dụng cho chi nhánh này
      </p>
      <Link
        to={`/vouchers/create?branch=${branchId}`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "8px 16px",
          background: COLORS.primary,
          color: "white",
          fontFamily: "Inter, sans-serif",
          fontSize: 12,
          fontWeight: 700,
          borderRadius: 8,
          textDecoration: "none",
        }}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Tạo Voucher đầu tiên
      </Link>
    </div>
  );
}

// Date short helper for voucher period
function formatDateShort(d: string): string {
  return new Date(d).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// ── Reusable blocks ─────────────────────────────────────────────────────────────
function InfoCard({
  title,
  iconBg,
  iconColor,
  children,
  headerExtra,
}: {
  title: string;
  iconBg: string;
  iconColor: string;
  children: React.ReactNode;
  headerExtra?: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: 16,
        padding: 24,
        border: "1px solid #F1F5F9",
        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <h2
          style={{
            fontFamily: "Manrope, sans-serif",
            fontSize: 16,
            fontWeight: 700,
            color: COLORS.text,
            display: "flex",
            alignItems: "center",
            gap: 10,
            margin: 0,
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 32,
              height: 32,
              background: iconBg,
              borderRadius: 8,
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke={iconColor}
              strokeWidth="2"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </span>
          {title}
        </h2>
        {headerExtra}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {children}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  multiline,
}: {
  label: string;
  value: React.ReactNode;
  multiline?: boolean;
}) {
  return (
    <div>
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: COLORS.textMuted,
          textTransform: "uppercase",
          letterSpacing: 0.4,
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 14,
          color: COLORS.text,
          fontWeight: 500,
          whiteSpace: multiline ? "pre-wrap" : "normal",
          wordBreak: "break-word",
        }}
      >
        {value || "—"}
      </div>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "64px 24px",
        background: "white",
        borderRadius: 16,
        border: `1px solid ${COLORS.border}`,
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 20,
          background: "#F1F5F9",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
        }}
      >
        {icon}
      </div>
      <h3
        style={{
          fontFamily: "Manrope, sans-serif",
          fontSize: 18,
          fontWeight: 700,
          color: COLORS.text,
          marginBottom: 8,
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: 14,
          color: COLORS.textSecondary,
          marginBottom: 24,
        }}
      >
        {description}
      </p>
      {action}
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div
      className="detail-split-grid"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 380px",
        gap: 24,
        alignItems: "start",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {[1, 2].map((i) => (
          <div
            key={i}
            style={{
              background: "white",
              borderRadius: 16,
              padding: 24,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <div
              style={{
                width: "30%",
                height: 18,
                borderRadius: 6,
                background: "#E2E8F0",
                marginBottom: 16,
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            />
            <div
              style={{
                width: "90%",
                height: 14,
                borderRadius: 6,
                background: "#F1F5F9",
                marginBottom: 8,
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            />
            <div
              style={{
                width: "70%",
                height: 14,
                borderRadius: 6,
                background: "#F1F5F9",
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
