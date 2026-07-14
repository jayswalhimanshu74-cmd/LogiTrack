import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const Sidebar = ({ activeTab }) => {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const email = localStorage.getItem("userEmail") || "admin@logitrack.com";
    const role = localStorage.getItem("userRole") || "STAFF";
    setUserEmail(email);
    setUserRole(role);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userFullName");
    navigate("/login");
  };

  const getLinkClass = (tabName) => {
    const baseClass = "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200";
    if (activeTab === tabName) {
      return `${baseClass} bg-blue-50/80 text-blue-600 shadow-sm border border-blue-100/50`;
    }
    return `${baseClass} text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent`;
  };

  return (
    <aside className="hidden md:flex md:w-64 bg-white border-r border-slate-200/80 flex-col justify-between z-10 shrink-0 h-screen sticky top-0 print:hidden shadow-[1px_0_0_0_rgba(241,245,249,0.5)]">
      <div>
        {/* Logo Branding */}
        <div className="p-6 flex items-center gap-2.5 border-b border-slate-100">
          <div className="w-9 h-9 bg-premium-gradient rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20 transform transition-transform duration-300 hover:rotate-6">
            <span className="material-symbols-outlined text-white text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
              inventory_2
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-base text-slate-900 font-bold tracking-tight leading-none">LogiTrack</span>
            <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-0.5">Enterprise</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1">
          <Link to="/dashboard" className={getLinkClass("dashboard")}>
            <span className="material-symbols-outlined text-xl">dashboard</span>
            <span>Dashboard</span>
          </Link>
          <Link to="/products" className={getLinkClass("products")}>
            <span className="material-symbols-outlined text-xl">box</span>
            <span>Products</span>
          </Link>
          <Link to="/sales-orders" className={getLinkClass("sales-orders")}>
            <span className="material-symbols-outlined text-xl">shopping_cart</span>
            <span>Sales Orders</span>
          </Link>
          <Link to="/invoices" className={getLinkClass("invoices")}>
            <span className="material-symbols-outlined text-xl">receipt_long</span>
            <span>Invoices</span>
          </Link>
          <Link to="/purchases" className={getLinkClass("purchases")}>
            <span className="material-symbols-outlined text-xl">local_shipping</span>
            <span>Purchases</span>
          </Link>
          <Link to="/stock-movements" className={getLinkClass("stock-movements")}>
            <span className="material-symbols-outlined text-xl">swap_horiz</span>
            <span>Stock Ledger</span>
          </Link>
          <Link to="/reports" className={getLinkClass("reports")}>
            <span className="material-symbols-outlined text-xl">analytics</span>
            <span>Reports</span>
          </Link>
          <Link to="/notifications" className={getLinkClass("notifications")}>
            <span className="material-symbols-outlined text-xl">notifications</span>
            <span>Notifications</span>
          </Link>
          <Link to="/profile" className={getLinkClass("profile")}>
            <span className="material-symbols-outlined text-xl">person</span>
            <span>My Profile</span>
          </Link>
          {userRole === "ADMIN" && (
            <Link to="/audit-logs" className={getLinkClass("audit-logs")}>
              <span className="material-symbols-outlined text-xl">history</span>
              <span>Audit Logs</span>
            </Link>
          )}
        </nav>
      </div>

      {/* User Info Profile Area & Logout Button */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <Link to="/profile" className="flex items-center gap-3 mb-4 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-150 p-2.5 rounded-xl transition-all duration-200 cursor-pointer block">
          <div className="w-9 h-9 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold border border-blue-200 shadow-sm shrink-0 text-sm">
            {userEmail ? userEmail[0].toUpperCase() : "U"}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs text-slate-800 font-bold truncate leading-snug">{userEmail.split('@')[0]}</p>
            <p className="text-[10px] text-slate-400 font-semibold truncate leading-none mt-0.5">{userEmail}</p>
          </div>
        </Link>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2.5 border border-slate-200 text-slate-700 hover:bg-white hover:text-slate-900 text-xs font-bold rounded-lg shadow-sm hover:shadow active:scale-[0.98] transition-all duration-200"
        >
          <span className="material-symbols-outlined text-sm">logout</span>
          <span>Logout Session</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
