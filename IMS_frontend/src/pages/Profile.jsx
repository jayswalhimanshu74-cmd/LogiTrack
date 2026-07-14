import { useState, useEffect, useCallback } from "react";
import { 
  User, Mail, Phone, Shield, Calendar, Image as ImageIcon, Key, Lock, CheckCircle2,
  X, Check, AlertCircle, RefreshCw, Eye, EyeOff, Info, Globe, Smartphone, History
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import profileApi from "../api/profileApi";

const Profile = () => {
  const [profileData, setProfileData] = useState(null);
  const [securityData, setSecurityData] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState("overview"); // "overview", "edit", "password", "security"
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Form States
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password Policy Checker
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { label: "None", percent: 0, color: "bg-slate-200" };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[a-z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    switch (score) {
      case 1: return { label: "Weak", percent: 20, color: "bg-red-500" };
      case 2: return { label: "Fair", percent: 40, color: "bg-amber-500" };
      case 3: return { label: "Good", percent: 60, color: "bg-blue-500" };
      case 4: return { label: "Strong", percent: 80, color: "bg-emerald-500" };
      case 5: return { label: "Very Strong", percent: 100, color: "bg-emerald-600" };
      default: return { label: "Weak", percent: 20, color: "bg-red-500" };
    }
  };

  const showToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const profile = await profileApi.getProfile();
      setProfileData(profile);
      setFullName(profile.fullName || "");
      setPhone(profile.phone || "");

      const sec = await profileApi.getSecurity();
      setSecurityData(sec);
    } catch (err) {
      console.error(err);
      showToast("Failed to load profile details", "error");
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      showToast("Full name is required", "error");
      return;
    }

    setIsSaving(true);
    try {
      const data = await profileApi.updateProfile({ fullName, phone });
      setProfileData(data);
      showToast("Profile details updated successfully!");
      setActiveSubTab("overview");
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || "Failed to update profile", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast("File size must be under 5MB", "error");
      return;
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      showToast("Unsupported file format. Please upload JPG, PNG or WEBP", "error");
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const data = await profileApi.uploadAvatar(file);
      setProfileData(data);
      showToast("Profile image updated successfully!");
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || "Failed to upload profile image", "error");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast("All password fields are required", "error");
      return;
    }
    if (newPassword.length < 8) {
      showToast("New password must be at least 8 characters", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("New password and confirmation do not match", "error");
      return;
    }

    setIsSaving(true);
    try {
      await profileApi.changePassword({ currentPassword, newPassword, confirmPassword });
      showToast("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setActiveSubTab("overview");
      // Refresh security data to capture new lastPasswordChanged stamp
      const sec = await profileApi.getSecurity();
      setSecurityData(sec);
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || "Failed to change password", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const getAvatarUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `http://localhost:8080${url}`;
  };

  const strengthInfo = getPasswordStrength(newPassword);

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans antialiased text-slate-800">
      <Sidebar activeTab="profile" />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header 
          workspaceName="User Settings" 
          title="Profile Settings" 
          onRefresh={async () => {
            const data = await profileApi.getProfile();
            setProfileData(data);
            const sec = await profileApi.getSecurity();
            setSecurityData(sec);
          }} 
        />

        {/* Dashboard Grid */}
        <main className="flex-1 p-6 md:p-8 space-y-6 max-w-[1600px] w-full mx-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-sm text-slate-500 font-semibold">Retrieving Profile Workspace...</p>
            </div>
          ) : (
            <>
              {/* Header Card */}
              <div className="card-premium p-6 flex flex-col md:flex-row items-center gap-6">
                <div className="relative group shrink-0">
                  <div className="w-20 h-20 rounded-full border border-slate-200/85 overflow-hidden bg-slate-50 flex items-center justify-center relative shadow-inner">
                    {profileData?.profileImageUrl ? (
                      <img 
                        src={getAvatarUrl(profileData.profileImageUrl)} 
                        alt="Profile Avatar" 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <span className="text-2xl font-black text-slate-400">
                        {profileData?.fullName ? profileData.fullName[0].toUpperCase() : "U"}
                      </span>
                    )}

                    {isUploadingAvatar && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <RefreshCw className="text-white animate-spin w-5 h-5" />
                      </div>
                    )}
                  </div>

                  <label className="absolute bottom-0 right-0 w-7 h-7 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center cursor-pointer shadow-md transition-colors border-2 border-white">
                    <ImageIcon size={11} />
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleAvatarChange} 
                      disabled={isUploadingAvatar}
                    />
                  </label>
                </div>

                <div className="text-center md:text-left flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-slate-800 truncate tracking-tight">{profileData?.fullName}</h3>
                  <p className="text-slate-400 font-medium text-xs mt-0.5">{profileData?.email}</p>
                  <div className="flex flex-wrap gap-2 items-center justify-center md:justify-start mt-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-750 border border-blue-100">
                      Role: {profileData?.role}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      profileData?.verified 
                        ? "badge-success" 
                        : "badge-warning"
                    }`}>
                      {profileData?.verified ? "Verified" : "Unverified"}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-50 text-slate-600 border border-slate-200">
                      Provider: {profileData?.oauthProvider}
                    </span>
                  </div>
                </div>
              </div>

              {/* Navigation Sub-Tabs */}
              <div className="flex border-b border-slate-200 gap-6">
                <button 
                  onClick={() => setActiveSubTab("overview")}
                  className={`pb-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                    activeSubTab === "overview" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-450 hover:text-slate-700"
                  }`}
                >
                  Overview
                </button>
                <button 
                  onClick={() => setActiveSubTab("edit")}
                  className={`pb-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                    activeSubTab === "edit" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-450 hover:text-slate-700"
                  }`}
                >
                  Edit Details
                </button>
                {profileData?.oauthProvider === "LOCAL" && (
                  <button 
                    onClick={() => setActiveSubTab("password")}
                    className={`pb-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                      activeSubTab === "password" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-450 hover:text-slate-700"
                    }`}
                  >
                    Change Password
                  </button>
                )}
                <button 
                  onClick={() => setActiveSubTab("security")}
                  className={`pb-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                    activeSubTab === "security" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-450 hover:text-slate-700"
                  }`}
                >
                  Security Settings
                </button>
              </div>

              {/* Sub-Tab Content Rendering */}
              <div className="grid grid-cols-1 gap-8">
                
                {activeSubTab === "overview" && (
                  <div className="card-premium p-6 space-y-6">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-3 flex items-center gap-2">
                      <User size={14} className="text-blue-600" />
                      Account Details
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Full Name</span>
                        <span className="text-slate-800 font-bold mt-1.5 block text-sm">{profileData?.fullName || "Not Specified"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Email Address</span>
                        <span className="text-slate-855 text-slate-800 font-bold mt-1.5 block text-sm">{profileData?.email}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Phone Number</span>
                        <span className="text-slate-800 font-bold mt-1.5 block text-sm">{profileData?.phone || "Not Specified"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Access Role</span>
                        <span className="text-slate-800 font-bold mt-1.5 block text-sm">{profileData?.role}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Registration Date</span>
                        <span className="text-slate-800 font-bold mt-1.5 block text-sm">
                          {profileData?.createdAt ? new Date(profileData.createdAt).toLocaleDateString() : "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Last Updated</span>
                        <span className="text-slate-800 font-bold mt-1.5 block text-sm">
                          {profileData?.updatedAt ? new Date(profileData.updatedAt).toLocaleString() : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {activeSubTab === "edit" && (
                  <div className="card-premium p-6">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-3 flex items-center gap-2 mb-6">
                      <User size={14} className="text-blue-600" />
                      Edit Profile Fields
                    </h4>
                    <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-xl">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Full Name</label>
                        <input 
                          type="text" 
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="input-premium py-2 px-3 text-xs"
                          placeholder="e.g. John Doe"
                          disabled={isSaving}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-455 uppercase tracking-wider block">Phone Number</label>
                        <input 
                          type="text" 
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="input-premium py-2 px-3 text-xs"
                          placeholder="e.g. +123456789"
                          disabled={isSaving}
                        />
                      </div>
                      <div className="pt-2">
                        <button 
                          type="submit" 
                          className="btn-primary py-2 px-4 text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-500/10"
                          disabled={isSaving}
                        >
                          {isSaving ? (
                            <>
                              <RefreshCw className="animate-spin w-3.5 h-3.5" />
                              Saving Changes...
                            </>
                          ) : (
                            "Save Details"
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {activeSubTab === "password" && profileData?.oauthProvider === "LOCAL" && (
                  <div className="card-premium p-6">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-3 flex items-center gap-2 mb-6">
                      <Key size={14} className="text-blue-600" />
                      Change Local Password
                    </h4>
                    <form onSubmit={handleChangePassword} className="space-y-4 max-w-xl">
                      
                      {/* Current Password */}
                      <div className="space-y-1.5 relative">
                        <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Current Password</label>
                        <div className="relative">
                          <input 
                            type={showCurrentPassword ? "text" : "password"} 
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="input-premium py-2 pl-3 pr-10 text-xs"
                            placeholder="••••••••"
                            disabled={isSaving}
                          />
                          <button 
                            type="button" 
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer flex items-center justify-center"
                          >
                            {showCurrentPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                      </div>

                      {/* New Password */}
                      <div className="space-y-1.5 relative">
                        <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">New Password</label>
                        <div className="relative">
                          <input 
                            type={showNewPassword ? "text" : "password"} 
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="input-premium py-2 pl-3 pr-10 text-xs"
                            placeholder="••••••••"
                            disabled={isSaving}
                          />
                          <button 
                            type="button" 
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer flex items-center justify-center"
                          >
                            {showNewPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                        {/* Password Strength indicator bar */}
                        {newPassword && (
                          <div className="mt-2 space-y-1 bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
                            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                              <span className="text-slate-400">Strength</span>
                              <span className={`${
                                strengthInfo.label === "Weak" ? "text-red-500" :
                                strengthInfo.label === "Fair" ? "text-amber-500" :
                                strengthInfo.label === "Good" ? "text-blue-500" : "text-emerald-600"
                              }`}>{strengthInfo.label}</span>
                            </div>
                            <div className="w-full bg-slate-200/60 rounded-full h-1 mt-1">
                              <div 
                                className={`h-1 rounded-full transition-all duration-300 ${strengthInfo.color}`}
                                style={{ width: `${strengthInfo.percent}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Confirm Password */}
                      <div className="space-y-1.5 relative">
                        <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Confirm New Password</label>
                        <div className="relative">
                          <input 
                            type={showConfirmPassword ? "text" : "password"} 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="input-premium py-2 pl-3 pr-10 text-xs"
                            placeholder="••••••••"
                            disabled={isSaving}
                          />
                          <button 
                            type="button" 
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer flex items-center justify-center"
                          >
                            {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                      </div>

                      <div className="pt-2">
                        <button 
                          type="submit" 
                          className="btn-primary py-2 px-4 text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-500/10"
                          disabled={isSaving}
                        >
                          {isSaving ? (
                            <>
                              <RefreshCw className="animate-spin w-3.5 h-3.5" />
                              Changing Password...
                            </>
                          ) : (
                            "Change Password"
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {activeSubTab === "security" && (
                  <div className="space-y-6">
                    {/* Security Status Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Account Verification Details Card */}
                      <div className="card-premium p-6 flex flex-col justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest pb-3 border-b border-slate-100 flex items-center gap-2">
                            <Lock size={14} className="text-blue-600" />
                            Account Security Info
                          </h4>
                          <div className="mt-4 space-y-3.5 text-xs font-semibold">
                            <div className="flex justify-between items-center py-0.5">
                              <span className="text-slate-400 font-medium">Provider Type</span>
                              <span className="text-slate-800 font-bold flex items-center gap-1.5 font-mono text-[11px]">
                                <Globe size={13} className="text-slate-400" />
                                {securityData?.oauthProvider}
                              </span>
                            </div>
                            <div className="flex justify-between items-center py-0.5">
                              <span className="text-slate-400 font-medium">Verification Status</span>
                              <span className={`font-bold flex items-center gap-1.5 ${
                                securityData?.verified ? "text-emerald-600" : "text-amber-600"
                              }`}>
                                <CheckCircle2 size={13} />
                                {securityData?.verified ? "Email Verified" : "Verification Required"}
                              </span>
                            </div>
                            <div className="flex justify-between items-center py-0.5">
                              <span className="text-slate-400 font-medium">Password Last Changed</span>
                              <span className="text-slate-800 font-bold">
                                {securityData?.lastPasswordChanged 
                                  ? new Date(securityData.lastPasswordChanged).toLocaleDateString()
                                  : "Never"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Future Multi-Factor Authentication Block */}
                      <div className="card-premium p-6 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start pb-3 border-b border-slate-100">
                            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                              <Smartphone size={14} className="text-blue-600" />
                              Two-Factor Authentication (2FA)
                            </h4>
                            <span className="bg-slate-100 text-slate-650 text-slate-500 border border-slate-200 px-1.5 py-0.5 rounded text-[9px] font-bold font-mono">MOCK</span>
                          </div>
                          <p className="text-xs text-slate-450 font-medium mt-3.5 leading-relaxed">
                            Add an extra layer of protection to your profile workspace. Once configured, you will need to enter a confirmation token sent to your device.
                          </p>
                        </div>
                        <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-100">
                          <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Status: Disabled</span>
                          <button className="btn-secondary py-1.5 px-3 text-[10px] font-bold cursor-not-allowed opacity-50">
                            Setup 2FA
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Audit & Log Details Table */}
                    <div className="card-premium p-6">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                          <History size={14} className="text-blue-600" />
                          Login Sessions Audit
                        </h4>
                        <span className="bg-slate-100 text-slate-650 text-slate-500 border border-slate-200 px-1.5 py-0.5 rounded text-[9px] font-bold font-mono">MOCK</span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-slate-200 text-slate-400">
                              <th className="th-premium py-2">Device / Browser</th>
                              <th className="th-premium py-2">IP Address</th>
                              <th className="th-premium py-2">Location</th>
                              <th className="th-premium py-2">Last Active</th>
                              <th className="th-premium py-2 text-right">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-semibold text-slate-600">
                            <tr className="hover:bg-slate-50/20">
                              <td className="td-premium py-3 font-bold text-slate-800">Windows / Chrome (124.0)</td>
                              <td className="td-premium py-3 font-mono">192.168.1.45</td>
                              <td className="td-premium py-3">Localhost</td>
                              <td className="td-premium py-3">Just now</td>
                              <td className="td-premium py-3 text-right text-emerald-600 font-extrabold">Active Session</td>
                            </tr>
                            <tr className="hover:bg-slate-50/20">
                              <td className="td-premium py-3 font-bold text-slate-800">iPhone / Mobile Safari</td>
                              <td className="td-premium py-3 font-mono">172.56.24.12</td>
                              <td className="td-premium py-3">Mumbai, India</td>
                              <td className="td-premium py-3 text-slate-400">2 hours ago</td>
                              <td className="td-premium py-3 text-right text-slate-400">Disconnected</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>

      {/* Slide-in Toast Notifications Overlay */}
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
                  ? "bg-red-50 text-red-800 border-red-100"
                  : t.type === "info"
                  ? "bg-blue-50 text-blue-800 border-blue-100"
                  : "bg-emerald-50 text-emerald-800 border-emerald-100"
              }`}
            >
              {t.type === "error" ? (
                <AlertCircle className="text-red-500 shrink-0" size={18} />
              ) : (
                <CheckCircle2 className="text-emerald-500 shrink-0" size={18} />
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

export default Profile;
