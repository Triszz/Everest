# 5. Frontend Architecture

## 5.1 Tổng Quan

Hệ thống Everest bao gồm 4 ứng dụng frontend được xây dựng trên các nền tảng khác nhau:

| Ứng dụng | Nền tảng | Framework | Mục đích |
|-----------|----------|-----------|----------|
| Customer Frontend | Web | React 19 + Vite | Cửa hàng trực tuyến cho khách hàng |
| Admin Frontend | Web | React 18 + Vite | Dashboard quản trị |
| Partner Frontend | Web | React + Vite | Cổng quản lý đối tác |
| Staff Mobile App | Mobile | React Native + Expo | Ứng dụng nhân viên cửa hàng |

---

## 5.2 Common Architecture Patterns

### 5.2.1 API Layer Pattern

Tất cả frontend sử dụng pattern centralized API client:

```
┌─────────────────────────────────────────────┐
│              API Client                      │
├─────────────────────────────────────────────┤
│ • Automatic JWT token attachment            │
│ • 401 response → Auto token refresh         │
│ • Pending refresh queue (prevent duplicate)  │
│ • Error normalization                       │
│ • Custom ApiException class                 │
└─────────────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
   auth.service   voucher.service  order.service
   (login, etc)  (CRUD, etc)     (create, etc)
```

### 5.2.2 Authentication Flow

```
┌──────────┐    login()     ┌──────────┐    store     ┌──────────┐
│  Login   │ ────────────► │ API      │ ──────────► │localStore│
│  Form    │               │ Client   │              │ (tokens) │
└──────────┘               └──────────┘              └──────────┘
                                                            │
                               ┌────────────────────────────┘
                               │
                               ▼
┌──────────┐    auto-validate     ┌──────────┐
│  App     │ ◄────────────────── │ /auth/me │ (on app mount)
│          │                     └──────────┘
└──────────┘
```

### 5.2.3 State Management Pattern

```
┌─────────────────────────────────────────────────────────┐
│              Custom Hooks Pattern                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│   useVoucherManagement()  ──►  { data, loading, error } │
│   useOrderManagement()     ──►  { data, loading, error } │
│   usePartnerManagement()  ──►  { data, loading, error } │
│                                                          │
│   Features:                                             │
│   • Domain-specific logic encapsulation                  │
│   • Loading/error state management                       │
│   • Filters & pagination handling                        │
│   • No Redux/Zustand/Jotai                              │
└─────────────────────────────────────────────────────────┘
```

---

## 5.3 Customer Frontend

### 5.3.1 Overview

**Customer Web** là cửa hàng trực tuyến dành cho khách hàng mua voucher.

### 5.3.2 Technology Stack

| Component | Technology | Version |
|-----------|------------|---------|
| Framework | React | 19.2.6 |
| Build Tool | Vite | 8.0.12 |
| Language | TypeScript | ~6.0.2 |
| Routing | React Router DOM | 7.17.0 |
| Styling | Tailwind CSS | 4.3.1 |
| Icons | Lucide React | 1.20.0 |
| QR Code | qrcode | 1.5.4 |

### 5.3.3 Directory Structure

```
frontend-customer/
├── src/
│   ├── main.tsx                    # Entry point
│   ├── App.tsx                     # Root component + routing
│   ├── index.css                   # Global styles (Tailwind)
│   ├── assets/
│   │   └── images/                 # Static images
│   ├── components/                 # 13 reusable components
│   │   ├── Header.tsx              # Top navigation bar
│   │   ├── Footer.tsx             # Site footer
│   │   ├── Breadcrumb.tsx         # Navigation trail
│   │   ├── Hero.tsx               # Homepage hero section
│   │   ├── DanhMucNoiBat.tsx      # Featured categories
│   │   ├── FeaturedVouchers.tsx   # Featured vouchers
│   │   ├── Newsletter.tsx         # Email subscription
│   │   ├── PopupBanner.tsx        # Popup overlay
│   │   ├── Loading.tsx            # Loading spinner
│   │   ├── NotificationBell.tsx   # Notification icon
│   │   ├── PostDetail.tsx         # Blog post renderer
│   │   └── VoucherDetail.tsx       # Voucher detail view
│   ├── hooks/                     # Custom hooks (4)
│   │   ├── useAuth.ts             # Auth state & operations
│   │   ├── useDebounce.ts         # Debounce for search
│   │   ├── usePagination.ts       # Pagination state
│   │   ├── useLocalStorage.ts     # localStorage persistence
│   │   └── useActivePopup.ts      # Popup visibility
│   ├── pages/                     # 30 page components
│   │   ├── Home.tsx               # Homepage
│   │   ├── Login.tsx              # Customer login
│   │   ├── Register.tsx           # Customer registration
│   │   ├── VerifyEmail.tsx        # OTP verification
│   │   ├── ForgotPassword.tsx     # Password reset request
│   │   ├── ResetPassword.tsx      # Set new password
│   │   ├── LogoutSuccess.tsx      # Logout confirmation
│   │   ├── VoucherDetail.tsx      # Voucher detail page
│   │   ├── Vouchers.tsx           # All vouchers listing
│   │   ├── Category.tsx           # Vouchers by category
│   │   ├── Posts.tsx              # Blog posts listing
│   │   ├── PostDetail.tsx        # Individual post
│   │   ├── Cart.tsx               # Shopping cart
│   │   ├── MyVoucher.tsx         # Purchased vouchers
│   │   ├── Checkout.tsx           # Checkout flow
│   │   ├── PaymentReturn.tsx     # VNPay return handler
│   │   ├── OrderSuccess.tsx      # Order confirmation
│   │   ├── Orders.tsx             # Order history
│   │   ├── Profile.tsx            # User profile
│   │   ├── Settings.tsx           # Settings dashboard
│   │   ├── EditProfile.tsx        # Edit profile
│   │   ├── ChangePassword.tsx    # Change password
│   │   ├── Sessions.tsx          # Active sessions
│   │   ├── Notifications.tsx      # Notification center
│   │   ├── NotificationDetail.tsx # Single notification
│   │   ├── Feedback.tsx          # Contact form
│   │   ├── Help.tsx              # Help & support
│   │   ├── Terms.tsx             # Terms of service
│   │   └── Privacy.tsx           # Privacy policy
│   ├── services/                  # API modules (11)
│   │   ├── http.ts               # HTTP client + token management
│   │   ├── authApi.ts            # Authentication
│   │   ├── voucherApi.ts        # Voucher browsing
│   │   ├── categoryApi.ts        # Categories
│   │   ├── partnerApi.ts        # Partner info
│   │   ├── cartApi.ts           # Shopping cart
│   │   ├── orderApi.ts          # Orders
│   │   ├── paymentApi.ts        # VNPay integration
│   │   ├── profileApi.ts        # User profile
│   │   ├── reviewApi.ts         # Reviews
│   │   ├── contentApi.ts        # Banners, popups, posts
│   │   ├── feedbackApi.ts       # Contact feedback
│   │   └── notificationApi.ts   # Notifications
│   ├── types/                    # TypeScript types
│   └── utils/
│       ├── format.ts             # formatPrice, formatDate, etc.
│       └── constants.ts         # Filter options, provinces
```

