import { useState, useEffect, useCallback } from "react";
import { 
  Search, Plus, Edit2, Trash2, Eye, Filter, ArrowUpDown, 
  ChevronLeft, ChevronRight, FileText, Calendar, DollarSign,
  TrendingUp, CheckCircle2, AlertCircle, RefreshCw, Printer, ShoppingBag, ShieldAlert
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../components/Sidebar";
import purchaseApi from "../api/purchaseApi";
import PurchaseFormModal from "../components/PurchaseFormModal";
import PurchaseDetailsDrawer from "../components/PurchaseDetailsDrawer";
import DeleteConfirmModal from "../components/DeleteConfirmModal";

const Purchases = () => {
  // Purchases & Stats States
  const [purchases, setPurchases] = useState([]);
  const [stats, setStats] = useState({
    totalPurchasesCount: 0,
    totalExpense: 0,
    todayPurchasesCount: 0,
    todayExpense: 0,
    monthlyPurchasesCount: 0,
    monthlyExpense: 0,
    pendingPurchasesCount: 0,
    receivedPurchasesCount: 0,
    cancelledPurchasesCount: 0
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
  const [selectedPurchase, setSelectedPurchase] = useState(null);
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
      const data = await purchaseApi.getStatistics();
      setStats(data);
      setConnectionStatus("connected");
    } catch (err) {
      console.warn("Unable to fetch purchase statistics, loading demo fallback:", err);
      setConnectionStatus("demo");
      loadMockStats();
    }
  }, []);

  const loadMockStats = () => {
    setStats({
      totalPurchasesCount: 15,
      totalExpense: 12450.00,
      todayPurchasesCount: 2,
      todayExpense: 1800.00,
      monthlyPurchasesCount: 8,
      monthlyExpense: 7500.00,
      pendingPurchasesCount: 3,
      receivedPurchasesCount: 11,
      cancelledPurchasesCount: 1
    });
  };

  // Fetch Purchases list
  const fetchPurchases = useCallback(async () => {
    setIsLoading(true);
    try {
      const sortQuery = `${sortField},${sortOrder}`;
      const data = await purchaseApi.getPurchases({
        page: currentPage,
        size: pageSize,
        sort: sortQuery,
        search: searchVal,
        status: statusFilter,
        paymentStatus: paymentStatusFilter,
        startDate: startDate,
        endDate: endDate
      });

      setPurchases(data.content || []);
      setTotalPages(data.totalPages || 1);
      setTotalElements(data.totalElements || 0);
      setConnectionStatus("connected");
    } catch (err) {
      console.error("Fetch purchases error, falling back to mock lists:", err);
      setConnectionStatus("demo");
      loadMockPurchases();
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, sortField, sortOrder, searchVal, statusFilter, paymentStatusFilter, startDate, endDate]);

  const loadMockPurchases = () => {
    const mockData = [
      { id: 1, purchaseNo: "PO-29402910", supplierName: "Intel Corporation", supplierPhone: "+1 555 9012", supplierEmail: "sales@intel.com", purchaseDate: "2026-07-09", totalAmount: 4099.90, status: "RECEIVED", paymentStatus: "PAID", paymentMethod: "BANK_TRANSFER", invoiceNo: "INV-INTEL-831", notes: "Direct stock replenishment", createdAt: "2026-07-09T16:00:00", items: [{ id: 1, productId: 1, productName: "Intel Core i7-14700K Desktop Processor", productSku: "INTEL-I7-14700K", quantity: 10, unitPrice: 409.99, lineTotal: 4099.90 }] },
      { id: 2, purchaseNo: "PO-82910482", supplierName: "Sony Electronics", supplierPhone: "+1 555 8312", supplierEmail: "b2b@sony.com", purchaseDate: "2026-07-08", totalAmount: 1199.97, status: "PENDING", paymentStatus: "PENDING", paymentMethod: "CARD", invoiceNo: "", notes: "", createdAt: "2026-07-08T10:30:00", items: [{ id: 2, productId: 2, productName: "Sony WH-1000XM5 Headphones", productSku: "SONY-WH1000XM5-B", quantity: 3, unitPrice: 399.99, lineTotal: 1199.97 }] },
      { id: 3, purchaseNo: "PO-73820193", supplierName: "Paper Supplies Ltd", supplierPhone: "+1 555 1204", supplierEmail: "", purchaseDate: "2026-07-05", totalAmount: 174.95, status: "CANCELLED", paymentStatus: "CANCELLED", paymentMethod: "CASH", invoiceNo: "INV-PAP-099", notes: "Duplicate logging, cancelled.", createdAt: "2026-07-05T09:00:00", items: [{ id: 3, productId: 3, productName: "A4 Multipurpose Copy Paper Case", productSku: "PAPER-A4-CASE", quantity: 5, unitPrice: 34.99, lineTotal: 174.95 }] }
    ];

    let filtered = mockData;
    if (searchVal) {
      const q = searchVal.toLowerCase();
      filtered = filtered.filter(p => p.purchaseNo.toLowerCase().includes(q) || p.supplierName.toLowerCase().includes(q));
    }
    if (statusFilter) {
      filtered = filtered.filter(p => p.status === statusFilter);
    }
    if (paymentStatusFilter) {
      filtered = filtered.filter(p => p.paymentStatus === paymentStatusFilter);
    }
    if (startDate) {
      filtered = filtered.filter(p => p.purchaseDate >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter(p => p.purchaseDate <= endDate);
    }

    filtered.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (typeof valA === "string") {
        return sortOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortOrder === "asc" ? valA - valB : valB - valA;
    });

    setPurchases(filtered);
    setTotalPages(1);
    setTotalElements(filtered.length);
  };

  // Initialize Data
  useEffect(() => {
    fetchPurchases();
    loadStats();
  }, [fetchPurchases, loadStats]);

  // Form Submit Handler
  const handleFormSubmit = async (data) => {
    setIsSaving(true);
    try {
      if (selectedPurchase) {
        await purchaseApi.updatePurchase(selectedPurchase.id, data);
        showToast("Purchase updated successfully!");
      } else {
        await purchaseApi.createPurchase(data);
        showToast("Purchase logged successfully!");
      }
      setIsFormOpen(false);
      setSelectedPurchase(null);
      fetchPurchases();
      loadStats();
    } catch (err) {
      console.error("Save purchase order failed:", err);
      if (connectionStatus === "demo") {
        showToast(`Demo Mode: Simulated purchase logged for "${data.supplierName}"`, "info");
        setIsFormOpen(false);
        setSelectedPurchase(null);
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Purchase
  const handleDeleteConfirm = async () => {
    if (!selectedPurchase) return;
    try {
      await purchaseApi.deletePurchase(selectedPurchase.id);
      showToast("Purchase order deleted successfully and inventory adjusted!");
      setIsDeleteOpen(false);
      setSelectedPurchase(null);
      fetchPurchases();
      loadStats();
    } catch (err) {
      console.error("Delete purchase failed:", err);
      if (connectionStatus === "demo") {
        showToast(`Demo Mode: Simulated deletion of purchase "${selectedPurchase.purchaseNo}"`, "info");
        setIsDeleteOpen(false);
        setSelectedPurchase(null);
      }
    }
  };

  // Print invoice spool placeholder
  const handlePrintPurchase = (purchase) => {
    showToast(`Purchase order receipt spooled for ${purchase.purchaseNo}!`, "success");
    setTimeout(() => {
      window.print();
    }, 1000);
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

  // Badge styles helpers
  const getStatusBadge = (status) => {
    switch (status) {
      case "CANCELLED":
        return <span className="inline-block px-3 py-1 bg-red-50 text-red-800 border border-red-100 rounded-full text-xs font-semibold">Cancelled</span>;
      case "RECEIVED":
        return <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-full text-xs font-semibold">Received</span>;
      default:
        return <span className="inline-block px-3 py-1 bg-amber-50 text-amber-800 border border-amber-100 rounded-full text-xs font-semibold">Pending</span>;
    }
  };

  const getPaymentBadge = (status) => {
    switch (status) {
      case "PAID":
        return <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-full text-xs font-semibold">Paid</span>;
      case "CANCELLED":
        return <span className="inline-block px-3 py-1 bg-red-50 text-red-800 border border-red-100 rounded-full text-xs font-semibold">Cancelled</span>;
      default:
        return <span className="inline-block px-3 py-1 bg-amber-50 text-amber-800 border border-amber-100 rounded-full text-xs font-semibold">Pending</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      <Sidebar activeTab="purchases" />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Header */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 md:px-8 z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <h2 className="text-xl text-slate-800 font-semibold">Purchase Management</h2>
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
              onClick={() => { fetchPurchases(); loadStats(); }} 
              className="p-2 hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
              title="Refresh Purchases"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </header>

        {/* Dashboard Grid */}
        <main className="flex-1 p-6 md:p-8 space-y-8 max-w-[1600px] w-full mx-auto">
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Purchases</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.totalPurchasesCount}</h3>
              </div>
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <ShoppingBag size={24} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Aggregate Purchase Cost</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">${stats.totalExpense?.toFixed(2)}</h3>
              </div>
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                <DollarSign size={24} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Today's Purchases</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">${stats.todayExpense?.toFixed(2)}</h3>
                <span className="text-[10px] text-slate-400 font-semibold">{stats.todayPurchasesCount} purchases logged</span>
              </div>
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                <TrendingUp size={24} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Pending Purchases</p>
                <h3 className={`text-2xl font-bold mt-1 ${stats.pendingPurchasesCount > 0 ? "text-amber-600" : "text-slate-900"}`}>{stats.pendingPurchasesCount}</h3>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stats.pendingPurchasesCount > 0 ? "bg-amber-50 text-amber-600" : "bg-slate-50 text-slate-500"}`}>
                <ShieldAlert size={24} />
              </div>
            </div>
          </div>

          {/* Search, filters, listings */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            
            <div className="flex flex-col xl:flex-row gap-4 items-center justify-between">
              {/* Search Bar */}
              <div className="relative w-full xl:max-w-xs shrink-0">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Search size={18} />
                </span>
                <input
                  type="text"
                  placeholder="Search PO #, supplier..."
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
                    <option value="PENDING">Pending</option>
                    <option value="RECEIVED">Received</option>
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
                    <option value="CANCELLED">Cancelled</option>
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
                  onClick={() => { setSelectedPurchase(null); setIsFormOpen(true); }}
                  className="bg-premium-gradient hover:bg-premium-gradient-dark text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all shadow-md cursor-pointer shrink-0"
                >
                  <Plus size={16} />
                  <span>Log Purchase</span>
                </button>
              </div>
            </div>

            {/* Purchases Table Grid */}
            <div className="overflow-x-auto border border-slate-100 rounded-lg">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50">
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort("purchaseNo")}>
                      <div className="flex items-center gap-1">
                        <span>Purchase Number</span>
                        <ArrowUpDown size={12} />
                      </div>
                    </th>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort("supplierName")}>
                      <div className="flex items-center gap-1">
                        <span>Supplier</span>
                        <ArrowUpDown size={12} />
                      </div>
                    </th>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Items Quantity</th>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort("totalAmount")}>
                      <div className="flex items-center gap-1">
                        <span>Total Cost</span>
                        <ArrowUpDown size={12} />
                      </div>
                    </th>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort("status")}>
                      <div className="flex items-center gap-1">
                        <span>Status</span>
                        <ArrowUpDown size={12} />
                      </div>
                    </th>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Payment Status</th>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort("purchaseDate")}>
                      <div className="flex items-center gap-1">
                        <span>Purchase Date</span>
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
                        <td className="p-4"><div className="h-4 bg-slate-100 rounded w-10"></div></td>
                        <td className="p-4"><div className="h-4 bg-slate-100 rounded w-12"></div></td>
                        <td className="p-4"><div className="h-6 bg-slate-100 rounded-full w-20"></div></td>
                        <td className="p-4"><div className="h-6 bg-slate-100 rounded-full w-20"></div></td>
                        <td className="p-4"><div className="h-4 bg-slate-100 rounded w-16"></div></td>
                        <td className="p-4"><div className="h-8 bg-slate-100 rounded-lg w-28 mx-auto"></div></td>
                      </tr>
                    ))
                  ) : purchases.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="p-12 text-center">
                        <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-slate-200">
                          <FileText size={28} />
                        </div>
                        <p className="text-slate-800 font-semibold text-base">No Purchases Found</p>
                        <p className="text-slate-500 text-xs mt-1">Try refining search parameters or logging a new purchase order.</p>
                      </td>
                    </tr>
                  ) : (
                    purchases.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4">
                          <span className="font-mono text-xs bg-slate-100 border border-slate-200/60 px-2 py-1 rounded text-slate-700 font-semibold whitespace-nowrap">
                            {p.purchaseNo}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="font-semibold text-slate-800 text-sm">{p.supplierName}</div>
                          <div className="text-slate-400 text-xs mt-0.5">{p.supplierPhone}</div>
                        </td>
                        <td className="p-4 text-slate-700 text-sm font-semibold">
                          {p.items?.reduce((s, item) => s + item.quantity, 0) || 0} items
                        </td>
                        <td className="p-4 text-slate-900 font-extrabold text-sm">
                          ${p.totalAmount?.toFixed(2)}
                        </td>
                        <td className="p-4">{getStatusBadge(p.status)}</td>
                        <td className="p-4">{getPaymentBadge(p.paymentStatus)}</td>
                        <td className="p-4 text-slate-500 text-sm whitespace-nowrap">{p.purchaseDate}</td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => { setSelectedPurchase(p); setIsDrawerOpen(true); }}
                              className="p-2 hover:bg-slate-100 text-slate-600 hover:text-slate-800 rounded-lg transition-colors cursor-pointer"
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => { setSelectedPurchase(p); setIsFormOpen(true); }}
                              className="p-2 hover:bg-slate-100 text-slate-600 hover:text-slate-800 rounded-lg transition-colors cursor-pointer"
                              title="Edit Details"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handlePrintPurchase(p)}
                              className="p-2 hover:bg-slate-100 text-slate-600 hover:text-slate-800 rounded-lg transition-colors cursor-pointer"
                              title="Print PO"
                            >
                              <Printer size={16} />
                            </button>
                            <button
                              onClick={() => { setSelectedPurchase(p); setIsDeleteOpen(true); }}
                              className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors cursor-pointer"
                              title="Delete Purchase"
                            >
                              <Trash2 size={16} />
                            </button>
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
      <PurchaseFormModal
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setSelectedPurchase(null); }}
        onSubmit={handleFormSubmit}
        purchase={selectedPurchase}
        isLoading={isSaving}
      />

      <PurchaseDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={() => { setIsDrawerOpen(false); setSelectedPurchase(null); }}
        purchase={selectedPurchase}
      />

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => { setIsDeleteOpen(false); setSelectedPurchase(null); }}
        onConfirm={handleDeleteConfirm}
        productName={selectedPurchase ? `Purchase order ${selectedPurchase.purchaseNo} from ${selectedPurchase.supplierName}` : ""}
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

export default Purchases;
