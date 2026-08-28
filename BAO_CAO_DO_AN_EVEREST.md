# BÁO CÁO ĐỒ ÁN MÔN HỌC THƯƠNG MẠI ĐIỆN TỬ
## ĐỀ TÀI: HỆ THỐNG THƯƠNG MẠI ĐIỆN TỬ BÁN VOUCHER GIẢM GIÁ TRỰC TUYẾN — EVEREST

* **Trường:** Đại học Khoa học Tự nhiên – ĐHQG TP.HCM (HCMUS)
* **Khoa:** Công nghệ Thông tin
* **Môn học:** Thương mại Điện tử (E-Commerce)
* **Năm học:** 2025 – 2026

---

# PHẦN 1: THÔNG TIN NHÓM & PHÂN CÔNG CÔNG VIỆC

## 1.1. Thông tin nhóm & Tự đánh giá % đóng góp

| STT | Họ và Tên | MSSV | Email | Vai trò chính | Tự đánh giá đóng góp (%) |
|:---:|---|:---:|---|---|:---:|
| **1** | Nguyễn Văn A | 21120001 | nva@student.hcmus.edu.vn | Nhóm trưởng / Fullstack Dev | **34%** |
| **2** | Trần Thị B | 21120002 | ttb@student.hcmus.edu.vn | Fullstack Dev | **33%** |
| **3** | Lê Hoàng C | 21120003 | lhc@student.hcmus.edu.vn | Fullstack Dev / Core & Security | **33%** |
| **Tổng** | | | | | **100%** |

---

## 1.2. Mức độ Vibe-Coding của các thành viên

Nghiên cứu và phát triển hệ thống **Everest** áp dụng phương pháp **Vibe-Coding (AI-Assisted Pair Programming)** với công cụ trợ lý AI nâng cao (**Google Antigravity / Gemini 2.5**):

* **Nguyễn Văn A (Mức độ Vibe-Coding: 85%):** Sử dụng AI Agent để tự động hóa thiết kế UI Component (React 19 + TailwindCSS), sinh mã Form Validation với Zod, tối ưu trải nghiệm responsive cho khách hàng và sinh mã QR Code.
* **Trần Thị B (Mức độ Vibe-Coding: 80%):** Prompting AI để xây dựng các Dashboard điều khiển cho Đối tác và Thu ngân, sinh các sơ đồ Recharts thống kê doanh thu và tự động hóa mã quản lý danh sách chi nhánh (`Branch`).
* **Lê Hoàng C (Mức độ Vibe-Coding: 90%):** Pair-programming cùng AI Antigravity để refactor toàn bộ hạ tầng xử lý bất đồng bộ, gia cố chống Race Condition (Atomic DB Updates), cài đặt Idempotency Key Middleware, hệ thống Rate Limiting 5 tầng và viết tài liệu kiểm thử.

---

## 1.3. Bảng phân công công việc chi tiết & Mức độ hoàn thành

Công việc được phân chia tương ứng **3 vai trò/phân hệ chính** cho 3 thành viên:

### Thành viên 1: Nguyễn Văn A (Phụ trách Phân hệ Khách hàng — Customer Role)
* **Đảm nhiệm:** UI/UX, FE, BE, API & Testing cho toàn bộ luồng người mua hàng.

| STT | Chức năng / Hạng mục | Mô tả chi tiết công việc | Quy mô (FE/BE/UI/Testing) | Mức độ hoàn thành |
|:---:|---|---|:---:|:---:|
| 1 | **Giao diện & UI/UX Khách hàng** | Thiết kế UI/UX Trang chủ, Danh mục, Chi tiết Voucher, Giỏ hàng, Checkout và Trang "Voucher của tôi". | UI/UX, FE | **100%** |
| 2 | **Lọc Voucher theo Khu vực (`City`)** | Xây dựng API & UI lọc voucher theo Tỉnh/Thành phố (`city`), Từ khóa, Khoảng giá, Danh mục, Đối tác. | FE, BE | **100%** |
| 3 | **Giỏ hàng & Tạo đơn hàng** | Quản lý CRUD CartItem, tạo đơn hàng trạng thái Pending, hỗ trợ đặt mua tặng người thân. | FE, BE | **100%** |
| 4 | **Thanh toán VNPAY & Mô phỏng** | Tích hợp cổng thanh toán VNPAY Sandbox, tạo URL thanh toán bảo mật và xử lý Callback. | FE, BE | **100%** |
| 5 | **Nhận E-Voucher & QR Code** | Tự động sinh mã voucher duy nhất, hiển thị QR Code mô phỏng cho từng mã voucher đã mua. | FE, BE | **100%** |
| 6 | **Đánh giá & Phản hồi** | Chức năng chấm sao, viết Review trải nghiệm và gửi Feedback khiếu nại tới hệ thống. | FE, BE | **100%** |
| 7 | **Tìm kiếm Voucher nâng cao (Search)** | Tìm kiếm voucher theo từ khóa tiêu đề, mô tả, danh mục, tên thương hiệu đối tác và gợi ý từ khóa tìm kiếm. | FE, BE | **100%** |

### Thành viên 2: Trần Thị B (Phụ trách Phân hệ Đối tác & Nhân viên — Partner & Cashier/Staff Role)
* **Đảm nhiệm:** UI/UX, FE, BE, API & Testing cho Doanh nghiệp đối tác (`Partner_Owner`) và Thu ngân chi nhánh (`Partner_Cashier`).

| STT | Chức năng / Hạng mục | Mô tả chi tiết công việc | Quy mô (FE/BE/UI/Testing) | Mức độ hoàn thành |
|:---:|---|---|:---:|:---:|
| 1 | **Giao diện Portal Đối tác & Staff** | Thiết kế UI Dashboard Partner, Form đăng ký đối tác, Form tạo voucher và Màn hình Quét/Nhập mã gạch voucher. | UI/UX, FE | **100%** |
| 2 | **Quản lý Chi nhánh (`Branch`)** | API & UI cho phép thêm/sửa chi nhánh áp dụng, gán cột Thành phố (`city`) cho từng chi nhánh. | FE, BE | **100%** |
| 3 | **Tạo & Gửi duyệt Voucher** | Tạo voucher ở dạng Nháp (Draft) và gửi yêu cầu phê duyệt tới Ban quản trị (Admin). | FE, BE | **100%** |
| 4 | **Gạch mã Voucher tại Chi nhánh (Redemption)** | Chức năng dành cho **Staff/Cashier**: Kiểm tra tính hợp lệ (`Validate`) và Xác nhận gạch mã (`Confirm`) qua QR/Nhập mã. | FE, BE | **100%** |
| 5 | **Báo cáo & Thống kê Đối tác** | Thống kê doanh thu bán voucher, tỷ lệ voucher đã sử dụng (`Used`) theo thời gian và chi nhánh. | FE, BE | **100%** |
| 6 | **Quản lý Hồ sơ Doanh nghiệp Đối tác** | Đăng ký tài khoản doanh nghiệp đối tác, cập nhật Mã số thuế, Giấy phép kinh doanh và thông tin Người đại diện. | FE, BE | **100%** |

### Thành viên 3: Lê Hoàng C (Phụ trách Phân hệ Admin & Hạ tầng Kiến trúc Kỹ thuật Nâng cao)
* **Đảm nhiệm:** Admin Portal, Hệ thống Xác thực (Auth), Bảo mật, Cơ sở dữ liệu và Kiến trúc Nâng cao.

| STT | Chức năng / Hạng mục | Mô tả chi tiết công việc | Quy mô (FE/BE/UI/Testing) | Mức độ hoàn thành |
|:---:|---|---|:---:|:---:|
| 1 | **Admin Portal & Kiểm duyệt** | Giao diện Admin Dashboard, Duyệt/Từ chối Hồ sơ Đối tác & Voucher, Quản lý Bài viết, Banner, Popup. | FE, BE, UI | **100%** |
| 2 | **Quản lý User & Lock Tức thì** | Chức năng Admin khóa/mở khóa tài khoản, tự động thu hồi Session & Token buộc logout tức thì. | FE, BE | **100%** |
| 3 | **Auth Đa kênh & Multi-session** | Đăng nhập bằng Email hoặc SĐT, chọn nhận OTP qua Email/SMS mô phỏng, quản lý đăng xuất đa phiên. | FE, BE | **100%** |
| 4 | **Chống Race Condition & Overselling** | Thiết kế *Atomic Conditional Updates* tại DB Transaction, loại bỏ hoàn toàn nguy cơ bán vượt tồn kho. | Core BE | **100%** |
| 5 | **Idempotency Key Middleware** | Triển khai Express Middleware `idempotency` (TTL 15m), chống trùng đơn hàng và trùng gạch mã khi double-click. | Core BE | **100%** |
| 6 | **Phân loại Rate Limiting Phân tầng** | Cài đặt `rateLimiters` bảo vệ 5 nhóm API (Auth, Redemption, Checkout, Content, General). | Core BE | **100%** |
| 7 | **Quản lý Nhật ký Kiểm toán (Audit Log)** | Ghi nhận và hiển thị lịch sử thao tác kiểm toán của Admin/Partner đối với toàn bộ dữ liệu quan trọng trong hệ thống. | FE, BE | **100%** |

