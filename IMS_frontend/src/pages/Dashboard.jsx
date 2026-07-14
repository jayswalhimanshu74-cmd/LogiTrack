import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

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
      const response = await fetch("http://localhost:8080/api/dashboard/stats", {
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
      const response = await fetch("http://localhost:8080/api/audit?page=0&size=5&sortBy=timestamp&direction=desc", {
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
    const email = localStorage.getItem("userEmail") || "admin@logitrack.com";
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
      ]
    });
  };

  const loadMockActivities = () => {
    setRecentActivities([
      { id: 1, description: "Admin logged into the portal", action: "LOGIN", userName: "Admin User", userEmail: "admin@logitrack.com", timestamp: new Date().toISOString(), status: "SUCCESS" }
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
            <div className="flex flex-col items-center justify-center py-32 card-premium p-12 bg-white">
              <div className="w-9 h-9 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-xs text-slate-500 font-bold tracking-wide uppercase">Loading Workspace Overview...</p>
            </div>
          ) : (
            <>
              {errorMsg && (
                <div className="p-4 bg-amber-50/80 border border-amber-200/70 text-amber-900 rounded-xl flex items-center gap-3 shadow-sm">
                  <span className="material-symbols-outlined text-amber-600 text-lg">info</span>
                  <p className="text-xs font-semibold leading-relaxed">{errorMsg}</p>
                </div>
              )}

              {/* Metric Cards Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Sales Card */}
                <div className="card-premium p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Sales Revenue</p>
                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                      ${stats?.totalSalesRevenue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}
                    </h3>
                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-2">
                      <span className="material-symbols-outlined text-sm">trending_up</span>
                      +12.5% this month
                    </span>
                  </div>
                  <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100/50 shadow-sm shrink-0">
                    <span className="material-symbols-outlined text-xl">payments</span>
                  </div>
                </div>

                {/* Purchases Card */}
                <div className="card-premium p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Expenses</p>
                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                      ${stats?.totalPurchaseExpense?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}
                    </h3>
                    <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1 mt-2">
                      <span className="material-symbols-outlined text-sm">shopping_bag</span>
                      Stock Restock purchases
                    </span>
                  </div>
                  <div className="w-11 h-11 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center border border-amber-100/50 shadow-sm shrink-0">
                    <span className="material-symbols-outlined text-xl">local_mall</span>
                  </div>
                </div>

                {/* Total Products */}
                <div className="card-premium p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Catalog Products</p>
                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                      {stats?.totalProductCount || stats?.totalProductsCount || 0}
                    </h3>
                    <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1 mt-2">
                      Active items in warehouse
                    </span>
                  </div>
                  <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100/50 shadow-sm shrink-0">
                    <span className="material-symbols-outlined text-xl">inventory</span>
                  </div>
                </div>

                {/* Low Stock Alerts */}
                <div className={`card-premium p-6 flex items-center justify-between ${
                  stats?.lowStockAlertsCount > 0 ? "border-red-200 bg-red-50/10 shadow-red-50/10" : ""
                }`}>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Low Stock Alerts</p>
                    <h3 className={`text-2xl font-bold tracking-tight ${stats?.lowStockAlertsCount > 0 ? "text-red-600" : "text-slate-900"}`}>
                      {stats?.lowStockAlertsCount || 0}
                    </h3>
                    <span className={`text-[10px] font-bold flex items-center gap-1 mt-2 ${
                      stats?.lowStockAlertsCount > 0 ? "text-red-600" : "text-slate-500"
                    }`}>
                      {stats?.lowStockAlertsCount > 0 ? (
                        <>
                          <span className="material-symbols-outlined text-xs animate-bounce">warning</span>
                          Immediate restock required
                        </>
                      ) : (
                        "All products stock safe"
                      )}
                    </span>
                  </div>
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center border shadow-sm shrink-0 ${
                    stats?.lowStockAlertsCount > 0 ? "bg-red-50 text-red-600 border-red-100/50" : "bg-slate-50 text-slate-500 border-slate-100"
                  }`}>
                    <span className="material-symbols-outlined text-xl">error_outline</span>
                  </div>
                </div>
              </div>

              {/* Detailed Statistics Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Category breakdown */}
                <div className="bg-white p-6 rounded-xl border border-slate-200/70 shadow-sm lg:col-span-1 flex flex-col hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-5">
                    <h3 className="text-sm font-bold text-slate-800">Category Distribution</h3>
                    <span className="material-symbols-outlined text-slate-400 text-lg">pie_chart</span>
                  </div>
                  
                  <div className="flex-grow space-y-4">
                    {categoriesList.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-10 font-medium">No category breakdown available</p>
                    ) : (
                      categoriesList.map((category, idx) => (
                        <div key={idx} className="space-y-1.5">
                          <div className="flex justify-between items-center text-xs font-semibold">
                            <span className="text-slate-700">{category.category}</span>
                            <span className="text-slate-500">{category.totalStock} items</span>
                          </div>
                          {/* Progress Bar */}
                          <div className="w-full bg-slate-100 rounded-full h-1.5">
                            <div 
                              className={`h-1.5 rounded-full ${
                                idx % 4 === 0 ? "bg-blue-500" :
                                idx % 4 === 1 ? "bg-amber-500" :
                                idx % 4 === 2 ? "bg-emerald-500" : "bg-purple-500"
                              }`}
                              style={{ width: `${Math.min(100, (category.totalStock / 3000) * 100)}%` }}
                            ></div>
                          </div>
                          <div className="text-[10px] text-slate-400 font-medium">
                            {category.productCount} unique products catalogued
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Recent activity/transactions */}
                <div className="bg-white p-6 rounded-xl border border-slate-200/70 shadow-sm lg:col-span-2 flex flex-col hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-5">
                    <h3 className="text-sm font-bold text-slate-800">Recent Ledger Activity</h3>
                    <span 
                      onClick={() => navigate("/stock-movements")}
                      className="text-xs text-blue-600 font-bold cursor-pointer hover:underline underline-offset-4 flex items-center gap-1"
                    >
                      <span>View Ledger</span>
                      <span className="material-symbols-outlined text-xs">arrow_forward</span>
                    </span>
                  </div>

                  <div className="overflow-x-auto flex-grow">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200/75">
                          <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Transaction ID</th>
                          <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Type</th>
                          <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date</th>
                          <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Value</th>
                          <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {stats?.recentTransactions?.map((tx, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-4 font-mono text-xs font-semibold text-slate-600">{tx.id}</td>
                            <td className="py-4 text-xs font-semibold text-slate-800">
                              <span className="flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full ${
                                  tx.type === "Sale" ? "bg-emerald-500 shadow-sm shadow-emerald-400" : "bg-amber-500 shadow-sm shadow-amber-400"
                                }`}></span>
                                {tx.type}
                              </span>
                            </td>
                            <td className="py-4 text-xs text-slate-500">{tx.date}</td>
                            <td className="py-4 text-xs text-slate-800 text-right font-bold">
                              ${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="py-4 text-center">
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

              {userRole === "ADMIN" && (
                <div className="bg-white p-6 rounded-xl border border-slate-200/70 shadow-sm flex flex-col hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-5">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-blue-600 text-lg">history</span>
                      <h3 className="text-sm font-bold text-slate-800">Recent Security & System Activities</h3>
                    </div>
                    <button 
                      onClick={() => navigate("/audit-logs")}
                      className="text-xs text-blue-600 font-bold hover:underline underline-offset-4 flex items-center gap-1 cursor-pointer"
                    >
                      <span>View Audit Logs</span>
                      <span className="material-symbols-outlined text-xs">arrow_forward</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {recentActivities.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-8 font-medium">No recent activities available</p>
                    ) : (
                      recentActivities.map((act) => (
                        <div key={act.id} className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all duration-150">
                          <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold border shadow-sm ${
                            act.action === "DELETE" || act.status === "FAILED"
                              ? "bg-rose-50 border-rose-100/50 text-rose-600"
                              : act.action === "CREATE" || act.action === "LOGIN"
                              ? "bg-emerald-50 border-emerald-100/50 text-emerald-600"
                              : "bg-blue-50 border-blue-100/50 text-blue-600"
                          }`}>
                            <span className="material-symbols-outlined text-sm">
                              {act.action === "LOGIN" ? "login" : act.action === "DELETE" ? "delete" : "build"}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <p className="text-xs font-bold text-slate-800 truncate leading-snug">{act.description}</p>
                              <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap ml-2">
                                {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1 font-medium leading-none">
                              By <span className="font-bold text-slate-700">{act.userName}</span> ({act.userEmail}) • 
                              Action: <span className="font-mono text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded ml-1">{act.action}</span>
                              {act.entityName && (
                                <> • Module: <span className="font-mono text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded ml-1">{act.entityName}</span></>
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