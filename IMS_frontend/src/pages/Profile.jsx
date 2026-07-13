import { useState, useEffect, useCallback } from "react";
import { 
  User, Mail, Phone, Shield, Calendar, Image as ImageIcon, Key, Lock, CheckCircle2,
  X, Check, AlertCircle, RefreshCw, Eye, EyeOff, Info, Globe, Smartphone, History
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../components/Sidebar";
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-base text-slate-500 font-medium">Retrieving Profile Workspace...</p>
        </div>
      </div>
    );
  }

  const strengthInfo = getPasswordStrength(newPassword);

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      <Sidebar activeTab="profile" />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 md:px-8 z-10 sticky top-0">
          <h2 className="text-xl text-slate-800 font-semibold">User Profile Workspace</h2>
          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-4 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            Profile Secure
          </span>
        </header>

        {/* Dashboard Grid */}
        <main className="flex-1 p-6 md:p-8 space-y-8 max-w-[1600px] w-full mx-auto">
          
          {/* Header Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-6">
            <div className="relative group shrink-0">
              <div className="w-24 h-24 rounded-full border border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center relative">
                {profileData?.profileImageUrl ? (
                  <img 
                    src={getAvatarUrl(profileData.profileImageUrl)} 
                    alt="Profile Avatar" 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <span className="text-3xl font-bold text-slate-400">
                    {profileData?.fullName ? profileData.fullName[0].toUpperCase() : "U"}
                  </span>
                )}

                {isUploadingAvatar && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <RefreshCw className="text-white animate-spin" size={24} />
                  </div>
                )}
              </div>

              <label className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center cursor-pointer shadow-md transition-colors border-2 border-white">
                <ImageIcon size={14} />
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
              <h3 className="text-2xl font-bold text-slate-800 truncate">{profileData?.fullName}</h3>
              <p className="text-slate-500 font-medium text-sm mt-0.5">{profileData?.email}</p>
              <div className="flex flex-wrap gap-2 items-center justify-center md:justify-start mt-3">
                <span className="bg-blue-50 text-blue-800 border border-blue-100 px-3 py-0.5 rounded-full text-xs font-semibold">
                  Role: {profileData?.role}
                </span>
                <span className={`px-3 py-0.5 rounded-full text-xs font-semibold border ${
                  profileData?.verified 
                    ? "bg-emerald-50 text-emerald-800 border-emerald-100" 
                    : "bg-amber-50 text-amber-800 border-amber-100"
                }`}>
                  {profileData?.verified ? "Verified" : "Unverified"}
                </span>
                <span className="bg-slate-50 text-slate-600 border border-slate-100 px-3 py-0.5 rounded-full text-xs font-semibold">
                  Provider: {profileData?.oauthProvider}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex border-b border-slate-200 gap-6">
            <button 
              onClick={() => setActiveSubTab("overview")}
              className={`pb-4 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
                activeSubTab === "overview" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              Overview
            </button>
            <button 
              onClick={() => setActiveSubTab("edit")}
              className={`pb-4 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
                activeSubTab === "edit" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              Edit Details
            </button>
            {profileData?.oauthProvider === "LOCAL" && (
              <button 
                onClick={() => setActiveSubTab("password")}
                className={`pb-4 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
                  activeSubTab === "password" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                Change Password
              </button>
            )}
            <button 
              onClick={() => setActiveSubTab("security")}
              className={`pb-4 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
                activeSubTab === "security" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              Security Settings
            </button>
          </div>

          {/* Sub-Tab Content Rendering */}
          <div className="grid grid-cols-1 gap-8">
            
            {activeSubTab === "overview" && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                <h4 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
                  <User size={18} className="text-blue-600" />
                  Account Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                  <div>
                    <span className="text-slate-400 font-medium block">Full Name</span>
                    <span className="text-slate-800 font-semibold mt-1 block">{profileData?.fullName || "Not Specified"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Email Address</span>
                    <span className="text-slate-800 font-semibold mt-1 block">{profileData?.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Phone Number</span>
                    <span className="text-slate-800 font-semibold mt-1 block">{profileData?.phone || "Not Specified"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Access Role</span>
                    <span className="text-slate-800 font-semibold mt-1 block">{profileData?.role}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Registration Date</span>
                    <span className="text-slate-800 font-semibold mt-1 block">
                      {profileData?.createdAt ? new Date(profileData.createdAt).toLocaleDateString() : "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Last Updated</span>
                    <span className="text-slate-800 font-semibold mt-1 block">
                      {profileData?.updatedAt ? new Date(profileData.updatedAt).toLocaleString() : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeSubTab === "edit" && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h4 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2 mb-6">
                  <User size={18} className="text-blue-600" />
                  Edit Profile Fields
                </h4>
                <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-xl">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 block">Full Name</label>
                    <input 
                      type="text" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-slate-800 font-medium transition-shadow"
                      placeholder="e.g. John Doe"
                      disabled={isSaving}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 block">Phone Number</label>
                    <input 
                      type="text" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-slate-800 font-medium transition-shadow"
                      placeholder="e.g. +123456789"
                      disabled={isSaving}
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer shadow-md disabled:bg-blue-400"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw className="animate-spin" size={16} />
                        Saving Changes...
                      </>
                    ) : (
                      "Save Details"
                    )}
                  </button>
                </form>
              </div>
            )}

            {activeSubTab === "password" && profileData?.oauthProvider === "LOCAL" && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h4 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2 mb-6">
                  <Key size={18} className="text-blue-600" />
                  Change Local Password
                </h4>
                <form onSubmit={handleChangePassword} className="space-y-6 max-w-xl">
                  
                  {/* Current Password */}
                  <div className="space-y-2 relative">
                    <label className="text-sm font-semibold text-slate-700 block">Current Password</label>
                    <div className="relative">
                      <input 
                        type={showCurrentPassword ? "text" : "password"} 
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full pl-4 pr-12 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-slate-800 font-medium transition-shadow"
                        placeholder="••••••••"
                        disabled={isSaving}
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="space-y-2 relative">
                    <label className="text-sm font-semibold text-slate-700 block">New Password</label>
                    <div className="relative">
                      <input 
                        type={showNewPassword ? "text" : "password"} 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-4 pr-12 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-slate-800 font-medium transition-shadow"
                        placeholder="••••••••"
                        disabled={isSaving}
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {/* Password Strength indicator bar */}
                    {newPassword && (
                      <div className="mt-2 space-y-1">
                        <div className="flex justify-between items-center text-xs font-semibold">
                          <span className="text-slate-500">Strength:</span>
                          <span className={`${
                            strengthInfo.label === "Weak" ? "text-red-500" :
                            strengthInfo.label === "Fair" ? "text-amber-500" :
                            strengthInfo.label === "Good" ? "text-blue-500" : "text-emerald-600"
                          }`}>{strengthInfo.label}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full transition-all duration-300 ${strengthInfo.color}`}
                            style={{ width: `${strengthInfo.percent}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2 relative">
                    <label className="text-sm font-semibold text-slate-700 block">Confirm New Password</label>
                    <div className="relative">
                      <input 
                        type={showConfirmPassword ? "text" : "password"} 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-4 pr-12 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-slate-800 font-medium transition-shadow"
                        placeholder="••••••••"
                        disabled={isSaving}
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer shadow-md disabled:bg-blue-400"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw className="animate-spin" size={16} />
                        Changing Password...
                      </>
                    ) : (
                      "Change Password"
                    )}
                  </button>
                </form>
              </div>
            )}

            {activeSubTab === "security" && (
              <div className="space-y-8">
                {/* Security Status Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Account Verification Details Card */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <h4 className="text-lg font-bold text-slate-800 pb-3 border-b border-slate-100 flex items-center gap-2">
                        <Lock size={18} className="text-blue-600" />
                        Account Security Info
                      </h4>
                      <div className="mt-4 space-y-3 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 font-medium">Provider Type</span>
                          <span className="text-slate-800 font-semibold flex items-center gap-1.5">
                            <Globe size={16} className="text-slate-500" />
                            {securityData?.oauthProvider}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 font-medium">Verification Status</span>
                          <span className={`font-semibold flex items-center gap-1.5 ${
                            securityData?.verified ? "text-emerald-600" : "text-amber-600"
                          }`}>
                            <CheckCircle2 size={16} />
                            {securityData?.verified ? "Email Verified" : "Verification Required"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 font-medium">Password Last Changed</span>
                          <span className="text-slate-800 font-semibold">
                            {securityData?.lastPasswordChanged 
                              ? new Date(securityData.lastPasswordChanged).toLocaleDateString()
                              : "Never"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Future Multi-Factor Authentication Block */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start pb-3 border-b border-slate-100">
                        <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                          <Smartphone size={18} className="text-blue-600" />
                          Two-Factor Authentication (2FA)
                        </h4>
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold">MOCK</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-3 leading-relaxed">
                        Add an extra layer of protection to your profile workspace. Once configured, you will need to enter a confirmation token sent to your device.
                      </p>
                    </div>
                    <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-100">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Status: Disabled</span>
                      <button className="px-4 py-2 bg-slate-100 text-slate-600 font-semibold text-xs rounded-lg cursor-not-allowed">
                        Setup 2FA
                      </button>
                    </div>
                  </div>
                </div>

                {/* Audit & Log Details Table */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-6">
                    <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <History size={18} className="text-blue-600" />
                      Login Sessions Audit (Mocked)
                    </h4>
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold">MOCK</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-400">
                          <th className="pb-3 font-semibold">Device / Browser</th>
                          <th className="pb-3 font-semibold">IP Address</th>
                          <th className="pb-3 font-semibold">Location</th>
                          <th className="pb-3 font-semibold">Last Active</th>
                          <th className="pb-3 font-semibold text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                        <tr>
                          <td className="py-4">Windows / Chrome (124.0)</td>
                          <td className="py-4">192.168.1.45</td>
                          <td className="py-4">Localhost</td>
                          <td className="py-4">Just now</td>
                          <td className="py-4 text-right text-emerald-600 font-bold">Active Session</td>
                        </tr>
                        <tr>
                          <td className="py-4">iPhone / Mobile Safari</td>
                          <td className="py-4">172.56.24.12</td>
                          <td className="py-4">Mumbai, India</td>
                          <td className="py-4">2 hours ago</td>
                          <td className="py-4 text-right text-slate-400">Disconnected</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
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