### 5.3.4 Routes

```
/                                 → Home
/login                            → Login
/register                         → Register
/verify-email                    → VerifyEmail
/forgot-password                 → ForgotPassword
/reset-password                  → ResetPassword
/logout                          → LogoutSuccess
/voucher/:id                     → VoucherDetail
/vouchers                        → Vouchers (listing with filters)
/category/:id                    → Category (by category)
/posts                           → Posts (blog)
/posts/:id                       → PostDetail
/cart                            → Cart
/my-voucher                      → MyVoucher
/checkout                        → Checkout
/payment/return                  → PaymentReturn (VNPay)
/checkout/success                → OrderSuccess
/orders                          → Orders (history)
/profile                         → Profile
/settings                        → Settings
/settings/edit                  → EditProfile
/settings/change-password        → ChangePassword
/settings/sessions              → Sessions
/settings/notifications         → Notifications
/settings/security              → Security
/settings/help                  → Help
/feedback                        → Feedback
/notifications                   → NotificationCenter
/notifications/:id              → NotificationDetail
/terms                           → Terms
/privacy                         → Privacy
```

### 5.3.5 Customer Module Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Customer Shopping Flow                             │
└─────────────────────────────────────────────────────────────────────────┘

  ┌─────────┐     ┌──────────┐     ┌─────────┐     ┌──────────┐
  │  Home   │────►│ Vouchers │────►│ Voucher │────►│   Cart   │
  │  Page   │     │  List    │     │ Detail  │     │          │
  └─────────┘     └──────────┘     └─────────┘     └────┬─────┘
       │              │                  │                 │
       │              │                  │                 ▼
       │              │                  │           ┌─────────┐
       │              │                  │           │Checkout │
       │              │                  │           └────┬────┘
       │              │                  │                │
       ▼              ▼                  ▼                ▼
  ┌─────────┐  ┌──────────┐       ┌─────────┐    ┌──────────┐
  │Banner/  │  │Category/ │       │ Review  │    │  VNPay   │
  │Popup/   │  │ Search   │       │         │    │ Payment  │
  │Post     │  └──────────┘       └─────────┘    └────┬─────┘
  └─────────┘                                            │
       │                                                 ▼
       │                                           ┌──────────┐
       │                                           │ Payment  │
       │                                           │ Return   │
       │                                           └────┬─────┘
       │                                                │
       ▼                                                ▼
  ┌─────────────────────────────────────────────────────────────┐
  │                     My Vouchers                             │
  │   ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐      │
  │   │ ACTIVE  │  │  USED   │  │ EXPIRED │  │Review/  │      │
  │   │ Voucher │  │ Voucher │  │ Voucher │  │ Feedback│      │
  │   └─────────┘  └─────────┘  └─────────┘  └─────────┘      │
  └─────────────────────────────────────────────────────────────┘
```

### 5.3.6 HTTP Client Features

```typescript
// http.ts features
interface HttpClient {
  // Token Management
  getAccessToken(): string | null
  getRefreshToken(): string | null
  setTokens(access, refresh): void
  clearTokens(): void

  // Auto-refresh pattern
  isRefreshing: boolean           // Prevents duplicate refresh
  refreshSubscribers: Function[]   // Queue waiting for refresh

