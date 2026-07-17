import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { Bell, Trash2, CheckCircle2, AlertTriangle, Info, AlertOctagon, Check, Calendar, ArrowRight, ArrowLeft } from "lucide-react";
import { getApiUrl } from "../api/config";

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  
  // Filters
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL, UNREAD, READ
  const [severityFilter, setSeverityFilter] = useState("ALL"); // ALL, INFO, WARNING, ERROR

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg("");
    const token = localStorage.getItem("authToken");

    if (!token) {
      loadMockNotifications();
      setIsLoading(false);
      return;
    }

    try {
      let url = `${getApiUrl()}/notifications?page=${currentPage}&size=10&sort=createdAt,desc`;
      if (statusFilter !== "ALL") {
        url += `&isRead=${statusFilter === "READ"}`;
      }
      if (severityFilter !== "ALL") {
        url += `&severity=${severityFilter}`;
      }

      const res = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (res.ok) {
        const data = await res.json();
        setNotifications(data.content || []);
        setTotalPages(data.totalPages || 1);
      } else {
        setErrorMsg("Failed to retrieve notifications. Showing demo notifications.");
        loadMockNotifications();
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Backend server offline. Displaying demo notifications.");
      loadMockNotifications();
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, statusFilter, severityFilter]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const loadMockNotifications = () => {
    let mock = [
      { id: 1, title: "Out of Stock: Mesh Chair", message: "Product 'Ergonomic Mesh Chair' is completely out of stock in warehouse A.", type: "OUT_OF_STOCK", severity: "ERROR", isRead: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
      { id: 2, title: "Low Stock: Router RT-AX86U", message: "ASUS Router RT-AX86U has fell below reorder level. Available: 3.", type: "LOW_STOCK", severity: "WARNING", isRead: false, createdAt: new Date(Date.now() - 7200000).toISOString() },
      { id: 3, title: "Sale Completed: SO-0021", message: "Sales Order SO-0021 for client Jane Doe completed successfully.", type: "SALE_COMPLETED", severity: "SUCCESS", isRead: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
      { id: 4, title: "Invoice Paid: INV-2026-0002", message: "Invoice INV-2026-0002 has been marked as PAID via CREDIT_CARD.", type: "INVOICE_PAID", severity: "SUCCESS", isRead: true, createdAt: new Date(Date.now() - 172800000).toISOString() },
      { id: 5, title: "New User Registered: John Doe", message: "User John Doe registered under the role STAFF.", type: "NEW_USER", severity: "INFO", isRead: true, createdAt: new Date(Date.now() - 259200000).toISOString() }
    ];

    if (statusFilter !== "ALL") {
      mock = mock.filter(n => statusFilter === "READ" ? n.isRead : !n.isRead);
    }
    if (severityFilter !== "ALL") {
      mock = mock.filter(n => n.severity === severityFilter);
    }

    setNotifications(mock);
    setTotalPages(1);
  };

  const handleMarkRead = async (id) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      return;
    }
    try {
      const res = await fetch(`${getApiUrl()}/notifications/${id}/read`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        fetchNotifications();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = (n) => {
    if (!n.isRead) {
      handleMarkRead(n.id);
    }
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

  const handleDelete = async (id) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setNotifications(prev => prev.filter(n => n.id !== id));
      return;
    }
    try {
      const res = await fetch(`${getApiUrl()}/notifications/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        fetchNotifications();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      return;
    }
    try {
      const res = await fetch(`${getApiUrl()}/notifications/read-all`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        fetchNotifications();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getNotificationIcon = (severity) => {
    switch (severity) {
      case "ERROR":
        return <AlertOctagon className="text-red-500 w-5 h-5 shrink-0" />;
      case "WARNING":
        return <AlertTriangle className="text-amber-500 w-5 h-5 shrink-0" />;
      case "SUCCESS":
        return <CheckCircle2 className="text-emerald-500 w-5 h-5 shrink-0" />;
      default:
        return <Info className="text-blue-500 w-5 h-5 shrink-0" />;
    }
  };

  const getSeverityBadgeClass = (severity) => {
    switch (severity) {
      case "ERROR":
        return "bg-red-50 text-red-700 border-red-150";
      case "WARNING":
        return "bg-amber-50 text-amber-700 border-amber-150";
      case "SUCCESS":
        return "bg-emerald-50 text-emerald-700 border-emerald-150";
      default:
        return "bg-blue-50 text-blue-700 border-blue-150";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans antialiased text-slate-900">
      <Sidebar activeTab="notifications" />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header 
          workspaceName="System Alerts" 
          title="Notification Center" 
          onRefresh={fetchNotifications} 
        />

        <main className="flex-1 p-6 md:p-8 space-y-6 max-w-[1400px] w-full mx-auto">
          {errorMsg && (
            <div className="p-4 bg-amber-50/80 border border-amber-200/70 text-amber-900 rounded-xl flex items-center gap-3 shadow-sm">
              <span className="material-symbols-outlined text-amber-600 text-lg">info</span>
              <p className="text-xs font-semibold leading-relaxed">{errorMsg}</p>
            </div>
          )}

          {/* Controls Panel */}
          <div className="bg-white p-6 rounded-xl border border-slate-200/70 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              
              {/* Filter Tabs */}
              <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100/80 rounded-lg w-full sm:w-auto">
                {["ALL", "UNREAD", "READ"].map((status) => (
                  <button
                    key={status}
                    onClick={() => { setStatusFilter(status); setCurrentPage(0); }}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                      statusFilter === status
                        ? "bg-white text-slate-900 shadow-sm border border-slate-200/50"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {status.charAt(0) + status.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>

              {/* Severity Dropdown and Actions */}
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <select
                  value={severityFilter}
                  onChange={(e) => { setSeverityFilter(e.target.value); setCurrentPage(0); }}
                  className="px-3.5 py-1.5 text-xs bg-white border border-slate-200 hover:border-slate-300 rounded-lg outline-none cursor-pointer font-semibold text-slate-600"
                >
                  <option value="ALL">All Severities</option>
                  <option value="INFO">Info</option>
                  <option value="WARNING">Warning</option>
                  <option value="ERROR">Error</option>
                  <option value="SUCCESS">Success</option>
                </select>

                <button
                  onClick={handleMarkAllRead}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-lg transition-all text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Check size={14} />
                  Mark All Read
                </button>
              </div>
            </div>
          </div>

          {/* Notifications List Container */}
          <div className="card-premium overflow-hidden">
            {isLoading ? (
              <div className="p-12 text-center flex flex-col items-center justify-center">
                <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">Retrieving System Alerts...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-16 text-center">
                <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-6 h-6 text-slate-400 opacity-60" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">All clear!</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  No notifications match your current status or severity filters.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-6 transition-all hover:bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      !n.isRead ? "bg-blue-50/10 border-l-4 border-l-blue-600" : "border-l-4 border-l-transparent"
                    }`}
                  >
                    <div 
                      onClick={() => handleNotificationClick(n)}
                      className="flex items-start gap-4 cursor-pointer flex-1"
                    >
                      <div className="mt-0.5">{getNotificationIcon(n.severity)}</div>
                      <div className="space-y-1.5 max-w-2xl">
                        <div className="flex items-center flex-wrap gap-2.5">
                          <h4 className={`text-sm ${!n.isRead ? "font-bold text-slate-900" : "font-semibold text-slate-700"}`}>
                            {n.title}
                          </h4>
                          <span className={`px-2 py-0.5 border rounded-full text-[9px] font-extrabold uppercase tracking-wide ${getSeverityBadgeClass(n.severity)}`}>
                            {n.severity}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed leading-relaxed">{n.message}</p>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {!n.isRead && (
                        <button
                          onClick={() => handleMarkRead(n.id)}
                          className="px-3 py-1.5 border border-blue-200 text-blue-600 hover:bg-blue-50 font-bold rounded-lg text-xs transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                          title="Mark Notification as Read"
                        >
                          <Check size={13} />
                          <span>Mark Read</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(n.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-lg transition-all cursor-pointer"
                        title="Delete notification"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-bold">
                  Page {currentPage + 1} of {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 0}
                    onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                    className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer shadow-sm"
                  >
                    <ArrowLeft size={14} className="text-slate-600" />
                  </button>
                  <button
                    disabled={currentPage === totalPages - 1}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                    className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer shadow-sm"
                  >
                    <ArrowRight size={14} className="text-slate-600" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Notifications;
