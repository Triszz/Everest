import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { voucherApi, categoryApi, partnerApi } from "../services";
import type { Voucher, Category, Partner } from "../services";
import { Breadcrumb } from "../components/Breadcrumb";
import {
  DISCOUNT_OPTIONS,
  PRICE_OPTIONS,
  SORT_OPTIONS,
  AREA_OPTIONS,
  VALIDITY_OPTIONS,
} from "../utils";
import { useDebounce } from "../hooks";
import {
  Search,
  SlidersHorizontal,
  X,
  Star,
  Loader2,
  Utensils,
  Coffee,
  Sandwich,
  Milk,
  Pizza,
  Cake,
  Dumbbell,
  Scissors,
  Gamepad2,
  Plane,
  Building2,
  Film,
  User,
  Gem,
  Tag,
  LayoutGrid,
  MapPin,
  Store,
  ChevronDown,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const CATEGORY_ICONS: Record<number, React.ElementType> = {
  1: Utensils,
  2: Coffee,
  3: Sandwich,
  4: Milk,
  5: Pizza,
  6: Cake,
  7: Dumbbell,
  8: Scissors,
  9: Gamepad2,
  10: Plane,
  11: Building2,
  12: Film,
  13: Scissors,
  14: Dumbbell,
  15: Cake,
};

function CategoryIcon({ catId, size = 15 }: { catId: number; size?: number }) {
  const Icon = CATEGORY_ICONS[catId] || Tag;
  return <Icon size={size} />;
}

// ── Skeleton loading card ────────────────────────────────────────────────────
function VoucherSkeleton() {
  return (
    <div
      style={{
        background: "white",
        borderRadius: 16,
        overflow: "hidden",
        border: "1px solid #F1F5F9",
      }}
    >
      <div
        style={{
          height: 150,
          background: "linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.5s infinite",
        }}
      />
      <div style={{ padding: "12px 14px 14px" }}>
        <div
          style={{
            height: 14,
            width: "80%",
            borderRadius: 4,
            background: "#f0f0f0",
            marginBottom: 8,
            animation: "shimmer 1.5s infinite",
          }}
        />
        <div
          style={{
            height: 14,
            width: "50%",
            borderRadius: 4,
            background: "#f0f0f0",
            marginBottom: 12,
            animation: "shimmer 1.5s infinite",
          }}
        />
        <div
          style={{
            height: 12,
            width: "40%",
            borderRadius: 4,
            background: "#f0f0f0",
            animation: "shimmer 1.5s infinite",
          }}
        />
      </div>
    </div>
  );
}

// ── Prefetch hook (phương pháp C: prefetch khi hover) ───────────────────
function usePrefetch() {
  const prefetchedRef = useRef<Set<number>>(new Set());

  const prefetch = useCallback((voucherId: number) => {
    if (prefetchedRef.current.has(voucherId)) return;
    prefetchedRef.current.add(voucherId);
    voucherApi.getById(voucherId).catch(() => {});
  }, []);

  return prefetch;
}

// ── Filter chip ────────────────────────────────────────────────────────────────

interface FilterChip {
  key: string;
  label: string;
  categoryId?: number;
}

// ── Main ───────────────────────────────────────────────────────────────────────

import { formatPrice } from "../utils";

/**
 * PriceInput - Component nhập số với internal state để tránh bị mất focus khi parent re-render.
 * Truyền giá trị lên parent chỉ khi user blur hoặc nhấn Enter (debounce nhẹ 300ms).
 */
const PriceInput = React.memo(function PriceInput({
  initialValue,
  placeholder,
  onCommit,
}: {
  initialValue: string;
  placeholder: string;
  onCommit: (value: string) => void;
}) {
  const [internal, setInternal] = useState(initialValue);
  const lastEmittedRef = useRef(initialValue);

  // Khi initialValue đổi từ bên ngoài (VD: click preset), sync vào internal
  useEffect(() => {
    if (initialValue !== lastEmittedRef.current) {
      lastEmittedRef.current = initialValue;
      setInternal(initialValue);
    }
  }, [initialValue]);

  const commit = useCallback(
    (value: string) => {
      lastEmittedRef.current = value;
      onCommit(value);
    },
    [onCommit],
  );

  return (
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      placeholder={placeholder}
      value={internal}
      onChange={(e) => {
        const raw = e.target.value.replace(/[^\d]/g, "");
        setInternal(raw);
      }}
      onFocus={(e) => (e.currentTarget.style.borderColor = "#059669")}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = "#E2E8F0";
        commit(internal);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.currentTarget.blur();
        }
      }}
      style={{
        width: "100%",
        minWidth: 0,
        padding: "9px 10px",
        border: "1.5px solid #E2E8F0",
        borderRadius: 8,
        fontSize: 13,
        fontFamily: "Inter, sans-serif",
        color: "#1E293B",
        outline: "none",
        boxSizing: "border-box",
      }}
    />
  );
});

