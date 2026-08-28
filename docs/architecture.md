# Everest - Voucher E-Commerce Platform Architecture

## 1. Tổng Quan Dự Án

**Everest** là nền tảng thương mại điện tử bán voucher (phiếu mua hàng) với kiến trúc multi-frontend, hỗ trợ:
- Khách hàng mua voucher
- Đối tác (partner) quản lý voucher và chi nhánh
- Quản trị viên quản lý toàn bộ hệ thống
- Nhân viên cửa hàng đối tác quét và đổi voucher

---

## 2. Technology Stack

### 2.1 Backend

| Component | Technology | Version |
|-----------|------------|---------|
| Runtime | Node.js | - |
| Language | TypeScript | - |
| Framework | Express.js | ^5.0.0 |
| ORM | Prisma | ^7.0.0 |
| Database | PostgreSQL | - |
| Authentication | JWT + bcrypt | - |
| Validation | Zod | ^4.0.0 |
| Security | Helmet, CORS, express-rate-limit | - |
| Payments | VNPay | - |
| Email | Nodemailer (OTP) | - |
| Logging | Morgan | - |
| Utilities | nanoid | - |

### 2.2 Frontend Applications

| App | Framework | Build Tool | Purpose |
|-----|-----------|------------|---------|
| `frontend-customer` | React 19 + React Router 7 | Vite 8.x | Cửa hàng web cho khách hàng |
| `frontend-admin` | React 19 + React Router 7 | Vite 8.x | Dashboard quản trị |
| `frontend-partner` | React 19 + React Router 7 | Vite 8.x | Cổng quản lý đối tác |
| `frontend-staff` | React Native (Expo 54) | Metro | Ứng dụng di động cho nhân viên |

### 2.3 UI/Styling

- **TailwindCSS 4.x** - Styling cho web apps
- **Recharts** - Data visualization
- **Lucide React** - Icons
- **React Quill** - Rich text editor (admin)

---

## 3. Directory Structure

```
D:/EC/Everest/
├── backend/                        # Node.js/Express API Server
│   ├── src/
│   │   ├── app.ts                 # Main Express app entry
│   │   ├── config/                # Configuration (VNPay, etc.)
│   │   ├── middlewares/           # Auth, role guard, rate limiters, error handler
│   │   ├── modules/
│   │   │   ├── auth/             # Authentication
│   │   │   ├── admin/            # Admin CRUD operations
│   │   │   ├── partners/         # Partner management
│   │   │   │   ├── vouchers/     # Partner voucher management
│   │   │   │   ├── redemption/   # Voucher validation/redemption
│   │   │   │   └── dashboard/    # Partner dashboard stats
│   │   │   └── customer/         # Customer-facing modules
│   │   │       ├── vouchers/     # Browse vouchers
│   │   │       ├── categories/   # Category listing
│   │   │       ├── banners/      # Banner management
│   │   │       ├── popups/       # Popup management
│   │   │       ├── posts/        # Blog posts
│   │   │       ├── cart/         # Shopping cart
│   │   │       ├── orders/       # Order processing
│   │   │       ├── payment/       # VNPay integration
│   │   │       ├── issued-vouchers/ # Purchased voucher codes
│   │   │       ├── reviews/       # Product reviews
│   │   │       ├── profile/      # Customer profile
│   │   │       ├── notifications/ # Push notifications
│   │   │       └── feedback/     # Customer feedback
│   │   └── shared/               # Shared types, utilities, constants
│   └── prisma/
│       ├── schema.prisma          # Database schema
│       ├── migrations/            # Database migrations
│       ├── seed.ts               # Database seeder
│       └── seed_vouchers.ts      # Voucher seeder
│
├── frontend-customer/             # Customer web application
│   ├── src/
│   │   ├── components/           # Shared UI components
│   │   ├── pages/               # Page components
│   │   ├── services/            # API services
│   │   ├── hooks/               # Custom React hooks
│   │   └── utils/               # Utilities
│   └── vite.config.ts
│
├── frontend-admin/               # Admin dashboard application
│   ├── src/
│   │   ├── components/           # Layout, guards, shared components
│   │   ├── pages/               # Dashboard, Users, Partners, Orders, etc.
│   │   ├── hooks/               # Data fetching hooks
│   │   ├── services/            # API services
│   │   ├── context/             # Auth context
│   │   └── types/               # TypeScript types
│   └── vite.config.ts
│
├── frontend-partner/             # Partner business portal
│   ├── src/
│   │   ├── components/           # Voucher forms, reports, branch management
│   │   ├── pages/               # Vouchers, Branches, Reports, Settings
│   │   ├── hooks/               # Custom hooks
│   │   ├── services/            # API services
│   │   └── context/             # Auth context
│   └── vite.config.ts
│
├── frontend-staff/              # Mobile app for store staff
│   ├── app/                     # Expo Router file-based routing
│   │   ├── (auth)/              # Login, forgot password
│   │   ├── (app)/               # Protected app screens
│   │   │   ├── home.tsx         # Dashboard
│   │   │   ├── scan.tsx         # QR scanner
│   │   │   ├── voucher/[id].tsx # Voucher details
│   │   │   └── history.tsx      # Redemption history
│   │   └── _layout.tsx          # Root layout
│   ├── src/
│   │   ├── api/                 # HTTP client
│   │   ├── components/          # UI components
│   │   ├── hooks/               # Custom hooks
│   │   ├── services/            # API services
│   │   └── utils/               # QR parsing, network utils
│   └── app.json                # Expo configuration
│
└── docs/
    └── architecture.md          # Architecture documentation
```

