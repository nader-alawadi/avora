"use client";
import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface AdminMember {
  id: string;
  email: string;
  name: string | null;
  adminRole: string;
  assignedClientIds: string[];
  status: string;
  lastActive: string | null;
  inviteToken: string | null;
  createdAt: string;
}

interface Client {
  id: string;
  email: string;
  name: string | null;
}

const ROLE_OPTIONS = [
  { value: "SuperAdmin",      label: "Super Admin",      desc: "Full access to everything" },
  { value: "AccountManager",  label: "Account Manager",  desc: "Clients, orders & delivery" },
  { value: "LeadResearcher",  label: "Lead Researcher",  desc: "Deliver Leads tab only" },
];

const ROLE_BADGE: Record<string, "default" | "warning" | "success" | "info"> = {
  SuperAdmin:     "success",
  AccountManager: "info",
  LeadResearcher: "default",
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

export function AdminTeamTab() {
  const [members, setMembers] = useState<AdminMember[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Invite form state
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [adminRole, setAdminRole] = useState("AccountManager");
  const [formError, setFormError] = useState("");

  // Assign clients modal
  const [assigningMember, setAssigningMember] = useState<AdminMember | null>(null);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [teamRes, usersRes] = await Promise.all([
        fetch("/api/admin/team"),
        fetch("/api/admin/users"),
      ]);
      const [teamData, usersData] = await Promise.all([teamRes.json(), usersRes.json()]);
      setMembers(teamData.members || []);
      setClients(usersData.users || []);
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
      const res = await fetch("/api/admin/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, adminRole }),
      });
      const d = await res.json();
      if (!res.ok) { setFormError(d.error || "Failed to invite"); return; }
      setInviteUrl(d.inviteUrl);
      setEmail(""); setName(""); setAdminRole("AccountManager");
      setShowInviteForm(false);
      await load();
    } finally {
      setInviting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this team member?")) return;
    await fetch("/api/admin/team", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await load();
  }

  async function handleRoleChange(id: string, newRole: string) {
    await fetch("/api/admin/team", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, adminRole: newRole }),
    });
    await load();
  }

  async function saveAssignedClients() {
    if (!assigningMember) return;
    await fetch("/api/admin/team", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: assigningMember.id, assignedClientIds: selectedClients }),
    });
    setAssigningMember(null);
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
    return `${window.location.origin}/admin-invite?token=${token}`;
  }

  if (loading) return <div className="text-gray-400 text-sm py-8 text-center">Loading team…</div>;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-bold text-[#1F2A2A] text-lg">Internal Team</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage Enigma Sales team access to the admin panel</p>
        </div>
        <Button size="sm" variant="secondary" onClick={() => setShowInviteForm(!showInviteForm)}>
          {showInviteForm ? "Cancel" : "+ Invite Member"}
        </Button>
      </div>

      {/* Invite form */}
      {showInviteForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
          <h3 className="font-semibold text-[#1F2A2A] text-sm mb-4">Invite Team Member</h3>
          <form onSubmit={handleInvite} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="team@enigmasales.io"
                required
              />
              <Input
                label="Name (optional)"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
              />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-700 mb-2">Role</p>
              <div className="grid grid-cols-3 gap-2">
                {ROLE_OPTIONS.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setAdminRole(r.value)}
                    className={`border rounded-lg p-3 text-left transition-colors ${
                      adminRole === r.value
                        ? "border-[#1E6663] bg-[#1E6663]/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <p className="font-semibold text-[#1F2A2A] text-xs">{r.label}</p>
                    <p className="text-gray-400 text-[10px] mt-0.5">{r.desc}</p>
                  </button>
                ))}
              </div>
            </div>
            {formError && (
              <p className="text-red-500 text-xs bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
                {formError}
              </p>
            )}
            <div className="flex gap-2">
              <Button type="submit" variant="secondary" size="sm" loading={inviting}>
                Generate Invite Link
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Invite link result */}
      {inviteUrl && (
        <div className="bg-[#1E6663]/8 border border-[#1E6663]/20 rounded-xl p-4 mb-6">
          <p className="text-xs font-semibold text-[#1E6663] mb-2">Invite Link Generated ✓</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs bg-white border border-gray-200 rounded px-3 py-2 truncate font-mono text-gray-600">
              {inviteUrl}
            </code>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => copyLink(inviteUrl, "new")}
            >
              {copiedId === "new" ? "Copied!" : "Copy"}
            </Button>
          </div>
          <p className="text-[10px] text-[#1E6663]/70 mt-2">Share this link with the invitee. Expires in 7 days.</p>
        </div>
      )}

      {/* Team list */}
      {members.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <div className="text-4xl mb-3">👥</div>
          <p className="font-semibold text-[#1F2A2A]">No team members yet</p>
          <p className="text-sm text-gray-400 mt-1">Invite your first team member above</p>
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
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Clients</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {members.map((m) => {
                const url = buildInviteUrl(m.inviteToken);
                return (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#1F2A2A]">{m.name || "—"}</p>
                      <p className="text-xs text-gray-400">{m.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={m.adminRole}
                        onChange={(e) => handleRoleChange(m.id, e.target.value)}
                        className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#1E6663]"
                      >
                        {ROLE_OPTIONS.map((r) => (
                          <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={m.status === "Active" ? "success" : "warning"}>
                        {m.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">{timeSince(m.lastActive)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => {
                          setAssigningMember(m);
                          setSelectedClients(m.assignedClientIds || []);
                        }}
                        className="text-xs text-[#1E6663] hover:underline"
                      >
                        {m.adminRole === "SuperAdmin"
                          ? "All clients"
                          : `${(m.assignedClientIds || []).length} assigned`}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {url && (
                          <button
                            onClick={() => copyLink(url, m.id)}
                            className="text-xs text-gray-400 hover:text-[#1E6663]"
                            title="Copy invite link"
                          >
                            {copiedId === m.id ? "Copied!" : "Copy Link"}
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(m.id)}
                          className="text-xs text-red-400 hover:text-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Assign clients modal */}
      {assigningMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-[#1F2A2A]">Assign Clients</h3>
                <p className="text-xs text-gray-400 mt-0.5">{assigningMember.name || assigningMember.email}</p>
              </div>
              <button onClick={() => setAssigningMember(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <p className="text-xs text-gray-500 mb-3">
              Select which clients this Account Manager can view and manage:
            </p>
            <div className="max-h-64 overflow-y-auto space-y-1 border border-gray-100 rounded-lg p-2 mb-4">
              {clients.map((c) => (
                <label key={c.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedClients.includes(c.id)}
                    onChange={(e) => {
                      setSelectedClients((prev) =>
                        e.target.checked ? [...prev, c.id] : prev.filter((id) => id !== c.id)
                      );
                    }}
                    className="accent-[#1E6663]"
                  />
                  <div>
                    <p className="text-sm font-medium text-[#1F2A2A]">{c.name || c.email}</p>
                    {c.name && <p className="text-xs text-gray-400">{c.email}</p>}
                  </div>
                </label>
              ))}
              {clients.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-4">No clients yet</p>
              )}
            </div>
            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="ghost" onClick={() => setAssigningMember(null)}>Cancel</Button>
              <Button size="sm" variant="secondary" onClick={saveAssignedClients}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
