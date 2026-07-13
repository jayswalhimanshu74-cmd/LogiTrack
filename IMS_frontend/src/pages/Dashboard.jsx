import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const email = localStorage.getItem("userEmail") || "admin@logitrack.com";
    setUserEmail(email);

    if (!token) {
      navigate("/login");
      return;
    }

    const fetchStats = async () => {
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
    };

    fetchStats();
  }, [navigate]);

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

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userEmail");
    navigate("/login");
  };

  if (isLoading && !stats) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-base text-on-surface-variant font-medium">Loading LogiTrack Workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Sidebar - Desktop */}
      <Sidebar activeTab="dashboard" />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 md:px-8 z-10 sticky top-0">
          <div className="flex items-center gap-4">
            {/* Mobile Sidebar Toggle */}
            <button className="md:hidden p-4 text-slate-600 hover:bg-slate-50 rounded-lg">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h2 className="text-xl text-slate-800 font-semibold hidden md:block">
              Inventory Workspace Overview
            </h2>
            <div className="md:hidden flex items-center gap-2">
              <div className="w-6 h-6 bg-premium-gradient rounded-md flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>
                  inventory_2
                </span>
              </div>
              <span className="font-bold text-slate-800">LogiTrack</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {errorMsg ? (
              <span className="bg-amber-50 text-amber-800 border border-amber-200 px-4 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                Demo Mode
              </span>
            ) : (
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-4 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                Connected
              </span>
            )}

            <button className="p-4 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors relative">
              <span className="material-symbols-outlined">notifications</span>
              {stats?.lowStockAlertCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white"></span>
              )}
            </button>
            <div className="w-px h-6 bg-slate-200"></div>
            <button className="md:hidden p-4 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors" onClick={handleLogout}>
              <span className="material-symbols-outlined">logout</span>
            </button>
          </div>
        </header>

        {/* Dashboard Grid */}
        <main className="flex-1 p-6 md:p-8 space-y-8 max-w-[1600px] w-full mx-auto">
          {errorMsg && (
            <div className="p-6 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl flex items-center gap-4">
              <span className="material-symbols-outlined text-amber-600">info</span>
              <p className="text-sm">{errorMsg}</p>
            </div>
          )}

          {/* Metric Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Sales Card */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Sales Revenue</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">
                  ${stats?.totalSalesRevenue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}
                </h3>
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-2">
                  <span className="material-symbols-outlined text-xs">trending_up</span>
                  +12.5% this month
                </span>
              </div>
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">payments</span>
              </div>
            </div>

            {/* Purchases Card */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Expenses</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">
                  ${stats?.totalPurchaseExpense?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}
                </h3>
                <span className="text-xs text-slate-500 font-semibold flex items-center gap-1 mt-2">
                  <span className="material-symbols-outlined text-xs">shopping_bag</span>
                  Stock Restock purchases
                </span>
              </div>
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">local_mall</span>
              </div>
            </div>

            {/* Total Products */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Catalog Products</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">
                  {stats?.totalProductsCount || 0}
                </h3>
                <span className="text-xs text-slate-500 font-semibold flex items-center gap-1 mt-2">
                  Active items in warehouse
                </span>
              </div>
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">inventory</span>
              </div>
            </div>

            {/* Low Stock Alerts */}
            <div className={`bg-white p-6 rounded-xl border shadow-sm flex items-center justify-between ${
              stats?.lowStockAlertCount > 0 ? "border-red-200 bg-red-50/10" : "border-slate-200"
            }`}>
              <div>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Low Stock Alerts</p>
                <h3 className={`text-2xl font-bold mt-1 ${stats?.lowStockAlertCount > 0 ? "text-red-600" : "text-slate-900"}`}>
                  {stats?.lowStockAlertCount || 0}
                </h3>
                <span className={`text-xs font-semibold flex items-center gap-1 mt-2 ${
                  stats?.lowStockAlertCount > 0 ? "text-red-600" : "text-slate-500"
                }`}>
                  {stats?.lowStockAlertCount > 0 ? (
                    <>
                      <span className="material-symbols-outlined text-xs animate-bounce">warning</span>
                      Immediate restock required
                    </>
                  ) : (
                    "All products stock safe"
                  )}
                </span>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                stats?.lowStockAlertCount > 0 ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-600"
              }`}>
                <span className="material-symbols-outlined text-2xl">error_outline</span>
              </div>
            </div>
          </div>

          {/* Detailed Statistics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Category breakdown */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-1 flex flex-col">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <h3 className="text-xl font-bold text-slate-800">Category Distribution</h3>
                <span className="material-symbols-outlined text-slate-400">pie_chart</span>
              </div>
              
              <div className="flex-grow space-y-6">
                {stats?.categoryStockBreakdown?.map((category, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between items-center text-sm font-medium">
                      <span className="text-slate-700">{category.category}</span>
                      <span className="text-slate-500 font-semibold">{category.totalStock} items</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          idx % 4 === 0 ? "bg-blue-600" :
                          idx % 4 === 1 ? "bg-amber-500" :
                          idx % 4 === 2 ? "bg-emerald-500" : "bg-purple-500"
                        }`}
                        style={{ width: `${Math.min(100, (category.totalStock / 3000) * 100)}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-slate-400">
                      {category.productCount} unique products catalogued
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent activity/transactions */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2 flex flex-col">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <h3 className="text-xl font-bold text-slate-800">Recent Ledger Activity</h3>
                <span className="text-xs text-primary font-semibold cursor-pointer hover:underline">View All Ledger</span>
              </div>

              <div className="overflow-x-auto flex-grow">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="pb-4 text-sm text-slate-400 font-semibold">Transaction ID</th>
                      <th className="pb-4 text-sm text-slate-400 font-semibold">Type</th>
                      <th className="pb-4 text-sm text-slate-400 font-semibold">Date</th>
                      <th className="pb-4 text-sm text-slate-400 font-semibold text-right">Value</th>
                      <th className="pb-4 text-sm text-slate-400 font-semibold text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stats?.recentTransactions?.map((tx, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-6 font-mono text-sm font-medium text-slate-700">{tx.id}</td>
                        <td className="py-6 text-sm font-semibold text-slate-800">
                          <span className="flex items-center gap-1">
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              tx.type === "Sale" ? "bg-emerald-500" : "bg-amber-500"
                            }`}></span>
                            {tx.type}
                          </span>
                        </td>
                        <td className="py-6 text-sm text-slate-500">{tx.date}</td>
                        <td className="py-6 text-sm text-slate-800 text-right font-bold">
                          ${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-6 text-center">
                          <span className={`inline-block px-4 py-0.5 rounded-full text-xs font-semibold ${
                            tx.status === "PAID" || tx.status === "COMPLETED"
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-100"
                              : "bg-amber-50 text-amber-800 border border-amber-100"
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
        </main>
      </div>
    </div>
  );
};

export default Dashboard;