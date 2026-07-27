import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ToastProvider } from './components/shared/Toast'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/guards/PrivateRoute'
import GuestRoute from './components/guards/GuestRoute'
import AdminLayout from './components/layout/AdminLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import Partners from './pages/Partners'
import Branches from './pages/Branches'
import Vouchers from './pages/Vouchers'
import Orders from './pages/Orders'
import Content from './pages/Content'
import PostEditor from './pages/PostEditor'
import AuditLogs from './pages/AuditLogs'

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Guest routes */}
            <Route path="/login" element={
              <GuestRoute>
                <Login />
              </GuestRoute>
            } />

            {/* Private routes */}
            <Route element={
              <PrivateRoute>
                <AdminLayout />
              </PrivateRoute>
            }>
              <Route path="/" element={<Dashboard />} />
              <Route path="/users" element={<Users />} />
              <Route path="/partners" element={<Partners />} />
              <Route path="/partners/:partnerId/branches" element={<Branches />} />
              <Route path="/branches" element={<Branches />} />
              <Route path="/vouchers" element={<Vouchers />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/content" element={<Content />} />
              <Route path="/content/posts/new" element={<PostEditor />} />
              <Route path="/content/posts/:postId" element={<PostEditor />} />
              <Route path="/audit-logs" element={<AuditLogs />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  )
}