  // Request methods
  get<T>(url, config?): Promise<T>
  post<T>(url, data, config?): Promise<T>
  put<T>(url, data, config?): Promise<T>
  delete<T>(url, config?): Promise<T>
}
```

### 5.3.7 Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Customer Frontend                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌─────────────────────────────────────────────────────┐   │
│   │                   Layout                             │   │
│   │  ┌─────────────────────────────────────────────┐    │   │
│   │  │                   Header                     │    │   │
│   │  │  Logo │ Nav │ Search │ Cart │ Notif │ Auth │    │   │
│   │  └─────────────────────────────────────────────┘    │   │
│   │                                                      │   │
│   │  ┌─────────────────────────────────────────────┐    │   │
│   │  │                   Page                       │    │   │
│   │  │  (Home, Vouchers, Cart, Checkout, etc.)    │    │   │
│   │  │                                              │    │   │
│   │  │  ┌─────────┐ ┌─────────┐ ┌─────────┐       │    │   │
│   │  │  │Component│ │Component│ │Component│       │    │   │
│   │  │  └─────────┘ └─────────┘ └─────────┘       │    │   │
│   │  └─────────────────────────────────────────────┘    │   │
│   │                                                      │   │
│   │  ┌─────────────────────────────────────────────┐    │   │
│   │  │                   Footer                     │    │   │
│   │  └─────────────────────────────────────────────┘    │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 5.4 Admin Frontend

### 5.4.1 Overview

**Admin Frontend** là dashboard quản trị dành cho Administrator quản lý toàn bộ hệ thống.

### 5.4.2 Technology Stack

| Component | Technology | Version |
|-----------|------------|---------|
| Framework | React | 18 |
| Build Tool | Vite | - |
| Language | TypeScript | - |
| Routing | React Router | v6 |
| Styling | Inline CSS | Dark theme |
| Icons | Material Symbols | Outlined |

### 5.4.3 Directory Structure

```
frontend-admin/
├── src/
│   ├── main.tsx                     # Entry point
│   ├── App.tsx                      # Root + routing
│   ├── components/
│   │   ├── guards/
│   │   │   ├── GuestRoute.tsx      # Redirect logged-in
│   │   │   └── PrivateRoute.tsx    # Auth + role guard
│   │   ├── layout/
│   │   │   ├── AdminLayout.tsx     # Main layout
│   │   │   └── Sidebar.tsx         # Navigation sidebar
│   │   └── shared/
│   │       └── Toast.tsx            # Toast notifications
│   ├── context/
│   │   ├── AuthContext.tsx          # Auth state provider
│   │   └── useAuth.tsx             # Auth context hook
│   ├── hooks/                      # 12 domain hooks
│   │   ├── useAuditLog.ts
│   │   ├── useBannerManagement.ts
│   │   ├── useBranchManagement.ts
│   │   ├── useCategoryManagement.ts
│   │   ├── useIsMobile.ts
│   │   ├── useOrderManagement.ts
│   │   ├── usePartnerManagement.ts
│   │   ├── usePolicyManagement.ts
│   │   ├── usePopupManagement.ts
│   │   ├── usePostManagement.ts
│   │   ├── useUsersManagement.ts
│   │   └── useVoucherManagement.ts
│   ├── layout/
│   ├── pages/
│   │   ├── Dashboard.tsx            # KPI dashboard
│   │   ├── Login.tsx               # Auth page
│   │   ├── Users.tsx               # User management
│   │   ├── Partners.tsx            # Partner management
│   │   ├── Branches.tsx            # Branch management
│   │   ├── Vouchers.tsx            # Voucher management
│   │   ├── Orders.tsx             # Order listing
│   │   ├── OrderDetail.tsx        # Order details
│   │   ├── Content.tsx             # Content hub
│   │   ├── PostEditor.tsx         # Blog post editor
│   │   ├── PolicyEditor.tsx       # Policy editor
│   │   └── AuditLogs.tsx          # Audit log viewer
│   ├── services/
│   │   ├── api-client.ts           # HTTP client
│   │   ├── auth.service.ts         # Authentication
│   │   ├── admin.service.ts        # Admin APIs
│   │   └── audit.service.ts        # Audit logs
│   └── types/
│       ├── auth.ts                 # Auth types
│       └── audit.ts                # Audit types
```

### 5.4.4 Customer Module

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Customer Module                                  │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ Features:                                                                │
│ • Browse and search vouchers                                             │
│ • View categories                                                        │
│ • View banners, popups and blog posts                                    │
│ • Add vouchers to cart                                                  │
│ • Checkout                                                               │
│ • Pay via VNPay                                                          │
│ • View order history                                                    │
│ • Receive vouchers after payment                                        │
│ • View and use vouchers                                                 │
│ • Review vouchers                                                       │
│ • Manage profile                                                        │
│ • Receive notifications                                                  │
│ • Submit feedback                                                       │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ Components:                                                              │
│                                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │ VoucherCard │  │ CartItem   │  │ OrderCard  │  │ReviewForm  │     │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘     │
│                                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │ Banner     │  │ PopupModal  │  │ PostCard   │  │ProfileForm │     │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘     │
│                                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                      │
│  │ NotifItem  │  │FeedbackForm │  │ PaymentBtn  │                      │
│  └─────────────┘  └─────────────┘  └─────────────┘                      │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ State Management:                                                        │
│                                                                          │
│  useAuth           → Auth state, login, logout                          │
│  usePagination    → Pagination state                                    │
│  useDebounce      → Search debouncing                                   │
│  useLocalStorage  → Persistent storage                                  │
│  useActivePopup   → Popup visibility                                    │
└─────────────────────────────────────────────────────────────────────────┘
```

### 5.4.5 Routes

```
/                    → Dashboard
/login               → Login
/users              → Users (management)
/partners           → Partners (management)
/partners/:id/branches → Branches (per partner)
/branches           → Branches (all)
/vouchers           → Vouchers (management)
/orders             → Orders (listing)
/orders/:id         → OrderDetail
/content            → Content hub
/content/posts/new  → PostEditor (create)
/content/posts/:id  → PostEditor (edit)
/policies/create    → PolicyEditor (create)
/policies/:id       → PolicyEditor (edit)
/audit-logs         → AuditLogs
```

### 5.4.6 Admin Service API Structure