---

## 4. Database Schema (Prisma)

### 4.1 Core Entities

```
User                    # Tài khoản người dùng (Admin, Customer, Partner_Owner, Partner_Cashier)
Partner                 # Đối tác kinh doanh (merchant)
Branch                  # Chi nhánh của đối tác
Category                # Danh mục voucher
Voucher                 # Sản phẩm voucher
VoucherBranch           # Mapping voucher - chi nhánh (many-to-many)
CartItem                # Giỏ hàng của khách
Order                   # Đơn hàng
OrderItem               # Item trong đơn hàng
IssuedVoucher           # Mã voucher đã mua (có tracking trạng thái)
Review                  # Đánh giá từ khách hàng
Feedback                # Phiếu hỗ trợ khách hàng
Banner                  # Banner quảng cáo
Popup                   # Popup thông báo
Post                    # Bài viết blog
Policy                  # Chính sách
Notification            # Thông báo trong app
UserSession             # JWT session tracking
AdminAuditLog           # Audit trail cho admin
```

### 4.2 Enums

- `UserRole` - ADMIN, CUSTOMER, PARTNER_OWNER, PARTNER_CASHIER
- `AccountStatus` - ACTIVE, INACTIVE, SUSPENDED, DELETED
- `PartnerStatus` - PENDING, APPROVED, REJECTED, SUSPENDED
- `VoucherApprovalStatus` - PENDING, APPROVED, REJECTED
- `PaymentStatus` - PENDING, PAID, FAILED, REFUNDED
- `VoucherUsageStatus` - ACTIVE, USED, EXPIRED, CANCELLED

---

## 5. API Structure

### 5.1 Authentication `/api/auth`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/login` | Đăng nhập |
| POST | `/register` | Đăng ký khách hàng |
| POST | `/register/partner` | Đăng ký đối tác |
| POST | `/refresh` | Refresh token |
| POST | `/email-otp/send` | Gửi OTP qua email |
| POST | `/email-otp/verify` | Xác thực OTP |
| POST | `/forgot-password` | Quên mật khẩu |
| PUT | `/reset-password` | Reset password với token |
| POST | `/reset-password-otp` | Reset password với OTP |
| GET | `/me` | Lấy thông tin user hiện tại |
| GET | `/sessions` | Danh sách sessions |
| DELETE | `/sessions/:id` | Xóa session |

### 5.2 Partner `/api/partner`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/profile` | Lấy thông tin partner |
| PUT | `/profile` | Cập nhật thông tin partner |
| GET | `/branches` | Danh sách chi nhánh |
| POST | `/branches` | Tạo chi nhánh |
| PUT | `/branches/:id` | Cập nhật chi nhánh |
| DELETE | `/branches/:id` | Xóa chi nhánh |
| GET | `/cashiers` | Danh sách thu ngân |
| POST | `/cashiers` | Tạo thu ngân |
| PUT | `/cashiers/:id` | Cập nhật thu ngân |
| DELETE | `/cashiers/:id` | Xóa thu ngân |
| GET | `/vouchers` | Danh sách voucher của partner |
| POST | `/vouchers` | Tạo voucher |
| PUT | `/vouchers/:id` | Cập nhật voucher |
| DELETE | `/vouchers/:id` | Xóa voucher |
| POST | `/redemption/validate` | Validate voucher code |
| POST | `/redemption/redeem` | Đổi voucher |
| GET | `/dashboard/stats` | Thống kê dashboard |
| GET | `/reports/*` | Báo cáo doanh thu |

