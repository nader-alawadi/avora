"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AvoraLogo } from "@/components/ui/AvoraLogo";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        setShake(true);
        setTimeout(() => setShake(false), 500);
        return;
      }

      if (data.user.isAdmin) {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
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
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl float-orb pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl float-orb-delayed pointer-events-none" />

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
              Your GTM Strategy,{" "}
              <span className="hero-gradient-text">Powered by AI</span>
            </h2>
            <p className="text-white/50 text-lg leading-relaxed max-w-sm mb-10">
              Generate ICP, DMU Map, ABM Strategy, and Outreach Playbooks in minutes.
            </p>

            {/* Feature bullets */}
            <div className="space-y-4">
              {[
                { icon: "🎯", text: "AI-generated Ideal Customer Profile" },
                { icon: "🗺️", text: "Decision Making Unit mapping" },
                { icon: "📨", text: "Multi-channel outreach sequences" },
                { icon: "📊", text: "Targeted leads delivered in 7 days" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-8 h-8 glass-navy rounded-lg flex items-center justify-center text-sm border border-white/10 flex-shrink-0">
                    {item.icon}
                  </div>
                  <span className="text-white/65 text-sm">{item.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom quote */}
        <div className="relative z-10 glass-navy rounded-2xl p-5 border border-white/10">
          <p className="text-white/65 text-sm italic leading-relaxed">
            &ldquo;AVORA tripled our outreach response rates and cut our ICP research time from weeks to minutes.&rdquo;
          </p>
          <div className="flex items-center gap-2 mt-3">
            <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">SK</div>
            <div>
              <p className="text-white/80 text-xs font-semibold">Sarah K.</p>
              <p className="text-white/35 text-xs">VP of Sales · TechCorp MENA</p>
            </div>
          </div>
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
              Welcome back
            </h1>
            <p className="text-gray-500">Sign in to your AVORA account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-[#1E293B]">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                autoFocus
                className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-[#2563EB] transition-colors text-[#1E293B] placeholder-gray-400 text-sm bg-white outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-[#1E293B]">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-[#2563EB] transition-colors text-[#1E293B] placeholder-gray-400 text-sm bg-white outline-none"
              />
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
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </motion.button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-[#2563EB] font-semibold hover:text-[#1D4ED8] transition-colors">
              Create one free →
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
