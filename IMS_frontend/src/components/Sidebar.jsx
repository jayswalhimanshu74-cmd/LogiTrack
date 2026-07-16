import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

/**
 * Sidebar navigation with role-based visibility.
 *
 * ADMIN   → all items
 * MANAGER → Dashboard, Products, Sales, Purchases, Invoices, Stock Ledger,
 *           Reports, Notifications, Profile
 * STAFF   → Dashboard, Products (view), Sales (view), Invoices (view),
 *           Notifications, Profile
 */
const Sidebar = ({ activeTab }) => {
  const navigate = useNavigate();
  const { email, role, isAdmin, isAdminOrManager } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem("sidebarCollapsed") === "true";
  });

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
    const base = "flex items-center rounded-lg text-sm font-medium transition-all duration-200 border border-transparent select-none";
    const active =
      activeTab === tabName
        ? "bg-blue-50/80 text-blue-600 shadow-[0_1px_2px_rgba(37,99,235,0.05)] border-blue-100/50"
        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50/80";
    return isCollapsed
      ? `${base} ${active} justify-center p-2.5 mx-auto w-10 h-10`
      : `${base} ${active} gap-3 px-3.5 py-2.5`;
  };

  const NavLink = ({ to, tab, icon, label }) => (
    <Link to={to} className={getLinkClass(tab)} title={isCollapsed ? label : undefined}>
      <span className="material-symbols-outlined text-xl select-none">{icon}</span>
      {!isCollapsed && <span>{label}</span>}
    </Link>
  );

  const roleBadgeColor =
    role === "ADMIN"
      ? "text-violet-600 bg-violet-50"
      : role === "MANAGER"
      ? "text-blue-600 bg-blue-50"
      : "text-emerald-600 bg-emerald-50";

  return (
    <aside
      className={`hidden md:flex flex-col justify-between z-10 shrink-0 h-screen sticky top-0 print:hidden bg-white border-r border-slate-200/80 transition-all duration-300 relative ${
        isCollapsed ? "w-20" : "w-64"
      } shadow-[1px_0_0_0_rgba(241,245,249,0.5)]`}
    >
      {/* Collapse Toggle */}
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
        {/* Logo */}
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

        {/* Navigation */}
        <nav className="p-3 space-y-1.5">
          {/* ── ALL ROLES ─────────────────────────────── */}
          <NavLink to="/dashboard"    tab="dashboard"    icon="dashboard"        label="Dashboard" />
          <NavLink to="/products"     tab="products"     icon="box"              label="Products" />
          <NavLink to="/sales-orders" tab="sales-orders" icon="shopping_cart"    label="Sales Orders" />
          <NavLink to="/invoices"     tab="invoices"     icon="receipt_long"     label="Invoices" />

          {/* ── ADMIN + MANAGER ───────────────────────── */}
          {isAdminOrManager && (
            <>
              <NavLink to="/purchases"      tab="purchases"      icon="local_shipping" label="Purchases" />
              <NavLink to="/stock-movements" tab="stock-movements" icon="swap_horiz"    label="Stock Ledger" />
              <NavLink to="/reports"        tab="reports"        icon="analytics"      label="Reports" />
            </>
          )}

          {/* ── ALL ROLES ─────────────────────────────── */}
          <NavLink to="/notifications" tab="notifications" icon="notifications" label="Notifications" />
          <NavLink to="/profile"       tab="profile"       icon="person"         label="My Profile" />

          {/* ── ADMIN ONLY ────────────────────────────── */}
          {isAdmin && (
            <NavLink to="/audit-logs" tab="audit-logs" icon="history" label="Audit Logs" />
          )}
        </nav>
      </div>

      {/* User info + logout */}
      <div className={`p-3 border-t border-slate-100 bg-slate-50/50 ${isCollapsed ? "flex flex-col items-center gap-3" : ""}`}>
        {/* Role badge (expanded only) */}
        {!isCollapsed && (
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 w-fit ${roleBadgeColor}`}>
            <span className="material-symbols-outlined text-[11px] select-none" style={{ fontVariationSettings: "'FILL' 1" }}>
              shield
            </span>
            {role}
          </div>
        )}

        <Link
          to="/profile"
          className={`flex items-center gap-3 hover:bg-white hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-transparent hover:border-slate-100 p-2 rounded-xl transition-all duration-200 cursor-pointer ${
            isCollapsed ? "justify-center w-11 h-11" : "w-full"
          }`}
          title={isCollapsed ? `Profile: ${email}` : undefined}
        >
          <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold border border-blue-200/50 shadow-sm shrink-0 text-xs">
            {email ? email[0].toUpperCase() : "U"}
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden min-w-0">
              <p className="text-xs text-slate-800 font-bold truncate leading-snug">{email.split("@")[0]}</p>
              <p className="text-[10px] text-slate-400 font-semibold truncate leading-none mt-0.5">{email}</p>
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