### 5.3 Admin `/api/admin`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | Danh sách users |
| PUT | `/users/:id` | Cập nhật user |
| GET | `/partners` | Danh sách partners |
| PUT | `/partners/:id/approve` | Phê duyệt partner |
| PUT | `/partners/:id/reject` | Từ chối partner |
| GET | `/vouchers` | Danh sách vouchers |
| PUT | `/vouchers/:id/approve` | Phê duyệt voucher |
| PUT | `/vouchers/:id/reject` | Từ chối voucher |
| GET | `/orders` | Danh sách orders |
| PUT | `/orders/:id` | Cập nhật order |
| GET | `/categories` | Danh mục |
| POST | `/categories` | Tạo danh mục |
| GET | `/banners` | Banners |
| POST | `/banners` | Tạo banner |
| GET | `/popups` | Popups |
| POST | `/popups` | Tạo popup |
| GET | `/posts` | Bài viết |
| POST | `/posts` | Tạo bài viết |
| GET | `/policies` | Chính sách |
| POST | `/policies` | Tạo chính sách |
| GET | `/dashboard` | Admin dashboard |
| GET | `/audit-logs` | Audit logs |

### 5.4 Customer `/api/customer`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/profile` | Thông tin cá nhân |
| PUT | `/profile` | Cập nhật thông tin |
| GET | `/orders` | Lịch sử đơn hàng |
| GET | `/orders/:id` | Chi tiết đơn hàng |
| GET | `/issued-vouchers` | Danh sách voucher đã mua |
| GET | `/vouchers/:id` | Chi tiết voucher |
| POST | `/vouchers` | Tạo review |
| GET | `/notifications` | Thông báo |
| PUT | `/notifications/:id/read` | Đánh dấu đã đọc |

### 5.5 Public APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/vouchers` | Danh sách voucher (public) |
| GET | `/vouchers/:id` | Chi tiết voucher |
| GET | `/categories` | Danh mục |
| GET | `/banners` | Banners |
| GET | `/popups` | Popups |
| GET | `/posts` | Bài viết blog |
| GET | `/feedback` | Feedback form |
| POST | `/cart` | Thêm vào giỏ |
| GET | `/cart` | Xem giỏ hàng |
| PUT | `/cart/:id` | Cập nhật giỏ hàng |
| DELETE | `/cart/:id` | Xóa khỏi giỏ |
| POST | `/payment/create` | Tạo payment VNPay |
| GET | `/payment/return` | VNPay return URL |

---

## 5. Frontend Architecture

Chi tiết về kiến trúc frontend được mô tả trong file riêng: [Frontend Architecture](./frontend-architecture.md)

### 5.1 Overview

Hệ thống Everest bao gồm 4 ứng dụng frontend:

| Ứng dụng | Nền tảng | Framework | Mục đích |
|-----------|----------|-----------|----------|
| Customer Frontend | Web | React 19 + Vite | Cửa hàng trực tuyến cho khách hàng |
| Admin Frontend | Web | React 18 + Vite | Dashboard quản trị |
| Partner Frontend | Web | React + Vite | Cổng quản lý đối tác |
| Staff Mobile App | Mobile | React Native + Expo | Ứng dụng nhân viên cửa hàng |

### 5.2 Customer Module

Customer Module cung cấp các chức năng dành cho Customer. Customer có thể:

- Duyệt và tìm kiếm voucher
- Xem category
- Xem banner, popup và blog post
- Thêm voucher vào cart
- Checkout
- Thanh toán qua VNPay
- Xem lịch sử order
- Nhận voucher sau khi thanh toán
- Xem và sử dụng voucher
- Review voucher
- Quản lý profile
- Nhận notification
- Gửi feedback

### 5.3 Admin Frontend

Admin Frontend là dashboard quản trị dành cho Administrator.

### 5.4 Partner Frontend

Partner Portal là ứng dụng web dành cho Partner Owner.

**Các chức năng chính:**
- Quản lý thông tin partner
- Quản lý branches
- Quản lý cashiers
- Quản lý vouchers
- Theo dõi voucher approval
- Xem dashboard
- Xem reports

### 5.5 Staff Mobile App

Staff App được xây dựng bằng React Native và Expo 54. Ứng dụng sử dụng Expo Router với file-based routing.

**Staff App tập trung vào nghiệp vụ tại cửa hàng:**
- Nhân viên đăng nhập
- Quét QR code của voucher
- Hiển thị trạng thái của voucher
- Nhân viên xác nhận redemption
- Staff App hiển thị kết quả

---

## 6. User Roles & Permissions

| Role | Access |
|------|--------|
| **Customer** | Browse vouchers, cart, checkout, my vouchers, reviews, profile |
| **Partner_Owner** | Partner portal - manage branches, vouchers, view reports |
| **Partner_Cashier** | Staff app - scan vouchers, view redemption history, settings |
| **Admin** | Full dashboard - users, partners, vouchers, orders, content, audit logs |

---

## 7. Key Features

### 7.1 Voucher Marketplace
- Browse và search voucher theo danh mục
- Xem chi tiết voucher, hình ảnh, mô tả
- Đánh giá và review voucher

