import { useState, useEffect, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { getApiUrl } from "../api/config";
import { 
  ArrowUpRight, ArrowDownRight, RefreshCw, PlusCircle, Calendar, 
  Search, SlidersHorizontal, ArrowLeft, ArrowRight, X, Sparkles, TrendingUp, Info
} from "lucide-react";

const StockMovements = () => {
  const [movements, setMovements] = useState([]);
  const [summary, setSummary] = useState(null);
  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [connectionStatus, setConnectionStatus] = useState("connected");

  // Filters
  const [selectedProductFilter, setSelectedProductFilter] = useState("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState("");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [searchVal, setSearchVal] = useState("");

  // Adjustment Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetProductId, setTargetProductId] = useState("");
  const [adjustmentType, setAdjustmentType] = useState("ADJUSTMENT");
  const [differenceQty, setDifferenceQty] = useState("");
  const [remarks, setRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");

  // Fetch list of products for filters and modal
  const fetchProductsList = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    try {
      const res = await fetch(`${getApiUrl()}/products?page=0&size=100`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(data.content || []);
      }
    } catch (err) {
      console.warn("Products fetch failed:", err);
    }
  };

  // Fetch Summary statistics
  const fetchSummary = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      loadMockSummary();
      return;
    }
    try {
      const res = await fetch(`${getApiUrl()}/movements/summary`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSummary(data);
      }
    } catch (err) {
      console.warn("Summary fetch failed:", err);
      loadMockSummary();
    }
  };

  const loadMockSummary = () => {
    setSummary({
      totalIncoming: 1450,
      totalOutgoing: 890,
      mostAdjustedProducts: [
        { productName: "Wireless Mouse", sku: "MX3S", adjustmentCount: 12, netChange: -45 },
        { productName: "Mesh Chair", sku: "CHAIR-ERG", adjustmentCount: 8, netChange: 15 },
        { productName: "WiFi 6 Router", sku: "AX86U", adjustmentCount: 5, netChange: -8 }
      ]
    });
  };

  // Fetch movement logs
  const fetchMovements = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg("");
    const token = localStorage.getItem("authToken");

    if (!token) {
      loadMockMovements();
      setIsLoading(false);
      setConnectionStatus("demo");
      return;
    }

    try {
      let url = `${getApiUrl()}/movements?page=${currentPage}&size=${pageSize}&sort=timestamp,desc`;
      if (selectedProductFilter) url += `&productId=${selectedProductFilter}`;
      if (selectedTypeFilter) url += `&movementType=${selectedTypeFilter}`;
      if (startDateFilter) url += `&startDate=${startDateFilter}T00:00:00`;
      if (endDateFilter) url += `&endDate=${endDateFilter}T23:59:59`;
      if (searchVal) url += `&search=${searchVal}`;

      const res = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (res.ok) {
        const data = await res.json();
        setMovements(data.content || []);
        setTotalPages(data.totalPages || 1);
        setConnectionStatus("connected");
      } else {
        setErrorMsg("Failed to retrieve ledger logs. Showing demo logs.");
        loadMockMovements();
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Backend offline. Displaying demo movements.");
      loadMockMovements();
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, selectedProductFilter, selectedTypeFilter, startDateFilter, endDateFilter, searchVal]);

  const loadMockMovements = () => {
    setMovements([
      { id: 1, movementNo: "SM-124591", referenceNo: "ADJ-492", productName: "Logitech MX Master 3S Wireless Mouse", productSku: "LOGI-MX3S-BLK", previousQuantity: 28, newQuantity: 25, difference: -3, movementType: "ADJUSTMENT", performedByFullName: "John Doe", timestamp: new Date(Date.now() - 3600000).toISOString(), remarks: "Damaged item removed" },
      { id: 2, movementNo: "SM-124590", referenceNo: "PO-9020", productName: "ASUS RT-AX86U Dual-Band WiFi 6 Router", productSku: "ASUS-RT-AX86U", previousQuantity: 0, newQuantity: 3, difference: 3, movementType: "PURCHASE", performedByFullName: "System Auto", timestamp: new Date(Date.now() - 7200000).toISOString(), remarks: "Purchase order completed" },
      { id: 3, movementNo: "SM-124589", referenceNo: "SO-9021", productName: "Logitech MX Master 3S Wireless Mouse", productSku: "LOGI-MX3S-BLK", previousQuantity: 30, newQuantity: 28, difference: -2, movementType: "SALE", performedByFullName: "Jane Smith", timestamp: new Date(Date.now() - 86400000).toISOString(), remarks: "Sales Order Fulfilled" }
    ]);
    setTotalPages(1);
  };

  useEffect(() => {
    fetchProductsList();
    fetchSummary();
  }, []);

  useEffect(() => {
    fetchMovements();
  }, [fetchMovements]);

  // Handle Manual Stock Adjustment
  const handleAdjustmentSubmit = async (e) => {
    e.preventDefault();
    setModalError("");
    setIsSubmitting(true);

    if (!targetProductId || !differenceQty || !remarks) {
      setModalError("Please fill in all fields.");
      setIsSubmitting(false);
      return;
    }

    const token = localStorage.getItem("authToken");
    const diffVal = parseInt(differenceQty, 10);
    if (isNaN(diffVal) || diffVal === 0) {
      setModalError("Difference quantity must be a non-zero integer.");
      setIsSubmitting(false);
      return;
    }

    if (!token) {
      // Demo Mode
      const selectedProd = products.find(p => p.id === parseInt(targetProductId, 10)) || { name: "Demo Product", sku: "DEMO" };
      const newMockEntry = {
        id: Date.now(),
        movementNo: "SM-" + Math.floor(Math.random() * 900000),
        referenceNo: "ADJ-MOCK",
        productName: selectedProd.name,
        productSku: selectedProd.sku,
        previousQuantity: 10,
        newQuantity: 10 + diffVal,
        difference: diffVal,
        movementType: adjustmentType,
        performedByFullName: "Workspace Administrator (Demo)",
        timestamp: new Date().toISOString(),
        remarks: remarks
      };
      setMovements(prev => [newMockEntry, ...prev]);
      setIsModalOpen(false);
      setIsSubmitting(false);
      resetModalForm();
      return;
    }

    try {
      const res = await fetch(`${getApiUrl()}/movements/adjust`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          productId: targetProductId,
          difference: diffVal,
          type: adjustmentType,
          remarks: remarks
        })
      });

      if (res.ok) {
        setIsModalOpen(false);
        resetModalForm();
        fetchMovements();
        fetchSummary();
      } else {
        const errorText = await res.text();
        setModalError(errorText || "Failed to submit adjustment.");
      }
    } catch (err) {
      console.error(err);
      setModalError("Server connection failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetModalForm = () => {
    setTargetProductId("");
    setDifferenceQty("");
    setRemarks("");
    setAdjustmentType("ADJUSTMENT");
    setModalError("");
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "PURCHASE":
        return "bg-emerald-50 text-emerald-700 border-emerald-150";
      case "SALE":
        return "bg-blue-50 text-blue-700 border-blue-150";
      case "ADJUSTMENT":
        return "bg-purple-50 text-purple-700 border-purple-150";
      case "RETURN":
        return "bg-amber-50 text-amber-700 border-amber-150";
      default:
        return "bg-slate-50 text-slate-700 border-slate-150";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans antialiased text-slate-900">
      <Sidebar activeTab="stock-movements" />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header 
          workspaceName="Audit Trail" 
          title="Stock Ledger Audit Log" 
          onRefresh={fetchMovements} 
        />

        <main className="flex-1 p-6 md:p-8 space-y-6 max-w-[1600px] w-full mx-auto">
          
          {errorMsg && (
            <div className="p-4 bg-amber-50/80 border border-amber-200/70 text-amber-900 rounded-xl flex items-center gap-3 shadow-sm">
              <span className="material-symbols-outlined text-amber-600 text-lg">info</span>
              <p className="text-xs font-semibold leading-relaxed">{errorMsg}</p>
            </div>
          )}

          {/* Top Analytical BI cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card-premium p-6 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Ledger Volume</p>
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                  {(summary?.totalIncoming || 0) + (summary?.totalOutgoing || 0)} Units
                </h3>
                <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1 mt-2">
                  Total ledger adjustments registered
                </span>
              </div>
              <div className="w-11 h-11 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center border border-slate-150 shadow-sm shrink-0">
                <TrendingUp size={18} />
              </div>
            </div>

            <div className="card-premium p-6 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Incoming Restocks</p>
                <h3 className="text-2xl font-bold text-emerald-600 tracking-tight">
                  +{summary?.totalIncoming || 0} Units
                </h3>
                <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-2">
                  <ArrowUpRight size={12} /> Stock additions
                </span>
              </div>
              <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100/50 shadow-sm shrink-0">
                <ArrowUpRight size={18} />
              </div>
            </div>

            <div className="card-premium p-6 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Outgoing Shipments</p>
                <h3 className="text-2xl font-bold text-rose-600 tracking-tight">
                  -{summary?.totalOutgoing || 0} Units
                </h3>
                <span className="text-[10px] text-rose-600 font-bold flex items-center gap-1 mt-2">
                  <ArrowDownRight size={12} /> Stock deductions
                </span>
              </div>
              <div className="w-11 h-11 bg-red-50 text-red-600 rounded-xl flex items-center justify-center border border-red-100/50 shadow-sm shrink-0">
                <ArrowDownRight size={18} />
              </div>
            </div>
          </div>

          {/* Operation & Action Bar */}
          <div className="bg-white p-6 rounded-xl border border-slate-200/70 shadow-sm space-y-4">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              
              {/* Search bar & Type selection */}
              <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                <div className="relative w-full sm:max-w-xs">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                    <Search size={14} />
                  </span>
                  <input
                    type="text"
                    placeholder="Search ledger remarks or ref..."
                    value={searchVal}
                    onChange={(e) => { setSearchVal(e.target.value); setCurrentPage(0); }}
                    className="input-premium pl-9 py-2"
                  />
                </div>

                <div className="flex items-center gap-2 border border-slate-200 px-3 py-2 rounded-lg bg-white shadow-sm focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-500 transition-all">
                  <select
                    value={selectedTypeFilter}
                    onChange={(e) => { setSelectedTypeFilter(e.target.value); setCurrentPage(0); }}
                    className="text-xs text-slate-700 bg-transparent outline-none focus:ring-0 cursor-pointer font-semibold"
                  >
                    <option value="">All Movement Types</option>
                    <option value="PURCHASE">Purchases</option>
                    <option value="SALE">Sales</option>
                    <option value="ADJUSTMENT">Adjustments</option>
                    <option value="RETURN">Returns</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 border border-slate-200 px-3 py-2 rounded-lg bg-white shadow-sm focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-500 transition-all">
                  <select
                    value={selectedProductFilter}
                    onChange={(e) => { setSelectedProductFilter(e.target.value); setCurrentPage(0); }}
                    className="text-xs text-slate-700 bg-transparent outline-none focus:ring-0 cursor-pointer font-semibold max-w-[200px]"
                  >
                    <option value="">All Products</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date Filters & Adjust Button */}
              <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
                <div className="flex items-center gap-1.5 border border-slate-200 rounded-lg px-3 py-2 bg-white shadow-sm font-semibold text-xs text-slate-650">
                  <Calendar size={14} className="text-slate-400" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase">From</span>
                  <input 
                    type="date"
                    value={startDateFilter}
                    onChange={(e) => { setStartDateFilter(e.target.value); setCurrentPage(0); }}
                    className="text-xs bg-transparent border-none outline-none font-semibold text-slate-600 cursor-pointer"
                  />
                  <span className="text-[10px] font-bold text-slate-400 uppercase">To</span>
                  <input 
                    type="date"
                    value={endDateFilter}
                    onChange={(e) => { setEndDateFilter(e.target.value); setCurrentPage(0); }}
                    className="text-xs bg-transparent border-none outline-none font-semibold text-slate-600 cursor-pointer"
                  />
                </div>

                <button
                  onClick={() => setIsModalOpen(true)}
                  className="btn-primary py-2 px-4 text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-500/10"
                >
                  <PlusCircle size={14} />
                  <span>Manual Correction</span>
                </button>
              </div>
            </div>
          </div>

          {/* Movements Data Table */}
          <div className="table-container-premium">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50">
                    <th className="th-premium py-3">Timestamp</th>
                    <th className="th-premium py-3">Movement No</th>
                    <th className="th-premium py-3">Product Details</th>
                    <th className="th-premium py-3 text-center">Movement Type</th>
                    <th className="th-premium py-3 text-center">Previous Qty</th>
                    <th className="th-premium py-3 text-center">Ledger Net</th>
                    <th className="th-premium py-3 text-center">New Qty</th>
                    <th className="th-premium py-3">Reference No</th>
                    <th className="th-premium py-3">Operator</th>
                    <th className="th-premium py-3">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {isLoading ? (
                    Array.from({ length: pageSize }).map((_, idx) => (
                      <tr key={idx}>
                        <td className="td-premium py-3"><div className="h-4 skeleton-shimmer rounded w-20"></div></td>
                        <td className="td-premium py-3"><div className="h-4 skeleton-shimmer rounded w-16"></div></td>
                        <td className="td-premium py-3">
                          <div className="h-4 skeleton-shimmer rounded w-32 mb-1.5"></div>
                          <div className="h-3 skeleton-shimmer rounded w-20"></div>
                        </td>
                        <td className="td-premium py-3"><div className="h-6 skeleton-shimmer rounded-full w-20 mx-auto"></div></td>
                        <td className="td-premium py-3"><div className="h-4 skeleton-shimmer rounded w-10 mx-auto"></div></td>
                        <td className="td-premium py-3"><div className="h-5 skeleton-shimmer rounded w-12 mx-auto"></div></td>
                        <td className="td-premium py-3"><div className="h-4 skeleton-shimmer rounded w-10 mx-auto"></div></td>
                        <td className="td-premium py-3"><div className="h-4 skeleton-shimmer rounded w-16"></div></td>
                        <td className="td-premium py-3"><div className="h-4 skeleton-shimmer rounded w-24"></div></td>
                        <td className="td-premium py-3"><div className="h-4 skeleton-shimmer rounded w-40"></div></td>
                      </tr>
                    ))
                  ) : movements.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="p-16 text-center">
                        <div className="w-14 h-14 bg-slate-50 border border-slate-200/60 rounded-full flex items-center justify-center mx-auto mb-4 border-dashed shadow-sm">
                          <SlidersHorizontal className="w-6 h-6 text-slate-400" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-800">No stock movements found</h3>
                        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                          Try tweaking your product, date range, or movement type filters.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    movements.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50/30 transition-colors tr-premium">
                        <td className="td-premium py-3 text-slate-500 whitespace-nowrap">
                          {new Date(m.timestamp).toLocaleDateString()} <span className="text-[10px] text-slate-400 ml-1">{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </td>
                        <td className="td-premium py-3 font-bold text-slate-800 whitespace-nowrap">{m.movementNo}</td>
                        <td className="td-premium py-3 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800 leading-snug">{m.productName}</span>
                            <span className="text-[10px] text-slate-400 mt-0.5 font-mono">{m.productSku}</span>
                          </div>
                        </td>
                        <td className="td-premium py-3 whitespace-nowrap text-center">
                          <span className={`px-2 py-0.5 border rounded-full text-[9px] font-extrabold uppercase tracking-wide ${getTypeColor(m.movementType)}`}>
                            {m.movementType}
                          </span>
                        </td>
                        <td className="td-premium py-3 text-center font-semibold text-slate-500">{m.previousQuantity}</td>
                        <td className="td-premium py-3 whitespace-nowrap text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                            m.difference > 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                          }`}>
                            {m.difference > 0 ? `+${m.difference}` : m.difference}
                          </span>
                        </td>
                        <td className="td-premium py-3 text-center font-bold text-slate-800">{m.newQuantity}</td>
                        <td className="td-premium py-3 font-semibold text-slate-600">{m.referenceNo || "-"}</td>
                        <td className="td-premium py-3 text-slate-700 font-bold whitespace-nowrap">{m.performedByFullName || "System"}</td>
                        <td className="td-premium py-3 text-slate-500 max-w-xs truncate" title={m.remarks}>{m.remarks || "-"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-bold">
                  Page {currentPage + 1} of {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 0}
                    onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                    className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer shadow-sm"
                  >
                    <ArrowLeft size={14} className="text-slate-650 text-slate-600" />
                  </button>
                  <button
                    disabled={currentPage === totalPages - 1}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                    className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer shadow-sm"
                  >
                    <ArrowRight size={14} className="text-slate-655 text-slate-600" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Manual Stock Correction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Sparkles className="text-blue-600 w-5 h-5" />
                <h3 className="text-sm font-extrabold text-slate-900">Manual Stock Correction</h3>
              </div>
              <button 
                onClick={() => { setIsModalOpen(false); resetModalForm(); }}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAdjustmentSubmit} className="p-6 space-y-4">
              {modalError && (
                <div className="p-3 bg-red-50 border border-red-150 text-red-700 text-xs font-semibold rounded-lg flex items-center gap-2">
                  <Info size={14} className="shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="label-premium">Target Product</label>
                <select
                  required
                  value={targetProductId}
                  onChange={(e) => setTargetProductId(e.target.value)}
                  className="select-premium"
                >
                  <option value="">Choose product to correct...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (SKU: {p.sku})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="label-premium">Ledger Difference</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. +10 or -5"
                    value={differenceQty}
                    onChange={(e) => setDifferenceQty(e.target.value)}
                    className="input-premium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="label-premium">Entry Type</label>
                  <select
                    value={adjustmentType}
                    onChange={(e) => setAdjustmentType(e.target.value)}
                    className="select-premium"
                  >
                    <option value="ADJUSTMENT">Adjustment (+/-)</option>
                    <option value="RETURN">Return (+)</option>
                    <option value="DAMAGE">Damage (-)</option>
                    <option value="TRANSFER">Transfer</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="label-premium">Reason / Remarks</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Specify details, damage reason, return references..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="input-premium resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); resetModalForm(); }}
                  className="btn-secondary"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-1.5">
                      <RefreshCw size={13} className="animate-spin" />
                      Posting...
                    </span>
                  ) : "Post Adjustment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockMovements;
