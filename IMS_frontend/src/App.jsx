import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Register from './pages/Register'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import EmailVerificationPending from './pages/EmailVerificationPending'
import VerifyEmail from './pages/VerifyEmail'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import SalesOrders from './pages/SalesOrders'
import Invoices from './pages/Invoices'
import Purchases from './pages/Purchases'
import Reports from './pages/Reports'
import Profile from './pages/Profile'

function App() {
  return (
    <>
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-pending" element={<EmailVerificationPending />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/products" element={<Products />} />
      <Route path="/sales-orders" element={<SalesOrders />} />
      <Route path="/invoices" element={<Invoices />} />
      <Route path="/purchases" element={<Purchases />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
    </BrowserRouter>
    </>
  )
}

export default App

