import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'

// Public pages
import Register from './pages/Register'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import EmailVerificationPending from './pages/EmailVerificationPending'
import VerifyEmail from './pages/VerifyEmail'
import Forbidden from './pages/Forbidden'

// Protected pages
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import SalesOrders from './pages/SalesOrders'
import Invoices from './pages/Invoices'
import Purchases from './pages/Purchases'
import Reports from './pages/Reports'
import Profile from './pages/Profile'
import AuditLogs from './pages/AuditLogs'
import StockMovements from './pages/StockMovements'
import Notifications from './pages/Notifications'
import Users from './pages/Users'

function App() {
  return (
    <>
    <BrowserRouter>
    <Routes>
      {/* ── Public Routes ────────────────────────────────────────── */}
      <Route path="/"                element={<Register />} />
      <Route path="/login"           element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password"  element={<ResetPassword />} />
      <Route path="/verify-pending"  element={<EmailVerificationPending />} />
      <Route path="/verify-email"    element={<VerifyEmail />} />
      <Route path="/forbidden"       element={<Forbidden />} />

      {/* ── All authenticated roles ───────────────────────────────── */}
      <Route path="/dashboard" element={
        <ProtectedRoute><Dashboard /></ProtectedRoute>
      } />
      <Route path="/products" element={
        <ProtectedRoute><Products /></ProtectedRoute>
      } />
      <Route path="/sales-orders" element={
        <ProtectedRoute><SalesOrders /></ProtectedRoute>
      } />
      <Route path="/invoices" element={
        <ProtectedRoute><Invoices /></ProtectedRoute>
      } />
      <Route path="/notifications" element={
        <ProtectedRoute><Notifications /></ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute><Profile /></ProtectedRoute>
      } />

      {/* ── ADMIN + MANAGER ────────────────────────────────────────── */}
      <Route path="/purchases" element={
        <ProtectedRoute allowedRoles={["ADMIN","MANAGER"]}>
          <Purchases />
        </ProtectedRoute>
      } />
      <Route path="/stock-movements" element={
        <ProtectedRoute allowedRoles={["ADMIN","MANAGER"]}>
          <StockMovements />
        </ProtectedRoute>
      } />
      <Route path="/reports" element={
        <ProtectedRoute allowedRoles={["ADMIN","MANAGER"]}>
          <Reports />
        </ProtectedRoute>
      } />

      {/* ── ADMIN ONLY ─────────────────────────────────────────────── */}
      <Route path="/users" element={
        <ProtectedRoute allowedRoles={["ADMIN"]}>
          <Users />
        </ProtectedRoute>
      } />
      <Route path="/audit-logs" element={
        <ProtectedRoute allowedRoles={["ADMIN"]}>
          <AuditLogs />
        </ProtectedRoute>
      } />
    </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