---

## 1.4. Chữ ký xác nhận của các thành viên (Bản in giấy nộp)

*(Tất cả thành viên cam kết bảng phân công công việc và tỷ lệ đóng góp trên phản ánh đúng thực tế quá trình thực hiện đồ án)*

<br />

| **Thành viên 1 (Nhóm trưởng)** | **Thành viên 2** | **Thành viên 3** |
|:---:|:---:|:---:|
| *(Ký và ghi rõ họ tên)* | *(Ký và ghi rõ họ tên)* | *(Ký và ghi rõ họ tên)* |
| <br /><br /><br /> | <br /><br /><br /> | <br /><br /><br /> |
| **Nguyễn Văn A** | **Trần Thị B** | **Lê Hoàng C** |

---

# PHẦN 2: TỔNG QUAN HỆ THỐNG & DỰ ÁN

## 2.1. Giới thiệu dự án
**Everest** là hệ thống Thương mại Điện tử chuyên biệt trong lĩnh vực phân phối và quản lý **Voucher/Coupon giảm giá điện tử (E-Voucher)**. Hệ thống giải quyết bài toán kết nối nhu cầu mua sắm tiết kiệm của người tiêu dùng với mục tiêu tiếp thị, kích cầu doanh số và quản lý chuỗi chi nhánh của các doanh nghiệp đối tác.

## 2.2. Mục tiêu hệ thống
1. Cung cấp trải nghiệm mua sắm voucher mượt mà, tiện lợi cho Khách hàng với khả năng lọc theo địa phương (`City`), đặt mua tặng bạn bè và lưu trữ mã QR thông minh.
2. Cung cấp công cụ quản lý toàn diện cho Đối tác doanh nghiệp: tạo chiến dịch khuyến mãi, phân bổ chi nhánh áp dụng và hỗ trợ thu ngân gạch mã tức thì tại quầy.
3. Cung cấp trung tâm điều hành cho Ban Quản trị (Admin) nhằm kiểm duyệt chất lượng voucher, đảm bảo an toàn giao dịch và tuân thủ các quy tắc nghiệp vụ (Business Rules).

---

# PHẦN 3: KIẾN TRÚC HỆ THỐNG (SYSTEM ARCHITECTURE)

## 3.1. Mô hình tổng thể 3-Tier
Hệ thống được thiết kế theo kiến trúc **3-Tier Client – Server – Database** hiện đại:
- **Presentation Tier:** 3 ứng dụng Single Page Application (SPA) độc lập bằng **React 19 + Vite + TailwindCSS** (Customer Frontend, Partner Frontend, Admin Frontend) và 1 ứng dụng di động cho Nhân viên chi nhánh (**Staff Mobile React Native / Web**).
- **Application/Business Tier:** RESTful API Server phát triển trên nền **Node.js (Express 5) + TypeScript**, tích hợp Zod Validation, JWT Authentication, RBAC Role Guards, Idempotency Key và Rate Limiters.
- **Data Tier:** Hệ quản trị cơ sở dữ liệu quan hệ **PostgreSQL 16** truy xuất thông qua **Prisma ORM 7** với cơ chế Transaction và Row Locking an toàn.

## 3.2. Sơ đồ kiến trúc tổng thể (Mermaid Architecture Diagram)

```mermaid
flowchart TB
    subgraph Clients["Presentation Tier (Client Applications)"]
        direction LR
        FE_C["frontend-customer<br/>React 19 + TailwindCSS<br/>Port 5173"]
        FE_P["frontend-partner<br/>React 19 + Recharts<br/>Port 5174"]
        FE_A["frontend-admin<br/>React 19 + Quill + Recharts<br/>Port 5175"]
        FE_S["frontend-staff<br/>React Native / Web App<br/>Port 8081"]
    end

    subgraph Backend["Business Tier (Express 5 + TypeScript Server — Port 3000)"]
        direction TB
        MW["Security & Traffic Control Middleware<br/>Helmet · CORS · Rate Limiters · Idempotency Middleware<br/>Request Logger · JWT & RBAC Guard"]
        R["RESTful API Routes<br/>/api/auth · /api/customer/* · /api/partner/*<br/>/api/admin/* · /api/vouchers · /api/cart"]
        SVC["Core Business Services<br/>vouchers.service · orders.service · payment.service<br/>redemption.service · email-otp.service · audit.service"]
        VAL["Validation & Protection Layer<br/>Zod Schema Validation · Atomic DB Transaction Wrapper"]
    end

    subgraph Data["Data Tier"]
        ORM["Prisma ORM 7 Adapter"]
        DB[("PostgreSQL 16 Database<br/>22 Core Tables + Prisma Migrations")]
    end

    EXT["External Integrations<br/>VNPAY Sandbox Gateway · Mock Email/SMS OTP Engine"]

    FE_C -- "HTTPS / REST API<br/>JWT Bearer" --> MW
    FE_P -- "HTTPS / REST API<br/>JWT Bearer" --> MW
    FE_A -- "HTTPS / REST API<br/>JWT Bearer" --> MW
    FE_S -- "HTTPS / REST API<br/>JWT Bearer" --> MW

    MW --> R --> SVC --> VAL --> ORM --> DB
    SVC -. "Thanh toán & OTP" .-> EXT

    style Clients fill:#dbeafe,stroke:#1e40af
    style Backend fill:#fef3c7,stroke:#92400e
    style Data fill:#dcfce7,stroke:#15803d
    style EXT fill:#f3e8ff,stroke:#6b21a8
```

---

## 3.3. Ma trận phân quyền hệ thống (RBAC Permission Matrix)

| Chức năng / Resource | Customer | Partner_Cashier | Partner_Owner | Admin |
|---|:---:|:---:|:---:|:---:|
| Đăng ký, Đăng nhập (Email/SĐT + OTP), Đổi MK | ✅ | ✅ | ✅ | ✅ |
| Tìm kiếm, Lọc Voucher theo khu vực (`City`) | ✅ | — | — | ✅ (xem) |
| Giỏ hàng & Tạo đơn hàng (Checkout) | ✅ | — | — | — |
| Thanh toán VNPAY / Mô phỏng & Nhận QR Code | ✅ | — | — | — |
| Đánh giá (Review) & Gửi phản hồi (Feedback) | ✅ | — | — | — |
| Quản lý Chi nhánh & Tạo Voucher nháp | — | — | ✅ | — |
| Gạch mã Voucher tại chi nhánh (Redemption) | — | ✅ | ✅ | — |
| Phê duyệt Đối tác & Phê duyệt Voucher | — | — | — | ✅ |
| Khóa/Mở khóa tài khoản & Đăng xuất tức thì | — | — | — | ✅ |
| Quản lý Nội dung (Banner, Post, Popup, Category) | — | — | — | ✅ |

---

# PHẦN 4: THIẾT KẾ CƠ SỞ DỮ LIỆU THỰC TẾ (DATABASE DESIGN & SCHEMA)

Dữ liệu được trích xuất trực tiếp từ **Live PostgreSQL Database (Supabase Cloud)** và file cấu hình **Prisma Schema (`backend/prisma/schema.prisma`)** của dự án.

## 4.1. Sơ đồ thực thể quan hệ ERD Đầy đủ 22 Bảng (Mermaid `erDiagram`)

