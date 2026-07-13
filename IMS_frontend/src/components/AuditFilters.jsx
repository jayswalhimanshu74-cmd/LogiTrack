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
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Search Logs</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              name="search"
              value={filters.search || ""}
              onChange={handleChange}
              placeholder="Search user, action..."
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Action Type */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Action Type</label>
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              name="action"
              value={filters.action || ""}
              onChange={handleChange}
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors appearance-none cursor-pointer"
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
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Entity Module</label>
          <div className="relative">
            <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              name="entityName"
              value={filters.entityName || ""}
              onChange={handleChange}
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors appearance-none cursor-pointer"
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
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Status</label>
          <div className="relative">
            <ToggleLeft className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              name="status"
              value={filters.status || ""}
              onChange={handleChange}
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors appearance-none cursor-pointer"
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
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">User Role</label>
          <div className="relative">
            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              name="role"
              value={filters.role || ""}
              onChange={handleChange}
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors appearance-none cursor-pointer"
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
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Start Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="datetime-local"
              name="startDate"
              value={filters.startDate || ""}
              onChange={handleChange}
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors cursor-pointer"
            />
          </div>
        </div>

        {/* End Date */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">End Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="datetime-local"
              name="endDate"
              value={filters.endDate || ""}
              onChange={handleChange}
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors cursor-pointer"
            />
          </div>
        </div>

        {/* Reset Button */}
        <div className="flex items-end">
          <button
            onClick={onReset}
            className="w-full flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold py-2 px-4 rounded-xl border border-slate-200 hover:border-slate-350 transition-colors shadow-sm group cursor-pointer text-sm"
          >
            <RotateCcw className="w-4 h-4 group-hover:rotate-[-45deg] transition-transform duration-300" />
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuditFilters;
