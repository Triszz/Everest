import { Header, Hero, DanhMucNoiBat, FeaturedVouchers, Newsletter, Footer } from './components';
import { Routes, Route } from 'react-router-dom';
import { LoginPage } from './pages/Login';
import { RegisterPage } from './pages/Register';
import { LogoutSuccessPage } from './pages/LogoutSuccess';
import { VoucherDetail } from './components/VoucherDetail';

function App() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'white' }}>
      <Header />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Hero />
                <DanhMucNoiBat />
                <FeaturedVouchers />
                <Newsletter />
              </>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/logout" element={<LogoutSuccessPage />} />
          <Route path="/voucher/:id" element={<VoucherDetail />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