```mermaid
erDiagram
    users ||--o{ user_sessions : "maintains"
    users ||--o{ orders : "places"
    users ||--o{ reviews : "writes"
    users ||--o{ feedbacks : "submits"
    users ||--o{ admin_audit_log : "executes"
    users ||--o{ email_otps : "receives_otp"
    users ||--o{ password_resets : "resets_pass"
    users ||--o{ notifications : "receives_notify"
    users ||--o{ notification_preferences : "configures"
    users ||--o{ cart_items : "adds_cart"
    users ||--o{ posts : "authors"

    partners ||--o{ users : "employs"
    partners ||--o{ branches : "owns"
    partners ||--o{ vouchers : "issues"

    branches ||--o{ voucher_branches : "hosts"
    branches ||--o{ issued_vouchers : "redeems_at"
    branches ||--o| users : "cashier"

    categories ||--o{ vouchers : "classifies"
    vouchers ||--o{ voucher_branches : "applies_to"
    vouchers ||--o{ cart_items : "carted"
    vouchers ||--o{ order_items : "ordered"
    vouchers ||--o{ reviews : "reviewed"

    orders ||--o{ order_items : "includes"
    orders ||--o{ feedbacks : "complains"
    order_items ||--o{ issued_vouchers : "generates"
    issued_vouchers ||--o{ reviews : "reviewed_with"

    users {
        Uuid user_id PK
        VarChar email UK
        VarChar phone_number UK
        VarChar password_hash
        VarChar full_name
        user_role role
        account_status status
        Int partner_id FK
        Boolean email_verified
    }

    partners {
        Int partner_id PK
        VarChar company_name
        VarChar tax_code UK
        partner_status status
        Boolean is_locked
    }

    branches {
        Int branch_id PK
        Int partner_id FK
        Uuid cashier_id FK
        VarChar branch_name
        VarChar address
        VarChar city
        VarChar phone_number
        Boolean is_locked
    }

    categories {
        Int category_id PK
        VarChar category_name
        Text description
    }

    vouchers {
        Int voucher_id PK
        Int partner_id FK
        Int category_id FK
        VarChar title
        Decimal original_price
        Decimal sale_price
        Int total_quantity
        Int available_quantity
        voucher_approval_status approval_status
        voucher_display_status display_status
        Boolean is_locked
    }

    voucher_branches {
        Int voucher_id PK_FK
        Int branch_id PK_FK
    }

    cart_items {
        Int cart_item_id PK
        Uuid customer_id FK
        Int voucher_id FK
        Int quantity
    }

    orders {
        Int order_id PK
        Uuid customer_id FK
        Decimal total_amount
        VarChar payment_method
        payment_status payment_status
        Boolean is_gift
        VarChar receiver_email
    }

    order_items {
        Int order_item_id PK
        Int order_id FK
        Int voucher_id FK
        Int quantity
        Decimal price
    }

    issued_vouchers {
        Int issued_voucher_id PK
        Int order_item_id FK
        VarChar voucher_code UK
        voucher_usage_status status
        Timestamptz valid_from
        Timestamptz valid_to
        Timestamptz used_at
        Int used_at_branch_id FK
    }

    reviews {
        Int review_id PK
        Uuid customer_id FK
        Int voucher_id FK
        Int issued_voucher_id FK
        Int rating
        Text comment
    }

    feedbacks {
        Int feedback_id PK
        Uuid customer_id FK
        VarChar ticket_id UK
        VarChar type
        VarChar subject
        Text message
        VarChar status
    }

    banners {
        Int banner_id PK
        VarChar title
        VarChar image_url
        banner_status status
    }

    popups {
        Int popup_id PK
        VarChar title
        VarChar body
        popup_status status
    }

    posts {
        Int post_id PK
        Uuid author_id FK
        VarChar title
        Text content
        post_status status
    }

    policies {
        Int policy_id PK
        VarChar title UK
        Text content
    }

    password_resets {
        Int reset_id PK
        Uuid user_id FK
        VarChar token UK
        Timestamptz expires_at
    }

    email_otps {
        Int otp_id PK
        Uuid user_id FK
        VarChar email
        VarChar code_hash
        otp_purpose purpose
    }

    notification_preferences {
        Int pref_id PK
        Uuid user_id FK_UK
        Json prefs
    }

    notifications {
        Int notification_id PK
        Uuid user_id FK
        notification_type type
        VarChar title
        Text message
        notification_status status
    }

    user_sessions {
        Uuid session_id PK
        Uuid user_id FK
        VarChar device_type
        Timestamptz expires_at
        Timestamptz revoked_at
    }

    admin_audit_log {
        BigInt log_id PK
        Uuid actor_id FK
        audit_actor_type actor_type
        VarChar action
        audit_target_type target_type
        VarChar target_id
    }
```

---

## 4.2. Danh sách 14 Enums trong Cơ sở Dữ liệu

1. `UserRole` (`user_role`): `Admin`, `Customer`, `Partner_Owner`, `Partner_Cashier`
2. `AccountStatus` (`account_status`): `Active`, `Banned`
3. `PartnerStatus` (`partner_status`): `Pending`, `Approved`, `Rejected`
4. `BannerStatus` (`banner_status`): `Visible`, `Hidden`
5. `PostStatus` (`post_status`): `Visible`, `Hidden`
6. `PopupStatus` (`popup_status`): `Visible`, `Hidden`
7. `VoucherApprovalStatus` (`voucher_approval_status`): `Draft`, `Pending`, `Approved`, `Rejected`
8. `VoucherDisplayStatus` (`voucher_display_status`): `Visible`, `Hidden`
9. `PaymentStatus` (`payment_status`): `Pending`, `Paid`, `Cancelled`
10. `VoucherUsageStatus` (`voucher_usage_status`): `Unused`, `Used`, `Expired`, `Locked`
11. `AuditActorType` (`audit_actor_type`): `ADMIN`, `CUSTOMER`, `PARTNER`
12. `AuditTargetType` (`audit_target_type`): `USER`, `PARTNER`, `BRANCH`, `CATEGORY`, `VOUCHER`, `POLICY`, `BANNER`, `POPUP`, `POST`, `ORDER`
13. `OtpPurpose` (`otp_purpose`): `REGISTER_VERIFY`, `RESET_PASSWORD`, `TWO_FA_LOGIN`
14. `NotificationType` (`notification_type`): `ORDER_PURCHASED`, `ORDER_PAID`, `VOUCHER_GIFT_RECEIVED`, `VOUCHER_EXPIRING`, `SYSTEM`

---

## 4.3. Bảng Thống kê & Số lượng Bản ghi Thực tế trong CSDL (Live Supabase DB)

Kết quả truy vấn trực tiếp từ hệ quản trị CSDL Live PostgreSQL (Supabase Cloud Engine):

| STT | Tên bảng (DB Map) | Mô hình Prisma | Số trường | Số bản ghi thực tế (Live Rows) | Chức năng nghiệp vụ chính |
|:---:|---|---|:---:|:---:|---|
| **1** | `users` | `User` | 13 | **37 bản ghi** | Quản lý thông tin tài khoản người dùng toàn hệ thống |
| **2** | `partners` | `Partner` | 11 | **37 bản ghi** | Quản lý doanh nghiệp đối tác, MST & giấy phép kinh doanh |
| **3** | `branches` | `Branch` | 9 | **8 bản ghi** | Danh sách chi nhánh đối tác (chứa cột `city` phục vụ lọc khu vực & `cashier_id`) |
| **4** | `categories` | `Category` | 3 | **15 bản ghi** | Danh mục ngành hàng voucher (Ẩm thực, Du lịch, Giải trí, Mua sắm, Dịch vụ) |
| **5** | `vouchers` | `Voucher` | 19 | **37 bản ghi** | Sản phẩm voucher, giá bán, tồn kho `available_quantity` & trạng thái duyệt |
| **6** | `voucher_branches` | `VoucherBranch` | 2 | **6 bản ghi** | Liên kết sản phẩm Voucher với Chi nhánh áp dụng |
| **7** | `cart_items` | `CartItem` | 5 | **4 bản ghi** | Giỏ hàng tạm tính của khách hàng |
| **8** | `orders` | `Order` | 16 | **83 bản ghi** | Quản lý đơn hàng, trạng thái thanh toán, quà tặng & hoàn tiền |
| **9** | `order_items` | `OrderItem` | 5 | **63 bản ghi** | Chi tiết các mặt hàng trong đơn hàng |
| **10** | `issued_vouchers` | `IssuedVoucher` | 8 | **44 bản ghi** | Mã voucher điện tử đã phát hành (Mã QR/Code duy nhất, trạng thái `Unused`/`Used`) |
| **11** | `reviews` | `Review` | 7 | **6 bản ghi** | Đánh giá sao & bình luận của khách hàng |
| **12** | `feedbacks` | `Feedback` | 13 | **0 bản ghi** | Góp ý & khiếu nại gửi tới hệ thống kèm mã Ticket |
| **13** | `banners` | `Banner` | 6 | **3 bản ghi** | Banners quảng cáo trên trang chủ |
| **14** | `popups` | `Popup` | 9 | **3 bản ghi** | Popups thông báo khuyến mãi |
| **15** | `posts` | `Post` | 8 | **7 bản ghi** | Bài viết tin tức & kinh nghiệm mua sắm |
| **16** | `policies` | `Policy` | 4 | **4 bản ghi** | Điều khoản dịch vụ & chính sách bảo mật |
| **17** | `password_resets` | `PasswordReset` | 7 | **0 bản ghi** | Lưu vết yêu cầu khôi phục mật khẩu |
| **18** | `email_otps` | `EmailOtp` | 9 | **19 bản ghi** | Lưu vết mã OTP xác thực (Email & SMS) |
| **19** | `user_sessions` | `UserSession` | 8 | **101 bản ghi** | Quản lý thiết bị & phiên làm việc của người dùng |
| **20** | `admin_audit_log` | `AdminAuditLog` | 8 | **48 bản ghi** | Nhật ký kiểm toán mọi thao tác của Admin & Partner |
| **21** | `notifications` | `Notification` | 8 | **17 bản ghi** | Thông báo hệ thống gửi tới từng người dùng |
| **22** | `notification_preferences` | `NotificationPreference` | 4 | **3 bản ghi** | Cấu hình tùy chỉnh thông báo |
| **23** | `_prisma_migrations` | System Table | 3 | **13 bản ghi** | Nhật ký lịch sử các bản Migration CSDL |

---

# PHẦN 5: ĐẶC TẢ USE CASE & SƠ ĐỒ HOẠT ĐỘNG (USE CASE SPECIFICATIONS & ACTIVITY DIAGRAMS)

