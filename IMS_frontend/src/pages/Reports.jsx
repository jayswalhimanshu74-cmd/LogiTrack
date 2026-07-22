import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { 
  Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight, FileText, 
  Calendar, DollarSign, TrendingUp, RefreshCw, Printer, Download,
  ArrowDownLeft, Layers, ShieldAlert, BarChart3, AlertCircle, Sparkles, AlertTriangle, CheckCircle2, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, BarChart, Bar, PieChart, Pie, Cell
} from "recharts";
import Sidebar from "../components/Sidebar";
import reportApi from "../api/reportApi";
import productApi from "../api/productApi";
import exportApi from "../api/exportApi";

const COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444", "#ec4899", "#14b8a6"];

const Reports = () => {
  const location = useLocation();
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState("financial"); // financial | sales | purchases | inventory | invoices
  
  useEffect(() => {
    if (location.state && location.state.tab) {
      setActiveTab(location.state.tab);
    }
  }, [location]);

  // Datasets
  const [salesReport, setSalesReport] = useState(null);
  const [purchaseReport, setPurchaseReport] = useState(null);
  const [inventoryReport, setInventoryReport] = useState(null);
  const [invoiceReport, setInvoiceReport] = useState(null);
  const [financialSummary, setFinancialSummary] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [lowStockReport, setLowStockReport] = useState(null);
  const [forecastReport, setForecastReport] = useState(null);
  const [abcReport, setAbcReport] = useState(null);

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
  const [isExporting, setIsExporting] = useState(false);
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

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
      } else if (activeTab === "low_stock") {
        const report = await reportApi.getLowStockReport({
          page: currentPage,
          size: pageSize,
          sort: `${sortField},${sortOrder}`,
          search: searchVal,
          priority: statusFilter
        });
        setLowStockReport(report);
        setTotalPages(report.totalPages || 1);
        setTotalElements(report.totalElements || 0);
      } else if (activeTab === "forecast") {
        const report = await reportApi.getForecastReport({
          page: currentPage,
          size: pageSize,
          sort: `${sortField},${sortOrder}`,
          search: searchVal,
          status: statusFilter
        });
        setForecastReport(report);
        setTotalPages(report.totalPages || 1);
        setTotalElements(report.totalElements || 0);
      } else if (activeTab === "abc") {
        const report = await reportApi.getAbcReport({
          page: currentPage,
          size: pageSize,
          sort: `${sortField},${sortOrder}`,
          search: searchVal,
          category: statusFilter
        });
        setAbcReport(report);
        setTotalPages(report.totalPages || 1);
        setTotalElements(report.totalElements || 0);
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
      }});
      setTotalPages(1);
      setTotalElements(1);
    } else if (activeTab === "low_stock") {
      setLowStockReport({
        content: [
          { id: 1, sku: "PROCESSOR-I5-14400F", name: "Intel Core i5-14400F", category: "Processors", quantityInStock: 1, reorderLevel: 10, priority: "CRITICAL", timestamp: "2026-07-15T12:00:00" },
          { id: 2, sku: "MONITOR-IPS-24", name: "LG 24 IPS Monitor", category: "Monitors", quantityInStock: 3, reorderLevel: 8, priority: "HIGH", timestamp: "2026-07-15T12:00:00" },
          { id: 3, sku: "MOUSE-WIRELESS-X", name: "Razer DeathAdder Essential", category: "Accessories", quantityInStock: 9, reorderLevel: 10, priority: "NORMAL", timestamp: "2026-07-15T12:00:00" }
        ],
        totalPages: 1,
        totalElements: 3
      });
      setTotalPages(1);
      setTotalElements(3);
    } else if (activeTab === "forecast") {
      setForecastReport({
        content: [
          { productId: 1, productName: "Intel Core i5-14400F", sku: "PROCESSOR-I5-14400F", currentStock: 1, averageDailySales: 0.2, daysRemaining: 5.0, status: "RED" },
          { productId: 2, productName: "LG 24 IPS Monitor", sku: "MONITOR-IPS-24", currentStock: 3, averageDailySales: 0.15, daysRemaining: 20.0, status: "AMBER" },
          { productId: 3, productName: "Razer DeathAdder Essential", sku: "MOUSE-WIRELESS-X", currentStock: 9, averageDailySales: 0.1, daysRemaining: 90.0, status: "GREEN" }
        ],
        totalPages: 1,
        totalElements: 3
      });
      setTotalPages(1);
      setTotalElements(3);
    } else if (activeTab === "abc") {
      setAbcReport({
        content: [
          { productId: 1, productName: "Intel Core i7-14700K", sku: "INTEL-I7-14700K", revenue: 4919.88, totalSold: 12, category: "A", percentageContribution: 70.0 },
          { productId: 2, productName: "LG 24 IPS Monitor", sku: "MONITOR-IPS-24", revenue: 1500.0, totalSold: 10, category: "B", percentageContribution: 20.0 },
          { productId: 3, productName: "Razer DeathAdder Essential", sku: "MOUSE-WIRELESS-X", revenue: 500.0, totalSold: 25, category: "C", percentageContribution: 10.0 }
        ],
        totalPages: 1,
        totalElements: 3
      });
      setTotalPages(1);
      setTotalElements(3);
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

  // CSV Data Exporter calling backend REST APIs
  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      if (activeTab === "financial") {
        await exportApi.exportReports();
      } else if (activeTab === "sales") {
        await exportApi.exportSales({
          search: searchVal,
          status: statusFilter,
          paymentStatus: paymentStatusFilter,
          startDate,
          endDate,
          sort: `${sortField},${sortOrder}`
        });
      } else if (activeTab === "purchases") {
        await exportApi.exportPurchases({
          search: searchVal,
          status: statusFilter,
          paymentStatus: paymentStatusFilter,
          startDate,
          endDate,
          sort: `${sortField},${sortOrder}`
        });
      } else if (activeTab === "inventory") {
        await exportApi.exportProducts({
          search: searchVal,
          category: categoryFilter,
          status: statusFilter,
          sort: `${sortField},${sortOrder}`
        });
      } else if (activeTab === "invoices") {
        await exportApi.exportInvoices({
          search: searchVal,
          status: statusFilter,
          paymentStatus: paymentStatusFilter,
          startDate,
          endDate,
          sort: `${sortField},${sortOrder}`
        });
      } else if (activeTab === "low_stock") {
        await exportApi.exportLowStock({
          search: searchVal,
          priority: statusFilter
        });
      } else if (activeTab === "forecast") {
        await exportApi.exportForecast({
          search: searchVal,
          status: statusFilter
        });
      } else if (activeTab === "abc") {
        await exportApi.exportAbc({
          search: searchVal,
          category: statusFilter
        });
      }
      showToast(`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} CSV exported successfully`, "success");
    } catch (err) {
      console.error(err);
      showToast(`Failed to export ${activeTab} CSV`, "error");
    } finally {
      setIsExporting(false);
    }
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
    <div className="min-h-screen bg-slate-50 flex font-sans print:bg-white antialiased text-slate-900">
      <Sidebar activeTab="reports" />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto print:overflow-visible">
        
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200/80 h-16 flex items-center justify-between px-6 md:px-8 z-10 sticky top-0 print:hidden shrink-0 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <span>Workspace</span>
              <span className="material-symbols-outlined text-xs">chevron_right</span>
              <span>Reports</span>
            </div>
            <h2 className="text-sm font-bold text-slate-800 mt-0.5">Business Intelligence & Reports</h2>
          </div>
          <div className="flex items-center gap-3">
            {activeTab === "financial" && (
              <button 
                onClick={handleExportCSV} 
                disabled={isExporting}
                className="btn-secondary py-1.5 px-3 flex items-center gap-1.5 text-xs font-bold"
              >
                <Download size={13} className={isExporting ? "animate-spin" : ""} />
                <span>{isExporting ? "Exporting..." : "Export Report CSV"}</span>
              </button>
            )}

            {connectionStatus === "connected" ? (
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200/60 px-3 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                Connected
              </span>
            ) : (
              <span className="bg-amber-50 text-amber-800 border border-amber-200/60 px-3 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                Demo Mode
              </span>
            )}
            <button 
              onClick={fetchReportData} 
              className="btn-icon border border-slate-200"
              title="Refresh Report"
            >
              <RefreshCw size={14} className="text-slate-500" />
            </button>
          </div>
        </header>

        {/* Tab Selection Header */}
        <div className="bg-white border-b border-slate-200/80 print:hidden shrink-0 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
          <div className="w-full px-6 md:px-8 py-3 flex gap-2 overflow-x-auto scrollbar-none">
            {[
              { id: "financial", label: "Financials" },
              { id: "sales", label: "Sales Report" },
              { id: "purchases", label: "Procurement" },
              { id: "inventory", label: "Inventory Stock" },
              { id: "invoices", label: "Invoice Ledger" },
              { id: "low_stock", label: "Low Stock Alerts" },
              { id: "forecast", label: "Stock Forecasting" },
              { id: "abc", label: "ABC Analysis" }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer border ${
                  activeTab === tab.id 
                    ? "bg-blue-50 text-blue-600 border-blue-100 shadow-sm" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800 border-transparent"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Panel Content */}
        <main className="flex-1 p-6 md:p-8 space-y-6 w-full print:p-0 max-w-[1600px] mx-auto">
          
          {/* Printable visual header */}
          <div className="hidden print:block mb-8">
            <div className="flex justify-between items-center border-b border-slate-350 pb-4">
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">StockMAster IMS</h1>
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
            <div className="space-y-6 animate-fade-in">
              
              {/* Financial KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="card-premium p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Sales Revenue</p>
                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight">${financialSummary.totalRevenue?.toFixed(2)}</h3>
                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-2">
                      <span className="material-symbols-outlined text-sm">trending_up</span>
                      Gross value generated
                    </span>
                  </div>
                  <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100/50 shadow-sm shrink-0 print:hidden">
                    <TrendingUp size={20} />
                  </div>
                </div>

                <div className="card-premium p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Procurements</p>
                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight">${financialSummary.totalPurchaseCost?.toFixed(2)}</h3>
                    <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1 mt-2">
                      <span className="material-symbols-outlined text-sm">payments</span>
                      Total replenishment cost
                    </span>
                  </div>
                  <div className="w-11 h-11 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center border border-amber-100/50 shadow-sm shrink-0 print:hidden">
                    <ArrowDownLeft size={20} />
                  </div>
                </div>

                <div className="card-premium p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estimated Profit</p>
                    <h3 className={`text-2xl font-bold tracking-tight ${financialSummary.estimatedProfit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                      ${financialSummary.estimatedProfit?.toFixed(2)}
                    </h3>
                    <span className={`text-[10px] font-bold flex items-center gap-1 mt-2 ${financialSummary.estimatedProfit >= 0 ? "text-emerald-605 text-emerald-600" : "text-rose-600"}`}>
                      <span className="material-symbols-outlined text-xs">
                        {financialSummary.estimatedProfit >= 0 ? "check_circle" : "error"}
                      </span>
                      Net difference of ledger
                    </span>
                  </div>
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center border shadow-sm shrink-0 print:hidden ${financialSummary.estimatedProfit >= 0 ? "bg-emerald-50 text-emerald-600 border-emerald-100/50" : "bg-rose-50 text-rose-600 border-rose-100/50"}`}>
                    <DollarSign size={20} />
                  </div>
                </div>

                <div className="card-premium p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Profit Margin</p>
                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{financialSummary.estimatedProfitMargin?.toFixed(2)}%</h3>
                    <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1 mt-2">
                      <span className="material-symbols-outlined text-sm">calculate</span>
                      Estimated percentage return
                    </span>
                  </div>
                  <div className="w-11 h-11 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center border border-purple-100/50 shadow-sm shrink-0 print:hidden">
                    <Sparkles size={20} />
                  </div>
                </div>
              </div>

              {/* Revenue Trends */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="card-premium p-5 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Today's Revenue</p>
                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight">${financialSummary.todayRevenue?.toFixed(2)}</h3>
                  </div>
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100/50 shadow-sm shrink-0 print:hidden">
                    <Calendar size={20} />
                  </div>
                </div>

                <div className="card-premium p-5 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">This Month's Revenue</p>
                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight">${financialSummary.monthlyRevenue?.toFixed(2)}</h3>
                  </div>
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100/50 shadow-sm shrink-0 print:hidden">
                    <TrendingUp size={20} />
                  </div>
                </div>

                <div className="card-premium p-5 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">This Year's Revenue</p>
                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight">${financialSummary.yearlyRevenue?.toFixed(2)}</h3>
                  </div>
                  <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center border border-purple-100/50 shadow-sm shrink-0 print:hidden">
                    <Sparkles size={20} />
                  </div>
                </div>
              </div>

              {/* Recharts widgets */}
              {chartData && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 print:block print:space-y-8">
                  {/* Revenue area chart */}
                  <div className="bg-white p-6 rounded-xl border border-slate-200/70 shadow-sm">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Monthly Revenue Flow</h3>
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
                  <div className="bg-white p-6 rounded-xl border border-slate-200/70 shadow-sm">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Sales Revenue vs Procurement Expense</h3>
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
                  <div className="bg-white p-6 rounded-xl border border-slate-200/70 shadow-sm">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Stock Breakdown by Category</h3>
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
                  <div className="bg-white p-6 rounded-xl border border-slate-200/70 shadow-sm">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Low Stock Warning Trend</h3>
                    <div className="h-[300px] w-full">
                      {chartData.lowStockTrend?.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400">
                          <AlertCircle size={24} className="stroke-[1.5]" />
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
                <div className="card-premium p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Sales Invoiced</p>
                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{salesReport.totalSalesCount} orders</h3>
                    <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1 mt-2">
                      <span className="material-symbols-outlined text-sm">assignment</span>
                      Cumulative orders completed
                    </span>
                  </div>
                  <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100/50 shadow-sm shrink-0 print:hidden">
                    <Layers size={20} />
                  </div>
                </div>
                <div className="card-premium p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Aggregate Sales Revenue</p>
                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight">${salesReport.totalSalesRevenue?.toFixed(2)}</h3>
                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-2">
                      <span className="material-symbols-outlined text-sm">trending_up</span>
                      Gross billing generated
                    </span>
                  </div>
                  <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100/50 shadow-sm shrink-0 print:hidden">
                    <DollarSign size={20} />
                  </div>
                </div>
                <div className="card-premium p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Top Selling SKU</p>
                    <h4 className="text-sm font-bold text-slate-800 truncate max-w-[200px]" title={salesReport.topProducts?.[0]?.name}>
                      {salesReport.topProducts?.[0]?.sku || "N/A"}
                    </h4>
                    <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1 mt-2">
                      <span className="material-symbols-outlined text-sm">workspace_premium</span>
                      Most ordered item SKU
                    </span>
                  </div>
                  {salesReport.topProducts?.[0] && (
                    <span className="bg-blue-50 text-blue-700 px-2.5 py-1 border border-blue-100 rounded-lg text-[10px] font-bold font-mono shadow-sm shrink-0">
                      {salesReport.topProducts[0].quantitySold} sold
                    </span>
                  )}
                </div>
              </div>

              {/* Filters toolbar */}
              {renderFiltersPanel()}

              {/* Data Table */}
              <div className="bg-white rounded-xl border border-slate-200/70 shadow-sm space-y-4 p-6">
                <div className="flex items-center justify-between flex-wrap gap-4 pb-2 border-b border-slate-100">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sales Invoices Grid</h3>
                  <div className="flex items-center gap-2">
                    <button onClick={handlePrint} className="btn-secondary py-1.5 px-3 flex items-center gap-2 text-xs">
                      <Printer size={14} />
                      <span>Print Page</span>
                    </button>
                    <button onClick={handleExportCSV} disabled={isExporting} className="btn-secondary py-1.5 px-3 flex items-center gap-2 text-xs">
                      <Download size={14} className={isExporting ? "animate-spin" : ""} />
                      <span>{isExporting ? "Exporting..." : "Export CSV"}</span>
                    </button>
                  </div>
                </div>

                <div className="table-container-premium">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr>
                          <th className="th-premium cursor-pointer hover:bg-slate-100/50 transition-colors" onClick={() => handleSort("saleNo")}>Sale No</th>
                          <th className="th-premium cursor-pointer hover:bg-slate-100/50 transition-colors" onClick={() => handleSort("customerName")}>Customer</th>
                          <th className="th-premium">Status</th>
                          <th className="th-premium">Payment</th>
                          <th className="th-premium">Method</th>
                          <th className="th-premium cursor-pointer hover:bg-slate-100/50 transition-colors" onClick={() => handleSort("saleDate")}>Date</th>
                          <th className="th-premium cursor-pointer hover:bg-slate-100/50 text-right" onClick={() => handleSort("totalAmount")}>Revenue</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {salesReport.sales.content?.map((s) => (
                          <tr key={s.id} className="tr-premium">
                            <td className="td-premium font-mono font-bold text-xs text-slate-700">{s.saleNo}</td>
                            <td className="td-premium font-semibold text-slate-800 text-xs">{s.customerName}</td>
                            <td className="td-premium py-2">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${s.status === "COMPLETED" ? "bg-emerald-50 text-emerald-800 border-emerald-100/50" : "bg-amber-50 text-amber-800 border-amber-100/50"}`}>
                                {s.status}
                              </span>
                            </td>
                            <td className="td-premium py-2">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${s.paymentStatus === "PAID" ? "bg-emerald-50 text-emerald-800 border-emerald-100/50" : "bg-amber-50 text-amber-800 border-amber-100/50"}`}>
                                {s.paymentStatus}
                              </span>
                            </td>
                            <td className="td-premium font-semibold text-xs text-slate-500">{s.paymentMethod}</td>
                            <td className="td-premium text-slate-500 text-xs">{s.saleDate}</td>
                            <td className="td-premium text-right font-extrabold text-slate-900 text-xs">${s.totalAmount?.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
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
                <div className="card-premium p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Purchase Orders</p>
                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{purchaseReport.totalPurchasesCount} orders</h3>
                    <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1 mt-2">
                      <span className="material-symbols-outlined text-sm">assignment</span>
                      Cumulative orders completed
                    </span>
                  </div>
                  <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100/50 shadow-sm shrink-0 print:hidden">
                    <Layers size={20} />
                  </div>
                </div>
                <div className="card-premium p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Procured Expense</p>
                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight">${purchaseReport.totalPurchasesCost?.toFixed(2)}</h3>
                    <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1 mt-2">
                      <span className="material-symbols-outlined text-sm">payments</span>
                      Replenishment cost registered
                    </span>
                  </div>
                  <div className="w-11 h-11 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center border border-amber-100/50 shadow-sm shrink-0 print:hidden">
                    <ArrowDownLeft size={20} />
                  </div>
                </div>
              </div>

              {/* Filters */}
              {renderFiltersPanel()}

              {/* Purchase Table */}
              <div className="bg-white rounded-xl border border-slate-200/70 shadow-sm space-y-4 p-6">
                <div className="flex items-center justify-between flex-wrap gap-4 pb-2 border-b border-slate-100">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Procurement Ledgers</h3>
                  <div className="flex items-center gap-2">
                    <button onClick={handlePrint} className="btn-secondary py-1.5 px-3 flex items-center gap-2 text-xs">
                      <Printer size={14} />
                      <span>Print Page</span>
                    </button>
                    <button onClick={handleExportCSV} disabled={isExporting} className="btn-secondary py-1.5 px-3 flex items-center gap-2 text-xs">
                      <Download size={14} className={isExporting ? "animate-spin" : ""} />
                      <span>{isExporting ? "Exporting..." : "Export CSV"}</span>
                    </button>
                  </div>
                </div>

                <div className="table-container-premium">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr>
                          <th className="th-premium cursor-pointer hover:bg-slate-100/50 transition-colors" onClick={() => handleSort("purchaseNo")}>Purchase No</th>
                          <th className="th-premium cursor-pointer hover:bg-slate-100/50 transition-colors" onClick={() => handleSort("supplierName")}>Supplier</th>
                          <th className="th-premium">Status</th>
                          <th className="th-premium">Payment</th>
                          <th className="th-premium cursor-pointer hover:bg-slate-100/50 transition-colors" onClick={() => handleSort("purchaseDate")}>Date</th>
                          <th className="th-premium cursor-pointer hover:bg-slate-100/50 text-right" onClick={() => handleSort("totalAmount")}>Cost</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {purchaseReport.purchases.content?.map((p) => (
                          <tr key={p.id} className="tr-premium">
                            <td className="td-premium font-mono font-bold text-xs text-slate-700">{p.purchaseNo}</td>
                            <td className="td-premium font-semibold text-slate-800 text-xs">{p.supplierName}</td>
                            <td className="td-premium py-2">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${p.status === "RECEIVED" ? "bg-emerald-50 text-emerald-800 border-emerald-100/50" : "bg-amber-50 text-amber-800 border-amber-100/50"}`}>
                                {p.status}
                              </span>
                            </td>
                            <td className="td-premium py-2">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${p.paymentStatus === "PAID" ? "bg-emerald-50 text-emerald-800 border-emerald-100/50" : "bg-amber-50 text-amber-800 border-amber-100/50"}`}>
                                {p.paymentStatus}
                              </span>
                            </td>
                            <td className="td-premium text-slate-500 text-xs">{p.purchaseDate}</td>
                            <td className="td-premium text-right font-extrabold text-slate-900 text-xs">${p.totalAmount?.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
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
                <div className="card-premium p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Products SKUs</p>
                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{inventoryReport.totalProductsCount}</h3>
                    <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1 mt-2">
                      <span className="material-symbols-outlined text-sm">inventory_2</span>
                      Active stock items
                    </span>
                  </div>
                  <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100/50 shadow-sm shrink-0 print:hidden">
                    <Layers size={20} />
                  </div>
                </div>

                <div className="card-premium p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Inventory Value</p>
                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight">${inventoryReport.totalInventoryValue?.toFixed(2)}</h3>
                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-2">
                      <span className="material-symbols-outlined text-sm">trending_up</span>
                      Estimated asset worth
                    </span>
                  </div>
                  <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100/50 shadow-sm shrink-0 print:hidden">
                    <DollarSign size={20} />
                  </div>
                </div>

                <div className="card-premium p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Low Stock Products</p>
                    <h3 className={`text-2xl font-bold tracking-tight ${inventoryReport.lowStockCount > 0 ? "text-amber-600" : "text-slate-900"}`}>
                      {inventoryReport.lowStockCount}
                    </h3>
                    <span className={`text-[10px] font-bold flex items-center gap-1 mt-2 ${inventoryReport.lowStockCount > 0 ? "text-amber-600" : "text-slate-500"}`}>
                      <span className="material-symbols-outlined text-xs">
                        {inventoryReport.lowStockCount > 0 ? "warning" : "check_circle"}
                      </span>
                      {inventoryReport.lowStockCount > 0 ? "Reorder suggested" : "Stock level normal"}
                    </span>
                  </div>
                  <div className="w-11 h-11 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center border border-amber-100/50 shadow-sm shrink-0 print:hidden">
                    <AlertCircle size={20} />
                  </div>
                </div>

                <div className="card-premium p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Out of Stock Products</p>
                    <h3 className={`text-2xl font-bold tracking-tight ${inventoryReport.outOfStockCount > 0 ? "text-rose-600" : "text-slate-900"}`}>
                      {inventoryReport.outOfStockCount}
                    </h3>
                    <span className={`text-[10px] font-bold flex items-center gap-1 mt-2 ${inventoryReport.outOfStockCount > 0 ? "text-rose-600" : "text-slate-500"}`}>
                      <span className="material-symbols-outlined text-xs">
                        {inventoryReport.outOfStockCount > 0 ? "error" : "check_circle"}
                      </span>
                      {inventoryReport.outOfStockCount > 0 ? "Critical deficit" : "Zero-out normal"}
                    </span>
                  </div>
                  <div className="w-11 h-11 bg-rose-50 text-rose-650 rounded-xl flex items-center justify-center border border-rose-100/50 shadow-sm shrink-0 print:hidden">
                    <ShieldAlert size={20} />
                  </div>
                </div>
              </div>

              {/* Filters */}
              {renderFiltersPanel()}

              {/* Stock Inventory Table */}
              <div className="bg-white rounded-xl border border-slate-200/70 shadow-sm space-y-4 p-6">
                <div className="flex items-center justify-between flex-wrap gap-4 pb-2 border-b border-slate-100">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Inventory Stock Valuations</h3>
                  <div className="flex items-center gap-2">
                    <button onClick={handlePrint} className="btn-secondary py-1.5 px-3 flex items-center gap-2 text-xs">
                      <Printer size={14} />
                      <span>Print Page</span>
                    </button>
                    <button onClick={handleExportCSV} disabled={isExporting} className="btn-secondary py-1.5 px-3 flex items-center gap-2 text-xs">
                      <Download size={14} className={isExporting ? "animate-spin" : ""} />
                      <span>{isExporting ? "Exporting..." : "Export CSV"}</span>
                    </button>
                  </div>
                </div>

                <div className="table-container-premium">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr>
                          <th className="th-premium cursor-pointer hover:bg-slate-100/50 transition-colors" onClick={() => handleSort("sku")}>SKU</th>
                          <th className="th-premium cursor-pointer hover:bg-slate-100/50 transition-colors" onClick={() => handleSort("name")}>Product Name</th>
                          <th className="th-premium cursor-pointer hover:bg-slate-100/50 transition-colors" onClick={() => handleSort("category")}>Category</th>
                          <th className="th-premium cursor-pointer hover:bg-slate-100/50 transition-colors" onClick={() => handleSort("quantityInStock")}>Stock Level</th>
                          <th className="th-premium">Buying Price</th>
                          <th className="th-premium">Selling Price</th>
                          <th className="th-premium text-right">Value (Cost)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {inventoryReport.products.content?.map((p) => (
                          <tr key={p.id} className="tr-premium">
                            <td className="td-premium font-mono font-bold text-xs text-slate-700">{p.sku}</td>
                            <td className="td-premium font-semibold text-slate-800 text-xs">{p.name}</td>
                            <td className="td-premium text-slate-500 text-xs">{p.category}</td>
                            <td className="td-premium font-semibold text-slate-700 text-xs py-2">
                              {p.quantityInStock} {p.unit}
                              {p.quantityInStock === 0 ? (
                                <span className="ml-2 text-[9px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100/60">Out of Stock</span>
                              ) : p.quantityInStock <= p.reorderLevel ? (
                                <span className="ml-2 text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100/60">Low Stock</span>
                              ) : null}
                            </td>
                            <td className="td-premium text-slate-500 text-xs">${p.purchasePrice?.toFixed(2)}</td>
                            <td className="td-premium text-slate-500 text-xs">${p.sellingPrice?.toFixed(2)}</td>
                            <td className="td-premium text-right font-extrabold text-slate-900 text-xs">${(p.quantityInStock * p.purchasePrice)?.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
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
                <div className="card-premium p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Invoices</p>
                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{invoiceReport.totalInvoicesCount}</h3>
                    <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1 mt-2">
                      <span className="material-symbols-outlined text-sm">receipt</span>
                      Billing records issued
                    </span>
                  </div>
                  <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100/50 shadow-sm shrink-0 print:hidden">
                    <Layers size={20} />
                  </div>
                </div>
                <div className="card-premium p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Paid Invoices</p>
                    <h3 className="text-2xl font-bold text-emerald-600 tracking-tight">{invoiceReport.paidInvoicesCount}</h3>
                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-2">
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      Settled/completed accounts
                    </span>
                  </div>
                  <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100/50 shadow-sm shrink-0 print:hidden">
                    <DollarSign size={20} />
                  </div>
                </div>
                <div className="card-premium p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Revenue Generated</p>
                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight">${invoiceReport.totalRevenue?.toFixed(2)}</h3>
                    <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1 mt-2">
                      <span className="material-symbols-outlined text-sm">trending_up</span>
                      Total receivables closed
                    </span>
                  </div>
                  <div className="w-11 h-11 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center border border-purple-100/50 shadow-sm shrink-0 print:hidden">
                    <Sparkles size={20} />
                  </div>
                </div>
                <div className="card-premium p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Average Invoice Value</p>
                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight">${invoiceReport.averageInvoiceValue?.toFixed(2)}</h3>
                    <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1 mt-2">
                      <span className="material-symbols-outlined text-sm">calculate</span>
                      Mean billing value
                    </span>
                  </div>
                  <div className="w-11 h-11 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center border border-amber-100/50 shadow-sm shrink-0 print:hidden">
                    <DollarSign size={20} />
                  </div>
                </div>
              </div>

              {/* Filters */}
              {renderFiltersPanel()}

              {/* Invoices Table */}
              <div className="bg-white rounded-xl border border-slate-200/70 shadow-sm space-y-4 p-6">
                <div className="flex items-center justify-between flex-wrap gap-4 pb-2 border-b border-slate-100">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Invoice Ledgers</h3>
                  <div className="flex items-center gap-2">
                    <button onClick={handlePrint} className="btn-secondary py-1.5 px-3 flex items-center gap-2 text-xs">
                      <Printer size={14} />
                      <span>Print Page</span>
                    </button>
                    <button onClick={handleExportCSV} disabled={isExporting} className="btn-secondary py-1.5 px-3 flex items-center gap-2 text-xs">
                      <Download size={14} className={isExporting ? "animate-spin" : ""} />
                      <span>{isExporting ? "Exporting..." : "Export CSV"}</span>
                    </button>
                  </div>
                </div>

                <div className="table-container-premium">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr>
                          <th className="th-premium cursor-pointer hover:bg-slate-100/50 transition-colors" onClick={() => handleSort("invoiceNo")}>Invoice No</th>
                          <th className="th-premium cursor-pointer hover:bg-slate-100/50 transition-colors" onClick={() => handleSort("customerName")}>Customer</th>
                          <th className="th-premium">Sales Order</th>
                          <th className="th-premium">Status</th>
                          <th className="th-premium">Payment</th>
                          <th className="th-premium cursor-pointer hover:bg-slate-100/50 transition-colors" onClick={() => handleSort("invoiceDate")}>Date</th>
                          <th className="th-premium cursor-pointer hover:bg-slate-100/50 text-right" onClick={() => handleSort("grandTotal")}>Grand Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {invoiceReport.invoices.content?.map((i) => (
                          <tr key={i.id} className="tr-premium">
                            <td className="td-premium font-mono font-bold text-xs text-slate-700">{i.invoiceNo}</td>
                            <td className="td-premium font-semibold text-slate-800 text-xs">{i.customerName}</td>
                            <td className="td-premium font-mono text-xs text-slate-500">{i.saleNo || "Standalone"}</td>
                            <td className="td-premium py-2">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${i.status === "PAID" ? "bg-emerald-50 text-emerald-800 border-emerald-100/50" : i.status === "ISSUED" ? "bg-blue-50 text-blue-800 border-blue-100/50" : "bg-amber-50 text-amber-800 border-amber-100/50"}`}>
                                {i.status}
                              </span>
                            </td>
                            <td className="td-premium py-2">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${i.paymentStatus === "PAID" ? "bg-emerald-50 text-emerald-800 border-emerald-100/50" : "bg-amber-50 text-amber-800 border-amber-100/50"}`}>
                                {i.paymentStatus}
                              </span>
                            </td>
                            <td className="td-premium text-slate-500 text-xs">{i.invoiceDate}</td>
                            <td className="td-premium text-right font-extrabold text-slate-900 text-xs">${i.grandTotal?.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {renderPagination()}
              </div>
            </div>
          )}

          {/* TAB 6: LOW STOCK REPORT */}
          {activeTab === "low_stock" && lowStockReport && (
            <div className="space-y-6 animate-fade-in">
              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="card-premium p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Low Stock Count</p>
                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{totalElements}</h3>
                    <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1 mt-2">
                      <span className="material-symbols-outlined text-sm">warning</span>
                      Total items needing reorder
                    </span>
                  </div>
                  <div className="w-11 h-11 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center border border-rose-100/50 shadow-sm shrink-0 print:hidden">
                    <AlertTriangle size={20} />
                  </div>
                </div>

                <div className="card-premium p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Critical Priority</p>
                    <h3 className="text-2xl font-bold text-rose-600 tracking-tight">
                      {lowStockReport.content?.filter(i => i.priority === "CRITICAL").length}
                    </h3>
                    <span className="text-[10px] text-rose-600 font-bold flex items-center gap-1 mt-2">
                      <span className="material-symbols-outlined text-sm">error</span>
                      Urgent attention required
                    </span>
                  </div>
                  <div className="w-11 h-11 bg-rose-100 text-rose-700 rounded-xl flex items-center justify-center border border-rose-200/50 shadow-sm shrink-0 print:hidden">
                    <ShieldAlert size={20} />
                  </div>
                </div>

                <div className="card-premium p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">High Priority</p>
                    <h3 className="text-2xl font-bold text-amber-600 tracking-tight">
                      {lowStockReport.content?.filter(i => i.priority === "HIGH").length}
                    </h3>
                    <span className="text-[10px] text-amber-600 font-bold flex items-center gap-1 mt-2">
                      <span className="material-symbols-outlined text-sm">notification_important</span>
                      Reorder soon
                    </span>
                  </div>
                  <div className="w-11 h-11 bg-amber-50 text-amber-650 rounded-xl flex items-center justify-center border border-amber-100/50 shadow-sm shrink-0 print:hidden">
                    <AlertCircle size={20} />
                  </div>
                </div>

                <div className="card-premium p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Normal Priority</p>
                    <h3 className="text-2xl font-bold text-blue-600 tracking-tight">
                      {lowStockReport.content?.filter(i => i.priority === "NORMAL").length}
                    </h3>
                    <span className="text-[10px] text-blue-600 font-bold flex items-center gap-1 mt-2">
                      <span className="material-symbols-outlined text-sm">info</span>
                      Under monitor threshold
                    </span>
                  </div>
                  <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100/50 shadow-sm shrink-0 print:hidden">
                    <Layers size={20} />
                  </div>
                </div>
              </div>

              {/* Filters */}
              {renderFiltersPanel()}

              {/* Table */}
              <div className="bg-white rounded-xl border border-slate-200/70 shadow-sm space-y-4 p-6">
                <div className="flex items-center justify-between flex-wrap gap-4 pb-2 border-b border-slate-100">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Low Stock Inventory Log</h3>
                  <div className="flex items-center gap-2">
                    <button onClick={handlePrint} className="btn-secondary py-1.5 px-3 flex items-center gap-2 text-xs">
                      <Printer size={14} />
                      <span>Print Page</span>
                    </button>
                    <button onClick={handleExportCSV} disabled={isExporting} className="btn-secondary py-1.5 px-3 flex items-center gap-2 text-xs">
                      <Download size={14} className={isExporting ? "animate-spin" : ""} />
                      <span>{isExporting ? "Exporting..." : "Export CSV"}</span>
                    </button>
                  </div>
                </div>

                <div className="table-container-premium">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr>
                          <th className="th-premium cursor-pointer" onClick={() => handleSort("sku")}>SKU</th>
                          <th className="th-premium cursor-pointer" onClick={() => handleSort("name")}>Product Name</th>
                          <th className="th-premium cursor-pointer" onClick={() => handleSort("category")}>Category</th>
                          <th className="th-premium text-right">Current Stock</th>
                          <th className="th-premium text-right">Reorder Level</th>
                          <th className="th-premium text-center">Priority</th>
                          <th className="th-premium text-right">Last Alert Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {lowStockReport.content?.map((item) => (
                          <tr key={item.id} className="tr-premium">
                            <td className="td-premium font-mono font-bold text-xs text-slate-700">{item.sku}</td>
                            <td className="td-premium font-semibold text-slate-800 text-xs">{item.name}</td>
                            <td className="td-premium text-slate-500 text-xs">{item.category}</td>
                            <td className="td-premium text-right font-bold text-rose-600 text-xs">{item.quantityInStock}</td>
                            <td className="td-premium text-right text-slate-550 text-xs">{item.reorderLevel}</td>
                            <td className="td-premium text-center py-2">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                item.priority === "CRITICAL"
                                  ? "bg-rose-50 text-rose-800 border-rose-100/50"
                                  : item.priority === "HIGH"
                                  ? "bg-amber-50 text-amber-800 border-amber-100/50"
                                  : "bg-blue-50 text-blue-800 border-blue-100/50"
                              }`}>
                                {item.priority}
                              </span>
                            </td>
                            <td className="td-premium text-right text-slate-500 text-xs">
                              {item.timestamp ? new Date(item.timestamp).toLocaleString() : "N/A"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {renderPagination()}
              </div>
            </div>
          )}

          {/* TAB 7: STOCK FORECASTING */}
          {activeTab === "forecast" && forecastReport && (
            <div className="space-y-6 animate-fade-in">
              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="card-premium p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Monitored Items</p>
                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{totalElements}</h3>
                    <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1 mt-2">
                      <span className="material-symbols-outlined text-sm">visibility</span>
                      Continuous velocity analysis
                    </span>
                  </div>
                  <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100/50 shadow-sm shrink-0 print:hidden">
                    <TrendingUp size={20} />
                  </div>
                </div>

                <div className="card-premium p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Runout Risk (0-7 Days)</p>
                    <h3 className="text-2xl font-bold text-rose-600 tracking-tight">
                      {forecastReport.content?.filter(i => i.status === "RED").length}
                    </h3>
                    <span className="text-[10px] text-rose-605 font-bold flex items-center gap-1 mt-2">
                      <span className="material-symbols-outlined text-sm">dangerous</span>
                      Critical replenishment needed
                    </span>
                  </div>
                  <div className="w-11 h-11 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center border border-rose-100/50 shadow-sm shrink-0 print:hidden">
                    <AlertTriangle size={20} />
                  </div>
                </div>

                <div className="card-premium p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Warning Projections</p>
                    <h3 className="text-2xl font-bold text-amber-600 tracking-tight">
                      {forecastReport.content?.filter(i => i.status === "AMBER").length}
                    </h3>
                    <span className="text-[10px] text-amber-600 font-bold flex items-center gap-1 mt-2">
                      <span className="material-symbols-outlined text-sm">warning</span>
                      Depleting soon (7-30 Days)
                    </span>
                  </div>
                  <div className="w-11 h-11 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center border border-amber-100/50 shadow-sm shrink-0 print:hidden">
                    <AlertCircle size={20} />
                  </div>
                </div>

                <div className="card-premium p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Stable Projections</p>
                    <h3 className="text-2xl font-bold text-emerald-600 tracking-tight">
                      {forecastReport.content?.filter(i => i.status === "GREEN").length}
                    </h3>
                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-2">
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      Adequate supply (30+ Days)
                    </span>
                  </div>
                  <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100/50 shadow-sm shrink-0 print:hidden">
                    <CheckCircle2 size={20} />
                  </div>
                </div>
              </div>

              {/* Filters */}
              {renderFiltersPanel()}

              {/* Table */}
              <div className="bg-white rounded-xl border border-slate-200/70 shadow-sm space-y-4 p-6">
                <div className="flex items-center justify-between flex-wrap gap-4 pb-2 border-b border-slate-100">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Inventory Depletion Velocity Forecast</h3>
                  <div className="flex items-center gap-2">
                    <button onClick={handlePrint} className="btn-secondary py-1.5 px-3 flex items-center gap-2 text-xs">
                      <Printer size={14} />
                      <span>Print Page</span>
                    </button>
                    <button onClick={handleExportCSV} disabled={isExporting} className="btn-secondary py-1.5 px-3 flex items-center gap-2 text-xs">
                      <Download size={14} className={isExporting ? "animate-spin" : ""} />
                      <span>{isExporting ? "Exporting..." : "Export CSV"}</span>
                    </button>
                  </div>
                </div>

                <div className="table-container-premium">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr>
                          <th className="th-premium cursor-pointer" onClick={() => handleSort("sku")}>SKU</th>
                          <th className="th-premium cursor-pointer" onClick={() => handleSort("productName")}>Product Name</th>
                          <th className="th-premium text-right">Current Stock</th>
                          <th className="th-premium text-right">Daily Sales Velocity</th>
                          <th className="th-premium text-right">Estimated Days Left</th>
                          <th className="th-premium text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {forecastReport.content?.map((item) => (
                          <tr key={item.productId} className="tr-premium">
                            <td className="td-premium font-mono font-bold text-xs text-slate-700">{item.sku}</td>
                            <td className="td-premium font-semibold text-slate-800 text-xs">{item.productName}</td>
                            <td className="td-premium text-right text-slate-500 text-xs font-semibold">{item.currentStock}</td>
                            <td className="td-premium text-right text-slate-550 text-xs font-mono">{item.averageDailySales?.toFixed(2)} units/day</td>
                            <td className="td-premium text-right text-xs">
                              {item.daysRemaining !== null ? (
                                <span className={`font-bold ${
                                  item.daysRemaining <= 7 ? "text-rose-600" : item.daysRemaining <= 30 ? "text-amber-600" : "text-emerald-600"
                                }`}>
                                  {item.daysRemaining === 9999 ? "∞ (Stable)" : `${item.daysRemaining.toFixed(1)} Days`}
                                </span>
                              ) : (
                                <span className="text-slate-400 italic">No Sales History</span>
                              )}
                            </td>
                            <td className="td-premium text-center py-2">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                item.status === "RED"
                                  ? "bg-rose-50 text-rose-800 border-rose-100/50"
                                  : item.status === "AMBER"
                                  ? "bg-amber-50 text-amber-800 border-amber-100/50"
                                  : item.status === "GREEN"
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-100/50"
                                  : "bg-slate-50 text-slate-500 border-slate-100/50"
                              }`}>
                                {item.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {renderPagination()}
              </div>
            </div>
          )}

          {/* TAB 8: ABC INVENTORY ANALYSIS */}
          {activeTab === "abc" && abcReport && (
            <div className="space-y-6 animate-fade-in">
              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="card-premium p-6 border-l-4 border-l-rose-500 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Class A (High Value)</p>
                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                      {abcReport.content?.filter(i => i.category === "A").length} Products
                    </h3>
                    <span className="text-[10px] text-rose-605 font-bold flex items-center gap-1 mt-2">
                      <span className="material-symbols-outlined text-sm">stars</span>
                      Generates ~70-80% of revenue
                    </span>
                  </div>
                  <div className="w-11 h-11 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center border border-rose-100/50 shadow-sm shrink-0 print:hidden">
                    <Sparkles size={20} />
                  </div>
                </div>

                <div className="card-premium p-6 border-l-4 border-l-amber-500 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Class B (Medium Value)</p>
                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                      {abcReport.content?.filter(i => i.category === "B").length} Products
                    </h3>
                    <span className="text-[10px] text-amber-600 font-bold flex items-center gap-1 mt-2">
                      <span className="material-symbols-outlined text-sm">local_mall</span>
                      Generates ~15-20% of revenue
                    </span>
                  </div>
                  <div className="w-11 h-11 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center border border-amber-100/50 shadow-sm shrink-0 print:hidden">
                    <Layers size={20} />
                  </div>
                </div>

                <div className="card-premium p-6 border-l-4 border-l-blue-500 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Class C (Low Value)</p>
                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                      {abcReport.content?.filter(i => i.category === "C").length} Products
                    </h3>
                    <span className="text-[10px] text-blue-600 font-bold flex items-center gap-1 mt-2">
                      <span className="material-symbols-outlined text-sm">inventory_2</span>
                      Generates ~5-10% of revenue
                    </span>
                  </div>
                  <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100/50 shadow-sm shrink-0 print:hidden">
                    <BarChart3 size={20} />
                  </div>
                </div>
              </div>

              {/* Filters */}
              {renderFiltersPanel()}

              {/* Table */}
              <div className="bg-white rounded-xl border border-slate-200/70 shadow-sm space-y-4 p-6">
                <div className="flex items-center justify-between flex-wrap gap-4 pb-2 border-b border-slate-100">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">ABC Classification & Revenue Contributions</h3>
                  <div className="flex items-center gap-2">
                    <button onClick={handlePrint} className="btn-secondary py-1.5 px-3 flex items-center gap-2 text-xs">
                      <Printer size={14} />
                      <span>Print Page</span>
                    </button>
                    <button onClick={handleExportCSV} disabled={isExporting} className="btn-secondary py-1.5 px-3 flex items-center gap-2 text-xs">
                      <Download size={14} className={isExporting ? "animate-spin" : ""} />
                      <span>{isExporting ? "Exporting..." : "Export CSV"}</span>
                    </button>
                  </div>
                </div>

                <div className="table-container-premium">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr>
                          <th className="th-premium text-center w-24">ABC Tier</th>
                          <th className="th-premium cursor-pointer" onClick={() => handleSort("sku")}>SKU</th>
                          <th className="th-premium cursor-pointer" onClick={() => handleSort("productName")}>Product Name</th>
                          <th className="th-premium text-right">Total Quantity Sold</th>
                          <th className="th-premium text-right">Revenue Contribution</th>
                          <th className="th-premium text-right w-64">Revenue Contribution (%)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {abcReport.content?.map((item) => (
                          <tr key={item.productId} className="tr-premium">
                            <td className="td-premium text-center py-2">
                              <span className={`px-3 py-1 rounded-lg text-xs font-extrabold border ${
                                item.category === "A"
                                  ? "bg-rose-50 text-rose-800 border-rose-200/50 shadow-sm"
                                  : item.category === "B"
                                  ? "bg-amber-50 text-amber-800 border-amber-200/50"
                                  : "bg-blue-50 text-blue-800 border-blue-200/50"
                              }`}>
                                Tier {item.category}
                              </span>
                            </td>
                            <td className="td-premium font-mono font-bold text-xs text-slate-700">{item.sku}</td>
                            <td className="td-premium font-semibold text-slate-800 text-xs">{item.productName}</td>
                            <td className="td-premium text-right text-slate-550 text-xs font-semibold">{item.totalSold}</td>
                            <td className="td-premium text-right font-extrabold text-slate-900 text-xs">${item.revenue?.toFixed(2)}</td>
                            <td className="td-premium py-2">
                              <div className="flex items-center justify-end gap-3">
                                <span className="text-xs font-bold text-slate-700">{item.percentageContribution?.toFixed(2)}%</span>
                                <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden shrink-0 print:hidden border border-slate-200/40">
                                  <div
                                    className={`h-full rounded-full ${
                                      item.category === "A" ? "bg-rose-500" : item.category === "B" ? "bg-amber-500" : "bg-blue-500"
                                    }`}
                                    style={{ width: `${Math.min(100, item.percentageContribution || 0)}%` }}
                                  ></div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
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
    const isIntelligenceTab = ["low_stock", "forecast", "abc"].includes(activeTab);

    return (
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 items-center print:hidden">
        {/* Search */}
        <div className={`relative ${isIntelligenceTab ? "md:col-span-3" : ""}`}>
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
        {!isIntelligenceTab && (
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
        )}

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
            ) : activeTab === "low_stock" ? (
              <>
                <option value="">All Priorities</option>
                <option value="CRITICAL">Critical Priority</option>
                <option value="HIGH">High Priority</option>
                <option value="NORMAL">Normal Priority</option>
              </>
            ) : activeTab === "forecast" ? (
              <>
                <option value="">All Projections</option>
                <option value="RED">Danger (0-7 Days)</option>
                <option value="AMBER">Warning (7-30 Days)</option>
                <option value="GREEN">Stable (30+ Days)</option>
              </>
            ) : activeTab === "abc" ? (
              <>
                <option value="">All Tiers</option>
                <option value="A">Class A (Top 20% Revenue)</option>
                <option value="B">Class B (Next 30% Revenue)</option>
                <option value="C">Class C (Remaining 50%)</option>
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