### 7.2 Shopping Flow
- Thêm voucher vào giỏ hàng
- Checkout với thanh toán VNPay
- Theo dõi trạng thái đơn hàng
- Nhận mã voucher (IssuedVoucher)

### 7.3 Partner Management
- Đăng ký và quản lý profile đối tác
- Tạo và quản lý chi nhánh
- Tạo và quản lý voucher
- Xem báo cáo doanh thu

### 7.4 Staff Mobile App
- Đăng nhập với tài khoản cashier
- Quét QR code voucher
- Validate và redeem voucher
- Xem lịch sử đổi voucher

### 7.5 Admin Dashboard
- Quản lý users, partners, vouchers
- Phê duyệt partners và vouchers
- Quản lý content (banners, popups, posts, policies)
- Xem audit logs
- Dashboard thống kê

### 7.6 Security Features
- JWT authentication với refresh tokens
- Session management (multi-device login)
- Role-based access control (RBAC)
- Rate limiting
- Audit logging cho admin actions

### 7.7 Payment Integration
- Tích hợp VNPay payment gateway
- Tạo payment URL
- Handle return URL từ VNPay
- Track payment status

### 7.8 Background Jobs
- Sweep expired unpaid orders (30 phút)

---

## 8. System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              CLIENTS                                      │
├──────────────────┬──────────────────┬──────────────────┬──────────────────┤
│  frontend-       │  frontend-      │  frontend-       │  frontend-       │
│  customer        │  admin          │  partner        │  staff           │
│  (React Web)     │  (React Web)    │  (React Web)    │  (React Native)  │
└────────┬─────────┴────────┬─────────┴────────┬─────────┴────────┬────────┘
         │                  │                  │                  │
         └──────────────────┴────────┬─────────┴──────────────────┘
                                    │
                           ┌────────▼────────┐
                           │   REST API      │
                           │   /api/*        │
                           │   (Express.js)  │
                           └────────┬────────┘
                                    │
         ┌───────────────────────────┼───────────────────────────┐
         │                           │                           │
┌────────▼────────┐        ┌────────▼────────┐        ┌────────▼────────┐
│   PostgreSQL    │        │   Background     │        │   External       │
│   (Prisma ORM)  │        │   Jobs          │        │   Services       │
│                 │        │   - Order       │        │   - VNPay        │
│                 │        │     Expiry      │        │   - Email (SMTP) │
└─────────────────┘        └──────────────────┘        └──────────────────┘
```

---

## 9. Data Flow Examples

### 9.1 Voucher Purchase Flow

```
Customer          Backend              VNPay           Database
   │                │                    │                │
   │── POST /cart ──►│                    │                │
   │                │── Create CartItem ──►                │
   │◄── CartItem ────│                    │                │
   │                │                    │                │
   │── POST /payment/create ──►│         │                │
   │                │── Create Order ────►                │
   │                │── Payment URL ────►                 │
   │◄── VNPay URL ──│                    │                │
   │                │                    │                │
   │────────── Redirect to VNPay ────────────────────────►│
   │                │                    │                │
   │◄────────── VNPay Return ─────────────────────────────│
   │                │                    │                │
   │── GET /payment/return ──►│         │                │
   │                │── Update Order ────►                 │
   │                │── Create IssuedVouchers ──►         │
   │◄── Success ────│                    │                │
```

### 9.2 Voucher Redemption Flow

```
Staff App         Backend              Partner         Database
   │                │                    │                │
   │── Scan QR ─────►│                    │                │
   │                │── Validate Code ──►│                │
   │◄── Voucher Info │                    │                │
   │                │                    │                │
   │── POST /redemption/redeem ──►│       │                │
   │                │── Check Valid ─────►│                │
   │                │── Update Status ───►│                │
   │◄── Success ────│                    │                │
```

---

## 10. Security Considerations

1. **Authentication**: JWT tokens với access/refresh token pattern
2. **Authorization**: Role-based middleware checking user roles
3. **Password Security**: bcrypt hashing với salt rounds
4. **Rate Limiting**: Per-IP và per-user rate limits
5. **Input Validation**: Zod schemas cho tất cả inputs
6. **CORS**: Configured allowed origins
7. **Helmet**: Security headers
8. **Session Management**: Track và revoke sessions

---

## 11. Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Environment Variables
```env
# Backend
DATABASE_URL=postgresql://...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
VNPAY_TMN_CODE=...
VNPAY_HASH_SECRET=...
VNPAY_URL=...
SMTP_HOST=...
SMTP_PORT=...
SMTP_USER=...
SMTP_PASS=...

# Frontends
VITE_API_URL=http://localhost:3000/api
```

### Running the Application
```bash
# Backend
cd backend
npm install
npx prisma migrate dev
npm run dev

# Frontends
cd frontend-customer
npm install
npm run dev
```