## 5.1. Sơ đồ Use Case Diagram Tổng Thể (Overall Use Case Diagram)

```mermaid
flowchart LR
    subgraph Actors["Các Bên Liên Quan (Actors)"]
        direction TB
        CUS["Khách hàng<br/>(Customer)"]
        PAR["Chủ đối tác<br/>(Partner_Owner)"]
        CAS["Thu ngân chi nhánh<br/>(Partner_Cashier)"]
        ADM["Quản trị viên<br/>(Admin)"]
    end

    subgraph SystemBoundary["Hệ thống Thương mại Điện tử Everest (System Boundary)"]
        UC01("(UC-01: Đăng ký & Phê duyệt Doanh nghiệp Đối tác)")
        UC02("(UC-02: Tạo & Kiểm duyệt Chương trình Voucher)")
        UC03("(UC-03: Mua Voucher & Thanh toán VNPAY Sandbox)")
        UC04("(UC-04: Quét/Nhập mã & Gạch Voucher tại Chi nhánh)")
        UC05("(UC-05: Quản lý Người dùng & Khóa tài khoản Tức thì)")
        UC06("(UC-06: Tìm kiếm & Lọc Voucher Khuyến mãi)")
        UC07("(UC-07: Quản lý Nội dung Tiếp thị & Truyền thông CMS)")
    end

    CUS --> UC03
    CUS --> UC06

    PAR --> UC01
    PAR --> UC02

    CAS --> UC04

    ADM --> UC01
    ADM --> UC02
    ADM --> UC05
    ADM --> UC07

    style Actors fill:#f1f5f9,stroke:#475569
    style SystemBoundary fill:#f8fafc,stroke:#0284c7,stroke-width:2px
    style UC01 fill:#fef3c7,stroke:#b45309
    style UC02 fill:#fef3c7,stroke:#b45309
    style UC03 fill:#dcfce7,stroke:#15803d
    style UC04 fill:#e0f2fe,stroke:#0369a1
    style UC05 fill:#fce7f3,stroke:#be185d
    style UC06 fill:#dcfce7,stroke:#15803d
    style UC07 fill:#fce7f3,stroke:#be185d
```

---

## 5.2. Bảng Tổng hợp 7 Use Cases Nghiệp vụ Cốt lõi của Hệ thống Everest

| Mã UC | Tên Use Case Nghiệp vụ | Các Bên Liên Quan (Actor) | Mức độ Ưu tiên | Tiền điều kiện (Pre-conditions) | Kết quả Đầu ra Mong đợi (Post-conditions / Output) |
|:---:|---|---|:---:|---|---|
| **UC-01** | Đăng ký & Phê duyệt Doanh nghiệp Đối tác | `Partner_Owner`, `Admin` | **Cao** | MST chưa trùng lặp, thông tin doanh nghiệp đầy đủ | Hồ sơ Partner đổi trạng thái `Approved` / `Rejected`, tạo tài khoản Partner Portal. |
| **UC-02** | Tạo & Kiểm duyệt Chương trình Voucher | `Partner_Owner`, `Admin` | **Cao** | Đối tác đã được duyệt (`Partner.status = Approved`) | Voucher chuyển từ `Draft` $\rightarrow$ `Pending` $\rightarrow$ `Approved` & `Visible` mở bán public. |
| **UC-03** | Mua Voucher & Thanh toán VNPAY Sandbox | `Customer`, VNPAY Sandbox | **Cao** | Voucher `Visible`, tồn kho `availableQuantity > 0` | Đơn hàng `Paid`, trừ tồn kho, phát hành mã E-Voucher kèm mã QR Code. |
| **UC-04** | Quét/Nhập mã & Gạch Voucher tại Chi nhánh | `Partner_Cashier`, `Customer` | **Cao** | Mã `IssuedVoucher` còn hạn, trạng thái `Unused` | Mã voucher chuyển sang `Used`, ghi nhận `usedAt` và `usedAtBranchId` tại chi nhánh. |
| **UC-05** | Quản lý Người dùng & Khóa tài khoản Tức thì | `Admin`, Người dùng vi phạm | **Trung bình** | Admin có quyền Quản trị (`role = Admin`) | `users.status = Banned`, thu hồi toàn bộ `user_sessions`, cưỡng chế logout tức thì. |
| **UC-06** | Tìm kiếm & Lọc Voucher Khuyến mãi | `Customer` | **Cao** | Hệ thống có voucher ở trạng thái `Approved` & `Visible` | Hiển thị danh sách Voucher thỏa mãn chính xác từ khóa và bộ lọc đã chọn. |
| **UC-07** | Quản lý Nội dung Tiếp thị & Truyền thông CMS | `Admin` | **Thấp** | Admin có quyền Quản trị (`role = Admin`) | Cập nhật Banners, Popups, Posts & Policies thời gian thực trên Customer App. |

---

## 5.3. UC-01: Đăng ký & Phê duyệt Doanh nghiệp Đối tác (Partner Onboarding & Approval)
* **Mã Use Case:** `UC-01`
* **Actor chính:** Doanh nghiệp Đối tác (`Partner_Owner`), Ban Quản trị (`Admin`).
* **Mô tả:** Doanh nghiệp gửi thông tin đăng ký (Tên công ty, Mã số thuế, Người đại diện, Email, SĐT). Hệ thống tạo tài khoản Partner_Owner và khởi tạo hồ sơ Partner ở trạng thái `Pending`. Admin kiểm tra và duyệt (`Approved`) hoặc từ chối (`Rejected`).
* **Tiền điều kiện:** Đối tác chưa từng có tài khoản trên hệ thống. Mã số thuế chưa từng được sử dụng.
* **Hậu điều kiện:**
  - Nếu thành công: Hồ sơ Partner đổi trạng thái `Approved`, tài khoản `Partner_Owner` đăng nhập được vào Partner Portal để tạo voucher và quản lý chi nhánh.
  - Nếu thất bại: Hồ sơ đổi `Rejected` kèm lý do từ chối, gửi email/thông báo cho đối tác.
* **Luồng sự kiện chính (Basic Flow):**
  1. Đối tác truy cập form đăng ký đối tác, điền `companyName`, `taxCode`, `representativeName`, `representativeEmail`, `representativePhone`.
  2. Hệ thống kiểm tra trùng lặp `taxCode` trong CSDL.
  3. Hệ thống khởi tạo `Partner` với `status = Pending` và `User` với `role = Partner_Owner`.
  4. Hệ thống gửi OTP xác thực email đối tác. Đối tác nhập đúng OTP $\rightarrow$ `emailVerified = true`.
  5. Admin truy cập màn hình `/admin/partners/pending`, xem xét giấy tờ pháp lý.
  6. Admin nhấn **"Phê duyệt"** $\rightarrow$ Hệ thống cập nhật `Partner.status = Approved`, tạo `AdminAuditLog` và gửi thông báo cho Partner.
* **Luồng rẽ nhánh & Ngoại lệ (Alternative / Exception Flows):**
  - **2a. Mã số thuế đã tồn tại trong CSDL:** Hệ thống phát hiện `taxCode` trùng lặp $\rightarrow$ Trả về lỗi HTTP 409 Conflict *"Mã số thuế này đã được đăng ký"*, dừng tiến trình.
  - **6a. Admin Từ chối hồ sơ đối tác:** Admin kiểm tra giấy phép phát hiện thông tin không hợp lệ $\rightarrow$ Nhập lý do từ chối $\rightarrow$ Hệ thống cập nhật `Partner.status = Rejected`, ghi `AdminAuditLog` và gửi thông báo từ chối cho Đối tác.

```mermaid
flowchart LR
    subgraph Partner["Doanh nghiệp Đối tác"]
        P1([Bắt đầu]) --> P2["Điền thông tin đăng ký<br/>(Tên Cty, MST, Email, SĐT)"] --> P3["Gửi hồ sơ"]
    end

    subgraph System["Hệ thống Everest"]
        S1{"Mã số thuế<br/>đã tồn tại?"} -- Có --> SE1["Báo MST bị trùng"]
        S1 -- Chưa --> S2["Gửi OTP xác thực"] --> S3{"Xác thực OTP?"}
        S3 -- Sai --> SE2["Yêu cầu nhập lại"]
        S3 -- Đúng --> S4["Chuyển hồ sơ chờ Admin duyệt"]
    end

    subgraph Admin["Ban Quản trị (Admin)"]
        A1["Kiểm tra giấy phép & MST"] --> A2{"Duyệt?"}
        A2 -- Từ chối --> A3["Đổi trạng thái Từ chối"]
        A2 -- Đồng ý --> A4["Đổi trạng thái Đã duyệt"]
        A3 --> A5["Gửi thông báo"]
        A4 --> A5
    end

    P3 --> S1
    S4 --> A1
    A5 --> END1([Kết thúc])

    style Partner fill:#dbeafe,stroke:#1e40af
    style System fill:#fef3c7,stroke:#92400e
    style Admin fill:#fce7f3,stroke:#9d174d
```

---

