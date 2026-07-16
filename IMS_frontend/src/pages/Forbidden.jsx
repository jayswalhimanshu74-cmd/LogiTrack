import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const Forbidden = () => {
  const navigate = useNavigate();
  const { role, email } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans">
      {/* Background decorative circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 text-center max-w-lg w-full">
        {/* 403 number */}
        <div className="relative mb-8">
          <span
            className="text-[160px] font-black leading-none select-none"
            style={{
              background: "linear-gradient(135deg, #ef4444 0%, #dc2626 40%, #991b1b 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              filter: "drop-shadow(0 0 40px rgba(239,68,68,0.3))",
            }}
          >
            403
          </span>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-48 h-48 border border-red-500/10 rounded-full animate-ping" />
          </div>
        </div>

        {/* Lock icon */}
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <span
              className="material-symbols-outlined text-red-400 text-4xl select-none"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              lock
            </span>
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">
          Access Denied
        </h1>
        <p className="text-slate-400 text-base mb-2 leading-relaxed">
          You don&apos;t have permission to access this page.
        </p>

        {/* Role badge */}
        {role && (
          <div className="inline-flex items-center gap-2 bg-slate-800/60 border border-slate-700/50 rounded-full px-4 py-2 mb-8">
            <span className="material-symbols-outlined text-slate-400 text-sm select-none">
              badge
            </span>
            <span className="text-slate-300 text-sm font-medium">
              Your role:{" "}
              <span
                className={`font-bold ${
                  role === "ADMIN"
                    ? "text-violet-400"
                    : role === "MANAGER"
                    ? "text-blue-400"
                    : "text-emerald-400"
                }`}
              >
                {role}
              </span>
            </span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            id="forbidden-back-btn"
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-slate-200 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <span className="material-symbols-outlined text-base select-none">arrow_back</span>
            Go Back
          </button>
          <button
            id="forbidden-dashboard-btn"
            onClick={() => navigate("/dashboard")}
            className="flex items-center justify-center gap-2 px-6 py-3 text-white rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-lg"
            style={{
              background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
              boxShadow: "0 4px 15px rgba(99,102,241,0.3)",
            }}
          >
            <span className="material-symbols-outlined text-base select-none">dashboard</span>
            Return to Dashboard
          </button>
        </div>

        {/* Footer note */}
        <p className="mt-10 text-xs text-slate-600">
          Logged in as{" "}
          <span className="text-slate-500 font-medium">{email || "unknown"}</span>
          {" · "}
          Contact your administrator to request access.
        </p>
      </div>
    </div>
  );
};

export default Forbidden;
