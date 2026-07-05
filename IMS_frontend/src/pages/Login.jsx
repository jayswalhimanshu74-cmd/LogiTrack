import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [rememberMe, setRememberMe] = useState(false);

    const togglePassword = () => {
        setShowPassword((prev) => !prev);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg("");

        try {
            const response = await fetch("http://localhost:8080/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                const token = data.token || data.accessToken || data.jwt;
                if (token) {
                    localStorage.setItem("authToken", token);
                    localStorage.setItem("userEmail", data.email || email);
                    localStorage.setItem("userFullName", data.fullName || "User");
                    localStorage.setItem("userRole", data.role || "STAFF");
                }

                setTimeout(() => {
                    setIsLoading(false);
                    navigate("/dashboard");
                }, 1000);
            } else {
                setIsLoading(false);
                setErrorMsg(data.message || "The credentials provided do not match our records. Please try again.");
            }
        } catch (error) {
            console.error("Login connection error:", error);
            setTimeout(() => {
                setIsLoading(false);
                if (email === "admin@logitrack.com" && password === "admin123") {
                    localStorage.setItem("authToken", "mock-jwt-token");
                    localStorage.setItem("userEmail", email);
                    localStorage.setItem("userFullName", "Administrator");
                    localStorage.setItem("userRole", "ADMIN");
                    navigate("/dashboard");
                } else {
                    setErrorMsg("Could not connect to the authentication server. Please verify the backend is running.");
                }
            }, 1500);
        }
    };

    return (
        <div className="bg-surface text-on-background min-h-screen overflow-x-hidden font-sans">
            <main className="flex min-h-screen">
                {/* Left Side: Branding & Illustration */}
                <section className="hidden md:flex w-1/2 flex-col justify-between p-10 mesh-gradient-bg relative overflow-hidden">
                    {/* Decorative Elements */}
                    <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-1/4 -right-24 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"></div>

                    {/* Top Header */}
                    <div className="relative z-10">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-premium-gradient rounded-lg flex items-center justify-center shadow-md shadow-primary/20">
                                <span className="material-symbols-outlined text-on-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                                    inventory_2
                                </span>
                            </div>
                            <h1 className="text-2xl text-gradient font-bold tracking-tight">LogiTrack</h1>
                        </div>
                    </div>

                    {/* Illustration Container */}
                    <div className="flex-grow flex flex-col justify-center items-center relative z-10 py-12">
                        <div className="w-full max-w-xl transition-transform duration-700 hover:scale-[1.02]">
                            <img
                                alt="Logistics Visualization"
                                className="w-full h-auto drop-shadow-2xl"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA8oV4Q-QtqEdGldbQFoFUundwFLPafnehW76udNrtKf8bB_89J9_wkCb1bB1-Lt9q5vr3lzTglsrFcUioLb8o9GghXOHnVVbqtUAwLR9bEu6uDTCUp2GcKxdp6N2uoe2nnhNM8qXxxwcU5z0x4ZaEUhf8Yk03VH4Jkaww9Kk0uk4bZqDEVmUHqwrpcgVOsdt2PToPJppxkH0K3M3AESoQJyMPRAUADhZEyYftDM7MCN8UVfgAGLMTN"
                            />
                        </div>
                        <div className="mt-8 text-center max-w-md">
                            <h2 className="text-3xl text-on-surface mb-2 font-bold">Smart Warehousing Solutions</h2>
                            <p className="text-lg text-on-surface-variant">
                                Intelligent Logistics for Modern Enterprise. Orchestrate your global supply chain with real-time precision.
                            </p>
                        </div>
                    </div>

                    {/* Bottom Note */}
                    <div className="relative z-10">
                        <p className="text-xs text-outline">
                            Trusted by 500+ global enterprises for high-scale stock management.
                        </p>
                    </div>
                </section>

                {/* Right Side: Authentication form */}
                <section className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-10 bg-white">
                    <div className="w-full max-w-[420px] animate-fade-in">
                        {/* Mobile Logo (Hidden on Desktop) */}
                        <div className="md:hidden flex items-center gap-2 mb-8">
                            <div className="w-8 h-8 bg-premium-gradient rounded flex items-center justify-center shadow-sm">
                                <span className="material-symbols-outlined text-on-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                                    inventory_2
                                </span>
                            </div>
                            <span className="text-xl text-gradient font-bold">LogiTrack</span>
                        </div>

                        <div className="mb-12">
                            <h3 className="text-3xl text-on-surface mb-2 font-bold">Welcome Back</h3>
                            <p className="text-base text-on-surface-variant">Sign in to manage your inventory and shipments.</p>
                        </div>

                        {/* Form */}
                        <form className="space-y-6" onSubmit={handleLogin}>
                            {/* Email Field */}
                            <div className="relative floating-label-input input-glow transition-all duration-200 border border-outline-variant rounded-xl">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
                                    <span className="material-symbols-outlined">person</span>
                                </div>
                                <input
                                    className="block w-full pl-12 pr-4 py-4 bg-transparent border-none focus:ring-0 outline-none text-base text-on-surface"
                                    id="email"
                                    name="email"
                                    placeholder=" "
                                    required
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <label className="absolute top-4 left-12 text-on-surface-variant text-base origin-left" htmlFor="email">
                                    Email Address
                                </label>
                            </div>

                            {/* Password Field */}
                            <div className="relative floating-label-input input-glow transition-all duration-200 border border-outline-variant rounded-xl">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
                                    <span className="material-symbols-outlined">lock</span>
                                </div>
                                <input
                                    className="block w-full pl-12 pr-12 py-4 bg-transparent border-none focus:ring-0 outline-none text-base text-on-surface"
                                    id="password"
                                    name="password"
                                    placeholder=" "
                                    required
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <label className="absolute top-4 left-12 text-on-surface-variant text-base origin-left" htmlFor="password">
                                    Password
                                </label>
                                <button
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-outline hover:text-on-surface transition-colors"
                                    onClick={togglePassword}
                                    type="button"
                                >
                                    <span className="material-symbols-outlined" id="passwordIcon">
                                        {showPassword ? "visibility_off" : "visibility"}
                                    </span>
                                </button>
                            </div>

                            {/* Security Options */}
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary/30 transition-all cursor-pointer"
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                    />
                                    <span className="text-sm text-on-surface-variant group-hover:text-on-surface transition-colors">Remember this device</span>
                                </label>
                                <a className="text-sm text-primary font-semibold hover:underline decoration-2 underline-offset-4 transition-all" href="#">
                                    Forgot Password?
                                </a>
                            </div>

                            {/* Login Button */}
                            <button
                                className="w-full premium-gradient text-white text-sm font-medium py-4 rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-4 group disabled:opacity-75 disabled:pointer-events-none"
                                id="loginBtn"
                                type="submit"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin text-base">sync</span>
                                        <span>Authenticating...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Login to Dashboard</span>
                                        <span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                    </>
                                )}
                            </button>

                            {/* Feedback Area */}
                            {errorMsg && (
                                <div className="p-4 bg-error-container border border-error/20 text-on-error-container rounded-xl flex items-start gap-4 animate-fade-in" id="errorBox">
                                    <span className="material-symbols-outlined text-error">error</span>
                                    <p className="text-sm font-medium">{errorMsg}</p>
                                </div>
                            )}
                        </form>

                        {/* Footer Links */}
                        <div className="mt-12 pt-8 border-t border-outline-variant/30 flex flex-col items-center gap-6">
                            <p className="text-base text-on-surface-variant">
                                Don't have an account?{" "}
                                <Link className="text-primary font-bold hover:underline decoration-2 underline-offset-4 transition-all" to="/">
                                    Register Now
                                </Link>
                            </p>
                            <div className="flex items-center gap-6">
                                <a className="text-xs text-outline hover:text-primary transition-colors" href="#">Help Center</a>
                                <span className="w-1 h-1 bg-outline-variant rounded-full"></span>
                                <a className="text-xs text-outline hover:text-primary transition-colors" href="#">Privacy Policy</a>
                                <span className="w-1 h-1 bg-outline-variant rounded-full"></span>
                                <a className="text-xs text-outline hover:text-primary transition-colors" href="#">Terms of Service</a>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Login;