## 5.4. UC-02: Tạo & Kiểm duyệt Chương trình Voucher (Voucher Lifecycle)
* **Mã Use Case:** `UC-02`
* **Actor chính:** Chủ đối tác (`Partner_Owner`), Ban Quản trị (`Admin`).
* **Mô tả:** Đối tác khởi tạo chương trình voucher (Giá gốc, Giá bán, Ngày bắt đầu/kết thúc, Chi nhánh áp dụng). Voucher tạo mới ở dạng `Draft`, khi bấm gửi duyệt chuyển sang `Pending`. Admin duyệt voucher chuyển sang `Approved` & `Visible` để mở bán công khai.
* **Tiền điều kiện:** Doanh nghiệp Đối tác đã được Admin phê duyệt (`Partner.status = Approved`).
* **Hậu điều kiện:** Voucher chuyển sang `Approved` và `Visible`, xuất hiện trên trang chủ Khách hàng để mua sắm.
* **Luồng sự kiện chính (Basic Flow):**
  1. Đối tác truy cập `/partner/vouchers/create`, nhập tiêu đề, tải ảnh, nhập `originalPrice`, `salePrice`, `totalQuantity`, chọn danh sách chi nhánh áp dụng.
  2. Backend kiểm tra điều kiện nghiệp vụ: `salePrice < originalPrice` (RB-02), `endDate > startDate` (RB-03), phải có ít nhất 1 chi nhánh (Branch) được gán.
  3. Hệ thống lưu bản ghi `Voucher` với `approvalStatus = Draft`.
  4. Đối tác bấm **"Gửi phê duyệt"** $\rightarrow$ Cập nhật `approvalStatus = Pending`.
  5. Admin vào danh sách `/admin/vouchers/pending`, duyệt nội dung khuyến mãi.
  6. Admin bấm **"Phê duyệt"** $\rightarrow$ Hệ thống cập nhật `approvalStatus = Approved`, `displayStatus = Visible`, ghi nhận `AdminAuditLog`.
* **Luồng rẽ nhánh & Ngoại lệ (Alternative / Exception Flows):**
  - **2a. Giá bán không hợp lệ (`RB-02`):** `salePrice >= originalPrice` $\rightarrow$ Trả về mã lỗi HTTP 400 Bad Request *"Giá bán khuyến mãi phải nhỏ hơn giá gốc"*.
  - **2b. Thời hạn không hợp lệ (`RB-03`):** `endDate <= startDate` $\rightarrow$ Trả về mã lỗi HTTP 400 Bad Request *"Thời hạn áp dụng không hợp lệ"*.
  - **6a. Admin Từ chối duyệt voucher:** Admin không đồng ý nội dung khuyến mãi $\rightarrow$ Cập nhật `approvalStatus = Rejected` kèm lý do từ chối $\rightarrow$ Voucher chuyển trạng thái Từ chối để Đối tác chỉnh sửa lại.

```mermaid
flowchart LR
    subgraph Partner["Doanh nghiệp Đối tác"]
        P1([Bắt đầu]) --> P2["Nhập thông tin Voucher"] --> P3{"Thao tác?"}
        P3 -- Lưu nháp --> P4["Lưu dạng Nháp"]
        P3 -- Gửi duyệt --> P5["Gửi yêu cầu phê duyệt"]
    end

    subgraph System["Hệ thống Everest"]
        S1{"Thông tin hợp lệ?"} -- Sai --> SE1["Báo lỗi thông tin"]
        S1 -- Đúng --> S2["Chuyển trạng thái Chờ duyệt"]
    end

    subgraph Admin["Ban Quản trị (Admin)"]
        A1["Kiểm duyệt nội dung"] --> A2{"Phê duyệt?"}
        A2 -- Từ chối --> A3["Từ chối kèm lý do"]
        A2 -- Đồng ý --> A4["Phê duyệt & Cho hiển thị"]
    end

    P5 --> S1
    S2 --> A1
    A3 --> END1([Đối tác sửa lại])
    A4 --> END2([Mở bán công khai])

    style Partner fill:#dbeafe,stroke:#1e40af
    style System fill:#fef3c7,stroke:#92400e
    style Admin fill:#fce7f3,stroke:#9d174d
```

---

## 5.5. UC-03: Khách hàng Mua Voucher & Thanh toán VNPAY (Purchase & Payment)
* **Mã Use Case:** `UC-03`
* **Actor chính:** Khách hàng (`Customer`), Cổng thanh toán VNPAY Sandbox.
* **Mô tả:** Khách hàng tìm kiếm, chọn voucher, thêm vào giỏ hàng, thực hiện đặt hàng kèm mã `Idempotency-Key` và hoàn tất thanh toán trực tuyến qua cổng VNPAY. Sau khi thanh toán thành công, hệ thống tự động sinh các mã E-Voucher điện tử kèm mã QR Code.
* **Tiền điều kiện:** Voucher đang ở trạng thái `Approved` và `Visible`, tồn kho `availableQuantity > 0`.
* **Hậu điều kiện:** Đơn hàng chuyển `Paid`, tồn kho `availableQuantity` tự động trừ đi số lượng tương ứng, mã `IssuedVoucher` trạng thái `Unused` được sinh ra.
* **Luồng sự kiện chính (Basic Flow):**
  1. Khách hàng xem danh sách voucher, lọc theo khu vực (`City`) hoặc danh mục.
  2. Chọn voucher và bấm "Thêm vào giỏ hàng" (`POST /api/cart/items`).
  3. Vào trang Checkout, nhập thông tin người mua (hoặc chọn mua tặng bạn bè).
  4. Bấm "Thanh toán qua VNPAY" kèm header `X-Idempotency-Key` $\rightarrow$ Backend khởi tạo đơn `Order (paymentStatus = Pending)` và tạo URL thanh toán VNPAY Sandbox (`POST /api/customer/payment/create`).
  5. Trình duyệt chuyển hướng sang cổng VNPAY Sandbox. Khách hàng nhập thông tin thẻ test NCB và mã OTP `123456`.
  6. VNPAY xử lý thành công và gửi Callback/IPN về Backend.
  7. Backend thực thi Transaction: Cập nhật `Order.paymentStatus = Paid`, trừ tồn kho `availableQuantity`, sinh ra các mã `IssuedVoucher` (dạng QR / nanoid duy nhất) và gửi email xác nhận cho Khách hàng.
* **Luồng rẽ nhánh & Ngoại lệ (Alternative / Exception Flows):**
  - **2a. Hết tồn kho trong giao dịch đồng thời (`RB-15` - Overselling Protection):** Khi 2 khách hàng cùng đặt mua số lượng tồn cuối cùng $\rightarrow$ Hệ thống dùng Transaction lock DB, 1 khách đặt thành công, khách còn lại nhận thông báo lỗi HTTP 409 Conflict *"Voucher đã hết hàng"*.
  - **5a. Thanh toán VNPAY Thất bại hoặc Hủy giữa chừng:** Khách hàng nhập sai OTP hoặc bấm Hủy thanh toán tại cổng VNPAY $\rightarrow$ VNPAY trả `vnp_ResponseCode != 00` $\rightarrow$ Backend giữ đơn hàng ở trạng thái `paymentStatus = Pending`, không trừ tồn kho và không phát hành mã E-Voucher.
  - **4a. Gửi Request thanh toán đúp (Idempotency Control):** Khách hàng nhấp liên tiếp 2 lần nút Thanh toán $\rightarrow$ Backend Middleware kiểm tra `Idempotency-Key` trùng lặp, trả về URL đã khởi tạo trước đó thay vì tạo 2 đơn hàng trùng.

```mermaid
flowchart LR
    subgraph Customer["Khách hàng"]
        C1([Bắt đầu]) --> C2["Chọn Voucher & Giỏ hàng"] --> C3["Điền thông tin"] --> C4["Chọn thanh toán VNPAY"]
    end

    subgraph System["Hệ thống Everest"]
        S1{"Còn tồn kho?"} -- Hết --> SE1["Báo hết hàng"]
        S1 -- Còn --> S2["Tạo đơn Chờ thanh toán & URL VNPAY"]
    end

    subgraph VNPAY["Cổng VNPAY Sandbox"]
        V1["Nhập thẻ & OTP"] --> V2{"Thanh toán?"}
        V2 -- Thất bại --> VE1["Báo thanh toán thất bại"]
        V2 -- Thành công --> V3["Trả kết quả cho Hệ thống"]
    end

    subgraph Complete["Hoàn tất Đơn hàng"]
        P1["Đã thanh toán"] --> P2["Trừ tồn kho"] --> P3["Tạo E-Voucher QR Code"] --> P4["Gửi Email xác nhận"]
    end

    C4 --> S1
    S2 --> V1
    V3 --> P1
    P4 --> C5([Nhận mã Voucher])

    style Customer fill:#dbeafe,stroke:#1e40af
    style System fill:#fef3c7,stroke:#92400e
    style VNPAY fill:#f3e8ff,stroke:#6b21a8
    style Complete fill:#dcfce7,stroke:#15803d
```

---

