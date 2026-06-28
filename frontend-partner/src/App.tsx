import { Routes, Route, Navigate } from 'react-router-dom';
import { Header, Footer, PrivateRoute, GuestRoute } from './components';
import { AuthProvider, useAuth } from './context/AuthContext';
import { getDefaultRoute } from './config/navigation';
import { RegisterPage } from './pages/Register';
import { RegisterSuccessPage } from './pages/RegisterSuccess';
import { LoginPage } from './pages/Login';
import { VouchersPage } from './pages/Vouchers';
import { VoucherCreatePage } from './pages/VoucherCreate';
import { VoucherDetailPage } from './pages/VoucherDetail';
import { VoucherEditPage } from './pages/VoucherEdit';

// ── Placeholder pages (sẽ implement chi tiết sau) ──────────────────────────
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div style={{
      maxWidth: 1200,
      margin: '0 auto',
      padding: '48px 24px',
      textAlign: 'center',
    }}>
      <h1 style={{
        fontFamily: 'Manrope, sans-serif',
        fontSize: 28,
        fontWeight: 800,
        color: '#1E293B',
        marginBottom: 12,
      }}>{title}</h1>
      <p style={{
        fontFamily: 'Inter, sans-serif',
        fontSize: 15,
        color: '#94A3B8',
      }}>Trang này đang được phát triển...</p>
    </div>
  );
}

// ── Main app layout (with header/footer) ────────────────────────────────────
function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'white' }}>
      <Header />
      <main style={{ flex: 1 }}>
        {children}
      </main>
      <Footer />
    </div>
  );
}

// ── Smart root redirect ─────────────────────────────────────────────────────
function RootRedirect() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  if (user) {
    return <Navigate to={getDefaultRoute(user.role)} replace />;
  }

  return <Navigate to="/login" replace />;
}

// ── App ─────────────────────────────────────────────────────────────────────
function AppRoutes() {
  return (
    <Routes>
      {/* ── Guest routes (redirect if already logged in) ── */}
      <Route path="/login" element={
        <GuestRoute>
          <AppLayout><LoginPage /></AppLayout>
        </GuestRoute>
      } />
      <Route path="/register" element={
        <GuestRoute>
          <AppLayout><RegisterPage /></AppLayout>
        </GuestRoute>
      } />
      <Route path="/register/success" element={
        <AppLayout><RegisterSuccessPage /></AppLayout>
      } />

      {/* ── Private routes (require auth + role check) ── */}
      <Route path="/dashboard" element={
        <PrivateRoute allowedRoles={['Partner_Owner']}>
          <AppLayout><PlaceholderPage title="Dashboard" /></AppLayout>
        </PrivateRoute>
      } />
      <Route path="/vouchers" element={
        <PrivateRoute allowedRoles={['Partner_Owner']}>
          <AppLayout><VouchersPage /></AppLayout>
        </PrivateRoute>
      } />
      <Route path="/vouchers/create" element={
        <PrivateRoute allowedRoles={['Partner_Owner']}>
          <AppLayout><VoucherCreatePage /></AppLayout>
        </PrivateRoute>
      } />
      <Route path="/vouchers/:id" element={
        <PrivateRoute allowedRoles={['Partner_Owner']}>
          <AppLayout><VoucherDetailPage /></AppLayout>
        </PrivateRoute>
      } />
      <Route path="/vouchers/:id/edit" element={
        <PrivateRoute allowedRoles={['Partner_Owner']}>
          <AppLayout><VoucherEditPage /></AppLayout>
        </PrivateRoute>
      } />
      <Route path="/validate" element={
        <PrivateRoute allowedRoles={['Partner_Owner', 'Partner_Cashier']}>
          <AppLayout><PlaceholderPage title="Xác thực Voucher" /></AppLayout>
        </PrivateRoute>
      } />
      <Route path="/branches" element={
        <PrivateRoute allowedRoles={['Partner_Owner']}>
          <AppLayout><PlaceholderPage title="Quản lý Chi nhánh" /></AppLayout>
        </PrivateRoute>
      } />
      <Route path="/reports" element={
        <PrivateRoute allowedRoles={['Partner_Owner']}>
          <AppLayout><PlaceholderPage title="Báo cáo & Thống kê" /></AppLayout>
        </PrivateRoute>
      } />
      <Route path="/settings" element={
        <PrivateRoute>
          <AppLayout><PlaceholderPage title="Cài đặt tài khoản" /></AppLayout>
        </PrivateRoute>
      } />

      {/* ── Root redirect ── */}
      <Route path="/" element={<RootRedirect />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
