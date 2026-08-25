import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, ShoppingBag } from "lucide-react";
import { cartApi } from "../services";
import type { Cart } from "../services";
import { Breadcrumb } from "../components/Breadcrumb";
import { formatPrice } from "../utils";
import Loading from "../components/Loading";

export function CartPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  /**
   * Map cartItemId -> boolean (true = đã tick chọn).
   * Mặc định KHÔNG chọn gì cả khi vào /cart bình thường.
   * Nếu có flag "buyNow" từ sessionStorage (do bấm "Mua ngay" ở trang chi tiết),
   * thì mặc định chỉ tick đúng item đó.
   */
  const [selectedIds, setSelectedIds] = useState<Record<number, boolean>>({});
  /** Đánh dấu đã áp dụng buyNowFlag để tránh bị ghi đè khi fetchCart() chạy lại. */
  const [buyNowApplied, setBuyNowApplied] = useState(false);

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await cartApi.getCart();
      if (response.success && response.data) {
        setCart(response.data);

        // Lần đầu load, áp dụng "Mua ngay" nếu có flag
        if (!buyNowApplied) {
          const buyNowItemIdStr = sessionStorage.getItem("buyNowItemId");
          const buyNowVoucherIdStr = sessionStorage.getItem("buyNowVoucherId");
          let chosenId: number | null = null;
          if (buyNowItemIdStr) {
            chosenId = Number(buyNowItemIdStr);
          } else if (buyNowVoucherIdStr) {
            // Fallback: tìm cartItem theo voucherId
            const vid = Number(buyNowVoucherIdStr);
            const match = response.data.items.find((i) => i.voucher.voucherId === vid);
            if (match) chosenId = match.cartItemId;
          }

          if (chosenId != null) {
            // Chỉ tick item vừa "Mua ngay", KHÔNG tick các item khác
            const next: Record<number, boolean> = {};
            response.data.items.forEach((it) => {
              next[it.cartItemId] = it.cartItemId === chosenId;
            });
            setSelectedIds(next);
          }
          // Nếu không có flag → giữ nguyên selectedIds rỗng (không tick gì)
          setBuyNowApplied(true);
          // Xoá flag ngay để lần sau vào /cart thì không bị áp dụng lại
          sessionStorage.removeItem("buyNowItemId");
          sessionStorage.removeItem("buyNowVoucherId");
        }
      }
    } catch (err: any) {
      setError(err.message || "Không thể tải giỏ hàng");
    } finally {
      setLoading(false);
    }
  }, [buyNowApplied]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const updateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    try {
      setActionLoading(itemId);
      await cartApi.updateCartItem(itemId, newQuantity);
      await fetchCart();
    } catch (err: any) {
      alert(err.message || "Cập nhật thất bại");
    } finally {
      setActionLoading(null);
    }
  };

  const removeItem = async (itemId: number) => {
    if (!confirm("Bạn có chắc muốn xoá item này?")) return;
    try {
      setActionLoading(itemId);
      await cartApi.removeCartItem(itemId);
      // Đồng bộ selectedIds sau khi xoá
      setSelectedIds((prev) => {
        const { [itemId]: _, ...rest } = prev;
        return rest;
      });
      await fetchCart();
    } catch (err: any) {
      alert(err.message || "Xoá thất bại");
    } finally {
      setActionLoading(null);
    }
  };

  const clearCart = async () => {
    if (!confirm("Bạn có chắc muốn xoá toàn bộ giỏ hàng?")) return;
    try {
      setLoading(true);
      await cartApi.clearCart();
      setSelectedIds({});
      setBuyNowApplied(false);
      await fetchCart();
    } catch (err: any) {
      alert(err.message || "Xoá thất bại");
      setLoading(false);
    }
  };

  const toggleItem = (itemId: number) => {
    setSelectedIds((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const toggleAll = (checked: boolean) => {
    const next: Record<number, boolean> = {};
    (cart?.items || []).forEach((it) => {
      next[it.cartItemId] = checked;
    });
    setSelectedIds(next);
  };

  if (loading && !cart) {
    return <Loading />;
  }

  if (error) {
    return (
      <div
        style={{
          background: "#F8FAFC",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center", padding: 32 }}>
          <p style={{ color: "#EF4444", marginBottom: 16 }}>{error}</p>
          <button
            onClick={fetchCart}
            style={{
              padding: "10px 24px",
              background: "#0E76A8",
              color: "white",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const items = cart?.items || [];
  const selectedItems = items.filter((it) => selectedIds[it.cartItemId]);
  const selectedTotal = selectedItems.reduce((sum, it) => sum + Number(it.voucher.salePrice) * it.quantity, 0);
  const allChecked = items.length > 0 && items.every((it) => selectedIds[it.cartItemId]);
  const someChecked = items.some((it) => selectedIds[it.cartItemId]) && !allChecked;

  const handleBuyNow = () => {
    if (selectedItems.length === 0) {
      alert("Vui lòng tick chọn ít nhất 1 sản phẩm để mua.");
      return;
    }
    // Lưu danh sách cartItemId được chọn để Checkout lấy lại
    const ids = selectedItems.map((it) => it.cartItemId);
    sessionStorage.setItem("checkoutSelectedIds", JSON.stringify(ids));
    navigate("/checkout");
  };

  return (
    <div style={{ background: "#F8FAFC", minHeight: "100vh" }}>
      <Breadcrumb items={[{ label: "Trang chủ", href: "/" }, { label: "Giỏ hàng" }]} />

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px" }}>
        {items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", background: "white", borderRadius: 16 }}>
            <ShoppingBag size={64} style={{ color: "#CBD5E1", margin: "0 auto 16px" }} />
            <h3 style={{ fontSize: 20, fontWeight: 700, color: "#1E293B", marginBottom: 8 }}>Giỏ hàng trống</h3>
            <p style={{ color: "#64748B", marginBottom: 24 }}>Hãy thêm voucher vào giỏ hàng của bạn</p>
            <button
              onClick={() => navigate("/vouchers")}
              style={{
                padding: "12px 32px",
                background: "#0E76A8",
                color: "white",
                border: "none",
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Khám phá voucher
            </button>
          </div>
        ) : (
          <div className="responsive-cart-layout">
            {/* LEFT: Cart items */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1E293B" }}>Giỏ hàng ({items.length} sản phẩm)</h2>
                <button
                  onClick={clearCart}
                  style={{
                    padding: "8px 16px",
                    background: "#FEE2E2",
                    color: "#EF4444",
                    border: "none",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Xóa tất cả
                </button>
              </div>

              <div
                style={{ background: "white", borderRadius: 16, padding: 24, boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}
              >
                {/* Select-all header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "4px 0 16px",
                    borderBottom: "1px solid #E2E8F0",
                    marginBottom: 8,
                  }}
                >
                  <CustomCheckbox
                    checked={allChecked}
                    indeterminate={someChecked}
                    onChange={toggleAll}
                    ariaLabel="Chọn tất cả"
                  />
                  <span style={{ fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 600, color: "#475569" }}>
                    Chọn tất cả ({selectedItems.length}/{items.length})
                  </span>
                </div>

                {items.map((item) => {
                  const checked = !!selectedIds[item.cartItemId];
                  const lineTotal = Number(item.voucher.salePrice) * item.quantity;
                  return (
                    <div
                      key={item.cartItemId}
                      style={{
                        display: "flex",
                        gap: 14,
                        padding: "16px 0",
                        borderBottom: "1px solid #E2E8F0",
                        alignItems: "flex-start",
                        opacity: checked ? 1 : 0.55,
                        transition: "opacity 0.15s",
                      }}
                    >
                      {/* Checkbox */}
                      <div style={{ paddingTop: 4 }}>
                        <CustomCheckbox
                          checked={checked}
                          onChange={() => toggleItem(item.cartItemId)}
                          ariaLabel={`Chọn ${item.voucher.title}`}
                        />
                      </div>

                      {/* Image */}
                      <img
                        src={item.voucher.imageUrl || "https://via.placeholder.com/120x100?text=Voucher"}
                        alt={item.voucher.title}
                        style={{ width: 120, height: 100, borderRadius: 12, objectFit: "cover", flexShrink: 0 }}
                      />

                      {/* Info */}
                      <div
                        style={{
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          minHeight: 100,
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 8 }}>
                          <div style={{ minWidth: 0 }}>
                            <h3
                              style={{
                                fontFamily: "Manrope, sans-serif",
                                fontSize: 16,
                                fontWeight: 700,
                                color: "#1E293B",
                                marginBottom: 4,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                              }}
                            >
                              {item.voucher.title}
                            </h3>
                            <p style={{ fontSize: 12, color: "#64748B", marginBottom: 4 }}>
                              {item.voucher.partner.companyName}
                            </p>
                            <p style={{ fontSize: 12, color: "#64748B" }}>{item.voucher.expiryDays} ngày sử dụng</p>
                          </div>
                          <button
                            onClick={() => removeItem(item.cartItemId)}
                            disabled={actionLoading === item.cartItemId}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#94A3B8",
                              cursor: "pointer",
                              padding: 4,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              opacity: actionLoading === item.cartItemId ? 0.5 : 1,
                              flexShrink: 0,
                            }}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginTop: 8,
                          }}
                        >
                          <span
                            style={{
                              fontFamily: "Manrope, sans-serif",
                              fontSize: 16,
                              fontWeight: 800,
                              color: "#EF4444",
                            }}
                          >
                            {formatPrice(lineTotal)}
                          </span>
                          {/* Quantity control */}
                          <div
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 0,
                              background: "#F8FAFC",
                              borderRadius: 10,
                              border: "1.5px solid #E2E8F0",
                              overflow: "hidden",
                            }}
                          >
                            <button
                              onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                              disabled={actionLoading === item.cartItemId || item.quantity <= 1}
                              style={{
                                width: 34,
                                height: 34,
                                border: "none",
                                background: "transparent",
                                color: item.quantity <= 1 ? "#CBD5E1" : "#1E293B",
                                cursor: item.quantity <= 1 ? "not-allowed" : "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                transition: "background 0.15s",
                                fontSize: 16,
                                fontWeight: 600,
                              }}
                              onMouseEnter={(e) => {
                                if (item.quantity > 1) e.currentTarget.style.background = "#E2E8F0";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = "transparent";
                              }}
                            >
                              −
                            </button>
                            <div style={{ width: 1, height: 18, background: "#E2E8F0" }} />
                            <span
                              style={{
                                minWidth: 36,
                                textAlign: "center",
                                fontWeight: 700,
                                fontSize: 14,
                                color: "#1E293B",
                                fontFamily: "Inter, sans-serif",
                                userSelect: "none",
                              }}
                            >
                              {actionLoading === item.cartItemId ? "..." : item.quantity}
                            </span>
                            <div style={{ width: 1, height: 18, background: "#E2E8F0" }} />
                            <button
                              onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                              disabled={
                                actionLoading === item.cartItemId || item.quantity >= item.voucher.availableQuantity
                              }
                              style={{
                                width: 34,
                                height: 34,
                                border: "none",
                                background: "transparent",
                                color: item.quantity >= item.voucher.availableQuantity ? "#CBD5E1" : "#1E293B",
                                cursor: item.quantity >= item.voucher.availableQuantity ? "not-allowed" : "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                transition: "background 0.15s",
                                fontSize: 16,
                                fontWeight: 600,
                              }}
                              onMouseEnter={(e) => {
                                if (item.quantity < item.voucher.availableQuantity)
                                  e.currentTarget.style.background = "#E2E8F0";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = "transparent";
                              }}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT: Order summary */}
            <div
              style={{
                background: "white",
                borderRadius: 16,
                padding: 24,
                boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                position: "sticky",
                top: 24,
              }}
            >
              <h2
                style={{
                  fontFamily: "Manrope, sans-serif",
                  fontSize: 16,
                  fontWeight: 800,
                  color: "#1E293B",
                  marginBottom: 20,
                }}
              >
                Thông tin đơn hàng
              </h2>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 13,
                  color: "#64748B",
                  marginBottom: 8,
                }}
              >
                <span>Số sản phẩm đã chọn</span>
                <span style={{ fontWeight: 600, color: "#1E293B" }}>{selectedItems.length}</span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "14px 0",
                  borderTop: "1.5px solid #E2E8F0",
                  borderBottom: "1.5px solid #E2E8F0",
                  marginBottom: 16,
                }}
              >
                <span style={{ fontSize: 15, fontWeight: 700, color: "#1E293B" }}>Tổng cộng</span>
                <span style={{ fontSize: 18, fontWeight: 800, color: "#EF4444" }}>{formatPrice(selectedTotal)}</span>
              </div>

              <button
                onClick={handleBuyNow}
                disabled={selectedItems.length === 0}
                style={{
                  width: "100%",
                  padding: "14px 0",
                  background: selectedItems.length === 0 ? "#94A3B8" : "#0E76A8",
                  color: "white",
                  border: "none",
                  borderRadius: 12,
                  fontFamily: "Inter, sans-serif",
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: selectedItems.length === 0 ? "not-allowed" : "pointer",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (selectedItems.length > 0) e.currentTarget.style.background = "#0A5C87";
                }}
                onMouseLeave={(e) => {
                  if (selectedItems.length > 0) e.currentTarget.style.background = "#0E76A8";
                }}
              >
                Mua ngay ({selectedItems.length})
              </button>

              {selectedItems.length === 0 && (
                <p
                  style={{
                    marginTop: 10,
                    fontSize: 12,
                    color: "#94A3B8",
                    textAlign: "center",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  Hãy tick chọn ít nhất 1 sản phẩm để tiếp tục
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** Checkbox tuỳ biến — dùng nội bộ trong Cart. */
function CustomCheckbox({
  checked,
  indeterminate,
  onChange,
  ariaLabel,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: (checked: boolean) => void;
  ariaLabel?: string;
}) {
  const showIndeterminate = !!indeterminate && !checked;
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={showIndeterminate ? "mixed" : checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      style={{
        width: 22,
        height: 22,
        borderRadius: 6,
        border: checked || showIndeterminate ? "none" : "1.5px solid #CBD5E1",
        background: checked ? "#0E76A8" : showIndeterminate ? "#0E76A8" : "white",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.15s",
        padding: 0,
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        if (!checked && !showIndeterminate) e.currentTarget.style.borderColor = "#0E76A8";
      }}
      onMouseLeave={(e) => {
        if (!checked && !showIndeterminate) e.currentTarget.style.borderColor = "#CBD5E1";
      }}
    >
      {checked && (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
      {showIndeterminate && (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="3.5"
          strokeLinecap="round"
        >
          <line x1="6" y1="12" x2="18" y2="12" />
        </svg>
      )}
    </button>
  );
}
