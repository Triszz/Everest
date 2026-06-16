import { Header, Hero, DanhMucNoiBat, FeaturedVouchers, Newsletter, Footer } from './components';

function App() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'white' }}>
      <Header />
      <main style={{ flex: 1 }}>
        <Hero />
        <DanhMucNoiBat />
        <FeaturedVouchers />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}

export default App;