```typescript
// admin.service.ts - Namespace pattern
const adminService = {
  adminUsersApi: {
    list(params), getById(id), updateStatus(id, status), updateRole(id, role)
  },
  adminPartnersApi: {
    list(params), getById(id), approve(id), reject(id), toggleLock(id)
  },
  adminBranchesApi: {
    listAll(params), list(partnerId), getById(id), create(data),
    update(id, data), delete(id), toggleLock(id)
  },
  adminCategoriesApi: {
    list(params), getById(id), create(data), update(id, data), delete(id)
  },
  adminVouchersApi: {
    list(params), getStats(), setDisplayStatus(id, status),
    updateDates(id, dates), expireNow(id), approve(id), reject(id),
    toggleLock(id)
  },
  adminPoliciesApi: {
    list(params), getById(id), upsert(data), delete(id)
  },
  adminBannersApi: {
    list(params), getById(id), create(data), update(id, data),
    updateStatus(id, status), delete(id)
  },
  adminPopupsApi: {
    list(params), getById(id), create(data), update(id, data),
    updateStatus(id, status), delete(id)
  },
  adminPostsApi: {
    list(params), getById(id), create(data), update(id, data),
    updateStatus(id, status), delete(id)
  },
  adminOrdersApi: {
    list(params), getById(id), cancel(id), refund(id), markPaid(id)
  },
  adminDashboardApi: {
    get()
  }
}
```

---

## 5.5 Partner Frontend

### 5.5.1 Overview

**Partner Portal** là ứng dụng web dành cho Partner Owner quản lý voucher và chi nhánh.

### 5.5.2 Technology Stack

| Component | Technology |
|-----------|------------|
| Framework | React |
| Build Tool | Vite |
| Language | TypeScript |
| Routing | React Router |
| Styling | Inline CSS |
| Charts | Recharts |
| Icons | Lucide React |

### 5.5.3 Directory Structure

```
frontend-partner/
├── src/
│   ├── main.tsx                    # Entry point
│   ├── App.tsx                     # Root + routing
│   ├── config/
│   │   └── navigation.ts          # Nav items, role helpers
│   ├── context/
│   │   ├── AuthContext.tsx         # AuthProvider
│   │   └── useAuth.ts             # Auth hook
│   ├── components/
│   │   ├── Header.tsx              # Sticky header
│   │   ├── Footer.tsx              # Static footer
│   │   ├── guards/
│   │   │   ├── PrivateRoute.tsx    # Auth + role guard
│   │   │   └── GuestRoute.tsx
│   │   ├── common/
│   │   │   ├── ConfirmDialog.tsx   # Confirmation modal
│   │   │   └── EmptyState.tsx      # Empty/error placeholder
│   │   ├── branch/
│   │   │   ├── BranchForm.tsx      # Create/edit branch
│   │   │   └── CashierManagement.tsx # Cashier CRUD
│   │   ├── voucher/
│   │   │   └── VoucherForm.tsx     # Create/edit voucher
│   │   └── report/
│   │       ├── KPICard.tsx         # Metric card
│   │       ├── RevenueChart.tsx     # Line chart
│   │       ├── StatusDistChart.tsx  # Pie/donut chart
│   │       ├── VoucherPerfChart.tsx # Bar chart
│   │       ├── VoucherReportTable.tsx # Report table
│   │       ├── DateFilter.tsx       # Date range
│   │       └── report.skeleton.tsx  # Loading skeletons
│   ├── hooks/
│   │   ├── useReportKPIs.ts
│   │   ├── useRevenueChart.ts
│   │   ├── useStatusDistribution.ts
│   │   ├── useVoucherPerformance.ts
│   │   └── useVoucherTable.ts
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── RegisterSuccessPage.tsx
│   │   ├── ForgotPasswordPage.tsx
│   │   ├── ReportsPage.tsx         # Dashboard + charts
│   │   ├── VouchersPage.tsx        # Voucher list
│   │   ├── VoucherCreatePage.tsx
│   │   ├── VoucherDetailPage.tsx
│   │   ├── VoucherEditPage.tsx
│   │   ├── ValidatePage.tsx        # Voucher validation
│   │   ├── BranchesPage.tsx
│   │   ├── BranchCreatePage.tsx
│   │   ├── BranchDetailPage.tsx
│   │   ├── BranchEditPage.tsx
│   │   └── SettingsPage.tsx
│   ├── services/
│   │   ├── api-client.ts
│   │   ├── auth.service.ts
│   │   ├── voucher.service.ts
│   │   ├── branch.service.ts
│   │   ├── report.service.ts
│   │   ├── redemption.service.ts
│   │   ├── history.service.ts
│   │   ├── category.service.ts
│   │   └── partner-profile.service.ts
│   ├── types/
│   │   ├── auth.ts
│   │   ├── voucher.ts
│   │   ├── branch.ts
│   │   ├── report.ts
│   │   ├── redemption.ts
│   │   ├── history.ts
│   │   └── settings.ts
│   └── utils/
│       ├── searchParams.ts
│       └── voucherForm.ts
```

