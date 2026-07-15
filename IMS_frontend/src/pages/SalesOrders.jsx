import { useState, useEffect, useCallback } from "react";
import {
  Search, Plus, Edit2, Trash2, Eye, Filter, ArrowUpDown,
  ChevronLeft, ChevronRight, FileText, Calendar, DollarSign,
  TrendingUp, CheckCircle2, AlertCircle, RefreshCw, Printer, ShoppingCart, ShieldAlert, Receipt, Download
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import salesApi from "../api/salesApi";
import invoiceApi from "../api/invoiceApi";
import apiClient from "../api/apiClient";
import SalesOrderFormModal from "../components/SalesOrderFormModal";
import SalesOrderDetailsDrawer from "../components/SalesOrderDetailsDrawer";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import exportApi from "../api/exportApi";

const SalesOrders = () => {
  // Sales & Filter States
  const [sales, setSales] = useState([]);
  const [stats, setStats] = useState({
    totalSalesCount: 0,
    totalRevenue: 0,
    todaySalesCount: 0,
    todayRevenue: 0,
    monthlySalesCount: 0,
    monthlyRevenue: 0,
    pendingOrdersCount: 0,
    completedOrdersCount: 0,
    cancelledOrdersCount: 0
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
  const [connectionStatus, setConnectionStatus] = useState("checking"); // checking | connected | demo
  const [isExporting, setIsExporting] = useState(false);

  // Modals & Slideouts
  const [selectedSale, setSelectedSale] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
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
      await exportApi.exportSales({
        search: searchVal,
        status: statusFilter,
        paymentStatus: paymentStatusFilter,
        startDate,
        endDate,
        sort: `${sortField},${sortOrder}`
      });
      showToast("Sales Orders CSV exported successfully", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to export sales orders CSV", "error");
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

  // Load Sales statistics
  const loadStats = useCallback(async () => {
    try {
      const data = await salesApi.getStatistics();
      setStats(data);
      setConnectionStatus("connected");
    } catch (err) {
      console.warn("Unable to fetch sales statistics, loading demo fallback:", err);
      setConnectionStatus("demo");
      loadMockStats();
    }
  }, []);

  const loadMockStats = () => {
    setStats({
      totalSalesCount: 42,
      totalRevenue: 8490.50,
      todaySalesCount: 3,
      todayRevenue: 450.00,
      monthlySalesCount: 18,
      monthlyRevenue: 3200.00,
      pendingOrdersCount: 4,
      completedOrdersCount: 35,
      cancelledOrdersCount: 3
    });
  };

  // Fetch sales records
  const fetchSales = useCallback(async () => {
    setIsLoading(true);
    try {
      const sortQuery = `${sortField},${sortOrder}`;
      const data = await salesApi.getSales({
        page: currentPage,
        size: pageSize,
        sort: sortQuery,
        search: searchVal,
        status: statusFilter,
        paymentStatus: paymentStatusFilter,
        startDate: startDate,
        endDate: endDate
      });

      setSales(data.content || []);
      setTotalPages(data.totalPages || 1);
      setTotalElements(data.totalElements || 0);
      setConnectionStatus("connected");
    } catch (err) {
      console.error("Fetch sales error, falling back to mock lists:", err);
      setConnectionStatus("demo");
      loadMockSales();
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, sortField, sortOrder, searchVal, statusFilter, paymentStatusFilter, startDate, endDate]);

  const loadMockSales = () => {
    const mockData = [
      { id: 1, saleNo: "SO-83901928", customerName: "Acme Corporation", customerPhone: "+1 555 0199", customerEmail: "billing@acme.com", saleDate: "2026-07-09", totalAmount: 809.97, status: "COMPLETED", paymentStatus: "PAID", paymentMethod: "BANK_TRANSFER", notes: "Leave at front desk", createdAt: "2026-07-09T17:05:00", items: [{ id: 1, productId: 1, productName: "Logitech MX Master 3S Wireless Mouse", productSku: "LOGI-MX3S-BLK", quantity: 3, unitPrice: 99.99, lineTotal: 299.97 }] },
      { id: 2, saleNo: "SO-12849028", customerName: "Jane Smith", customerPhone: "+1 555 0122", customerEmail: "jane@gmail.com", saleDate: "2026-07-08", totalAmount: 399.99, status: "PENDING", paymentStatus: "PENDING", paymentMethod: "UPI", notes: "", createdAt: "2026-07-08T12:00:00", items: [{ id: 2, productId: 2, productName: "Sony WH-1000XM5 Headphones", productSku: "SONY-WH1000XM5-B", quantity: 1, unitPrice: 399.99, lineTotal: 399.99 }] },
      { id: 3, saleNo: "SO-74920489", customerName: "Bob Johnson", customerPhone: "+1 555 0177", customerEmail: "", saleDate: "2026-07-06", totalAmount: 59.98, status: "CANCELLED", paymentStatus: "REFUNDED", paymentMethod: "CASH", notes: "Customer requested cancel", createdAt: "2026-07-06T10:15:00", items: [{ id: 3, productId: 3, productName: "Ergonomic Memory Foam Cushion", productSku: "CUSH-LUMB-MEM", quantity: 2, unitPrice: 29.99, lineTotal: 59.98 }] }
    ];

    let filtered = mockData;
    if (searchVal) {
      const q = searchVal.toLowerCase();
      filtered = filtered.filter(s => s.saleNo.toLowerCase().includes(q) || s.customerName.toLowerCase().includes(q));
    }
    if (statusFilter) {
      filtered = filtered.filter(s => s.status === statusFilter);
    }
    if (paymentStatusFilter) {
      filtered = filtered.filter(s => s.paymentStatus === paymentStatusFilter);
    }
    if (startDate) {
      filtered = filtered.filter(s => s.saleDate >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter(s => s.saleDate <= endDate);
    }

    filtered.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (typeof valA === "string") {
        return sortOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortOrder === "asc" ? valA - valB : valB - valA;
    });

    setSales(filtered);
    setTotalPages(1);
    setTotalElements(filtered.length);
  };

  // Initialize Data
  useEffect(() => {
    fetchSales();
    loadStats();
  }, [fetchSales, loadStats]);

  // Query param id check
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (id) {
      salesApi.getSale(id)
        .then(data => {
          setSelectedSale(data);
          setIsDrawerOpen(true);
        })
        .catch(err => {
          console.warn("Failed to load sale from query param, using fallback:", err);
          const mockItem = { id: parseInt(id), saleNo: "SO-DEMO-01", customerName: "Demo Customer", totalAmount: 100, paymentStatus: "PENDING", status: "PENDING", saleDate: new Date().toISOString().split('T')[0], items: [] };
          setSelectedSale(mockItem);
          setIsDrawerOpen(true);
        });
    }
  }, []);

  // Form Submit Handler (Supports Create and Update)
  const handleFormSubmit = async (data) => {
    setIsSaving(true);
    try {
      if (selectedSale) {
        await salesApi.updateSale(selectedSale.id, data);
        showToast("Sales order updated successfully!");
      } else {
        await salesApi.createSale(data);
        showToast("Sales order created successfully!");
      }
      setIsFormOpen(false);
      setSelectedSale(null);
      fetchSales();
      loadStats();
    } catch (err) {
      console.error("Save sales order failed:", err);
      if (connectionStatus === "demo") {
        showToast(`Demo Mode: Simulated order transaction for "${data.customerName}"`, "info");
        setIsFormOpen(false);
        setSelectedSale(null);
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Delete/Cancel Handler
  const handleDeleteConfirm = async () => {
    if (!selectedSale) return;
    try {
      await salesApi.deleteSale(selectedSale.id);
      showToast("Sales order deleted successfully and inventory restocked!");
      setIsDeleteOpen(false);
      setSelectedSale(null);
      fetchSales();
      loadStats();
    } catch (err) {
      console.error("Delete order failed:", err);
      if (connectionStatus === "demo") {
        showToast(`Demo Mode: Simulated deletion of order "${selectedSale.saleNo}"`, "info");
        setIsDeleteOpen(false);
        setSelectedSale(null);
      }
    }
  };

  // Print Invoice Mock action
  const handlePrintInvoice = (sale) => {
    showToast(`Invoice compiled for ${sale.saleNo}! Initializing printer spool...`, "success");
    // Mock print window trigger
    setTimeout(() => {
      window.print();
    }, 1000);
  };

  // Generate Invoice from Sale Order
  const handleGenerateInvoice = async (sale) => {
    try {
      await invoiceApi.generateInvoice(sale.id);
      showToast(`Invoice successfully generated for order: ${sale.saleNo}`, "success");
    } catch (err) {
      console.error("Generate invoice failed:", err);
      if (connectionStatus === "demo") {
        showToast(`Demo Mode: Invoice generated for ${sale.saleNo}`, "info");
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

  // Badge Style Helpers
  const getStatusBadge = (status) => {
    switch (status) {
      case "CANCELLED":
        return <span className="inline-block px-3 py-1 bg-red-50 text-red-800 border border-red-100 rounded-full text-xs font-semibold">Cancelled</span>;
      case "COMPLETED":
        return <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-full text-xs font-semibold">Completed</span>;
      case "CONFIRMED":
        return <span className="inline-block px-3 py-1 bg-blue-50 text-blue-800 border border-blue-100 rounded-full text-xs font-semibold">Confirmed</span>;
      default:
        return <span className="inline-block px-3 py-1 bg-amber-50 text-amber-800 border border-amber-100 rounded-full text-xs font-semibold">Pending</span>;
    }
  };

  const getPaymentBadge = (status) => {
    switch (status) {
      case "PAID":
        return <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-full text-xs font-semibold">Paid</span>;
      case "REFUNDED":
        return <span className="inline-block px-3 py-1 bg-red-50 text-red-800 border border-red-100 rounded-full text-xs font-semibold">Refunded</span>;
      default:
        return <span className="inline-block px-3 py-1 bg-amber-50 text-amber-800 border border-amber-100 rounded-full text-xs font-semibold">Pending</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      <Sidebar activeTab="sales-orders" />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">

        <Header 
          workspaceName="Sales Orders" 
          title="Sales & Order Fulfillment" 
          onRefresh={async () => { fetchSales(); loadStats(); }} 
        />

        {/* Dashboard Grid */}
        <main className="flex-1 p-6 md:p-8 space-y-6 max-w-[1600px] w-full mx-auto">

          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card-premium p-6 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Sales Count</p>
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{stats.totalSalesCount}</h3>
                <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1 mt-2">
                  <span className="material-symbols-outlined text-sm">assignment</span>
                  Cumulative orders processed
                </span>
              </div>
              <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100/50 shadow-sm shrink-0">
                <ShoppingCart size={20} />
              </div>
            </div>

            <div className="card-premium p-6 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Sales Revenue</p>
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">${stats.totalRevenue?.toFixed(2)}</h3>
                <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-2">
                  <span className="material-symbols-outlined text-sm">trending_up</span>
                  Gross value generated
                </span>
              </div>
              <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100/50 shadow-sm shrink-0">
                <DollarSign size={20} />
              </div>
            </div>

            <div className="card-premium p-6 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Today's Sales</p>
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">${stats.todayRevenue?.toFixed(2)}</h3>
                <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1 mt-2">
                  <span className="material-symbols-outlined text-sm">today</span>
                  {stats.todaySalesCount} orders logged
                </span>
              </div>
              <div className="w-11 h-11 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center border border-purple-100/50 shadow-sm shrink-0">
                <TrendingUp size={20} />
              </div>
            </div>

            <div className="card-premium p-6 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Orders</p>
                <h3 className={`text-2xl font-bold tracking-tight ${stats.pendingOrdersCount > 0 ? "text-amber-600" : "text-slate-900"}`}>{stats.pendingOrdersCount}</h3>
                <span className={`text-[10px] font-bold flex items-center gap-1 mt-2 ${stats.pendingOrdersCount > 0 ? "text-amber-600" : "text-slate-500"}`}>
                  <span className="material-symbols-outlined text-xs">
                    {stats.pendingOrdersCount > 0 ? "pending_actions" : "check_circle"}
                  </span>
                  {stats.pendingOrdersCount > 0 ? "Requires fulfillment" : "All orders processed"}
                </span>
              </div>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center border shadow-sm shrink-0 ${stats.pendingOrdersCount > 0 ? "bg-amber-50 text-amber-600 border-amber-100/50" : "bg-slate-50 text-slate-500 border-slate-100"}`}>
                <ShieldAlert size={20} />
              </div>
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">

            {/* Search, Filter selects, Date range */}
            <div className="flex flex-col xl:flex-row gap-4 items-center justify-between">

              {/* Search Order Number or Customer */}
              <div className="relative w-full xl:max-w-xs shrink-0">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Search size={18} />
                </span>
                <input
                  type="text"
                  placeholder="Search SO #, customer..."
                  value={searchVal}
                  onChange={(e) => { setSearchVal(e.target.value); setCurrentPage(0); }}
                  className="input-premium pl-10 py-2"
                />
              </div>

              {/* Advanced multi-filters */}
              <div className="flex flex-wrap items-center gap-3 w-full justify-end">
                <div className="flex items-center gap-2 border border-slate-200 px-3 py-2 rounded-lg bg-white shadow-sm focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-500 transition-all">
                  <Filter size={16} className="text-slate-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(0); }}
                    className="text-xs font-semibold text-slate-700 bg-transparent outline-none focus:ring-0 cursor-pointer"
                  >
                    <option value="">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 border border-slate-200 px-3 py-2 rounded-lg bg-white shadow-sm focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-500 transition-all">
                  <select
                    value={paymentStatusFilter}
                    onChange={(e) => { setPaymentStatusFilter(e.target.value); setCurrentPage(0); }}
                    className="text-xs font-semibold text-slate-700 bg-transparent outline-none focus:ring-0 cursor-pointer"
                  >
                    <option value="">All Payments</option>
                    <option value="PENDING">Pending</option>
                    <option value="PAID">Paid</option>
                    <option value="REFUNDED">Refunded</option>
                  </select>
                </div>

                {/* Date Filters */}
                <div className="flex items-center gap-1.5 border border-slate-200 px-3 py-1.5 rounded-lg bg-white text-slate-650 text-xs shadow-sm font-semibold">
                  <Calendar size={14} className="text-slate-400" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => { setStartDate(e.target.value); setCurrentPage(0); }}
                    className="outline-none text-xs text-slate-700 cursor-pointer bg-transparent"
                    title="Start Date"
                  />
                  <span className="text-slate-300">to</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => { setEndDate(e.target.value); setCurrentPage(0); }}
                    className="outline-none text-xs text-slate-700 cursor-pointer bg-transparent"
                    title="End Date"
                  />
                  {(startDate || endDate) && (
                    <button
                      onClick={() => { setStartDate(""); setEndDate(""); }}
                      className="ml-1 text-slate-450 hover:text-slate-650 cursor-pointer text-xs"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <button
                  onClick={handleExportCSV}
                  disabled={isExporting}
                  className="btn-secondary py-2 px-3.5 text-xs flex items-center gap-2"
                >
                  <Download size={14} className={isExporting ? "animate-spin" : ""} />
                  <span>{isExporting ? "Exporting..." : "Export CSV"}</span>
                </button>

                <button
                  onClick={() => { setSelectedSale(null); setIsFormOpen(true); }}
                  className="btn-primary py-2 px-4 text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-blue-500/10"
                >
                  <Plus size={14} />
                  <span>Log Sales Order</span>
                </button>
              </div>
            </div>

            {/* Sales Table grid */}
            <div className="table-container-premium">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="th-premium cursor-pointer hover:bg-slate-100/50 transition-colors" onClick={() => handleSort("saleNo")}>
                        <div className="flex items-center gap-1">
                          <span>Order Number</span>
                          <ArrowUpDown size={10} className="text-slate-400" />
                        </div>
                      </th>
                      <th className="th-premium cursor-pointer hover:bg-slate-100/50 transition-colors" onClick={() => handleSort("customerName")}>
                        <div className="flex items-center gap-1">
                          <span>Customer</span>
                          <ArrowUpDown size={10} className="text-slate-400" />
                        </div>
                      </th>
                      <th className="th-premium">Items Quantity</th>
                      <th className="th-premium cursor-pointer hover:bg-slate-100/50 transition-colors" onClick={() => handleSort("totalAmount")}>
                        <div className="flex items-center gap-1">
                          <span>Total Amount</span>
                          <ArrowUpDown size={10} className="text-slate-400" />
                        </div>
                      </th>
                      <th className="th-premium cursor-pointer hover:bg-slate-100/50 transition-colors" onClick={() => handleSort("status")}>
                        <div className="flex items-center gap-1">
                          <span>Status</span>
                          <ArrowUpDown size={10} className="text-slate-400" />
                        </div>
                      </th>
                      <th className="th-premium">Payment Status</th>
                      <th className="th-premium cursor-pointer hover:bg-slate-100/50 transition-colors" onClick={() => handleSort("saleDate")}>
                        <div className="flex items-center gap-1">
                          <span>Order Date</span>
                          <ArrowUpDown size={10} className="text-slate-400" />
                        </div>
                      </th>
                      <th className="th-premium text-center font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {isLoading ? (
                      // Skeleton rows
                      Array.from({ length: pageSize }).map((_, idx) => (
                        <tr key={idx}>
                          <td className="td-premium"><div className="h-4 skeleton-shimmer rounded w-20"></div></td>
                          <td className="td-premium">
                            <div className="h-4 skeleton-shimmer rounded w-24 mb-1.5"></div>
                            <div className="h-3 skeleton-shimmer rounded w-16"></div>
                          </td>
                          <td className="td-premium"><div className="h-4 skeleton-shimmer rounded w-10"></div></td>
                          <td className="td-premium"><div className="h-4 skeleton-shimmer rounded w-12"></div></td>
                          <td className="td-premium"><div className="h-6 skeleton-shimmer rounded-full w-20"></div></td>
                          <td className="td-premium"><div className="h-6 skeleton-shimmer rounded-full w-20"></div></td>
                          <td className="td-premium"><div className="h-4 skeleton-shimmer rounded w-16"></div></td>
                          <td className="td-premium"><div className="h-8 skeleton-shimmer rounded-lg w-28 mx-auto"></div></td>
                        </tr>
                      ))
                    ) : sales.length === 0 ? (
                      // Empty State
                      <tr>
                        <td colSpan="8" className="p-12 text-center">
                          <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-slate-200">
                            <FileText size={28} />
                          </div>
                          <p className="text-slate-800 font-semibold text-base">No Sales Orders Found</p>
                          <p className="text-slate-500 text-xs mt-1">Try refining search parameters or logging a new sales order transaction.</p>
                        </td>
                      </tr>
                    ) : (
                      // Data Rows
                      sales.map((sale) => (
                        <tr key={sale.id} className="tr-premium">
                          <td className="td-premium py-3 font-mono text-xs">
                            <span className="bg-slate-100 border border-slate-200/60 px-2 py-0.5 rounded text-slate-700 font-bold whitespace-nowrap">
                              {sale.saleNo}
                            </span>
                          </td>
                          <td className="td-premium py-3">
                            <div className="font-bold text-slate-800 text-xs">{sale.customerName}</div>
                            <div className="text-slate-400 text-[10px] font-semibold mt-0.5">{sale.customerPhone || "No contact"}</div>
                          </td>
                          <td className="td-premium text-slate-500 text-xs font-semibold">
                            {sale.items?.reduce((s, item) => s + item.quantity, 0) || 0} items
                          </td>
                          <td className="td-premium text-slate-900 font-extrabold text-xs">
                            ${sale.totalAmount?.toFixed(2)}
                          </td>
                          <td className="td-premium py-2">{getStatusBadge(sale.status)}</td>
                          <td className="td-premium py-2">{getPaymentBadge(sale.paymentStatus)}</td>
                          <td className="td-premium text-slate-500 font-semibold text-xs whitespace-nowrap">{sale.saleDate}</td>
                          <td className="td-premium py-2 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => { setSelectedSale(sale); setIsDrawerOpen(true); }}
                                className="btn-icon hover:bg-slate-100"
                                title="View Details"
                              >
                                <Eye size={14} />
                              </button>
                              <button
                                onClick={() => { setSelectedSale(sale); setIsFormOpen(true); }}
                                className="btn-icon hover:bg-slate-100"
                                title="Edit Details"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => handleGenerateInvoice(sale)}
                                className="btn-icon hover:bg-blue-50 text-blue-600 hover:text-blue-700"
                                title="Generate Invoice"
                              >
                                <Receipt size={14} />
                              </button>
                              <button
                                onClick={() => handlePrintInvoice(sale)}
                                className="btn-icon hover:bg-slate-100"
                                title="Print Invoice"
                              >
                                <Printer size={14} />
                              </button>
                              <button
                                onClick={() => { setSelectedSale(sale); setIsDeleteOpen(true); }}
                                className="btn-icon hover:bg-rose-50 text-rose-650 text-rose-500 hover:text-rose-700"
                                title="Delete Order"
                              >
                                <Trash2 size={14} />
                              </button>
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
                      className={`px-3 py-1 text-sm font-semibold rounded-lg transition-all cursor-pointer ${currentPage === idx
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

      {/* Overlays & Slideouts */}
      <SalesOrderFormModal
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setSelectedSale(null); }}
        onSubmit={handleFormSubmit}
        sale={selectedSale}
        isLoading={isSaving}
      />

      <SalesOrderDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={() => { setIsDrawerOpen(false); setSelectedSale(null); }}
        sale={selectedSale}
      />

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => { setIsDeleteOpen(false); setSelectedSale(null); }}
        onConfirm={handleDeleteConfirm}
        productName={selectedSale ? `Order ${selectedSale.saleNo} for ${selectedSale.customerName}` : ""}
      />

      {/* Toasts Banner list */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 font-sans">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className={`p-4 rounded-xl shadow-lg border flex items-center gap-3 max-w-sm relative ${t.type === "error"
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

export default SalesOrders;