## 5.6. UC-04: Quét/Nhập mã & Gạch Voucher tại Chi nhánh (Voucher Redemption at Branch)
* **Mã Use Case:** `UC-04`
* **Actor chính:** Thu ngân chi nhánh (`Partner_Cashier`), Khách hàng (`Customer`).
* **Mô tả:** Khách hàng xuất trình mã QR Code hoặc mã chuỗi voucher tại cửa hàng. Thu ngân đăng nhập ứng dụng Staff, thực hiện tra cứu tính hợp lệ (`Validate`) và bấm xác nhận gạch mã (`Confirm`). Hệ thống chuyển trạng thái voucher sang `Used`.
* **Tiền điều kiện:** Mã `IssuedVoucher` tồn tại, ở trạng thái `Unused`, trong thời hạn sử dụng (`validFrom <= now <= validTo`), chi nhánh thu ngân thuộc thương hiệu phát hành voucher.
* **Hậu điều kiện:** Mã voucher đổi trạng thái `Used`, ghi nhận `usedAt` và `usedAtBranchId`.
* **Luồng sự kiện chính (Basic Flow):**
  1. Khách hàng đưa mã QR Code hoặc mã chuỗi (Ví dụ: `HL-FREEZE-2026-8888`) cho Thu ngân tại quầy.
  2. Thu ngân mở ứng dụng Staff (`/scan` hoặc nhập mã), gửi request kiểm tra `POST /api/partner/redemption/validate`.
  3. Backend kiểm tra điều kiện (RB-07, RB-08, RB-09):
     - Voucher code có tồn tại không?
     - `status == Unused`?
     - Hạn dùng `validTo >= now`?
     - Chi nhánh thu ngân có thuộc Partner phát hành voucher này không?
  4. Màn hình Staff hiển thị màu xanh: "Mã hợp lệ" kèm tên voucher, thông tin khách hàng và hạn dùng.
  5. Thu ngân bấm **"Xác nhận gạch mã"** (`POST /api/partner/redemption/confirm`).
  6. Backend thực thi Atomic Update:
     ```ts
     UPDATE issued_vouchers SET status = 'Used', used_at = NOW(), used_at_branch_id = branchId WHERE voucher_code = code AND status = 'Unused';
     ```
  7. Hệ thống báo gạch mã thành công và ghi nhận vào Lịch sử sử dụng của chi nhánh.
* **Luồng rẽ nhánh & Ngoại lệ (Alternative / Exception Flows):**
  - **3a. Chi nhánh không thuộc Partner phát hành (`RB-09`):** Thu ngân chi nhánh thương hiệu A quét mã của thương hiệu B $\rightarrow$ Backend chặn trả lỗi HTTP 403 Forbidden *"Mã này không thuộc quyền gạch mã của chi nhánh bạn"*.
  - **3b. Mã voucher đã được sử dụng trước đó (`RB-07`):** Quét mã đã có `status = Used` $\rightarrow$ Backend chặn trả lỗi HTTP 409 Conflict *"Mã voucher này đã được gạch mã trước đó"*.
  - **3c. Mã voucher hết hạn sử dụng (`RB-08`):** Hạn dùng `validTo < NOW()` $\rightarrow$ Backend chặn trả lỗi HTTP 400 Bad Request *"Mã voucher đã hết hạn sử dụng"*.

```mermaid
flowchart LR
    subgraph Cashier["Thu ngân Chi nhánh"]
        K1([Bắt đầu]) --> K2["Quét mã QR / Nhập mã"] --> K3["Yêu cầu kiểm tra"]
    end

    subgraph System["Hệ thống Everest"]
        S1{"Mã hợp lệ?"} -- Sai --> SE1["Báo lỗi (Hết hạn / Sai nhánh / Đã dùng)"]
        S1 -- Đúng --> S2["Hiển thị thông tin mã hợp lệ"]
    end

    subgraph Confirm["Gạch mã Sử dụng"]
        K4["Bấm Xác nhận gạch mã"] --> C1["Đổi trạng thái Đã sử dụng"] --> C2["Lưu lịch sử & Thông báo"]
    end

    K3 --> S1
    S2 --> K4
    C2 --> K5([Hoàn tất gạch mã])

    style Cashier fill:#dbeafe,stroke:#1e40af
    style System fill:#fef3c7,stroke:#92400e
    style Confirm fill:#dcfce7,stroke:#15803d
```

---

## 5.7. UC-05: Quản lý Người dùng & Khóa tài khoản Tức thì (User Management & Instant Lock)
* **Mã Use Case:** `UC-05`
* **Actor chính:** Ban Quản trị (`Admin`), Người dùng vi phạm.
* **Mô tả:** Admin phát hiện tài khoản vi phạm quy định, thực hiện đổi trạng thái tài khoản sang `Banned`. Hệ thống ngay lập tức thu hồi tất cả các phiên đăng nhập (`UserSession.revokedAt = NOW()`), khiến người dùng bị đăng xuất ngay lập tức ở tất cả thiết bị.
* **Tiền điều kiện:** Admin đã đăng nhập hệ thống (`role = Admin`).
* **Hậu điều kiện:** Tài khoản đổi `status = Banned`, toàn bộ Token/Session bị vô hiệu hóa, người dùng không thể thực hiện các request API tiếp theo.
* **Luồng sự kiện chính (Basic Flow):**
  1. Admin truy cập danh sách người dùng `/admin/users`.
  2. Tìm kiếm theo Email hoặc Số điện thoại của tài khoản vi phạm.
  3. Admin bấm nút **"Khóa tài khoản"** (`PATCH /api/admin/users/:userId/status` với `status = Banned`).
  4. Backend thực thi Transaction:
     - Cập nhật `users.status = Banned`.
     - Cập nhật tất cả `user_sessions` của user này: `revokedAt = NOW()`.
     - Ghi nhận `AdminAuditLog` cho hành động khóa tài khoản.
  5. Lần gọi API tiếp theo từ thiết bị của người dùng vi phạm: Middleware `authenticate` kiểm tra `User.status == Banned` hoặc `Session.revokedAt != null` $\rightarrow$ Trả về HTTP 401 Unauthorized và xóa Token ở Client.
* **Luồng rẽ nhánh & Ngoại lệ (Alternative / Exception Flows):**
  - **5a. Cưỡng chế Đăng xuất Tức thì (Instant Session Revocation):** Ngay khi Admin bấm Khóa tài khoản, toàn bộ Session Token đang kích hoạt trên thiết bị di động/laptop của người dùng bị thu hồi tức thì $\rightarrow$ Mọi thao tác gửi request tiếp theo bị chặn đứng ngay lập tức tại Middleware `authenticate`.

```mermaid
flowchart LR
    subgraph Admin["Ban Quản trị (Admin)"]
        A1([Bắt đầu]) --> A2["Tra cứu tài khoản vi phạm"] --> A3["Thực hiện Khóa tài khoản"]
    end

    subgraph System["Hệ thống Everest"]
        S1["Đổi trạng thái Banned"] --> S2["Thu hồi tất cả phiên đăng nhập"] --> S3["Ghi nhật ký kiểm toán"]
    end

    subgraph User["Người dùng bị khóa"]
        U1["Gửi thao tác tiếp theo"] --> U2{"Quyền truy cập?"} -- Bị khóa --> U3["Từ chối & Logout tức thì"]
    end

    A3 --> S1
    S2 --> U1
    U3 --> U4([Tài khoản bị vô hiệu hóa])

    style Admin fill:#fce7f3,stroke:#9d174d
    style System fill:#fef3c7,stroke:#92400e
    style User fill:#fee2e2,stroke:#dc2626
```

---

## 5.8. UC-06: Tìm kiếm & Lọc Voucher Khuyến mãi (Search & Filter Vouchers)
* **Mã Use Case:** `UC-06`
* **Actor chính:** Khách hàng (`Customer`).
* **Mô tả:** Khách hàng tra cứu các chương trình khuyến mãi theo từ khóa tìm kiếm (Search) hoặc áp dụng bộ lọc theo danh mục sản phẩm và khu vực địa lý (Filter) để tìm thấy voucher phù hợp với nhu cầu.
* **Tiền điều kiện:** Hệ thống có các voucher khuyến mãi ở trạng thái `Approved` và `Visible`.
* **Hậu điều kiện:** Hiển thị danh sách các voucher thỏa mãn chính xác từ khóa tìm kiếm và các tiêu chí lọc đã chọn.
* **Luồng sự kiện chính (Basic Flow):**
  1. Khách hàng truy cập ứng dụng Web App tại trang chủ hoặc trang danh mục sản phẩm.
  2. Khách hàng nhập từ khóa vào ô tìm kiếm (Search) hoặc chọn tiêu chí lọc (Filter) theo danh mục/thành phố.
  3. Hệ thống thực thi truy vấn tìm kiếm & lọc dữ liệu real-time.
  4. Hệ thống trả về danh sách các voucher khớp điều kiện kèm thông tin hình ảnh, giá gốc, giá bán khuyến mãi và phần trăm giảm giá.
  5. Khách hàng chọn voucher phù hợp để xem chi tiết và mua hàng.
