import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { getApiUrl } from "../api/config";

const DashboardSkeleton = () => (
  <div className="space-y-6">
    {/* KPI cards skeleton */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white border border-slate-200/60 rounded-xl p-6 flex items-center justify-between shadow-sm">
          <div className="space-y-3 flex-1">
            <div className="h-3 bg-slate-100 rounded w-24 skeleton-shimmer"></div>
            <div className="h-7 bg-slate-100 rounded w-32 skeleton-shimmer"></div>
            <div className="h-3 bg-slate-100 rounded w-20 skeleton-shimmer"></div>
          </div>
          <div className="w-11 h-11 bg-slate-100 rounded-xl skeleton-shimmer shrink-0"></div>
        </div>
      ))}
    </div>

    {/* Quick actions skeleton */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white border border-slate-200/60 rounded-xl p-4 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 bg-slate-100 rounded-lg skeleton-shimmer shrink-0"></div>
          <div className="space-y-2 flex-1">
            <div className="h-3 bg-slate-100 rounded w-16 skeleton-shimmer"></div>
            <div className="h-2 bg-slate-100 rounded w-24 skeleton-shimmer"></div>
          </div>
        </div>
      ))}
    </div>

    {/* Detailed skeleton grid */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
      <div className="bg-white p-6 rounded-xl border border-slate-200/60 shadow-sm space-y-4">
        <div className="h-4 bg-slate-100 rounded w-1/3 skeleton-shimmer mb-4"></div>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between">
              <div className="h-3 bg-slate-100 rounded w-20 skeleton-shimmer"></div>
              <div className="h-3 bg-slate-100 rounded w-12 skeleton-shimmer"></div>
            </div>
            <div className="h-2 bg-slate-150 rounded w-full skeleton-shimmer"></div>
          </div>
        ))}
      </div>
      <div className="bg-white p-6 rounded-xl border border-slate-200/60 shadow-sm lg:col-span-2 space-y-4">
        <div className="h-4 bg-slate-100 rounded w-1/4 skeleton-shimmer mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex justify-between items-center py-3 border-b border-slate-100">
              <div className="h-3 bg-slate-100 rounded w-20 skeleton-shimmer"></div>
              <div className="h-3 bg-slate-100 rounded w-16 skeleton-shimmer"></div>
              <div className="h-3 bg-slate-100 rounded w-28 skeleton-shimmer"></div>
              <div className="h-3 bg-slate-100 rounded w-12 skeleton-shimmer"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState("");
  const [recentActivities, setRecentActivities] = useState([]);

  const fetchStats = useCallback(async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      loadMockStats();
      setIsLoading(false);
      return;
    }
    try {
      const response = await fetch(getApiUrl() + "/dashboard/stats", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        setErrorMsg("Failed to retrieve dashboard stats. Using demo data.");
        loadMockStats();
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      setErrorMsg("Backend server offline. Displaying demo stats.");
      loadMockStats();
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchRecentActivities = useCallback(async () => {
    const token = localStorage.getItem("authToken");
    const role = localStorage.getItem("userRole") || "STAFF";
    if (role !== "ADMIN" || !token) {
      loadMockActivities();
      return;
    }
    try {
      const response = await fetch(`${getApiUrl()}/audit?page=0&size=5&sortBy=timestamp&direction=desc`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const data = await response.json();
        setRecentActivities(data.content || []);
      } else {
        loadMockActivities();
      }
    } catch (error) {
      console.error("Error fetching recent activities:", error);
      loadMockActivities();
    }
  }, []);

  const triggerAllFetches = useCallback(async () => {
    await Promise.all([fetchStats(), fetchRecentActivities()]);
  }, [fetchStats, fetchRecentActivities]);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const email = localStorage.getItem("userEmail") || "admin@LogiTrack.com";
    const role = localStorage.getItem("userRole") || "STAFF";
    setUserEmail(email);
    setUserRole(role);

    if (!token) {
      navigate("/login");
      return;
    }

    triggerAllFetches();
  }, [navigate, triggerAllFetches]);

  const loadMockStats = () => {
    setStats({
      totalSalesRevenue: 124500.0,
      totalPurchaseExpense: 83200.0,
      totalProductCount: 342,
      lowStockAlertsCount: 4,
      categoryStats: [
        { categoryName: "Electronics", productCount: 120, totalStock: 1450 },
        { categoryName: "Home Appliances", productCount: 85, totalStock: 620 },
        { categoryName: "Office Supplies", productCount: 94, totalStock: 2310 },
        { categoryName: "Fashion & Apparel", productCount: 43, totalStock: 89 },
      ],
      recentTransactions: [
        { id: "TX-9021", type: "Sale", amount: 1200.0, status: "PAID", date: "2026-07-05" },
        { id: "TX-9020", type: "Purchase", amount: 4500.0, status: "COMPLETED", date: "2026-07-05" },
        { id: "TX-9019", type: "Sale", amount: 350.0, status: "PAID", date: "2026-07-04" },
        { id: "TX-9018", type: "Sale", amount: 820.0, status: "UNPAID", date: "2026-07-04" },
        { id: "TX-9017", type: "Purchase", amount: 1250.0, status: "COMPLETED", date: "2026-07-03" },
      ],
      criticalItems: [
        { id: 1, sku: "PROCESSOR-I5-14400F", name: "Intel Core i5-14400F", category: "Processors", quantityInStock: 1, reorderLevel: 10, priority: "CRITICAL" }
      ],
      highPriorityItems: [
        { id: 2, sku: "MONITOR-IPS-24", name: "LG 24 IPS Monitor", category: "Monitors", quantityInStock: 3, reorderLevel: 8, priority: "HIGH" }
      ],
      forecastItems: [
        { productId: 1, productName: "Intel Core i5-14400F", sku: "PROCESSOR-I5-14400F", currentStock: 1, averageDailySales: 0.2, daysRemaining: 5.0, status: "RED" },
        { productId: 2, productName: "LG 24 IPS Monitor", sku: "MONITOR-IPS-24", currentStock: 3, averageDailySales: 0.15, daysRemaining: 20.0, status: "AMBER" },
        { productId: 3, productName: "Razer DeathAdder Essential", sku: "MOUSE-WIRELESS-X", currentStock: 9, averageDailySales: 0.1, daysRemaining: 90.0, status: "GREEN" }
      ],
      aProductsCount: 8,
      bProductsCount: 15,
      cProductsCount: 220,
      aProductsRevenue: 87150.0,
      bProductsRevenue: 24900.0,
      cProductsRevenue: 12450.0
    });
  };

  const loadMockActivities = () => {
    setRecentActivities([
      { id: 1, description: "Admin logged into the portal", action: "LOGIN", userName: "Admin User", userEmail: "admin@LogiTrack.com", timestamp: new Date().toISOString(), status: "SUCCESS" }
    ]);
  };

  const categoriesList = stats?.categoryStockBreakdown || stats?.categoryStats?.map(c => ({
    category: c.categoryName,
    totalStock: c.totalStock,
    productCount: c.productCount
  })) || [];

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans antialiased text-slate-900">
      <Sidebar activeTab="dashboard" />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header 
          workspaceName="Overview" 
          title="Inventory Workspace Overview" 
          onRefresh={triggerAllFetches}
        />

        <main className="flex-1 p-6 md:p-8 space-y-6 max-w-[1600px] w-full mx-auto">
          {isLoading && !stats ? (
            <DashboardSkeleton />
          ) : (
            <>
              {errorMsg && (
                <div className="p-4 bg-amber-50/80 border border-amber-200/70 text-amber-900 rounded-xl flex items-center gap-3 shadow-sm animate-fade-in">
                  <span className="material-symbols-outlined text-amber-600 text-lg select-none">info</span>
                  <p className="text-xs font-semibold leading-relaxed">{errorMsg}</p>
                </div>
              )}

              {/* Metric Cards Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Sales Card */}
                <div className="card-premium p-6 flex items-center justify-between">
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Sales Revenue</p>
                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight leading-none">
                      ${stats?.totalSalesRevenue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}
                    </h3>
                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-2.5">
                      <span className="material-symbols-outlined text-sm select-none">trending_up</span>
                      +12.5% this month
                    </span>
                  </div>
                  <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100/50 shadow-sm shrink-0">
                    <span className="material-symbols-outlined text-xl select-none">payments</span>
                  </div>
                </div>

                {/* Purchases Card */}
                <div className="card-premium p-6 flex items-center justify-between">
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Expenses</p>
                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight leading-none">
                      ${stats?.totalPurchaseExpense?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}
                    </h3>
                    <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1 mt-2.5">
                      <span className="material-symbols-outlined text-sm select-none">shopping_bag</span>
                      Warehouse purchases
                    </span>
                  </div>
                  <div className="w-11 h-11 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center border border-amber-100/50 shadow-sm shrink-0">
                    <span className="material-symbols-outlined text-xl select-none">local_mall</span>
                  </div>
                </div>

                {/* Total Products */}
                <div className="card-premium p-6 flex items-center justify-between">
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Catalog Products</p>
                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight leading-none">
                      {stats?.totalProductCount || stats?.totalProductsCount || 0}
                    </h3>
                    <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1 mt-2.5">
                      Active stock items
                    </span>
                  </div>
                  <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100/50 shadow-sm shrink-0">
                    <span className="material-symbols-outlined text-xl select-none">inventory</span>
                  </div>
                </div>

                {/* Low Stock Alerts */}
                <div className={`card-premium p-6 flex items-center justify-between ${
                  stats?.lowStockAlertsCount > 0 ? "border-red-200 bg-red-50/10 shadow-red-50/10" : ""
                }`}>
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Low Stock Alerts</p>
                    <h3 className={`text-2xl font-bold tracking-tight leading-none ${stats?.lowStockAlertsCount > 0 ? "text-red-650" : "text-slate-900"}`}>
                      {stats?.lowStockAlertsCount || 0}
                    </h3>
                    <span className={`text-[10px] font-bold flex items-center gap-1 mt-2.5 ${
                      stats?.lowStockAlertsCount > 0 ? "text-red-600" : "text-slate-500"
                    }`}>
                      {stats?.lowStockAlertsCount > 0 ? (
                        <>
                          <span className="material-symbols-outlined text-xs animate-bounce select-none">warning</span>
                          Restock recommended
                        </>
                      ) : (
                        "Stock levels healthy"
                      )}
                    </span>
                  </div>
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center border shadow-sm shrink-0 transition-all ${
                    stats?.lowStockAlertsCount > 0 ? "bg-red-50 text-red-600 border-red-100/50" : "bg-slate-50 text-slate-500 border-slate-100"
                  }`}>
                    <span className="material-symbols-outlined text-xl select-none">error_outline</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions Row */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quick Actions</h4>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <Link to="/products" className="group p-4 bg-white hover:bg-slate-50 border border-slate-200/60 rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-3.5 cursor-pointer">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100/50 group-hover:scale-105 transition-transform shrink-0">
                      <span className="material-symbols-outlined text-lg select-none">add_box</span>
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 truncate">Catalog Product</h4>
                      <p className="text-[10px] text-slate-400 font-semibold truncate mt-0.5">Add new stock item</p>
                    </div>
                  </Link>
                  <Link to="/sales-orders" className="group p-4 bg-white hover:bg-slate-50 border border-slate-200/60 rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-3.5 cursor-pointer">
                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100/50 group-hover:scale-105 transition-transform shrink-0">
                      <span className="material-symbols-outlined text-lg select-none">point_of_sale</span>
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 truncate">Register Sale</h4>
                      <p className="text-[10px] text-slate-400 font-semibold truncate mt-0.5">Create sales order</p>
                    </div>
                  </Link>
                  <Link to="/purchases" className="group p-4 bg-white hover:bg-slate-50 border border-slate-200/60 rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-3.5 cursor-pointer">
                    <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center border border-amber-100/50 group-hover:scale-105 transition-transform shrink-0">
                      <span className="material-symbols-outlined text-lg select-none">shopping_cart</span>
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 truncate">Restock Order</h4>
                      <p className="text-[10px] text-slate-400 font-semibold truncate mt-0.5">Purchase stock units</p>
                    </div>
                  </Link>
                  <Link to="/invoices" className="group p-4 bg-white hover:bg-slate-50 border border-slate-200/60 rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-3.5 cursor-pointer">
                    <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center border border-purple-100/50 group-hover:scale-105 transition-transform shrink-0">
                      <span className="material-symbols-outlined text-lg select-none">receipt_long</span>
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 truncate">Generate Invoice</h4>
                      <p className="text-[10px] text-slate-400 font-semibold truncate mt-0.5">Billing & statements</p>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Detailed Statistics Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Category breakdown */}
                <div className="bg-white p-6 rounded-xl border border-slate-200/60 shadow-sm lg:col-span-1 flex flex-col hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-5">
                    <h3 className="text-xs font-bold text-slate-850">Category Distribution</h3>
                    <span className="material-symbols-outlined text-slate-400 text-lg select-none">pie_chart</span>
                  </div>
                  
                  <div className="flex-grow space-y-5">
                    {categoriesList.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-10 font-semibold">No category breakdown available</p>
                    ) : (
                      categoriesList.map((category, idx) => (
                        <div key={idx} className="space-y-2">
                          <div className="flex justify-between items-center text-xs font-semibold">
                            <span className="text-slate-700">{category.category}</span>
                            <span className="text-slate-500">{category.totalStock} items</span>
                          </div>
                          {/* Progress Bar */}
                          <div className="w-full bg-slate-100 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-500 ${
                                idx % 4 === 0 ? "bg-blue-600" :
                                idx % 4 === 1 ? "bg-amber-500" :
                                idx % 4 === 2 ? "bg-emerald-600" : "bg-purple-500"
                              }`}
                              style={{ width: `${Math.min(100, (category.totalStock / 3000) * 100)}%` }}
                            ></div>
                          </div>
                          <div className="text-[10px] text-slate-400 font-semibold">
                            {category.productCount} unique products catalogued
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Recent activity/transactions */}
                <div className="bg-white p-6 rounded-xl border border-slate-200/60 shadow-sm lg:col-span-2 flex flex-col hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-5">
                    <h3 className="text-xs font-bold text-slate-850">Recent Ledger Activity</h3>
                    <span 
                      onClick={() => navigate("/stock-movements")}
                      className="text-xs text-blue-600 font-bold cursor-pointer hover:text-blue-700 hover:underline underline-offset-4 flex items-center gap-1"
                    >
                      <span>View Ledger</span>
                      <span className="material-symbols-outlined text-xs select-none">arrow_forward</span>
                    </span>
                  </div>

                  <div className="overflow-x-auto flex-grow table-container-premium">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr>
                          <th className="th-premium">Transaction ID</th>
                          <th className="th-premium">Type</th>
                          <th className="th-premium">Date</th>
                          <th className="th-premium text-right">Value</th>
                          <th className="th-premium text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {stats?.recentTransactions?.map((tx, idx) => (
                          <tr key={idx} className="tr-premium">
                            <td className="td-premium font-mono text-xs font-semibold text-slate-650">{tx.id}</td>
                            <td className="td-premium text-xs font-semibold text-slate-800">
                              <span className="flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full ${
                                  tx.type === "Sale" ? "bg-emerald-500 shadow-sm shadow-emerald-400" : "bg-amber-500 shadow-sm shadow-amber-400"
                                }`}></span>
                                {tx.type}
                              </span>
                            </td>
                            <td className="td-premium text-xs text-slate-500">{tx.date}</td>
                            <td className="td-premium text-xs text-slate-800 text-right font-bold">
                              ${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="td-premium text-center">
                              <span className={`badge-${
                                tx.status === "PAID" || tx.status === "COMPLETED" ? "success" : "warning"
                              }`}>
                                {tx.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Intelligence & Analytics Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 1. Low Stock Monitor */}
                <div className="bg-white p-6 rounded-xl border border-slate-200/60 shadow-sm flex flex-col hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-rose-600 text-lg select-none">warning</span>
                      <h3 className="text-xs font-bold text-slate-850">Critical Low Stock Monitor</h3>
                    </div>
                    <span 
                      onClick={() => navigate("/reports", { state: { tab: "low_stock" } })}
                      className="text-[10px] text-blue-600 font-bold cursor-pointer hover:underline flex items-center gap-0.5"
                    >
                      <span>View Report</span>
                      <span className="material-symbols-outlined text-xs select-none">arrow_forward</span>
                    </span>
                  </div>

                  <div className="flex-grow space-y-3">
                    {(!stats?.criticalItems || stats.criticalItems.length === 0) && 
                     (!stats?.highPriorityItems || stats.highPriorityItems.length === 0) ? (
                      <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                        <span className="material-symbols-outlined text-3xl mb-1 text-emerald-500">check_circle</span>
                        <p className="text-xs font-semibold">All stock levels healthy</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {stats.criticalItems?.slice(0, 2).map((item) => (
                          <div key={item.id || item.sku} className="flex items-center justify-between p-2.5 rounded-lg bg-rose-50/40 border border-rose-100/50">
                            <div className="min-w-0 flex-1 pr-2">
                              <p className="text-xs font-bold text-slate-850 truncate">{item.name}</p>
                              <p className="text-[10px] text-rose-600 font-semibold mt-0.5">Stock: {item.quantityInStock} / Reorder: {item.reorderLevel}</p>
                            </div>
                            <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-rose-100 text-rose-800 border border-rose-200/30 uppercase shrink-0">CRITICAL</span>
                          </div>
                        ))}
                        {stats.highPriorityItems?.slice(0, 2).map((item) => (
                          <div key={item.id || item.sku} className="flex items-center justify-between p-2.5 rounded-lg bg-amber-50/30 border border-amber-100/40">
                            <div className="min-w-0 flex-1 pr-2">
                              <p className="text-xs font-bold text-slate-850 truncate">{item.name}</p>
                              <p className="text-[10px] text-amber-700 font-semibold mt-0.5">Stock: {item.quantityInStock} / Reorder: {item.reorderLevel}</p>
                            </div>
                            <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-amber-100 text-amber-805 border border-amber-200/30 uppercase shrink-0">HIGH</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Stock Runout Velocity Forecast */}
                <div className="bg-white p-6 rounded-xl border border-slate-200/60 shadow-sm flex flex-col hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-amber-600 text-lg select-none">hourglass_empty</span>
                      <h3 className="text-xs font-bold text-slate-850">Stock Runout Projections</h3>
                    </div>
                    <span 
                      onClick={() => navigate("/reports", { state: { tab: "forecast" } })}
                      className="text-[10px] text-blue-600 font-bold cursor-pointer hover:underline flex items-center gap-0.5"
                    >
                      <span>View Forecasts</span>
                      <span className="material-symbols-outlined text-xs select-none">arrow_forward</span>
                    </span>
                  </div>

                  <div className="flex-grow space-y-2">
                    {!stats?.forecastItems || stats.forecastItems.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                        <span className="material-symbols-outlined text-3xl mb-1 text-slate-350">insights</span>
                        <p className="text-xs font-semibold">No runout forecasts projected</p>
                      </div>
                    ) : (
                      stats.forecastItems.slice(0, 4).map((item) => (
                        <div key={item.productId || item.sku} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100/50 transition-colors border border-slate-100">
                          <div className="min-w-0 flex-1 pr-3">
                            <p className="text-xs font-bold text-slate-850 truncate">{item.productName}</p>
                            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Velocity: {item.averageDailySales?.toFixed(1)}/day • Stock: {item.currentStock}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 border ${
                            item.status === "RED" 
                              ? "bg-rose-50 text-rose-800 border-rose-100" 
                              : item.status === "AMBER" 
                              ? "bg-amber-50 text-amber-800 border-amber-100" 
                              : "bg-emerald-50 text-emerald-800 border-emerald-100"
                          }`}>
                            {item.daysRemaining !== null ? (
                              item.daysRemaining === 9999 ? "Stable" : `${item.daysRemaining.toFixed(0)}d left`
                            ) : (
                              "No Sales"
                            )}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* 3. ABC Analysis Inventory Breakdown */}
                <div className="bg-white p-6 rounded-xl border border-slate-200/60 shadow-sm flex flex-col hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-blue-650 text-lg select-none">monitoring</span>
                      <h3 className="text-xs font-bold text-slate-850">ABC Inventory Contribution</h3>
                    </div>
                    <span 
                      onClick={() => navigate("/reports", { state: { tab: "abc" } })}
                      className="text-[10px] text-blue-600 font-bold cursor-pointer hover:underline flex items-center gap-0.5"
                    >
                      <span>View ABC</span>
                      <span className="material-symbols-outlined text-xs select-none">arrow_forward</span>
                    </span>
                  </div>

                  <div className="flex-grow space-y-4">
                    {/* Class A */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <span className="flex items-center gap-1.5 font-bold text-slate-800">
                          <span className="w-2.5 h-2.5 bg-rose-500 rounded"></span>
                          Class A (High Value)
                        </span>
                        <span className="text-slate-550 text-[10px] font-bold">
                          {stats?.aProductsCount || 0} items • ${stats?.aProductsRevenue?.toFixed(0) || "0"}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/40">
                        <div className="h-full bg-rose-500 rounded-full" style={{ width: "70%" }}></div>
                      </div>
                    </div>

                    {/* Class B */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <span className="flex items-center gap-1.5 font-bold text-slate-800">
                          <span className="w-2.5 h-2.5 bg-amber-500 rounded"></span>
                          Class B (Medium Value)
                        </span>
                        <span className="text-slate-550 text-[10px] font-bold">
                          {stats?.bProductsCount || 0} items • ${stats?.bProductsRevenue?.toFixed(0) || "0"}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/40">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: "20%" }}></div>
                      </div>
                    </div>

                    {/* Class C */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <span className="flex items-center gap-1.5 font-bold text-slate-800">
                          <span className="w-2.5 h-2.5 bg-blue-500 rounded"></span>
                          Class C (Low Value)
                        </span>
                        <span className="text-slate-550 text-[10px] font-bold">
                          {stats?.cProductsCount || 0} items • ${stats?.cProductsRevenue?.toFixed(0) || "0"}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/40">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: "10%" }}></div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {userRole === "ADMIN" && (
                <div className="bg-white p-6 rounded-xl border border-slate-200/60 shadow-sm flex flex-col hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-5">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-blue-650 text-lg select-none">history</span>
                      <h3 className="text-xs font-bold text-slate-850">Recent Security & System Activities</h3>
                    </div>
                    <button 
                      onClick={() => navigate("/audit-logs")}
                      className="text-xs text-blue-600 font-bold hover:text-blue-700 hover:underline underline-offset-4 flex items-center gap-1 cursor-pointer"
                    >
                      <span>View Audit Logs</span>
                      <span className="material-symbols-outlined text-xs select-none">arrow_forward</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {recentActivities.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-8 font-semibold">No recent activities available</p>
                    ) : (
                      recentActivities.map((act) => (
                        <div key={act.id} className="flex items-start gap-4 p-3.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100/80 transition-all duration-150">
                          <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold border shadow-sm ${
                            act.action === "DELETE" || act.status === "FAILED"
                              ? "bg-rose-50 border-rose-100/50 text-rose-600"
                              : act.action === "CREATE" || act.action === "LOGIN"
                              ? "bg-emerald-50 border-emerald-100/50 text-emerald-600"
                              : "bg-blue-50 border-blue-100/50 text-blue-600"
                          }`}>
                            <span className="material-symbols-outlined text-sm select-none">
                              {act.action === "LOGIN" ? "login" : act.action === "DELETE" ? "delete" : "build"}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <p className="text-xs font-bold text-slate-850 truncate leading-snug">{act.description}</p>
                              <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap ml-2">
                                {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1 font-semibold leading-none">
                              By <span className="font-bold text-slate-700">{act.userName}</span> ({act.userEmail}) • 
                              Action: <span className="font-mono text-[9px] bg-slate-100 text-slate-650 px-1.5 py-0.5 rounded ml-1">{act.action}</span>
                              {act.entityName && (
                                <> • Module: <span className="font-mono text-[9px] bg-slate-100 text-slate-650 px-1.5 py-0.5 rounded ml-1">{act.entityName}</span></>
                              )}
                              {act.status === "FAILED" && (
                                <span className="text-red-500 font-bold ml-1.5">(Failed)</span>
                              )}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;