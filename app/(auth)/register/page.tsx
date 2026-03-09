"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AvoraLogo } from "@/components/ui/AvoraLogo";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        setShake(true);
        setTimeout(() => setShake(false), 500);
        return;
      }

      router.push("/onboarding/aria");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel — dark brand side ─── */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero relative overflow-hidden flex-col justify-between p-12">
        {/* Orbs */}
        <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl float-orb pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl float-orb-delayed pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/">
            <AvoraLogo size={38} showTagline textColor="white" taglineColor="rgba(255,255,255,0.4)" />
          </Link>
        </div>

        {/* Center content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center py-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2 className="text-4xl font-extrabold text-white mb-4 leading-tight" style={{ letterSpacing: "-0.02em" }}>
              Build Your Full GTM Strategy{" "}
              <span className="hero-gradient-text">in Minutes</span>
            </h2>
            <p className="text-white/50 text-lg leading-relaxed max-w-sm mb-10">
              No consultants. No templates. Real strategy built from your real business data.
            </p>

            {/* Steps preview */}
            <div className="space-y-4">
              {[
                { step: "01", text: "Answer 6 questions about your business" },
                { step: "02", text: "AI generates your complete GTM strategy" },
                { step: "03", text: "Download PDF or request targeted leads" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.12, duration: 0.5 }}
                  className="flex items-center gap-4"
                >
                  <div className="w-8 h-8 bg-[#2563EB]/80 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0 border border-white/10">
                    {item.step}
                  </div>
                  <span className="text-white/65 text-sm">{item.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Stats row */}
        <div className="relative z-10 grid grid-cols-3 gap-3">
          {[
            { value: "500+", label: "Companies" },
            { value: "Free", label: "To Start" },
            { value: "7 days", label: "Lead SLA" },
          ].map((stat, i) => (
            <div key={i} className="glass-navy rounded-xl p-4 text-center border border-white/8">
              <div className="text-xl font-extrabold text-white mb-0.5">{stat.value}</div>
              <div className="text-xs text-white/35">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel — form side ─── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className={`w-full max-w-md ${shake ? "shake" : ""}`}
        >
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 text-center">
            <Link href="/">
              <AvoraLogo size={40} showTagline />
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-[#1E293B] mb-2" style={{ letterSpacing: "-0.02em" }}>
              Create your account
            </h1>
            <p className="text-gray-500">Start building your GTM strategy for free</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-[#1E293B]">Your name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Smith"
                autoFocus
                className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-[#2563EB] transition-colors text-[#1E293B] placeholder-gray-400 text-sm bg-white outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-[#1E293B]">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-[#2563EB] transition-colors text-[#1E293B] placeholder-gray-400 text-sm bg-white outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-[#1E293B]">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                required
                className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-[#2563EB] transition-colors text-[#1E293B] placeholder-gray-400 text-sm bg-white outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">At least 8 characters</p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-200"
              >
                {error}
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl text-base transition-colors btn-glow-blue shadow-lg flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account...
                </>
              ) : (
                "Create Account & Start →"
              )}
            </motion.button>

            <p className="text-xs text-gray-400 text-center">
              By signing up, you agree to our terms of service.
            </p>
          </form>

          <div className="mt-8 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="text-[#2563EB] font-semibold hover:text-[#1D4ED8] transition-colors">
              Sign in →
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
