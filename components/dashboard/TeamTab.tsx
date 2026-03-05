"use client";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface TeamMember {
  id: string;
  email: string;
  name: string | null;
  role: string;
  status: string;
  lastActive: string | null;
  inviteToken: string | null;
  createdAt: string;
}

const ROLE_OPTIONS = [
  {
    value: "Admin",
    label: "Admin",
    desc: "Full dashboard access — can invite & manage team",
    icon: "🔑",
  },
  {
    value: "SalesRep",
    label: "Sales Rep",
    desc: "CRM tab only — manage leads and pipeline",
    icon: "📞",
  },
  {
    value: "Viewer",
    label: "Viewer",
    desc: "Read-only access to reports and CRM",
    icon: "👁",
  },
];

const FREE_LIMIT = 2;

const STATUS_BADGE: Record<string, "default" | "warning" | "success" | "danger"> = {
  Active:  "success",
  Pending: "warning",
  Revoked: "danger",
};

function timeSince(dateStr: string | null) {
  if (!dateStr) return "Never";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 2) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

interface TeamTabProps {
  userEmail: string;
  isOwner: boolean; // workspace owner or Admin teamMember can manage
}

export function TeamTab({ userEmail, isOwner }: TeamTabProps) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [inviting, setInviting] = useState(false);

  // Invite form
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("SalesRep");
  const [formError, setFormError] = useState("");
  const [isPaidWarning, setIsPaidWarning] = useState(false);

  const domain = userEmail.split("@")[1];
  const activeMembers = members.filter((m) => m.status !== "Revoked");
  const atFreeLimit = activeMembers.length >= FREE_LIMIT;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/team");
      if (res.ok) {
        const d = await res.json();
        setMembers(d.members || []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setInviting(true);
    try {
      const res = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });
      const d = await res.json();
      if (!res.ok) { setFormError(d.error || "Failed to invite"); return; }
      setInviteUrl(d.inviteUrl);
      setIsPaidWarning(!!d.isPaid);
      setEmail("");
      setShowInviteForm(false);
      await load();
    } finally {
      setInviting(false);
    }
  }

  async function handleRoleChange(id: string, newRole: string) {
    await fetch("/api/team", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, role: newRole }),
    });
    await load();
  }

  async function handleRevoke(id: string) {
    if (!confirm("Revoke this member's access?")) return;
    await fetch("/api/team", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await load();
  }

  function copyLink(text: string, id: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }

  function buildInviteUrl(token: string | null) {
    if (!token) return null;
    return `${window.location.origin}/invite?token=${token}`;
  }

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-400 text-sm">Loading team…</div>
    );
  }

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="font-bold text-[#1F2A2A] text-lg">Workspace Team</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Invite colleagues from <span className="font-medium text-[#1E6663]">@{domain}</span> to collaborate
          </p>
        </div>
        {isOwner && (
          <Button size="sm" variant="secondary" onClick={() => { setShowInviteForm(!showInviteForm); setInviteUrl(null); }}>
            {showInviteForm ? "Cancel" : "+ Invite Member"}
          </Button>
        )}
      </div>

      {/* Free seat info */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6 flex items-center gap-4">
        <div className="flex-1">
          <p className="text-sm font-semibold text-[#1F2A2A]">
            {activeMembers.length} / {FREE_LIMIT} free seats used
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            First {FREE_LIMIT} members are free · Additional members require a $50/user payment via WhatsApp
          </p>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: FREE_LIMIT }).map((_, i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full ${
                i < activeMembers.length ? "bg-[#1E6663]" : "bg-gray-200"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Invite form */}
      {showInviteForm && isOwner && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-200 rounded-xl p-5 mb-6"
        >
          <h3 className="font-semibold text-[#1F2A2A] text-sm mb-4">Invite a Team Member</h3>

          {atFreeLimit && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-xs text-amber-700">
              ⚠️ You&apos;ve used all {FREE_LIMIT} free seats. This invite will require a <strong>$50/user</strong> payment.
              After inviting, contact us on WhatsApp to complete the payment.
            </div>
          )}

          <form onSubmit={handleInvite} className="space-y-4">
            <Input
              label={`Email (@${domain} only)`}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={`colleague@${domain}`}
              required
            />
            <div>
              <p className="text-xs font-medium text-gray-700 mb-2">Permission Level</p>
              <div className="grid grid-cols-3 gap-2">
                {ROLE_OPTIONS.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={`border rounded-xl p-3 text-left transition-colors ${
                      role === r.value
                        ? "border-[#1E6663] bg-[#1E6663]/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <span className="text-lg block mb-1">{r.icon}</span>
                    <p className="font-semibold text-[#1F2A2A] text-xs">{r.label}</p>
                    <p className="text-gray-400 text-[10px] mt-0.5 leading-snug">{r.desc}</p>
                  </button>
                ))}
              </div>
            </div>
            {formError && (
              <p className="text-red-500 text-xs bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
                {formError}
              </p>
            )}
            <Button type="submit" variant="secondary" size="sm" loading={inviting}>
              Generate Invite Link
            </Button>
          </form>
        </motion.div>
      )}

      {/* Invite link result */}
      {inviteUrl && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-[#1E6663]/8 border border-[#1E6663]/20 rounded-xl p-4 mb-6"
        >
          <p className="text-xs font-semibold text-[#1E6663] mb-2">Invite Link Ready ✓</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs bg-white border border-gray-200 rounded px-3 py-2 truncate font-mono text-gray-600">
              {inviteUrl}
            </code>
            <Button size="sm" variant="ghost" onClick={() => copyLink(inviteUrl, "new")}>
              {copiedId === "new" ? "Copied!" : "Copy"}
            </Button>
          </div>
          {isPaidWarning && (
            <p className="text-xs text-amber-600 mt-2">
              ⚠️ This is a paid seat ($50). Please{" "}
              <a
                href={`https://wa.me/201011348217?text=${encodeURIComponent(
                  `Hi, I need to add an extra team member to my AVORA workspace. Email: ${email}. Please send payment link.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-medium"
              >
                contact us on WhatsApp
              </a>{" "}
              to confirm payment before access is granted.
            </p>
          )}
          <p className="text-[10px] text-[#1E6663]/70 mt-1">Link expires in 7 days.</p>
        </motion.div>
      )}

      {/* Member list */}
      {members.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <div className="text-4xl mb-3">👥</div>
          <p className="font-semibold text-[#1F2A2A]">No team members yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Invite colleagues from @{domain} to collaborate on your workspace
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Member</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Role</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Last Active</th>
                {isOwner && (
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {members.map((m) => {
                const url = buildInviteUrl(m.inviteToken);
                return (
                  <tr key={m.id} className={`hover:bg-gray-50 ${m.status === "Revoked" ? "opacity-50" : ""}`}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#1F2A2A]">{m.name || "—"}</p>
                      <p className="text-xs text-gray-400">{m.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      {isOwner && m.status !== "Revoked" ? (
                        <select
                          value={m.role}
                          onChange={(e) => handleRoleChange(m.id, e.target.value)}
                          className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#1E6663]"
                        >
                          {ROLE_OPTIONS.map((r) => (
                            <option key={r.value} value={r.value}>{r.label}</option>
                          ))}
                        </select>
                      ) : (
                        <Badge variant="default">{m.role}</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_BADGE[m.status] || "default"}>{m.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">{timeSince(m.lastActive)}</td>
                    {isOwner && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {url && m.status === "Pending" && (
                            <button
                              onClick={() => copyLink(url, m.id)}
                              className="text-xs text-[#1E6663] hover:underline"
                            >
                              {copiedId === m.id ? "Copied!" : "Copy Link"}
                            </button>
                          )}
                          {m.status !== "Revoked" && (
                            <button
                              onClick={() => handleRevoke(m.id)}
                              className="text-xs text-red-400 hover:text-red-600"
                            >
                              Revoke
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
