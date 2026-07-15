import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const Sidebar = ({ activeTab }) => {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem("sidebarCollapsed") === "true";
  });

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

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebarCollapsed", String(next));
      return next;
    });
  };

  const getLinkClass = (tabName) => {
    const baseClass = "flex items-center rounded-lg text-sm font-medium transition-all duration-200 border border-transparent select-none";
    const activeClass = activeTab === tabName
      ? "bg-blue-50/80 text-blue-600 shadow-[0_1px_2px_rgba(37,99,235,0.05)] border-blue-100/50"
      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50/80";

    if (isCollapsed) {
      return `${baseClass} ${activeClass} justify-center p-2.5 mx-auto w-10 h-10`;
    }
    return `${baseClass} ${activeClass} gap-3 px-3.5 py-2.5`;
  };

  return (
    <aside 
      className={`hidden md:flex flex-col justify-between z-10 shrink-0 h-screen sticky top-0 print:hidden bg-white border-r border-slate-200/80 transition-all duration-300 relative ${
        isCollapsed ? "w-20" : "w-64"
      } shadow-[1px_0_0_0_rgba(241,245,249,0.5)]`}
    >
      {/* Collapse Toggle Button */}
      <button 
        onClick={toggleCollapse}
        className="absolute -right-3 top-7 bg-white border border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300 w-6 h-6 rounded-full flex items-center justify-center shadow-[0_2px_4px_rgba(0,0,0,0.04)] cursor-pointer hover:scale-105 active:scale-95 transition-all z-20"
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        <span className="material-symbols-outlined text-[14px] font-bold leading-none select-none">
          {isCollapsed ? "chevron_right" : "chevron_left"}
        </span>
      </button>

      <div>
        {/* Logo Branding */}
        <div className={`p-5 flex items-center border-b border-slate-100 ${isCollapsed ? "justify-center" : "gap-3"}`}>
          <div className="w-9 h-9 bg-premium-gradient rounded-xl flex items-center justify-center shadow-[0_4px_12px_rgba(37,99,235,0.15)] transform transition-transform duration-300 hover:rotate-6 shrink-0">
            <span className="material-symbols-outlined text-white text-lg select-none" style={{ fontVariationSettings: "'FILL' 1" }}>
              inventory_2
            </span>
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-base text-slate-900 font-bold tracking-tight leading-none">LogiTrack</span>
              <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-0.5">Enterprise</span>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1.5">
          <Link to="/dashboard" className={getLinkClass("dashboard")} title={isCollapsed ? "Dashboard" : undefined}>
            <span className="material-symbols-outlined text-xl select-none">dashboard</span>
            {!isCollapsed && <span>Dashboard</span>}
          </Link>
          <Link to="/products" className={getLinkClass("products")} title={isCollapsed ? "Products" : undefined}>
            <span className="material-symbols-outlined text-xl select-none">box</span>
            {!isCollapsed && <span>Products</span>}
          </Link>
          <Link to="/sales-orders" className={getLinkClass("sales-orders")} title={isCollapsed ? "Sales Orders" : undefined}>
            <span className="material-symbols-outlined text-xl select-none">shopping_cart</span>
            {!isCollapsed && <span>Sales Orders</span>}
          </Link>
          <Link to="/invoices" className={getLinkClass("invoices")} title={isCollapsed ? "Invoices" : undefined}>
            <span className="material-symbols-outlined text-xl select-none">receipt_long</span>
            {!isCollapsed && <span>Invoices</span>}
          </Link>
          <Link to="/purchases" className={getLinkClass("purchases")} title={isCollapsed ? "Purchases" : undefined}>
            <span className="material-symbols-outlined text-xl select-none">local_shipping</span>
            {!isCollapsed && <span>Purchases</span>}
          </Link>
          <Link to="/stock-movements" className={getLinkClass("stock-movements")} title={isCollapsed ? "Stock Ledger" : undefined}>
            <span className="material-symbols-outlined text-xl select-none">swap_horiz</span>
            {!isCollapsed && <span>Stock Ledger</span>}
          </Link>
          <Link to="/reports" className={getLinkClass("reports")} title={isCollapsed ? "Reports" : undefined}>
            <span className="material-symbols-outlined text-xl select-none">analytics</span>
            {!isCollapsed && <span>Reports</span>}
          </Link>
          <Link to="/notifications" className={getLinkClass("notifications")} title={isCollapsed ? "Notifications" : undefined}>
            <span className="material-symbols-outlined text-xl select-none">notifications</span>
            {!isCollapsed && <span>Notifications</span>}
          </Link>
          <Link to="/profile" className={getLinkClass("profile")} title={isCollapsed ? "My Profile" : undefined}>
            <span className="material-symbols-outlined text-xl select-none">person</span>
            {!isCollapsed && <span>My Profile</span>}
          </Link>
          {userRole === "ADMIN" && (
            <Link to="/audit-logs" className={getLinkClass("audit-logs")} title={isCollapsed ? "Audit Logs" : undefined}>
              <span className="material-symbols-outlined text-xl select-none">history</span>
              {!isCollapsed && <span>Audit Logs</span>}
            </Link>
          )}
        </nav>
      </div>

      {/* User Info Profile Area & Logout Button */}
      <div className={`p-3 border-t border-slate-100 bg-slate-50/50 ${isCollapsed ? "flex flex-col items-center gap-3" : ""}`}>
        <Link 
          to="/profile" 
          className={`flex items-center gap-3 hover:bg-white hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-transparent hover:border-slate-100 p-2 rounded-xl transition-all duration-200 cursor-pointer ${
            isCollapsed ? "justify-center w-11 h-11" : "w-full"
          }`}
          title={isCollapsed ? `Profile: ${userEmail}` : undefined}
        >
          <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold border border-blue-200/50 shadow-sm shrink-0 text-xs">
            {userEmail ? userEmail[0].toUpperCase() : "U"}
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden min-w-0">
              <p className="text-xs text-slate-800 font-bold truncate leading-snug">{userEmail.split('@')[0]}</p>
              <p className="text-[10px] text-slate-400 font-semibold truncate leading-none mt-0.5">{userEmail}</p>
            </div>
          )}
        </Link>
        
        {isCollapsed ? (
          <button 
            onClick={handleLogout}
            className="w-10 h-10 flex items-center justify-center border border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-100 hover:bg-red-50 rounded-lg shadow-sm hover:shadow active:scale-95 transition-all duration-200 cursor-pointer"
            title="Logout Session"
          >
            <span className="material-symbols-outlined text-base select-none">logout</span>
          </button>
        ) : (
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 border border-slate-200 text-slate-700 hover:bg-white hover:text-red-600 hover:border-red-100 hover:bg-red-50/20 text-xs font-bold rounded-lg shadow-sm hover:shadow active:scale-[0.98] transition-all duration-200 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm select-none">logout</span>
            <span>Logout Session</span>
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
