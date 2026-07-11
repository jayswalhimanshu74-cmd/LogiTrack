import { useState, useEffect, useCallback } from "react";
import { 
  Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight, FileText, 
  Calendar, DollarSign, TrendingUp, RefreshCw, Printer, Download,
  ArrowDownLeft, Layers, ShieldAlert, BarChart3, AlertCircle, Sparkles
} from "lucide-react";
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, BarChart, Bar, PieChart, Pie, Cell
} from "recharts";
import Sidebar from "../components/Sidebar";
import reportApi from "../api/reportApi";
import productApi from "../api/productApi";

const COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444", "#ec4899", "#14b8a6"];

const Reports = () => {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState("financial"); // financial | sales | purchases | inventory | invoices

  // Datasets
  const [salesReport, setSalesReport] = useState(null);
  const [purchaseReport, setPurchaseReport] = useState(null);
  const [inventoryReport, setInventoryReport] = useState(null);
  const [invoiceReport, setInvoiceReport] = useState(null);
  const [financialSummary, setFinancialSummary] = useState(null);
  const [chartData, setChartData] = useState(null);

  // Filters State
  const [searchVal, setSearchVal] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Categories list
  const [categories, setCategories] = useState([]);

  // Pagination & Sorting
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [sortField, setSortField] = useState("id");
  const [sortOrder, setSortOrder] = useState("desc");

  // UI Status
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState("checking");

  // Load distinct product categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const list = await productApi.getCategories();
        setCategories(list || []);
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch report data based on active tab
  const fetchReportData = useCallback(async () => {
    setIsLoading(true);
    const filterParams = {
      page: currentPage,
      size: pageSize,
      sort: `${sortField},${sortOrder}`,
      search: searchVal,
      status: statusFilter,
      paymentStatus: paymentStatusFilter,
      category: categoryFilter,
      startDate,
      endDate
    };

    try {
      if (activeTab === "financial") {
        const summary = await reportApi.getFinancialSummary();
        setFinancialSummary(summary);
        const charts = await reportApi.getChartData();
        setChartData(charts);
      } else if (activeTab === "sales") {
        const report = await reportApi.getSalesReport(filterParams);
        setSalesReport(report);
        setTotalPages(report.sales.totalPages || 1);
        setTotalElements(report.sales.totalElements || 0);
      } else if (activeTab === "purchases") {
        const report = await reportApi.getPurchaseReport(filterParams);
        setPurchaseReport(report);
        setTotalPages(report.purchases.totalPages || 1);
        setTotalElements(report.purchases.totalElements || 0);
      } else if (activeTab === "inventory") {
        const report = await reportApi.getInventoryReport(filterParams);
        setInventoryReport(report);
        setTotalPages(report.products.totalPages || 1);
        setTotalElements(report.products.totalElements || 0);
      } else if (activeTab === "invoices") {
        const report = await reportApi.getInvoiceReport(filterParams);
        setInvoiceReport(report);
        setTotalPages(report.invoices.totalPages || 1);
        setTotalElements(report.invoices.totalElements || 0);
      }
      setConnectionStatus("connected");
    } catch (err) {
      console.warn("REST Reports fail, loading mock demonstration fallbacks:", err);
      setConnectionStatus("demo");
      loadMockReportData();
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, currentPage, pageSize, sortField, sortOrder, searchVal, statusFilter, paymentStatusFilter, categoryFilter, startDate, endDate]);

  // Load Demonstration Fallback Data
  const loadMockReportData = () => {
    // 1. Mock Charts
    setChartData({
      monthlySales: [
        { year: 2026, month: 1, amount: 2400 },
        { year: 2026, month: 2, amount: 1398 },
        { year: 2026, month: 3, amount: 9800 },
        { year: 2026, month: 4, amount: 3908 },
        { year: 2026, month: 5, amount: 4800 },
        { year: 2026, month: 6, amount: 3800 },
        { year: 2026, month: 7, amount: 819.98 }
      ],
      monthlyPurchases: [
        { year: 2026, month: 1, amount: 1800 },
        { year: 2026, month: 2, amount: 2100 },
        { year: 2026, month: 3, amount: 4200 },
        { year: 2026, month: 4, amount: 1900 },
        { year: 2026, month: 5, amount: 3000 },
        { year: 2026, month: 6, amount: 2000 },
        { year: 2026, month: 7, amount: 500 }
      ],
      monthlyRevenue: [
        { year: 2026, month: 1, amount: 2000 },
        { year: 2026, month: 2, amount: 1200 },
        { year: 2026, month: 3, amount: 8000 },
        { year: 2026, month: 4, amount: 3500 },
        { year: 2026, month: 5, amount: 4100 },
        { year: 2026, month: 6, amount: 3200 },
        { year: 2026, month: 7, amount: 819.98 }
      ],
      categoryDistribution: [
        { category: "Processors", count: 8 },
        { category: "Monitors", count: 4 },
        { category: "Accessories", count: 12 },
        { category: "Peripherals", count: 6 }
      ],
      salesStatus: [
        { status: "COMPLETED", count: 15 },
        { status: "PENDING", count: 5 },
        { status: "CANCELLED", count: 2 }
      ],
      paymentStatus: [
        { status: "PAID", count: 18 },
        { status: "PENDING", count: 4 }
      ],
      lowStockTrend: [
        { category: "Processors", count: 1 },
        { category: "Monitors", count: 2 }
      ],
      topProducts: [
        { sku: "INTEL-I7-14700K", name: "Intel Core i7-14700K Processor", quantitySold: 12, totalRevenue: 4919.88 },
        { sku: "LOGI-MX3S-BLK", name: "Logitech MX Master 3S Mouse", quantitySold: 8, totalRevenue: 799.92 },
        { sku: "CUSH-LUMB-MEM", name: "Ergonomic Foam Cushion", quantitySold: 5, totalRevenue: 149.95 }
      ]
    });

    // 2. Mock Financial Summary
    setFinancialSummary({
      totalRevenue: 26626.56,
      totalPurchaseCost: 15500.00,
      estimatedProfit: 11126.56,
      estimatedProfitMargin: 41.79,
      todayRevenue: 819.98,
      monthlyRevenue: 9419.98,
      yearlyRevenue: 26626.56
    });

    // 3. Tab Specific Mocks
    if (activeTab === "sales") {
      setSalesReport({
        totalSalesCount: 22,
        totalSalesRevenue: 26626.56,
        statusDistribution: [{ status: "COMPLETED", count: 15 }, { status: "PENDING", count: 5 }],
        paymentStatusDistribution: [{ status: "PAID", count: 18 }, { status: "PENDING", count: 4 }],
        topProducts: [{ sku: "INTEL-I7-14700K", name: "Intel Core i7-14700K Processor", quantitySold: 12, totalRevenue: 4919.88 }],
        sales: {
          content: [
            { id: 1, saleNo: "SO-83015370", customerName: "Alice Henderson", customerPhone: "+91 8562966485", status: "COMPLETED", paymentStatus: "PAID", paymentMethod: "UPI", saleDate: "2026-07-11", totalAmount: 819.98 }
          ],
          totalPages: 1,
          totalElements: 1
        }
      });
      setTotalPages(1);
      setTotalElements(1);
    } else if (activeTab === "purchases") {
      setPurchaseReport({
        totalPurchasesCount: 8,
        totalPurchasesCost: 15500.00,
        statusDistribution: [{ status: "RECEIVED", count: 6 }, { status: "PENDING", count: 2 }],
        paymentStatusDistribution: [{ status: "PAID", count: 7 }, { status: "PENDING", count: 1 }],
        purchases: {
          content: [
            { id: 1, purchaseNo: "PO-09823019", supplierName: "Chip Supply Corp", status: "RECEIVED", paymentStatus: "PAID", paymentMethod: "BANK_TRANSFER", purchaseDate: "2026-07-05", totalAmount: 5200.00 }
          ],
          totalPages: 1,
          totalElements: 1
        }
      });
      setTotalPages(1);
      setTotalElements(1);
    } else if (activeTab === "inventory") {
      setInventoryReport({
        totalProductsCount: 30,
        totalInventoryValue: 124500.00,
        lowStockCount: 3,
        outOfStockCount: 1,
        categoryDistribution: [{ category: "Processors", count: 8 }, { category: "Peripherals", count: 12 }],
        products: {
          content: [
            { id: 1, sku: "INTEL-I7-14700K", name: "Intel Core i7-14700K Processor", category: "Processors", unit: "pcs", purchasePrice: 320.00, sellingPrice: 409.99, quantityInStock: 24, reorderLevel: 5, status: "IN_STOCK" }
          ],
          totalPages: 1,
          totalElements: 1
        }
      });
      setTotalPages(1);
      setTotalElements(1);
    } else if (activeTab === "invoices") {
      setInvoiceReport({
        totalInvoicesCount: 10,
        paidInvoicesCount: 6,
        pendingInvoicesCount: 3,
        draftInvoicesCount: 1,
        totalRevenue: 6490.50,
        averageInvoiceValue: 649.05,
        statusDistribution: [{ status: "ISSUED", count: 6 }, { status: "PAID", count: 3 }],
        paymentStatusDistribution: [{ status: "PAID", count: 3 }, { status: "PENDING", count: 7 }],
        invoices: {
          content: [
            { id: 10, invoiceNo: "INV-2026-000001", customerName: "Alice Henderson", customerPhone: "+91 8562966485", saleNo: "SO-83015370", invoiceDate: "2026-07-11", subtotal: 819.98, tax: 0, discount: 0, grandTotal: 819.98, status: "ISSUED", paymentStatus: "PAID", paymentMethod: "UPI" }
          ],
          totalPages: 1,
          totalElements: 1
        }
      });
      setTotalPages(1);
      setTotalElements(1);
    }
  };

  // Re-fetch data on active tab, sorting, paging, or filter adjustments
  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  // Handle Tab Switch
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(0);
    setSearchVal("");
    setStatusFilter("");
    setPaymentStatusFilter("");
    setCategoryFilter("");
    setStartDate("");
    setEndDate("");
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

  // CSV Data Exporter (Constructs a string blob)
  const handleExportCSV = () => {
    let headers = [];
    let rows = [];
    let filename = `${activeTab}_report.csv`;

    if (activeTab === "sales" && salesReport) {
      headers = ["ID", "Sale No", "Customer Name", "Customer Phone", "Status", "Payment", "Date", "Total Amount"];
      rows = salesReport.sales.content.map(s => [s.id, s.saleNo, s.customerName, s.customerPhone, s.status, s.paymentStatus, s.saleDate, s.totalAmount]);
    } else if (activeTab === "purchases" && purchaseReport) {
      headers = ["ID", "Purchase No", "Supplier Name", "Status", "Payment", "Date", "Total Cost"];
      rows = purchaseReport.purchases.content.map(p => [p.id, p.purchaseNo, p.supplierName, p.status, p.paymentStatus, p.purchaseDate, p.totalAmount]);
    } else if (activeTab === "inventory" && inventoryReport) {
      headers = ["ID", "SKU", "Name", "Category", "Stock Qty", "Purchase Price", "Selling Price", "Value"];
      rows = inventoryReport.products.content.map(p => [p.id, p.sku, p.name, p.category, p.quantityInStock, p.purchasePrice, p.sellingPrice, (p.quantityInStock * p.purchasePrice)]);
    } else if (activeTab === "invoices" && invoiceReport) {
      headers = ["ID", "Invoice No", "Customer Name", "Sale Ref", "Status", "Payment", "Date", "Grand Total"];
      rows = invoiceReport.invoices.content.map(i => [i.id, i.invoiceNo, i.customerName, i.saleNo || "Standalone", i.status, i.paymentStatus, i.invoiceDate, i.grandTotal]);
    } else {
      alert("No data available to export");
      return;
    }

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print Friendly trigger
  const handlePrint = () => {
    window.print();
  };

  // Helper Labels mapping
  const formatMonth = (mNum) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months[mNum - 1] || mNum;
  };

  const getChartTimelineData = (trendList) => {
    if (!trendList) return [];
    return trendList.map(t => ({
      name: `${formatMonth(t.month)} ${t.year}`,
      Amount: t.amount
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans print:bg-white">
      <Sidebar activeTab="reports" />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto print:overflow-visible">
        
        {/* Header toolbar */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 md:px-8 z-10 sticky top-0 print:hidden shrink-0">
          <div className="flex items-center gap-2">
            <BarChart3 className="text-blue-600" size={20} />
            <h2 className="text-xl text-slate-800 font-semibold">Reports & Analytics</h2>
          </div>
          <div className="flex items-center gap-3">
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
              onClick={fetchReportData} 
              className="p-2 hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </header>

        {/* Tab Selection Header (Width aligned with main layout content container) */}
        <div className="bg-white border-b border-slate-200 print:hidden shrink-0">
          <div className="w-full px-6 md:px-8 py-3.5 flex gap-2 overflow-x-auto">
            <button 
              onClick={() => handleTabChange("financial")}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border transition-all cursor-pointer ${activeTab === "financial" ? "bg-blue-50 text-blue-600 border-blue-150 border-blue-200 font-extrabold" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800 border-transparent"}`}
            >
              Financials
            </button>
            <button 
              onClick={() => handleTabChange("sales")}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border transition-all cursor-pointer ${activeTab === "sales" ? "bg-blue-50 text-blue-600 border-blue-150 border-blue-200 font-extrabold" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800 border-transparent"}`}
            >
              Sales Report
            </button>
            <button 
              onClick={() => handleTabChange("purchases")}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border transition-all cursor-pointer ${activeTab === "purchases" ? "bg-blue-50 text-blue-600 border-blue-150 border-blue-200 font-extrabold" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800 border-transparent"}`}
            >
              Procurement
            </button>
            <button 
              onClick={() => handleTabChange("inventory")}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border transition-all cursor-pointer ${activeTab === "inventory" ? "bg-blue-50 text-blue-600 border-blue-150 border-blue-200 font-extrabold" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800 border-transparent"}`}
            >
              Inventory Stock
            </button>
            <button 
              onClick={() => handleTabChange("invoices")}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border transition-all cursor-pointer ${activeTab === "invoices" ? "bg-blue-50 text-blue-600 border-blue-150 border-blue-200 font-extrabold" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800 border-transparent"}`}
            >
              Invoice Ledger
            </button>
          </div>
        </div>

        {/* Main Panel Content */}
        <main className="flex-1 p-6 md:p-8 space-y-8 w-full print:p-0">
          
          {/* Printable visual header */}
          <div className="hidden print:block mb-8">
            <div className="flex justify-between items-center border-b border-slate-350 pb-4">
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">LogiTrack IMS</h1>
                <p className="text-sm text-slate-500 mt-1">Enterprise Analytics & Business Intelligence Ledger</p>
              </div>
              <div className="text-right text-xs text-slate-400 font-medium leading-relaxed">
                Report Scope: <span className="font-bold uppercase text-slate-800">{activeTab} Summary</span><br />
                Date Generated: {new Date().toLocaleDateString()}<br />
                Page No: 1 of 1
              </div>
            </div>
          </div>

          {/* TAB 1: FINANCIAL SUMMARY */}
          {activeTab === "financial" && financialSummary && (
            <div className="space-y-8 animate-fade-in">
              
              {/* Financial KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Sales Revenue</p>
                    <h3 className="text-2xl font-black text-slate-900 mt-1.5">${financialSummary.totalRevenue?.toFixed(2)}</h3>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center print:hidden">
                    <TrendingUp size={22} />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Procurements</p>
                    <h3 className="text-2xl font-black text-slate-900 mt-1.5">${financialSummary.totalPurchaseCost?.toFixed(2)}</h3>
                  </div>
                  <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center print:hidden">
                    <ArrowDownLeft size={22} />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estimated Profit</p>
                    <h3 className={`text-2xl font-black mt-1.5 ${financialSummary.estimatedProfit >= 0 ? "text-emerald-600" : "text-red-650 text-red-600"}`}>
                      ${financialSummary.estimatedProfit?.toFixed(2)}
                    </h3>
                  </div>
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center print:hidden">
                    <DollarSign size={22} />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Profit Margin</p>
                    <h3 className="text-2xl font-black text-slate-900 mt-1.5">{financialSummary.estimatedProfitMargin?.toFixed(2)}%</h3>
                  </div>
                  <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center print:hidden">
                    <Sparkles size={22} />
                  </div>
                </div>
              </div>

              {/* Revenue Trends */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today's Revenue</p>
                    <h3 className="text-2xl font-black text-slate-900 mt-1.5">${financialSummary.todayRevenue?.toFixed(2)}</h3>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center print:hidden">
                    <Calendar size={22} />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">This Month's Revenue</p>
                    <h3 className="text-2xl font-black text-slate-900 mt-1.5">${financialSummary.monthlyRevenue?.toFixed(2)}</h3>
                  </div>
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center print:hidden">
                    <TrendingUp size={22} />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">This Year's Revenue</p>
                    <h3 className="text-2xl font-black text-slate-900 mt-1.5">${financialSummary.yearlyRevenue?.toFixed(2)}</h3>
                  </div>
                  <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center print:hidden">
                    <Sparkles size={22} />
                  </div>
                </div>
              </div>

              {/* Recharts widgets */}
              {chartData && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 print:block print:space-y-8">
                  {/* Revenue area chart */}
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Monthly Revenue Flow</h3>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={getChartTimelineData(chartData.monthlyRevenue)}>
                          <defs>
                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                          <YAxis stroke="#94a3b8" fontSize={11} />
                          <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff', border: 'none', fontSize: '11px' }} />
                          <Area type="monotone" dataKey="Amount" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Monthly Sales vs Purchases double bar chart */}
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Sales Revenue vs Procurement Expense</h3>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData.monthlySales?.map((val, idx) => ({
                          name: `${formatMonth(val.month)} ${val.year}`,
                          Sales: val.amount,
                          Purchases: chartData.monthlyPurchases?.[idx]?.amount || 0
                        }))}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                          <YAxis stroke="#94a3b8" fontSize={11} />
                          <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff', border: 'none', fontSize: '11px' }} />
                          <Legend wrapperStyle={{ fontSize: 11, fontWeight: 600 }} />
                          <Bar dataKey="Sales" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="Purchases" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Category Breakdown Pie Chart */}
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Stock Breakdown by Category</h3>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData.categoryDistribution}
                            cx="40%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={95}
                            paddingAngle={4}
                            dataKey="count"
                            nameKey="category"
                          >
                            {chartData.categoryDistribution?.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff', border: 'none', fontSize: '11px' }} />
                          <Legend layout="vertical" align="right" verticalAlign="middle" iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 600 }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Low Stock category items bar */}
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Low Stock Warning Trend</h3>
                    <div className="h-[300px] w-full">
                      {chartData.lowStockTrend?.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400">
                          <AlertCircle size={24} />
                          <span className="text-xs font-semibold mt-1">No low-stock items detected!</span>
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData.lowStockTrend} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                            <YAxis dataKey="category" type="category" stroke="#94a3b8" fontSize={11} width={100} />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff', border: 'none', fontSize: '11px' }} />
                            <Bar dataKey="count" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={16} />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SALES REPORT */}
          {activeTab === "sales" && salesReport && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Sales KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Sales Invoiced</p>
                    <h3 className="text-2xl font-black text-slate-900 mt-1.5">{salesReport.totalSalesCount} orders</h3>
                  </div>
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center print:hidden">
                    <Layers size={18} />
                  </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Aggregate Sales Revenue</p>
                    <h3 className="text-2xl font-black text-slate-900 mt-1.5">${salesReport.totalSalesRevenue?.toFixed(2)}</h3>
                  </div>
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center print:hidden">
                    <DollarSign size={18} />
                  </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Top Selling SKU</p>
                    <h4 className="text-base font-bold text-slate-800 mt-1 truncate max-w-[200px]" title={salesReport.topProducts?.[0]?.name}>
                      {salesReport.topProducts?.[0]?.sku || "N/A"}
                    </h4>
                  </div>
                  {salesReport.topProducts?.[0] && (
                    <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded text-xs font-bold font-mono">
                      {salesReport.topProducts[0].quantitySold} sold
                    </span>
                  )}
                </div>
              </div>

              {/* Filters toolbar */}
              {renderFiltersPanel()}

              {/* Data Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between flex-wrap gap-4">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Sales Invoices Grid</h3>
                  <div className="flex items-center gap-2">
                    <button onClick={handlePrint} className="px-3.5 py-1.5 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-slate-50">
                      <Printer size={14} />
                      <span>Print Page</span>
                    </button>
                    <button onClick={handleExportCSV} className="px-3.5 py-1.5 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-slate-50">
                      <Download size={14} />
                      <span>Export CSV</span>
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <th className="p-4 cursor-pointer hover:bg-slate-100" onClick={() => handleSort("saleNo")}>Sale No</th>
                        <th className="p-4 cursor-pointer hover:bg-slate-100" onClick={() => handleSort("customerName")}>Customer</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Payment</th>
                        <th className="p-4">Method</th>
                        <th className="p-4 cursor-pointer hover:bg-slate-100" onClick={() => handleSort("saleDate")}>Date</th>
                        <th className="p-4 cursor-pointer hover:bg-slate-100 text-right" onClick={() => handleSort("totalAmount")}>Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {salesReport.sales.content?.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50/40">
                          <td className="p-4 font-mono font-bold text-xs text-slate-700">{s.saleNo}</td>
                          <td className="p-4 font-semibold text-slate-800">{s.customerName}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${s.status === "COMPLETED" ? "bg-emerald-50 text-emerald-800 border-emerald-100" : "bg-amber-50 text-amber-800 border-amber-100"}`}>
                              {s.status}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${s.paymentStatus === "PAID" ? "bg-emerald-50 text-emerald-800 border-emerald-100" : "bg-amber-50 text-amber-800 border-amber-100"}`}>
                              {s.paymentStatus}
                            </span>
                          </td>
                          <td className="p-4 font-semibold text-xs text-slate-500">{s.paymentMethod}</td>
                          <td className="p-4 text-slate-500">{s.saleDate}</td>
                          <td className="p-4 text-right font-extrabold text-slate-900">${s.totalAmount?.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {renderPagination()}
              </div>
            </div>
          )}

          {/* TAB 3: PURCHASE REPORT */}
          {activeTab === "purchases" && purchaseReport && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Purchase KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Purchase Orders</p>
                    <h3 className="text-2xl font-black text-slate-900 mt-1.5">{purchaseReport.totalPurchasesCount} orders</h3>
                  </div>
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center print:hidden">
                    <Layers size={18} />
                  </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Procured Expense</p>
                    <h3 className="text-2xl font-black text-slate-900 mt-1.5">${purchaseReport.totalPurchasesCost?.toFixed(2)}</h3>
                  </div>
                  <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center print:hidden">
                    <ArrowDownLeft size={18} />
                  </div>
                </div>
              </div>

              {/* Filters */}
              {renderFiltersPanel()}

              {/* Purchase Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between flex-wrap gap-4">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Procurement Ledgers</h3>
                  <div className="flex items-center gap-2">
                    <button onClick={handlePrint} className="px-3.5 py-1.5 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-slate-50">
                      <Printer size={14} />
                      <span>Print Page</span>
                    </button>
                    <button onClick={handleExportCSV} className="px-3.5 py-1.5 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-slate-50">
                      <Download size={14} />
                      <span>Export CSV</span>
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <th className="p-4 cursor-pointer hover:bg-slate-100" onClick={() => handleSort("purchaseNo")}>Purchase No</th>
                        <th className="p-4 cursor-pointer hover:bg-slate-100" onClick={() => handleSort("supplierName")}>Supplier</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Payment</th>
                        <th className="p-4 cursor-pointer hover:bg-slate-100" onClick={() => handleSort("purchaseDate")}>Date</th>
                        <th className="p-4 cursor-pointer hover:bg-slate-100 text-right" onClick={() => handleSort("totalAmount")}>Cost</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {purchaseReport.purchases.content?.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/40">
                          <td className="p-4 font-mono font-bold text-xs text-slate-700">{p.purchaseNo}</td>
                          <td className="p-4 font-semibold text-slate-800">{p.supplierName}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${p.status === "RECEIVED" ? "bg-emerald-50 text-emerald-800 border-emerald-100" : "bg-amber-50 text-amber-800 border-amber-100"}`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${p.paymentStatus === "PAID" ? "bg-emerald-50 text-emerald-800 border-emerald-100" : "bg-amber-50 text-amber-800 border-amber-100"}`}>
                              {p.paymentStatus}
                            </span>
                          </td>
                          <td className="p-4 text-slate-500">{p.purchaseDate}</td>
                          <td className="p-4 text-right font-extrabold text-slate-900">${p.totalAmount?.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {renderPagination()}
              </div>
            </div>
          )}

          {/* TAB 4: INVENTORY REPORT */}
          {activeTab === "inventory" && inventoryReport && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Stock metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Products SKUs</p>
                    <h3 className="text-2xl font-black text-slate-900 mt-1">{inventoryReport.totalProductsCount}</h3>
                  </div>
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center print:hidden">
                    <Layers size={18} />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Inventory Value</p>
                    <h3 className="text-2xl font-black text-slate-900 mt-1">${inventoryReport.totalInventoryValue?.toFixed(2)}</h3>
                  </div>
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center print:hidden">
                    <DollarSign size={18} />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Low Stock Products</p>
                    <h3 className={`text-2xl font-black mt-1 ${inventoryReport.lowStockCount > 0 ? "text-amber-600" : "text-slate-900"}`}>
                      {inventoryReport.lowStockCount}
                    </h3>
                  </div>
                  <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center print:hidden">
                    <AlertCircle size={18} />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Out of Stock Products</p>
                    <h3 className={`text-2xl font-black mt-1 ${inventoryReport.outOfStockCount > 0 ? "text-red-600" : "text-slate-900"}`}>
                      {inventoryReport.outOfStockCount}
                    </h3>
                  </div>
                  <div className="w-10 h-10 bg-red-50 text-red-650 rounded-lg flex items-center justify-center print:hidden">
                    <ShieldAlert size={18} />
                  </div>
                </div>
              </div>

              {/* Filters */}
              {renderFiltersPanel()}

              {/* Stock Inventory Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between flex-wrap gap-4">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Inventory Stock Valuations</h3>
                  <div className="flex items-center gap-2">
                    <button onClick={handlePrint} className="px-3.5 py-1.5 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-slate-50">
                      <Printer size={14} />
                      <span>Print Page</span>
                    </button>
                    <button onClick={handleExportCSV} className="px-3.5 py-1.5 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-slate-50">
                      <Download size={14} />
                      <span>Export CSV</span>
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <th className="p-4 cursor-pointer hover:bg-slate-100" onClick={() => handleSort("sku")}>SKU</th>
                        <th className="p-4 cursor-pointer hover:bg-slate-100" onClick={() => handleSort("name")}>Product Name</th>
                        <th className="p-4 cursor-pointer hover:bg-slate-100" onClick={() => handleSort("category")}>Category</th>
                        <th className="p-4 cursor-pointer hover:bg-slate-100" onClick={() => handleSort("quantityInStock")}>Stock Level</th>
                        <th className="p-4">Buying Price</th>
                        <th className="p-4">Selling Price</th>
                        <th className="p-4 text-right">Value (Cost)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {inventoryReport.products.content?.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/40">
                          <td className="p-4 font-mono font-bold text-xs text-slate-700">{p.sku}</td>
                          <td className="p-4 font-semibold text-slate-800">{p.name}</td>
                          <td className="p-4 text-slate-500">{p.category}</td>
                          <td className="p-4 font-semibold text-slate-700">
                            {p.quantityInStock} {p.unit}
                            {p.quantityInStock === 0 ? (
                              <span className="ml-2 text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">Out of Stock</span>
                            ) : p.quantityInStock <= p.reorderLevel ? (
                              <span className="ml-2 text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">Low Stock</span>
                            ) : null}
                          </td>
                          <td className="p-4 text-slate-500">${p.purchasePrice?.toFixed(2)}</td>
                          <td className="p-4 text-slate-500">${p.sellingPrice?.toFixed(2)}</td>
                          <td className="p-4 text-right font-extrabold text-slate-900">${(p.quantityInStock * p.purchasePrice)?.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {renderPagination()}
              </div>
            </div>
          )}

          {/* TAB 5: INVOICE REPORT */}
          {activeTab === "invoices" && invoiceReport && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Invoice KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Invoices</p>
                    <h3 className="text-2xl font-black text-slate-900 mt-1.5">{invoiceReport.totalInvoicesCount}</h3>
                  </div>
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center print:hidden">
                    <Layers size={18} />
                  </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Paid Invoices</p>
                    <h3 className="text-2xl font-black text-emerald-600 mt-1.5">{invoiceReport.paidInvoicesCount}</h3>
                  </div>
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center print:hidden">
                    <DollarSign size={18} />
                  </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Revenue Generated</p>
                    <h3 className="text-2xl font-black text-slate-900 mt-1.5">${invoiceReport.totalRevenue?.toFixed(2)}</h3>
                  </div>
                  <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center print:hidden">
                    <Sparkles size={18} />
                  </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Average Invoice Value</p>
                    <h3 className="text-2xl font-black text-slate-900 mt-1.5">${invoiceReport.averageInvoiceValue?.toFixed(2)}</h3>
                  </div>
                  <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center print:hidden">
                    <DollarSign size={18} />
                  </div>
                </div>
              </div>

              {/* Filters */}
              {renderFiltersPanel()}

              {/* Invoices Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between flex-wrap gap-4">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Invoice Ledgers</h3>
                  <div className="flex items-center gap-2">
                    <button onClick={handlePrint} className="px-3.5 py-1.5 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-slate-50">
                      <Printer size={14} />
                      <span>Print Page</span>
                    </button>
                    <button onClick={handleExportCSV} className="px-3.5 py-1.5 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-slate-50">
                      <Download size={14} />
                      <span>Export CSV</span>
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <th className="p-4 cursor-pointer hover:bg-slate-100" onClick={() => handleSort("invoiceNo")}>Invoice No</th>
                        <th className="p-4 cursor-pointer hover:bg-slate-100" onClick={() => handleSort("customerName")}>Customer</th>
                        <th className="p-4">Sales Order</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Payment</th>
                        <th className="p-4 cursor-pointer hover:bg-slate-100" onClick={() => handleSort("invoiceDate")}>Date</th>
                        <th className="p-4 cursor-pointer hover:bg-slate-100 text-right" onClick={() => handleSort("grandTotal")}>Grand Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {invoiceReport.invoices.content?.map((i) => (
                        <tr key={i.id} className="hover:bg-slate-50/40">
                          <td className="p-4 font-mono font-bold text-xs text-slate-700">{i.invoiceNo}</td>
                          <td className="p-4 font-semibold text-slate-800">{i.customerName}</td>
                          <td className="p-4 font-mono text-xs text-slate-500">{i.saleNo || "Standalone"}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${i.status === "PAID" ? "bg-emerald-50 text-emerald-800 border-emerald-100" : i.status === "ISSUED" ? "bg-blue-50 text-blue-800 border-blue-100" : "bg-amber-50 text-amber-800 border-amber-100"}`}>
                              {i.status}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${i.paymentStatus === "PAID" ? "bg-emerald-50 text-emerald-800 border-emerald-100" : "bg-amber-50 text-amber-800 border-amber-100"}`}>
                              {i.paymentStatus}
                            </span>
                          </td>
                          <td className="p-4 text-slate-500">{i.invoiceDate}</td>
                          <td className="p-4 text-right font-extrabold text-slate-900">${i.grandTotal?.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {renderPagination()}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );

  // Helper to render pagination controls
  function renderPagination() {
    if (totalPages <= 1) return null;
    return (
      <div className="flex items-center justify-between border-t border-slate-100 p-5 print:hidden">
        <span className="text-xs text-slate-500">
          Showing <span className="font-semibold text-slate-800">{currentPage * pageSize + 1}</span> to <span className="font-semibold text-slate-800">{Math.min(totalElements, (currentPage + 1) * pageSize)}</span> of <span className="font-semibold text-slate-800">{totalElements}</span> entries
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
            disabled={currentPage === 0}
            className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentPage(idx)}
              className={`px-3 py-1 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                currentPage === idx
                  ? "bg-blue-600 text-white shadow-sm"
                  : "border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {idx + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))}
            disabled={currentPage === totalPages - 1}
            className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  // Helper to render advanced report filters panel
  function renderFiltersPanel() {
    return (
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 items-center print:hidden">
        {/* Search */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search details..."
            value={searchVal}
            onChange={(e) => { setSearchVal(e.target.value); setCurrentPage(0); }}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-lg text-sm transition-all"
          />
        </div>

        {/* Date Ranges */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 md:col-span-2 border border-slate-200 px-3 py-1.5 rounded-lg bg-white">
          <Calendar size={14} />
          <input
            type="date"
            value={startDate}
            onChange={(e) => { setStartDate(e.target.value); setCurrentPage(0); }}
            className="outline-none text-slate-700 cursor-pointer"
            title="Start Date"
          />
          <span className="text-slate-300">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => { setEndDate(e.target.value); setCurrentPage(0); }}
            className="outline-none text-slate-700 cursor-pointer"
            title="End Date"
          />
          {(startDate || endDate) && (
            <button onClick={() => { setStartDate(""); setEndDate(""); }} className="ml-1 text-slate-400 hover:text-slate-650">Clear</button>
          )}
        </div>

        {/* Optional Status filter */}
        <div className="flex items-center gap-2 border border-slate-200 px-3 py-1.5 rounded-lg bg-white">
          <Filter size={14} className="text-slate-500" />
          <select
            value={activeTab === "inventory" ? categoryFilter : statusFilter}
            onChange={(e) => {
              if (activeTab === "inventory") {
                setCategoryFilter(e.target.value);
              } else {
                setStatusFilter(e.target.value);
              }
              setCurrentPage(0);
            }}
            className="text-xs text-slate-700 bg-transparent outline-none focus:ring-0 cursor-pointer w-full"
          >
            {activeTab === "inventory" ? (
              <>
                <option value="">All Categories</option>
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </>
            ) : activeTab === "purchases" ? (
              <>
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="RECEIVED">Received</option>
                <option value="CANCELLED">Cancelled</option>
              </>
            ) : activeTab === "sales" ? (
              <>
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </>
            ) : (
              <>
                <option value="">All Statuses</option>
                <option value="DRAFT">Draft</option>
                <option value="ISSUED">Issued</option>
                <option value="PAID">Paid</option>
                <option value="CANCELLED">Cancelled</option>
              </>
            )}
          </select>
        </div>
      </div>
    );
  }
};

export default Reports;
