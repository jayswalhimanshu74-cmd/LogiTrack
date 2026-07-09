import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const Sidebar = ({ activeTab }) => {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const email = localStorage.getItem("userEmail") || "admin@logitrack.com";
    setUserEmail(email);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userEmail");
    navigate("/login");
  };

  const getLinkClass = (tabName) => {
    const baseClass = "flex items-center gap-4 px-6 py-4 rounded-lg transition-colors";
    if (activeTab === tabName) {
      return `${baseClass} bg-blue-50 text-primary font-semibold`;
    }
    return `${baseClass} text-slate-600 hover:bg-slate-50`;
  };

  return (
    <aside className="hidden md:flex md:w-64 bg-white border-r border-slate-200 flex-col justify-between z-10 shrink-0">
      <div>
        {/* Logo */}
        <div className="p-6 flex items-center gap-2 border-b border-slate-100">
          <div className="w-8 h-8 bg-premium-gradient rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
              inventory_2
            </span>
          </div>
          <span className="text-xl text-primary font-bold">LogiTrack</span>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-2">
          <Link to="/dashboard" className={getLinkClass("dashboard")}>
            <span className="material-symbols-outlined">dashboard</span>
            <span>Dashboard</span>
          </Link>
          <Link to="/products" className={getLinkClass("products")}>
            <span className="material-symbols-outlined">box</span>
            <span>Products</span>
          </Link>
          <Link to="/sales-orders" className={getLinkClass("sales-orders")}>
            <span className="material-symbols-outlined">shopping_cart</span>
            <span>Sales Orders</span>
          </Link>
          <Link to="/invoices" className={getLinkClass("invoices")}>
            <span className="material-symbols-outlined">receipt_long</span>
            <span>Invoices</span>
          </Link>
          <Link to="/purchases" className={getLinkClass("purchases")}>
            <span className="material-symbols-outlined">local_shipping</span>
            <span>Purchases</span>
          </Link>
          <Link to="/reports" className={getLinkClass("reports")}>
            <span className="material-symbols-outlined">analytics</span>
            <span>Reports</span>
          </Link>
        </nav>
      </div>

      {/* User Info & Logout */}
      <div className="p-6 border-t border-slate-100">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold border border-slate-200 shrink-0">
            {userEmail ? userEmail[0].toUpperCase() : "U"}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm text-slate-800 font-semibold truncate">{userEmail.split('@')[0]}</p>
            <p className="text-xs text-slate-500 truncate">{userEmail}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-4 border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold rounded-lg transition-colors"
        >
          <span className="material-symbols-outlined text-base">logout</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
