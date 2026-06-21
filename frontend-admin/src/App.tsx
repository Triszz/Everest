import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ToastProvider } from './components/shared/Toast'
import AdminLayout from './components/layout/AdminLayout'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import Partners from './pages/Partners'
import Vouchers from './pages/Vouchers'
import Orders from './pages/Orders'
import Content from './pages/Content'
import AuditLogs from './pages/AuditLogs'

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AdminLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/partners" element={<Partners />} />
            <Route path="/vouchers" element={<Vouchers />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/content" element={<Content />} />
            <Route path="/audit-logs" element={<AuditLogs />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  )
}