export function VouchersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchParams.get("search") || "");

  // Phương pháp C: debounce + prefetch
  const debouncedSearch = useDebounce(localSearch, 400);
  const prefetch = usePrefetch();

  // Fetch categories + partners một lần khi mount
  useEffect(() => {
    Promise.all([categoryApi.list().catch(() => null), partnerApi.list().catch(() => null)]).then(
      ([catRes, partRes]) => {
        if (catRes?.success && catRes.data) setCategories(catRes.data);
        if (partRes?.success && partRes.data) setPartners(partRes.data);
      },
    );
  }, []);

  // Filter state từ URL
  const currentPage = Number(searchParams.get("page")) || 1;
  const sort = searchParams.get("sort") || "newest";
  const categoriesParam = searchParams.get("categories") || "";
  const categoryIds: number[] = categoriesParam
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map(Number)
    .filter((n) => !isNaN(n) && n > 0);
  const discount = searchParams.get("discount") || "";
  const area = searchParams.get("area") || "";
  const partnerId = searchParams.get("partner_id") || "";
  const partnerName = searchParams.get("partner_name") || "";
  const validityStatus = searchParams.get("validity_status") || "";
  // Custom price range inputs - local state (không sync với URL để tránh re-render khi đang nhập)
  const [minPriceInput, setMinPriceInput] = useState("");
  const [maxPriceInput, setMaxPriceInput] = useState("");
  // Debounced values để gọi API - tránh gọi fetch liên tục khi user đang gõ
  const [debouncedMinPrice, setDebouncedMinPrice] = useState("");
  const [debouncedMaxPrice, setDebouncedMaxPrice] = useState("");
  useEffect(() => {
    const t1 = setTimeout(() => setDebouncedMinPrice(minPriceInput), 400);
    return () => clearTimeout(t1);
  }, [minPriceInput]);
  useEffect(() => {
    const t2 = setTimeout(() => setDebouncedMaxPrice(maxPriceInput), 400);
    return () => clearTimeout(t2);
  }, [maxPriceInput]);

  // Derive active filter chips cho hiển thị
  const activeFilters: FilterChip[] = [
    ...categoryIds.map((id) => ({
      key: `cat-${id}`,
      label: categories.find((c) => c.categoryId === id)?.categoryName || `Danh mục #${id}`,
      categoryId: id,
    })),
    ...(discount ? [{ key: "discount", label: `Giảm ≥ ${discount}%` }] : []),
    ...(minPriceInput || maxPriceInput
      ? [
          {
            key: "price",
            label: `💰 ${minPriceInput ? formatPrice(Number(minPriceInput)) : "0"} - ${maxPriceInput ? formatPrice(Number(maxPriceInput)) : "∞"}`,
          },
        ]
      : []),
    ...(area ? [{ key: "area", label: `📍 ${AREA_OPTIONS.find((a) => a.value === area)?.label || area}` }] : []),
    ...(validityStatus
      ? [
          {
            key: "validity_status",
            label: `⏱️ ${VALIDITY_OPTIONS.find((v) => v.value === validityStatus)?.label || validityStatus}`,
          },
        ]
      : []),
    ...(partnerId
      ? [
          {
            key: "partner_id",
            label: `🏪 ${partners.find((p) => String(p.partnerId) === partnerId)?.companyName || "Đối tác"}`,
          },
        ]
      : []),
    ...(partnerName ? [{ key: "partner_name", label: `🔍 "${partnerName}"` }] : []),
  ];

  const updateParams = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set("page", "1");
    setSearchParams(newParams);
  };

  const removeFilter = (key: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (key.startsWith("cat-")) {
      const id = Number(key.slice(4));
      const newCats = categoryIds.filter((c) => c !== id);
      if (newCats.length === 0) {
        newParams.delete("categories");
      } else {
        newParams.set("categories", newCats.join(","));
      }
    } else if (key === "price") {
      setMinPriceInput("");
      setMaxPriceInput("");
      return; // không cần update URL
    } else {
      newParams.delete(key);
    }
    newParams.set("page", "1");
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    const newParams = new URLSearchParams();
    newParams.set("page", "1");
    setSearchParams(newParams);
    setLocalSearch("");
    setMinPriceInput("");
    setMaxPriceInput("");
  };

  const toggleCategory = (id: number) => {
    const newParams = new URLSearchParams(searchParams);
    const isCurrentlySelected = categoryIds.includes(id);
    let newCats: number[];
    if (isCurrentlySelected) {
      newCats = categoryIds.filter((c) => c !== id);
    } else {
      newCats = [...categoryIds, id];
    }
    if (newCats.length === 0) {
      newParams.delete("categories");
    } else {
      newParams.set("categories", newCats.join(","));
    }
    newParams.set("page", "1");
    setSearchParams(newParams);
  };

  const handleSearchChange = (value: string) => {
    setLocalSearch(value);
  };

  // ── Main data fetch (gọi khi params thay đổi) ────────────────────────────
  useEffect(() => {
    setLoading(true);
    setError(null);

    // Xây dựng params cho API
    const params: Record<string, unknown> = {
      page: currentPage,
      sort: sort as "price_asc" | "price_desc" | "popular" | "newest",
      // Phương pháp C: truyền debounced search (đã trì hoãn 400ms)
      ...(debouncedSearch && { search: debouncedSearch }),
      ...(categoryIds.length > 0 && { category_ids: categoryIds }),
      // BR-CUS-03: truyền các filter mới xuống backend
      ...(discount && { discount_min: Number(discount) }),
      // Price range dùng local state (minPriceInput, maxPriceInput)
      ...(debouncedMinPrice && { min_price: Number(debouncedMinPrice) }),
      ...(debouncedMaxPrice && { max_price: Number(debouncedMaxPrice) }),
      ...(area && { area }),
      ...(validityStatus && { validity_status: validityStatus }),
      ...(partnerId && { partner_id: Number(partnerId) }),
      ...(partnerName && { partner_name: partnerName }),
    };

    voucherApi
      .list(params as Parameters<typeof voucherApi.list>[0])
      .then((res) => {
        if (res.success && res.data) {
          setVouchers(res.data);
          if (res.pagination) {
            setPagination({
              page: res.pagination.page,
              totalPages: res.pagination.totalPages,
              total: res.pagination.total,
            });
          }
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [currentPage, sort, debouncedSearch, categoriesParam, discount, area, partnerId, partnerName, validityStatus, debouncedMinPrice, debouncedMaxPrice]);

  const hasActiveFilters = activeFilters.length > 0;

  // ── Filter Drawer (mobile-friendly, also shown as sidebar on desktop) ───────

  const FilterPanel = ({ className = "" }: { className?: string }) => (
    <div className={className} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Sort */}
      <div>
        <h3
          style={{
            fontFamily: "Manrope, sans-serif",
            fontSize: 14,
            fontWeight: 800,
            color: "#1E293B",
            marginBottom: 12,
          }}
        >
          Sắp xếp
        </h3>
        <select
          value={sort}
          onChange={(e) => updateParams("sort", e.target.value)}
          style={{
            width: "100%",
            padding: "10px 14px",
            border: "1.5px solid #E2E8F0",
            borderRadius: 10,
            fontSize: 13,
            fontFamily: "Inter, sans-serif",
            color: "#1E293B",
            background: "white",
            cursor: "pointer",
            outline: "none",
          }}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Category */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <h3 style={{ fontFamily: "Manrope, sans-serif", fontSize: 14, fontWeight: 800, color: "#1E293B", margin: 0 }}>
            Danh mục
            {categoryIds.length > 0 && (
              <span
                style={{
                  marginLeft: 6,
                  background: "#0E76A8",
                  color: "white",
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "1px 7px",
                  borderRadius: 99,
                  verticalAlign: "middle",
                }}
              >
                {categoryIds.length}
              </span>
            )}
          </h3>
          {categoryIds.length > 0 && (
            <button
              onClick={() => {
                const newParams = new URLSearchParams(searchParams);
                newParams.delete("categories");
                newParams.set("page", "1");
                setSearchParams(newParams);
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 11,
                color: "#EF4444",
                fontFamily: "Inter, sans-serif",
                fontWeight: 600,
                textDecoration: "underline",
                padding: 0,
              }}
            >
              Bỏ chọn
            </button>
          )}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            maxHeight: 280,
            overflowY: "auto",
            paddingRight: 4,
          }}
        >
          {categories.map((cat) => {
            const checked = categoryIds.includes(cat.categoryId);
            return (
              <label
                key={cat.categoryId}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 10px",
                  borderRadius: 8,
                  background: checked ? "#E8F4FA" : "transparent",
                  border: checked ? "1px solid #BAE6FD" : "1px solid transparent",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  if (!checked) e.currentTarget.style.background = "#F8FAFC";
                }}
                onMouseLeave={(e) => {
                  if (!checked) e.currentTarget.style.background = "transparent";
                }}
              >
                <span
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 4,
                    flexShrink: 0,
                    border: checked ? "1.5px solid #0E76A8" : "1.5px solid #CBD5E1",
                    background: checked ? "#0E76A8" : "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.15s",
                  }}
                >
                  {checked && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </span>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleCategory(cat.categoryId)}
                  style={{ position: "absolute", opacity: 0, pointerEvents: "none", width: 0, height: 0 }}
                />
                <span style={{ color: checked ? "#0E76A8" : "#64748B", flexShrink: 0 }}>
                  <CategoryIcon catId={cat.categoryId} size={14} />
                </span>
                <span
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: 13,
                    fontWeight: checked ? 600 : 400,
                    color: checked ? "#0E76A8" : "#334155",
                    flex: 1,
                  }}
                >
                  {cat.categoryName}
                </span>
                {cat.voucherCount !== undefined && (
                  <span style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: "#94A3B8" }}>
                    {cat.voucherCount}
                  </span>
                )}
              </label>
            );
          })}
          {categories.length === 0 && (
            <p
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: 12,
                color: "#94A3B8",
                textAlign: "center",
                padding: 8,
                margin: 0,
              }}
            >
              Đang tải danh mục...
            </p>
          )}
        </div>
      </div>

      {/* BR-CUS-03: Partner filter */}
      <div>
        <h3
          style={{
            fontFamily: "Manrope, sans-serif",
            fontSize: 14,
            fontWeight: 800,
            color: "#1E293B",
            marginBottom: 12,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Store size={14} /> Đối tác
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <button
            onClick={() => updateParams("partner_id", "")}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "9px 12px",
              borderRadius: 10,
              background: !partnerId ? "#F0F9FF" : "transparent",
              border: !partnerId ? "1.5px solid #BAE6FD" : "1.5px solid #E2E8F0",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: 13,
                fontWeight: !partnerId ? 700 : 400,
                color: !partnerId ? "#0369A1" : "#334155",
              }}
            >
              Tất cả đối tác
            </span>
            {!partnerId && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0369A1" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </button>
          {partners.slice(0, 8).map((partner) => (
            <button
              key={partner.partnerId}
              onClick={() => updateParams("partner_id", String(partner.partnerId))}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "9px 12px",
                borderRadius: 10,
                background: partnerId === String(partner.partnerId) ? "#F0F9FF" : "transparent",
                border: partnerId === String(partner.partnerId) ? "1.5px solid #BAE6FD" : "1.5px solid #E2E8F0",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              <span
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 13,
                  fontWeight: partnerId === String(partner.partnerId) ? 700 : 400,
                  color: partnerId === String(partner.partnerId) ? "#0369A1" : "#334155",
                  textAlign: "left",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  flex: 1,
                }}
              >
                {partner.companyName}
              </span>
              {partnerId === String(partner.partnerId) && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0369A1" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          ))}
          {partners.length === 0 && (
            <p
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: 12,
                color: "#94A3B8",
                textAlign: "center",
                padding: 8,
                margin: 0,
              }}
            >
              Không có đối tác
            </p>
          )}
        </div>
      </div>

      {/* BR-CUS-03: Area filter - Province List */}
      <div>
        <h3
          style={{
            fontFamily: "Manrope, sans-serif",
            fontSize: 14,
            fontWeight: 800,
            color: "#1E293B",
            marginBottom: 12,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <MapPin size={14} /> Khu vực
        </h3>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
            maxHeight: 320,
            overflowY: "auto",
            paddingRight: 4,
          }}
        >
          {AREA_OPTIONS.map((opt) => {
            const selected = area === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => updateParams("area", opt.value)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 12px",
                  borderRadius: 8,
                  background: selected ? "#E8F4FA" : "transparent",
                  border: selected ? "1.5px solid #BAE6FD" : "1.5px solid transparent",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  textAlign: "left",
                }}
                onMouseEnter={(e) => {
                  if (!selected) e.currentTarget.style.background = "#F8FAFC";
                }}
                onMouseLeave={(e) => {
                  if (!selected) e.currentTarget.style.background = "transparent";
                }}
              >
                <span
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: 13,
                    fontWeight: selected ? 600 : 400,
                    color: selected ? "#0E76A8" : "#334155",
                  }}
                >
                  {opt.label}
                </span>
                {selected && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0E76A8" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* BR-CUS-03: Validity Status Filter */}
      <div>
        <h3
          style={{
            fontFamily: "Manrope, sans-serif",
            fontSize: 14,
            fontWeight: 800,
            color: "#1E293B",
            marginBottom: 12,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Clock size={14} /> Trạng thái
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {VALIDITY_OPTIONS.map((opt) => {
            const selected = validityStatus === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => updateParams("validity_status", opt.value)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "9px 12px",
                  borderRadius: 10,
                  background: selected ? "#EEF2FF" : "transparent",
                  border: selected ? "1.5px solid #C7D2FE" : "1.5px solid #E2E8F0",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {opt.value === "available" && <CheckCircle2 size={14} color={selected ? "#6366F1" : "#94A3B8"} />}
                  {opt.value === "selling" && <Clock size={14} color={selected ? "#6366F1" : "#94A3B8"} />}
                  {opt.value === "expiring_soon" && <AlertCircle size={14} color={selected ? "#6366F1" : "#94A3B8"} />}
                  {opt.value === "" && <CheckCircle2 size={14} color={selected ? "#6366F1" : "#94A3B8"} />}
                  <span
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: 13,
                      fontWeight: selected ? 700 : 400,
                      color: selected ? "#4F46E5" : "#334155",
                    }}
                  >
                    {opt.label}
                  </span>
                </div>
                {selected && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Discount */}
      <div>
        <h3
          style={{
            fontFamily: "Manrope, sans-serif",
            fontSize: 14,
            fontWeight: 800,
            color: "#1E293B",
            marginBottom: 12,
          }}
        >
          Mức giảm giá
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {DISCOUNT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateParams("discount", opt.value)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "9px 12px",
                borderRadius: 10,
                background: discount === opt.value ? "#FEF3C7" : "transparent",
                border: discount === opt.value ? "1.5px solid #FDE68A" : "1.5px solid #E2E8F0",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              <span
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 13,
                  fontWeight: discount === opt.value ? 700 : 400,
                  color: discount === opt.value ? "#92400E" : "#334155",
                }}
              >
                {opt.label}
              </span>
              {discount === opt.value && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Price range - Preset + Custom Min/Max Input */}
      <div>
        <h3
          style={{
            fontFamily: "Manrope, sans-serif",
            fontSize: 14,
            fontWeight: 800,
            color: "#1E293B",
            marginBottom: 12,
          }}
        >
          Khoảng giá
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {/* Tất cả mức giá */}
          <button
            onClick={() => {
              setMinPriceInput("");
              setMaxPriceInput("");
            }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "9px 12px",
              borderRadius: 10,
              background: !minPriceInput && !maxPriceInput ? "#ECFDF5" : "transparent",
              border: !minPriceInput && !maxPriceInput ? "1.5px solid #6EE7B7" : "1.5px solid #E2E8F0",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: 13,
                fontWeight: !minPriceInput && !maxPriceInput ? 700 : 400,
                color: !minPriceInput && !maxPriceInput ? "#065F46" : "#334155",
              }}
            >
              Tất cả mức giá
            </span>
            {!minPriceInput && !maxPriceInput && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </button>

          {/* Preset options */}
          {PRICE_OPTIONS.slice(1).map((opt) => {
            const [presetMin, presetMax] = opt.value.split("-");
            const selected = minPriceInput === presetMin && (maxPriceInput === presetMax || (presetMax === "999999999" && !maxPriceInput));
            return (
              <button
                key={opt.value}
                onClick={() => {
                  setMinPriceInput(presetMin);
                  setMaxPriceInput(presetMax === "999999999" ? "" : presetMax);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "9px 12px",
                  borderRadius: 10,
                  background: selected ? "#ECFDF5" : "transparent",
                  border: selected ? "1.5px solid #6EE7B7" : "1.5px solid #E2E8F0",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                <span
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: 13,
                    fontWeight: selected ? 700 : 400,
                    color: selected ? "#065F46" : "#334155",
                  }}
                >
                  {opt.label}
                </span>
                {selected && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            );
          })}

          {/* Custom min/max input */}
          <div style={{ marginTop: 4 }}>
            <div
              style={{
                fontSize: 11,
                color: "#94A3B8",
                fontFamily: "Inter, sans-serif",
                fontWeight: 600,
                marginBottom: 6,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              Hoặc nhập khoảng giá
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <PriceInput
                initialValue={minPriceInput}
                placeholder="Từ"
                onCommit={(v) => setMinPriceInput(v)}
              />
              <span style={{ color: "#94A3B8", fontSize: 13, flexShrink: 0 }}>—</span>
              <PriceInput
                initialValue={maxPriceInput}
                placeholder="Đến"
                onCommit={(v) => setMaxPriceInput(v)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Clear all */}
      {hasActiveFilters && (
        <button
          onClick={clearAllFilters}
          style={{
            padding: "10px",
            background: "white",
            color: "#EF4444",
            border: "1.5px solid #FECACA",
            borderRadius: 10,
            fontFamily: "Inter, sans-serif",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#FEF2F2";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "white";
          }}
        >
          Xóa tất cả bộ lọc
        </button>
      )}
    </div>
  );

  return (
    <div style={{ background: "#F8FAFC", minHeight: "100vh" }}>
      <Breadcrumb
        items={[
          { label: "Trang chủ", href: "/" },
          { label: "Khám phá Voucher" },
        ]}
        maxWidth={1280}
      />
      {/* ── Header ── */}
      <div style={{ background: "white", borderBottom: "1px solid #E2E8F0" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "16px 24px 0" }}>

          <h1
            style={{
              fontFamily: "Manrope, sans-serif",
              fontSize: 26,
              fontWeight: 800,
              color: "#1E293B",
              marginBottom: 16,
            }}
          >
            Khám phá Voucher
          </h1>

          {/* Search bar */}
          <div style={{ position: "relative", marginBottom: 16 }}>
            <Search
              size={18}
              style={{
                position: "absolute",
                left: 14,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#94A3B8",
                pointerEvents: "none",
              }}
            />
            <input
              type="text"
              placeholder="Tìm kiếm voucher, đối tác, danh mục..."
              value={localSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px 12px 44px",
                border: "1.5px solid #E2E8F0",
                borderRadius: 12,
                fontSize: 14,
                fontFamily: "Inter, sans-serif",
                color: "#1E293B",
                background: "#F8FAFC",
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#0E76A8")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#E2E8F0")}
            />
            {localSearch && (
              <button
                onClick={() => {
                  setLocalSearch("");
                  updateParams("search", "");
                }}
                style={{
                  position: "absolute",
                  right: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#94A3B8",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Category scroll chips */}
          {categoryIds.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: 8,
                overflowX: "auto",
                paddingBottom: 16,
                scrollbarWidth: "none",
                alignItems: "center",
              }}
            >
              {categoryIds.map((id) => {
                const cat = categories.find((c) => c.categoryId === id);
                if (!cat) return null;
                return (
                  <button
                    key={cat.categoryId}
                    onClick={() => toggleCategory(cat.categoryId)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "7px 14px",
                      background: "#0E76A8",
                      color: "white",
                      border: "1.5px solid #0E76A8",
                      borderRadius: 99,
                      fontFamily: "Inter, sans-serif",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                      transition: "all 0.15s",
                    }}
                  >
                    <span style={{ color: "white" }}>
                      <CategoryIcon catId={cat.categoryId} size={14} />
                    </span>
                    {cat.categoryName}
                    <X size={13} style={{ marginLeft: 2 }} />
                  </button>
                );
              })}
              {categoryIds.length > 1 && (
                <button
                  onClick={() => {
                    const newParams = new URLSearchParams(searchParams);
                    newParams.delete("categories");
                    newParams.set("page", "1");
                    setSearchParams(newParams);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 12,
                    color: "#EF4444",
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 600,
                    textDecoration: "underline",
                    padding: "0 4px",
                    whiteSpace: "nowrap",
                  }}
                >
                  Xóa hết
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Main layout: sidebar + grid ── */}
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "24px",
          display: "grid",
          gridTemplateColumns: "240px 1fr",
          gap: 24,
          alignItems: "start",
        }}
      >
        {/* ── Left sidebar filter ── */}
        <div
          style={{
            background: "white",
            borderRadius: 16,
            padding: 20,
            border: "1px solid #F1F5F9",
            position: "sticky",
            top: 24,
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          }}
        >
          {/* Sidebar header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 20,
              paddingBottom: 16,
              borderBottom: "1px solid #F1F5F9",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <SlidersHorizontal size={16} style={{ color: "#0E76A8" }} />
              <h2
                style={{
                  fontFamily: "Manrope, sans-serif",
                  fontSize: 15,
                  fontWeight: 800,
                  color: "#1E293B",
                  margin: 0,
                }}
              >
                Bộ lọc
              </h2>
            </div>
            {hasActiveFilters && (
              <span
                style={{
                  background: "#0E76A8",
                  color: "white",
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: 99,
                }}
              >
                {activeFilters.length}
              </span>
            )}
          </div>

          {/* Mobile: show as drawer */}
          <div className="desktop-filter">
            <FilterPanel />
          </div>

          {/* Mobile: button to open drawer */}
          <div className="mobile-filter" style={{ display: "none" }}>
            <button
              onClick={() => setShowFilterDrawer(true)}
              style={{
                width: "100%",
                padding: "12px",
                background: "white",
                color: "#0E76A8",
                border: "1.5px solid #BAE6FD",
                borderRadius: 12,
                fontFamily: "Inter, sans-serif",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <SlidersHorizontal size={16} />
              Mở bộ lọc
            </button>
          </div>
        </div>

        {/* ── Right: results ── */}
        <div>
          {/* Results header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            {/* Active filter chips */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", flex: 1 }}>
              {activeFilters.map((f) => (
                <span
                  key={f.key}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "4px 10px 4px 12px",
                    background: "#E8F4FA",
                    color: "#0E76A8",
                    border: "1px solid #BAE6FD",
                    borderRadius: 99,
                    fontFamily: "Inter, sans-serif",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {f.label}
                  <button
                    onClick={() => removeFilter(f.key)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#0E76A8",
                      padding: 0,
                      display: "flex",
                      alignItems: "center",
                      marginLeft: 2,
                    }}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 12,
                    color: "#EF4444",
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 600,
                    textDecoration: "underline",
                    padding: "4px 4px",
                  }}
                >
                  Xóa hết
                </button>
              )}
            </div>

            {/* Count */}
            <span style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "#64748B", whiteSpace: "nowrap" }}>
              {loading ? "..." : `${vouchers.length} voucher`}
              {(localSearch || categoryIds.length > 0 || discount || minPriceInput || maxPriceInput || area || validityStatus || partnerId) &&
                !loading &&
                ` được tìm thấy`}
            </span>
          </div>

          {/* Mobile filter chips row */}
          <div className="mobile-filter-chips" style={{ display: "none", marginBottom: 12 }}>
            <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none" }}>
              <button
                onClick={() => setShowFilterDrawer(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  background: "white",
                  border: "1.5px solid #E2E8F0",
                  borderRadius: 99,
                  cursor: "pointer",
                  fontFamily: "Inter, sans-serif",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#334155",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                <SlidersHorizontal size={12} />
                Bộ lọc
                {hasActiveFilters && (
                  <span
                    style={{
                      background: "#0E76A8",
                      color: "white",
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "0 5px",
                      borderRadius: 99,
                    }}
                  >
                    {activeFilters.length}
                  </span>
                )}
              </button>
              {activeFilters.map((f) => (
                <span
                  key={f.key}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "5px 10px",
                    background: "#E8F4FA",
                    color: "#0E76A8",
                    border: "1px solid #BAE6FD",
                    borderRadius: 99,
                    fontSize: 12,
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                  }}
                >
                  {f.label}
                  <button
                    onClick={() => removeFilter(f.key)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#0E76A8",
                      display: "flex",
                      padding: 0,
                    }}
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Loading — skeleton cards */}
          {loading && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 18 }}>
              {Array.from({ length: 12 }).map((_, i) => (
                <VoucherSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div style={{ textAlign: "center", padding: 60, background: "white", borderRadius: 16 }}>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: 15, color: "#EF4444", marginBottom: 16 }}>
                {error}
              </p>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: "10px 24px",
                  background: "#0E76A8",
                  color: "white",
                  border: "none",
                  borderRadius: 10,
                  fontFamily: "Inter, sans-serif",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Thử lại
              </button>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && vouchers.length === 0 && (
            <div style={{ textAlign: "center", padding: 60, background: "white", borderRadius: 16 }}>
              <div style={{ fontSize: 56, marginBottom: 16, opacity: 0.3 }}>🔍</div>
              <h3
                style={{
                  fontFamily: "Manrope, sans-serif",
                  fontSize: 18,
                  fontWeight: 800,
                  color: "#1E293B",
                  marginBottom: 8,
                }}
              >
                Không tìm thấy voucher
              </h3>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: "#64748B", marginBottom: 20 }}>
                Thử thay đổi từ khóa hoặc bộ lọc
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  style={{
                    padding: "10px 24px",
                    background: "#0E76A8",
                    color: "white",
                    border: "none",
                    borderRadius: 10,
                    fontFamily: "Inter, sans-serif",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
          )}

          {/* Grid — voucher cards */}
          {!loading && !error && vouchers.length > 0 && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 18 }}>
                {vouchers.map((voucher) => {
                  // BR-CUS-03: dùng discountPercent đã tính sẵn từ backend
                  const discount_pct =
                    voucher.discountPercent ??
                    (voucher.originalPrice
                      ? Math.round((1 - Number(voucher.salePrice) / Number(voucher.originalPrice)) * 100)
                      : 0);
                  const img =
                    voucher.imageUrl ||
                    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop";

                  // Tính số ngày còn lại từ endDate
                  const daysLeft = voucher.endDate
                    ? Math.max(0, Math.ceil((new Date(voucher.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
                    : null;
                  const isExpiringSoon = daysLeft !== null && daysLeft <= 5;

                  return (
                    <Link
                      key={voucher.voucherId}
                      to={`/voucher/${voucher.voucherId}`}
                      onMouseEnter={(e) => {
                        prefetch(voucher.voucherId);
                        e.currentTarget.style.transform = "translateY(-4px)";
                        e.currentTarget.style.boxShadow = "0 12px 32px rgba(14,118,168,0.14)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)";
                      }}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        background: "white",
                        borderRadius: 16,
                        overflow: "hidden",
                        textDecoration: "none",
                        border: "1px solid #F1F5F9",
                        transition: "all 0.25s ease",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                      }}
                    >
                      {/* Image */}
                      <div style={{ position: "relative", height: 150, overflow: "hidden", flexShrink: 0 }}>
                        <img
                          src={img}
                          alt={voucher.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                        {discount_pct > 0 && (
                          <span
                            style={{
                              position: "absolute",
                              top: 8,
                              left: 8,
                              background: "#EF4444",
                              color: "white",
                              fontSize: 11,
                              fontWeight: 700,
                              padding: "3px 8px",
                              borderRadius: 6,
                            }}
                          >
                            -{discount_pct}%
                          </span>
                        )}

                        {/* Countdown badge đã chuyển xuống dưới phần giá */}
                        <span
                          style={{
                            position: "absolute",
                            bottom: 8,
                            left: 8,
                            background: "rgba(0,0,0,0.55)",
                            color: "white",
                            fontSize: 11,
                            fontWeight: 500,
                            padding: "3px 8px",
                            borderRadius: 6,
                          }}
                        >
                          {voucher.partner?.companyName || "N/A"}
                        </span>
                      </div>

                      {/* Info */}
                      <div
                        style={{ padding: "12px 14px 14px", flex: 1, display: "flex", flexDirection: "column", gap: 6 }}
                      >
                        <h3
                          style={{
                            fontFamily: "Inter, sans-serif",
                            fontSize: 13,
                            fontWeight: 700,
                            color: "#1E293B",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            lineHeight: 1.4,
                            margin: 0,
                          }}
                        >
                          {voucher.title}
                        </h3>

                        {/* Rating */}
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <Star size={11} style={{ color: "#F59E0B", fill: "#F59E0B" }} />
                          <span
                            style={{ fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 700, color: "#F59E0B" }}
                          >
                            {voucher.averageRating?.toFixed(1) || "0.0"}
                          </span>
                          <span style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: "#94A3B8" }}>
                            ({voucher.reviewCount || 0})
                          </span>
                        </div>

                        {/* Price */}
                        <div
                          style={{
                            marginTop: "auto",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 8,
                          }}
                        >
                          <div>
                            {voucher.originalPrice && (
                              <span
                                style={{
                                  fontFamily: "Inter, sans-serif",
                                  fontSize: 11,
                                  color: "#94A3B8",
                                  textDecoration: "line-through",
                                  display: "block",
                                }}
                              >
                                {formatPrice(voucher.originalPrice)}
                              </span>
                            )}
                            <span
                              style={{
                                fontFamily: "Manrope, sans-serif",
                                fontSize: 16,
                                fontWeight: 800,
                                color: "#0E76A8",
                              }}
                            >
                              {formatPrice(voucher.salePrice)}
                            </span>
                          </div>
                          {voucher.availableQuantity < 10 && (
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 700,
                                color: "#EF4444",
                                background: "#FEE2E2",
                                padding: "2px 6px",
                                borderRadius: 4,
                              }}
                            >
                              Còn ít
                            </span>
                          )}
                        </div>

                        {/* Countdown dưới giá - chỉ khi ≤5 ngày */}
                        {isExpiringSoon && (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                              padding: "4px 8px",
                              borderRadius: 6,
                              fontSize: 11,
                              fontWeight: 700,
                              fontFamily: "Inter, sans-serif",
                              color: "white",
                              alignSelf: "flex-start",
                              background:
                                daysLeft === 0
                                  ? "rgba(15, 23, 42, 0.92)"
                                  : daysLeft === 1
                                    ? "linear-gradient(135deg, #DC2626 0%, #991B1B 100%)"
                                    : "linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)",
                              boxShadow: "0 2px 6px rgba(239, 68, 68, 0.35)",
                            }}
                          >
                            <Clock size={11} />
                            {daysLeft === 0
                              ? "Hết hạn hôm nay"
                              : daysLeft === 1
                                ? "Còn 1 ngày"
                                : `Còn ${daysLeft} ngày`}
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 36 }}>
                  <button
                    disabled={currentPage === 1}
                    onClick={() => updateParams("page", String(currentPage - 1))}
                    style={{
                      width: 36,
                      height: 36,
                      border: "1px solid #E2E8F0",
                      borderRadius: 8,
                      background: "white",
                      cursor: currentPage === 1 ? "not-allowed" : "pointer",
                      opacity: currentPage === 1 ? 0.4 : 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2">
                      <path d="M15 18l-6-6 6-6" />
                    </svg>
                  </button>
                  {Array.from({ length: Math.min(pagination.totalPages, 7) }, (_, i) => {
                    const p = i + 1;
                    return (
                      <button
                        key={p}
                        onClick={() => updateParams("page", String(p))}
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 8,
                          background: currentPage === p ? "#0E76A8" : "white",
                          color: currentPage === p ? "white" : "#64748B",
                          border: currentPage === p ? "1.5px solid #0E76A8" : "1px solid #E2E8F0",
                          fontFamily: "Inter, sans-serif",
                          fontSize: 13,
                          fontWeight: currentPage === p ? 700 : 400,
                          cursor: "pointer",
                        }}
                      >
                        {p}
                      </button>
                    );
                  })}
                  <button
                    disabled={currentPage === pagination.totalPages}
                    onClick={() => updateParams("page", String(currentPage + 1))}
                    style={{
                      width: 36,
                      height: 36,
                      border: "1px solid #E2E8F0",
                      borderRadius: 8,
                      background: "white",
                      cursor: currentPage === pagination.totalPages ? "not-allowed" : "pointer",
                      opacity: currentPage === pagination.totalPages ? 0.4 : 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Mobile filter drawer ── */}
      {showFilterDrawer && (
        <div
          onClick={() => setShowFilterDrawer(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "rgba(15,23,42,0.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "flex-end",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "white",
              borderRadius: "20px 20px 0 0",
              width: "100%",
              maxHeight: "85vh",
              overflowY: "auto",
              padding: "24px 20px 40px",
              animation: "slideUp 0.25s ease-out",
            }}
          >
            {/* Drawer handle */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <h2
                style={{
                  fontFamily: "Manrope, sans-serif",
                  fontSize: 18,
                  fontWeight: 800,
                  color: "#1E293B",
                  margin: 0,
                }}
              >
                Bộ lọc
              </h2>
              <button
                onClick={() => setShowFilterDrawer(false)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "#F1F5F9",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={16} style={{ color: "#64748B" }} />
              </button>
            </div>
            <FilterPanel />
            <button
              onClick={() => setShowFilterDrawer(false)}
              style={{
                width: "100%",
                padding: "14px",
                marginTop: 20,
                background: "#0E76A8",
                color: "white",
                border: "none",
                borderRadius: 12,
                fontFamily: "Inter, sans-serif",
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Xem kết quả
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @media (max-width: 768px) {
          .desktop-filter { display: none !important; }
          .mobile-filter { display: block !important; }
          .mobile-filter-chips { display: flex !important; }
        }
        @media (min-width: 769px) {
          .mobile-filter { display: none !important; }
          .mobile-filter-chips { display: none !important; }
        }
      `}</style>
    </div>
  );
}
