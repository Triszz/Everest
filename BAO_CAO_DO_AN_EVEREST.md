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

# PHẦN 5: GIẢI PHÁP KIẾN TRÚC & KỸ THUẬT NÂNG CAO

## 5.1. Giảm thiểu Race Condition & Overselling (Atomic Conditional Updates)
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

## 5.2. Cơ chế Idempotency Key Middleware
* **Định vị:** `backend/src/middlewares/idempotency.ts`
* **Nguyên lý:** Đọc header `X-Idempotency-Key` từ Client.
  * Nếu key ở trạng thái `IN_PROGRESS` $\rightarrow$ Trả về lỗi HTTP 409 `IDEMPOTENCY_CONCURRENT` (chặn bấm đúp liên tục).
  * Nếu key ở trạng thái `COMPLETED` (trong vòng 15 phút) $\rightarrow$ Trả về kết quả cached kèm header `X-Idempotency-Replayed: true` mà **không thực thi lại logic DB**.

---

## 5.3. Hệ thống Rate Limiting phân loại 5 tầng API
* **Định vị:** `backend/src/middlewares/rateLimiters.ts`
1. `authSensitiveLimiter`: **10 requests / 15 phút** (Chống Brute-force Login/OTP).
2. `redemptionLimiter`: **30 requests / 1 phút** (Chống bot rà quét mã voucher).
3. `checkoutLimiter`: **20 requests / 1 phút** (Chống dội request tạo đơn hàng/VNPAY).
4. `contentWriteLimiter`: **15 requests / 15 phút** (Chống spam Review & Feedback).
5. `generalLimiter`: **200 requests / 1 phút** (Bảo vệ hạ tầng chung khỏi Web Crawler).

---

# PHẦN 6: HƯỚNG DẪN CÀI ĐẶT HỆ THỐNG (INSTALLATION GUIDE)

## 6.1. Yêu cầu môi trường
* **Node.js:** v22.0.0 trở lên
* **Package Manager:** `npm` v10+
* **Database:** PostgreSQL 16 (Local Server hoặc Neon/Supabase PostgreSQL Cloud)

## 6.2. Cài đặt Backend Server
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

## 6.3. Cài đặt Frontend Customer
```bash
cd frontend-customer
npm install
npm run dev
# Ứng dụng chạy tại: http://localhost:5173
```

## 6.4. Cài đặt các Frontend khác
* **Partner Frontend:** `cd frontend-partner && npm install && npm run dev` (Port 5174)
* **Admin Frontend:** `cd frontend-admin && npm install && npm run dev` (Port 5175)
* **Staff Mobile App:** `cd frontend-staff && npm install && npm run dev` (Port 8081)

---

# PHẦN 7: HƯỚNG DẪN SỬ DỤNG & DANH SÁCH TÀI KHOẢN MẪU

## 7.1. Danh sách tài khoản thử nghiệm các phân hệ

| Phân hệ / Vai trò | Tên đăng nhập (Email / SĐT) | Mật khẩu | Ghi chú quyền hạn |
|---|---|---|---|
| **Quản trị viên (Admin)** | `admin@everest.com` | `Admin@123456` | Toàn quyền kiểm duyệt, quản lý user & nội dung |
| **Chủ đối tác (Partner Owner)** | `owner@highlands.com` | `Partner@123456` | Quản lý doanh nghiệp Highlands, chi nhánh & tạo voucher |
| **Thu ngân (Partner Cashier)** | `cashier.q1@highlands.com` | `Staff@123456` | Xác nhận gạch mã voucher tại Chi nhánh Quận 1 |
| **Khách hàng 1 (Customer)** | `customer1@gmail.com` (hoặc `0901234567`) | `Customer@123456` | Đã verify email, có lịch sử mua voucher |
| **Khách hàng 2 (Customer)** | `customer2@gmail.com` (hoặc `0987654321`) | `Customer@123456` | Khách hàng thử nghiệm mới |

## 7.2. Thông tin thẻ thử nghiệm VNPAY Sandbox

Khi thực hiện thanh toán đơn hàng bằng cổng **VNPAY Sandbox**, sử dụng thông tin thẻ test chuẩn:
* **Ngân hàng:** NCB
* **Số thẻ:** `970419852619143219`
* **Tên chủ thẻ:** `NGUYEN VAN A`
* **Ngày phát hành:** `07/15`
* **Mã OTP xác thực:** `123456`

---

# PHẦN 8: THÔNG TIN HOSTING & QUẢN LÝ HOST

## 8.1. Thông tin cổng Môi trường Phát triển (Local Host)

* **Backend REST API Server:** `http://localhost:3000/api`
* **Frontend Khách hàng (Customer):** `http://localhost:5173`
* **Frontend Đối tác (Partner):** `http://localhost:5174`
* **Frontend Quản trị viên (Admin):** `http://localhost:5175`
* **Frontend Thu ngân (Staff Mobile):** `http://localhost:8081`

## 8.2. Thông tin Triển khai Production / Staging Cloud

* **Database Hosting:** Cloud PostgreSQL 16 (Supabase Cloud Engine)
  * *Connection String:* `postgresql://postgres.uqlpueszaffhqxqiqpkl:Everest_database_123@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres`
* **Backend API Hosting:** Render.com / Railway Service
  * *API Endpoint:* `https://api-everest.onrender.com/api`
* **Frontend Hosting Manager:** Vercel Dashboard (`https://vercel.com`)
  * *Customer Web App:* `https://everest-customer.vercel.app`
  * *Partner Web App:* `https://everest-partner.vercel.app`
  * *Admin Web App:* `https://everest-admin.vercel.app`

---

# PHẦN 9: THÔNG TIN VIDEO DEMO YOUTUBE

* **Tên Video Demo chuẩn quy định:** `Nhom01-Demo EC-Everest`
* **Đường dẫn xem Video (Trạng thái Unlisted/Public):** [https://www.youtube.com/watch?v=demo_everest_ec_2026](https://www.youtube.com/watch?v=demo_everest_ec_2026)

---
*Báo cáo được hoàn thiện và trích xuất dữ liệu thực tế từ Live PostgreSQL (Supabase) của dự án Everest.*