### 5.5.4 Features

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     Partner Portal Features                              │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ 1. Partner Profile Management                                           │
│    ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                  │
│    │ View Profile │  │ Edit Info   │  │ Change Pass │                  │
│    └─────────────┘  └─────────────┘  └─────────────┘                  │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ 2. Branch Management                                                    │
│    ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                  │
│    │ List Branches│  │Create Branch│  │ Edit Branch │                  │
│    └─────────────┘  └─────────────┘  └─────────────┘                  │
│    ┌─────────────────────────────────────────────────────┐             │
│    │ Cashier Management: Create / Assign / Reset Password│             │
│    └─────────────────────────────────────────────────────┘             │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ 3. Voucher Management                                                   │
│    ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                  │
│    │ List Vouchers│  │Create Voucher│ │ Edit Voucher│                  │
│    └─────────────┘  └─────────────┘  └─────────────┘                  │
│    ┌─────────────────────────────────────────────────────┐             │
│    │ Voucher Form: Basic Info, Pricing, Images, Dates,   │             │
│    │               Branch Selection (min 1 required)      │             │
│    └─────────────────────────────────────────────────────┘             │
│    ┌─────────────────────────────────────────────────────┐             │
│    │ Approval Status: Pending → Approved/Rejected        │             │
│    └─────────────────────────────────────────────────────┘             │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ 4. Dashboard & Reports                                                  │
│    ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                  │
│    │  KPI Cards  │  │  Revenue    │  │  Status     │                  │
│    │ Total,Used  │  │  Chart      │  │  Distribution│                  │
│    └─────────────┘  └─────────────┘  └─────────────┘                  │
│    ┌─────────────┐  ┌─────────────┐                                   │
│    │Voucher Perf │  │Voucher Table│                                   │
│    │  Bar Chart  │  │(sort/search)│                                   │
│    └─────────────┘  └─────────────┘                                   │
│    Date Filter: Today, 7d, 30d, 90d, This Year, Custom               │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ 5. Voucher Validation (Redemption)                                     │
│    ┌─────────────────────────────────────────────────────┐             │
│    │ Input voucher code → Validate → Confirm → Redeem   │             │
│    └─────────────────────────────────────────────────────┘             │
└─────────────────────────────────────────────────────────────────────────┘
```

### 5.5.5 Routes

```
/                         → RootRedirect (smart redirect)
/login                    → LoginPage
/register                 → RegisterPage
/register/success         → RegisterSuccessPage
/forgot-password          → ForgotPasswordPage
/reports                  → ReportsPage (Partner_Owner)
/vouchers                 → VouchersPage (Partner_Owner)
/vouchers/create          → VoucherCreatePage (Partner_Owner)
/vouchers/:id             → VoucherDetailPage (Partner_Owner)
/vouchers/:id/edit        → VoucherEditPage (Partner_Owner)
/validate                 → ValidatePage (Partner_Owner)
/branches                 → BranchesPage (Partner_Owner)
/branches/create          → BranchCreatePage (Partner_Owner)
/branches/:id             → BranchDetailPage (Partner_Owner)
/branches/:id/edit        → BranchEditPage (Partner_Owner)
/settings                 → SettingsPage (Partner_Owner or Partner_Cashier)
```

### 5.5.6 Report Dashboard Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Reports Page                                     │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  DateFilter  [Today] [7d] [30d] [90d] [This Year] [Custom]     │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐                  │
│  │ Total    │ │ Used     │ │ Revenue  │ │ Pending  │                  │
│  │ Vouchers │ │ Vouchers │ │   VND    │ │ Vouchers │   ← KPICard     │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘                  │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │                   Revenue Chart                                 │    │
│  │  Line chart with prev/next navigation (week/month)             │    │
│  │  [◀ Prev] ────────────────────────────── [Next ▶]              │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌───────────────────────┐  ┌─────────────────────────────────────┐    │
│  │  Status Distribution  │  │  Top Voucher Performance          │    │
│  │    (Donut Chart)      │  │    (Horizontal Bar Chart)          │    │
│  │  Active / Used / Exp  │  │  Top 10 by redemption count        │    │
│  └───────────────────────┘  └─────────────────────────────────────┘    │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │  Voucher Report Table                                          │    │
│  │  Sortable │ Searchable │ Paginated                           │    │
│  └────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 5.6 Staff Mobile App

### 5.6.1 Overview

**Staff App** là ứng dụng di động dành cho nhân viên cửa hàng (Partner Cashier) quét và đổi voucher.

### 5.6.2 Technology Stack

| Component | Technology | Version |
|-----------|------------|---------|
| Framework | React Native | - |
| Platform | Expo | 54 |
| Routing | Expo Router | File-based |
| Data Fetching | React Query | TanStack |
| HTTP Client | Axios | - |
| Secure Storage | expo-secure-store | - |
| Camera/QR | expo-camera / expo-barcode-scanner | - |

### 5.6.3 Directory Structure

```
frontend-staff/
├── app/                              # Expo Router file-based routing
│   ├── _layout.tsx                  # Root layout (SafeArea, Query, Stack)
│   ├── index.tsx                    # Entry redirect
│   ├── (app)/                       # Protected authenticated routes
│   │   ├── _layout.tsx              # Tab navigator + AuthGuard
│   │   ├── home.tsx                # Dashboard screen
│   │   ├── scan.tsx                # QR scanner
│   │   ├── manual.tsx              # Manual code entry
│   │   ├── history.tsx             # Redemption history
│   │   └── voucher/
│   │       └── [id].tsx            # Voucher detail (stack screen)
│   └── (auth)/                     # Public auth routes
│       ├── _layout.tsx              # Stack navigator
│       ├── login.tsx               # Login screen
│       └── forgot-password.tsx      # Password reset
│
├── src/
│   ├── api/
│   │   └── client.ts               # Axios instance + interceptors
│   ├── components/
│   │   ├── auth/
│   │   │   └── AuthGuard.tsx       # Route protection
│   │   ├── home/
│   │   │   ├── DashboardHeader.tsx
│   │   │   ├── TodaySummaryCard.tsx
│   │   │   ├── QuickActionCard.tsx
│   │   │   └── RecentActivityCard.tsx
│   │   ├── scan/
│   │   │   ├── ScannerHeader.tsx
│   │   │   ├── ScanOverlay.tsx
│   │   │   ├── PermissionView.tsx
│   │   │   └── ScanLoadingOverlay.tsx
│   │   ├── voucher/
│   │   │   ├── StatusBadge.tsx
│   │   │   ├── VoucherCard.tsx
│   │   │   ├── CustomerCard.tsx
│   │   │   ├── BranchCard.tsx
│   │   │   ├── ConfirmDialog.tsx
│   │   │   └── ResultBanner.tsx
│   │   ├── history/
│   │   │   ├── HistoryItem.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   ├── HistorySkeleton.tsx
│   │   │   ├── HistoryEmpty.tsx
│   │   │   ├── SegmentedFilter.tsx
│   │   │   ├── DateRangePicker.tsx
│   │   │   └── SearchNoResults.tsx
│   │   └── ui/
│   │       ├── PrimaryButton.tsx
│   │       ├── PasswordInput.tsx
│   │       ├── FormInput.tsx
│   │       ├── AppLogo.tsx
│   │       └── OfflineState.tsx
│   ├── constants/
│   │   ├── env.ts                  # Environment variables
│   │   └── index.ts                # Storage keys, roles, status
│   ├── hooks/
│   │   ├── useAuth.ts              # Login, logout, auth state
│   │   ├── useRedemption.ts        # Validate, confirm voucher
│   │   ├── useDashboard.ts         # Dashboard stats
│   │   ├── useHistory.ts           # Infinite scroll history
│   │   ├── useVoucherDetail.ts     # Voucher detail
│   │   └── useCameraPermission.ts
│   ├── providers/
│   │   └── QueryProvider.tsx       # React Query setup
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── redemption.service.ts
│   │   ├── history.service.ts
│   │   └── dashboard.service.ts
│   ├── theme/
│   │   └── index.ts                # Colors, spacing, typography
│   ├── types/
│   │   └── index.ts
│   └── utils/
│       ├── auth.ts                 # JWT decode, token check
│       ├── qr.ts                   # QR parsing, validation
│       └── network.ts              # Offline detection
├── package.json
├── app.json
├── metro.config.js
└── tsconfig.json
```

### 5.6.4 Navigation Structure

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         App Navigation                                   │
└─────────────────────────────────────────────────────────────────────────┘

                        ┌─────────────────┐
                        │    _layout.tsx  │
                        │   (Root Stack)  │
                        └────────┬────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                    ▼                         ▼
        ┌───────────────────┐     ┌───────────────────┐
        │    (auth)/        │     │     (app)/        │
        │   Auth Stack      │     │   Tab Navigator   │
        └───────────────────┘     └─────────┬─────────┘
                                             │
        ┌────────────────────────────────────┼────────────────────────┐
        │                                    │                        │
        ▼                                    ▼                        ▼
  ┌───────────┐                      ┌───────────┐              ┌───────────┐
  │  login    │                      │   Home    │◄────────────►│   Scan    │
  │   page    │                      │  (Tab)    │              │  (Tab)    │
  └───────────┘                      └───────────┘              └───────────┘
                                              │                        │
  ┌───────────────────┐                       │                        │
  │ forgot-password   │                       ▼                        ▼
  │   (stack)         │                ┌───────────┐              ┌───────────┐
  └───────────────────┘                │  Manual   │◄───────────►│  History  │
                                        │  (Tab)    │              │  (Tab)    │
                                        └───────────┘              └───────────┘
                                              │
                                              ▼
                                        ┌─────────────┐
                                        │ voucher/:id │
                                        │   (stack)   │
                                        └─────────────┘
```

