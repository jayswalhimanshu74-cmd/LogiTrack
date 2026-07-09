import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Register from './pages/Register'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import SalesOrders from './pages/SalesOrders'
import Invoices from './pages/Invoices'
import Purchases from './pages/Purchases'
import Reports from './pages/Reports'

function App() {
  return (
    <>
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/products" element={<Products />} />
      <Route path="/sales-orders" element={<SalesOrders />} />
      <Route path="/invoices" element={<Invoices />} />
      <Route path="/purchases" element={<Purchases />} />
      <Route path="/reports" element={<Reports />} />
    </Routes>
    </BrowserRouter>
    </>
  )
}

export default App

