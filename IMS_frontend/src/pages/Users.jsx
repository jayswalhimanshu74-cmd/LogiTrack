import { useState, useEffect, useCallback } from "react";
import { 
  Users as UsersIcon, Shield, CheckCircle, XCircle, Search, 
  RotateCw, Key, Trash2, ShieldAlert, AlertTriangle, X, Check, Copy, UserCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import userManagementApi from "../api/userManagementApi";
import useAuth from "../hooks/useAuth";

const Users = () => {
  const { email: currentUserEmail } = useAuth();
  const [users, setUsers] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState("");

  // Action Modals & State
  const [toasts, setToasts] = useState([]);
  const [deleteUserTarget, setDeleteUserTarget] = useState(null);
  const [tempPasswordData, setTempPasswordData] = useState(null);
  const [copiedText, setCopiedText] = useState(false);

  const showToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        size: pageSize,
        search: search.trim() || undefined,
        role: roleFilter || undefined,
        active: activeFilter !== "" ? activeFilter === "true" : undefined
      };
      
      const response = await userManagementApi.getUsers(params);
      setUsers(response.content || []);
      setTotalElements(response.totalElements || 0);
      setTotalPages(response.totalPages || 0);
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || "Failed to load users list.", "error");
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, search, roleFilter, activeFilter, showToast]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleRoleChange = async (userId, userFullName, newRole) => {
    try {
      await userManagementApi.changeRole(userId, newRole);
      showToast(`Role for ${userFullName} updated to ${newRole} successfully.`);
      loadUsers();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || "Failed to change user role.", "error");
    }
  };

  const handleToggleStatus = async (userId, userFullName, currentStatus) => {
    const newStatus = !currentStatus;
    try {
      await userManagementApi.toggleStatus(userId, newStatus);
      showToast(`${userFullName} is now ${newStatus ? 'active' : 'disabled'}.`);
      loadUsers();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || "Failed to update user status.", "error");
    }
  };

  const handleResetPassword = async (userId, userFullName) => {
    try {
      const res = await userManagementApi.resetPassword(userId);
      setTempPasswordData({
        fullName: userFullName,
        temporaryPassword: res.temporaryPassword
      });
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || "Failed to reset password.", "error");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteUserTarget) return;
    try {
      await userManagementApi.deleteUser(deleteUserTarget.id);
      showToast(`User account ${deleteUserTarget.fullName} deleted successfully.`);
      setDeleteUserTarget(null);
      loadUsers();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || "Failed to delete user account.", "error");
      setDeleteUserTarget(null);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handlePageChange = (pageIndex) => {
    if (pageIndex >= 0 && pageIndex < totalPages) {
      setCurrentPage(pageIndex);
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setRoleFilter("");
    setActiveFilter("");
    setCurrentPage(0);
  };

  // Role Badge Styling
  const getRoleBadgeClass = (role) => {
    switch (role) {
      case "ADMIN":
        return "bg-violet-50 text-violet-750 text-violet-700 border-violet-100";
      case "MANAGER":
        return "bg-blue-50 text-blue-750 text-blue-700 border-blue-100";
      case "STAFF":
      default:
        return "bg-emerald-50 text-emerald-750 text-emerald-700 border-emerald-100";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex font-sans antialiased">
      <Sidebar activeTab="users" />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header 
          workspaceName="Administration" 
          title="User Account Management"
          onRefresh={loadUsers}
        />

        <main className="flex-1 p-6 md:p-8 space-y-6 max-w-[1600px] w-full mx-auto">
          {/* Header Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card-premium p-6 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-blue-55 bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm shrink-0">
                <UsersIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total User Accounts</p>
                <p className="text-xl font-extrabold text-slate-900 tracking-tight mt-0.5">{totalElements}</p>
                <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1 mt-1">
                  System authorized logins
                </span>
              </div>
            </div>

            <div className="card-premium p-6 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600 shadow-sm shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Administrators</p>
                <p className="text-xl font-extrabold text-violet-750 text-violet-700 tracking-tight mt-0.5">
                  {users.filter(u => u.role === "ADMIN").length || "-"}
                </p>
                <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1 mt-1">
                  Full systems control
                </span>
              </div>
            </div>

            <div className="card-premium p-6 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Managers</p>
                <p className="text-xl font-extrabold text-blue-750 text-blue-700 tracking-tight mt-0.5">
                  {users.filter(u => u.role === "MANAGER").length || "-"}
                </p>
                <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1 mt-1">
                  Inventory & operations
                </span>
              </div>
            </div>

            <div className="card-premium p-6 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Verified Accounts</p>
                <p className="text-xl font-extrabold text-emerald-700 tracking-tight mt-0.5">
                  {users.filter(u => u.verified).length || "-"}
                </p>
                <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1 mt-1">
                  Secure email validated
                </span>
              </div>
            </div>
          </div>

          {/* Filtering Panel */}
          <div className="card-premium p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/70 backdrop-blur-sm border border-slate-200/60 shadow-sm">
            <div className="flex flex-1 flex-col sm:flex-row items-center gap-3 w-full">
              {/* Search */}
              <div className="relative w-full sm:max-w-xs">
                <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
                  <Search size={15} />
                </span>
                <input
                  type="text"
                  placeholder="Search user name or email..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setCurrentPage(0); }}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200/80 rounded-xl text-xs bg-white/80 focus:border-blue-450 focus:ring-1 focus:ring-blue-450 transition-all font-medium placeholder-slate-400 outline-none"
                />
              </div>

              {/* Role filter */}
              <select
                value={roleFilter}
                onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(0); }}
                className="w-full sm:w-40 px-3 py-2 border border-slate-200/80 rounded-xl text-xs bg-white/80 focus:border-blue-450 focus:ring-1 focus:ring-blue-450 transition-all font-semibold outline-none text-slate-600 cursor-pointer"
              >
                <option value="">All Roles</option>
                <option value="ADMIN">ADMIN</option>
                <option value="MANAGER">MANAGER</option>
                <option value="STAFF">STAFF</option>
              </select>

              {/* Active Status filter */}
              <select
                value={activeFilter}
                onChange={(e) => { setActiveFilter(e.target.value); setCurrentPage(0); }}
                className="w-full sm:w-40 px-3 py-2 border border-slate-200/80 rounded-xl text-xs bg-white/80 focus:border-blue-450 focus:ring-1 focus:ring-blue-450 transition-all font-semibold outline-none text-slate-600 cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleResetFilters}
                className="btn-secondary py-2 px-3 flex items-center gap-1 text-xs font-semibold"
                title="Reset filters"
              >
                <RotateCw size={12} />
                <span>Reset Filters</span>
              </button>
            </div>
          </div>

          {/* User Table Grid */}
          <div className="card-premium overflow-hidden bg-white border border-slate-200/80 shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
                    <th className="py-4.5 px-6">User Profile</th>
                    <th className="py-4.5 px-6">Access Role</th>
                    <th className="py-4.5 px-6">Verification</th>
                    <th className="py-4.5 px-6">Account Status</th>
                    <th className="py-4.5 px-6">Created On</th>
                    <th className="py-4.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <span className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
                          <span className="text-xs font-semibold text-slate-600">Retrieving secure user list...</span>
                        </div>
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <UsersIcon className="w-8 h-8 mx-auto mb-2 text-slate-350 opacity-50" />
                        <p className="text-xs font-bold text-slate-700">No users found</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Try refining your search queries or role filters.</p>
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => {
                      const isSelf = user.email === currentUserEmail;
                      const avatarLetters = user.fullName ? user.fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "U";

                      return (
                        <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-6 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-extrabold shadow-sm text-xs border border-blue-200/20 shrink-0">
                              {avatarLetters}
                            </div>
                            <div className="overflow-hidden min-w-0">
                              <p className="text-slate-900 font-bold truncate flex items-center gap-1.5">
                                {user.fullName}
                                {isSelf && (
                                  <span className="bg-slate-100 text-slate-500 border border-slate-200 text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                                    You
                                  </span>
                                )}
                              </p>
                              <p className="text-slate-450 text-[10px] text-slate-400 font-mono truncate">{user.email}</p>
                              {user.phone && <p className="text-slate-400 text-[9px] mt-0.5">{user.phone}</p>}
                            </div>
                          </td>

                          <td className="py-4 px-6">
                            {isSelf ? (
                              <div className={`px-2.5 py-1 rounded-lg border w-fit font-bold text-[10px] select-none ${getRoleBadgeClass(user.role)}`}>
                                {user.role}
                              </div>
                            ) : (
                              <select
                                value={user.role}
                                onChange={(e) => handleRoleChange(user.id, user.fullName, e.target.value)}
                                className={`px-2 py-1 rounded-lg border text-[10px] font-bold outline-none cursor-pointer focus:ring-1 focus:ring-blue-450 ${getRoleBadgeClass(user.role)}`}
                                title="Click to modify user role"
                              >
                                <option value="ADMIN">ADMIN</option>
                                <option value="MANAGER">MANAGER</option>
                                <option value="STAFF">STAFF</option>
                              </select>
                            )}
                          </td>

                          <td className="py-4 px-6">
                            {user.verified ? (
                              <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full text-[9px] font-bold flex items-center gap-1 w-fit shadow-[0_1px_2px_rgba(16,185,129,0.02)]">
                                <CheckCircle className="w-3 h-3 text-emerald-500" />
                                Verified
                              </span>
                            ) : (
                              <span className="bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-full text-[9px] font-bold flex items-center gap-1 w-fit shadow-[0_1px_2px_rgba(245,158,11,0.02)]">
                                <XCircle className="w-3 h-3 text-amber-500" />
                                Unverified
                              </span>
                            )}
                          </td>

                          <td className="py-4 px-6">
                            {isSelf ? (
                              <div className="flex items-center gap-2">
                                <span className={`w-2.5 h-2.5 rounded-full ${user.active ? 'bg-emerald-500' : 'bg-rose-500'} shrink-0`} />
                                <span className="text-[10px] font-bold text-slate-500 uppercase">{user.active ? 'Active' : 'Disabled'}</span>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleToggleStatus(user.id, user.fullName, user.active)}
                                className={`px-3 py-1 rounded-lg border text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                  user.active
                                    ? "bg-emerald-50/60 text-emerald-755 text-emerald-700 hover:bg-rose-50 hover:text-rose-700 border-emerald-100 hover:border-rose-100"
                                    : "bg-rose-50/60 text-rose-755 text-rose-700 hover:bg-emerald-50 hover:text-emerald-700 border-rose-100 hover:border-emerald-100"
                                }`}
                                title={user.active ? "Click to disable account" : "Click to enable account"}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${user.active ? 'bg-emerald-500' : 'bg-rose-500'} shrink-0`} />
                                <span>{user.active ? "Active" : "Disabled"}</span>
                              </button>
                            )}
                          </td>

                          <td className="py-4 px-6 text-slate-400 font-mono text-[10px]">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' }) : "-"}
                          </td>

                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleResetPassword(user.id, user.fullName)}
                                className="p-2 border border-slate-205 border-slate-200 text-slate-500 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg hover:border-blue-100 transition-all cursor-pointer flex items-center justify-center"
                                title="Reset User Password (generate temp password)"
                              >
                                <Key size={13} />
                              </button>

                              <button
                                onClick={() => setDeleteUserTarget(user)}
                                disabled={isSelf}
                                className={`p-2 border rounded-lg transition-all flex items-center justify-center ${
                                  isSelf 
                                    ? "border-slate-100 text-slate-200 cursor-not-allowed bg-slate-50" 
                                    : "border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50/50 hover:border-rose-100 cursor-pointer"
                                }`}
                                title={isSelf ? "Self-deletion prevented" : "Delete user account permanently"}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-100 p-4 bg-white/50">
                <span className="text-xs text-slate-500 font-medium">
                  Showing page <span className="font-bold text-slate-700">{currentPage + 1}</span> of <span className="font-bold text-slate-700">{totalPages}</span> ({totalElements} users)
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                    className="p-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-sm font-bold select-none">chevron_left</span>
                  </button>
                  <div className="flex items-center gap-1">
                    {[...Array(totalPages)].map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => handlePageChange(idx)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          currentPage === idx
                            ? "bg-blue-600 text-white shadow-sm shadow-blue-500/10"
                            : "border border-slate-200 text-slate-550 hover:bg-slate-50 hover:text-slate-800"
                        }`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages - 1}
                    className="p-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-sm font-bold select-none">chevron_right</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Temp Password Drawer/Modal */}
      <AnimatePresence>
        {tempPasswordData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setTempPasswordData(null)}
              className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
            ></motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col p-6 font-sans text-slate-850"
            >
              <button
                onClick={() => setTempPasswordData(null)}
                className="absolute top-5 right-5 p-1 text-slate-400 hover:text-slate-650 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
              >
                <X size={15} />
              </button>

              <div className="flex gap-4">
                <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center border border-amber-100/50 shrink-0 shadow-sm">
                  <ShieldAlert size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-slate-900">One-Time Temp Password</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    A temporary password has been successfully generated for <span className="font-bold text-slate-800">{tempPasswordData.fullName}</span>. Please copy and provide this securely to the user. They will be required to change it on their next login attempt.
                  </p>

                  <div className="mt-4 p-3 bg-slate-900 border border-slate-850 rounded-xl flex items-center justify-between text-slate-100 font-mono text-sm shadow-inner relative group select-all">
                    <span className="font-extrabold tracking-wider">{tempPasswordData.temporaryPassword}</span>
                    <button
                      onClick={() => copyToClipboard(tempPasswordData.temporaryPassword)}
                      className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-all cursor-pointer"
                      title="Copy password to clipboard"
                    >
                      {copiedText ? <Check size={14} className="text-emerald-450 text-emerald-500" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setTempPasswordData(null)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-blue-500/10 cursor-pointer"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete User Confirmation Modal */}
      <AnimatePresence>
        {deleteUserTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 antialiased">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteUserTarget(null)}
              className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.97, opacity: 0, y: 8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.97, opacity: 0, y: 8 }}
              className="relative bg-white rounded-xl border border-slate-200/80 shadow-2xl max-w-md w-full p-6 z-10 font-sans"
            >
              <button 
                onClick={() => setDeleteUserTarget(null)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>

              <div className="flex gap-4">
                <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center border border-rose-100/50 shrink-0 shadow-sm">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Delete User Account</h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    Are you absolutely sure you want to permanently delete the user account for <span className="font-bold text-slate-800">"{deleteUserTarget.fullName}"</span> ({deleteUserTarget.email})?
                  </p>
                  <p className="text-[10px] text-rose-600 bg-rose-50 border border-rose-100/30 p-2.5 rounded-lg font-semibold mt-3 flex items-start gap-1.5 leading-snug">
                    <ShieldAlert size={12} className="shrink-0 mt-0.5" />
                    <span>Warning: This is an administrative deletion. The user will be immediately logged out and lose all system permissions. This action cannot be reverted.</span>
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setDeleteUserTarget(null)}
                  className="btn-secondary py-2 px-4 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-rose-500/10 cursor-pointer"
                >
                  <Trash2 size={12} />
                  <span>Delete Account</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toasts container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 font-sans">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className={`p-4 rounded-xl shadow-lg border flex items-center gap-3 max-w-sm relative ${
                t.type === "error"
                  ? "bg-red-50 text-red-800 border-red-100"
                  : "bg-emerald-50 text-emerald-800 border-emerald-100"
              }`}
            >
              {t.type === "error" ? (
                <AlertTriangle className="text-red-500 shrink-0" size={18} />
              ) : (
                <Check className="text-emerald-500 shrink-0" size={18} />
              )}
              <div className="text-xs font-semibold leading-relaxed pr-6">{t.message}</div>
              <button 
                onClick={() => setToasts((prev) => prev.filter((item) => item.id !== t.id))}
                className="text-slate-400 hover:text-slate-650 absolute top-2 right-2 cursor-pointer font-bold text-xs"
              >
                X
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Users;