### 5.6.5 Features

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      Staff App Features                                  │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ 1. Authentication                                                        │
│    ┌──────────────────────────────────────────────────────┐             │
│    │  Login: Email + Password                             │             │
│    │  ─────────────────────────────────────────────       │             │
│    │  Forgot Password: 3-step OTP flow                    │             │
│    │    Step 1: Enter email                               │             │
│    │    Step 2: Enter OTP (from email)                    │             │
│    │    Step 3: Set new password                          │             │
│    └──────────────────────────────────────────────────────┘             │
│    • JWT stored in SecureStore                                           │
│    • Token expiry check in AuthGuard                                    │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ 2. Dashboard (Home Tab)                                                 │
│    ┌──────────────────────────────────────────────────────┐             │
│    │  DashboardHeader: User info + Logout                │             │
│    │  ─────────────────────────────────────────────       │             │
│    │  TodaySummaryCard:                                   │             │
│    │    • Confirmed count                                 │             │
│    │    • Pending count                                   │             │
│    │  ─────────────────────────────────────────────       │             │
│    │  QuickActionCard: Navigate to Scan or Manual        │             │
│    │  ─────────────────────────────────────────────       │             │
│    │  RecentActivityCard: Last 5 redemptions             │             │
│    └──────────────────────────────────────────────────────┘             │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ 3. QR Scanner (Scan Tab)                                                │
│    ┌──────────────────────────────────────────────────────┐             │
│    │  Camera Permission Handling                           │             │
│    │  ─────────────────────────────────────────────       │             │
│    │  ScannerOverlay:                                    │             │
│    │    • Camera viewfinder                              │             │
│    │    • Scan frame corners                             │             │
│    │  ─────────────────────────────────────────────       │             │
│    │  Anti-Duplicate Pattern:                             │             │
│    │    • useRef lock (not useState)                     │             │
│    │    • Prevents multiple scans of same code           │             │
│    │  ─────────────────────────────────────────────       │             │
│    │  Scan Loading: Full-screen overlay during validate   │             │
│    └──────────────────────────────────────────────────────┘             │
│                                                                      │
│    QR Code Formats:                                                   │
│    ┌──────────────────────────────────────────────────────┐             │
│    │  1. Direct code: EVR-XXXX-XXXX                      │             │
│    │  2. URL param: https://app.com/code=EVR-XXXX-XXXX   │             │
│    │  3. Deep link: everest://voucher/EVR-XXXX-XXXX      │             │
│    └──────────────────────────────────────────────────────┘             │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ 4. Manual Code Entry (Manual Tab)                                       │
│    ┌──────────────────────────────────────────────────────┐             │
│    │  Manual voucher code input                           │             │
│    │  ─────────────────────────────────────────────       │             │
│    │  Input validation: EVR-XXXX-XXXX format              │             │
│    │  Same validate flow as scanner                       │             │
│    └──────────────────────────────────────────────────────┘             │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ 5. Voucher Detail (voucher/:id)                                        │
│    ┌──────────────────────────────────────────────────────┐             │
│    │  Two-Mode Detail:                                    │             │
│    │  ┌──────────────────────────────────────────────┐    │             │
│    │  │  mode='validate' (from Scan/Manual)          │    │             │
│    │  │  POST /partner/redemption/validate           │    │             │
│    │  │  Returns VALID only for Unused vouchers      │    │             │
│    │  └──────────────────────────────────────────────┘    │             │
│    │  ┌──────────────────────────────────────────────┐    │             │
│    │  │  mode='detail' (from History)               │    │             │
│    │  │  GET /partner/redemption/voucher/:code      │    │             │
│    │  │  Returns full data for all statuses         │    │             │
│    │  └──────────────────────────────────────────────┘    │             │
│    │  ─────────────────────────────────────────────       │             │
│    │  Components:                                         │             │
│    │    • StatusBadge (color-coded status)                │             │
│    │    • VoucherCard (title, code, validity, image)     │             │
│    │    • CustomerCard (name, email, phone)               │             │
│    │    • BranchCard (applicable branches)                │             │
│    │    • ConfirmDialog (before redemption)               │             │
│    │    • ResultBanner (success/error result)             │             │
│    └──────────────────────────────────────────────────────┘             │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ 6. Redemption History (History Tab)                                     │
│    ┌──────────────────────────────────────────────────────┐             │
│    │  SegmentedFilter: All / Today / 7 Days / 30 Days     │             │
│    │  ─────────────────────────────────────────────       │             │
│    │  DateRangePicker: Custom date range                  │             │
│    │  ─────────────────────────────────────────────       │             │
│    │  SearchBar: Debounced search                         │             │
│    │  ─────────────────────────────────────────────       │             │
│    │  Infinite Scroll: Load more on scroll                │             │
│    │  ─────────────────────────────────────────────       │             │
│    │  HistoryItem: Title, code, customer, branch, time    │             │
│    └──────────────────────────────────────────────────────┘             │
└─────────────────────────────────────────────────────────────────────────┘
```

### 5.6.6 Redemption Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Voucher Redemption Flow                              │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────┐      ┌──────────┐      ┌────────────┐      ┌──────────┐
│  Scan   │ or   │  Manual  │      │  Validate  │      │  Confirm  │
│   QR    │      │   Input  │─────►│   Code     │─────►│   Dialog  │
└─────────┘      └──────────┘      └─────┬──────┘      └─────┬────┘
                                         │                   │
                                         ▼                   ▼
                                  ┌────────────┐      ┌──────────┐
                                  │  VALID /   │      │  Confirm │
                                  │  INVALID   │      │  Button  │
                                  └────────────┘      └────┬────┘
                                                          │
                                                          ▼
                                                   ┌────────────┐
                                                   │  Redeem    │
                                                   │   API     │
                                                   └─────┬─────┘
                                                         │
                                    ┌────────────────────┼────────────────────┐
                                    ▼                    ▼                    ▼
                             ┌────────────┐      ┌────────────┐      ┌────────────┐
                             │  SUCCESS   │      │   ERROR   │      │  EXPIRED  │
                             │   Banner   │      │   Banner  │      │   Banner   │
                             │  (Green)   │      │   (Red)   │      │  (Orange)  │
                             └────────────┘      └────────────┘      └────────────┘
```

