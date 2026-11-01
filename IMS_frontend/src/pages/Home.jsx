import React, { useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import warehouse3dImg from "../assets/warehouse-3d.png";

const REMOTE_HERO_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDoXNgJe1jKY2vy1OMOj6Ne6HXWXfraVksq7gv-GrIL4yPd75CIglF8i8vx_4umF6eDK6kmE2-ILDmzhNRWnque3OiUz_YKKYBPexk4-RERjYp5P-2H5-ZqrDw3UvBI0W8vgHEefKQPw6umxyIUl4HB7ZFrRgDuF7J_dTE7IlNCL7CWZYbDJ2ESxuMarp8Nha8OEz0s25I-4oNXjCeXw9_1Y4yTuBARS9g5oRKLCAA";

const Home = () => {
  const { isAuthenticated, fullName } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (e, sectionId) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (sectionId === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 antialiased overflow-x-hidden selection:bg-blue-100 selection:text-blue-900 font-sans pt-20">
      {/* ── BEGIN: NavigationBar ────────────────────────────────────────── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200"
        data-purpose="main-navigation"
      >
        <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-16 h-20 flex items-center justify-between">
          {/* Brand Logo & Identity */}
          <a
            aria-label="LogiTrack Homepage"
            className="flex items-center gap-3 group"
            href="#home"
            onClick={(e) => scrollToSection(e, "home")}
          >
            <div className="w-10 h-10 rounded-xl bg-[#2456E8] flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-[1.02] transition-transform">
              {/* LogiTrack Box Icon Logo */}
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                <path d="m3.3 7 8.7 5 8.7-5" />
                <path d="M12 22V12" />
              </svg>
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900 block leading-tight">
                LogiTrack
              </span>
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase -mt-0.5 block">
                ENTERPRISE
              </span>
            </div>
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
            <a
              className="text-[#2456E8] transition-colors hover:text-[#1D4ED8]"
              href="#home"
              onClick={(e) => scrollToSection(e, "home")}
            >
              Home
            </a>
            <a
              className="hover:text-slate-900 transition-colors"
              href="#features"
              onClick={(e) => scrollToSection(e, "features")}
            >
              Features
            </a>
            <a
              className="hover:text-slate-900 transition-colors"
              href="#dashboard-preview"
              onClick={(e) => scrollToSection(e, "dashboard-preview")}
            >
              Solutions
            </a>
            <a
              className="hover:text-slate-900 transition-colors"
              href="#how-it-works"
              onClick={(e) => scrollToSection(e, "how-it-works")}
            >
              How It Works
            </a>
            <a
              className="hover:text-slate-900 transition-colors"
              href="#security"
              onClick={(e) => scrollToSection(e, "security")}
            >
              Security
            </a>
          </nav>

          {/* Auth Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 font-medium">
                  Signed in as <strong className="text-slate-700">{fullName || "User"}</strong>
                </span>
                <Link
                  className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-white bg-[#2456E8] hover:bg-blue-700 rounded-lg shadow-sm hover:shadow-brand-glow transition-all"
                  to="/dashboard"
                >
                  Dashboard →
                </Link>
              </div>
            ) : (
              <>
                <Link
                  className="inline-flex items-center px-4.5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                  to="/login"
                >
                  Login
                </Link>
                <Link
                  className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-white bg-[#2456E8] hover:bg-blue-700 rounded-lg shadow-sm hover:shadow-brand-glow transition-all"
                  to="/register"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              aria-label="Toggle mobile navigation"
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Nav Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg">
            <div className="flex flex-col space-y-2 text-sm font-medium text-slate-700">
              <a
                className="px-3 py-2 rounded-lg hover:bg-slate-50 text-[#2456E8]"
                href="#home"
                onClick={(e) => scrollToSection(e, "home")}
              >
                Home
              </a>
              <a
                className="px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-700"
                href="#features"
                onClick={(e) => scrollToSection(e, "features")}
              >
                Features
              </a>
              <a
                className="px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-700"
                href="#dashboard-preview"
                onClick={(e) => scrollToSection(e, "dashboard-preview")}
              >
                Solutions
              </a>
              <a
                className="px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-700"
                href="#how-it-works"
                onClick={(e) => scrollToSection(e, "how-it-works")}
              >
                How It Works
              </a>
              <a
                className="px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-700"
                href="#security"
                onClick={(e) => scrollToSection(e, "security")}
              >
                Security
              </a>
            </div>
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
              {isAuthenticated ? (
                <Link
                  className="w-full text-center py-2.5 text-sm font-semibold text-white bg-[#2456E8] hover:bg-blue-700 rounded-lg shadow-sm"
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    className="w-full text-center py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    className="w-full text-center py-2.5 text-sm font-semibold text-white bg-[#2456E8] hover:bg-blue-700 rounded-lg shadow-sm"
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>
      {/* ── END: NavigationBar ──────────────────────────────────────────── */}

      {/* ── BEGIN: HeroSection ──────────────────────────────────────────── */}
      <section
        className="relative pt-8 pb-16 lg:pt-14 lg:pb-24 overflow-hidden bg-gradient-to-b from-white via-slate-50/50 to-white scroll-mt-20"
        data-purpose="hero-section"
        id="home"
      >
        {/* Subtle Background Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#2456E8_1px,transparent_1px)] [background-size:24px_24px]"></div>

        <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-16 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-center">
            {/* Left Hero Copy */}
            <div className="lg:col-span-6 xl:col-span-6 space-y-6 sm:space-y-8 text-left">
              {/* Pill Badge matching LogiTrack styling */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-[#2456E8] text-xs font-semibold tracking-wide">
                <span className="w-2 h-2 rounded-full bg-[#2456E8] animate-pulse"></span>
                SMART INVENTORY MANAGEMENT
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
                Take Control of Your Inventory.{" "}
                <span className="text-[#2456E8]">Simplify Your Business.</span>
              </h1>

              <p className="text-base sm:text-lg lg:text-xl text-slate-600 leading-relaxed max-w-2xl">
                Manage products, monitor stock levels, track sales, handle purchases and generate invoices from one powerful inventory management platform.
              </p>

              {/* Primary CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  className="inline-flex items-center gap-2.5 px-7 py-4 rounded-xl bg-[#2456E8] text-white font-semibold text-base shadow-lg shadow-blue-600/25 hover:bg-blue-700 hover:shadow-brand-glow transition-all"
                  to="/register"
                >
                  <span>Get Started</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                  </svg>
                </Link>
                <a
                  className="inline-flex items-center gap-2.5 px-7 py-4 rounded-xl bg-white border border-slate-300 text-slate-700 font-semibold text-base hover:bg-slate-50 transition-colors shadow-sm"
                  href="#features"
                  onClick={(e) => scrollToSection(e, "features")}
                >
                  Explore Features
                </a>
              </div>

              {/* Trust Badges & Checkmarks */}
              <div className="pt-6 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-slate-600">
                  <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      clipRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      fillRule="evenodd"
                    />
                  </svg>
                  <span>Smart Stock Tracking</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-slate-600">
                  <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      clipRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      fillRule="evenodd"
                    />
                  </svg>
                  <span>Secure Access Control</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-slate-600">
                  <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      clipRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      fillRule="evenodd"
                    />
                  </svg>
                  <span>Business Analytics</span>
                </div>
              </div>
            </div>

            {/* Right Hero Visual with 3D Isometric Art */}
            <div className="lg:col-span-6 xl:col-span-6 relative w-full">
              <div className="relative w-full">
                {/* Soft Blue Ambient Glow */}
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-200/50 to-indigo-200/50 rounded-3xl blur-2xl -z-10 transform scale-95 opacity-70"></div>

                {/* Isometric Model Container */}
                <div className="relative rounded-3xl bg-white p-3 sm:p-5 shadow-xl shadow-slate-200/70 border border-slate-200/80 overflow-hidden w-full flex items-center justify-center">
                  <img
                    alt="High-fidelity 3D isometric illustration of a smart automated modern warehouse and logistics management ecosystem"
                    className="w-full h-auto max-h-[520px] xl:max-h-[580px] object-contain rounded-2xl transform hover:scale-[1.01] transition-transform duration-500"
                    src={warehouse3dImg}
                    onError={(e) => {
                      e.currentTarget.src = REMOTE_HERO_IMG;
                    }}
                  />

                  {/* Floating Live Metric Badge 1 */}
                  <div className="absolute top-5 left-5 sm:top-7 sm:left-7 bg-white/95 backdrop-blur-md px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-slate-200/80 shadow-md flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs sm:text-sm">
                      99.9%
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 leading-tight">Stock Accuracy</p>
                      <p className="text-[10px] text-slate-500">Zero variance</p>
                    </div>
                  </div>

                  {/* Floating Live Metric Badge 2 */}
                  <div className="absolute bottom-5 right-5 sm:bottom-7 sm:right-7 bg-white/95 backdrop-blur-md px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-slate-200/80 shadow-md flex items-center gap-3">
                    <span className="relative flex h-3.5 w-3.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#2456E8]"></span>
                    </span>
                    <div>
                      <p className="text-xs font-bold text-slate-800 leading-tight">Real-Time Sync</p>
                      <p className="text-[10px] text-slate-500">Connected Hub</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* ── END: HeroSection ────────────────────────────────────────────── */}

      {/* ── BEGIN: HighlightsStrip ──────────────────────────────────────── */}
      <section
        className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-16 -mt-6 sm:-mt-10 relative z-20"
        data-purpose="highlights-strip"
      >
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card-subtle p-6 lg:p-8 grid grid-cols-2 lg:grid-cols-4 gap-6 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
          {/* Highlight 1 */}
          <div className="flex items-center gap-4 pt-2 lg:pt-0">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#2456E8] flex items-center justify-center shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">Inventory</h4>
              <p className="text-xs text-slate-500">Comprehensive cataloging</p>
            </div>
          </div>

          {/* Highlight 2 */}
          <div className="flex items-center gap-4 pt-4 lg:pt-0 lg:pl-6">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">Sales Tracking</h4>
              <p className="text-xs text-slate-500">Live transaction stream</p>
            </div>
          </div>

          {/* Highlight 3 */}
          <div className="flex items-center gap-4 pt-4 lg:pt-0 lg:pl-6">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">Restock Orders</h4>
              <p className="text-xs text-slate-500">Direct vendor pipelines</p>
            </div>
          </div>

          {/* Highlight 4 */}
          <div className="flex items-center gap-4 pt-4 lg:pt-0 lg:pl-6">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">Business Intel</h4>
              <p className="text-xs text-slate-500">Real-time ledger data</p>
            </div>
          </div>
        </div>
      </section>
      {/* ── END: HighlightsStrip ────────────────────────────────────────── */}

      {/* ── BEGIN: FeaturesSection ──────────────────────────────────────── */}
      <section className="py-24 bg-white scroll-mt-20" data-purpose="features-overview" id="features">
        <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-16">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold tracking-widest text-[#2456E8] uppercase bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              Complete Operational Suite
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight mt-3">
              Everything You Need to Manage Your Inventory
            </h2>
            <p className="text-base sm:text-lg text-slate-600 mt-4">
              Powerful tools designed to simplify daily inventory operations and unlock end-to-end visibility.
            </p>
          </div>

          {/* Feature Grid: 6 Distinct Modules */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 xl:gap-10">
            {/* Card 1: Product Management */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200/90 hover:border-blue-300 hover:shadow-lg transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#2456E8] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2.5">Product Management</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Add, update and organize products. Manage categories, specifications and active stock information effortlessly.
              </p>
            </div>

            {/* Card 2: Sales Management */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200/90 hover:border-emerald-300 hover:shadow-lg transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2.5">Sales Management</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Record sales transactions, track customer sales orders, calculate gross revenue and automate status tracking.
              </p>
            </div>

            {/* Card 3: Purchase Management */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200/90 hover:border-amber-300 hover:shadow-lg transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2.5">Purchase Management</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Manage vendor purchases, oversee incoming inventory shipments and maintain accurate cost calculations.
              </p>
            </div>

            {/* Card 4: Invoice Generation */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200/90 hover:border-purple-300 hover:shadow-lg transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2.5">Invoice Generation</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Generate clean professional invoices and billing statements in seconds with automated payment tracking.
              </p>
            </div>

            {/* Card 5: Stock Ledger */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200/90 hover:border-blue-300 hover:shadow-lg transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2.5">Stock Ledger</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Monitor real-time inventory movements with chronological audit logs and precise transactional history.
              </p>
            </div>

            {/* Card 6: Reports & Analytics */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200/90 hover:border-indigo-300 hover:shadow-lg transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                  <path
                    d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2.5">Reports &amp; Analytics</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Visualize category distribution, monthly sales surges and warehouse expenditure with interactive widgets.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* ── END: FeaturesSection ────────────────────────────────────────── */}

      {/* ── BEGIN: HowItWorks ───────────────────────────────────────────── */}
      <section className="py-24 bg-slate-50 border-y border-slate-200/80 scroll-mt-20" data-purpose="workflow-steps" id="how-it-works">
        <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-16">
          {/* Section Title */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold tracking-widest text-[#2456E8] uppercase bg-blue-100/60 px-3 py-1 rounded-full">
              Workflow
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight mt-3">
              Manage Your Inventory in Four Simple Steps
            </h2>
            <p className="text-slate-600 text-base sm:text-lg mt-3">
              Designed for simplicity so your team can focus on scaling orders and customer satisfaction.
            </p>
          </div>

          {/* Steps Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Step 1 */}
            <div className="relative bg-white p-7 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-start hover:border-blue-200 transition-colors">
              <span className="text-5xl font-black text-blue-100">01</span>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#2456E8] flex items-center justify-center font-bold text-base my-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <h4 className="font-bold text-slate-900 text-lg mb-1.5">Create Account</h4>
              <p className="text-sm text-slate-500 leading-relaxed">
                Register your enterprise workspace and assign credentials securely.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative bg-white p-7 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-start hover:border-blue-200 transition-colors">
              <span className="text-5xl font-black text-blue-100">02</span>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#2456E8] flex items-center justify-center font-bold text-base my-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M12 4v16m8-8H4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <h4 className="font-bold text-slate-900 text-lg mb-1.5">Add Products</h4>
              <p className="text-sm text-slate-500 leading-relaxed">
                Organize stock items, define categories and establish thresholds.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative bg-white p-7 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-start hover:border-blue-200 transition-colors">
              <span className="text-5xl font-black text-blue-100">03</span>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#2456E8] flex items-center justify-center font-bold text-base my-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <h4 className="font-bold text-slate-900 text-lg mb-1.5">Manage Orders</h4>
              <p className="text-sm text-slate-500 leading-relaxed">
                Conduct purchases, fulfill customer sales orders, and issue invoices.
              </p>
            </div>

            {/* Step 4 */}
            <div className="relative bg-white p-7 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-start hover:border-blue-200 transition-colors">
              <span className="text-5xl font-black text-blue-100">04</span>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#2456E8] flex items-center justify-center font-bold text-base my-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <h4 className="font-bold text-slate-900 text-lg mb-1.5">Track Performance</h4>
              <p className="text-sm text-slate-500 leading-relaxed">
                Inspect ledger logs, watch revenue growth and eliminate bottlenecks.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* ── END: HowItWorks ─────────────────────────────────────────────── */}

      {/* ── BEGIN: DashboardPreviewSection (Authentic LogiTrack Dashboard) ─ */}
      <section
        className="py-24 bg-[#EFF5FF]/80 relative overflow-hidden scroll-mt-20"
        data-purpose="interactive-dashboard-mockup"
        id="dashboard-preview"
      >
        <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-16">
          {/* Section Intro */}
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold tracking-widest text-[#2456E8] uppercase bg-white px-3 py-1 rounded-full border border-blue-200 shadow-sm">
              Live Operational Control
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight mt-3">
              Your Entire Inventory at a Glance
            </h2>
            <p className="text-slate-600 text-base sm:text-lg mt-3">
              Get a clear overview of your business operations through a centralized dashboard identical to the production LogiTrack interface.
            </p>
          </div>

          {/* High-Fidelity UI Mockup Shell */}
          <div className="bg-white rounded-3xl border border-slate-300/80 shadow-mockup-depth overflow-hidden">
            {/* Browser Bar Top Strip */}
            <div className="bg-slate-900 px-5 py-3.5 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
                <span className="ml-3 font-mono text-xs text-slate-400">localhost:5173/dashboard</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-emerald-400 text-xs flex items-center gap-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span> System Online
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[720px]">
              {/* Mockup Left Sidebar */}
              <aside
                className="hidden lg:block lg:col-span-3 xl:col-span-3 bg-white border-r border-slate-200 p-6 flex flex-col justify-between"
                data-purpose="mock-sidebar"
              >
                <div className="space-y-6">
                  {/* Sidebar Brand */}
                  <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                    <div className="w-9 h-9 rounded-lg bg-[#2456E8] flex items-center justify-center text-white">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                        <path d="m3.3 7 8.7 5 8.7-5" />
                        <path d="M12 22V12" />
                      </svg>
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 text-base leading-tight block">LogiTrack</span>
                      <span className="text-[9px] font-bold text-slate-400 tracking-wider">ENTERPRISE</span>
                    </div>
                  </div>

                  {/* Nav Menu items */}
                  <nav className="space-y-1.5 text-xs font-semibold">
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-blue-50 text-[#2456E8]">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                      </svg>
                      <span>Dashboard</span>
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                        />
                      </svg>
                      <span>Products</span>
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                        />
                      </svg>
                      <span>Sales Orders</span>
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                        />
                      </svg>
                      <span>Invoices</span>
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H20"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                        />
                      </svg>
                      <span>Purchases</span>
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                        />
                      </svg>
                      <span>Stock Ledger</span>
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                        />
                      </svg>
                      <span>Reports</span>
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                        />
                      </svg>
                      <span>Notifications</span>
                    </div>
                  </nav>
                </div>

                {/* Profile & Admin Badge at Sidebar Bottom */}
                <div className="pt-6 border-t border-slate-100 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700">
                      <svg className="w-3 h-3 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          clipRule="evenodd"
                          d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          fillRule="evenodd"
                        />
                      </svg>
                      ADMIN
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#2456E8] text-white flex items-center justify-center font-bold text-xs">
                      J
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-slate-800 truncate">jayswalhimanshu74</p>
                      <p className="text-[10px] text-slate-400 truncate">jayswalhimanshu74@gmail.com</p>
                    </div>
                  </div>
                </div>
              </aside>

              {/* Mockup Main Workspace */}
              <main className="lg:col-span-9 xl:col-span-9 bg-[#F8FAFC] p-5 sm:p-8 space-y-6" data-purpose="mock-main-content">
                {/* Workspace Header Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
                  <div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      WORKSPACE &gt; OVERVIEW
                    </p>
                    <h3 className="text-xl font-bold text-slate-900">Inventory Workspace Overview</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span> CONNECTED
                    </span>
                    <button
                      aria-label="Refresh Workspace"
                      className="p-2 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-800"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                        />
                      </svg>
                    </button>
                    <div className="relative">
                      <button
                        aria-label="Notifications"
                        className="p-2 rounded-lg border border-slate-200 bg-white text-slate-500"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                          />
                        </svg>
                      </button>
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                        9
                      </span>
                    </div>
                    <button className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                        />
                      </svg>
                      Logout
                    </button>
                  </div>
                </div>

                {/* KPI Metric Cards Grid matching Dashboard values */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {/* Card 1: Revenue */}
                  <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-sm relative overflow-hidden">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Total Sales Revenue
                        </p>
                        <p className="text-2xl font-extrabold text-slate-900 mt-1">$566,445.79</p>
                        <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-2">
                          <span>↑ +12.5% this month</span>
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#2456E8] flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Expenses */}
                  <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-sm relative overflow-hidden">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Total Expenses
                        </p>
                        <p className="text-2xl font-extrabold text-slate-900 mt-1">$151,123.00</p>
                        <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                          <svg className="w-3.5 h-3.5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                            />
                          </svg>
                          Warehouse purchases
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Products */}
                  <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-sm relative overflow-hidden">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Catalog Products
                        </p>
                        <p className="text-2xl font-extrabold text-slate-900 mt-1">5</p>
                        <p className="text-xs text-slate-400 mt-2">Active stock items</p>
                      </div>
                      <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Card 4: Low Stock Alerts */}
                  <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-sm relative overflow-hidden">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Low Stock Alerts
                        </p>
                        <p className="text-2xl font-extrabold text-slate-900 mt-1">0</p>
                        <p className="text-xs text-slate-400 mt-2">Stock levels healthy</p>
                      </div>
                      <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions Bar */}
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">QUICK ACTIONS</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#2456E8] flex items-center justify-center font-bold text-sm">
                        +
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">Catalog Product</p>
                        <p className="text-[10px] text-slate-400">Add new stock item</p>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">Register Sale</p>
                        <p className="text-[10px] text-slate-400">Create sales order</p>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">Restock Order</p>
                        <p className="text-[10px] text-slate-400">Purchase stock units</p>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">Generate Invoice</p>
                        <p className="text-[10px] text-slate-400">Billing &amp; statements</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Two-Column Section: Category Distribution & Recent Ledger Activity Table */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Widget: Category Distribution */}
                  <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-slate-900">Category Distribution</h4>
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                        />
                        <path
                          d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                        />
                      </svg>
                    </div>

                    <div className="space-y-4">
                      {/* Category 1 */}
                      <div>
                        <div className="flex justify-between text-xs font-medium mb-1.5">
                          <span className="text-slate-800 font-semibold">Electronics &amp; Accessories</span>
                          <span className="text-slate-500">363 items</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div className="bg-[#2456E8] h-2 rounded-full" style={{ width: "75%" }}></div>
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 block">1 unique products catalogued</span>
                      </div>

                      {/* Category 2 */}
                      <div>
                        <div className="flex justify-between text-xs font-medium mb-1.5">
                          <span className="text-slate-800 font-semibold">Electronics</span>
                          <span className="text-slate-500">210 items</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div className="bg-amber-400 h-2 rounded-full" style={{ width: "45%" }}></div>
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 block">2 unique products catalogued</span>
                      </div>

                      {/* Category 3 */}
                      <div>
                        <div className="flex justify-between text-xs font-medium mb-1.5">
                          <span className="text-slate-800 font-semibold">Office Furniture</span>
                          <span className="text-slate-500">19 items</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div className="bg-emerald-500 h-2 rounded-full" style={{ width: "15%" }}></div>
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 block">1 unique products catalogued</span>
                      </div>

                      {/* Category 4 */}
                      <div>
                        <div className="flex justify-between text-xs font-medium mb-1.5">
                          <span className="text-slate-800 font-semibold">Monitors</span>
                          <span className="text-slate-500">20 items</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div className="bg-purple-500 h-2 rounded-full" style={{ width: "18%" }}></div>
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 block">1 unique products catalogued</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Widget: Recent Ledger Activity Table */}
                  <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                      <h4 className="font-bold text-sm text-slate-900">Recent Ledger Activity</h4>
                      <Link
                        className="text-xs font-bold text-[#2456E8] hover:underline flex items-center gap-1"
                        to={isAuthenticated ? "/stock-movements" : "/login"}
                      >
                        View Ledger →
                      </Link>
                    </div>
                    <div className="overflow-x-auto mt-2">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                            <th className="py-3">TRANSACTION ID</th>
                            <th className="py-3">TYPE</th>
                            <th className="py-3">DATE</th>
                            <th className="py-3 text-right">VALUE</th>
                            <th className="py-3 text-right">STATUS</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {/* Row 1 */}
                          <tr>
                            <td className="py-3.5 font-semibold text-slate-900">SO-04995823</td>
                            <td className="py-3.5">
                              <span className="inline-flex items-center gap-1.5 text-slate-700">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Sale
                              </span>
                            </td>
                            <td className="py-3.5 text-slate-500">2026-08-05</td>
                            <td className="py-3.5 text-right font-bold text-slate-900">$11,700.00</td>
                            <td className="py-3.5 text-right">
                              <span className="px-2.5 py-1 rounded text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200">
                                CONFIRMED
                              </span>
                            </td>
                          </tr>

                          {/* Row 2 */}
                          <tr>
                            <td className="py-3.5 font-semibold text-slate-900">PO-05396369</td>
                            <td className="py-3.5">
                              <span className="inline-flex items-center gap-1.5 text-slate-700">
                                <span className="w-2 h-2 rounded-full bg-amber-500"></span> Purchase
                              </span>
                            </td>
                            <td className="py-3.5 text-slate-500">2026-08-05</td>
                            <td className="py-3.5 text-right font-bold text-slate-900">$132,500.00</td>
                            <td className="py-3.5 text-right">
                              <span className="px-2.5 py-1 rounded text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200">
                                PENDING
                              </span>
                            </td>
                          </tr>

                          {/* Row 3 */}
                          <tr>
                            <td className="py-3.5 font-semibold text-slate-900">SO-25582276</td>
                            <td className="py-3.5">
                              <span className="inline-flex items-center gap-1.5 text-slate-700">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Sale
                              </span>
                            </td>
                            <td className="py-3.5 text-slate-500">2026-07-21</td>
                            <td className="py-3.5 text-right font-bold text-slate-900">$550,000.00</td>
                            <td className="py-3.5 text-right">
                              <span className="px-2.5 py-1 rounded text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200">
                                CONFIRMED
                              </span>
                            </td>
                          </tr>

                          {/* Row 4 */}
                          <tr>
                            <td className="py-3.5 font-semibold text-slate-900">PO-89816890</td>
                            <td className="py-3.5">
                              <span className="inline-flex items-center gap-1.5 text-slate-700">
                                <span className="w-2 h-2 rounded-full bg-amber-500"></span> Purchase
                              </span>
                            </td>
                            <td className="py-3.5 text-slate-500">2026-07-16</td>
                            <td className="py-3.5 text-right font-bold text-slate-900">$2,500.00</td>
                            <td className="py-3.5 text-right">
                              <span className="px-2.5 py-1 rounded text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200">
                                PENDING
                              </span>
                            </td>
                          </tr>

                          {/* Row 5 */}
                          <tr>
                            <td className="py-3.5 font-semibold text-slate-900">SO-89681031</td>
                            <td className="py-3.5">
                              <span className="inline-flex items-center gap-1.5 text-slate-700">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Sale
                              </span>
                            </td>
                            <td className="py-3.5 text-slate-500">2026-07-15</td>
                            <td className="py-3.5 text-right font-bold text-slate-900">$190.00</td>
                            <td className="py-3.5 text-right">
                              <span className="px-2.5 py-1 rounded text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200">
                                CONFIRMED
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </main>
            </div>
          </div>
        </div>
      </section>
      {/* ── END: DashboardPreviewSection ────────────────────────────────── */}

      {/* ── BEGIN: SecurityAccessSection ──────────────────────────────────── */}
      <section className="py-24 bg-white scroll-mt-20" data-purpose="security-and-controls" id="security">
        <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-16">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold tracking-widest text-[#2456E8] uppercase bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              Enterprise Security
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight mt-3">
              Secure and Organized Business Management
            </h2>
            <p className="text-slate-600 text-base sm:text-lg mt-3">
              Enterprise-grade protections ensuring data integrity across every warehouse, ledger entry and user session.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8">
            {/* Feature 1 */}
            <div className="p-7 rounded-2xl bg-slate-50 border border-slate-200/90 text-left hover:border-blue-200 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-blue-100/70 text-[#2456E8] flex items-center justify-center mb-5">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <h4 className="font-bold text-slate-900 text-lg mb-2">JWT Authentication</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Cryptographically signed sessions protecting client logins and endpoint transactions.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-7 rounded-2xl bg-slate-50 border border-slate-200/90 text-left hover:border-purple-200 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-purple-100/70 text-purple-600 flex items-center justify-center mb-5">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <h4 className="font-bold text-slate-900 text-lg mb-2">Role-Based Access</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Granular Admin, Manager, and Staff permissions governing critical actions.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-7 rounded-2xl bg-slate-50 border border-slate-200/90 text-left hover:border-emerald-200 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-emerald-100/70 text-emerald-600 flex items-center justify-center mb-5">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <h4 className="font-bold text-slate-900 text-lg mb-2">User Management</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Centralized team onboarding, credentials rotation, and active session controls.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-7 rounded-2xl bg-slate-50 border border-slate-200/90 text-left hover:border-amber-200 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-amber-100/70 text-amber-600 flex items-center justify-center mb-5">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <h4 className="font-bold text-slate-900 text-lg mb-2">Centralized Ledger</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Immutable timestamped audit logs for every stock entry, purchase, and sale.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* ── END: SecurityAccessSection ──────────────────────────────────── */}

      {/* ── BEGIN: CallToActionBanner ───────────────────────────────────── */}
      <section className="py-20 bg-white" data-purpose="final-call-to-action">
        <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-16">
          <div className="relative rounded-3xl bg-gradient-to-r from-[#2456E8] to-[#1E40AF] p-8 sm:p-14 lg:p-16 overflow-hidden text-center text-white shadow-xl shadow-blue-900/10">
            {/* Abstract geometric backdrop circles */}
            <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
            <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-blue-400/20 blur-2xl pointer-events-none"></div>

            <div className="relative z-10 max-w-3xl mx-auto space-y-6">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Ready to Simplify Your Inventory Management?
              </h2>
              <p className="text-blue-100 text-base sm:text-lg lg:text-xl">
                Bring your inventory, sales, purchases and business insights together with LogiTrack Enterprise.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
                <Link
                  className="px-8 py-4 rounded-xl bg-white text-[#2456E8] font-bold text-base hover:bg-blue-50 transition-colors shadow-lg"
                  to="/register"
                >
                  Get Started Now
                </Link>
                <Link
                  className="px-8 py-4 rounded-xl bg-blue-700/60 border border-white/20 text-white font-semibold text-base hover:bg-blue-700 transition-colors"
                  to="/login"
                >
                  Login to Your Account
                </Link>
              </div>

              <p className="text-xs sm:text-sm text-blue-200 pt-2 font-medium">
                Trusted by 500+ global enterprises for high-scale stock management.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* ── END: CallToActionBanner ─────────────────────────────────────── */}

      {/* ── BEGIN: Footer ───────────────────────────────────────────────── */}
      <footer className="bg-white border-t border-slate-200 pt-16 pb-12 text-slate-600" data-purpose="main-footer">
        <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-16">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-slate-200">
            {/* Brand Info */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#2456E8] flex items-center justify-center text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                    <path d="m3.3 7 8.7 5 8.7-5" />
                    <path d="M12 22V12" />
                  </svg>
                </div>
                <div>
                  <span className="font-bold text-slate-900 text-lg leading-tight block">LogiTrack</span>
                  <span className="text-[9px] font-bold text-slate-400 tracking-wider">ENTERPRISE</span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md leading-relaxed">
                Intelligent Logistics for Modern Enterprise. Orchestrate your global supply chain, inventory warehousing and ledger balance with real-time precision.
              </p>
            </div>

            {/* Links Col 1 */}
            <div>
              <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Navigation</h5>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600">
                <li>
                  <a
                    className="hover:text-[#2456E8] transition-colors"
                    href="#home"
                    onClick={(e) => scrollToSection(e, "home")}
                  >
                    Home
                  </a>
                </li>
                <li>
                  <a
                    className="hover:text-[#2456E8] transition-colors"
                    href="#features"
                    onClick={(e) => scrollToSection(e, "features")}
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    className="hover:text-[#2456E8] transition-colors"
                    href="#dashboard-preview"
                    onClick={(e) => scrollToSection(e, "dashboard-preview")}
                  >
                    Dashboard
                  </a>
                </li>
                <li>
                  <a
                    className="hover:text-[#2456E8] transition-colors"
                    href="#how-it-works"
                    onClick={(e) => scrollToSection(e, "how-it-works")}
                  >
                    How It Works
                  </a>
                </li>
              </ul>
            </div>

            {/* Links Col 2 */}
            <div>
              <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Product</h5>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600">
                <li>
                  <a
                    className="hover:text-[#2456E8] transition-colors"
                    href="#features"
                    onClick={(e) => scrollToSection(e, "features")}
                  >
                    Product Catalog
                  </a>
                </li>
                <li>
                  <a
                    className="hover:text-[#2456E8] transition-colors"
                    href="#features"
                    onClick={(e) => scrollToSection(e, "features")}
                  >
                    Sales Tracking
                  </a>
                </li>
                <li>
                  <a
                    className="hover:text-[#2456E8] transition-colors"
                    href="#features"
                    onClick={(e) => scrollToSection(e, "features")}
                  >
                    Restock Orders
                  </a>
                </li>
                <li>
                  <a
                    className="hover:text-[#2456E8] transition-colors"
                    href="#features"
                    onClick={(e) => scrollToSection(e, "features")}
                  >
                    Stock Ledger
                  </a>
                </li>
              </ul>
            </div>

            {/* Links Col 3 */}
            <div>
              <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Account &amp; Legal</h5>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600">
                <li>
                  <Link className="hover:text-[#2456E8] transition-colors" to="/login">
                    Login
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-[#2456E8] transition-colors" to="/register">
                    Register
                  </Link>
                </li>
                <li>
                  <a className="hover:text-[#2456E8] transition-colors" href="#">
                    Help Center
                  </a>
                </li>
                <li>
                  <a className="hover:text-[#2456E8] transition-colors" href="#">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a className="hover:text-[#2456E8] transition-colors" href="#">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Disclaimer */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>© 2026 LogiTrack Enterprise. All rights reserved.</p>
            <p className="text-slate-400">Trusted by 500+ global enterprises for high-scale stock management.</p>
          </div>
        </div>
      </footer>
      {/* ── END: Footer ─────────────────────────────────────────────────── */}
    </div>
  );
};

export default Home;
