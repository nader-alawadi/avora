"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AvoraLogo } from "@/components/ui/AvoraLogo";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const ROLE_LABELS: Record<string, string> = {
  Admin: "Admin — full dashboard access",
  SalesRep: "Sales Rep — CRM access",
  Viewer: "Viewer — read-only access",
};

function InviteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [inviteInfo, setInviteInfo] = useState<{
    email: string; name: string | null; role: string; workspaceDomain: string;
  } | null>(null);
  const [tokenError, setTokenError] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!token) { setTokenError("No invite token found."); setChecking(false); return; }
    fetch(`/api/auth/invite/accept?token=${token}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setTokenError(d.error);
        else { setInviteInfo(d.member); setName(d.member.name || ""); }
      })
      .finally(() => setChecking(false));
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError("Passwords do not match."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/invite/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, name, password }),
      });
      const d = await res.json();
      if (!res.ok) { setError(d.error || "Failed to accept invite."); return; }
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="text-white/60 text-sm">Validating invite…</div>
      </div>
    );
  }

  if (tokenError) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center px-4">
        <div className="glass rounded-2xl p-8 max-w-md w-full text-center">
          <div className="text-4xl mb-4">❌</div>
          <h2 className="font-bold text-white text-lg mb-2">Invalid Invite</h2>
          <p className="text-white/60 text-sm">{tokenError}</p>
          <a href="/login" className="text-white/60 hover:text-white text-sm mt-4 inline-block">
            ← Back to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute top-20 left-1/4 w-72 h-72 bg-white/5 rounded-full blur-3xl pointer-events-none" />
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex justify-center mb-6">
            <AvoraLogo size={48} showText showTagline textColor="white" taglineColor="rgba(255,255,255,0.45)" />
          </div>
          <h1 className="text-2xl font-bold text-white">You&apos;ve been invited</h1>
          <p className="text-white/55 mt-1 text-sm">
            Join the <span className="text-white font-semibold">@{inviteInfo?.workspaceDomain}</span> workspace on AVORA
          </p>
        </div>

        <div className="glass rounded-2xl shadow-xl p-8">
          <div className="bg-white/10 rounded-xl p-3 mb-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-white/60 text-xs">Invited email</p>
                <p className="text-white font-semibold text-sm mt-0.5">{inviteInfo?.email}</p>
              </div>
              <div className="text-right">
                <p className="text-white/60 text-xs">Role</p>
                <p className="text-white text-xs font-medium mt-0.5">
                  {ROLE_LABELS[inviteInfo?.role ?? ""] || inviteInfo?.role}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Your Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              required
            />
            <Input
              label="Set Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              required
            />
            <Input
              label="Confirm Password"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat password"
              required
            />

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg border border-red-200"
              >
                {error}
              </motion.div>
            )}

            <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
              Accept Invite & Join Workspace
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export default function InvitePage() {
  return (
    <Suspense>
      <InviteContent />
    </Suspense>
  );
}