### 5.6.7 Status Configuration

```typescript
// constants/index.ts - STATUS_CONFIG
const STATUS_CONFIG = {
  VALID: {
    color: '#10B981',      // emerald-500
    background: '#D1FAE5', // emerald-100
    label: 'Hợp lệ',
    canConfirm: true
  },
  USED: {
    color: '#6B7280',      // gray-500
    background: '#F3F4F6', // gray-100
    label: 'Đã sử dụng',
    canConfirm: false
  },
  EXPIRED: {
    color: '#EF4444',       // red-500
    background: '#FEE2E2',  // red-100
    label: 'Đã hết hạn',
    canConfirm: false
  },
  CANCELLED: {
    color: '#6B7280',
    background: '#F3F4F6',
    label: 'Đã hủy',
    canConfirm: false
  }
}
```

### 5.6.8 QR Parsing Utility

```typescript
// utils/qr.ts
interface QrData {
  code: string;      // EVR-XXXX-XXXX
  isValid: boolean;
}

// QR Formats Supported:
// 1. Direct code: "EVR-ABCD-1234"
// 2. URL param: "https://everest.app/voucher?code=EVR-ABCD-1234"
// 3. Deep link: "everest://redeem/EVR-ABCD-1234"

function parseQrData(rawData: string): QrData {
  // 1. Check direct format
  if (isValidVoucherCode(rawData)) {
    return { code: rawData, isValid: true };
  }

  // 2. Parse URL params
  // 3. Parse deep links
  // ...

  return { code: '', isValid: false };
}

const VOUCHER_CODE_REGEX = /^EVR-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
```

---

## 5.7 API Communication

