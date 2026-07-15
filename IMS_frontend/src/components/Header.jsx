import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Bell, LogOut, CheckCircle, AlertTriangle, Info, Check, Trash2, Calendar, RefreshCw } from "lucide-react";

const Header = ({ workspaceName = "Overview", title = "Inventory Workspace Overview", onRefresh = null, children }) => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [connectionStatus, setConnectionStatus] = useState("connected");
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const email = localStorage.getItem("userEmail") || "admin@logitrack.com";
    setUserEmail(email);

    const token = localStorage.getItem("authToken");
    if (!token) {
      setConnectionStatus("demo");
      loadMockNotifications();
      return;
    }

    // Initial fetch
    fetchUnreadCount();
    fetchNotifications();

    // Set polling interval (30-second interval)
    const interval = setInterval(() => {
      fetchUnreadCount();
      if (isOpen) fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [isOpen]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchUnreadCount = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    try {
      const res = await fetch("http://localhost:8080/api/notifications/unread-count", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const count = await res.json();
        setUnreadCount(count);
        setConnectionStatus("connected");
      }
    } catch (err) {
      console.warn("Unread count fetch failed:", err);
      setConnectionStatus("demo");
    }
  };

  const fetchNotifications = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    try {
      const res = await fetch("http://localhost:8080/api/notifications?page=0&size=5", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.content || []);
      }
    } catch (err) {
      console.warn("Notifications fetch failed:", err);
    }
  };

  const loadMockNotifications = () => {
    setNotifications([
      { id: 101, title: "Low Stock: Logitech Mouse", message: "Logitech MX Master 3S has fallen below reorder level (3 left).", type: "LOW_STOCK", severity: "WARNING", isRead: false, createdAt: new Date().toISOString() },
      { id: 102, title: "Sale Completed: SO-49291", message: "Sale order SO-49291 has been completed for Acme Corp.", type: "SALE_COMPLETED", severity: "SUCCESS", isRead: false, createdAt: new Date().toISOString() },
      { id: 103, title: "Invoice Generated: INV-2026-0004", message: "Invoice INV-2026-0004 generated from SO-49291.", type: "INVOICE_GENERATED", severity: "INFO", isRead: true, createdAt: new Date().toISOString() }
    ]);
    setUnreadCount(2);
  };

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    const token = localStorage.getItem("authToken");
    if (!token) {
      // Demo mode fallback
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
      return;
    }
    try {
      const res = await fetch(`http://localhost:8080/api/notifications/${id}/read`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        fetchUnreadCount();
        fetchNotifications();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = (n) => {
    setIsOpen(false); // Close dropdown
    
    // Mark as read if not already read
    if (!n.isRead) {
      const token = localStorage.getItem("authToken");
      if (token) {
        fetch(`http://localhost:8080/api/notifications/${n.id}/read`, {
          method: "PUT",
          headers: { "Authorization": `Bearer ${token}` }
        }).then(() => {
          fetchUnreadCount();
        }).catch(err => console.error(err));
      } else {
        setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, isRead: true } : item));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    }

    // Dynamic routing based on referenceType and referenceId
    if (n.referenceId) {
      const type = n.referenceType || "";
      if (type === "PRODUCT") {
        navigate(`/products?id=${n.referenceId}`);
      } else if (type === "INVOICE") {
        navigate(`/invoices?id=${n.referenceId}`);
      } else if (type === "SALE") {
        navigate(`/sales?id=${n.referenceId}`);
      } else if (type === "PURCHASE") {
        navigate(`/purchases?id=${n.referenceId}`);
      }
    }
  };

  const handleMarkAllRead = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      return;
    }
    try {
      const res = await fetch("http://localhost:8080/api/notifications/read-all", {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        fetchUnreadCount();
        fetchNotifications();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userFullName");
    navigate("/login");
  };

  const triggerRefresh = async () => {
    if (!onRefresh) return;
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const getNotificationIcon = (severity) => {
    switch (severity) {
      case "ERROR":
        return <AlertTriangle className="text-red-500 w-4 h-4 shrink-0" />;
      case "WARNING":
        return <AlertTriangle className="text-amber-500 w-4 h-4 shrink-0" />;
      case "SUCCESS":
        return <CheckCircle className="text-emerald-500 w-4 h-4 shrink-0" />;
      default:
        return <Info className="text-blue-500 w-4 h-4 shrink-0" />;
    }
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 h-16 flex items-center justify-between px-6 md:px-8 z-20 sticky top-0 shadow-[0_1px_3px_rgba(0,0,0,0.01)] transition-all">
      <div className="flex items-center gap-4">
        {/* Mobile Hamburger toggle */}
        <button className="md:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">
          <span className="material-symbols-outlined text-xl select-none">menu</span>
        </button>
        <div className="flex flex-col hidden md:block">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Workspace</span>
            <span className="material-symbols-outlined text-[10px] leading-none select-none">chevron_right</span>
            <span className="text-slate-500">{workspaceName}</span>
          </div>
          <h2 className="text-xs font-bold text-slate-800 tracking-tight mt-0.5">{title}</h2>
        </div>
      </div>

      <div className="flex items-center gap-3.5">
        {connectionStatus === "connected" ? (
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase flex items-center gap-1.5 shadow-[0_1px_2px_rgba(16,185,129,0.03)]">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            Connected
          </span>
        ) : (
          <span className="bg-amber-50 text-amber-700 border border-amber-100 px-3 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase flex items-center gap-1.5 shadow-[0_1px_2px_rgba(245,158,11,0.03)]">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
            Demo Mode
          </span>
        )}

        {onRefresh && (
          <button 
            onClick={triggerRefresh} 
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-slate-200/80 rounded-lg transition-all cursor-pointer shadow-sm active:scale-95 flex items-center justify-center"
            title="Refresh Page Data"
          >
            <RefreshCw size={14} className={`${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        )}

        {/* Custom Actions Slot */}
        {children}

        {/* Notifications Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className={`p-2 hover:bg-slate-50 border rounded-lg transition-all relative cursor-pointer shadow-sm flex items-center justify-center active:scale-95 ${
              isOpen ? 'bg-slate-50 text-slate-800 border-slate-300' : 'text-slate-500 border-slate-250'
            }`}
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ring-2 ring-white shadow-sm min-w-[18px] text-center select-none">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2.5 w-80 bg-white border border-slate-200/80 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] z-50 animate-fade-in overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <span className="text-xs font-bold text-slate-800">Notifications</span>
                {unreadCount > 0 && (
                  <button 
                    onClick={handleMarkAllRead}
                    className="text-[10px] text-blue-600 hover:text-blue-700 font-bold tracking-tight hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3 h-3" /> Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-[300px] overflow-y-auto divide-y divide-slate-150">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">
                    <Bell className="w-7 h-7 mx-auto mb-2 text-slate-300 opacity-60" />
                    <p className="text-xs font-semibold text-slate-600">No notifications</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">We'll alert you when stock status changes.</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n.id} 
                      onClick={() => handleNotificationClick(n)}
                      className={`p-3.5 transition-colors hover:bg-slate-50/80 flex items-start gap-3 relative group cursor-pointer ${!n.isRead ? 'bg-blue-50/20' : ''}`}
                    >
                      {getNotificationIcon(n.severity)}
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="flex items-center justify-between">
                          <p className={`text-xs truncate ${!n.isRead ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                            {n.title}
                          </p>
                          {!n.isRead && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleMarkAsRead(n.id, e); }}
                              className="w-4.5 h-4.5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors cursor-pointer"
                              title="Mark read"
                            >
                              <Check className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 leading-snug break-words">
                          {n.message}
                        </p>
                        <p className="text-[9px] text-slate-400 font-semibold flex items-center gap-1 mt-1">
                          <Calendar className="w-2.5 h-2.5" />
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <Link 
                to="/notifications" 
                onClick={() => setIsOpen(false)}
                className="block p-3 text-center text-xs font-bold text-slate-600 hover:text-blue-600 bg-slate-50 hover:bg-slate-100/80 border-t border-slate-100 transition-colors"
              >
                View all notifications
              </Link>
            </div>
          )}
        </div>

        <div className="w-px h-4 bg-slate-200"></div>

        <button 
          onClick={handleLogout}
          className="px-3 py-1.5 text-slate-600 hover:text-red-650 hover:bg-red-50/60 border border-slate-200 hover:border-red-100 rounded-lg transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
          title="Logout Session"
        >
          <LogOut size={12} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
