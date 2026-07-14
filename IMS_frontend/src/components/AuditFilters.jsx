import { Search, RotateCcw, Calendar, Shield, Tag, ToggleLeft, Layers } from "lucide-react";

const AuditFilters = ({ filters, onFilterChange, onReset }) => {
  const actions = ["CREATE", "UPDATE", "DELETE", "LOGIN", "EXPORT", "EXPORT_CSV", "INVOICE_GENERATED", "INVOICE_EMAIL_SENT", "INVOICE_DOWNLOADED", "REPORT_GENERATED"];
  const entities = ["PRODUCT", "PURCHASE", "SALE", "INVOICE", "USER", "REPORT", "AUDIT"];
  const statuses = ["SUCCESS", "FAILED"];
  const roles = ["ADMIN", "STAFF"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange(name, value);
  };

  return (
    <div className="card-premium p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Search Logs</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              name="search"
              value={filters.search || ""}
              onChange={handleChange}
              placeholder="Search user, action..."
              className="input-premium pl-9 text-xs"
            />
          </div>
        </div>

        {/* Action Type */}
        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Action Type</label>
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <select
              name="action"
              value={filters.action || ""}
              onChange={handleChange}
              className="input-premium pl-9 pr-8 text-xs cursor-pointer bg-white"
            >
              <option value="">All Actions</option>
              {actions.map((act) => (
                <option key={act} value={act}>
                  {act}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Entity Type */}
        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Entity Module</label>
          <div className="relative">
            <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <select
              name="entityName"
              value={filters.entityName || ""}
              onChange={handleChange}
              className="input-premium pl-9 pr-8 text-xs cursor-pointer bg-white"
            >
              <option value="">All Entities</option>
              {entities.map((ent) => (
                <option key={ent} value={ent}>
                  {ent}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status */}
        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</label>
          <div className="relative">
            <ToggleLeft className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <select
              name="status"
              value={filters.status || ""}
              onChange={handleChange}
              className="input-premium pl-9 pr-8 text-xs cursor-pointer bg-white"
            >
              <option value="">All Statuses</option>
              {statuses.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Role */}
        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">User Role</label>
          <div className="relative">
            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <select
              name="role"
              value={filters.role || ""}
              onChange={handleChange}
              className="input-premium pl-9 pr-8 text-xs cursor-pointer bg-white"
            >
              <option value="">All Roles</option>
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Start Date */}
        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Start Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              type="datetime-local"
              name="startDate"
              value={filters.startDate || ""}
              onChange={handleChange}
              className="input-premium pl-9 text-xs cursor-pointer py-1.5"
            />
          </div>
        </div>

        {/* End Date */}
        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">End Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              type="datetime-local"
              name="endDate"
              value={filters.endDate || ""}
              onChange={handleChange}
              className="input-premium pl-9 text-xs cursor-pointer py-1.5"
            />
          </div>
        </div>

        {/* Reset Button */}
        <div className="flex items-end">
          <button
            onClick={onReset}
            className="btn-secondary w-full py-2 flex items-center justify-center gap-2 text-xs font-semibold shadow-sm group"
          >
            <RotateCcw className="w-3.5 h-3.5 group-hover:rotate-[-45deg] transition-transform duration-300" />
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuditFilters;