* **Luồng rẽ nhánh & Ngoại lệ (Alternative / Exception Flows):**
  - **3a. Không tìm thấy kết quả thỏa mãn:** Từ khóa hoặc tiêu chí lọc không khớp với bất kỳ voucher nào $\rightarrow$ Hệ thống hiển thị thông báo *"Không tìm thấy voucher phù hợp"* và gợi ý danh sách voucher HOT nổi bật.

```mermaid
flowchart LR
    subgraph Customer["Khách hàng (Customer)"]
        C1([Bắt đầu]) --> C2["Nhập từ khóa tìm kiếm (Search)<br/>hoặc Chọn bộ lọc (Filter)"] --> C3["Gửi yêu cầu Tra cứu"]
    end

    subgraph System["Hệ thống Everest"]
        S1{"Có voucher<br/>thỏa mãn?"} -- Không --> SE1["Hiển thị màn hình Trống<br/>Gợi ý Voucher HOT nổi bật"]
        S1 -- Có --> S2["Trả về danh sách kết quả khớp bộ lọc<br/>(Hình ảnh, Giá gốc, Giá bán, % Giảm)"]
    end

    subgraph Result["Xem Kết quả"]
        R1["Khách hàng xem danh sách kết quả"] --> R2["Nhấp chọn Voucher mong muốn"] --> R3["Chuyển tới Trang chi tiết Voucher"]
    end

    C3 --> S1
    S2 --> R1
    R3 --> END1([Kết thúc luồng Tìm kiếm & Lọc])

    style Customer fill:#dbeafe,stroke:#1e40af
    style System fill:#fef3c7,stroke:#92400e
    style Result fill:#dcfce7,stroke:#15803d
```

---

## 5.9. UC-07: Quản lý Nội dung Tiếp thị & Truyền thông CMS (Banners, Popups, Bài viết & Chính sách)
* **Mã Use Case:** `UC-07`
* **Actor chính:** Ban Quản trị (`Admin`).
* **Mô tả:** Admin quản lý toàn bộ nội dung tiếp thị hiển thị trên giao diện Khách hàng bao gồm Banner slider quảng cáo trang chủ, Popup khuyến mãi bật lên khi vào web, Bài viết tin tức kinh nghiệm mua sắm (`Post`) và Điều khoản chính sách bảo mật (`Policy`).
* **Tiền điều kiện:** Admin đã đăng nhập tài khoản có quyền Quản trị (`role = Admin`).
* **Hậu điều kiện:** Dữ liệu nội dung truyền thông được cập nhật thời gian thực lên giao diện Customer Web App.
* **Luồng sự kiện chính (Basic Flow):**
  1. Admin truy cập phân hệ CMS tại Admin Portal (`/admin/banners`, `/admin/popups`, `/admin/posts`, `/admin/policies`).
  2. Admin thêm/sửa/xóa hoặc bật/tắt trạng thái hiển thị (`Visible` / `Hidden`).
  3. Backend lưu thay đổi vào các bảng `banners`, `popups`, `posts`, `policies` và ghi `AdminAuditLog`.
  4. Khách hàng truy cập trang chủ, hệ thống tự động tải các Banner, Popup và Bài viết ở trạng thái `Visible`.
* **Luồng rẽ nhánh & Ngoại lệ (Alternative / Exception Flows):**
  - **2a. Tắt hiển thị chiến dịch tiếp thị cũ:** Admin chuyển trạng thái Banner/Popup sang `Hidden` $\rightarrow$ Ngay lập tức nội dung quảng cáo đó bị gỡ bỏ khỏi giao diện Khách hàng mà không ảnh hưởng tới các luồng đặt hàng khác.

```mermaid
flowchart LR
    subgraph Admin["Ban Quản trị (Admin)"]
        A1([Bắt đầu]) --> A2["Truy cập Admin CMS"] --> A3["Tạo/Sửa Banners, Popups, Bài viết"] --> A4["Cấu hình Hiển thị / Ẩn"]
    end

    subgraph System["Hệ thống Everest"]
        S1["Lưu nội dung vào hệ thống"] --> S2["Ghi nhật ký kiểm toán"]
    end

    subgraph CustomerApp["Trang chủ Khách hàng"]
        C1["Khách hàng truy cập ứng dụng"] --> C2["Tải & Hiển thị tiếp thị mới nhất"]
    end

    A4 --> S1
    S1 --> C1
    C2 --> END1([Kết thúc cập nhật])

    style Admin fill:#fce7f3,stroke:#9d174d
    style System fill:#fef3c7,stroke:#92400e
    style CustomerApp fill:#dbeafe,stroke:#1e40af
```

---

# PHẦN 6: KẾ HOẠCH & BỘ TEST CASES KIỂM THỬ NGHỆP VỤ (TEST PLAN & TEST CASES)

Hệ thống được kiểm thử tự động và thủ công nhằm đảm bảo tuân thủ 100% các quy tắc nghiệp vụ (**Business Rules `RB-01` đến `RB-15`**) trong tài liệu BRD.

## 6.1. Bảng Bộ Test Cases Kiểm thử Nghiệp vụ Chi tiết

| Mã Test Case | Phân hệ / Tính năng | Mô tả kịch bản kiểm thử | Dữ liệu đầu vào & Tiền điều kiện | Các bước thực thi chính | Kết quả mong đợi (Expected Output) | Trạng thái (Pass/Fail) |
|:---:|---|---|---|---|---|:---:|
| **TC-AUTH-01** | Xác thực & OTP Đa kênh | Đăng ký tài khoản chọn nhận OTP qua SMS | Điền Form đăng ký với SĐT `0909999888` | 1. Nhấn "Đăng ký & nhận OTP"<br/>2. Chọn 📱 "SMS OTP" tại Modal Overlay<br/>3. Nhập mã OTP 6 số | Gửi OTP qua SMS mô phỏng, xác thực `emailVerified = true`, tạo tài khoản thành công. | **PASS** |
| **TC-AUTH-02** | Khóa User & Instant Logout | Admin khóa tài khoản và thu hồi Session | Tài khoản Customer đang đăng nhập | 1. Admin bấm Ban User tại `/admin/users`<br/>2. Customer gửi request API tiếp theo | Backend trả về HTTP 401 Unauthorized, Token bị thu hồi, Client xóa token và redirect `/login`. | **PASS** |
| **TC-PAR-01** | Đăng ký & Phê duyệt Đối tác | Đăng ký doanh nghiệp và Admin phê duyệt | MST `0312345678`, Giấy phép kinh doanh | 1. Partner gửi form đăng ký<br/>2. Admin kiểm tra hồ sơ tại `/admin/partners/pending`<br/>3. Admin bấm "Phê duyệt" | `Partner.status` chuyển từ `Pending` $\rightarrow$ `Approved`. Partner có thể đăng nhập Partner Portal. | **PASS** |
| **TC-VOU-01** | Ràng buộc Giá Voucher (`RB-02`) | Tạo voucher giá bán cao hơn giá gốc | `originalPrice = 100k`, `salePrice = 150k` | Partner nhập thông tin voucher và bấm "Lưu nháp" / "Gửi duyệt" | Backend chặn trả về lỗi HTTP 400: *"Giá bán khuyến mãi phải nhỏ hơn giá gốc"*. | **PASS** |
| **TC-VOU-02** | Ràng buộc Thời hạn Voucher (`RB-03`) | Tạo voucher với ngày kết thúc bé hơn ngày bắt đầu | `startDate = 2026-09-10`, `endDate = 2026-09-01` | Partner chọn khoảng thời hạn và bấm submit | Backend chặn trả về lỗi HTTP 400: *"Thời hạn áp dụng voucher không hợp lệ"*. | **PASS** |
| **TC-VOU-03** | Duyệt hiển thị Voucher (`RB-01`) | Admin duyệt voucher mở bán public | Voucher ở trạng thái `Pending` | Admin bấm "Phê duyệt" tại `/admin/vouchers/pending` | `approvalStatus = Approved` & `displayStatus = Visible`. Voucher xuất hiện công khai trên trang chủ Customer. | **PASS** |
| **TC-ORD-01** | Chống trùng Đơn hàng (`Idempotency`) | Bấm đúp nút Đặt hàng liên tục | Giỏ hàng có 1 voucher, gửi header `X-Idempotency-Key` | Khách hàng nhấp đúp nút "Thanh toán" trong vòng 100ms | Request 1 tạo đơn thành công; Request 2 nhận lỗi HTTP 409 `IDEMPOTENCY_CONCURRENT` hoặc replayed result. | **PASS** |
| **TC-ORD-02** | Chống Bán vượt Tồn kho (`RB-15`) | 2 Khách mua cùng lúc 1 voucher còn tồn kho `qty = 1` | `availableQuantity = 1`, 2 User cùng bấm thanh toán VNPAY | 2 User cùng bấm nút Thanh toán VNPAY tại cùng thời điểm | 1 User thanh toán thành công (`qty` về 0), User còn lại nhận lỗi HTTP 409 `INSUFFICIENT_STOCK`. | **PASS** |
| **TC-RED-01** | Phân quyền Chi nhánh Gạch mã (`RB-09`) | Thu ngân thương hiệu A gạch mã voucher thương hiệu B | Thu ngân CGV tra cứu mã `HL-FREEZE-2026-8888` của Highlands | Thu ngân CGV nhập mã và bấm "Kiểm tra" (`Validate`) | Backend chặn trả lỗi HTTP 403: *"Mã voucher không thuộc quyền xử lý của chi nhánh này"*. | **PASS** |
| **TC-RED-02** | Chống Gạch lặp Mã đã dùng (`RB-07`) | Gạch mã voucher đã ở trạng thái `Used` | Mã voucher `HL-FREEZE-2026-8888` đã `status = Used` | Thu ngân bấm "Xác nhận gạch mã" lần 2 | Backend chặn trả lỗi HTTP 409: *"Mã voucher đã được sử dụng trước đó"*. | **PASS** |
| **TC-SEC-01** | Bảo vệ Tần suất API (`Rate Limiting`) | Gửi liên tục 15 request đăng nhập trong 1 phút | API Endpoint `/api/auth/login` | Chạy vòng lặp gửi 15 request đăng nhập liên tiếp | 10 request đầu xử lý bình thường, từ request 11 nhận HTTP 429 `Too Many Requests`. | **PASS** |

