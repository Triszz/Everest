# 🎓 HƯỚNG DẪN ÔN TẬP VẤN ĐÁP BACKEND CUSTOMER (ĐẠT ĐIỂM 10)
**Dự án:** Everest — Hệ thống TMĐT Voucher & Ưu đãi  
**Phân hệ:** Customer Backend Services  

---

## 📌 1. BẢNG TỔNG HỢP CÁC MODULE & API PHÂN HỆ CUSTOMER

| STT | Module | Thư mục Backend | Chức năng chính | Mức độ quan trọng vấn đáp |
| :--- | :--- | :--- | :--- | :--- |
| 1 | **Orders & Payment** | `backend/src/modules/customer/orders/` | Tạo đơn hàng, Thanh toán VNPAY (IPN & Return), Phát hành mã Voucher (`IssuedVoucher`), Transaction | ⭐⭐⭐⭐⭐ **(ĐIỂM 10 - BẮT BUỘC)** |
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

### 🥇 Top 1: Module `Orders & Payment` (`orders.service.ts`)
Đây là **module cốt lõi nhất** của dự án E-Commerce. Giảng viên chắc chắn sẽ xoáy sâu vào luồng này!

* **Đoạn code cần thuộc nằm ở:** [`backend/src/modules/customer/orders/orders.service.ts`](file:///e:/Documents/HCMUS/Semester3_Year3/TM%C4%90T/Everest/backend/src/modules/customer/orders/orders.service.ts)
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

### ❓ Câu 1: Em hãy giải thích cách xử lý khi 2 người cùng bấm Mua ngay 1 Voucher cuối cùng (Concurrency / Race Condition)?
> **💡 Trả lời điểm 10:**  
> "Báo cáo thầy/cô, hệ thống sử dụng **Database Transaction (`prisma.$transaction`)** kết hợp với phép trừ số lượng nguyên tử (`availableQuantity: { decrement: quantity }`).  
> Khi 2 request tới cùng lúc, Transaction đầu tiên sẽ giữ Lock trên hàng đó. Nếu `availableQuantity` giảm xuống âm hoặc nhỏ hơn số lượng yêu cầu, điều kiện `if (voucher.availableQuantity < quantity)` sẽ phát hiện và **Throw Exception (`OUT_OF_STOCK`)**. Khi đó, Prisma sẽ tự động **Rollback** toàn bộ giao dịch, đảm bảo không bao giờ bị oversell (bán âm kho)."

---

### ❓ Câu 2: Luồng thanh toán VNPAY IPN được bảo mật và chống gian lận như thế nào?
> **💡 Trả lời điểm 10:**  
> "Dạ, để chống sửa đổi số tiền hoặc gian lận tham số, khi VNPAY trả kết quả về callback IPN (`/api/customer/payment/ipn`), Backend không tin tưởng ngay dữ liệu gửi lên mà thực hiện 2 bước kiểm tra:  
> 1. **Tái tạo chữ ký Checksum**: Backend lấy toàn bộ tham số trả về (trừ `vnp_SecureHash`), sắp xếp alphabet và băm lại bằng thuật toán **HMAC-SHA512** với bí mật `VNP_HASH_SECRET`. Nếu chữ ký không khớp $\rightarrow$ Từ chối ngay.  
> 2. **Đối soát số tiền**: Backend truy vấn lại Đơn hàng dưới CSDL và so sánh `order.totalAmount` với `vnp_Amount / 100`. Nếu số tiền khớp và `vnp_ResponseCode == '00'` thì mới cập nhật trạng thái `Paid` và cấp mã Voucher."

---

### ❓ Câu 3: Làm thế nào để quản lý Đăng nhập đa thiết bị và Đăng xuất từ xa?
> **💡 Trả lời điểm 10:**  
> "Dạ, hệ thống kết hợp giữa **JWT Token** và **Session Table trong CSDL**. Mỗi lần đăng nhập thành công, Backend lưu một bản ghi vào bảng `Session` chứa `userId`, `refreshToken`, `ipAddress`, `userAgent`.  
> Khi người dùng muốn Đăng xuất thiết bị khác, Backend chỉ cần thu hồi (`isRevoked = true` hoặc xóa) bản ghi `Session` của thiết bị đó. Khi Refresh Token từ thiết bị đó gửi lên, Middleware kiểm tra Session đã bị thu hồi $\rightarrow$ Hủy phiên và bắt đăng nhập lại."

---

### ❓ Câu 4: Làm sao để hiển thị đúng danh sách Voucher cho khách hàng mà không bị sót hay bị phân trang ngắt quãng?
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

## 🚀 LỜI KHUYÊN DÀNH CHO BẠN
1. Trả lời tự tin, sử dụng đúng các thuật ngữ kỹ thuật: *Prisma Transaction, HMAC-SHA512 Checksum, JWT Refresh Token Rotation, Atomic Decrement, Race Condition*.
2. Khi giảng viên yêu cầu mở code trực tiếp: Mở sẵn 2 file chính là [`orders.service.ts`](file:///e:/Documents/HCMUS/Semester3_Year3/TM%C4%90T/Everest/backend/src/modules/customer/orders/orders.service.ts) và [`password.service.ts`](file:///e:/Documents/HCMUS/Semester3_Year3/TM%C4%90T/Everest/backend/src/modules/auth/password.service.ts)!

 chúc bạn thi vấn đáp thành công xuất sắc và đạt ĐIỂM 10 TRỌN VẸN! 🌟
