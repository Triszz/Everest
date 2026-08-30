# 📚 TÀI LIỆU ÔN TẬP VẤN ĐÁP BACKEND HỆ THỐNG EVEREST (TỔNG HỢP TOÀN BỘ CHI TIẾT)

**Dự án:** Everest — Nền tảng E-Commerce Voucher & Ưu đãi  
**Phân hệ:** Customer & Auth & Payment & Notifications Backend Services  
**Mục đích:** Tài liệu học thuộc lòng và tra cứu phục vụ buổi vấn đáp đạt ĐIỂM 10 TUYỆT ĐỐI.

---
---

# 🎓 PHẦN 1: HƯỚNG DẪN ÔN TẬP VẤN ĐÁP BACKEND CUSTOMER

## 📌 1. BẢNG TỔNG HỢP CÁC MODULE & API PHÂN HỆ CUSTOMER

| STT | Module | Thư mục Backend | Chức năng chính | Mức độ quan trọng vấn đáp |
| :--- | :--- | :--- | :--- | :--- |
| 1 | **Orders & Payment** | `backend/src/modules/customer/orders/` | Tạo đơn hàng, Thanh toán VNPAY (IPN & Return), Phát hành mã Voucher (`IssuedVoucher`), Transaction, Admin Hủy đơn qua `cancelledBy` | ⭐⭐⭐⭐⭐ **(ĐIỂM 10 - BẮT BUỘC)** |
| 2 | **Auth & OTP** | `backend/src/modules/auth/` | Đăng ký/Đăng nhập, JWT + Refresh Token Rotation, Gửi OTP Email/SMS, Quên & Đặt lại mật khẩu | ⭐⭐⭐⭐⭐ **(ĐIỂM 10 - BẮT BUỘC)** |
| 3 | **Issued Vouchers** | `backend/src/modules/customer/issued-vouchers/` | Kho voucher cá nhân, Xem mã 16 số, Tặng voucher cho người khác (`giftVoucher`) | ⭐⭐⭐⭐⭐ **(ĐIỂM 10 - BẮT BUỘC)** |
| 4 | **Vouchers Listing** | `backend/src/modules/customer/vouchers/` | Tìm kiếm, lọc đa tiêu chí, sắp xếp, phân trang, Voucher nổi bật | ⭐⭐⭐⭐ **(RẤT HAY HỎI)** |
| 5 | **Cart (Giỏ hàng)** | `backend/src/modules/customer/cart/` | Thêm/Sửa/Xóa giỏ hàng, Kiểm tra tồn kho khả dụng | ⭐⭐⭐⭐ **(NÊN NẮM)** |
| 6 | **Notifications** | `backend/src/modules/customer/notifications/` | Quản lý thông báo, đếm số lượng chưa đọc (`unreadCount`), Cài đặt nhận tin | ⭐⭐⭐⭐ **(NÊN NẮM)** |
| 7 | **Reviews** | `backend/src/modules/customer/reviews/` | Đánh giá & bình luận voucher (Chỉ cho phép người đã mua đơn `Paid`) | ⭐⭐⭐ **(CƠ BẢN)** |
| 8 | **Categories** | `backend/src/modules/customer/categories/` | Lấy danh sách danh mục & số lượng voucher | ⭐⭐⭐ **(CƠ BẢN)** |
| 9 | **Profile** | `backend/src/modules/customer/profile/` | Xem & Chỉnh sửa thông tin cá nhân, Đổi mật khẩu | ⭐⭐⭐ **(CƠ BẢN)** |

---

## 🏆 2. TOP 3 MODULE TRỌNG TÂM CẦN HỌC THUỘC ĐỂ ĐẠT ĐIỂM 10

### 🥇 Top 1: Module `Orders & Payment` & Logic Nhận Biết Admin Hủy Đơn Qua `cancelledBy` (`admin.service.ts`)
Đây là **module cốt lõi nhất** của dự án E-Commerce. Giảng viên chắc chắn sẽ xoáy sâu vào luồng này!