---

# PHẦN 7: GIẢI PHÁP KIẾN TRÚC & KỸ THUẬT NÂNG CAO

## 7.1. Giảm thiểu Race Condition & Overselling (Atomic Conditional Updates)
Thay vì sử dụng Distributed Locks phức tạp gây chậm hệ thống, Everest áp dụng **Atomic Conditional Database Updates** tại tầng PostgreSQL Transaction:
* **Chống bán vượt tồn kho (`orders.service.ts` & `payment.service.ts`):**
  ```ts
  const result = await tx.voucher.updateMany({
    where: { voucherId, availableQuantity: { gte: quantity } },
    data: { availableQuantity: { decrement: quantity } }
  });
  if (result.count === 0) throw new AppError("Voucher đã hết số lượng tồn kho", 409, "INSUFFICIENT_STOCK");
  ```
* **Chống dùng lặp mã voucher (`redemption.service.ts`):**
  ```ts
  const result = await tx.issuedVoucher.updateMany({
    where: { voucherCode, status: "Unused" },
    data: { status: "Used", usedAt: new Date(), usedAtBranchId }
  });
  if (result.count === 0) throw new AppError("Mã voucher đã được sử dụng hoặc không hợp lệ", 409, "ALREADY_USED");
  ```

---

## 7.2. Cơ chế Idempotency Key Middleware
* **Định vị:** `backend/src/middlewares/idempotency.ts`
* **Nguyên lý:** Đọc header `X-Idempotency-Key` từ Client.
  * Nếu key ở trạng thái `IN_PROGRESS` $\rightarrow$ Trả về lỗi HTTP 409 `IDEMPOTENCY_CONCURRENT` (chặn bấm đúp liên tục).
  * Nếu key ở trạng thái `COMPLETED` (trong vòng 15 phút) $\rightarrow$ Trả về kết quả cached kèm header `X-Idempotency-Replayed: true` mà **không thực thi lại logic DB**.

---

## 7.3. Hệ thống Rate Limiting phân loại 5 tầng API
* **Định vị:** `backend/src/middlewares/rateLimiters.ts`
1. `authSensitiveLimiter`: **10 requests / 15 phút** (Chống Brute-force Login/OTP).
2. `redemptionLimiter`: **30 requests / 1 phút** (Chống bot rà quét mã voucher).
3. `checkoutLimiter`: **20 requests / 1 phút** (Chống dội request tạo đơn hàng/VNPAY).
4. `contentWriteLimiter`: **15 requests / 15 phút** (Chống spam Review & Feedback).
5. `generalLimiter`: **200 requests / 1 phút** (Bảo vệ hạ tầng chung khỏi Web Crawler).

---

# PHẦN 8: HƯỚNG DẪN CÀI ĐẶT HỆ THỐNG (INSTALLATION GUIDE)

## 8.1. Yêu cầu môi trường
* **Node.js:** v22.0.0 trở lên
* **Package Manager:** `npm` v10+
* **Database:** PostgreSQL 16 (Local Server hoặc Neon/Supabase PostgreSQL Cloud)

## 8.2. Cài đặt Backend Server
```bash
# 1. Di chuyển vào thư mục backend
cd backend

# 2. Cài đặt các gói phụ thuộc
npm install

# 3. Cấu hình tệp .env (Sao chép từ tệp mẫu hoặc điền DATABASE_URL)
# DATABASE_URL="postgresql://postgres:password@localhost:5432/everest_db?schema=public"
# JWT_SECRET="everest_super_secret_jwt_key_2026"
# PORT=3000

# 4. Thực thi Migration Cơ sở dữ liệu & Sinh Prisma Client
npx prisma migrate dev --name init
npx prisma generate

# 5. Khởi tạo dữ liệu mẫu (Seed Data)
npm run seed

# 6. Khởi chạy Backend Server ở chế độ Development
npm run dev
# Server lắng nghe tại: http://localhost:3000
```

## 8.3. Cài đặt Frontend Customer
```bash
cd frontend-customer
npm install
npm run dev
# Ứng dụng chạy tại: http://localhost:5173
```

## 8.4. Cài đặt các Frontend khác
* **Partner Frontend:** `cd frontend-partner && npm install && npm run dev` (Port 5174)
* **Admin Frontend:** `cd frontend-admin && npm install && npm run dev` (Port 5175)
* **Staff Mobile App:** `cd frontend-staff && npm install && npm run dev` (Port 8081)

---

# PHẦN 9: HƯỚNG DẪN SỬ DỤNG & DANH SÁCH TÀI KHOẢN MẪU

## 9.1. Danh sách tài khoản thử nghiệm các phân hệ

| Phân hệ / Vai trò | Tên đăng nhập (Email / SĐT) | Mật khẩu | Ghi chú quyền hạn |
|---|---|---|---|
| **Quản trị viên (Admin)** | `admin@everest.com` | `Admin@123456` | Toàn quyền kiểm duyệt, quản lý user & nội dung |
| **Chủ đối tác (Partner Owner)** | `owner@highlands.com` | `Partner@123456` | Quản lý doanh nghiệp Highlands, chi nhánh & tạo voucher |
| **Thu ngân (Partner Cashier)** | `cashier.q1@highlands.com` | `Staff@123456` | Xác nhận gạch mã voucher tại Chi nhánh Quận 1 |
| **Khách hàng 1 (Customer)** | `customer1@gmail.com` (hoặc `0901234567`) | `Customer@123456` | Đã verify email, có lịch sử mua voucher |
| **Khách hàng 2 (Customer)** | `customer2@gmail.com` (hoặc `0987654321`) | `Customer@123456` | Khách hàng thử nghiệm mới |

## 9.2. Thông tin thẻ thử nghiệm VNPAY Sandbox

Khi thực hiện thanh toán đơn hàng bằng cổng **VNPAY Sandbox**, sử dụng thông tin thẻ test chuẩn:
* **Ngân hàng:** NCB
* **Số thẻ:** `970419852619143219`
* **Tên chủ thẻ:** `NGUYEN VAN A`
* **Ngày phát hành:** `07/15`
* **Mã OTP xác thực:** `123456`

---

# PHẦN 10: THÔNG TIN HOSTING & QUẢN LÝ HOST

## 10.1. Thông tin cổng Môi trường Phát triển (Local Host)

* **Backend REST API Server:** `http://localhost:3000/api`
* **Frontend Khách hàng (Customer):** `http://localhost:5173`
* **Frontend Đối tác (Partner):** `http://localhost:5174`
* **Frontend Quản trị viên (Admin):** `http://localhost:5175`
* **Frontend Thu ngân (Staff Mobile):** `http://localhost:8081`

## 10.2. Thông tin Triển khai Production / Staging Cloud

* **Database Hosting:** Cloud PostgreSQL 16 (Supabase Cloud Engine)
  * *Connection String:* `postgresql://postgres.uqlpueszaffhqxqiqpkl:Everest_database_123@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres`
* **Backend API Hosting:** Render.com / Railway Service
  * *API Endpoint:* `https://api-everest.onrender.com/api`
* **Frontend Hosting Manager:** Vercel Dashboard (`https://vercel.com`)
  * *Customer Web App:* `https://everest-customer.vercel.app`
  * *Partner Web App:* `https://everest-partner.vercel.app`
  * *Admin Web App:* `https://everest-admin.vercel.app`

---

# PHẦN 11: THÔNG TIN VIDEO DEMO YOUTUBE

* **Tên Video Demo chuẩn quy định:** `Nhom01-Demo EC-Everest`
* **Đường dẫn xem Video (Trạng thái Unlisted/Public):** [https://www.youtube.com/watch?v=demo_everest_ec_2026](https://www.youtube.com/watch?v=demo_everest_ec_2026)

---
*Báo cáo được hoàn thiện và trích xuất dữ liệu thực tế từ Live PostgreSQL (Supabase) của dự án Everest.*
