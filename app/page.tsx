"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { AvoraLogo } from "@/components/ui/AvoraLogo";

/* ── Animation variants ─────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

/* ── Animated counter ───────────────────────────────────────── */
function AnimatedNumber({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [current, setCurrent] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let count = 0;
    const timer = setInterval(() => {
      count += increment;
      if (count >= target) { setCurrent(target); clearInterval(timer); return; }
      setCurrent(Math.floor(count));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [inView, target]);

  return <span ref={ref}>{current.toLocaleString()}{suffix}</span>;
}

/* ── Navbar ─────────────────────────────────────────────────── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" aria-label="AVORA home">
          <AvoraLogo size={34} showTagline textColor={scrolled ? undefined : "white"} taglineColor={scrolled ? undefined : "rgba(255,255,255,0.5)"} />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {[
            { label: "Features", href: "#features" },
            { label: "How It Works", href: "#how-it-works" },
            { label: "Pricing", href: "#pricing" },
            { label: "Contact", href: "/contact" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={`text-sm font-medium transition-colors relative group ${
                scrolled ? "text-gray-600 hover:text-[#2563EB]" : "text-white/80 hover:text-white"
              }`}
            >
              {item.label}
              <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-[#2563EB] group-hover:w-full transition-all duration-300 rounded-full" />
            </a>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className={`text-sm font-semibold transition-colors ${
              scrolled ? "text-gray-700 hover:text-[#2563EB]" : "text-white/90 hover:text-white"
            }`}
          >
            Sign In
          </Link>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/register"
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors btn-glow-blue shadow-lg"
            >
              Get Started Free
            </Link>
          </motion.div>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 rounded-lg"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <div className={`w-5 h-0.5 mb-1 transition-all ${scrolled ? "bg-gray-800" : "bg-white"} ${mobileOpen ? "rotate-45 translate-y-1.5" : ""}`} />
          <div className={`w-5 h-0.5 mb-1 transition-all ${scrolled ? "bg-gray-800" : "bg-white"} ${mobileOpen ? "opacity-0" : ""}`} />
          <div className={`w-5 h-0.5 transition-all ${scrolled ? "bg-gray-800" : "bg-white"} ${mobileOpen ? "-rotate-45 -translate-y-1.5" : ""}`} />
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-100 px-4 py-6 space-y-4"
          >
            {["Features", "How It Works", "Pricing", "Contact"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                className="block text-gray-700 font-medium hover:text-[#2563EB] transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {item}
              </a>
            ))}
            <div className="pt-4 flex flex-col gap-3">
              <Link href="/login" className="text-center py-2.5 text-gray-700 font-semibold border border-gray-200 rounded-xl">Sign In</Link>
              <Link href="/register" className="text-center py-2.5 bg-[#2563EB] text-white font-semibold rounded-xl">Get Started Free</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

/* ── Main landing page ──────────────────────────────────────── */
export default function LandingPage() {
  const features = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
        </svg>
      ),
      title: "Ideal Customer Profile (ICP)",
      desc: "AI-generated ICP with firmographics, psychographics, buying triggers, and disqualifiers based on your real customer evidence.",
      gradient: "from-blue-500 to-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100",
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
      title: "Decision Making Unit (DMU) Map",
      desc: "Map every stakeholder in the buying process — economic buyer, champion, technical buyer — with engagement strategies.",
      gradient: "from-purple-500 to-purple-600",
      bg: "bg-purple-50",
      border: "border-purple-100",
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
      title: "ABM Targeting Strategy",
      desc: "Account-based marketing with Tier 1, 2, and 3 segmentation and prioritization frameworks for maximum ROI.",
      gradient: "from-amber-500 to-orange-500",
      bg: "bg-amber-50",
      border: "border-amber-100",
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      title: "Outreach Playbook",
      desc: "LinkedIn, Email, and WhatsApp outreach sequences with messaging frameworks tailored precisely to your ICP.",
      gradient: "from-green-500 to-emerald-500",
      bg: "bg-green-50",
      border: "border-green-100",
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      title: "Lookalike Search Criteria",
      desc: "Boolean search strings and criteria to find accounts that match your best customers — no personal data exposed.",
      gradient: "from-cyan-500 to-blue-500",
      bg: "bg-cyan-50",
      border: "border-cyan-100",
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: "Leads Dashboard",
      desc: "Order targeted leads delivered by the Enigma Sales team with full CRM data and personality analysis links.",
      gradient: "from-rose-500 to-pink-500",
      bg: "bg-rose-50",
      border: "border-rose-100",
    },
  ];

  const stats = [
    { value: 500, suffix: "+", label: "Businesses Using AVORA" },
    { value: 95, suffix: "%", label: "Strategy Accuracy" },
    { value: 7, suffix: " days", label: "Lead Delivery Time" },
    { value: 2, suffix: " languages", label: "EN & Arabic Support" },
  ];

  const steps = [
    {
      n: "01",
      title: "Sign Up & Set Language",
      desc: "Create your account in seconds and choose English or Arabic as your preferred language.",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      n: "02",
      title: "Complete Onboarding",
      desc: "Answer 6 structured questions about your business, best customers, and GTM process.",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
    },
    {
      n: "03",
      title: "AI Generates Your Strategy",
      desc: "AVORA analyzes your input and generates ICP, DMU, ABM, and Outreach assets in minutes.",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      n: "04",
      title: "Export & Request Leads",
      desc: "Download branded PDFs and order targeted leads delivered within 7 business days.",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      ),
    },
  ];

  const testimonials = [
    {
      quote: "AVORA transformed how we approach B2B sales. The ICP and DMU mapping saved us weeks of research and our outreach response rates tripled.",
      name: "Sarah K.",
      role: "VP of Sales",
      company: "TechCorp MENA",
      initials: "SK",
      color: "bg-blue-500",
    },
    {
      quote: "The AI-generated outreach sequences are incredibly precise. We closed 3 enterprise deals in the first month after implementing AVORA's strategy.",
      name: "Ahmed M.",
      role: "Founder & CEO",
      company: "GrowthLab",
      initials: "AM",
      color: "bg-purple-500",
    },
    {
      quote: "Best investment for our GTM team. The Arabic support made it accessible to our entire team and the lead quality is exceptional.",
      name: "Layla R.",
      role: "Marketing Director",
      company: "Apex Solutions",
      initials: "LR",
      color: "bg-green-500",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden gradient-hero">
        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl float-orb pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl float-orb-delayed pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="text-center max-w-5xl mx-auto"
          >
            {/* Badge */}
            <motion.div variants={fadeUp} custom={0} className="mb-8">
              <span className="inline-flex items-center gap-2 glass-navy text-white/90 text-xs font-semibold px-4 py-2 rounded-full border border-white/10">
                <span className="w-1.5 h-1.5 bg-[#10B981] rounded-full animate-pulse" />
                AI-Powered GTM Strategy Platform
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.05] tracking-tight mb-6"
              style={{ letterSpacing: "-0.02em" }}
            >
              Your GTM Strategy,{" "}
              <br className="hidden md:block" />
              <span className="hero-gradient-text">Built by AI</span> in Minutes
            </motion.h1>

            {/* Subtext */}
            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-xl text-white/65 max-w-2xl mx-auto leading-relaxed mb-10"
            >
              AVORA interviews your business, analyzes your best customers, and generates
              a complete go-to-market strategy — ICP, DMU Map, ABM Playbook, and Outreach sequences.
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={fadeUp}
              custom={3}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            >
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold px-8 py-4 rounded-2xl text-lg transition-colors btn-glow-blue shadow-xl"
                >
                  Get Your Strategy Free
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 glass-navy text-white/90 hover:text-white font-bold px-8 py-4 rounded-2xl text-lg transition-all border border-white/15 hover:border-white/25"
                >
                  Sign In
                </Link>
              </motion.div>
            </motion.div>

            {/* Trust line */}
            <motion.p variants={fadeUp} custom={4} className="text-sm text-white/35">
              Free to start · No credit card required · English & Arabic supported
            </motion.p>
          </motion.div>

          {/* Hero stats preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
          >
            {stats.map((stat, i) => (
              <div key={i} className="glass-navy rounded-2xl p-5 text-center border border-white/10">
                <div className="text-3xl font-extrabold text-white mb-1">
                  <AnimatedNumber target={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-xs text-white/45 font-medium">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" className="w-full" fill="white" preserveAspectRatio="none">
            <path d="M0,80 C360,20 1080,60 1440,30 L1440,80 Z" />
          </svg>
        </div>
      </section>

      {/* ── Social proof marquee ─────────────────────────────── */}
      <section className="py-12 bg-white overflow-hidden border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 mb-6 text-center">
          <p className="text-sm text-gray-400 font-medium uppercase tracking-widest">Trusted by growth teams across industries</p>
        </div>
        <div className="relative overflow-hidden">
          <div className="marquee-track flex items-center gap-16">
            {[...Array(2)].map((_, pass) =>
              ["B2B SaaS", "FinTech", "EdTech", "HealthTech", "E-Commerce", "PropTech", "MarTech", "HR Tech", "LegalTech", "InsurTech"].map((name, i) => (
                <span key={`${pass}-${i}`} className="text-gray-300 font-semibold text-sm whitespace-nowrap px-4">
                  {name}
                </span>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section id="features" className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.span variants={fadeUp} className="inline-block text-xs font-bold text-[#2563EB] uppercase tracking-widest mb-4">
              What You Get
            </motion.span>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="text-4xl md:text-5xl font-bold text-[#1E293B] leading-tight mb-4"
              style={{ letterSpacing: "-0.02em" }}
            >
              Everything You Need to{" "}
              <span className="text-gradient">Win B2B Sales</span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-gray-500 max-w-xl mx-auto text-lg">
              Based on your real business data — not templates, not guesses.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((f, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                custom={i}
                whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(0,0,0,0.10)" }}
                className={`group rounded-2xl p-7 border ${f.border} ${f.bg} cursor-default transition-shadow duration-300`}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center text-white mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  {f.icon}
                </div>
                <h3 className="font-bold text-[#1E293B] mb-3 text-lg">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Stats dark section ───────────────────────────────── */}
      <section className="py-24 gradient-dark-section relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeUp}
              className="text-4xl md:text-5xl font-bold text-white mb-4"
              style={{ letterSpacing: "-0.02em" }}
            >
              Results That Speak for Themselves
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-white/50 text-lg">
              Powered by real data from real businesses
            </motion.p>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {[
              { value: 500, suffix: "+", label: "Companies Onboarded", color: "text-[#60A5FA]" },
              { value: 95, suffix: "%", label: "Strategy Accuracy", color: "text-[#A78BFA]" },
              { value: 3, suffix: "x", label: "Avg Outreach Response Rate", color: "text-[#34D399]" },
              { value: 7, suffix: " days", label: "Lead Delivery SLA", color: "text-[#FBBF24]" },
            ].map((stat, i) => (
              <motion.div key={i} variants={fadeUp} custom={i} className="text-center">
                <div className={`text-5xl font-extrabold mb-2 ${stat.color}`}>
                  <AnimatedNumber target={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-white/50 text-sm font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────── */}
      <section id="how-it-works" className="py-28 gradient-teal-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.span variants={fadeUp} className="inline-block text-xs font-bold text-[#2563EB] uppercase tracking-widest mb-4">
              How It Works
            </motion.span>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="text-4xl md:text-5xl font-bold text-[#1E293B] mb-4"
              style={{ letterSpacing: "-0.02em" }}
            >
              From Zero to Full GTM Strategy
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-gray-500 max-w-xl mx-auto text-lg">
              A structured, AI-guided onboarding that turns your business knowledge into strategy.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {steps.map((s, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                custom={i}
                whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(37,99,235,0.08)" }}
                className="relative bg-white rounded-2xl p-7 border border-blue-50 shadow-sm transition-all duration-300"
              >
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 -right-3 w-6 h-0.5 bg-gradient-to-r from-blue-200 to-transparent z-10" />
                )}
                <div className="w-10 h-10 bg-[#2563EB] text-white rounded-xl flex items-center justify-center mb-5">
                  {s.icon}
                </div>
                <div className="text-xs font-bold text-[#2563EB] mb-2">{s.n}</div>
                <h3 className="font-bold text-[#1E293B] mb-2 text-lg">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────── */}
      <section className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.span variants={fadeUp} className="inline-block text-xs font-bold text-[#2563EB] uppercase tracking-widest mb-4">
              Testimonials
            </motion.span>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="text-4xl md:text-5xl font-bold text-[#1E293B] mb-4"
              style={{ letterSpacing: "-0.02em" }}
            >
              Loved by B2B Teams
            </motion.h2>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                custom={i}
                whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(0,0,0,0.08)" }}
                className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm transition-all duration-300"
              >
                <div className="flex mb-4">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <svg key={s} className="w-4 h-4 text-[#FBBF24]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-6 italic">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                    {t.initials}
                  </div>
                  <div>
                    <div className="font-semibold text-[#1E293B] text-sm">{t.name}</div>
                    <div className="text-gray-400 text-xs">{t.role} · {t.company}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────── */}
      <section id="pricing" className="py-28 gradient-teal-subtle">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.span variants={fadeUp} className="inline-block text-xs font-bold text-[#2563EB] uppercase tracking-widest mb-4">
              Pricing
            </motion.span>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="text-4xl md:text-5xl font-bold text-[#1E293B] mb-4"
              style={{ letterSpacing: "-0.02em" }}
            >
              Simple, Transparent Pricing
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-gray-500 text-lg">
              Start free. Upgrade when you need leads.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* LITE */}
            <motion.div
              variants={fadeUp}
              custom={0}
              whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(0,0,0,0.08)" }}
              className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm transition-all duration-300"
            >
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">LITE</div>
              <div className="text-5xl font-extrabold text-[#1E293B] mb-1">Free</div>
              <p className="text-gray-400 text-sm mb-8">Forever</p>
              <ul className="space-y-3 mb-8">
                {["Full GTM strategy generation", "ICP, DMU, ABM, Outreach", "Up to 3 PDF exports", "Lead requests at $15/lead"].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-gray-600">
                    <span className="w-5 h-5 rounded-full bg-[#DBEAFE] text-[#2563EB] flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">✓</span>
                    {item}
                  </li>
                ))}
                {["Leads Dashboard", "XLSX export"].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-gray-300">
                    <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-300 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">✗</span>
                    {item}
                  </li>
                ))}
              </ul>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/register"
                  className="block text-center border-2 border-[#2563EB] text-[#2563EB] hover:bg-[#2563EB] hover:text-white font-bold px-6 py-3 rounded-xl transition-all duration-200"
                >
                  Start Free
                </Link>
              </motion.div>
            </motion.div>

            {/* PLUS — highlighted */}
            <motion.div
              variants={fadeUp}
              custom={1}
              whileHover={{ y: -4 }}
              className="relative gradient-hero rounded-2xl p-8 text-white shadow-2xl shadow-blue-900/30 md:-mt-4 md:mb-4 transition-all duration-300"
            >
              <div className="absolute top-5 right-5 bg-[#7C3AED] text-white text-xs font-bold px-3 py-1 rounded-full">
                MOST POPULAR
              </div>
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-x-10 -translate-y-10 blur-2xl" />
              <div className="text-xs font-bold text-white/50 uppercase tracking-widest mb-3">PLUS</div>
              <div className="text-5xl font-extrabold mb-1">$5<span className="text-2xl font-normal text-white/50">/lead</span></div>
              <p className="text-white/40 text-sm mb-8">After confirmed payment</p>
              <ul className="space-y-3 mb-8">
                {[
                  "Everything in LITE",
                  "$5/lead (was $15)",
                  "Full Leads Dashboard",
                  "7 business day delivery",
                  "CRM-ready data + personality",
                  "XLSX export ($100/pack)",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-white/85">
                    <span className="w-5 h-5 rounded-full bg-white/15 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/register"
                  className="block text-center bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold px-6 py-3 rounded-xl transition-colors btn-glow-blue shadow-lg"
                >
                  Get Started
                </Link>
              </motion.div>
            </motion.div>

            {/* Enterprise */}
            <motion.div
              variants={fadeUp}
              custom={2}
              whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(0,0,0,0.08)" }}
              className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm transition-all duration-300"
            >
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">ENTERPRISE</div>
              <div className="text-5xl font-extrabold text-[#1E293B] mb-1">Custom</div>
              <p className="text-gray-400 text-sm mb-8">Contact us for pricing</p>
              <ul className="space-y-3 mb-8">
                {["Everything in PLUS", "Dedicated account manager", "Custom lead volumes", "White-label reports", "Team collaboration", "API access"].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-gray-600">
                    <span className="w-5 h-5 rounded-full bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/contact"
                  className="block text-center border-2 border-[#7C3AED] text-[#7C3AED] hover:bg-[#7C3AED] hover:text-white font-bold px-6 py-3 rounded-xl transition-all duration-200"
                >
                  Contact Sales
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────── */}
      <section className="py-28 gradient-hero relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl float-orb" />
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="relative max-w-4xl mx-auto px-4 text-center"
        >
          <motion.h2
            variants={fadeUp}
            className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight"
            style={{ letterSpacing: "-0.02em" }}
          >
            Ready to Build Your{" "}
            <span className="hero-gradient-text">GTM Strategy?</span>
          </motion.h2>
          <motion.p variants={fadeUp} custom={1} className="text-white/55 text-xl max-w-2xl mx-auto mb-10">
            Join hundreds of businesses using AVORA to target the right accounts and close more deals.
          </motion.p>
          <motion.div variants={fadeUp} custom={2} className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold px-10 py-4 rounded-2xl text-lg transition-colors btn-glow-blue shadow-xl"
              >
                Start Building for Free
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 glass-navy text-white/85 hover:text-white font-bold px-8 py-4 rounded-2xl text-lg transition-all border border-white/15"
              >
                Talk to Sales
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="bg-[#0A1628] pt-16 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <AvoraLogo size={32} showTagline textColor="white" taglineColor="rgba(255,255,255,0.35)" />
              <p className="mt-4 text-sm text-white/35 leading-relaxed">
                AI-powered GTM strategy platform for B2B sales teams.
              </p>
              <p className="mt-3 text-xs text-white/25">Payments via Payoneer</p>
            </div>
            {/* Links */}
            {[
              { heading: "Product", links: [{ label: "Features", href: "#features" }, { label: "How It Works", href: "#how-it-works" }, { label: "Pricing", href: "#pricing" }] },
              { heading: "Company", links: [{ label: "Contact Us", href: "/contact" }, { label: "Sign In", href: "/login" }, { label: "Get Started", href: "/register" }] },
              { heading: "Legal", links: [{ label: "Terms of Service", href: "#" }, { label: "Privacy Policy", href: "#" }] },
            ].map((col) => (
              <div key={col.heading}>
                <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">{col.heading}</h4>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="text-sm text-white/50 hover:text-white/90 transition-colors">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/25">© 2025 AVORA by Enigma Sales. All rights reserved.</p>
            <p className="text-xs text-white/20">English & Arabic · AI-Powered GTM Platform</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
