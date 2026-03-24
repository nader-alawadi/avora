"use client";
import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

// ── Types ──────────────────────────────────────────────────────────────────

interface AttendanceLog {
  id: string;
  date: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  hoursWorked: number | null;
  status: string;
}

interface AttendanceSummary {
  present: number;
  late: number;
  absent: number;
  workingDays: number;
  attendanceRate: number;
}

interface PerformanceData {
  thisMonth: { totalDelivered: number; qualified: number; rejected: number; grossBonus: number; attendanceRate: number };
  today: { delivered: number; target: number };
  allTime: { availableBalance: number; grossBonus: number; totalWithdrawn: number };
  performanceLog: { date: string; orderId: string; clientName: string; delivered: number; qualified: number; rejected: number; bonusEarned: number }[];
}

interface Profile {
  id: string;
  name: string | null;
  email: string;
  adminRole: string;
  jobTitle: string | null;
  phone: string | null;
  nationalId: string | null;
  bankAccount: string | null;
  eWallet: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

interface Withdrawal {
  id: string;
  amount: number;
  accountDetails: string;
  status: string;
  adminNote: string | null;
  createdAt: string;
}

const TABS = [
  { id: "today", label: "Today", icon: "📅" },
  { id: "performance", label: "Performance", icon: "📊" },
  { id: "bonus", label: "Bonus", icon: "💰" },
  { id: "attendance", label: "Attendance", icon: "🗓️" },
  { id: "leads", label: "Leads", icon: "🎯" },
  { id: "profile", label: "Profile", icon: "👤" },
];

const ROLE_LABELS: Record<string, string> = {
  SuperAdmin: "Super Admin",
  AccountManager: "Account Manager",
  LeadResearcher: "Lead Researcher",
};

// ── Main component ─────────────────────────────────────────────────────────

export function EmployeeDashboard({ memberName, memberRole }: { memberName: string | null; memberRole: string | null }) {
  const [activeTab, setActiveTab] = useState("today");

  // attendance state
  const [todayAtt, setTodayAtt] = useState<AttendanceLog | null>(null);
  const [monthlyAtt, setMonthlyAtt] = useState<AttendanceLog[]>([]);
  const [attSummary, setAttSummary] = useState<AttendanceSummary | null>(null);
  const [attLoading, setAttLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);

  // performance state
  const [perf, setPerf] = useState<PerformanceData | null>(null);
  const [perfLoading, setPerfLoading] = useState(true);

  // profile state
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profForm, setProfForm] = useState<Partial<Profile>>({});
  const [profSaving, setProfSaving] = useState(false);
  const [profMsg, setProfMsg] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);

  // withdrawal state
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawForm, setWithdrawForm] = useState({ amount: "", accountDetails: "" });
  const [withdrawSubmitting, setWithdrawSubmitting] = useState(false);
  const [withdrawMsg, setWithdrawMsg] = useState("");

  // ── Data fetchers ──────────────────────────────────────────────────────

  const loadAttendance = useCallback(async () => {
    setAttLoading(true);
    try {
      const res = await fetch("/api/hr/attendance");
      const d = await res.json();
      setTodayAtt(d.today || null);
      setMonthlyAtt(d.monthly || []);
      setAttSummary(d.summary || null);
    } catch { /* silent */ }
    setAttLoading(false);
  }, []);

  const loadPerformance = useCallback(async () => {
    setPerfLoading(true);
    try {
      const res = await fetch("/api/hr/performance");
      const d = await res.json();
      setPerf(d);
    } catch { /* silent */ }
    setPerfLoading(false);
  }, []);

  const loadProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/hr/profile");
      const d = await res.json();
      if (d.member) {
        setProfile(d.member);
        setProfForm(d.member);
      }
    } catch { /* silent */ }
  }, []);

  const loadWithdrawals = useCallback(async () => {
    try {
      const res = await fetch("/api/hr/withdrawal");
      const d = await res.json();
      setWithdrawals(d.withdrawals || []);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetchers set state after await, not synchronously
    loadAttendance(); loadPerformance(); loadProfile(); loadWithdrawals();
  }, [loadAttendance, loadPerformance, loadProfile, loadWithdrawals]);

  // ── Actions ────────────────────────────────────────────────────────────

  async function handleCheckIn() {
    setCheckingIn(true);
    const action = todayAtt?.checkInTime && !todayAtt.checkOutTime ? "checkout" : "checkin";
    try {
      const res = await fetch("/api/hr/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) await loadAttendance();
    } catch { /* silent */ }
    setCheckingIn(false);
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    setProfMsg("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/hr/profile/avatar", { method: "POST", body: fd });
      const d = await res.json();
      if (d.avatarUrl) {
        setProfForm((f) => ({ ...f, avatarUrl: d.avatarUrl }));
        setProfile((p) => p ? { ...p, avatarUrl: d.avatarUrl } : p);
        setProfMsg("Avatar updated!");
        setTimeout(() => setProfMsg(""), 3000);
      } else {
        setProfMsg(d.error || "Upload failed");
      }
    } catch {
      setProfMsg("Upload failed");
    }
    setAvatarUploading(false);
    // Reset input so the same file can be re-selected
    e.target.value = "";
  }

  async function saveProfile() {
    setProfSaving(true);
    setProfMsg("");
    try {
      const res = await fetch("/api/hr/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profForm.name,
          jobTitle: profForm.jobTitle,
          phone: profForm.phone,
          nationalId: profForm.nationalId,
          bankAccount: profForm.bankAccount,
          eWallet: profForm.eWallet,
          avatarUrl: profForm.avatarUrl,
        }),
      });
      const d = await res.json();
      if (d.member) { setProfile(d.member); setProfMsg("Saved!"); }
      else setProfMsg(d.error || "Failed to save");
    } catch { setProfMsg("Failed to save"); }
    setProfSaving(false);
    setTimeout(() => setProfMsg(""), 3000);
  }

  async function submitWithdrawal() {
    setWithdrawSubmitting(true);
    setWithdrawMsg("");
    try {
      const res = await fetch("/api/hr/withdrawal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(withdrawForm.amount), accountDetails: withdrawForm.accountDetails }),
      });
      const d = await res.json();
      if (d.withdrawal) {
        setShowWithdrawModal(false);
        setWithdrawForm({ amount: "", accountDetails: "" });
        loadWithdrawals();
        setWithdrawMsg("Withdrawal request submitted!");
        setTimeout(() => setWithdrawMsg(""), 4000);
      } else {
        setWithdrawMsg(d.error || "Failed");
      }
    } catch { setWithdrawMsg("Failed"); }
    setWithdrawSubmitting(false);
  }

  // ── Helpers ────────────────────────────────────────────────────────────

  function fmt(dt: string | null | undefined) {
    if (!dt) return "—";
    return new Date(dt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  function fmtDate(d: string) {
    return new Date(d + "T00:00:00Z").toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }
  function egp(n: number) {
    return `${n.toLocaleString()} EGP`;
  }

  const checkedIn = !!todayAtt?.checkInTime;
  const checkedOut = !!todayAtt?.checkOutTime;
  const isShiftActive = checkedIn && !checkedOut;

  // ── Render sections ────────────────────────────────────────────────────

  const todayProgress = perf
    ? Math.min(100, Math.round((perf.today.delivered / (perf.today.target || 10)) * 100))
    : 0;

  return (
    <div className="min-h-screen bg-[#F5F7F7]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1E6663] flex items-center justify-center text-white font-bold text-sm">
              {(memberName || "A").charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-[#1F2A2A]">{memberName || "Employee"}</p>
              <p className="text-xs text-gray-500">{ROLE_LABELS[memberRole || ""] || memberRole}</p>
            </div>
          </div>
          <div className="text-right text-xs text-gray-500">
            <p className="font-medium text-[#1F2A2A]">{new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</p>
            <p>Employee Dashboard</p>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="max-w-5xl mx-auto flex gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === t.id
                  ? "border-[#1E6663] text-[#1E6663]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <span>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">

        {/* ── TODAY ──────────────────────────────────────────────────── */}
        {activeTab === "today" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Check-in card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
              <h2 className="font-semibold text-[#1F2A2A]">Today&apos;s Shift</h2>
              {attLoading ? (
                <div className="h-20 bg-gray-100 rounded-lg animate-pulse" />
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide">Check-in</p>
                      <p className="font-medium text-[#1F2A2A] mt-0.5">{fmt(todayAtt?.checkInTime)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide">Check-out</p>
                      <p className="font-medium text-[#1F2A2A] mt-0.5">{fmt(todayAtt?.checkOutTime)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide">Hours Worked</p>
                      <p className="font-medium text-[#1F2A2A] mt-0.5">
                        {todayAtt?.hoursWorked != null
                          ? `${todayAtt.hoursWorked.toFixed(1)}h`
                          : isShiftActive
                            ? "In progress…"
                            : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide">Status</p>
                      <div className="mt-0.5">
                        {todayAtt?.status === "Present" && <Badge variant="success">Present</Badge>}
                        {todayAtt?.status === "Late" && <Badge variant="warning">Late</Badge>}
                        {(!todayAtt || todayAtt.status === "Absent") && <Badge variant="default">Absent</Badge>}
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleCheckIn}
                    disabled={checkingIn || checkedOut}
                    className={`w-full py-3 text-sm font-semibold rounded-xl transition-all ${
                      checkedOut
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : isShiftActive
                          ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                          : "bg-[#1E6663] text-white hover:bg-[#175553]"
                    }`}
                  >
                    {checkingIn ? "…" : checkedOut ? "Shift Complete ✓" : isShiftActive ? "Check Out" : "Check In"}
                  </Button>
                </>
              )}
            </div>

            {/* Daily target card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
              <h2 className="font-semibold text-[#1F2A2A]">Daily Lead Target</h2>
              {perfLoading ? (
                <div className="h-20 bg-gray-100 rounded-lg animate-pulse" />
              ) : perf ? (
                <>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-3xl font-bold text-[#1E6663]">{perf.today.delivered}</p>
                      <p className="text-sm text-gray-500">leads delivered today</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-600">/ {perf.today.target}</p>
                      <p className="text-xs text-gray-400">daily target</p>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${todayProgress >= 100 ? "bg-green-500" : "bg-[#1E6663]"}`}
                        style={{ width: `${todayProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 text-right">{todayProgress}% of target</p>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        )}

        {/* ── PERFORMANCE ────────────────────────────────────────────── */}
        {activeTab === "performance" && (
          <div className="space-y-6">
            <h2 className="font-semibold text-[#1F2A2A]">This Month&apos;s KPIs</h2>
            {perfLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : perf ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { label: "Total Delivered", value: perf.thisMonth.totalDelivered, icon: "📦", color: "text-[#1E6663]" },
                  { label: "Qualified Leads", value: perf.thisMonth.qualified, icon: "✅", color: "text-green-600" },
                  { label: "Disputed Leads", value: perf.thisMonth.rejected, icon: "⚠️", color: "text-red-500" },
                  { label: "Bonus Earned", value: egp(perf.thisMonth.grossBonus), icon: "💰", color: "text-amber-600" },
                  { label: "Attendance Rate", value: `${perf.thisMonth.attendanceRate}%`, icon: "📅", color: "text-blue-600" },
                ].map((kpi) => (
                  <div key={kpi.label} className="bg-white rounded-xl border border-gray-200 p-5">
                    <p className="text-xl mb-1">{kpi.icon}</p>
                    <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{kpi.label}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        )}

        {/* ── BONUS ──────────────────────────────────────────────────── */}
        {activeTab === "bonus" && (
          <div className="space-y-6">
            {withdrawMsg && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3">{withdrawMsg}</div>
            )}
            {perfLoading ? (
              <div className="h-40 bg-gray-100 rounded-xl animate-pulse" />
            ) : perf ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Calculation breakdown */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                  <h2 className="font-semibold text-[#1F2A2A]">Bonus Calculator (All Time)</h2>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Qualified leads × 50 EGP</span>
                      <span className="text-green-600 font-medium">
                        +{egp(Math.round(perf.allTime.grossBonus + perf.allTime.totalWithdrawn > 0
                          ? (perf.allTime.grossBonus + perf.allTime.totalWithdrawn)
                          : perf.allTime.grossBonus))}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Total withdrawn</span>
                      <span className="text-red-500 font-medium">-{egp(perf.allTime.totalWithdrawn)}</span>
                    </div>
                    <div className="flex justify-between py-3 bg-[#F0F9F8] rounded-lg px-3 mt-2">
                      <span className="font-semibold text-[#1F2A2A]">Available Balance</span>
                      <span className="font-bold text-[#1E6663] text-lg">{egp(Math.max(0, perf.allTime.availableBalance))}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">+50 EGP per qualified lead · −25 EGP per rejected lead</p>
                  <Button
                    onClick={() => setShowWithdrawModal(true)}
                    disabled={perf.allTime.availableBalance <= 0}
                    className="w-full bg-[#1E6663] text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-[#175553] disabled:opacity-50"
                  >
                    Request Withdrawal
                  </Button>
                </div>

                {/* Withdrawal history */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                  <h2 className="font-semibold text-[#1F2A2A]">Withdrawal History</h2>
                  {withdrawals.length === 0 ? (
                    <p className="text-sm text-gray-400">No withdrawal requests yet.</p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {withdrawals.map((w) => (
                        <div key={w.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                          <div>
                            <p className="text-sm font-medium text-[#1F2A2A]">{egp(w.amount)}</p>
                            <p className="text-xs text-gray-500">{new Date(w.createdAt).toLocaleDateString()}</p>
                            {w.adminNote && <p className="text-xs text-gray-400 italic">Note: {w.adminNote}</p>}
                          </div>
                          <Badge variant={w.status === "Approved" ? "success" : w.status === "Rejected" ? "danger" : "warning"}>
                            {w.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            {/* Withdrawal modal */}
            {showWithdrawModal && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4 shadow-xl">
                  <h3 className="font-semibold text-[#1F2A2A] text-lg">Request Withdrawal</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-600 block mb-1">Amount (EGP)</label>
                      <input
                        type="number"
                        value={withdrawForm.amount}
                        onChange={(e) => setWithdrawForm(f => ({ ...f, amount: e.target.value }))}
                        placeholder="e.g. 500"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E6663]"
                        max={perf?.allTime.availableBalance}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 block mb-1">Bank Account or E-Wallet</label>
                      <textarea
                        value={withdrawForm.accountDetails}
                        onChange={(e) => setWithdrawForm(f => ({ ...f, accountDetails: e.target.value }))}
                        placeholder="Instapay / bank account number / Vodafone Cash…"
                        rows={3}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E6663] resize-none"
                      />
                    </div>
                    {withdrawMsg && <p className="text-xs text-red-500">{withdrawMsg}</p>}
                  </div>
                  <div className="flex gap-3 pt-1">
                    <Button onClick={() => setShowWithdrawModal(false)} className="flex-1 border border-gray-200 text-gray-600 text-sm py-2.5 rounded-xl hover:bg-gray-50">
                      Cancel
                    </Button>
                    <Button
                      onClick={submitWithdrawal}
                      disabled={withdrawSubmitting || !withdrawForm.amount || !withdrawForm.accountDetails}
                      className="flex-1 bg-[#1E6663] text-white text-sm py-2.5 rounded-xl hover:bg-[#175553] disabled:opacity-50"
                    >
                      {withdrawSubmitting ? "Submitting…" : "Submit Request"}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── ATTENDANCE ─────────────────────────────────────────────── */}
        {activeTab === "attendance" && (
          <div className="space-y-6">
            {/* Monthly summary */}
            {attSummary && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Present", value: attSummary.present, color: "text-green-600" },
                  { label: "Late", value: attSummary.late, color: "text-amber-500" },
                  { label: "Absent", value: attSummary.absent, color: "text-red-500" },
                  { label: "Attendance Rate", value: `${attSummary.attendanceRate}%`, color: "text-[#1E6663]" },
                ].map((s) => (
                  <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5 text-center">
                    <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Log table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-[#1F2A2A] text-sm">This Month&apos;s Log</h2>
              </div>
              {attLoading ? (
                <div className="p-5 space-y-2">
                  {[...Array(5)].map((_, i) => <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />)}
                </div>
              ) : monthlyAtt.length === 0 ? (
                <p className="p-5 text-sm text-gray-400">No attendance records this month.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                      <tr>
                        {["Date", "Check-in", "Check-out", "Hours", "Status"].map((h) => (
                          <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {monthlyAtt.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 font-medium text-[#1F2A2A]">{fmtDate(log.date)}</td>
                          <td className="px-4 py-3 text-gray-600">{fmt(log.checkInTime)}</td>
                          <td className="px-4 py-3 text-gray-600">{fmt(log.checkOutTime)}</td>
                          <td className="px-4 py-3 text-gray-600">{log.hoursWorked != null ? `${log.hoursWorked.toFixed(1)}h` : "—"}</td>
                          <td className="px-4 py-3">
                            <Badge variant={log.status === "Present" ? "success" : log.status === "Late" ? "warning" : "default"}>
                              {log.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── LEADS ──────────────────────────────────────────────────── */}
        {activeTab === "leads" && (
          <div className="space-y-4">
            <h2 className="font-semibold text-[#1F2A2A]">Lead Performance Log — This Month</h2>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {perfLoading ? (
                <div className="p-5 space-y-2">
                  {[...Array(5)].map((_, i) => <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />)}
                </div>
              ) : !perf || perf.performanceLog.length === 0 ? (
                <p className="p-5 text-sm text-gray-400">No leads delivered this month.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                      <tr>
                        {["Date", "Client", "Delivered", "Qualified", "Rejected", "Bonus"].map((h) => (
                          <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {perf.performanceLog.map((row, i) => (
                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 font-medium text-[#1F2A2A]">{fmtDate(row.date)}</td>
                          <td className="px-4 py-3 text-gray-600">{row.clientName}</td>
                          <td className="px-4 py-3 text-center font-medium">{row.delivered}</td>
                          <td className="px-4 py-3 text-center text-green-600 font-medium">{row.qualified}</td>
                          <td className="px-4 py-3 text-center text-red-500 font-medium">{row.rejected}</td>
                          <td className={`px-4 py-3 font-semibold ${row.bonusEarned >= 0 ? "text-green-600" : "text-red-500"}`}>
                            {row.bonusEarned >= 0 ? "+" : ""}{egp(row.bonusEarned)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── PROFILE ────────────────────────────────────────────────── */}
        {activeTab === "profile" && (
          <div className="max-w-xl space-y-6">
            <h2 className="font-semibold text-[#1F2A2A]">Personal Profile</h2>

            {profile && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  {profForm.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profForm.avatarUrl} alt="Avatar" className="w-16 h-16 rounded-full object-cover border-2 border-[#1E6663]" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-[#1E6663] flex items-center justify-center text-white font-bold text-xl">
                      {(profile.name || "A").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-600 mb-1.5">Profile Photo</p>
                    <label className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium cursor-pointer transition-colors ${avatarUploading ? "opacity-50 cursor-not-allowed" : "hover:border-[#1E6663] hover:text-[#1E6663]"}`}>
                      {avatarUploading ? "Uploading…" : "Upload Photo"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="sr-only"
                        disabled={avatarUploading}
                        onChange={handleAvatarChange}
                      />
                    </label>
                    <p className="text-[10px] text-gray-400 mt-1">JPG, PNG, WebP — max 5 MB</p>
                  </div>
                </div>

                {/* Fields */}
                {[
                  { key: "name", label: "Full Name", type: "text" },
                  { key: "email", label: "Email", type: "email", readonly: true },
                  { key: "jobTitle", label: "Job Title", type: "text" },
                  { key: "phone", label: "Phone Number", type: "tel" },
                  { key: "nationalId", label: "National / Employee ID", type: "text" },
                  { key: "bankAccount", label: "Bank Account Number", type: "text" },
                  { key: "eWallet", label: "E-Wallet Number", type: "text" },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="text-xs font-medium text-gray-600 block mb-1">{field.label}</label>
                    <input
                      type={field.type}
                      value={(profForm[field.key as keyof Profile] as string) || ""}
                      onChange={(e) => !field.readonly && setProfForm(f => ({ ...f, [field.key]: e.target.value }))}
                      readOnly={field.readonly}
                      className={`w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E6663] ${field.readonly ? "bg-gray-50 text-gray-400 cursor-not-allowed" : ""}`}
                    />
                  </div>
                ))}

                {/* Join date */}
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Join Date</label>
                  <p className="text-sm text-gray-600 px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200">
                    {new Date(profile.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
                  </p>
                </div>

                {profMsg && (
                  <p className={`text-sm ${profMsg === "Saved!" ? "text-green-600" : "text-red-500"}`}>{profMsg}</p>
                )}

                <Button
                  onClick={saveProfile}
                  disabled={profSaving}
                  className="w-full bg-[#1E6663] text-white text-sm font-semibold py-3 rounded-xl hover:bg-[#175553] disabled:opacity-50"
                >
                  {profSaving ? "Saving…" : "Save Profile"}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
