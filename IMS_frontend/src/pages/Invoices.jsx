import { useState, useEffect, useCallback } from "react";
import { 
  Search, Plus, Edit2, Trash2, Eye, Filter, ArrowUpDown, 
  ChevronLeft, ChevronRight, FileText, Calendar, DollarSign,
  TrendingUp, CheckCircle2, AlertCircle, RefreshCw, Printer, ShieldAlert, Check, Download
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import invoiceApi from "../api/invoiceApi";
import InvoiceFormModal from "../components/InvoiceFormModal";
import InvoiceDetailsDrawer from "../components/InvoiceDetailsDrawer";
import InvoicePreviewModal from "../components/InvoicePreviewModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import exportApi from "../api/exportApi";

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
  const [isExporting, setIsExporting] = useState(false);

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

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      await exportApi.exportInvoices({
        search: searchVal,
        status: statusFilter,
        paymentStatus: paymentStatusFilter,
        startDate,
        endDate,
        sort: `${sortField},${sortOrder}`
      });
      showToast("Invoices CSV exported successfully", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to export invoices CSV", "error");
    } finally {
      setIsExporting(false);
    }
  };

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

  // Query param id check
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (id) {
      invoiceApi.getInvoice(id)
        .then(data => {
          setSelectedInvoice(data);
          setIsDrawerOpen(true);
        })
        .catch(err => {
          console.warn("Failed to load invoice from query param, using fallback:", err);
          const mockItem = { id: parseInt(id), invoiceNo: "INV-DEMO-01", customerName: "Demo Customer", subtotal: 100, tax: 10, discount: 0, grandTotal: 110, paymentStatus: "PENDING", status: "ISSUED", invoiceDate: new Date().toISOString().split('T')[0], items: [] };
          setSelectedInvoice(mockItem);
          setIsDrawerOpen(true);
        });
    }
  }, []);

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
        return <span className="badge-error">Cancelled</span>;
      case "PAID":
        return <span className="badge-success">Paid</span>;
      case "ISSUED":
        return <span className="badge-info">Issued</span>;
      default:
        return <span className="badge-warning">Draft</span>;
    }
  };

  const getPaymentBadge = (status) => {
    switch (status) {
      case "PAID":
        return <span className="badge-success">Paid</span>;
      case "PARTIALLY_PAID":
        return <span className="badge-info">Partially Paid</span>;
      case "REFUNDED":
        return <span className="badge-error">Refunded</span>;
      default:
        return <span className="badge-warning">Pending</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans antialiased text-slate-900">
      <Sidebar activeTab="invoices" />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        <Header 
          workspaceName="Invoices" 
          title="Invoice Ledger Workspace" 
          onRefresh={async () => { fetchInvoices(); loadStats(); }} 
        />

        {/* Dashboard Grid */}
        <main className="flex-1 p-6 md:p-8 space-y-6 max-w-[1600px] w-full mx-auto">
          
          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card-premium p-6 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Invoices</p>
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{stats.totalInvoicesCount}</h3>
                <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1 mt-2">
                  <span className="material-symbols-outlined text-sm">receipt</span>
                  Billing records issued
                </span>
              </div>
              <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100/50 shadow-sm shrink-0">
                <FileText size={20} />
              </div>
            </div>

            <div className="card-premium p-6 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Revenue</p>
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">${stats.totalRevenue?.toFixed(2)}</h3>
                <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-2">
                  <span className="material-symbols-outlined text-sm">trending_up</span>
                  Gross billing value
                </span>
              </div>
              <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100/50 shadow-sm shrink-0">
                <DollarSign size={20} />
              </div>
            </div>

            <div className="card-premium p-6 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Today's Invoices</p>
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{stats.todayInvoicesCount}</h3>
                <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1 mt-2">
                  <span className="material-symbols-outlined text-sm">today</span>
                  Invoiced in current period
                </span>
              </div>
              <div className="w-11 h-11 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center border border-purple-100/50 shadow-sm shrink-0">
                <TrendingUp size={20} />
              </div>
            </div>

            <div className="card-premium p-6 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Average Invoice Value</p>
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">${stats.averageInvoiceValue?.toFixed(2)}</h3>
                <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1 mt-2">
                  <span className="material-symbols-outlined text-sm">calculate</span>
                  Mean ticket per order
                </span>
              </div>
              <div className="w-11 h-11 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center border border-amber-100/50 shadow-sm shrink-0">
                <DollarSign size={20} />
              </div>
            </div>
          </div>

          {/* Search, filters, grid list */}
          <div className="bg-white p-6 rounded-xl border border-slate-200/70 shadow-sm space-y-4">
            
            <div className="flex flex-col xl:flex-row gap-4 items-center justify-between">
              
              {/* Search Invoice Number or Customer */}
              <div className="relative w-full xl:max-w-xs shrink-0">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                  <Search size={16} />
                </span>
                <input
                  type="text"
                  placeholder="Search Invoice #, Customer..."
                  value={searchVal}
                  onChange={(e) => { setSearchVal(e.target.value); setCurrentPage(0); }}
                  className="input-premium pl-9 py-2"
                />
              </div>

              {/* Advanced multi-filters */}
              <div className="flex flex-wrap items-center gap-3 w-full justify-end">
                <div className="flex items-center gap-2 border border-slate-200 rounded-lg bg-white px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-500 transition-all">
                  <Filter size={14} className="text-slate-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(0); }}
                    className="text-xs text-slate-700 bg-transparent outline-none focus:ring-0 cursor-pointer font-medium"
                  >
                    <option value="">All Statuses</option>
                    <option value="DRAFT">Draft</option>
                    <option value="ISSUED">Issued</option>
                    <option value="PAID">Paid</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 border border-slate-200 rounded-lg bg-white px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-500 transition-all">
                  <select
                    value={paymentStatusFilter}
                    onChange={(e) => { setPaymentStatusFilter(e.target.value); setCurrentPage(0); }}
                    className="text-xs text-slate-700 bg-transparent outline-none focus:ring-0 cursor-pointer font-medium"
                  >
                    <option value="">All Payments</option>
                    <option value="PENDING">Pending</option>
                    <option value="PAID">Paid</option>
                    <option value="PARTIALLY_PAID">Partially Paid</option>
                    <option value="REFUNDED">Refunded</option>
                  </select>
                </div>

                {/* Date range filters */}
                <div className="flex items-center gap-2 border border-slate-200 rounded-lg bg-white px-3 py-2 shadow-sm text-slate-650 text-xs">
                  <Calendar size={14} className="text-slate-400" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => { setStartDate(e.target.value); setCurrentPage(0); }}
                    className="outline-none text-xs text-slate-700 cursor-pointer font-semibold"
                    title="Start Date"
                  />
                  <span className="text-slate-350 text-slate-400 px-1 font-bold">→</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => { setEndDate(e.target.value); setCurrentPage(0); }}
                    className="outline-none text-xs text-slate-700 cursor-pointer font-semibold"
                    title="End Date"
                  />
                  {(startDate || endDate) && (
                    <button 
                      onClick={() => { setStartDate(""); setEndDate(""); }} 
                      className="ml-2 text-rose-500 hover:text-rose-700 font-bold cursor-pointer text-[10px] uppercase tracking-wider bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <button
                  onClick={handleExportCSV}
                  disabled={isExporting}
                  className="btn-secondary py-2 px-3 flex items-center gap-2 text-xs"
                >
                  <Download size={14} className={isExporting ? "animate-spin" : ""} />
                  <span>{isExporting ? "Exporting..." : "Export CSV"}</span>
                </button>

                <button
                  onClick={() => { setSelectedInvoice(null); setIsFormOpen(true); }}
                  className="btn-primary py-2 px-4 flex items-center gap-2 text-xs cursor-pointer shadow-md shadow-blue-500/10 shrink-0 font-semibold"
                >
                  <Plus size={14} />
                  <span>Log Invoice</span>
                </button>
              </div>
            </div>

            {/* Invoices Table Grid */}
            <div className="table-container-premium">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="th-premium cursor-pointer hover:bg-slate-100/50 transition-colors" onClick={() => handleSort("invoiceNo")}>
                        <div className="flex items-center gap-1">
                          <span>Invoice Number</span>
                          <ArrowUpDown size={10} className="text-slate-400" />
                        </div>
                      </th>
                      <th className="th-premium cursor-pointer hover:bg-slate-100/50 transition-colors" onClick={() => handleSort("customerName")}>
                        <div className="flex items-center gap-1">
                          <span>Customer</span>
                          <ArrowUpDown size={10} className="text-slate-400" />
                        </div>
                      </th>
                      <th className="th-premium">Sale Order Ref</th>
                      <th className="th-premium">Items Quantity</th>
                      <th className="th-premium cursor-pointer hover:bg-slate-100/50 transition-colors" onClick={() => handleSort("grandTotal")}>
                        <div className="flex items-center gap-1">
                          <span>Grand Total</span>
                          <ArrowUpDown size={10} className="text-slate-400" />
                        </div>
                      </th>
                      <th className="th-premium">Payment</th>
                      <th className="th-premium">Status</th>
                      <th className="th-premium cursor-pointer hover:bg-slate-100/50 transition-colors" onClick={() => handleSort("invoiceDate")}>
                        <div className="flex items-center gap-1">
                          <span>Invoice Date</span>
                          <ArrowUpDown size={10} className="text-slate-400" />
                        </div>
                      </th>
                      <th className="th-premium text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {isLoading ? (
                      Array.from({ length: pageSize }).map((_, idx) => (
                        <tr key={idx}>
                          <td className="td-premium"><div className="h-4 skeleton-shimmer rounded w-20"></div></td>
                          <td className="td-premium">
                            <div className="h-4 skeleton-shimmer rounded w-24 mb-1"></div>
                            <div className="h-3 skeleton-shimmer rounded w-16"></div>
                          </td>
                          <td className="td-premium"><div className="h-4 skeleton-shimmer rounded w-14"></div></td>
                          <td className="td-premium"><div className="h-4 skeleton-shimmer rounded w-10"></div></td>
                          <td className="td-premium"><div className="h-4 skeleton-shimmer rounded w-12"></div></td>
                          <td className="td-premium"><div className="h-6 skeleton-shimmer rounded-full w-20"></div></td>
                          <td className="td-premium"><div className="h-6 skeleton-shimmer rounded-full w-20"></div></td>
                          <td className="td-premium"><div className="h-4 skeleton-shimmer rounded w-16"></div></td>
                          <td className="td-premium"><div className="h-8 skeleton-shimmer rounded-lg w-32 mx-auto"></div></td>
                        </tr>
                      ))
                    ) : invoices.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="p-12 text-center">
                          <div className="w-14 h-14 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-slate-200 shadow-sm">
                            <FileText size={24} className="stroke-[1.5]" />
                          </div>
                          <p className="text-slate-800 font-bold text-sm">No Invoices Found</p>
                          <p className="text-slate-400 text-xs mt-1">Try refining search parameters or creating a new invoice.</p>
                        </td>
                      </tr>
                    ) : (
                      invoices.map((invoice) => (
                        <tr key={invoice.id} className="tr-premium">
                          <td className="td-premium font-mono text-xs">
                            <span className="bg-slate-100 border border-slate-200/60 px-2 py-0.5 rounded text-slate-655 text-slate-700 font-bold whitespace-nowrap">
                              {invoice.invoiceNo}
                            </span>
                          </td>
                          <td className="td-premium">
                            <div className="font-bold text-slate-800 text-xs">{invoice.customerName}</div>
                            <div className="text-slate-400 text-[10px] font-semibold mt-0.5">{invoice.customerPhone || "No contact"}</div>
                          </td>
                          <td className="td-premium">
                            {invoice.saleNo ? (
                              <span className="font-mono text-[10px] text-slate-500 font-bold bg-slate-150 border border-slate-200/60 px-1.5 py-0.5 rounded">{invoice.saleNo}</span>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-bold italic">Standalone</span>
                            )}
                          </td>
                          <td className="td-premium text-slate-500 text-xs font-semibold">
                            {invoice.items?.reduce((s, item) => s + item.quantity, 0) || 0} items
                          </td>
                          <td className="td-premium text-slate-900 font-extrabold text-xs">
                            ${invoice.grandTotal?.toFixed(2)}
                          </td>
                          <td className="td-premium py-2">{getPaymentBadge(invoice.paymentStatus)}</td>
                          <td className="td-premium py-2">{getStatusBadge(invoice.status)}</td>
                          <td className="td-premium text-slate-500 font-semibold text-xs whitespace-nowrap">{invoice.invoiceDate}</td>
                          <td className="td-premium py-2 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => { setSelectedInvoice(invoice); setIsDrawerOpen(true); }}
                                className="btn-icon hover:bg-slate-100"
                                title="View Ledger"
                              >
                                <Eye size={14} />
                              </button>
                              <button
                                onClick={() => { setSelectedInvoice(invoice); setIsPreviewOpen(true); }}
                                className="btn-icon hover:bg-slate-100"
                                title="Invoice Preview/Print"
                              >
                                <Printer size={14} />
                              </button>
                              {invoice.status !== "PAID" && (
                                <button
                                  onClick={() => handleMarkAsPaid(invoice)}
                                  className="btn-icon hover:bg-emerald-50 text-emerald-600 hover:text-emerald-700"
                                  title="Mark as Paid"
                                >
                                  <Check size={14} className="stroke-[2.5]" />
                                </button>
                              )}
                              {invoice.status === "DRAFT" && (
                                <button
                                  onClick={() => { setSelectedInvoice(invoice); setIsFormOpen(true); }}
                                  className="btn-icon hover:bg-slate-100"
                                  title="Edit Draft"
                                >
                                  <Edit2 size={14} />
                                </button>
                              )}
                              {invoice.status !== "PAID" && (
                                <button
                                  onClick={() => { setSelectedInvoice(invoice); setIsDeleteOpen(true); }}
                                  className="btn-icon hover:bg-rose-50 text-rose-600 hover:text-rose-750"
                                  title="Delete Invoice"
                                >
                                  <Trash2 size={14} />
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
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-100 pt-4 bg-white/50 px-2 rounded-lg">
                <span className="text-xs text-slate-550 text-slate-500 font-medium">
                  Showing <span className="font-bold text-slate-700">{currentPage * pageSize + 1}</span> to <span className="font-bold text-slate-700">{Math.min(totalElements, (currentPage + 1) * pageSize)}</span> of <span className="font-bold text-slate-700">{totalElements}</span> entries
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                    disabled={currentPage === 0}
                    className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  {Array.from({ length: totalPages }).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentPage(idx)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        currentPage === idx
                          ? "bg-blue-600 text-white shadow-sm shadow-blue-500/10"
                          : "border border-slate-205 border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))}
                    disabled={currentPage === totalPages - 1}
                    className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center"
                  >
                    <ChevronRight size={14} />
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
