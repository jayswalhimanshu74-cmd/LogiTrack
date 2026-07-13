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
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider">
              <th className="py-4 px-6">Timestamp</th>
              <th className="py-4 px-6">User Context</th>
              <th className="py-4 px-6">Action / Event</th>
              <th className="py-4 px-6">Module / Entity</th>
              <th className="py-4 px-6 text-center">Status</th>
              <th className="py-4 px-6">Description</th>
              <th className="py-4 px-6 text-center">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/60 text-slate-700 text-sm">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-4 px-6"><div className="h-4 bg-slate-100 rounded w-28"></div></td>
                  <td className="py-4 px-6">
                    <div className="h-4 bg-slate-100 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-slate-100 rounded w-24"></div>
                  </td>
                  <td className="py-4 px-6"><div className="h-6 bg-slate-100 rounded w-24"></div></td>
                  <td className="py-4 px-6"><div className="h-4 bg-slate-100 rounded w-16"></div></td>
                  <td className="py-4 px-6"><div className="h-6 bg-slate-100 rounded w-16 mx-auto"></div></td>
                  <td className="py-4 px-6"><div className="h-4 bg-slate-100 rounded w-48"></div></td>
                  <td className="py-4 px-6 text-center"><div className="h-8 bg-slate-100 rounded w-8 mx-auto"></div></td>
                </tr>
              ))
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-12 text-center text-slate-400 font-medium bg-slate-50/10">
                  <Clock className="w-12 h-12 text-slate-350 mx-auto mb-4" />
                  No audit logs found matching the filter criteria.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/40 transition-colors">
                  {/* Timestamp */}
                  <td className="py-4 px-6 font-mono text-xs text-slate-500 whitespace-nowrap">
                    {formatDate(log.timestamp)}
                  </td>

                  {/* User Context */}
                  <td className="py-4 px-6 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-800">{log.userName || "System"}</span>
                      <span className="text-xs text-slate-450 font-mono">{log.userEmail || "system@logitrack.com"}</span>
                    </div>
                  </td>

                  {/* Action */}
                  <td className="py-4 px-6 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-medium border ${getActionBadgeClass(log.action)}`}>
                      {log.action}
                    </span>
                  </td>

                  {/* Module / Entity */}
                  <td className="py-4 px-6 whitespace-nowrap">
                    {log.entityName ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded border border-slate-200 font-mono">
                          {log.entityName}
                        </span>
                        {log.entityId && (
                          <span className="text-xs text-slate-400 font-mono">#{log.entityId}</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-300 font-mono text-xs">-</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-4 px-6 text-center whitespace-nowrap">
                    {log.status === "SUCCESS" ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 text-xs bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Success
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-700 text-xs bg-rose-50 px-2.5 py-0.5 rounded-md border border-rose-200">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        Failed
                      </span>
                    )}
                  </td>

                  {/* Description */}
                  <td className="py-4 px-6 max-w-xs truncate text-slate-600 text-xs" title={log.description}>
                    {log.description}
                  </td>

                  {/* Details Trigger */}
                  <td className="py-4 px-6 text-center">
                    <button
                      onClick={() => onViewDetails(log)}
                      className="p-1.5 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded-lg border border-blue-100 hover:border-blue-600 transition-colors shadow-sm cursor-pointer"
                      title="Inspect Log Entry"
                    >
                      <Eye className="w-4 h-4" />
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
