import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import authApi from "../api/authApi";

const EmailVerificationPending = () => {
    const location = useLocation();
    const email = location.state?.email || "";
    
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    const handleResend = async () => {
        if (!email) {
            setErrorMsg("Email address was not provided. Please go back and try registering again.");
            return;
        }

        setIsLoading(true);
        setErrorMsg("");
        setSuccessMsg("");

        try {
            const data = await authApi.resendVerification(email);
            setSuccessMsg(data.message || "A new verification link has been sent to your email address.");
        } catch (error) {
            console.error("Resend Verification error:", error);
            setErrorMsg(
                error.response?.data?.message || 
                "Could not connect to the verification server. Please try again."
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-surface text-on-background min-h-screen overflow-x-hidden font-sans">
            <main className="flex min-h-screen">
                {/* Left Side: Branding & Illustration */}
                <section className="hidden md:flex w-1/2 flex-col justify-between p-10 mesh-gradient-bg relative overflow-hidden">
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
                            <h1 className="text-2xl text-gradient font-bold tracking-tight">StockMaster</h1>
                        </div>
                    </div>

                    {/* Illustration Container */}
                    <div className="flex-grow flex flex-col justify-center items-center relative z-10 py-12">
                        <div className="w-full max-w-xl transition-transform duration-700 hover:scale-[1.02]">
                            <img
                                alt="Verification Pending Illustration"
                                className="w-full h-auto drop-shadow-2xl"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA8oV4Q-QtqEdGldbQFoFUundwFLPafnehW76udNrtKf8bB_89J9_wkCb1bB1-Lt9q5vr3lzTglsrFcUioLb8o9GghXOHnVVbqtUAwLR9bEu6uDTCUp2GcKxdp6N2uoe2nnhNM8qXxxwcU5z0x4ZaEUhf8Yk03VH4Jkaww9Kk0uk4bZqDEVmUHqwrpcgVOsdt2PToPJppxkH0K3M3AESoQJyMPRAUADhZEyYftDM7MCN8UVfgAGLMTN"
                            />
                        </div>
                        <div className="mt-8 text-center max-w-md">
                            <h2 className="text-3xl text-on-surface mb-2 font-bold">Verify Your Identity</h2>
                            <p className="text-lg text-on-surface-variant">
                                We have sent a verification link to your registered email address. Please click the link to activate your account.
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

                {/* Right Side: Flow Detail & Control */}
                <section className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-10 bg-white">
                    <div className="w-full max-w-[420px] animate-fade-in text-center md:text-left">
                        {/* Mobile Logo */}
                        <div className="md:hidden flex items-center justify-center gap-2 mb-8">
                            <div className="w-8 h-8 bg-premium-gradient rounded flex items-center justify-center shadow-sm">
                                <span className="material-symbols-outlined text-on-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                                    inventory_2
                                </span>
                            </div>
                            <span className="text-xl text-gradient font-bold">StockMaster</span>
                        </div>

                        <div className="mb-8">
                            <span className="material-symbols-outlined text-primary text-6xl mb-4 block md:inline-block">
                                mark_email_read
                            </span>
                            <h3 className="text-3xl text-on-surface mb-2 font-bold">Verification Sent!</h3>
                            <p className="text-base text-on-surface-variant">
                                An email has been sent to <strong className="text-on-surface font-semibold">{email || "your email address"}</strong>.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <p className="text-sm text-on-surface-variant leading-relaxed">
                                Please check your inbox (and spam/junk folder) and click the link to verify your email. The link is valid for 24 hours.
                            </p>

                            <button
                                className="w-full premium-gradient text-white text-sm font-medium py-4 rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-4 group disabled:opacity-75 disabled:pointer-events-none"
                                onClick={handleResend}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin text-base">sync</span>
                                        <span>Resending Link...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Resend Verification Link</span>
                                        <span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">send</span>
                                    </>
                                )}
                            </button>

                            {/* Success message */}
                            {successMsg && (
                                <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-start gap-4 text-left animate-fade-in">
                                    <span className="material-symbols-outlined text-green-600">check_circle</span>
                                    <p className="text-sm font-medium">{successMsg}</p>
                                </div>
                            )}

                            {/* Error message */}
                            {errorMsg && (
                                <div className="p-4 bg-error-container border border-error/20 text-on-error-container rounded-xl flex items-start gap-4 text-left animate-fade-in">
                                    <span className="material-symbols-outlined text-error">error</span>
                                    <p className="text-sm font-medium">{errorMsg}</p>
                                </div>
                            )}
                        </div>

                        {/* Back to Login Footer */}
                        <div className="mt-10 pt-8 border-t border-outline-variant/30 flex flex-col items-center gap-6">
                            <p className="text-base text-on-surface-variant">
                                Back to{" "}
                                <Link className="text-primary font-bold hover:underline decoration-2 underline-offset-4 transition-all" to="/login">
                                    Login Screen
                                </Link>
                            </p>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default EmailVerificationPending;
