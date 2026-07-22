import { useEffect, useState, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import authApi from "../api/authApi";

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");

    const [status, setStatus] = useState("verifying"); // verifying, success, error
    const [errorMsg, setErrorMsg] = useState("");
    const [resendEmail, setResendEmail] = useState("");
    const [resendSuccess, setResendSuccess] = useState("");
    const [resendLoading, setResendLoading] = useState(false);

    // Prevent double verification on double-renders in React StrictMode
    const verificationTriggered = useRef(false);

    useEffect(() => {
        const performVerification = async () => {
            if (!token) {
                setStatus("error");
                setErrorMsg("No verification token was provided in the URL.");
                return;
            }

            try {
                await authApi.verifyEmail(token);
                setStatus("success");
            } catch (error) {
                console.error("Verification error:", error);
                setStatus("error");
                setErrorMsg(
                    error.response?.data?.message ||
                    "The verification link is invalid or has expired."
                );
            }
        };

        if (!verificationTriggered.current) {
            verificationTriggered.current = true;
            performVerification();
        }
    }, [token]);

    const handleResend = async (e) => {
        e.preventDefault();
        if (!resendEmail) {
            setErrorMsg("Please enter your email to receive a new link.");
            return;
        }

        setResendLoading(true);
        setErrorMsg("");
        setResendSuccess("");

        try {
            const data = await authApi.resendVerification(resendEmail);
            setResendSuccess(data.message || "A new verification link has been sent!");
        } catch (error) {
            console.error("Resend Verification error:", error);
            setErrorMsg(
                error.response?.data?.message ||
                "Could not request a new verification link. Please try again."
            );
        } finally {
            setResendLoading(false);
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
                                alt="Verification Illustration"
                                className="w-full h-auto drop-shadow-2xl"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA8oV4Q-QtqEdGldbQFoFUundwFLPafnehW76udNrtKf8bB_89J9_wkCb1bB1-Lt9q5vr3lzTglsrFcUioLb8o9GghXOHnVVbqtUAwLR9bEu6uDTCUp2GcKxdp6N2uoe2nnhNM8qXxxwcU5z0x4ZaEUhf8Yk03VH4Jkaww9Kk0uk4bZqDEVmUHqwrpcgVOsdt2PToPJppxkH0K3M3AESoQJyMPRAUADhZEyYftDM7MCN8UVfgAGLMTN"
                            />
                        </div>
                        <div className="mt-8 text-center max-w-md">
                            <h2 className="text-3xl text-on-surface mb-2 font-bold">Account Verification</h2>
                            <p className="text-lg text-on-surface-variant">
                                Confirming your email secures your credentials and unlocks complete dashboard access.
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

                {/* Right Side: Status Detail */}
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

                        {status === "verifying" && (
                            <div className="space-y-6 py-8 text-center">
                                <span className="material-symbols-outlined text-primary text-6xl animate-spin block">
                                    sync
                                </span>
                                <h3 className="text-2xl text-on-surface font-bold">Verifying Your Email...</h3>
                                <p className="text-base text-on-surface-variant">
                                    We are contacting the server to verify your activation token.
                                </p>
                            </div>
                        )}

                        {status === "success" && (
                            <div className="space-y-6 py-4">
                                <span className="material-symbols-outlined text-green-500 text-6xl block md:inline-block">
                                    verified_user
                                </span>
                                <h3 className="text-3xl text-on-surface font-bold">Success!</h3>
                                <p className="text-base text-on-surface-variant">
                                    Your email has been successfully verified. You can now log into your StockMaster account.
                                </p>

                                <Link
                                    className="w-full premium-gradient text-white text-sm font-medium py-4 rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-4 group"
                                    to="/login"
                                >
                                    <span>Proceed to Login</span>
                                    <span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                </Link>
                            </div>
                        )}

                        {status === "error" && (
                            <div className="space-y-6">
                                <span className="material-symbols-outlined text-error text-6xl block md:inline-block">
                                    gpp_bad
                                </span>
                                <h3 className="text-3xl text-on-surface font-bold">Verification Failed</h3>
                                <p className="text-base text-on-surface-variant">
                                    {errorMsg || "We were unable to verify your email. The token might have expired or is invalid."}
                                </p>

                                <div className="border-t border-outline-variant/30 pt-6">
                                    <h4 className="text-base text-on-surface mb-4 font-semibold">Resend Verification Email</h4>

                                    <form onSubmit={handleResend} className="space-y-4">
                                        <div className="relative floating-label-input input-glow transition-all duration-200 border border-outline-variant rounded-xl text-left">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
                                                <span className="material-symbols-outlined">mail</span>
                                            </div>
                                            <input
                                                className="block w-full pl-12 pr-4 py-4 bg-transparent border-none focus:ring-0 outline-none text-base text-on-surface"
                                                id="resendEmail"
                                                name="resendEmail"
                                                placeholder=" "
                                                required
                                                type="email"
                                                value={resendEmail}
                                                onChange={(e) => {
                                                    setResendEmail(e.target.value);
                                                    setErrorMsg("");
                                                    setResendSuccess("");
                                                }}
                                            />
                                            <label className="absolute top-4 left-12 text-on-surface-variant text-base origin-left" htmlFor="resendEmail">
                                                Email Address
                                            </label>
                                        </div>

                                        <button
                                            className="w-full premium-gradient text-white text-sm font-medium py-4 rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-4 group disabled:opacity-75"
                                            type="submit"
                                            disabled={resendLoading}
                                        >
                                            {resendLoading ? (
                                                <>
                                                    <span className="material-symbols-outlined animate-spin text-base">sync</span>
                                                    <span>Sending Link...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>Send New Link</span>
                                                    <span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">send</span>
                                                </>
                                            )}
                                        </button>
                                    </form>

                                    {resendSuccess && (
                                        <div className="mt-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-start gap-4 text-left animate-fade-in">
                                            <span className="material-symbols-outlined text-green-600">check_circle</span>
                                            <p className="text-sm font-medium">{resendSuccess}</p>
                                        </div>
                                    )}

                                    {errorMsg && !resendSuccess && (
                                        <div className="mt-4 p-4 bg-error-container border border-error/20 text-on-error-container rounded-xl flex items-start gap-4 text-left animate-fade-in">
                                            <span className="material-symbols-outlined text-error">error</span>
                                            <p className="text-sm font-medium">{errorMsg}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-6 pt-6 border-t border-outline-variant/30 flex flex-col items-center gap-6">
                                    <p className="text-base text-on-surface-variant">
                                        Back to{" "}
                                        <Link className="text-primary font-bold hover:underline decoration-2 underline-offset-4 transition-all" to="/login">
                                            Login Screen
                                        </Link>
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default VerifyEmail;
