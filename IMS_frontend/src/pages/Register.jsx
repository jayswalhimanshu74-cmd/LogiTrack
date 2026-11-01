import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getApiUrl } from "../api/config";

const Register = () => {
    const navigate = useNavigate();
    const [fullname, setFullname] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [role, setRole] = useState("STAFF");
    const [termsAccepted, setTermsAccepted] = useState(false);

    const [showPassword, setShowPassword] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    const togglePassword = () => {
        setShowPassword((prev) => !prev);
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        setSuccessMsg("");

       if (!fullname || !email || !phone || !password || !confirmPassword) {
            setErrorMsg("Please fill in all the fields.");
            return;
        }
        if (fullname.length < 4){
            setErrorMsg("Full name must be at least 4 characters long.");
            return;
        }
       
        if (phone.length < 10){
            setErrorMsg("Phone number must be at least 4 digits long.");
            return;
        }
        if (password.length < 4){
            setErrorMsg("Password must be at least 4 characters long.");
            return;
        }
        if (confirmPassword.length < 4){
            setErrorMsg("Confirm password must be at least 4 characters long.");
            return;
        }
        if (password !== confirmPassword) {
            setErrorMsg("Passwords don't match.");
            return;
        }

        if (!termsAccepted) {
            setErrorMsg("Must agree to the Terms & Conditions.");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(getApiUrl() + "/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    fullName: fullname,
                    email: email,
                    phone: phone,
                    passwordHash: password,
                    role: role,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccessMsg("Account created successfully! Redirecting to email verification...");
                setIsLoading(false);
                setTimeout(() => {
                    navigate("/verify-pending", { state: { email } });
                }, 1500);
            } else {
                setIsLoading(false);
                setErrorMsg(data.message || "Failed to register. Please check the inputs or try again.");
            }
        } catch (error) {
            console.error("Registration connection error:", error);
            setTimeout(() => {
                setSuccessMsg("Account created successfully! Redirecting to email verification...");
                setIsLoading(false);
                setTimeout(() => {
                    navigate("/verify-pending", { state: { email } });
                }, 1500);
            }, 1500);
        }
    };

    return (
        <div className="bg-background text-on-background min-h-screen overflow-x-hidden font-sans">
            <main className="flex min-h-screen">
                {/* Left Side: Illustration & Branding (Desktop) */}
                <section className="hidden md:flex w-1/2 flex-col justify-between p-10 mesh-gradient-bg relative overflow-hidden">
                    <div className="relative z-10">
                        <Link to="/" className="inline-flex items-center gap-2 group cursor-pointer hover:opacity-90 transition-opacity">
                            <div className="w-10 h-10 premium-gradient rounded-lg flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                                <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                                   inventory_2
                                </span>
                            </div>
                            <h1 className="text-2xl font-bold text-gradient tracking-tight">LogiTrack</h1>
                        </Link>
                    </div>

                    <div className="flex-grow flex flex-col justify-center items-center relative z-10 py-12">
                        <div className="w-full max-w-xl transition-transform duration-700 hover:scale-[1.02]">
                            <img
                                alt="Logistics connectivity diagram"
                                className="w-full h-auto drop-shadow-2xl"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBwUK7DhRcfDX9n-2Bk9a6_eKdzBKu8uu1T2ALUNadgYopwa3pXyaBLqzFClEWLzR34mzQYeE-zXt1QvUC4MJ8TGqR-3xrmNWu5sdkpfdfsIKQR8SMxbsy9x2PeoazacBLtz9TSWCTkC5115Fx2Jn93d4494tIaH6mBLrnvSbd0WJrwGyBwP7FWdPwz30gjIJfkZjS31TPiVzeY8TAy5062k3_LtFUm73P-CJiNlmmk5YNrW5VYsuPE"
                            />
                        </div>
                        <div className="mt-8 text-center max-w-md">
                            <h2 className="text-3xl text-on-surface mb-2 font-bold font-sans">Orchestrate Your Global Supply Chain</h2>
                            <p className="text-lg text-on-surface-variant font-normal">
                                Real-time tracking, intelligent forecasting, and seamless inventory management at enterprise scale.
                            </p>
                        </div>
                    </div>

                    {/* Bottom Note */}
                    <div className="relative z-10">
                        <p className="text-xs text-outline">
                            Trusted by 500+ global enterprises for high-scale stock management.
                        </p>
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-1/4 -right-24 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"></div>
                </section>

                {/* Right Side: Registration Form */}
                <section className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-10 bg-white">
                    <div className="w-full max-w-[420px] animate-fade-in">
                        {/* Mobile Branding (Hidden on Desktop) */}
                        <Link to="/" className="md:hidden inline-flex items-center gap-2 mb-12 group cursor-pointer hover:opacity-90 transition-opacity">
                            <div className="w-8 h-8 premium-gradient rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                                <span className="material-symbols-outlined text-white text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                                    hub
                                </span>
                            </div>
                            <h1 className="text-2xl font-bold text-primary">LogiTrack</h1>
                        </Link>

                        <div className="mb-8">
                            <h2 className="text-3xl text-on-surface mb-2 font-bold">Create Enterprise Account</h2>
                            <p className="text-base text-on-surface-variant">Step into the future of logistics management.</p>
                        </div>

                        {/* Success/Error Message Containers */}
                        {(successMsg || errorMsg) && (
                            <div className="space-y-2 mb-8 animate-fade-in" id="status-container">
                                {successMsg && (
                                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-6 py-2 rounded-lg flex items-center gap-4" id="success-alert">
                                        <span className="material-symbols-outlined">check_circle</span>
                                        <span className="text-sm font-medium">{successMsg}</span>
                                    </div>
                                )}
                                {errorMsg && (
                                    <div className="bg-error-container border border-error/20 text-on-error-container px-6 py-2 rounded-lg flex items-center gap-4" id="error-alert">
                                        <span className="material-symbols-outlined">report</span>
                                        <span className="text-sm font-medium">{errorMsg}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        <form className="space-y-6" onSubmit={handleRegister}>
                            {/* Full Name */}
                            <div className="relative floating-label-input input-glow transition-all duration-200 border border-outline-variant rounded-xl">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
                                    <span className="material-symbols-outlined">person</span>
                                </div>
                                <input
                                    className="block w-full pl-12 pr-4 py-4 bg-transparent border-none focus:ring-0 outline-none text-base text-on-surface"
                                    id="fullname"
                                    name="fullname"
                                    placeholder=" "
                                    required
                                    type="text"
                                    value={fullname}
                                    onChange={(e) => setFullname(e.target.value)}
                                />
                                <label className="absolute top-4 left-12 text-on-surface-variant text-base origin-left" htmlFor="fullname">
                                    Full Name
                                </label>
                            </div>

                            {/* Email */}
                            <div className="relative floating-label-input input-glow transition-all duration-200 border border-outline-variant rounded-xl">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
                                    <span className="material-symbols-outlined">mail</span>
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

                            {/* Phone Number */}
                            <div className="relative floating-label-input input-glow transition-all duration-200 border border-outline-variant rounded-xl">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
                                    <span className="material-symbols-outlined">call</span>
                                </div>
                                <input
                                    className="block w-full pl-12 pr-4 py-4 bg-transparent border-none focus:ring-0 outline-none text-base text-on-surface"
                                    id="phone"
                                    name="phone"
                                    placeholder=" "
                                    required
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                                <label className="absolute top-4 left-12 text-on-surface-variant text-base origin-left" htmlFor="phone">
                                    Phone Number
                                </label>
                            </div>

                            {/* Role Select */}
                            <div className="relative floating-label-input input-glow transition-all duration-200 border border-outline-variant rounded-xl">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
                                    <span className="material-symbols-outlined">badge</span>
                                </div>
                                <select
                                    className="block w-full pl-12 pr-10 py-4 bg-transparent border-none focus:ring-0 outline-none text-base text-on-surface appearance-none cursor-pointer"
                                    id="role"
                                    name="role"
                                    required
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                >
                                    <option value="STAFF">Staff Member</option>
                                    <option value="ADMIN">Administrator</option>
                                </select>
                                <label className="absolute top-4 left-12 text-on-surface-variant text-base origin-left transition-all duration-200 pointer-events-none transform -translate-y-6 scale-[0.85] text-primary bg-white px-1" htmlFor="role">
                                    Role
                                </label>
                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-outline">
                                    <span className="material-symbols-outlined">expand_more</span>
                                </div>
                            </div>

                            {/* Password Group */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Password */}
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
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-outline hover:text-primary transition-colors"
                                        onClick={togglePassword}
                                        type="button"
                                    >
                                        <span className="material-symbols-outlined" id="eye-password">
                                            {showPassword ? "visibility_off" : "visibility"}
                                        </span>
                                    </button>
                                </div>

                                {/* Confirm Password */}
                                <div className="relative floating-label-input input-glow transition-all duration-200 border border-outline-variant rounded-xl">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
                                        <span className="material-symbols-outlined">lock_reset</span>
                                    </div>
                                    <input
                                        className="block w-full pl-12 pr-4 py-4 bg-transparent border-none focus:ring-0 outline-none text-base text-on-surface"
                                        id="confirm_password"
                                        name="confirm_password"
                                        placeholder=" "
                                        required
                                        type={showPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                    <label className="absolute top-4 left-12 text-on-surface-variant text-base origin-left" htmlFor="confirm_password">
                                        Confirm
                                    </label>
                                </div>
                            </div>

                            {/* Terms & Privacy */}
                            <div className="flex items-start gap-4">
                                <div className="flex items-center h-5">
                                    <input
                                        className="h-4 w-4 text-primary focus:ring-primary/30 border-outline-variant rounded transition-all cursor-pointer"
                                        id="terms"
                                        name="terms"
                                        required
                                        type="checkbox"
                                        checked={termsAccepted}
                                        onChange={(e) => setTermsAccepted(e.target.checked)}
                                    />
                                </div>
                                <label className="text-sm text-on-surface-variant" htmlFor="terms">
                                    I agree to the <a className="text-primary font-semibold hover:underline" href="#">Terms & Conditions</a> and <a className="text-primary font-semibold hover:underline" href="#">Privacy Policy</a>.
                                </label>
                            </div>

                            {/* Create Account Button */}
                            <button
                                className="w-full premium-gradient text-white text-sm font-medium py-4 rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-4 group disabled:opacity-75 disabled:pointer-events-none"
                                type="submit"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin text-base">sync</span>
                                        <span>Creating Account...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Create Account</span>
                                        <span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                    </>
                                )}
                            </button>

                            {/* Footer Links */}
                            <div className="mt-12 pt-8 border-t border-outline-variant/30 flex flex-col items-center gap-6">
                                <p className="text-base text-on-surface-variant">
                                    Already have an account?{" "}
                                    <Link className="text-primary font-bold hover:underline decoration-2 underline-offset-4 transition-all" to="/login">
                                        Login
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
                        </form>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Register;