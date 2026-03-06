"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { AvoraLogo } from "@/components/ui/AvoraLogo";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function LandingPage() {
  const features = [
    {
      icon: "🎯",
      title: "Ideal Customer Profile (ICP)",
      desc: "AI-generated ICP with firmographics, psychographics, triggers, and disqualifiers based on your real customer evidence.",
      color: "from-teal-500/10 to-teal-600/5",
      border: "border-teal-100",
    },
    {
      icon: "🗺️",
      title: "Decision Making Unit (DMU) Map",
      desc: "Map every stakeholder involved in the buying process — economic buyer, champion, technical buyer, and more.",
      color: "from-blue-500/10 to-blue-600/5",
      border: "border-blue-100",
    },
    {
      icon: "🏆",
      title: "ABM Targeting Strategy",
      desc: "Account-based marketing strategy with Tier 1, 2, and 3 segmentation and prioritization frameworks.",
      color: "from-amber-500/10 to-amber-600/5",
      border: "border-amber-100",
    },
    {
      icon: "📨",
      title: "Outreach Playbook",
      desc: "LinkedIn, Email, and WhatsApp outreach sequences with messaging frameworks tailored to your ICP.",
      color: "from-purple-500/10 to-purple-600/5",
      border: "border-purple-100",
    },
    {
      icon: "🔍",
      title: "Lookalike Search Criteria",
      desc: "Boolean search strings and criteria to find accounts that match your best customers — no personal data exposed.",
      color: "from-cyan-500/10 to-cyan-600/5",
      border: "border-cyan-100",
    },
    {
      icon: "📊",
      title: "Leads Dashboard",
      desc: "Order targeted leads delivered by the Enigma Sales team with full CRM data and personality analysis links.",
      color: "from-rose-500/10 to-rose-600/5",
      border: "border-rose-100",
    },
  ];

  const steps = [
    { n: "01", title: "Sign Up & Set Language", desc: "Create your account and choose English or Arabic." },
    { n: "02", title: "Complete Onboarding", desc: "Answer 6 structured steps about your business, customers, and GTM process." },
    { n: "03", title: "AI Generates Your Strategy", desc: "AVORA analyzes your input and generates ICP, DMU, ABM, and Outreach assets." },
    { n: "04", title: "Export & Request Leads", desc: "Download branded PDFs and order targeted leads delivered within 7 business days." },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* ── Nav ───────────────────────────────────────────── */}
      <nav className="border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur-xl z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href="/">
            <AvoraLogo size={34} showTagline />
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/contact"
              className="text-sm text-gray-600 hover:text-[#1E6663] font-medium transition-colors"
            >
              Contact Us
            </Link>
            <Link
              href="/login"
              className="text-sm text-gray-600 hover:text-[#1E6663] font-medium transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="bg-[#FF6B63] hover:bg-[#e55d55] hover:scale-[1.03] active:scale-[0.97] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all shadow-sm hover:shadow-[0_4px_12px_rgba(255,107,99,0.35)]"
            >
              Start Free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 bg-[url('/avora-logo.svg')] opacity-[0.03] bg-center bg-no-repeat bg-[length:600px_600px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="space-y-6"
          >
            <motion.div variants={fadeUp} custom={0}>
              <div className="inline-flex items-center gap-2 bg-white/10 text-white/90 text-xs font-semibold px-3 py-1.5 rounded-full border border-white/20 backdrop-blur-sm">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                AI-Powered GTM Strategy Platform
              </div>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.08] max-w-4xl mx-auto tracking-tight"
            >
              Your GTM Strategy,
              <br />
              <span className="text-[#4ecdc4]">Built by AI</span> in Minutes
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-xl text-white/70 max-w-2xl mx-auto leading-relaxed"
            >
              AVORA interviews your business, analyzes your best customers, and generates
              a complete go-to-market strategy — ICP, DMU Map, ABM Playbook, and Outreach sequences.
            </motion.p>

            <motion.div
              variants={fadeUp}
              custom={3}
              className="flex flex-col sm:flex-row gap-4 justify-center pt-2"
            >
              <Link
                href="/register"
                className="bg-[#FF6B63] hover:bg-[#e55d55] hover:scale-[1.03] active:scale-[0.97] text-white font-bold px-8 py-4 rounded-xl text-lg transition-all shadow-lg shadow-[#FF6B63]/30 hover:shadow-xl hover:shadow-[#FF6B63]/40"
              >
                Get Your Strategy Free →
              </Link>
              <Link
                href="/login"
                className="glass text-white hover:bg-white/20 hover:scale-[1.03] active:scale-[0.97] font-bold px-8 py-4 rounded-xl text-lg transition-all border border-white/30"
              >
                Sign In
              </Link>
            </motion.div>

            <motion.p variants={fadeUp} custom={4} className="text-sm text-white/40">
              Free to start · No credit card required · English & Arabic supported
            </motion.p>
          </motion.div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" className="w-full" fill="white">
            <path d="M0,60 C360,0 1080,60 1440,20 L1440,60 Z" />
          </svg>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="text-center mb-14"
          >
            <motion.h2 variants={fadeUp} className="text-4xl font-bold text-[#1F2A2A]">
              What AVORA Generates For You
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-gray-500 mt-3 max-w-xl mx-auto">
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
                className={`group rounded-2xl p-6 border ${f.border} bg-gradient-to-br ${f.color} hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-default`}
              >
                <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-300 inline-block">
                  {f.icon}
                </div>
                <h3 className="font-bold text-[#1F2A2A] mb-2 text-base">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────── */}
      <section className="gradient-teal-subtle py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="text-center mb-14"
          >
            <motion.h2 variants={fadeUp} className="text-4xl font-bold text-[#1F2A2A]">
              How AVORA Works
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-gray-500 mt-3 max-w-xl mx-auto">
              A structured, AI-guided onboarding that turns your business knowledge into strategy.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {steps.map((s, i) => (
              <motion.div key={i} variants={fadeUp} custom={i} className="text-center group">
                <div className="relative inline-block mb-5">
                  <div className="w-14 h-14 bg-[#1E6663] text-white rounded-2xl flex items-center justify-center font-bold text-lg mx-auto shadow-md group-hover:shadow-[var(--shadow-teal)] transition-shadow duration-300">
                    {s.n}
                  </div>
                  {i < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-7 left-full w-full h-0.5 bg-gradient-to-r from-[#1E6663]/30 to-transparent ml-2" />
                  )}
                </div>
                <h3 className="font-bold text-[#1F2A2A] mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="text-center mb-14"
          >
            <motion.h2 variants={fadeUp} className="text-4xl font-bold text-[#1F2A2A]">
              Simple, Transparent Pricing
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <motion.div
              variants={fadeUp}
              custom={0}
              className="bg-white rounded-2xl p-8 border-2 border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300"
            >
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">LITE</div>
              <div className="text-5xl font-bold text-[#1F2A2A]">Free</div>
              <ul className="mt-7 space-y-3 text-sm text-gray-600">
                {[
                  "Full GTM strategy generation",
                  "ICP, DMU, ABM, Outreach Playbook",
                  "Up to 3 PDF exports",
                  "Lead requests at $15/lead",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#1E6663]/10 text-[#1E6663] flex items-center justify-center text-xs font-bold flex-shrink-0">✓</span>
                    {item}
                  </li>
                ))}
                {["Leads Dashboard", "XLSX export"].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-gray-300">
                    <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-300 flex items-center justify-center text-xs flex-shrink-0">✗</span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="mt-8 block text-center border-2 border-[#1E6663] text-[#1E6663] hover:bg-[#1E6663] hover:text-white hover:scale-[1.02] active:scale-[0.98] font-bold px-6 py-3 rounded-xl transition-all"
              >
                Start Free
              </Link>
            </motion.div>

            <motion.div
              variants={fadeUp}
              custom={1}
              className="gradient-hero rounded-2xl p-8 relative overflow-hidden text-white hover:shadow-[var(--shadow-teal)] transition-shadow duration-300"
            >
              <div className="absolute top-5 right-5 bg-[#FF6B63] text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                BEST VALUE
              </div>
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-x-10 -translate-y-10 blur-2xl" />
              <div className="text-xs font-bold text-white/50 uppercase tracking-widest mb-2">PLUS</div>
              <div className="text-5xl font-bold">$5<span className="text-2xl font-normal text-white/60">/lead</span></div>
              <p className="text-white/50 text-sm mt-1">After confirmed payment</p>
              <ul className="mt-7 space-y-3 text-sm text-white/90">
                {[
                  "Everything in LITE",
                  "$5/lead (was $15)",
                  "Full Leads Dashboard",
                  "Delivery in 7 business days",
                  "CRM-ready data + personality links",
                  "XLSX export (Export Pack = $100)",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-white/20 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="mt-8 block text-center bg-[#FF6B63] hover:bg-[#e55d55] hover:scale-[1.02] active:scale-[0.98] text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md"
              >
                Get Started
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────── */}
      <section className="gradient-teal-subtle py-24">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
          className="max-w-4xl mx-auto px-4 text-center"
        >
          <motion.div variants={fadeUp} custom={0}>
            <AvoraLogo size={52} showText={false} />
            <div className="flex justify-center mb-6 mt-4" />
          </motion.div>
          <motion.h2 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-bold text-[#1F2A2A] leading-tight">
            Ready to Build Your GTM Strategy?
          </motion.h2>
          <motion.p variants={fadeUp} custom={2} className="text-gray-500 mt-4 text-lg max-w-2xl mx-auto">
            Join businesses using AVORA to target the right accounts and close more deals.
          </motion.p>
          <motion.div variants={fadeUp} custom={3}>
            <Link
              href="/register"
              className="mt-8 inline-block bg-[#FF6B63] hover:bg-[#e55d55] hover:scale-[1.03] active:scale-[0.97] text-white font-bold px-10 py-4 rounded-2xl text-lg transition-all shadow-lg shadow-[#FF6B63]/25 hover:shadow-xl"
            >
              Start Building for Free →
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <AvoraLogo size={28} showTagline />
          <p className="text-sm text-gray-400">© 2024 AVORA by Enigma Sales. All rights reserved.</p>
          <p className="text-xs text-gray-400">Payments processed via Payoneer.</p>
        </div>
      </footer>
    </div>
  );
}