### 5.7.1 Backend API Base URL

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          API Communication                              │
└─────────────────────────────────────────────────────────────────────────┘

┌───────────────┐                              ┌───────────────┐
│   Customer    │ ──────────────────────────► │               │
│   Frontend     │    http://localhost:3000    │               │
│   :5174        │    /api/*                   │               │
└───────────────┘                              │               │
                                              │    Backend     │
┌───────────────┐                              │    Express    │
│    Admin      │ ──────────────────────────►  │    Server     │
│   Frontend    │                              │    :3000      │
└───────────────┘                              │               │
                                              │               │
┌───────────────┐                              │               │
│   Partner     │ ──────────────────────────►  │               │
│   Frontend    │                              └───────────────┘
└───────────────┘
                                              ┌───────────────┐
┌───────────────┐                              │   PostgreSQL  │
│    Staff      │ ──────────────────────────►  │   Database    │
│    App        │                              └───────────────┘
└───────────────┘
```

### 5.7.2 HTTP Client Comparison

| Feature | Customer | Admin | Partner | Staff |
|---------|----------|-------|---------|-------|
| Client | Fetch API | Fetch API | Fetch API | Axios |
| Token Storage | localStorage | localStorage | localStorage | SecureStore |
| Auto Refresh | Yes | Yes | Yes | Yes |
| Retry on 401 | Queue | Queue | Queue | Interceptor |
| Environment | VITE_API_URL | VITE_API_URL | VITE_API_URL | EXPO_PUBLIC_API_URL |

---

## 5.8 Security Architecture

### 5.8.1 Authentication Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Authentication Flow                                   │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐
│  User    │      │  Login   │      │  API     │      │ Database │
│  Login   │─────►│  Form    │─────►│  /auth   │─────►│  Verify  │
└──────────┘      └──────────┘      │  /login  │      │  bcrypt  │
                                    └────┬─────┘      └──────────┘
                                         │
                                         ▼
                                    ┌──────────┐
                                    │ JWT      │
                                    │ Tokens   │
                                    └────┬─────┘
                                         │
           ┌─────────────────────────────┼─────────────────────────────┐
           │                             │                             │
           ▼                             ▼                             ▼
    ┌─────────────┐              ┌─────────────┐              ┌─────────────┐
    │ localStorage│              │ Admin Token │              │ SecureStore │
    │  (Customer) │              │ (Admin)     │              │  (Mobile)   │
    └─────────────┘              └─────────────┘              └─────────────┘
```

### 5.8.2 Token Refresh Pattern

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Token Refresh Pattern                                 │
└─────────────────────────────────────────────────────────────────────────┘

Request 1 ─┐
Request 2 ─┼──► 401 ──► isRefreshing=true ──► POST /refresh
Request 3 ─┤                     │
            │        refreshSubscribers = [callback1, callback2, callback3]
            │                     │
            │                     ▼
            │              ┌─────────────┐
            │              │  New Token   │
            │              └──────┬──────┘
            │                     │
            │        ┌───────────┴───────────┐
            │        ▼           ▼           ▼
            │   callback1   callback2   callback3
            │        │           │           │
            │        ▼           ▼           ▼
            │    Retry 1     Retry 2     Retry 3
            │
    (Meanwhile, new requests queue up in refreshSubscribers)
```

---

## 5.9 Summary Comparison

| Aspect | Customer | Admin | Partner | Staff |
|--------|----------|-------|---------|-------|
| Platform | Web | Web | Web | Mobile |
| Auth | JWT + localStorage | JWT + localStorage | JWT + localStorage | JWT + SecureStore |
| State | Hooks | Context + Hooks | Context + Hooks | React Query |
| Routing | React Router | React Router | React Router | Expo Router |
| Charts | - | - | Recharts | - |
| QR Scanner | - | - | - | expo-camera |
| Route Guards | Manual | PrivateRoute | PrivateRoute | AuthGuard |

---

## 5.10 File Naming Conventions

### Frontend-Customer
```
├── pages/
│   ├── Home.tsx
│   ├── Login.tsx
│   └── VoucherDetail.tsx
├── components/
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── VoucherCard.tsx
└── services/
    ├── authApi.ts
    └── voucherApi.ts
```

### Frontend-Admin
```
├── pages/
│   ├── Dashboard.tsx
│   ├── Users.tsx
│   └── Partners.tsx
├── components/
│   ├── layout/
│   │   ├── AdminLayout.tsx
│   │   └── Sidebar.tsx
│   └── guards/
│       ├── PrivateRoute.tsx
│       └── GuestRoute.tsx
└── hooks/
    ├── useUsersManagement.ts
    └── usePartnerManagement.ts
```

### Frontend-Partner
```
├── pages/
│   ├── LoginPage.tsx
│   ├── VouchersPage.tsx
│   └── ReportsPage.tsx
├── components/
│   ├── voucher/
│   │   └── VoucherForm.tsx
│   └── report/
│       ├── KPICard.tsx
│       └── RevenueChart.tsx
└── hooks/
    ├── useReportKPIs.ts
    └── useRevenueChart.ts
```

### Frontend-Staff
```
├── app/
│   ├── (app)/
│   │   ├── home.tsx
│   │   ├── scan.tsx
│   │   └── history.tsx
│   └── (auth)/
│       ├── login.tsx
│       └── forgot-password.tsx
├── src/
│   ├── components/
│   │   ├── home/
│   │   │   └── DashboardHeader.tsx
│   │   ├── scan/
│   │   │   └── ScanOverlay.tsx
│   │   └── voucher/
│   │       └── StatusBadge.tsx
│   └── hooks/
│       ├── useAuth.ts
│       └── useRedemption.ts
```
