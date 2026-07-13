import { useState, useEffect, useCallback } from "react";
import { 
  FileText, Download, AlertCircle, X, ChevronLeft, ChevronRight, 
  CheckCircle2, History, Database, Cpu, Terminal
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../components/Sidebar";
import AuditFilters from "../components/AuditFilters";
import AuditTable from "../components/AuditTable";
import auditApi from "../api/auditApi";

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    userId: "",
    action: "",
    entityName: "",
    status: "",
    role: "",
    search: "",
  });

  const [selectedLog, setSelectedLog] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        size: pageSize,
        sortBy: "timestamp",
        direction: "desc"
      };

      Object.entries(filters).forEach(([key, val]) => {
        if (val) {
          if (key === "startDate" || key === "endDate") {
            params[key] = new Date(val).toISOString();
          } else {
            params[key] = val;
          }
        }
      });

      const response = await auditApi.getLogs(params);
      setLogs(response.content || []);
      setTotalElements(response.totalElements || 0);
      setTotalPages(response.totalPages || 0);
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || "Failed to load audit logs", "error");
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, filters, showToast]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(0);
  };

  const handleResetFilters = () => {
    setFilters({
      startDate: "",
      endDate: "",
      userId: "",
      action: "",
      entityName: "",
      status: "",
      role: "",
      search: "",
    });
    setCurrentPage(0);
  };

  const handleExport = async (format) => {
    try {
      const params = {};
      Object.entries(filters).forEach(([key, val]) => {
        if (val) {
          if (key === "startDate" || key === "endDate") {
            params[key] = new Date(val).toISOString();
          } else {
            params[key] = val;
          }
        }
      });

      const blob = await auditApi.exportLogs(params, format);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `audit_report_${Date.now()}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      showToast(`Audit logs exported as ${format.toUpperCase()} successfully!`);
    } catch (err) {
      console.error(err);
      showToast("Failed to export audit logs", "error");
    }
  };

  const handleViewDetails = async (log) => {
    try {
      const detailedLog = await auditApi.getLogById(log.id);
      setSelectedLog(detailedLog);
      setIsModalOpen(true);
    } catch (err) {
      console.error(err);
      setSelectedLog(log);
      setIsModalOpen(true);
    }
  };

  const handlePageChange = (pageIndex) => {
    if (pageIndex >= 0 && pageIndex < totalPages) {
      setCurrentPage(pageIndex);
    }
  };

  const renderDiffTable = (oldVal, newVal) => {
    let oldObj = null;
    let newObj = null;
    try { if (oldVal) oldObj = JSON.parse(oldVal); } catch (e) {}
    try { if (newVal) newObj = JSON.parse(newVal); } catch (e) {}

    if (oldObj || newObj) {
      const keys = Array.from(new Set([
        ...Object.keys(oldObj || {}),
        ...Object.keys(newObj || {})
      ])).filter(key => key !== 'id' && key !== 'updatedAt' && key !== 'createdAt');

      if (keys.length === 0) {
        return <p className="text-slate-400 text-xs italic">No relevant fields changed.</p>;
      }

      return (
        <div className="border border-slate-200 rounded-xl overflow-hidden mt-2 bg-slate-50/40">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                <th className="py-2 px-4 w-1/4">Field / Property</th>
                <th className="py-2 px-4 w-3/8">Previous Value</th>
                <th className="py-2 px-4 w-3/8">Updated Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 font-mono text-slate-700">
              {keys.map((key) => {
                const oldRaw = oldObj ? oldObj[key] : undefined;
                const newRaw = newObj ? newObj[key] : undefined;

                const oldStringVal = oldRaw !== undefined ? (typeof oldRaw === 'object' ? JSON.stringify(oldRaw) : String(oldRaw)) : '-';
                const newStringVal = newRaw !== undefined ? (typeof newRaw === 'object' ? JSON.stringify(newRaw) : String(newRaw)) : '-';
                const isChanged = oldStringVal !== newStringVal;

                if (!isChanged) {
                  return (
                    <tr key={key} className="text-slate-450 hover:bg-slate-50/50">
                      <td className="py-2 px-4 font-semibold text-slate-500">{key}</td>
                      <td className="py-2 px-4 truncate max-w-[200px]" title={oldStringVal}>{oldStringVal}</td>
                      <td className="py-2 px-4 truncate max-w-[200px]" title={newStringVal}>{newStringVal}</td>
                    </tr>
                  );
                }

                return (
                  <tr key={key} className="bg-amber-50/20 hover:bg-amber-50/40">
                    <td className="py-2 px-4 font-semibold text-amber-800">{key}</td>
                    <td className="py-2 px-4 text-red-700 bg-red-50/40 line-through truncate max-w-[200px]" title={oldStringVal}>
                      {oldStringVal}
                    </td>
                    <td className="py-2 px-4 text-emerald-700 bg-emerald-50/40 font-semibold truncate max-w-[200px]" title={newStringVal}>
                      {newStringVal}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        <div>
          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">State Prior</label>
          <pre className="bg-slate-900 p-3 rounded-lg border border-slate-200 text-xs font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap max-h-48">
            {oldVal || 'None / Not Captured'}
          </pre>
        </div>
        <div>
          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">State Posterior</label>
          <pre className="bg-slate-900 p-3 rounded-lg border border-slate-200 text-xs font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap max-h-48">
            {newVal || 'None / Not Captured'}
          </pre>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex font-sans">
      <Sidebar activeTab="audit-logs" />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 md:px-8 z-10 sticky top-0">
          <div className="flex items-center gap-2.5">
            <div>
              <h2 className="text-lg text-slate-800 font-bold tracking-tight">Audit Logs</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExport("csv")}
              className="flex items-center gap-2 bg-white hover:bg-slate-55 text-slate-700 font-semibold py-1.5 px-3.5 rounded-lg border border-slate-200 transition-colors text-xs cursor-pointer shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
            <button
              onClick={() => handleExport("pdf")}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1.5 px-3.5 rounded-lg transition-colors text-xs cursor-pointer shadow-md shadow-blue-500/10"
            >
              <FileText className="w-3.5 h-3.5" />
              Download PDF
            </button>
          </div>
        </header>

        {/* Audit Dashboard Workspace */}
        <main className="flex-1 p-6 md:p-8 space-y-6 max-w-[1600px] w-full mx-auto">
          {/* Statistics Widgets */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-450 uppercase tracking-wider">Total Stored Activities</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{totalElements}</p>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-450 uppercase tracking-wider">Security Observability</p>
                <p className="text-2xl font-bold text-emerald-650 mt-1">100%</p>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-650">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-455 uppercase tracking-wider">Interceptors Active</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">AOP AspectJ</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <AuditFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
          />

          {/* Main Table */}
          <AuditTable
            logs={logs}
            loading={loading}
            onViewDetails={handleViewDetails}
          />

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 bg-white border border-slate-200 px-6 py-4 rounded-xl shadow-sm">
              <div className="text-xs text-slate-500 font-medium">
                Showing page <span className="font-semibold text-slate-800">{currentPage + 1}</span> of <span className="font-semibold text-slate-800">{totalPages}</span> ({totalElements} logs)
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                  className="p-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-650 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, idx) => {
                    if (Math.abs(idx - currentPage) < 3 || idx === 0 || idx === totalPages - 1) {
                      return (
                        <button
                          key={idx}
                          onClick={() => handlePageChange(idx)}
                          className={`w-8 h-8 rounded-lg text-xs font-semibold border transition-colors ${
                            currentPage === idx
                              ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/10"
                              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {idx + 1}
                        </button>
                      );
                    }
                    if (idx === 1 || idx === totalPages - 2) {
                      return <span key={idx} className="text-slate-400 text-xs px-1">...</span>;
                    }
                    return null;
                  })}
                </div>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages - 1}
                  className="p-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-650 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Audit Inspector Modal */}
      <AnimatePresence>
        {isModalOpen && selectedLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            ></motion.div>

            {/* Content Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[85vh] text-slate-800"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold text-slate-800">Audit Inspector / Log Detail</span>
                  <span className="text-xs text-slate-400 font-mono">#{selectedLog.id}</span>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6">
                {/* Meta details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-4 rounded-xl border border-slate-200">
                  <div className="space-y-3">
                    <h5 className="text-xs font-bold text-slate-450 uppercase tracking-wider border-b border-slate-200 pb-1">Event Information</h5>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <span className="text-slate-450 font-medium">Timestamp:</span>
                      <span className="col-span-2 text-slate-700 font-mono">{new Date(selectedLog.timestamp).toLocaleString()}</span>
                      
                      <span className="text-slate-450 font-medium">Action type:</span>
                      <span className="col-span-2 text-blue-600 font-mono font-semibold">{selectedLog.action}</span>
                      
                      <span className="text-slate-450 font-medium">Entity context:</span>
                      <span className="col-span-2 text-slate-700 font-mono font-semibold">{selectedLog.entityName || "-"}{selectedLog.entityId ? ` #${selectedLog.entityId}` : ""}</span>
                      
                      <span className="text-slate-450 font-medium">Execution:</span>
                      <span className={`col-span-2 font-mono font-bold ${selectedLog.status === "SUCCESS" ? "text-emerald-600" : "text-rose-600"}`}>{selectedLog.status}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h5 className="text-xs font-bold text-slate-455 uppercase tracking-wider border-b border-slate-200 pb-1">User Context</h5>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <span className="text-slate-450 font-medium">Operator:</span>
                      <span className="col-span-2 text-slate-800 font-bold">{selectedLog.userName || "System"}</span>

                      <span className="text-slate-450 font-medium">Email address:</span>
                      <span className="col-span-2 text-slate-700 font-mono truncate">{selectedLog.userEmail || "system@logitrack.com"}</span>

                      <span className="text-slate-450 font-medium">Access role:</span>
                      <span className="col-span-2 text-slate-700 font-mono">{selectedLog.role || "-"}</span>

                      <span className="text-slate-455 font-medium">Operator ID:</span>
                      <span className="col-span-2 text-slate-700 font-mono">{selectedLog.userId || "System"}</span>
                    </div>
                  </div>
                </div>

                {/* HTTP Request metadata */}
                <div className="space-y-3">
                  <h5 className="text-xs font-bold text-slate-450 uppercase tracking-wider pb-1 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-slate-400" />
                    Network & HTTP Context
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                    <div className="bg-slate-50/50 border border-slate-200 p-2.5 rounded-lg">
                      <span className="text-[10px] text-slate-450 block font-sans font-bold uppercase mb-0.5">IP Address</span>
                      <span className="text-slate-700">{selectedLog.ipAddress || "-"}</span>
                    </div>
                    <div className="bg-slate-50/50 border border-slate-200 p-2.5 rounded-lg md:col-span-2">
                      <span className="text-[10px] text-slate-450 block font-sans font-bold uppercase mb-0.5">Request URI & Method</span>
                      <span className="text-blue-600 font-bold mr-2">{selectedLog.requestMethod || "N/A"}</span>
                      <span className="text-slate-700">{selectedLog.requestUri || "-"}</span>
                    </div>
                  </div>
                  <div className="bg-slate-50/50 border border-slate-200 p-2.5 rounded-lg text-xs font-mono">
                    <span className="text-[10px] text-slate-450 block font-sans font-bold uppercase mb-0.5">User Agent Client</span>
                    <span className="text-slate-600 truncate block" title={selectedLog.userAgent}>{selectedLog.userAgent || "-"}</span>
                  </div>
                </div>

                {/* Description and notes */}
                <div className="space-y-2">
                  <h5 className="text-xs font-bold text-slate-450 uppercase tracking-wider pb-1">Action Description / Message</h5>
                  <div className="bg-slate-50/50 p-3 rounded-lg border border-slate-200 text-xs text-slate-750 font-semibold">
                    {selectedLog.description}
                  </div>
                </div>

                {/* State difference viewer */}
                <div className="space-y-2">
                  <h5 className="text-xs font-bold text-slate-450 uppercase tracking-wider pb-1">Entity State Modifications (Diff)</h5>
                  {renderDiffTable(selectedLog.oldValue, selectedLog.newValue)}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end px-6 py-4 bg-slate-50 border-t border-slate-200">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Close Inspector
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toasts */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 font-sans">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className={`p-4 rounded-xl shadow-lg border flex items-center gap-3 max-w-sm ${
                t.type === "error"
                  ? "bg-red-50 text-red-800 border-red-200 backdrop-blur-md"
                  : "bg-emerald-50 text-emerald-800 border-emerald-200 backdrop-blur-md"
              }`}
            >
              {t.type === "error" ? (
                <AlertCircle className="text-red-600 shrink-0" size={18} />
              ) : (
                <CheckCircle2 className="text-emerald-600 shrink-0" size={18} />
              )}
              <div className="text-xs font-semibold leading-relaxed pr-6">{t.message}</div>
              <button 
                onClick={() => setToasts((prev) => prev.filter((item) => item.id !== t.id))}
                className="text-slate-400 hover:text-slate-600 absolute top-2 right-2 cursor-pointer"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AuditLogs;
