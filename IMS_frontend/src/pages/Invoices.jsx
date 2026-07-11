import { useState, useEffect, useCallback } from "react";
import { 
  Search, Plus, Edit2, Trash2, Eye, Filter, ArrowUpDown, 
  ChevronLeft, ChevronRight, FileText, Calendar, DollarSign,
  TrendingUp, CheckCircle2, AlertCircle, RefreshCw, Printer, ShieldAlert, Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../components/Sidebar";
import invoiceApi from "../api/invoiceApi";
import InvoiceFormModal from "../components/InvoiceFormModal";
import InvoiceDetailsDrawer from "../components/InvoiceDetailsDrawer";
import InvoicePreviewModal from "../components/InvoicePreviewModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";

const Invoices = () => {
  // Invoices & Stats States
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState({
    totalInvoicesCount: 0,
    todayInvoicesCount: 0,
    monthlyInvoicesCount: 0,
    pendingPaymentsCount: 0,
    paidInvoicesCount: 0,
    cancelledInvoicesCount: 0,
    totalRevenue: 0,
    averageInvoiceValue: 0
  });

  // Query Parameters
  const [searchVal, setSearchVal] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Pagination & Sorting
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [sortField, setSortField] = useState("id");
  const [sortOrder, setSortOrder] = useState("desc");

  // UI States
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("checking");

  // Modals & Slideouts
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Toast States
  const [toasts, setToasts] = useState([]);

  // Toast Emitter
  const showToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  // Listen to Global Axios Errors
  useEffect(() => {
    const handleToastEvent = (e) => {
      const { message, type } = e.detail;
      showToast(message, type);
    };
    window.addEventListener("app-toast", handleToastEvent);
    return () => window.removeEventListener("app-toast", handleToastEvent);
  }, [showToast]);

  // Load stats
  const loadStats = useCallback(async () => {
    try {
      const data = await invoiceApi.getStatistics();
      setStats(data);
      setConnectionStatus("connected");
    } catch (err) {
      console.warn("Unable to fetch invoice statistics, loading demo fallback:", err);
      setConnectionStatus("demo");
      loadMockStats();
    }
  }, []);

  const loadMockStats = () => {
    setStats({
      totalInvoicesCount: 24,
      todayInvoicesCount: 2,
      monthlyInvoicesCount: 14,
      pendingPaymentsCount: 5,
      paidInvoicesCount: 18,
      cancelledInvoicesCount: 1,
      totalRevenue: 6490.50,
      averageInvoiceValue: 270.44
    });
  };

  // Fetch Invoices list
  const fetchInvoices = useCallback(async () => {
    setIsLoading(true);
    try {
      const sortQuery = `${sortField},${sortOrder}`;
      const data = await invoiceApi.getInvoices({
        page: currentPage,
        size: pageSize,
        sort: sortQuery,
        search: searchVal,
        status: statusFilter,
        paymentStatus: paymentStatusFilter,
        startDate: startDate,
        endDate: endDate
      });

      setInvoices(data.content || []);
      setTotalPages(data.totalPages || 1);
      setTotalElements(data.totalElements || 0);
      setConnectionStatus("connected");
    } catch (err) {
      console.error("Fetch invoices error, falling back to mock lists:", err);
      setConnectionStatus("demo");
      loadMockInvoices();
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, sortField, sortOrder, searchVal, statusFilter, paymentStatusFilter, startDate, endDate]);

  const loadMockInvoices = () => {
    const mockData = [
      { id: 1, invoiceNo: "INV-2026-000001", customerName: "Alice Henderson", customerPhone: "+1 555 0144", customerEmail: "alice@example.com", billingAddress: "Apt 4B, NY", saleNo: "SO-83901928", invoiceDate: "2026-07-09", subtotal: 809.97, tax: 0, discount: 0, grandTotal: 809.97, status: "PAID", paymentStatus: "PAID", paymentMethod: "UPI", notes: "Generated from sales order", createdAt: "2026-07-09T17:05:00", items: [{ id: 1, productId: 1, productName: "Logitech MX Master 3S Wireless Mouse", productSku: "LOGI-MX3S-BLK", quantity: 3, unitPrice: 99.99, lineTotal: 299.97 }] },
      { id: 2, invoiceNo: "INV-2026-000002", customerName: "Jane Smith", customerPhone: "+1 555 0122", customerEmail: "jane@gmail.com", billingAddress: "732 Madison Ave", saleNo: "SO-12849028", invoiceDate: "2026-07-08", subtotal: 399.99, tax: 20, discount: 5, grandTotal: 414.99, status: "ISSUED", paymentStatus: "PENDING", paymentMethod: "CARD", notes: "", createdAt: "2026-07-08T12:00:00", items: [{ id: 2, productId: 2, productName: "Sony WH-1000XM5 Headphones", productSku: "SONY-WH1000XM5-B", quantity: 1, unitPrice: 399.99, lineTotal: 399.99 }] },
      { id: 3, invoiceNo: "INV-2026-000003", customerName: "Bob Johnson", customerPhone: "+1 555 0177", customerEmail: "", billingAddress: "", saleNo: "", invoiceDate: "2026-07-06", subtotal: 59.98, tax: 0, discount: 0, grandTotal: 59.98, status: "DRAFT", paymentStatus: "PENDING", paymentMethod: "CASH", notes: "Standalone invoice draft", createdAt: "2026-07-06T10:15:00", items: [{ id: 3, productId: 3, productName: "Ergonomic Memory Foam Cushion", productSku: "CUSH-LUMB-MEM", quantity: 2, unitPrice: 29.99, lineTotal: 59.98 }] }
    ];

    let filtered = mockData;
    if (searchVal) {
      const q = searchVal.toLowerCase();
      filtered = filtered.filter(i => i.invoiceNo.toLowerCase().includes(q) || i.customerName.toLowerCase().includes(q));
    }
    if (statusFilter) {
      filtered = filtered.filter(i => i.status === statusFilter);
    }
    if (paymentStatusFilter) {
      filtered = filtered.filter(i => i.paymentStatus === paymentStatusFilter);
    }
    if (startDate) {
      filtered = filtered.filter(i => i.invoiceDate >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter(i => i.invoiceDate <= endDate);
    }

    filtered.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (typeof valA === "string") {
        return sortOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortOrder === "asc" ? valA - valB : valB - valA;
    });

    setInvoices(filtered);
    setTotalPages(1);
    setTotalElements(filtered.length);
  };

  // Initialize Data
  useEffect(() => {
    fetchInvoices();
    loadStats();
  }, [fetchInvoices, loadStats]);

  // Form Submit Handler (Supports Create and Update)
  const handleFormSubmit = async (data) => {
    setIsSaving(true);
    try {
      if (selectedInvoice) {
        await invoiceApi.updateInvoice(selectedInvoice.id, data);
        showToast("Invoice updated successfully!");
      } else {
        await invoiceApi.createInvoice(data);
        showToast("Invoice created successfully!");
      }
      setIsFormOpen(false);
      setSelectedInvoice(null);
      fetchInvoices();
      loadStats();
    } catch (err) {
      console.error("Save invoice failed:", err);
      if (connectionStatus === "demo") {
        showToast(`Demo Mode: Simulated invoice logged for "${data.customerName}"`, "info");
        setIsFormOpen(false);
        setSelectedInvoice(null);
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Delete/Cancel Handler
  const handleDeleteConfirm = async () => {
    if (!selectedInvoice) return;
    try {
      await invoiceApi.deleteInvoice(selectedInvoice.id);
      showToast("Invoice deleted successfully!");
      setIsDeleteOpen(false);
      setSelectedInvoice(null);
      fetchInvoices();
      loadStats();
    } catch (err) {
      console.error("Delete invoice failed:", err);
      if (connectionStatus === "demo") {
        showToast(`Demo Mode: Simulated deletion of invoice "${selectedInvoice.invoiceNo}"`, "info");
        setIsDeleteOpen(false);
        setSelectedInvoice(null);
      }
    }
  };

  // Mark as Paid
  const handleMarkAsPaid = async (invoice) => {
    try {
      await invoiceApi.updateInvoiceStatus(invoice.id, "PAID");
      showToast(`Invoice ${invoice.invoiceNo} marked as PAID!`);
      fetchInvoices();
      loadStats();
    } catch (err) {
      console.error("Mark as paid failed:", err);
      if (connectionStatus === "demo") {
        showToast(`Demo Mode: Invoice ${invoice.invoiceNo} marked as paid`, "info");
      }
    }
  };

  // Sort Toggle
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setCurrentPage(0);
  };

  // Status Badge Colors Helper
  const getStatusBadge = (status) => {
    switch (status) {
      case "CANCELLED":
        return <span className="inline-block px-3 py-1 bg-red-50 text-red-800 border border-red-100 rounded-full text-xs font-semibold">Cancelled</span>;
      case "PAID":
        return <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-full text-xs font-semibold">Paid</span>;
      case "ISSUED":
        return <span className="inline-block px-3 py-1 bg-blue-50 text-blue-800 border border-blue-100 rounded-full text-xs font-semibold">Issued</span>;
      default:
        return <span className="inline-block px-3 py-1 bg-amber-50 text-amber-800 border border-amber-100 rounded-full text-xs font-semibold">Draft</span>;
    }
  };

  const getPaymentBadge = (status) => {
    switch (status) {
      case "PAID":
        return <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-full text-xs font-semibold">Paid</span>;
      case "PARTIALLY_PAID":
        return <span className="inline-block px-3 py-1 bg-purple-50 text-purple-800 border border-purple-100 rounded-full text-xs font-semibold">Partially Paid</span>;
      case "REFUNDED":
        return <span className="inline-block px-3 py-1 bg-red-50 text-red-800 border border-red-100 rounded-full text-xs font-semibold">Refunded</span>;
      default:
        return <span className="inline-block px-3 py-1 bg-amber-50 text-amber-800 border border-amber-100 rounded-full text-xs font-semibold">Pending</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      <Sidebar activeTab="invoices" />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Header */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 md:px-8 z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <h2 className="text-xl text-slate-800 font-semibold">Invoice Management</h2>
          </div>
          <div className="flex items-center gap-4">
            {connectionStatus === "connected" ? (
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-4 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                Connected
              </span>
            ) : (
              <span className="bg-amber-50 text-amber-800 border border-amber-200 px-4 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                Demo Mode
              </span>
            )}
            <button 
              onClick={() => { fetchInvoices(); loadStats(); }} 
              className="p-2 hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
              title="Refresh Invoices"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </header>

        {/* Dashboard Grid */}
        <main className="flex-1 p-6 md:p-8 space-y-8 max-w-[1600px] w-full mx-auto">
          
          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Invoices</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.totalInvoicesCount}</h3>
              </div>
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <FileText size={24} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Revenue</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">${stats.totalRevenue?.toFixed(2)}</h3>
              </div>
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                <DollarSign size={24} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Today's Invoices</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.todayInvoicesCount}</h3>
              </div>
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                <TrendingUp size={24} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Average Invoice Value</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">${stats.averageInvoiceValue?.toFixed(2)}</h3>
              </div>
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                <DollarSign size={24} />
              </div>
            </div>
          </div>

          {/* Search, filters, grid list */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            
            <div className="flex flex-col xl:flex-row gap-4 items-center justify-between">
              
              {/* Search Invoice Number or Customer */}
              <div className="relative w-full xl:max-w-xs shrink-0">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Search size={18} />
                </span>
                <input
                  type="text"
                  placeholder="Search Invoice #, Customer..."
                  value={searchVal}
                  onChange={(e) => { setSearchVal(e.target.value); setCurrentPage(0); }}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 rounded-lg text-sm transition-all"
                />
              </div>

              {/* Advanced multi-filters */}
              <div className="flex flex-wrap items-center gap-3 w-full justify-end">
                <div className="flex items-center gap-2 border border-slate-200 px-3 py-2 rounded-lg bg-white">
                  <Filter size={16} className="text-slate-500" />
                  <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(0); }}
                    className="text-sm text-slate-700 bg-transparent outline-none focus:ring-0 cursor-pointer"
                  >
                    <option value="">All Statuses</option>
                    <option value="DRAFT">Draft</option>
                    <option value="ISSUED">Issued</option>
                    <option value="PAID">Paid</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 border border-slate-200 px-3 py-2 rounded-lg bg-white">
                  <select
                    value={paymentStatusFilter}
                    onChange={(e) => { setPaymentStatusFilter(e.target.value); setCurrentPage(0); }}
                    className="text-sm text-slate-700 bg-transparent outline-none focus:ring-0 cursor-pointer"
                  >
                    <option value="">All Payments</option>
                    <option value="PENDING">Pending</option>
                    <option value="PAID">Paid</option>
                    <option value="PARTIALLY_PAID">Partially Paid</option>
                    <option value="REFUNDED">Refunded</option>
                  </select>
                </div>

                {/* Date range filters */}
                <div className="flex items-center gap-1.5 border border-slate-200 px-3 py-1.5 rounded-lg bg-white text-slate-600 text-sm">
                  <Calendar size={15} />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => { setStartDate(e.target.value); setCurrentPage(0); }}
                    className="outline-none text-xs text-slate-700 cursor-pointer"
                    title="Start Date"
                  />
                  <span className="text-slate-300">to</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => { setEndDate(e.target.value); setCurrentPage(0); }}
                    className="outline-none text-xs text-slate-700 cursor-pointer"
                    title="End Date"
                  />
                  {(startDate || endDate) && (
                    <button 
                      onClick={() => { setStartDate(""); setEndDate(""); }} 
                      className="ml-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <button
                  onClick={() => { setSelectedInvoice(null); setIsFormOpen(true); }}
                  className="bg-premium-gradient hover:bg-premium-gradient-dark text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all shadow-md cursor-pointer shrink-0"
                >
                  <Plus size={16} />
                  <span>Log Invoice</span>
                </button>
              </div>
            </div>

            {/* Invoices Table Grid */}
            <div className="overflow-x-auto border border-slate-100 rounded-lg">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50">
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort("invoiceNo")}>
                      <div className="flex items-center gap-1">
                        <span>Invoice Number</span>
                        <ArrowUpDown size={12} />
                      </div>
                    </th>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort("customerName")}>
                      <div className="flex items-center gap-1">
                        <span>Customer</span>
                        <ArrowUpDown size={12} />
                      </div>
                    </th>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Sale Order Ref</th>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Items Quantity</th>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort("grandTotal")}>
                      <div className="flex items-center gap-1">
                        <span>Grand Total</span>
                        <ArrowUpDown size={12} />
                      </div>
                    </th>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Payment</th>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort("invoiceDate")}>
                      <div className="flex items-center gap-1">
                        <span>Invoice Date</span>
                        <ArrowUpDown size={12} />
                      </div>
                    </th>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    Array.from({ length: pageSize }).map((_, idx) => (
                      <tr key={idx} className="animate-pulse">
                        <td className="p-4"><div className="h-4 bg-slate-100 rounded w-20"></div></td>
                        <td className="p-4">
                          <div className="h-4 bg-slate-100 rounded w-24 mb-1"></div>
                          <div className="h-3 bg-slate-100 rounded w-16"></div>
                        </td>
                        <td className="p-4"><div className="h-4 bg-slate-100 rounded w-14"></div></td>
                        <td className="p-4"><div className="h-4 bg-slate-100 rounded w-10"></div></td>
                        <td className="p-4"><div className="h-4 bg-slate-100 rounded w-12"></div></td>
                        <td className="p-4"><div className="h-6 bg-slate-100 rounded-full w-20"></div></td>
                        <td className="p-4"><div className="h-6 bg-slate-100 rounded-full w-20"></div></td>
                        <td className="p-4"><div className="h-4 bg-slate-100 rounded w-16"></div></td>
                        <td className="p-4"><div className="h-8 bg-slate-100 rounded-lg w-32 mx-auto"></div></td>
                      </tr>
                    ))
                  ) : invoices.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="p-12 text-center">
                        <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-slate-200">
                          <FileText size={28} />
                        </div>
                        <p className="text-slate-800 font-semibold text-base">No Invoices Found</p>
                        <p className="text-slate-500 text-xs mt-1">Try refining search parameters or creating a new invoice.</p>
                      </td>
                    </tr>
                  ) : (
                    invoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4">
                          <span className="font-mono text-xs bg-slate-100 border border-slate-200/60 px-2 py-1 rounded text-slate-700 font-semibold whitespace-nowrap">
                            {invoice.invoiceNo}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="font-semibold text-slate-800 text-sm">{invoice.customerName}</div>
                          <div className="text-slate-400 text-xs mt-0.5">{invoice.customerPhone}</div>
                        </td>
                        <td className="p-4">
                          {invoice.saleNo ? (
                            <span className="font-mono text-xs text-slate-655 font-semibold text-slate-500">{invoice.saleNo}</span>
                          ) : (
                            <span className="text-xs text-slate-400 font-medium italic">Standalone</span>
                          )}
                        </td>
                        <td className="p-4 text-slate-700 text-sm font-semibold">
                          {invoice.items?.reduce((s, item) => s + item.quantity, 0) || 0} items
                        </td>
                        <td className="p-4 text-slate-900 font-extrabold text-sm">
                          ${invoice.grandTotal?.toFixed(2)}
                        </td>
                        <td className="p-4">{getPaymentBadge(invoice.paymentStatus)}</td>
                        <td className="p-4">{getStatusBadge(invoice.status)}</td>
                        <td className="p-4 text-slate-500 text-sm whitespace-nowrap">{invoice.invoiceDate}</td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => { setSelectedInvoice(invoice); setIsDrawerOpen(true); }}
                              className="p-2 hover:bg-slate-100 text-slate-600 hover:text-slate-800 rounded-lg transition-colors cursor-pointer"
                              title="View Ledger"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => { setSelectedInvoice(invoice); setIsPreviewOpen(true); }}
                              className="p-2 hover:bg-slate-100 text-slate-600 hover:text-slate-800 rounded-lg transition-colors cursor-pointer"
                              title="Invoice Preview/Print"
                            >
                              <Printer size={16} />
                            </button>
                            {invoice.status !== "PAID" && (
                              <button
                                onClick={() => handleMarkAsPaid(invoice)}
                                className="p-2 hover:bg-emerald-50 text-emerald-600 hover:text-emerald-700 rounded-lg transition-colors cursor-pointer"
                                title="Mark as Paid"
                              >
                                <Check size={16} />
                              </button>
                            )}
                            {invoice.status === "DRAFT" && (
                              <button
                                onClick={() => { setSelectedInvoice(invoice); setIsFormOpen(true); }}
                                className="p-2 hover:bg-slate-100 text-slate-600 hover:text-slate-800 rounded-lg transition-colors cursor-pointer"
                                title="Edit Draft"
                              >
                                <Edit2 size={16} />
                              </button>
                            )}
                            {invoice.status !== "PAID" && (
                              <button
                                onClick={() => { setSelectedInvoice(invoice); setIsDeleteOpen(true); }}
                                className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors cursor-pointer"
                                title="Delete Invoice"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="text-xs text-slate-500">
                  Showing <span className="font-semibold text-slate-800">{currentPage * pageSize + 1}</span> to <span className="font-semibold text-slate-800">{Math.min(totalElements, (currentPage + 1) * pageSize)}</span> of <span className="font-semibold text-slate-800">{totalElements}</span> entries
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                    disabled={currentPage === 0}
                    className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {Array.from({ length: totalPages }).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentPage(idx)}
                      className={`px-3 py-1 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                        currentPage === idx
                          ? "bg-premium-gradient text-white shadow-sm"
                          : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))}
                    disabled={currentPage === totalPages - 1}
                    className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Overlays */}
      <InvoiceFormModal
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setSelectedInvoice(null); }}
        onSubmit={handleFormSubmit}
        invoice={selectedInvoice}
        isLoading={isSaving}
      />

      <InvoiceDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={() => { setIsDrawerOpen(false); setSelectedInvoice(null); }}
        invoice={selectedInvoice}
      />

      <InvoicePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => { setIsPreviewOpen(false); setSelectedInvoice(null); }}
        invoice={selectedInvoice}
      />

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => { setIsDeleteOpen(false); setSelectedInvoice(null); }}
        onConfirm={handleDeleteConfirm}
        productName={selectedInvoice ? `Invoice ${selectedInvoice.invoiceNo} for ${selectedInvoice.customerName}` : ""}
      />

      {/* Toasts */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 font-sans">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className={`p-4 rounded-xl shadow-lg border flex items-center gap-3 max-w-sm relative ${
                t.type === "error"
                  ? "bg-red-50 text-red-800 border-red-100"
                  : t.type === "info"
                  ? "bg-blue-50 text-blue-800 border-blue-100"
                  : "bg-emerald-50 text-emerald-800 border-emerald-100"
              }`}
            >
              {t.type === "error" ? (
                <AlertCircle className="text-red-500 shrink-0" size={18} />
              ) : t.type === "info" ? (
                <ShieldAlert className="text-blue-500 shrink-0" size={18} />
              ) : (
                <CheckCircle2 className="text-emerald-500 shrink-0" size={18} />
              )}
              <div className="text-xs font-semibold leading-relaxed pr-6">{t.message}</div>
              <button 
                onClick={() => setToasts((prev) => prev.filter((item) => item.id !== t.id))}
                className="text-slate-400 hover:text-slate-600 absolute top-2 right-2 cursor-pointer"
              >
                X
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Invoices;
