import { Eye, ShieldAlert, CheckCircle, Clock } from "lucide-react";

const AuditTable = ({ logs, loading, onViewDetails }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getActionBadgeClass = (action) => {
    const act = action || "";
    if (act.includes("CREATE") || act.includes("LOGIN") || act.includes("SUCCESS")) {
      return "bg-emerald-50 text-emerald-700 border border-emerald-200/60";
    }
    if (act.includes("DELETE") || act.includes("CANCEL") || act.includes("FAILED")) {
      return "bg-rose-50 text-rose-700 border border-rose-200/60";
    }
    if (act.includes("UPDATE") || act.includes("EDIT")) {
      return "bg-amber-50 text-amber-700 border border-amber-200/60";
    }
    return "bg-blue-50 text-blue-700 border border-blue-200/60";
  };

  return (
    <div className="table-container-premium">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/50">
              <th className="th-premium py-3">Timestamp</th>
              <th className="th-premium py-3">User Context</th>
              <th className="th-premium py-3">Action / Event</th>
              <th className="th-premium py-3">Module / Entity</th>
              <th className="th-premium py-3 text-center">Status</th>
              <th className="th-premium py-3">Description</th>
              <th className="th-premium py-3 text-center">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="td-premium py-3"><div className="h-3.5 bg-slate-100 rounded w-28"></div></td>
                  <td className="td-premium py-3">
                    <div className="h-3.5 bg-slate-100 rounded w-32 mb-1.5"></div>
                    <div className="h-3 bg-slate-100 rounded w-24"></div>
                  </td>
                  <td className="td-premium py-3"><div className="h-5 bg-slate-100 rounded w-24"></div></td>
                  <td className="td-premium py-3"><div className="h-3.5 bg-slate-100 rounded w-16"></div></td>
                  <td className="td-premium py-3"><div className="h-5 bg-slate-100 rounded w-16 mx-auto"></div></td>
                  <td className="td-premium py-3"><div className="h-3.5 bg-slate-100 rounded w-48"></div></td>
                  <td className="td-premium py-3 text-center"><div className="h-7 bg-slate-100 rounded w-7 mx-auto"></div></td>
                </tr>
              ))
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-12 text-center text-slate-400 font-semibold bg-slate-50/10">
                  <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  No audit logs found matching the filter criteria.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/30 transition-colors">
                  {/* Timestamp */}
                  <td className="td-premium py-3 font-mono text-[10px] text-slate-400 whitespace-nowrap">
                    {formatDate(log.timestamp)}
                  </td>

                  {/* User Context */}
                  <td className="td-premium py-3 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800">{log.userName || "System"}</span>
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5">{log.userEmail || "system@logitrack.com"}</span>
                    </div>
                  </td>

                  {/* Action */}
                  <td className="td-premium py-3 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${getActionBadgeClass(log.action)}`}>
                      {log.action}
                    </span>
                  </td>

                  {/* Module / Entity */}
                  <td className="td-premium py-3 whitespace-nowrap">
                    {log.entityName ? (
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-1.5 py-0.5 rounded border border-slate-200/80 font-mono">
                          {log.entityName}
                        </span>
                        {log.entityId && (
                          <span className="text-[10px] text-slate-400 font-mono">#{log.entityId}</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-300 font-mono text-[10px]">-</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="td-premium py-3 text-center whitespace-nowrap">
                    {log.status === "SUCCESS" ? (
                      <span className="badge-success text-[10px] py-0.5 px-2">
                        Success
                      </span>
                    ) : (
                      <span className="badge-error text-[10px] py-0.5 px-2">
                        Failed
                      </span>
                    )}
                  </td>

                  {/* Description */}
                  <td className="td-premium py-3 max-w-xs truncate text-slate-550 text-xs font-semibold" title={log.description}>
                    {log.description}
                  </td>

                  {/* Details Trigger */}
                  <td className="td-premium py-3 text-center">
                    <button
                      onClick={() => onViewDetails(log)}
                      className="btn-icon hover:bg-blue-50 text-blue-600 hover:text-blue-700"
                      title="Inspect Log Entry"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditTable;
