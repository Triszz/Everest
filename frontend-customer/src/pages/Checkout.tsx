import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { cartApi, orderApi, profileApi, paymentApi } from "../services";
import { Breadcrumb } from "../components/Breadcrumb";
import type { CartItem } from "../services";
import { formatPrice } from "../utils";
import Loading from "../components/Loading";

export function Checkout() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loadingCart, setLoadingCart] = useState(true);
  const [cartError, setCartError] = useState<string | null>(null);

  const [buyerInfo, setBuyerInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
  });
  const [sendAsGift, setSendAsGift] = useState(false);
  const [receiverEmail, setReceiverEmail] = useState("");
  const [giftMessage, setGiftMessage] = useState("");
  const [voucherCode, setVoucherCode] = useState("");
  const [applyingCode, setApplyingCode] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [discountError, setDiscountError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      if (confirm("Bạn cần đăng nhập để thanh toán. Đăng nhập ngay?")) {
        navigate("/login");
      } else {
        navigate("/cart");
      }
      return;
    }

    const user = localStorage.getItem("user");
    let cachedUser: { fullName?: string; email?: string; phone?: string; phoneNumber?: string } | null = null;
    if (user) {
      try {
        cachedUser = JSON.parse(user);
        setBuyerInfo({
          fullName: cachedUser?.fullName || "",
          email: cachedUser?.email || "",
          phone: cachedUser?.phoneNumber || cachedUser?.phone || "",
        });
      } catch {
        /* ignore */
      }
    }

    // Lấy profile mới nhất từ server để chắc chắn có SĐT (localStorage có thể cũ/thiếu).
    profileApi
      .getProfile()
      .then((res) => {
        if (res.success && res.data) {
          localStorage.setItem("user", JSON.stringify(res.data));
          setBuyerInfo({
            fullName: res.data.fullName || "",
            email: res.data.email || "",
            phone: res.data.phoneNumber || "",
          });
        }
      })
      .catch(() => {
        /* giữ giá trị từ localStorage nếu API lỗi */
      });

    cartApi
      .getCart()
      .then((res) => {
        if (res.success && res.data?.items) {
          let items = res.data.items;

          // Lọc theo danh sách cartItemId đã chọn từ trang Cart (nếu có)
          const raw = sessionStorage.getItem("checkoutSelectedIds");
          if (raw) {
            try {
              const ids: number[] = JSON.parse(raw);
              const idSet = new Set(ids);
              items = items.filter((it) => idSet.has(it.cartItemId));
              // Xoá flag để back/refresh không bị lọc lại
              sessionStorage.removeItem("checkoutSelectedIds");
            } catch {
              sessionStorage.removeItem("checkoutSelectedIds");
            }
          }

          setCartItems(items);

          if (items.length === 0) {
            // Không có item nào được chọn → quay lại cart
            navigate("/cart");
          }
        } else if (res.data?.items?.length === 0) {
          navigate("/cart");
        }
      })
      .catch((err) => setCartError(err.message))
      .finally(() => setLoadingCart(false));
  }, [navigate]);

  const subtotal = cartItems.reduce((sum, item) => sum + Number(item.voucher.salePrice) * item.quantity, 0);
  const total = subtotal - appliedDiscount;

  const handleApplyCode = async () => {
    if (!voucherCode.trim()) return;
    setApplyingCode(true);
    setDiscountError("");

    // ── Gọi API thật ──
    try {
      const res = await cartApi.applyCode(voucherCode.trim());
      if (res.success && res.data?.discount !== undefined) {
        setAppliedDiscount(res.data.discount);
        setDiscountError("");
      } else {
        setDiscountError(res.error?.message || "Mã giảm giá không hợp lệ hoặc đã hết hạn.");
      }
    } catch {
      // ── Fallback: hardcoded codes cho dev mode (khi backend chưa hỗ trợ) ──
      await new Promise((r) => setTimeout(r, 300));
      if (voucherCode.toUpperCase() === "EVEREST10") {
        setAppliedDiscount(Math.round(subtotal * 0.1));
      } else if (voucherCode.toUpperCase() === "SALE20") {
        setAppliedDiscount(Math.round(subtotal * 0.2));
      } else {
        setDiscountError("Mã giảm giá không hợp lệ hoặc đã hết hạn.");
      }
    } finally {
      setApplyingCode(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!buyerInfo.fullName.trim() || !buyerInfo.email.trim() || !buyerInfo.phone.trim()) {
      alert("Vui lòng điền đầy đủ thông tin người mua.");
      return;
    }
    if (sendAsGift && !receiverEmail.trim()) {
      alert("Vui lòng nhập email người nhận voucher tặng.");
      return;
    }
    if (cartItems.length === 0) {
      navigate("/cart");
      return;
    }

    setSubmitting(true);
    try {
      // Tạo đơn ở trạng thái Pending, KHÔNG redirect sang VNPAY.
      // Đơn sẽ expire sau 15 phút nếu không thanh toán (xem backend orders.config).
      const createRes = await orderApi.create({
        buyerInfo,
        items: cartItems.map((item) => ({
          voucherId: item.voucher.voucherId,
          quantity: item.quantity,
        })),
        sendAsGift,
        ...(sendAsGift && {
          receiverEmail: receiverEmail.trim(),
          giftMessage: giftMessage.trim(),
        }),
      });

      if (!createRes.success || !createRes.data?.orderId) {
        throw new Error(createRes.error?.message || "Không thể tạo đơn hàng.");
      }

      // Xóa cart và chuyển đến trang /orders để user có thể thanh toán sau.
      cartApi.clearCart().catch(() => {
        /* ignore — không chặn flow */
      });
      navigate(`/orders?justPlaced=${createRes.data.orderId}`);
    } catch (err: any) {
      alert(err.message || "Đã xảy ra lỗi. Vui lòng thử lại.");
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!buyerInfo.fullName.trim() || !buyerInfo.email.trim() || !buyerInfo.phone.trim()) {
      alert("Vui lòng điền đầy đủ thông tin người mua.");
      return;
    }
    if (sendAsGift && !receiverEmail.trim()) {
      alert("Vui lòng nhập email người nhận voucher tặng.");
      return;
    }
    if (cartItems.length === 0) {
      navigate("/cart");
      return;
    }

    setSubmitting(true);
    try {
      // ── Step 1: create order (Pending) ──
      const createRes = await orderApi.create({
        buyerInfo,
        items: cartItems.map((item) => ({
          voucherId: item.voucher.voucherId,
          quantity: item.quantity,
        })),
        sendAsGift,
        ...(sendAsGift && {
          receiverEmail: receiverEmail.trim(),
          giftMessage: giftMessage.trim(),
        }),
      });

      if (!createRes.success || !createRes.data?.orderId) {
        throw new Error(createRes.error?.message || "Không thể tạo đơn hàng.");
      }

      const orderId = createRes.data.orderId;

      // ── Step 2: tạo URL thanh toán VNPAY ──
      const paymentRes = await paymentApi.create(orderId);

      if (!paymentRes.success || !paymentRes.data?.paymentUrl) {
        throw new Error(paymentRes.error?.message || "Không thể tạo liên kết thanh toán.");
      }

      // ── Step 3: clear cart trước khi redirect (tránh user back lại) ──
      cartApi.clearCart().catch(() => {
        /* ignore — không chặn payment */
      });

      // ── Step 4: redirect sang VNPAY sandbox ──
      // Sau khi thanh toán, VNPAY redirect về VNP_RETURN_URL (/payment/return)
      window.location.href = paymentRes.data.paymentUrl;
    } catch (err: any) {
      alert(err.message || "Đã xảy ra lỗi. Vui lòng thử lại.");
      setSubmitting(false);
    }
  };

  if (loadingCart) {
    return <Loading />;
  }

  if (cartError) {
    return (
      <div
        style={{
          background: "#F8FAFC",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <p style={{ color: "#EF4444", fontFamily: "Inter, sans-serif" }}>{cartError}</p>
        <Link to="/cart" style={{ color: "#0E76A8" }}>
          Quay lại giỏ hàng
        </Link>
      </div>
    );
  }

  const updateBuyer = (k: keyof typeof buyerInfo, v: string) => setBuyerInfo((prev) => ({ ...prev, [k]: v }));

  const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    background: "#F1F5F9",
    border: "1.5px solid transparent",
    borderRadius: 10,
    fontSize: 14,
    color: "#1E293B",
    fontFamily: "Inter, sans-serif",
    outline: "none",
    boxSizing: "border-box" as const,
  };

  const requiredLabelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    color: "#1E293B",
    marginBottom: 6,
  };

  const RequiredLabel = ({ children }: { children: React.ReactNode }) => (
    <label style={requiredLabelStyle}>
      {children}
      <span style={{ color: "#EF4444", marginLeft: 4 }} aria-label="bắt buộc">
        *
      </span>
    </label>
  );

  return (
    <div style={{ background: "#F8FAFC", minHeight: "100vh" }}>
      <Breadcrumb
        backHref="/cart"
        items={[{ label: "Trang chủ", href: "/" }, { label: "Giỏ hàng", href: "/cart" }, { label: "Thanh toán" }]}
      />

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px" }}>
        <div className="responsive-cart-layout">
          {/* LEFT */}
          <div>
            {/* Buyer Info */}
            <div
              style={{
                background: "white",
                borderRadius: 16,
                padding: 28,
                boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                marginBottom: 16,
              }}
            >
              <h2
                style={{
                  fontFamily: "Manrope, sans-serif",
                  fontSize: 16,
                  fontWeight: 800,
                  color: "#1E293B",
                  marginBottom: 20,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    background: "#E0F2FE",
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0E76A8" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                Thông tin người mua
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <RequiredLabel>Họ và tên</RequiredLabel>
                  <input
                    type="text"
                    placeholder="Nhập đầy đủ họ và tên"
                    value={buyerInfo.fullName}
                    onChange={(e) => updateBuyer("fullName", e.target.value)}
                    style={inputStyle}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "#0E76A8")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "transparent")}
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <RequiredLabel>Email</RequiredLabel>
                    <input
                      type="email"
                      placeholder="example@email.com"
                      value={buyerInfo.email}
                      onChange={(e) => updateBuyer("email", e.target.value)}
                      style={inputStyle}
                      onFocus={(e) => (e.currentTarget.style.borderColor = "#0E76A8")}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "transparent")}
                    />
                  </div>
                  <div>
                    <RequiredLabel>Số điện thoại</RequiredLabel>
                    <input
                      type="tel"
                      placeholder="0xxx xxx xxx"
                      value={buyerInfo.phone}
                      onChange={(e) => updateBuyer("phone", e.target.value)}
                      style={inputStyle}
                      onFocus={(e) => (e.currentTarget.style.borderColor = "#0E76A8")}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "transparent")}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Gift toggle */}
            <div
              style={{
                background: "white",
                borderRadius: 16,
                padding: "20px 28px",
                marginBottom: 16,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    background: "#ECFDF5",
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2">
                    <polyline points="20 12 20 22 4 22 4 12" />
                    <rect x="2" y="7" width="20" height="5" />
                    <line x1="12" y1="22" x2="12" y2="7" />
                    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
                  </svg>
                </div>
                <div>
                  <h3
                    style={{
                      fontFamily: "Manrope, sans-serif",
                      fontSize: 15,
                      fontWeight: 700,
                      color: "#1E293B",
                      margin: 0,
                    }}
                  >
                    Gửi tặng bạn bè
                  </h3>
                  <p style={{ fontSize: 12, color: "#64748B", margin: "2px 0 0 0" }}>
                    Mã voucher sẽ được gửi đến người nhận
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSendAsGift(!sendAsGift);
                  if (sendAsGift) {
                    setReceiverEmail("");
                    setGiftMessage("");
                  }
                }}
                style={{
                  width: 44,
                  height: 24,
                  borderRadius: 12,
                  background: sendAsGift ? "#0E76A8" : "#CBD5E1",
                  border: "none",
                  cursor: "pointer",
                  position: "relative",
                  transition: "background 0.2s",
                  padding: 0,
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: 2,
                    left: sendAsGift ? 22 : 2,
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: "white",
                    transition: "left 0.2s",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                  }}
                />
              </button>
            </div>

            {/* Gift form */}
            {sendAsGift && (
              <div
                style={{
                  background: "white",
                  borderRadius: 16,
                  padding: 24,
                  marginBottom: 16,
                  border: "1.5px solid #10B981",
                  boxShadow: "0 1px 2px rgba(16,185,129,0.1)",
                }}
              >
                <h3
                  style={{
                    fontFamily: "Manrope, sans-serif",
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#10B981",
                    marginBottom: 16,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Thông tin người nhận
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <label
                      style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1E293B", marginBottom: 6 }}
                    >
                      Email người nhận <span style={{ color: "#EF4444" }}>*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="Nhập email người bạn muốn tặng"
                      value={receiverEmail}
                      onChange={(e) => setReceiverEmail(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        background: "#F0FDF4",
                        border: "1.5px solid #86EFAC",
                        borderRadius: 10,
                        fontSize: 14,
                        color: "#1E293B",
                        fontFamily: "Inter, sans-serif",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = "#10B981")}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "#86EFAC")}
                    />
                  </div>
                  <div>
                    <label
                      style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1E293B", marginBottom: 6 }}
                    >
                      Lời chúc (tùy chọn)
                    </label>
                    <textarea
                      placeholder="Viết lời chúc cho người bạn yêu quý..."
                      value={giftMessage}
                      onChange={(e) => setGiftMessage(e.target.value.slice(0, 500))}
                      rows={3}
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        background: "#F0FDF4",
                        border: "1.5px solid #86EFAC",
                        borderRadius: 10,
                        fontSize: 14,
                        color: "#1E293B",
                        fontFamily: "Inter, sans-serif",
                        outline: "none",
                        boxSizing: "border-box",
                        resize: "vertical",
                        lineHeight: 1.5,
                      }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = "#10B981")}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "#86EFAC")}
                    />
                    <div style={{ textAlign: "right", fontSize: 11, color: "#94A3B8", marginTop: 4 }}>
                      {giftMessage.length}/500
                    </div>
                  </div>
                  <div
                    style={{
                      padding: "12px 16px",
                      background: "#F0FDF4",
                      borderRadius: 10,
                      border: "1px solid #86EFAC",
                    }}
                  >
                    <p style={{ fontSize: 12, color: "#64748B", margin: 0, lineHeight: 1.5 }}>
                      <strong style={{ color: "#10B981" }}>{buyerInfo.fullName || "Bạn"}</strong> sẽ tặng voucher này
                      cho người nhận qua email. Mã voucher sẽ được gửi kèm lời chúc của bạn.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Payment — VNPAY only */}
            <div
              style={{ background: "white", borderRadius: 16, padding: 28, boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}
            >
              <h2
                style={{
                  fontFamily: "Manrope, sans-serif",
                  fontSize: 16,
                  fontWeight: 800,
                  color: "#1E293B",
                  marginBottom: 20,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    background: "#FEF3C7",
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2">
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <line x1="2" y1="10" x2="22" y2="10" />
                  </svg>
                </div>
                Thanh toán qua VNPAY
              </h2>
              <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.6, marginBottom: 12 }}>
                Bạn sẽ được chuyển đến cổng thanh toán VNPAY an toàn. Hỗ trợ tất cả ngân hàng nội địa, thẻ quốc tế và ví
                điện tử.
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 16px",
                  border: "1.5px solid #E2E8F0",
                  borderRadius: 12,
                  background: "#F8FAFC",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span style={{ fontSize: 13, color: "#64748B", fontWeight: 600 }}>
                  Thanh toán được bảo mật bởi VNPAY
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT: Summary */}
          <div
            style={{
              background: "white",
              borderRadius: 16,
              padding: 28,
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
              position: "sticky",
              top: 88,
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
              Tóm tắt đơn hàng
            </h2>

            {/* Cart items */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                marginBottom: 16,
                paddingBottom: 16,
                borderBottom: "1px solid #E2E8F0",
              }}
            >
              {cartItems.map((item) => (
                <div key={item.voucherId} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <img
                    src={
                      item.voucher?.imageUrl ||
                      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&h=200&fit=crop"
                    }
                    alt={item.voucher?.title}
                    style={{ width: 56, height: 56, borderRadius: 10, objectFit: "cover", flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#1E293B",
                        marginBottom: 4,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {item.voucher?.title || "Voucher"}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 12, color: "#94A3B8" }}>
                        SL: {String(item.quantity).padStart(2, "0")}
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#1E293B" }}>
                        {formatPrice(Number(item.voucher.salePrice) * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Discount code */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1E293B", marginBottom: 8 }}>
                Mã giảm giá
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="text"
                  value={voucherCode}
                  onChange={(e) => {
                    setVoucherCode(e.target.value);
                    setDiscountError("");
                  }}
                  placeholder="Nhập mã (thử: EVEREST10)"
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    background: "#F1F5F9",
                    border: `1.5px solid ${discountError ? "#EF4444" : "#E2E8F0"}`,
                    borderRadius: 10,
                    fontSize: 13,
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 600,
                    color: "#1E293B",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#0E76A8")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = discountError ? "#EF4444" : "#E2E8F0")}
                />
                <button
                  onClick={handleApplyCode}
                  disabled={applyingCode || !voucherCode.trim()}
                  style={{
                    padding: "10px 18px",
                    background: applyingCode ? "#94A3B8" : "#0E76A8",
                    color: "white",
                    border: "none",
                    borderRadius: 10,
                    fontFamily: "Inter, sans-serif",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: applyingCode || !voucherCode.trim() ? "not-allowed" : "pointer",
                    transition: "background 0.2s",
                    whiteSpace: "nowrap",
                  }}
                >
                  {applyingCode ? "..." : "Áp dụng"}
                </button>
              </div>
              {discountError && (
                <p style={{ marginTop: 6, fontSize: 12, color: "#EF4444", fontFamily: "Inter, sans-serif" }}>
                  {discountError}
                </p>
              )}
              {appliedDiscount > 0 && (
                <p
                  style={{
                    marginTop: 6,
                    fontSize: 12,
                    color: "#10B981",
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 600,
                  }}
                >
                  ✓ Đã áp dụng mã giảm giá!
                </p>
              )}
            </div>

            {/* Totals */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                marginBottom: 16,
                paddingBottom: 16,
                borderBottom: "1px solid #E2E8F0",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: "#64748B" }}>Tạm tính</span>
                <span style={{ color: "#1E293B", fontWeight: 600 }}>{formatPrice(subtotal)}</span>
              </div>
              {appliedDiscount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span style={{ color: "#64748B" }}>Giảm giá</span>
                  <span style={{ color: "#EF4444", fontWeight: 600 }}>-{formatPrice(appliedDiscount)}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: "#64748B" }}>Phí dịch vụ</span>
                <span style={{ color: "#1E293B", fontWeight: 600 }}>Miễn phí</span>
              </div>
            </div>

            {/* Grand total */}
            <div style={{ marginBottom: 20 }}>
              <div
                style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 4 }}
              >
                <span style={{ fontSize: 15, fontWeight: 700, color: "#1E293B" }}>Tổng cộng</span>
                <span style={{ fontSize: 22, fontWeight: 800, color: "#0E76A8", fontFamily: "Manrope, sans-serif" }}>
                  {formatPrice(total)}
                </span>
              </div>
              <div style={{ textAlign: "right", fontSize: 11, color: "#94A3B8", fontStyle: "italic" }}>
                (Đã bao gồm VAT)
              </div>
            </div>

            {/* Pay buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                onClick={handlePlaceOrder}
                disabled={submitting}
                style={{
                  width: "100%",
                  padding: "13px 0",
                  background: "white",
                  color: "#0E76A8",
                  border: "1.5px solid #0E76A8",
                  borderRadius: 12,
                  fontFamily: "Manrope, sans-serif",
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: submitting ? "wait" : "pointer",
                  transition: "all 0.2s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  letterSpacing: "0.3px",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M9 11l3 3L22 4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
                ĐẶT HÀNG (THANH TOÁN SAU)
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                style={{
                  width: "100%",
                  padding: "14px 0",
                  background: submitting ? "#94A3B8" : "#0E76A8",
                  color: "white",
                  border: "none",
                  borderRadius: 12,
                  fontFamily: "Manrope, sans-serif",
                  fontSize: 15,
                  fontWeight: 800,
                  cursor: submitting ? "wait" : "pointer",
                  transition: "background 0.2s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  letterSpacing: "0.5px",
                }}
                onMouseEnter={(e) => {
                  if (!submitting) e.currentTarget.style.background = "#0A5C87";
                }}
                onMouseLeave={(e) => {
                  if (!submitting) e.currentTarget.style.background = "#0E76A8";
                }}
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Đang chuyển đến VNPAY...
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>{" "}
                    THANH TOÁN QUA VNPAY
                  </>
                )}
              </button>
              <p
                style={{
                  fontSize: 11,
                  color: "#64748B",
                  textAlign: "center",
                  marginTop: 4,
                  lineHeight: 1.5,
                }}
              >
                Đơn hàng "Thanh toán sau" sẽ tự động hủy sau 15 phút nếu chưa thanh toán.
              </p>
            </div>

            {/* Trust badges */}
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #E2E8F0", textAlign: "center" }}>
              <div style={{ fontSize: 10, color: "#94A3B8", letterSpacing: "1px", lineHeight: 1.6 }}>
                ĐẢM BẢO BẢO MẬT BỞI QUỐC TẾ PCI DSS
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