* **Đoạn code cần thuộc nằm ở:** 
  - [`backend/src/modules/customer/orders/orders.service.ts`](file:///e:/Documents/HCMUS/Semester3_Year3/TM%C4%90T/Everest/backend/src/modules/customer/orders/orders.service.ts)
  - [`backend/src/modules/admin/admin.service.ts`](file:///e:/Documents/HCMUS/Semester3_Year3/TM%C4%90T/Everest/backend/src/modules/admin/admin.service.ts) (Dòng 1870 - 1950 - Hàm `cancelOrder`)
* **Luồng xử lý kỹ thuật quan trọng:**
  1. **Tạo đơn hàng (`createOrder`)**:
     - Sử dụng `prisma.$transaction` để đảm bảo tính toàn vẹn dữ liệu (ACID).
     - Kiểm tra số lượng tồn kho `availableQuantity >= qty`. Nếu thiếu $\rightarrow$ Throw lỗi `OUT_OF_STOCK` rollback toàn bộ.
     - Trừ số lượng kho `availableQuantity: { decrement: qty }`.
     - Tạo `Order` + `OrderItem`.
  2. **Thanh toán VNPAY (`createPaymentUrl` & `vnpayIpn`)**:
     - **Tạo URL**: Băm HMAC-SHA512 tất cả tham số thanh toán gửi sang VNPAY Sandbox kèm secret key `VNP_HASH_SECRET`.
     - **Xử lý IPN (Server-to-Server)**: VNPAY gọi về `/api/customer/payment/ipn`. Backend kiểm tra chữ ký checksum `vnp_SecureHash`.
     - Nếu thanh toán thành công (`vnp_ResponseCode == '00'`):
       - Cập nhật `order.paymentStatus = 'Paid'`.
       - **Sinh mã Voucher (`generateVoucherCode`)**: Tạo mã 16 ký tự viết hoa ngẫu nhiên cho từng suất mua và chèn vào bảng `IssuedVoucher` với trạng thái `Unused`.
       - Gửi Email xác nhận đơn hàng chứa mã voucher & Tạo Notification `ORDER_PAID`.
  3. **Quy trình Admin Hủy Đơn Hàng & Phát Thông Báo qua Dấu hiệu `cancelledBy`**:
     - **TẠI SAO KHÔNG PHỤ THUỘC VÀO `paymentStatus` ĐỂ HỦY?**  
       Khi đơn hàng đã thanh toán (`Paid`) bị Admin hủy, hệ thống **GIỮ NGUYÊN `paymentStatus = "Paid"`** để phục vụ việc Admin nhận biết đơn nào đã thanh toán thực tế để thực hiện quy trình **Hoàn tiền (Refund)**!
     - **Nhận biết Đơn bị Admin Hủy qua `cancelledBy`:**  
       Backend căn cứ vào thuộc tính **`cancelledBy !== null`** (chứa UUID của Admin hủy). Toàn bộ các kiểm tra trong CSDL (`orders.service.ts`, `payment.service.ts`, `admin.service.ts`) đều sử dụng điều kiện `if (order.cancelledBy || order.cancelledAt || order.paymentStatus === 'Cancelled')`.
     - **Cơ chế phát thông báo cho Customer trong Transaction:**
       - Đổi trạng thái mã voucher chưa dùng thành khóa: `IssuedVoucher.status = "Locked"`.
       - Hoàn trả lại tồn kho khả dụng cho sản phẩm: `availableQuantity: { increment: quantity }`.
       - Lưu vết: `cancelledBy = actor.userId`, `cancelledAt = now`, `cancelReason = reason`.
       - **Phát thông báo cho Customer (`notifyOrderCancelled`)**: Gọi `notificationsService.notifyOrderCancelled(order.customerId, orderId, reason)` phát thông báo `SYSTEM` với:
         - **Tiêu đề:** `Đơn hàng #${orderId} đã bị hủy`
         - **Nội dung:** `Đơn hàng #${orderId} đã bị hủy bởi quản trị viên. Lý do: ${reason}. Yêu cầu hoàn tiền của bạn đang được xử lý.`

---

### 🥈 Top 2: Module `Auth & OTP` (`auth.service.ts` & `password.service.ts`)
Module quản lý định danh người dùng và bảo mật hệ thống.

* **Đoạn code cần thuộc nằm ở:** 
  - [`backend/src/modules/auth/auth.service.ts`](file:///e:/Documents/HCMUS/Semester3_Year3/TM%C4%90T/Everest/backend/src/modules/auth/auth.service.ts)
  - [`backend/src/modules/auth/password.service.ts`](file:///e:/Documents/HCMUS/Semester3_Year3/TM%C4%90T/Everest/backend/src/modules/auth/password.service.ts)
* **Luồng xử lý kỹ thuật quan trọng:**
  1. **Cơ chế Đăng ký chọn kênh OTP (`email` / `sms`)**:
     - Khi người dùng gửi thông tin đăng ký, Backend tạo tài khoản với `status = 'Inactive'`.
     - Sinh mã OTP 6 số ngẫu nhiên, lưu vào bảng `EmailOtp` với thời hạn `expiresAt` (5 phút).
     - Gửi OTP qua Gmail SMTP bằng `nodemailer` (hoặc SMS gateway).
  2. **Xác thực JWT & Session Management**:
     - Tạo cặp `accessToken` (sống 15 phút) và `refreshToken` (sống 7 ngày).
     - Lưu phiên đăng nhập vào bảng `Session` dưới DB để quản lý Đăng xuất từ xa / Đăng xuất tất cả thiết bị khác (`revokeAllOtherSessions`).
  3. **Quên & Đặt lại mật khẩu (`requestReset` & `resetPassword`)**:
     - Sinh `resetToken` 32 bytes ngẫu nhiên, lưu `PasswordReset` vào CSDL với thời hạn 24 giờ.
     - Gửi email chứa liên kết dạng `http://localhost:5174/reset-password?token=...`.

---

### 🥉 Top 3: Module `Issued Vouchers` & Tặng Voucher (`issued-vouchers.service.ts`)
Tính năng độc đáo của dự án giúp điểm vấn đáp đạt tuyệt đối!

* **Đoạn code cần thuộc nằm ở:** [`backend/src/modules/customer/issued-vouchers/issued-vouchers.service.ts`](file:///e:/Documents/HCMUS/Semester3_Year3/TM%C4%90T/Everest/backend/src/modules/customer/issued-vouchers/issued-vouchers.service.ts)
* **Luồng xử lý kỹ thuật quan trọng (`giftVoucher`):**
  1. Người dùng A muốn tặng mã voucher đã mua cho người dùng B qua Email/SĐT.
  2. Backend kiểm tra `IssuedVoucher.status === 'Unused'` và chưa hết hạn.
  3. Sử dụng Transaction:
     - Đổi quyền sở hữu `customerId` của `IssuedVoucher` từ người A sang người B.
     - Ghi nhận nhật ký tặng quà.
     - Tạo thông báo real-time `VOUCHER_GIFT_RECEIVED` cho người B.

---

## 🎯 3. BỘ CÂU HỎI VẤN ĐÁP KINH ĐIỂN & CÁCH TRẢ LỜI ĐẠT ĐIỂM 10

### ❓ Câu 1: Em hãy giải thích cơ chế nhận biết và thông báo cho Customer khi Admin hủy một đơn hàng? Tại sao không dùng `paymentStatus`?
> **💡 Trả lời điểm 10:**  
> "Báo cáo thầy/cô, hệ thống **không căn cứ vào `paymentStatus` để nhận biết đơn bị Admin hủy**, vì `paymentStatus` vẫn được **giữ nguyên là 'Paid'** nhằm giúp Admin dễ dàng lọc danh sách các đơn đã thu tiền thực tế để phục vụ nghiệp vụ **Hoàn tiền (Refund)**.  
> Thay vào đó, Backend nhận biết đơn hàng bị Admin hủy thông qua thuộc tính **`cancelledBy !== null`** (lưu UUID của Admin hủy).  
> Khi Admin gọi API hủy đơn (`cancelOrder`), Backend cập nhật `cancelledBy = actor.userId`, `cancelledAt = now`, `cancelReason = reason`, đồng thời khóa voucher (`status: Locked`), cộng trả tồn kho khả dụng (`availableQuantity: { increment: qty }`), và tự động gọi `notificationsService.notifyOrderCancelled` để gửi thông báo cho Customer với nội dung: **'Đơn hàng #{orderId} đã bị hủy bởi quản trị viên. Lý do: {reason}. Yêu cầu hoàn tiền của bạn đang được xử lý.'**"

---

### ❓ Câu 2: Em hãy giải thích cách xử lý khi 2 người cùng bấm Mua ngay 1 Voucher cuối cùng (Concurrency / Race Condition)?
> **💡 Trả lời điểm 10:**  
> "Báo cáo thầy/cô, hệ thống sử dụng **Database Transaction (`prisma.$transaction`)** kết hợp với phép trừ số lượng nguyên tử (`availableQuantity: { decrement: quantity }`).  
> Khi 2 request tới cùng lúc, Transaction đầu tiên sẽ giữ Lock trên hàng đó. Nếu `availableQuantity` giảm xuống âm hoặc nhỏ hơn số lượng yêu cầu, điều kiện `if (voucher.availableQuantity < quantity)` sẽ phát hiện và **Throw Exception (`OUT_OF_STOCK`)**. Khi đó, Prisma sẽ tự động **Rollback** toàn bộ giao dịch, đảm bảo không bao giờ bị oversell (bán âm kho)."

---

### ❓ Câu 3: Luồng thanh toán VNPAY IPN được bảo mật và chống gian lận như thế nào?
> **💡 Trả lời điểm 10:**  
> "Dạ, để chống sửa đổi số tiền hoặc gian lận tham số, khi VNPAY trả kết quả về callback IPN (`/api/customer/payment/ipn`), Backend không tin tưởng ngay dữ liệu gửi lên mà thực hiện 2 bước kiểm tra:  
> 1. **Tái tạo chữ ký Checksum**: Backend lấy toàn bộ tham số trả về (trừ `vnp_SecureHash`), sắp xếp alphabet và băm lại bằng thuật toán **HMAC-SHA512** với bí mật `VNP_HASH_SECRET`. Nếu chữ ký không khớp $\rightarrow$ Từ chối ngay.  
> 2. **Đối soát số tiền**: Backend truy vấn lại Đơn hàng dưới CSDL và so sánh `order.totalAmount` với `vnp_Amount / 100`. Nếu số tiền khớp và `vnp_ResponseCode == '00'` thì mới cập nhật trạng thái `Paid` và cấp mã Voucher."

---

### ❓ Câu 4: Làm thế nào để quản lý Đăng nhập đa thiết bị và Đăng xuất từ xa?
> **💡 Trả lời điểm 10:**  
> "Dạ, hệ thống kết hợp giữa **JWT Token** và **Session Table trong CSDL**. Mỗi lần đăng nhập thành công, Backend lưu một bản ghi vào bảng `Session` chứa `userId`, `refreshToken`, `ipAddress`, `userAgent`.  
> Khi người dùng muốn Đăng xuất thiết bị khác, Backend chỉ cần thu hồi (`isRevoked = true` hoặc xóa) bản ghi `Session` của thiết bị đó. Khi Refresh Token từ thiết bị đó gửi lên, Middleware kiểm tra Session đã bị thu hồi $\rightarrow$ Hủy phiên và bắt đăng nhập lại."

---

### ❓ Câu 5: Làm sao để hiển thị đúng danh sách Voucher cho khách hàng mà không bị sót hay bị phân trang ngắt quãng?
> **💡 Trả lời điểm 10:**  
> "Dạ, hệ thống định nghĩa một bộ lọc chuẩn `VISIBLE_VOUCHER_WHERE()` bao gồm 2 điều kiện bắt buộc: `approvalStatus: 'Approved'` (Admin đã duyệt) và `displayStatus: 'Visible'` (Partner cho phép hiển thị).  
> Đồng thời, ở API lấy danh sách (`vouchers.service.ts`), hệ thống hỗ trợ phân trang động `buildPagination(page, limit)` và sắp xếp mặc định theo `createdAt: 'desc'` để voucher mới thêm luôn xuất hiện ở trang 1."

---

## 📑 4. CHI TIẾT TOÀN BỘ API CUSTOMER BACKEND (BẢNG SỬ DỤNG, CÁCH HOẠT ĐỘNG & THUỘC TÍNH)

### 🔑 A. MODULE AUTHENTICATION & XÁC THỰC (`/api/auth`)

#### 1. `POST /api/auth/register` (Đăng ký tài khoản)
* **Bảng CSDL sử dụng:** `User`, `EmailOtp`
* **Thuộc tính sử dụng:** `email`, `password` (bcrypt hash), `fullName`, `phoneNumber`, `status` ('Inactive'), `otpChannel` ('email' | 'sms')
* **Cách hoạt động:**
  1. Validate dữ liệu đầu vào (email chưa trùng, password >= 6 ký tự).
  2. Băm mật khẩu bằng `bcrypt.hash(password, 12)`.
  3. Tạo tài khoản `User` với `status: 'Inactive'`.
  4. Sinh mã OTP 6 số ngẫu nhiên, tạo bản ghi `EmailOtp` (`code`, `expiresAt = now + 5 min`).
  5. Gửi OTP qua Gmail SMTP (`nodemailer`) hoặc SMS.

#### 2. `POST /api/auth/login` (Đăng nhập)
* **Bảng CSDL sử dụng:** `User`, `Session`
* **Thuộc tính sử dụng:** `email`, `password`, `userId`, `role`, `accessToken`, `refreshToken`, `ipAddress`, `userAgent`
* **Cách hoạt động:**
  1. Tìm `User` theo email. Kiểm tra `status === 'Active'`.
  2. So sánh mật khẩu bằng `bcrypt.compare(password, user.passwordHash)`.
  3. Sinh `accessToken` (JWT 15m) và `refreshToken` (JWT 7d).
  4. Tạo bản ghi `Session` lưu `refreshToken`, `ipAddress`, `userAgent` của thiết bị.

#### 3. `POST /api/auth/email-otp/verify` (Xác thực OTP Đăng ký)
* **Bảng CSDL sử dụng:** `EmailOtp`, `User`, `Session`
* **Thuộc tính sử dụng:** `email`, `code`, `purpose` ('REGISTER_VERIFY'), `status` ('Active')
* **Cách hoạt động:**
  1. Kiểm tra bản ghi `EmailOtp` theo `email`, `code`, `purpose`, `isUsed: false` và `expiresAt > now`.
  2. Đánh dấu OTP đã dùng (`isUsed: true`).
  3. Cập nhật `User.status = 'Active'`.
  4. Sinh tokens và tạo `Session` tự động đăng nhập người dùng.

#### 4. `POST /api/auth/refresh-token` (Cấp lại Access Token mới)
* **Bảng CSDL sử dụng:** `Session`, `User`
* **Thuộc tính sử dụng:** `refreshToken`, `sessionId`, `isRevoked`
* **Cách hoạt động:**
  1. Verify chữ ký `refreshToken`.
  2. Kiểm tra `Session` dưới CSDL: Nếu `isRevoked == true` $\rightarrow$ Từ chối (Token bị vô hiệu).
  3. Sinh `accessToken` mới và `refreshToken` mới (Token Rotation), cập nhật lại `Session`.

#### 5. `POST /api/auth/forgot-password` (Yêu cầu đặt lại mật khẩu)
* **Bảng CSDL sử dụng:** `User`, `PasswordReset`
* **Thuộc tính sử dụng:** `email`, `token` (32 bytes hex), `expiresAt` (24h)
* **Cách hoạt động:**
  1. Kiểm tra `User` theo email. Xóa các token reset cũ chưa dùng.
  2. Tạo ngẫu nhiên `token` (32 bytes hex), lưu bản ghi `PasswordReset` với `expiresAt` (24 giờ).
  3. Gửi HTML Email chứa link `http://localhost:5174/reset-password?token=...` qua Gmail SMTP.

#### 6. `PUT /api/auth/reset-password` (Đặt lại mật khẩu mới)
* **Bảng CSDL sử dụng:** `PasswordReset`, `User`
* **Thuộc tính sử dụng:** `token`, `newPassword`, `usedAt`
* **Cách hoạt động:**
  1. Tìm bản ghi `PasswordReset` theo `token`, check `usedAt == null` và `expiresAt > now`.
  2. Băm mật khẩu mới `bcrypt.hash(newPassword, 12)` và cập nhật `User.passwordHash`.
  3. Đánh dấu `PasswordReset.usedAt = now`.

---

### 🛒 B. MODULE VOUCHERS & TÌM KIẾM (`/api/vouchers` & `/api/categories`)

#### 1. `GET /api/vouchers` (Danh sách Voucher + Lọc + Phân trang)
* **Bảng CSDL sử dụng:** `Voucher`, `Category`, `Partner`, `VoucherBranch`, `Branch`
* **Thuộc tính sử dụng:** `approvalStatus` ('Approved'), `displayStatus` ('Visible'), `salePrice`, `originalPrice`, `availableQuantity`, `createdAt`
* **Cách hoạt động:**
  1. Lấy điều kiện hiển thị chuẩn `VISIBLE_VOUCHER_WHERE()` (`approvalStatus: Approved`, `displayStatus: Visible`).
  2. Áp dụng các bộ lọc nâng cao từ query: `search` (tìm tiêu đề/mô tả), `category_ids`, `min_price`, `max_price`, `partner_id`, `area`.
  3. Sắp xếp (`sort`): `newest` (`createdAt: desc`), `price_asc`, `popular` (`orderItems count`).
  4. Phân trang bằng `buildPagination(page, limit)` trả kèm metadata `pagination: { page, totalPages, total }`.

#### 2. `GET /api/vouchers/featured` (Top 8 Voucher nổi bật trang chủ)
* **Bảng CSDL sử dụng:** `Voucher`, `Partner`, `Category`
* **Thuộc tính sử dụng:** `VISIBLE_VOUCHER_WHERE()`, `take: 8`, `orderBy: { createdAt: 'desc' }`
* **Cách hoạt động:** Truy vấn 8 voucher mới nhất thỏa mãn điều kiện Approved + Visible để hiển thị Carousel/Grid trang chủ.

#### 3. `GET /api/categories` (Danh sách Danh mục)
* **Bảng CSDL sử dụng:** `Category`, `Voucher`
* **Thuộc tính sử dụng:** `categoryId`, `categoryName`, `_count: { vouchers: true }`
* **Cách hoạt động:** Trả về danh sách danh mục sắp xếp A-Z kèm đếm tổng số voucher thuộc danh mục đó (`voucherCount`).

---

### 🛍️ C. MODULE GIỎ HÀNG (`/api/customer/cart`)

#### 1. `GET /api/customer/cart` (Xem giỏ hàng)
* **Bảng CSDL sử dụng:** `Cart`, `CartItem`, `Voucher`, `Partner`
* **Thuộc tính sử dụng:** `cartId`, `customerId`, `quantity`, `salePrice`, `availableQuantity`
* **Cách hoạt động:** Truy vấn giỏ hàng của `customerId`, tính tổng tạm tính `subtotal = sum(salePrice * quantity)`.

#### 2. `POST /api/customer/cart/items` (Thêm voucher vào giỏ hàng)
* **Bảng CSDL sử dụng:** `Cart`, `CartItem`, `Voucher`
* **Thuộc tính sử dụng:** `voucherId`, `quantity`, `availableQuantity`
* **Cách hoạt động:**
  1. Kiểm tra voucher tồn tại & `availableQuantity >= quantity`.
  2. Tìm hoặc tạo `Cart` cho user.
  3. Upsert `CartItem`: Nếu voucher đã có trong giỏ $\rightarrow$ cộng dồn `quantity`, nếu chưa có $\rightarrow$ tạo mới.

#### 3. `PUT /api/customer/cart/items/:id` & `DELETE /api/customer/cart/items/:id`
* **Bảng CSDL sử dụng:** `CartItem`, `Voucher`
* **Thuộc tính sử dụng:** `cartItemId`, `quantity`
* **Cách hoạt động:** Cập nhật lại số lượng hoặc xóa sản phẩm khỏi giỏ hàng sau khi kiểm tra số lượng tồn kho khả dụng.

---

### 💳 D. MODULE ĐƠN HÀNG & THANH TOÁN (`/api/customer/orders` & `/api/customer/payment`)

#### 1. `POST /api/customer/orders` (Tạo đơn hàng mua voucher)
* **Bảng CSDL sử dụng:** `Order`, `OrderItem`, `Voucher`, `CartItem`
* **Thuộc tính sử dụng:** `orderId`, `totalAmount`, `paymentStatus` ('Pending'), `availableQuantity`
* **Cách hoạt động (Transaction):**
  1. Chạy trong `prisma.$transaction`.
  2. Duyệt qua từng item mua, kiểm tra `voucher.availableQuantity >= qty`.
  3. Trừ số lượng kho khả dụng: `availableQuantity: { decrement: qty }`.
  4. Tạo `Order` + danh sách `OrderItem`.
  5. Xóa các mục tương ứng trong giỏ hàng (`CartItem.deleteMany`).

#### 2. `POST /api/customer/payment/vnpay/create-url` (Tạo URL VNPAY)
* **Bảng CSDL sử dụng:** `Order`
* **Thuộc tính sử dụng:** `orderId`, `totalAmount`, `vnp_TxnRef`, `vnp_SecureHash`
* **Cách hoạt động:** Gom thông tin đơn hàng, tạo chuỗi dữ liệu băm mã hóa **HMAC-SHA512** với bí mật `VNP_HASH_SECRET` và trả về URL thanh toán VNPAY Sandbox.

#### 3. `GET /api/customer/payment/ipn` (Callback IPN từ VNPAY - Server to Server)
* **Bảng CSDL sử dụng:** `Order`, `OrderItem`, `IssuedVoucher`, `Notification`
* **Thuộc tính sử dụng:** `vnp_ResponseCode` ('00'), `vnp_SecureHash`, `vnp_Amount`, `paymentStatus` ('Paid'), `voucherCode` (16 ký tự)
* **Cách hoạt động:**
  1. Kiểm tra chữ ký Checksum `vnp_SecureHash`.
  2. Đối soát số tiền `order.totalAmount == vnp_Amount / 100`.
  3. Cập nhật `order.paymentStatus = 'Paid'`.
  4. Sinh mã **16 ký tự ngẫu nhiên** viết hoa cho từng voucher và chèn vào bảng `IssuedVoucher` (`status: Unused`).
  5. Gửi email xác nhận kèm mã voucher & Tạo Notification `ORDER_PAID`.

---

### 🎁 E. MODULE KHO VOUCHER CÁ NHÂN & TẶNG VOUCHER (`/api/customer/issued-vouchers`)

#### 1. `GET /api/customer/issued-vouchers` (Xem kho voucher đã mua)
* **Bảng CSDL sử dụng:** `IssuedVoucher`, `OrderItem`, `Voucher`, `Partner`, `VoucherBranch`, `Branch`
* **Thuộc tính sử dụng:** `status` ('Unused' | 'Used' | 'Expired'), `voucherCode`, `validFrom`, `validTo`
* **Cách hoạt động:** Trả về danh sách voucher đã phát hành của user, phân loại theo trạng thái Chưa dùng / Đã dùng / Hết hạn.

#### 2. `GET /api/customer/issued-vouchers/:id` (Xem mã 16 số & Mã QR)
* **Bảng CSDL sử dụng:** `IssuedVoucher`, `VoucherBranch`, `Branch`
* **Thuộc tính sử dụng:** `issuedVoucherId`, `voucherCode` (16 chữ số/ký tự)
* **Cách hoạt động:** Trả về mã voucher 16 số cùng danh sách địa chỉ chi nhánh áp dụng để khách hàng mang tới cửa hàng đưa cho thu ngân quét.

#### 3. `POST /api/customer/issued-vouchers/:id/gift` (Tặng voucher cho người khác)
* **Bảng CSDL sử dụng:** `IssuedVoucher`, `User`, `Notification`
* **Thuộc tính sử dụng:** `receiverEmail` / `receiverPhone`, `giftMessage`, `customerId`
* **Cách hoạt động (Transaction):**
  1. Kiểm tra `IssuedVoucher` thuộc về user hiện tại và `status === 'Unused'`.
  2. Tìm người nhận qua email hoặc số điện thoại.
  3. Cập nhật đổi quyền sở hữu `IssuedVoucher.customerId = receiverUser.userId`.
  4. Gửi thông báo real-time `VOUCHER_GIFT_RECEIVED` cho người nhận.

---

### 🔔 F. MODULE THÔNG BÁO & LỊCH SỬ (`/api/customer/notifications`)

#### 1. `GET /api/customer/notifications` & `unread-count`
* **Bảng CSDL sử dụng:** `Notification`
* **Thuộc tính sử dụng:** `notificationId`, `type`, `title`, `message`, `status` ('Unread' | 'Read'), `createdAt`
* **Cách hoạt động:** Trả về danh sách thông báo cá nhân và đếm số lượng thông báo chưa đọc (`unreadCount`) để hiển thị chấm đỏ trên biểu tượng Chuông Notification.

#### 2. `PATCH /api/customer/notifications/:id/read` & `read-all`
* **Bảng CSDL sử dụng:** `Notification`
* **Thuộc tính sử dụng:** `status` ('Read')
* **Cách hoạt động:** Cập nhật trạng thái thông báo thành đã đọc và tính toán lại `unreadCount`.

---

### ✍️ G. MODULE REVIEW & PROFILE (`/api/customer/reviews` & `/api/customer/profile`)

#### 1. `POST /api/customer/reviews` (Đánh giá Voucher)
* **Bảng CSDL sử dụng:** `Review`, `Order`, `OrderItem`, `Voucher`
* **Thuộc tính sử dụng:** `rating` (1-5), `comment`, `voucherId`, `customerId`
* **Cách hoạt động:** Kiểm tra user đã mua voucher này và đơn hàng ở trạng thái `paymentStatus === 'Paid'`. Nếu hợp lệ $\rightarrow$ tạo `Review`.

#### 2. `GET` & `PUT /api/customer/profile` (Xem & Sửa Hồ sơ)
* **Bảng CSDL sử dụng:** `User`
* **Thuộc tính sử dụng:** `fullName`, `phoneNumber`, `email`, `createdAt`
* **Cách hoạt động:** Truy vấn hoặc cập nhật thông tin cá nhân của người dùng.

---
---

# 📘 PHẦN 2: CHI TIẾT PRISMA SCHEMA & CHECKLIST TOÀN BỘ API HỆ THỐNG EVEREST

# 📑 GIẢI THÍCH CHI TIẾT BẢNG & THUỘC TÍNH NGHĨA TRONG PRISMA SCHEMA (`schema.prisma`)

---

## 👤 1. Bảng `User` (`users`) — Quản Lý Tài Khoản Người Dùng
* **Mục đích:** Lưu trữ tất cả tài khoản trong hệ thống thuộc các vai trò khác nhau (Admin, Khách hàng, Chủ đối tác, Thu ngân).

| Tên thuộc tính (Field) | Kiểu dữ liệu | Ý nghĩa & Mục đích sử dụng |
| :--- | :--- | :--- |
| `userId` | `UUID` (Primary Key) | Mã định danh duy nhất của tài khoản (dạng UUID v4). |
| `email` | `String` (Unique) | Địa chỉ Email đăng nhập (duy nhất toàn sàn). |
| `phoneNumber` | `String?` (Unique) | Số điện thoại người dùng (dùng cho SMS OTP & liên hệ). |
| `passwordHash` | `String?` | Chuỗi mật khẩu đã được mã hóa bằng thuật toán `bcrypt` (12 rounds). |
| `fullName` | `String?` | Họ và tên đầy đủ của người dùng. |
| `avatar` | `String?` | Đường dẫn ảnh đại diện của tài khoản. |
| `role` | `UserRole` (Enum) | Phân quyền tài khoản: `Admin`, `Customer`, `Partner_Owner`, `Partner_Cashier`. |
| `status` | `AccountStatus` (Enum)| Trạng thái tài khoản: `Active` (Hoạt động), `Banned` (Bị khóa). |
| `partnerId` | `Int?` (Foreign Key)| Liên kết tới doanh nghiệp Partner (chỉ có với `Partner_Owner` & `Partner_Cashier`). |
| `emailVerified` | `Boolean` | Trạng thái đã xác thực Email qua OTP hay chưa (`true`/`false`). |
| `emailVerifiedAt`| `DateTime?` | Thời điểm xác thực Email thành công. |
| `createdAt` / `updatedAt` | `DateTime` | Thời gian tạo tài khoản và thời gian cập nhật thông tin mới nhất. |

---

## 🏢 2. Bảng `Partner` (`partners`) — Quản Lý Đối Tác Phát Hành Voucher
* **Mục đích:** Lưu trữ thông tin doanh nghiệp/thương hiệu đối tác kinh doanh trên sàn Everest.

| Tên thuộc tính | Kiểu dữ liệu | Ý nghĩa & Mục đích sử dụng |
| :--- | :--- | :--- |
| `partnerId` | `Int` (Auto Increment) | Mã định danh ID của doanh nghiệp đối tác. |
| `companyName` | `String` | Tên công ty / Tên thương hiệu đối tác (VD: "JustMen", "Highlands"). |
| `taxCode` | `String` (Unique) | Mã số thuế doanh nghiệp (Duy nhất). |
| `representativeName` / `Position` | `String?` | Họ tên người đại diện pháp luật & Chức vụ đại diện. |
| `representativePhone` / `Email` | `String?` | Số điện thoại & Email của người đại diện. |
| `businessLicenseUrl` | `String?` | Link lưu file/ảnh Giấy phép đăng ký kinh doanh. |
| `status` | `PartnerStatus` (Enum)| Trạng thái duyệt đối tác: `Pending` (Chờ duyệt), `Approved` (Đã duyệt), `Rejected` (Từ chối). |
| `isLocked` | `Boolean` | Cờ báo Admin có đang tạm khóa hoạt động của đối tác hay không. |

---

## 🏪 3. Bảng `Branch` (`branches`) — Quản Lý Chi Nhánh Cửa Hàng
* **Mục đích:** Lưu các cửa hàng thực tế của đối tác, nơi khách hàng đến đổi voucher.

| Tên thuộc tính | Kiểu dữ liệu | Ý nghĩa & Mục đích sử dụng |
| :--- | :--- | :--- |
| `branchId` | `Int` (Primary Key) | Mã định danh ID của chi nhánh. |
| `partnerId` | `Int` (Foreign Key) | Thuộc về đối tác nào. |
| `cashierId` | `UUID?` (Unique) | ID của tài khoản thu ngân (`Partner_Cashier`) được phân công làm việc tại chi nhánh này. |
| `branchName` | `String` | Tên chi nhánh (VD: "JustMen Quận 10"). |
| `address` / `city` | `String` | Địa chỉ chi tiết & Tỉnh/Thành phố của chi nhánh. |
| `phoneNumber` | `String` | Số điện thoại hotline của chi nhánh. |
| `isLocked` | `Boolean` | Cờ khóa chi nhánh. |

---

## 🏷️ 4. Bảng `Category` (`categories`) — Danh Mục Voucher
* **Mục đích:** Phân loại voucher theo từng chủ đề ngành hàng (Ăn uống, Giải trí, Thời trang,...).

| Tên thuộc tính | Kiểu dữ liệu | Ý nghĩa & Mục đích sử dụng |
| :--- | :--- | :--- |
| `categoryId` | `Int` (Primary Key) | Mã danh mục. |
| `categoryName` | `String` | Tên danh mục (VD: "Thời trang & Phụ kiện"). |
| `description` | `String?` | Mô tả ngắn về danh mục. |

---

## 🎟️ 5. Bảng `Voucher` (`vouchers`) — Thông Tin Sản Phẩm Voucher
* **Mục đích:** Lưu thông tin gốc của Voucher do Partner tạo ra.

| Tên thuộc tính | Kiểu dữ liệu | Ý nghĩa & Mục đích sử dụng |
| :--- | :--- | :--- |
| `voucherId` | `Int` (Primary Key) | Mã định danh ID của voucher. |
| `partnerId` / `categoryId` | `Int` (Foreign Keys)| Mã đối tác phát hành & Mã danh mục sản phẩm. |
| `title` | `String` | Tiêu đề voucher (VD: "Voucher 500k JustMen"). |
| `description` / `applicationCondition` | `String?` | Mô tả chi tiết & Điều kiện áp dụng voucher. |
| `originalPrice` | `Decimal(12,2)` | Giá niêm yết ban đầu. |
| `salePrice` | `Decimal(12,2)` | Giá bán ưu đãi thực tế trên sàn Everest. |
| `totalQuantity` | `Int` | Tổng số lượng voucher phát hành ban đầu. |
| `availableQuantity` | `Int` | **Số lượng tồn kho khả dụng hiện tại** (sẽ bị giảm khi tạo đơn/thanh toán). |
| `imageUrl` | `String?` | Đường dẫn ảnh mô tả voucher. |
| `startDate` / `endDate` | `DateTime` | Ngày bắt đầu bán & Ngày kết thúc mở bán trên sàn. |
| `expiryDays` | `Int` | Số ngày có hiệu lực của voucher kể từ ngày khách mua thành công. |
| `approvalStatus` | `VoucherApprovalStatus`| Trạng thái duyệt của Admin: `Draft`, `Pending`, `Approved`, `Rejected`. |
| `displayStatus` | `VoucherDisplayStatus` | Trạng thái hiển thị do Partner bật/tắt: `Visible`, `Hidden`. |
| `isLocked` | `Boolean` | Khóa voucher bởi Admin. |

---

## 🔗 6. Bảng `VoucherBranch` (`voucher_branches`) — Chi Nhánh Áp Dụng
* **Mục đích:** Bảng trung gian n-n nối Voucher với danh sách Chi nhánh được phép đổi mã.

| Tên thuộc tính | Kiểu dữ liệu | Ý nghĩa & Mục đích sử dụng |
| :--- | :--- | :--- |
| `voucherId` | `Int` (Composite PK) | Mã voucher. |
| `branchId` | `Int` (Composite PK) | Mã chi nhánh áp dụng. |

---

## 🛒 7. Bảng `CartItem` (`cart_items`) — Giỏ Hàng Khách Hàng
* **Mục đích:** Lưu trữ các sản phẩm tạm thời trong giỏ hàng trước khi thanh toán.

| Tên thuộc tính | Kiểu dữ liệu | Ý nghĩa & Mục đích sử dụng |
| :--- | :--- | :--- |
| `cartItemId` | `Int` (Primary Key) | Mã item trong giỏ. |
| `customerId` | `UUID` (Foreign Key) | Khách hàng sở hữu giỏ hàng. |
| `voucherId` | `Int` (Foreign Key) | Voucher trong giỏ. |
| `quantity` | `Int` | Số lượng chọn mua. |
| `addedAt` | `DateTime` | Thời gian thêm vào giỏ. |

---

## 💳 8. Bảng `Order` (`orders`) — Đơn Hàng Mua Voucher
* **Mục đích:** Lưu hóa đơn mua sắm của khách hàng.

| Tên thuộc tính | Kiểu dữ liệu | Ý nghĩa & Mục đích sử dụng |
| :--- | :--- | :--- |
| `orderId` | `Int` (Primary Key) | Mã đơn hàng (VD: `#1024`). |
| `customerId` | `UUID` (Foreign Key) | ID khách hàng đặt mua. |
| `totalAmount` | `Decimal(12,2)` | Tổng tiền thanh toán đơn hàng. |
| `paymentMethod` | `String?` | Phương thức thanh toán (VD: "VNPAY", "CREDIT_CARD"). |
| `paymentStatus` | `PaymentStatus` | Trạng thái đơn: `Pending` (Chờ TT), `Paid` (Đã TT - Giữ nguyên kể cả khi Hủy để Refund). |
| `isGift` | `Boolean` | Đơn hàng mua để mua tặng người khác hay mua cho bản thân. |
| `receiverEmail` / `giftMessage` | `String?` | Email người nhận & Lời nhắn tặng quà. |
| `expiresAt` | `DateTime?` | Thời hạn hết hiệu lực giữ chỗ đơn hàng `Pending` (15 phút). |
| `cancelledAt` / `cancelledBy` / `cancelReason` | `DateTime?` / `UUID?` / `String?` | **Cặp trường cốt lõi**: `cancelledBy !== null` giúp nhận diện Đơn hàng bị Admin Hủy mà không cần sửa `paymentStatus`. |
| `refundedAt` / `refundAmount` / `refundReason` | `DateTime?` / `Decimal?` / `String?` | Vết thông tin hoàn tiền đơn hàng. |

---

## 📦 9. Bảng `OrderItem` (`order_items`) — Chi Tiết Đơn Hàng
* **Mục đích:** Lưu các dòng voucher thuộc đơn hàng.

| Tên thuộc tính | Kiểu dữ liệu | Ý nghĩa & Mục đích sử dụng |
| :--- | :--- | :--- |
| `orderItemId` | `Int` (Primary Key) | Mã dòng đơn hàng. |
| `orderId` / `voucherId` | `Int` (Foreign Keys)| Thuộc đơn hàng nào & Mã voucher nào. |
| `quantity` / `price` | `Int` / `Decimal` | Số lượng mua & Đơn giá tại thời điểm mua. |

---

## 🎫 10. Bảng `IssuedVoucher` (`issued_vouchers`) — Kho Mã Voucher Đã Cấp
* **Mục đích:** Lưu các **mã 16 chữ số thực tế** được cấp cho khách hàng sau khi thanh toán thành công.

| Tên thuộc tính | Kiểu dữ liệu | Ý nghĩa & Mục đích sử dụng |
| :--- | :--- | :--- |
| `issuedVoucherId` | `Int` (Primary Key) | Mã bản ghi voucher cấp. |
| `orderItemId` | `Int` (Foreign Key) | Thuộc dòng đơn hàng nào. |
| `voucherCode` | `String` (Unique) | **Mã 16 số/ký tự ngẫu nhiên duy nhất** để thu ngân quét/đổi quà. |
| `status` | `VoucherUsageStatus` | Trạng thái mã: `Unused` (Chưa dùng), `Used` (Đã dùng), `Expired` (Hết hạn), `Locked` (Khóa khi Admin Hủy đơn). |
| `validFrom` / `validTo` | `DateTime` | Ngày bắt đầu & Ngày hết hạn sử dụng của mã này. |
| `usedAt` / `usedAtBranchId` | `DateTime?` / `Int?` | Thời điểm & ID chi nhánh nơi thu ngân đã xác nhận đổi voucher. |

---

## ⭐ 11. Bảng `Review` (`reviews`) — Đánh Giá Voucher
* **Mục đích:** Lưu đánh giá từ khách hàng đã mua voucher.

| Tên thuộc tính | Kiểu dữ liệu | Ý nghĩa & Mục đích sử dụng |
| :--- | :--- | :--- |
| `reviewId` | `Int` (Primary Key) | Mã review. |
| `customerId` / `voucherId` | `UUID` / `Int` | Khách hàng đánh giá & Voucher được đánh giá. |
| `rating` | `Int` | Số sao đánh giá (từ 1 đến 5 sao). |
| `comment` | `String?` | Nội dung bình luận / nhận xét. |

---

## 🖥️ 12. Các Bảng Nội Dung & Truyền Thông (`Banner`, `Popup`, `Post`, `Policy`)
* **`Banner`**: Banners slide đầu trang chủ (`bannerId`, `title`, `imageUrl`, `status`).
* **`Popup`**: Quảng cáo nổi bật bật lên khi vào trang chủ (`popupId`, `title`, `body`, `imageUrl`, `ctaLabel`, `ctaTargetUrl`, `status`).
* **`Post`**: Bài viết tin tức / cẩm nang ưu đãi (`postId`, `authorId`, `title`, `content`, `status`).
* **`Policy`**: Điều khoản chính sách hệ thống (`policyId`, `title`, `content`).

---

## 💬 13. Bảng `Feedback` (`feedbacks`) — Ý Kiến & Khiếu Nại
* **Mục đích:** Lưu thông tin phản hồi/khiếu nại từ khách hàng gửi về ban quản trị.
* **Thuộc tính:** `ticketId` (Mã hỗ trợ), `type` (Loại phản hồi), `subject`, `message`, `email`, `phone`, `status` (`Open` / `Resolved`).

---

## 🔒 14. Bảng Bảo Mật & Xác Thực (`PasswordReset`, `EmailOtp`, `UserSession`, `NotificationPreference`, `Notification`, `AdminAuditLog`)
* **`PasswordReset`**: Token reset mật khẩu gửi qua email (`token`, `expiresAt`, `usedAt`).
* **`EmailOtp`**: Mã OTP 6 số xác thực đăng ký/quên mật khẩu (`codeHash`, `purpose`, `expiresAt`, `consumedAt`).
* **`UserSession`**: Phiên đăng nhập thiết bị quản lý Đăng xuất từ xa (`sessionId`, `deviceType`, `ipAddress`, `expiresAt`, `revokedAt`).
* **`NotificationPreference`**: Cấu hình bật/tắt nhận tin nhắn cá nhân (`userId`, `prefs` JSON).
* **`Notification`**: Hộp thư thông báo thực tế hiển thị trên icon Quả chuông (`title`, `message`, `type`, `status` Unread/Read).
* **`AdminAuditLog`**: Nhật ký ghi vết mọi biến động hệ thống do Admin/Partner/User thực hiện (`action`, `actorId`, `targetType`, `description`, `metadata`).

---

# 📋 CHECKLIST TOÀN BỘ API THEO MODULE TRONG HỆ THỐNG

---

## 1. 🔑 MODULE AUTHENTICATION (`/api/auth`)
- [x] `POST /api/auth/register` — Đăng ký tài khoản Khách hàng
- [x] `POST /api/auth/register/partner` — Đăng ký tài khoản Đối tác kinh doanh
- [x] `POST /api/auth/login` — Đăng nhập hệ thống (Cấp AccessToken + RefreshToken + Session)
- [x] `POST /api/auth/refresh` — Cấp lại AccessToken bằng RefreshToken (Token Rotation)
- [x] `GET /api/auth/me` — Lấy thông tin người dùng đang đăng nhập
- [x] `PUT /api/auth/me` — Cập nhật Profile cá nhân
- [x] `PUT /api/auth/password` — Đổi mật khẩu tài khoản
- [x] `POST /api/auth/forgot-password` — Yêu cầu gửi link đặt lại mật khẩu qua Email
- [x] `PUT /api/auth/reset-password` — Xử lý đổi mật khẩu từ link Token
- [x] `POST /api/auth/reset-password-otp` — Đặt lại mật khẩu bằng mã OTP 6 số
- [x] `POST /api/auth/email-otp/send` — Gửi mã OTP xác thực
- [x] `POST /api/auth/email-otp/verify` — Xác thực mã OTP 6 số
- [x] `GET /api/auth/sessions` — Lấy danh sách các phiên thiết bị đang đăng nhập
- [x] `POST /api/auth/sessions/:sessionId/revoke` — Đăng xuất 1 thiết bị từ xa
- [x] `POST /api/auth/sessions/revoke-all` — Đăng xuất tất cả thiết bị khác

---

## 2. 🛍️ MODULE CUSTOMER (`/api/customer`, `/api/vouchers`, `/api/categories`, `/api/popups`)
- [x] `GET /api/vouchers` — Danh sách Voucher (Lọc đa tiêu chí + Sắp xếp + Phân trang)
- [x] `GET /api/vouchers/featured` — Top 8 Voucher nổi bật hiển thị trang chủ
- [x] `GET /api/vouchers/:id` — Chi tiết 1 Voucher kèm danh sách chi nhánh áp dụng
- [x] `GET /api/categories` — Danh sách danh mục A-Z + Đếm số voucher
- [x] `GET /api/categories/:id` — Chi tiết 1 danh mục
- [x] `GET /api/customer/cart` — Xem thông tin giỏ hàng & tính tổng tiền
- [x] `POST /api/customer/cart/items` — Thêm voucher vào giỏ hàng (Check tồn kho)
- [x] `PUT /api/customer/cart/items/:id` — Cập nhật số lượng mua trong giỏ
- [x] `DELETE /api/customer/cart/items/:id` — Xóa sản phẩm khỏi giỏ hàng
- [x] `DELETE /api/customer/cart/clear` — Xóa sạch toàn bộ giỏ hàng
- [x] `POST /api/customer/orders` — Tạo đơn hàng mua voucher (Trạng thái Pending)
- [x] `GET /api/customer/orders` — Danh sách đơn hàng đã mua của khách
- [x] `GET /api/customer/orders/:id` — Chi tiết hóa đơn mua sắm
- [x] `POST /api/customer/payment/vnpay/create-url` — Tạo URL thanh toán Sandbox VNPAY (Mã hóa HMAC-SHA512)
- [x] `GET /api/customer/payment/ipn` — Callback IPN ngầm từ VNPAY (Xác thực Checksum, Cấp mã 16 số, Trừ kho)
- [x] `GET /api/customer/issued-vouchers` — Kho voucher cá nhân (Chưa dùng, Đã dùng, Hết hạn)
- [x] `GET /api/customer/issued-vouchers/:id` — Lấy mã 16 chữ số và mã QR code để đổi tại cửa hàng
- [x] `POST /api/customer/issued-vouchers/:id/gift` — Tặng voucher cho người khác qua Email/SĐT
- [x] `GET /api/customer/notifications` — Hộp thư thông báo cá nhân + Đếm số tin chưa đọc (`unreadCount`)
- [x] `PATCH /api/customer/notifications/:id/read` — Đánh dấu 1 thông báo là đã đọc
- [x] `POST /api/customer/notifications/read-all` — Đánh dấu tất cả thông báo là đã đọc
- [x] `GET/PUT /api/customer/notifications/settings` — Cài đặt bật/tắt nhận thông báo
- [x] `POST /api/customer/reviews` — Đánh giá voucher (Chỉ cho phép khách đã thanh toán đơn `Paid`)
- [x] `GET /api/popups/active` — Lấy 1 Popup hiển thị ngẫu nhiên trên trang chủ
- [x] `GET /api/banners` — Lấy danh sách Banner quảng cáo

---

## 3. 🏢 MODULE PARTNER (`/api/partner`)
- [x] `GET /api/partner/vouchers` — Danh sách Voucher do thương hiệu của mình đăng bán
- [x] `POST /api/partner/vouchers` — Đăng ký tạo Voucher mới (Gửi Admin chờ duyệt)
- [x] `PUT /api/partner/vouchers/:id` — Chỉnh sửa thông tin Voucher
- [x] `DELETE /api/partner/vouchers/:id` — Xóa Voucher
- [x] `POST /api/partner/redemption/verify` — Thu ngân nhập mã 16 số kiểm tra tính hợp lệ
- [x] `POST /api/partner/redemption/redeem` — Thu ngân bấm xác nhận gạch mã đổi quà (`status -> Used`)
- [x] `GET /api/partner/branches` — Danh sách chi nhánh cửa hàng
- [x] `POST /api/partner/branches` — Tạo chi nhánh mới
- [x] `GET /api/partner/reports` — Báo cáo thống kê doanh thu & lượt đổi voucher theo chi nhánh

---

## 👑 4. MODULE ADMIN (`/api/admin`)
- [x] `GET /api/admin/users` — Quản lý danh sách người dùng toàn sàn
- [x] `PUT /api/admin/users/:id/status` — Khóa / Mở khóa tài khoản
- [x] `GET /api/admin/partners` — Danh sách đối tác chờ duyệt / đã duyệt
- [x] `PUT /api/admin/partners/:id/approve` — Duyệt đối tác kinh doanh mới
- [x] `PUT /api/admin/partners/:id/reject` — Từ chối hồ sơ đối tác
- [x] `GET /api/admin/vouchers` — Quản lý kiểm duyệt voucher toàn sàn
- [x] `PUT /api/admin/vouchers/:id/approve` — Phê duyệt voucher đưa lên sàn
- [x] `PUT /api/admin/vouchers/:id/reject` — Từ chối voucher kèm lý do
- [x] `POST /api/admin/orders/:id/cancel` — Hủy đơn hàng (Điền `cancelledBy`, Thu hồi mã `Locked` + Cộng trả kho `availableQuantity`)
- [x] `POST /api/admin/orders/:id/refund` — Xử lý hoàn tiền cho đơn hàng
- [x] `GET /api/admin/audit-logs` — Truy vấn nhật ký biến động hệ thống (Admin Audit Log)

---
---

# 💳 PHẦN 3: HƯỚNG DẪN CHI TIẾT MODULE THANH TOÁN VNPAY (PAYMENT MODULE)

# 📌 TỔNG QUAN VỊ TRÍ CODE & KIẾN TRÚC MODULE

Module Payment đảm nhận toàn bộ luồng tích hợp với cổng thanh toán VNPAY, bao gồm việc tạo URL thanh toán, kiểm tra chữ ký số bảo mật, xử lý giao dịch thành công dưới CSDL, sinh mã Voucher 16 chữ số và phát thông báo.

### 📁 Các file code liên quan:
1. **File Cấu hình VNPAY:**  
   📄 [`backend/src/config/vnpay.ts`](file:///e:/Documents/HCMUS/Semester3_Year3/TM%C4%90T/Everest/backend/src/config/vnpay.ts)
2. **File Biến môi trường:**  
   📄 [`backend/.env`](file:///e:/Documents/HCMUS/Semester3_Year3/TM%C4%90T/Everest/backend/.env) (Dòng 21 - 31)
3. **File Core Service Logic:**  
   📄 [`backend/src/modules/customer/payment/payment.service.ts`](file:///e:/Documents/HCMUS/Semester3_Year3/TM%C4%90T/Everest/backend/src/modules/customer/payment/payment.service.ts)
4. **File Controller:**  
   📄 [`backend/src/modules/customer/payment/payment.controller.ts`](file:///e:/Documents/HCMUS/Semester3_Year3/TM%C4%90T/Everest/backend/src/modules/customer/payment/payment.controller.ts)
5. **File Route:**  
   📄 [`backend/src/modules/customer/payment/payment.routes.ts`](file:///e:/Documents/HCMUS/Semester3_Year3/TM%C4%90T/Everest/backend/src/modules/customer/payment/payment.routes.ts)

---

# 🔄 SƠ ĐỒ BẢN ĐỒ LUỒNG THANH TOÁN VNPAY (3 BƯỚC CỐT LÕI)

```
[ BƯỚC 1: TẠO URL THANH TOÁN ]
  Customer bấm "Thanh toán VNPAY" trên trang Checkout
         │
         ▼
  POST /api/customer/payment/vnpay/create-url (VNPAY SDK băm HMAC-SHA512 tạo paymentUrl)
         │
         ▼
[ BƯỚC 2: KHÁCH HÀNG THAO TÁC TRÊN VNPAY SANDBOX ]
  Frontend chuyển hướng (Redirect) trình duyệt Khách hàng sang cổng VNPAY Sandbox
  Khách hàng nhập thẻ ATM/QR Test (Số thẻ Sandbox: 9704198526191432198)
         │
         ├────────────────────────────────────────┐
         ▼                                        ▼
[ BƯỚC 3A: VNPAY CALL BACKEND (IPN) ]      [ BƯỚC 3B: USER CHUYỂN HƯỚNG VỀ (RETURN) ]
  GET /api/customer/payment/ipn             GET /api/customer/payment/return
  (VNPAY gọi Webhook Server-to-Server)       (Trình duyệt khách quay về Frontend)
         │                                        │
         └───────────────────┬────────────────────┘
                             │
                             ▼
              [ XỬ LÝ GIAO DỊCH THÀNH CÔNG ]
       (Kiểm tra chữ ký Checksum -> Update Order Paid 
        -> Trừ Kho -> Sinh mã 16 số IssuedVoucher 
        -> Gửi Email & Notification)
```

---

# ⚙️ CẤU HÌNH VNPAY SANDBOX (`config/vnpay.ts`)

Mọi tham số kết nối VNPAY được gom chung trong object `vnpayConfig` và nạp từ file `.env` giúp dễ dàng chuyển từ môi trường thử nghiệm Sandbox sang Chạy thật Production:

```typescript
export const vnpayConfig = {
  tmnCode: process.env.VNP_TMN_CODE || "",
  hashSecret: process.env.VNP_HASH_SECRET || "",
  vnpayHost: process.env.VNP_URL || "https://sandbox.vnpayment.vn",
  returnUrl: process.env.VNP_RETURN_URL || "http://localhost:5174/payment/return",
  ipnUrl: process.env.VNP_IPN_URL || "http://localhost:3000/api/customer/payment/ipn",
  testMode: process.env.VNP_URL?.includes("sandbox") ?? true,
  hashAlgorithm: HashAlgorithm.SHA512,
  expireMinutes: 15,
};
```

### 📌 Ý nghĩa 6 tham số cấu hình bắt buộc:
1. **`VNP_TMN_CODE`:** Mã định danh do VNPAY Sandbox cấp cho doanh nghiệp (VD: `"XNG6S40M"`).
2. **`VNP_HASH_SECRET`:** Chuỗi **Khóa bí mật (Secret Key)** dùng để ký số và xác thực chữ ký **HMAC-SHA512**, chống hack/sửa đổi số tiền trên đường truyền.
3. **`VNP_URL`:** URL host VNPAY Sandbox (`https://sandbox.vnpayment.vn`).
4. **`VNP_RETURN_URL`:** URL Frontend (`http://localhost:5174/payment/return`) - nơi khách được chuyển về sau khi bấm thanh toán.
5. **`VNP_IPN_URL`:** URL Webhook Backend (`http://localhost:3000/api/customer/payment/ipn`) - nơi VNPAY gọi ngầm Server-to-Server xác nhận giao dịch.
6. **`HashAlgorithm.SHA512`:** Thuật toán mã hóa an toàn tiêu chuẩn băm chuỗi checksum.

---

# 💻 CHI TIẾT TỪNG BƯỚC XỬ LÝ TRONG CODE (`payment.service.ts`)

---

## 🔹 BƯỚC 1: Tạo URL Thanh Toán (`createPaymentUrl`) — Dòng 238 - 276
* **Hàm thực thi:** `paymentService.createPaymentUrl(customerId, orderId, req)`
* **Quy trình xử lý:**
  1. Kiểm tra Đơn hàng `Order` dưới CSDL có tồn tại không.
  2. Kiểm tra `paymentStatus`: Nếu đã là `Paid` hoặc `Cancelled` $\rightarrow$ Ném lỗi từ chối ngay.
  3. Lấy số tiền `amountVnd = Math.round(Number(order.totalAmount))`. *(SDK VNPAY tự động nhân 100 theo quy ước của VNPAY)*.
  4. Đặt thời gian hết hạn cho liên kết thanh toán `vnp_ExpireDate = now + 15 phút`.
  5. Gọi hàm SDK: `vnpay.buildPaymentUrl({...})`:
     - SDK sắp xếp toàn bộ tham số theo bảng chữ cái A-Z.
     - Băm mã hóa chuỗi bằng secret key `VNP_HASH_SECRET` qua thuật toán **HMAC-SHA512** tạo tham số `vnp_SecureHash`.
  6. Trả về `paymentUrl` cho Frontend để chuyển hướng khách sang cổng VNPAY.

---

## 🔹 BƯỚC 2: Xử Lý Callback VNPAY IPN & Return URL — Dòng 282 - 390
* **Hàm thực thi:** `paymentService.handleIpn(query)` & `paymentService.handleReturn(query)`
* **Quy trình xử lý bảo mật (Security Check):**
  1. **Tái tạo & Kiểm tra chữ ký (`vnpay.verifyReturnUrl(query)`):**
     - Backend lấy toàn bộ tham số VNPAY trả về (trừ `vnp_SecureHash`), sắp xếp alphabet và băm lại bằng secret key.
     - Nếu chữ ký băm lại không trùng với `vnp_SecureHash` $\rightarrow$ Ném lỗi `Sai chữ ký` (Code `97`). Chống tấn công giả mạo dữ liệu!
  2. **Kiểm tra mã phản hồi (`vnp_ResponseCode`):**
     - Nếu `vnp_ResponseCode !== "00"` $\rightarrow$ Giao dịch bị hủy/thất bại trên cổng VNPAY.
  3. **Đối soát số tiền & Trạng thái đơn:**
     - Kiểm tra đơn hàng có tồn tại và đã xử lý trước đó chưa. Nếu `paymentStatus === "Paid"` $\rightarrow$ Bỏ qua (Tránh xử lý lặp lại - Idempotency).

---

## 🔹 BƯỚC 3: Xử Lý Giao Dịch Thành Công & Cấp Mã Voucher (`processSuccessfulPayment`) — Dòng 50 - 229

Khi xác thực chữ ký và giao dịch thành công, hàm `processSuccessfulPayment` thực hiện chuỗi giao dịch nguyên tử dưới CSDL:

```typescript
await prisma.$transaction(async (tx) => {
  // 1. Cập nhật Đơn hàng
  await tx.order.update({
    where: { orderId },
    data: { paymentStatus: "Paid", paymentMethod },
  });

  // 2. Trừ tồn kho & Sinh mã 16 số cho từng voucher
  for (const item of order.orderItems) {
    const updateStock = await tx.voucher.updateMany({
      where: {
        voucherId: item.voucher.voucherId,
        availableQuantity: { gte: item.quantity },
      },
      data: { availableQuantity: { decrement: item.quantity } },
    });

    if (updateStock.count === 0) {
      throw new AppError("Voucher không đủ tồn kho tại thời điểm thanh toán", 409, "INSUFFICIENT_STOCK");
    }

    // 3. Sinh mã Voucher 16 ký tự ngẫu nhiên duy nhất
    for (let i = 0; i < item.quantity; i++) {
      const code = await generateUniqueVoucherCode(tx);
      await tx.issuedVoucher.create({
        data: {
          orderItemId: item.orderItemId,
          voucherCode: code, // Mã 16 số (VD: 8A2F-9B4K-1C3D-7E5F)
          status: "Unused",
          validFrom: new Date(),
          validTo,
        },
      });
    }
  }
});
```

* **Sau khi Transaction thành công:**
  1. Tạo **Thông báo Hộp thư/Chuông (`Notification`)**:
     - Gửi thông báo `ORDER_PAID` cho người mua.
     - Nếu là đơn hàng mua tặng (`isGift == true`), tự động tìm người nhận và gửi thông báo `VOUCHER_GIFT_RECEIVED`.
  2. Gửi **Email xác nhận hóa đơn**: Gọi `emailService.sendOrderConfirmation()` gửi HTML Email chi tiết đơn hàng & danh sách mã voucher 16 số về Gmail của khách hàng.

---

# 🎯 CÁC CÂU HỎI VẤN ĐÁP KINH ĐIỂN VỀ THANH TOÁN VNPAY

### ❓ Câu 1: Em hãy giải thích cơ chế chữ ký số (Checksum/Secure Hash) của VNPAY hoạt động thế nào để chống hack giá?
> **💡 Trả lời điểm 10:**  
> "Báo cáo thầy/cô, VNPAY sử dụng thuật toán **HMAC-SHA512** kết hợp với **Secret Key (`VNP_HASH_SECRET`)** được lưu bảo mật ở file `.env` của Backend.  
> Khi tạo URL thanh toán, Backend gom tất cả tham số (Số tiền, Mã đơn, IP,...), sắp xếp alphabet và băm ra chuỗi `vnp_SecureHash`. Khi VNPAY trả kết quả về, Backend băm lại chuỗi tham số đó bằng Secret Key để đối soát. Nếu Hacker cố tình sửa giá tiền trên URL, chữ ký băm ra sẽ không khớp và Backend sẽ lập tức từ chối giao dịch."

### ❓ Câu 2: Sự khác nhau giữa VNPAY Return URL và VNPAY IPN Webhook là gì?
> **💡 Trả lời điểm 10:**  
> "Dạ, 
> - **Return URL:** Là đường dẫn chuyển hướng trình duyệt của Khách hàng về lại trang web sau khi thanh toán. Chỉ dùng để hiển thị giao diện thông báo cho người dùng.
> - **IPN Webhook:** Là nguồn xác thực chính thức Server-to-Server. Máy chủ VNPAY sẽ gọi trực tiếp sang máy chủ Backend của em. Dữ liệu xử lý cập nhật CSDL `Paid` và cấp mã Voucher phải dựa vào IPN để đảm bảo tính an toàn kể cả khi người dùng tắt trình duyệt."

### ❓ Câu 3: Làm thế nào để đảm bảo không cấp trùng mã Voucher hay bán quá số lượng kho khi 2 người cùng thanh toán 1 lúc?
> **💡 Trả lời điểm 10:**  
> "Dạ, em bọc toàn bộ quá trình cập nhật trạng thái `Paid`, trừ kho khả dụng (`availableQuantity: { decrement: item.quantity }`) và sinh mã trong một **Database Transaction (`prisma.$transaction`)**.  
> Phép trừ kho có điều kiện `availableQuantity >= item.quantity`. Nếu tồn kho không đủ tại thời điểm thanh toán, Transaction sẽ phát sinh lỗi `INSUFFICIENT_STOCK` và tự động Rollback toàn bộ dữ liệu."

---
---

# 📧 PHẦN 4: HƯỚNG DẪN CHI TIẾT MODULE GỬI & XÁC THỰC EMAIL OTP (EMAIL OTP MODULE)

# 📌 TỔNG QUAN VỊ TRÍ CODE & NGHỆ THUẬT BẢO MẬT OTP

Module Email OTP đảm nhận việc sinh mã xác thực 6 số ngẫu nhiên gửi về Email/SMS của người dùng cho các mục đích: Xác thực đăng ký (`REGISTER_VERIFY`), Đặt lại mật khẩu (`RESET_PASSWORD`), và Xác thực 2 yếu tố (`TWO_FA_LOGIN`).

### 📁 Các file code liên quan:
1. **File Route OTP:**  
   📄 [`backend/src/modules/auth/email-otp.routes.ts`](file:///e:/Documents/HCMUS/Semester3_Year3/TM%C4%90T/Everest/backend/src/modules/auth/email-otp.routes.ts)
2. **File Core Service OTP:**  
   📄 [`backend/src/modules/auth/email-otp.service.ts`](file:///e:/Documents/HCMUS/Semester3_Year3/TM%C4%90T/Everest/backend/src/modules/auth/email-otp.service.ts)
3. **File Schema Validation:**  
   📄 [`backend/src/modules/auth/email-otp.schemas.ts`](file:///e:/Documents/HCMUS/Semester3_Year3/TM%C4%90T/Everest/backend/src/modules/auth/email-otp.schemas.ts)
4. **File Dịch vụ Gửi Email (Gmail SMTP):**  
   📄 [`backend/src/modules/auth/email.service.ts`](file:///e:/Documents/HCMUS/Semester3_Year3/TM%C4%90T/Everest/backend/src/modules/auth/email.service.ts)

---

# 🔄 SƠ ĐỒ QUY TRÌNH XỬ LÝ EMAIL OTP (2 BƯỚC CỐT LÕI)

```
[ BƯỚC 1: GỬI MÃ OTP (sendOtp) ]
  Customer bấm "Đăng ký" hoặc "Gửi lại OTP"
         │
         ▼
  POST /api/auth/email-otp/send  (Body: { email, purpose, channel })
         │
         ├── B1: Check Cooldown 60 giây (Chống Spam API / Rate Limit)
         ├── B2: Xóa các mã OTP cũ chưa dùng của Email đó
         ├── B3: Sinh mã 6 số ngẫu nhiên qua crypto.randomInt(0, 1000000)
         ├── B4: Băm mã OTP bằng bcrypt.hash(code, 10) trước khi lưu CSDL
         ├── B5: Lưu bản ghi EmailOtp với expiresAt = now + 5 phút
         └── B6: Gọi emailService gửi HTML Email chứa mã 6 số qua Gmail SMTP
         │
         ▼
[ BƯỚC 2: XÁC THỰC MÃ OTP (verifyOtp) ]
  Customer nhập 6 số trên màn hình /verify-email
         │
         ▼
  POST /api/auth/email-otp/verify (Body: { email, code, purpose })
         │
         ├── B1: Tìm bản ghi EmailOtp còn hiệu lực (consumedAt == null & expiresAt > now)
         ├── B2: Kiểm tra số lần thử (attempts < 5) -> Tăng attempts + 1
         ├── B3: So sánh mã bằng bcrypt.compare(code, otpRecord.codeHash)
         ├── B4: Đánh dấu consumedAt = now (Tiêu hủy mã, chống dùng lại - Replay Attack)
         └── B5: Cập nhật User.emailVerified = true -> Tự động đăng nhập
```

---

# 💻 CHI TIẾT TỪNG BƯỚC XỬ LÝ TRONG CODE (`email-otp.service.ts`)

---

## 🔹 1. Hàm Sinh Mã OTP An Toàn Mật Mã Học (Cryptographic Random) — Dòng 20 - 23
```typescript
function generateCode(): string {
  const n = crypto.randomInt(0, 10 ** OTP_CODE_LENGTH);
  return n.toString().padStart(OTP_CODE_LENGTH, "0");
}
```
* **Điểm sáng Kỹ thuật:** Thay vì dùng `Math.random()` (dễ bị đoán quy luật), hệ thống sử dụng thư viện **`crypto.randomInt`** tích hợp của Node.js để sinh chuỗi ngẫu nhiên an toàn tuyệt đối. Hàm `padStart(6, "0")` đảm bảo luôn trả về đủ 6 chữ số kể cả khi số sinh ra có các chữ số 0 ở đầu (Ví dụ: `004219`).

---

## 🔹 2. Hàm Gửi Mã OTP (`sendOtp`) — Dòng 38 - 110
* **Quy trình xử lý 6 bước an toàn:**
  1. **Chống Spam (Rate Limit 60 giây):**
     - Đọc CSDL kiểm tra mã OTP gần nhất của email đó. Nếu thời gian gửi chưa tới 60 giây (`RESEND_COOLDOWN_SECONDS = 60`) $\rightarrow$ Ném lỗi `RATE_LIMIT` (HTTP 429).
  2. **Dọn dẹp OTP cũ (`deleteMany`):**
     - Xóa các bản ghi OTP cũ chưa được tiêu thụ (`consumedAt: null`) của email này để giữ sạch CSDL.
  3. **Mã hóa băm mã OTP (`bcrypt.hash`):**
     - Mã OTP 6 số gốc sẽ được băm bằng `bcrypt` với muối `10 rounds` trước khi lưu vào cột `codeHash`. 
     - *Lợi ích:* Kể cả khi Hacker xâm nhập được CSDL cũng không thể đọc được mã OTP gốc của khách hàng!
  4. **Thiết lập Thời gian hết hạn (`expiresAt`):**
     - Thời hạn sống của mã OTP là **5 phút** (`OTP_TTL_MINUTES = 5`).
  5. **Tạo bản ghi `EmailOtp` trong CSDL:**
     - Lưu `email`, `codeHash`, `purpose`, `expiresAt`, `ipAddress`, `userId`.
  6. **Gửi Email thực tế qua Gmail SMTP (`emailService.sendOtp`):**
     - Gọi dịch vụ `emailService` kết nối đến Gmail bằng tài khoản ứng dụng (App Password) gửi email giao diện HTML sang hòm thư người dùng.

---

## 🔹 3. Hàm Xác Thực Mã OTP (`verifyOtp`) — Dòng 115 - 180
* **Quy trình xác thực & Tiêu hủy mã 5 bước:**
  1. **Kiểm tra OTP còn tồn tại & chưa hết hạn:**
     - Truy vấn bản ghi `EmailOtp` thỏa mãn `consumedAt == null` và `expiresAt > new Date()`. Nếu không tìm thấy $\rightarrow$ Ném lỗi *"Mã OTP không tồn tại hoặc đã hết hạn"*.
  2. **Chống dò mã Brute-force (`attempts`):**
     - Giới hạn tối đa 5 lần nhập sai (`MAX_VERIFY_ATTEMPTS = 5`). Mỗi lần nhập sai sẽ tăng `attempts = attempts + 1`. Nếu vượt quá 5 lần $\rightarrow$ Khóa mã OTP này lập tức.
  3. **Đối soát mã băm (`bcrypt.compare`):**
     - So sánh mã 6 số người dùng nhập với chuỗi băm `codeHash` dưới CSDL bằng `bcrypt.compare(code, otpRecord.codeHash)`.
  4. **Tiêu hủy mã ngay sau khi đúng (`consumedAt = now`):**
     - Ngay khi mã đúng, CSDL cập nhật `consumedAt = new Date()`. Điều này đảm bảo tính chất **Mã sử dụng một lần (One-Time Password)** — ngăn chặn triệt để tấn công dùng lại mã (Replay Attack).
  5. **Kích hoạt Tài khoản Người dùng:**
     - Nếu `purpose === 'REGISTER_VERIFY'`, Backend cập nhật `User.emailVerified = true` và `emailVerifiedAt = now`, đồng thời tự động cấp Token đăng nhập cho người dùng.

---

# 🎯 CÁC CÂU HỎI VẤN ĐÁP KINH ĐIỂN VỀ EMAIL OTP

### ❓ Câu 1: Em bảo mật mã OTP trong Cơ sở dữ liệu như thế nào?
> **💡 Trả lời điểm 10:**  
> "Báo cáo thầy/cô, mã OTP 6 số không được lưu dưới dạng văn bản thuần (Plain Text) mà được băm bằng thuật toán **`bcrypt.hash(code, 10)`** trước khi chèn vào bảng `EmailOtp`. Khi người dùng xác thực, hệ thống dùng `bcrypt.compare` để đối soát. Do đó, kể cả khi CSDL bị rò rỉ, Hacker cũng không thể đọc hay lợi dụng được mã OTP."

### ❓ Câu 2: Em làm thế nào để chống người dùng bấm nút Spam gửi OTP liên tục (Brute-force/Resource Exhaustion)?
> **💡 Trả lời điểm 10:**  
> "Dạ, em áp dụng 2 tầng bảo vệ:
> 1. **Tầng Cooldown 60 giây ở Service:** Trước khi sinh OTP mới, hệ thống kiểm tra mốc thời gian tạo OTP gần nhất. Nếu chưa qua 60 giây, hệ thống từ chối và yêu cầu chờ (`RATE_LIMIT` 429).
> 2. **Tầng Rate Limiter ở Middleware:** Đường dẫn API OTP được bọc bởi middleware `authSensitiveLimiter` giới hạn tối đa số lượt gọi từ 1 địa chỉ IP."

### ❓ Câu 3: Làm sao để đảm bảo mã OTP chỉ được sử dụng đúng 1 lần (One-Time Password)?
> **💡 Trả lời điểm 10:**  
> "Dạ, ngay khi câu lệnh `bcrypt.compare` xác nhận mã OTP nhập vào là chính xác, hệ thống cập nhật trường **`consumedAt = new Date()`** dưới CSDL. Trong các lần truy vấn tiếp theo, hệ thống luôn thêm điều kiện `consumedAt: null`. Do đó mã đã tiêu thụ sẽ không bao giờ có thể tái sử dụng được nữa ạ."

---
---

# 🔔 PHẦN 5: HƯỚNG DẪN CHI TIẾT MODULE THÔNG BÁO (NOTIFICATIONS MODULE)

# 📌 GIẢI THÍCH CHI TIẾT 2 BẢNG THÔNG BÁO TRONG CSDL

Hệ thống thông báo được thiết kế tách biệt làm 2 bảng chuyên biệt: Bảng **Cài đặt (Settings)** và Bảng **Hộp thư dữ liệu (Inbox Data)**.

---

## 1. Bảng `NotificationPreference` (`notification_preferences`) — Bảng Cài Đặt
* **Mục đích:** Lưu trữ **cơ chế cài đặt/cấu hình bật hoặc tắt nhận tin nhắn** cá nhân của từng người dùng.
* **Cấu trúc trường dữ liệu:**

| Tên trường (Field) | Kiểu dữ liệu | Ý nghĩa & Mục đích sử dụng |
| :--- | :--- | :--- |
| `prefId` | `Int` (Primary Key) | Mã định danh ID bản ghi cài đặt (Tự động tăng). |
| `userId` | `UUID` (Unique, FK) | Mã ID người dùng (Liên kết 1-1 với bảng `User`). Mỗi người dùng chỉ có 1 bản ghi cài đặt duy nhất. |
| `prefs` | `Json` | Chứa object lưu trạng thái bật/tắt nhận tin dưới dạng JSON (VD: `{"n1": true, "n2": true, "n3": false, ...}`). |
| `updatedAt` | `DateTime` | Thời điểm cập nhật cài đặt lần cuối. |

---

## 2. Bảng `Notification` (`notifications`) — Bảng Hộp Thư Thông Báo Thực Tế
* **Mục đích:** Lưu trữ **nội dung chi tiết của tất cả các thông báo thực tế** gửi tới từng người dùng (hiển thị danh sách khi nhấn vào biểu tượng Quả chuông Notification trên giao diện web).
* **Cấu trúc trường dữ liệu:**

| Tên trường (Field) | Kiểu dữ liệu | Ý nghĩa & Mục đích sử dụng |
| :--- | :--- | :--- |
| `notificationId` | `Int` (Primary Key) | Mã định danh ID thông báo (Tự động tăng). |
| `userId` | `UUID` (Foreign Key) | Mã ID người dùng nhận thông báo (Liên kết n-1 với bảng `User`). |
| `type` | `NotificationType` (Enum)| Phân loại loại thông báo: `ORDER_PURCHASED`, `ORDER_PAID`, `VOUCHER_GIFT_RECEIVED`, `VOUCHER_EXPIRING`, `SYSTEM`. |
| `title` | `String(255)` | Tiêu đề ngắn gọn của thông báo (VD: *"Đơn hàng #1024 đã bị hủy"*). |
| `message` | `Text` | Nội dung chi tiết của thông báo (VD: *"Đơn hàng #1024 đã bị hủy bởi quản trị viên. Lý do: ... Yêu cầu hoàn tiền của bạn đang được xử lý."*). |
| `data` | `Json?` | Dữ liệu bổ sung đi kèm (VD: `{"orderId": 1024, "reason": "Hết hàng"}`). Dùng để khi bấm vào thông báo thì tự động chuyển hướng trang. |
| `status` | `NotificationStatus` | Trạng thái xem thông báo: `Unread` (Chưa đọc), `Read` (Đã đọc). **Dùng để đếm `unreadCount` cho quả chuông**. |
| `createdAt` | `DateTime` | Thời gian khởi tạo thông báo. |

---

# 🔄 TỔNG HỢP CÁC API LIÊN QUAN ĐẾN MODULE THÔNG BÁO

Toàn bộ các API Notification nằm trong thư mục [`backend/src/modules/customer/notifications/`](file:///e:/Documents/HCMUS/Semester3_Year3/TM%C4%90T/Everest/backend/src/modules/customer/notifications/) và yêu cầu người dùng **phải đăng nhập (`authenticate` middleware)**.

---

### ⚙️ nhóm A: Các API Cài Đặt Thông Báo (Preferences)

#### 1. `GET /api/customer/notifications/settings` — Xem Cài đặt Thông báo
* **Cách hoạt động:** Gọi `notificationsService.getPreferences(userId)`. Nếu người dùng lần đầu truy cập chưa có bản ghi cài đặt $\rightarrow$ Tự động khởi tạo bản ghi `NotificationPreference` mới với các giá trị mặc định bằng `true`.

#### 2. `PUT /api/customer/notifications/settings` — Cập nhật Cài đặt Thông báo
* **Cách hoạt động:** Nhận object JSON các công tắc bật/tắt (VD: `{ "n1": false, "n2": true }`). Tiến hành hợp nhất (merge partial update) và lưu lại vào cột `prefs` bằng `prisma.notificationPreference.upsert`.

---

### 🔔 nhóm B: Các API Hộp Thư Thông Báo (Notifications Inbox)

#### 3. `GET /api/customer/notifications` — Lấy Danh sách Thông báo & Đếm tin Chưa đọc
* **Tham số Query:** `page`, `limit` (Phân trang).
* **Cách hoạt động:**
  1. Chạy `Promise.all` truy vấn song song 3 câu lệnh SQL:
     - Lấy mảng danh sách thông báo thuộc `userId` xếp theo thời gian mới nhất (`createdAt: desc`).
     - Đếm tổng số lượng tất cả thông báo (`count`).
     - **Đếm số lượng thông báo chưa đọc (`count({ where: { userId, status: 'Unread' } })`)**.
  2. Trả về object chứa danh sách `notifications`, số lượng `unreadCount` và metadata phân trang `pagination`.

#### 4. `GET /api/customer/notifications/unread-count` — Lấy Số lượng Tin chưa đọc
* **Cách hoạt động:** Trả về nhanh số lượng `unreadCount` để Frontend hiển thị số đếm màu đỏ trên biểu tượng Quả chuông Notification ở góc trên màn hình khi người dùng chuyển trang.

#### 5. `GET /api/customer/notifications/:id` — Xem Chi tiết 1 Thông báo
* **Cách hoạt động:** Lấy chi tiết thông báo theo `notificationId`. Nếu thông báo đang ở trạng thái `Unread`, hệ thống sẽ tự động cập nhật `status = 'Read'` (Tự động đánh dấu đã đọc khi người dùng bấm mở xem chi tiết).

#### 6. `PATCH /api/customer/notifications/:id/read` — Đánh dấu 1 Thông báo là Đã đọc
* **Cách hoạt động:** Cập nhật `Notification.status = 'Read'` cho thông báo tương ứng.

#### 7. `POST /api/customer/notifications/read-all` — Đánh dấu Tất cả Thông báo là Đã đọc
* **Cách hoạt động:** Thực hiện câu lệnh SQL `prisma.notification.updateMany` đổi toàn bộ bản ghi có `userId` của khách hàng từ `status: 'Unread'` $\rightarrow$ **`status: 'Read'`**. Sau khi gọi API này, số đếm `unreadCount` sẽ quay về 0 và chấm đỏ trên quả chuông biến mất.

---

# 💻 CHI TIẾT CODE TẠO THÔNG BÁO TỰ ĐỘNG (`notifications.service.ts`)

Trong file [`notifications.service.ts`](file:///e:/Documents/HCMUS/Semester3_Year3/TM%C4%90T/Everest/backend/src/modules/customer/notifications/notifications.service.ts), hệ thống cung cấp các hàm Helper giúp các module khác (như Order, Payment, Gift) tự động bắn thông báo tới người dùng:

```typescript
// 1. Tạo thông báo khi Khách mua & Thanh toán thành công (ORDER_PAID)
async notifyOrderPurchased(customerId: string, orderId: number, totalAmount: number) {
  return this.createNotification(
    customerId,
    "ORDER_PAID",
    "Thanh toán thành công",
    `Đơn hàng #${orderId} đã được thanh toán thành công. Tổng thanh toán: ${totalAmount.toLocaleString("vi-VN")}₫`,
    { orderId, totalAmount }
  );
}

// 2. Tạo thông báo khi Admin Hủy / Hoàn tiền đơn hàng (SYSTEM)
async notifyOrderCancelled(customerId: string, orderId: number, reason: string) {
  return this.createNotification(
    customerId,
    "SYSTEM",
    `Đơn hàng #${orderId} đã bị hủy`,
    `Đơn hàng #${orderId} đã bị hủy bởi quản trị viên. Lý do: ${reason}. Yêu cầu hoàn tiền của bạn đang được xử lý.`,
    { orderId, reason }
  );
}

// 3. Tạo thông báo khi được Bạn bè Tặng Voucher (VOUCHER_GIFT_RECEIVED)
async notifyVoucherGiftReceived(receiverId: string, gifterName: string, voucherTitle: string, voucherCode: string) {
  return this.createNotification(
    receiverId,
    "VOUCHER_GIFT_RECEIVED",
    `Bạn nhận được voucher tặng từ ${gifterName}!`,
    `${gifterName} đã tặng bạn voucher "${voucherTitle}". Mã: ${voucherCode}`,
    { gifterName, voucherTitle, voucherCode }
  );
}
```

---

# 🎯 CÁC CÂU HỎI VẤN ĐÁP KINH ĐIỂN VỀ THÔNG BÁO

### ❓ Câu 1: Em hiển thị và tính toán số đếm quả chuông đỏ (Badge Count) trên giao diện như thế nào?
> **💡 Trả lời điểm 10:**  
> "Báo cáo thầy/cô, trên giao diện Header, Frontend gọi API `GET /api/customer/notifications` (hoặc `unread-count`). Tại Backend, hệ thống chạy câu lệnh `prisma.notification.count({ where: { userId, status: 'Unread' } })` để đếm chính xác số lượng bản ghi chưa đọc. Số đếm này được hiển thị lên chấm đỏ quả chuông. Khi người dùng bấm 'Đánh dấu tất cả đã đọc', API `read-all` cập nhật `status = 'Read'`, giúp chấm đỏ biến mất ngay lập tức."

### ❓ Câu 2: Sự khác nhau giữa 2 bảng `Notification` và `NotificationPreference` là gì?
> **💡 Trả lời điểm 10:**  
> "Dạ, 
> - **`NotificationPreference`:** Là bảng lưu Cài đặt bật/tắt nhận tin (Settings) theo quan hệ 1-1 với User.
> - **`Notification`:** Là bảng lưu Hộp thư chứa nội dung thông báo thực tế (Data Inbox) theo quan hệ 1-N với User."
