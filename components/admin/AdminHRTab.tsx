"use client";
import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Employee {
  id: string;
  name: string | null;
  email: string;
  adminRole: string;
  jobTitle: string | null;
  avatarUrl: string | null;
  baseSalary: number | null;
  dailyLeadTarget: number;
  bonusBalance: number;
  createdAt: string;
  thisMonth: { qualified: number; rejected: number; totalDelivered: number };
  attendanceThisMonth: { presentDays: number; workingDays: number; rate: number };
  availableBalance: number;
}

interface PendingWithdrawal {
  id: string;
  amount: number;
  accountDetails: string;
  status: string;
  adminNote: string | null;
  createdAt: string;
  adminTeamMember: { id: string; name: string | null; email: string; adminRole: string };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ROLE_BADGE: Record<string, "default" | "teal" | "info" | "success" | "warning"> = {
  SuperAdmin: "success",
  AccountManager: "info",
  LeadResearcher: "teal",
};

function getInitials(name: string | null, email: string) {
  if (name) {
    const parts = name.trim().split(" ");
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

// ─── Attendance Modal ─────────────────────────────────────────────────────────

interface AttendanceModalProps {
  employee: Employee;
  onClose: () => void;
  onSave: (payload: {
    memberId: string;
    action: "markAttendance";
    date: string;
    status: string;
    checkInTime?: string;
    checkOutTime?: string;
  }) => Promise<void>;
}

function AttendanceModal({ employee, onClose, onSave }: AttendanceModalProps) {
  const [date, setDate] = useState(todayISO());
  const [status, setStatus] = useState("present");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        memberId: employee.id,
        action: "markAttendance",
        date,
        status,
        ...(checkIn ? { checkInTime: checkIn } : {}),
        ...(checkOut ? { checkOutTime: checkOut } : {}),
      });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="font-bold text-[#1F2A2A] text-base">Mark Attendance</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {employee.name || employee.email}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg leading-none"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1E6663]/40 focus:border-[#1E6663]"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1E6663]/40 focus:border-[#1E6663]"
            >
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
              <option value="half_day">Half Day</option>
              <option value="remote">Remote</option>
            </select>
          </div>

          {/* Times — only shown when relevant */}
          {status !== "absent" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Check-in Time <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  type="time"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1E6663]/40 focus:border-[#1E6663]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Check-out Time <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  type="time"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1E6663]/40 focus:border-[#1E6663]"
                />
              </div>
            </div>
          )}

          <div className="flex gap-2 justify-end pt-1">
            <Button size="sm" variant="ghost" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button size="sm" variant="secondary" type="submit" loading={saving}>
              Save Attendance
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Employees View ───────────────────────────────────────────────────────────

interface EmployeesViewProps {
  employees: Employee[];
  onRefresh: () => Promise<void>;
}

function EmployeesView({ employees, onRefresh }: EmployeesViewProps) {
  // Per-row edit state: { [id]: { baseSalary, dailyLeadTarget } }
  const [edits, setEdits] = useState<
    Record<string, { baseSalary: string; dailyLeadTarget: string }>
  >({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [attendanceTarget, setAttendanceTarget] = useState<Employee | null>(null);
  const [attendanceSaving, setAttendanceSaving] = useState(false);

  function getEdit(emp: Employee) {
    return (
      edits[emp.id] ?? {
        baseSalary: emp.baseSalary != null ? String(emp.baseSalary) : "",
        dailyLeadTarget: String(emp.dailyLeadTarget),
      }
    );
  }

  function setField(id: string, field: "baseSalary" | "dailyLeadTarget", value: string) {
    setEdits((prev) => ({
      ...prev,
      [id]: { ...getEditById(id), [field]: value },
    }));
  }

  function getEditById(id: string) {
    const emp = employees.find((e) => e.id === id)!;
    return edits[id] ?? {
      baseSalary: emp.baseSalary != null ? String(emp.baseSalary) : "",
      dailyLeadTarget: String(emp.dailyLeadTarget),
    };
  }

  function isDirty(emp: Employee) {
    const e = getEdit(emp);
    const origSalary = emp.baseSalary != null ? String(emp.baseSalary) : "";
    const origTarget = String(emp.dailyLeadTarget);
    return e.baseSalary !== origSalary || e.dailyLeadTarget !== origTarget;
  }

  async function handleSave(emp: Employee) {
    const e = getEdit(emp);
    setSaving((s) => ({ ...s, [emp.id]: true }));
    try {
      await fetch("/api/admin/hr", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: emp.id,
          action: "updateSettings",
          baseSalary: e.baseSalary !== "" ? Number(e.baseSalary) : null,
          dailyLeadTarget: Number(e.dailyLeadTarget),
        }),
      });
      // Clear local edit so it re-reads from fresh data
      setEdits((prev) => {
        const next = { ...prev };
        delete next[emp.id];
        return next;
      });
      await onRefresh();
    } finally {
      setSaving((s) => ({ ...s, [emp.id]: false }));
    }
  }

  async function handleMarkAttendance(payload: Parameters<AttendanceModalProps["onSave"]>[0]) {
    setAttendanceSaving(true);
    try {
      await fetch("/api/admin/hr", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      await onRefresh();
    } finally {
      setAttendanceSaving(false);
    }
  }

  if (employees.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
        <p className="font-semibold text-[#1F2A2A]">No employees found</p>
        <p className="text-sm text-gray-400 mt-1">Add team members to see them here</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {employees.map((emp) => {
          const edit = getEdit(emp);
          const dirty = isDirty(emp);
          const isSaving = saving[emp.id] ?? false;
          const initials = getInitials(emp.name, emp.email);
          const roleBadge = ROLE_BADGE[emp.adminRole] ?? "default";
          const att = emp.attendanceThisMonth;
          const leads = emp.thisMonth;

          return (
            <div
              key={emp.id}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:border-[#1E6663]/30 transition-colors"
            >
              {/* Top row: avatar + identity + role + attendance button */}
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {emp.avatarUrl ? (
                    <img
                      src={emp.avatarUrl}
                      alt={emp.name ?? emp.email}
                      className="w-11 h-11 rounded-full object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-[#1E6663]/10 flex items-center justify-center text-[#1E6663] font-bold text-sm border border-[#1E6663]/20">
                      {initials}
                    </div>
                  )}
                </div>

                {/* Identity */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-[#1F2A2A] text-sm">
                      {emp.name || "—"}
                    </span>
                    <Badge variant={roleBadge}>{emp.adminRole}</Badge>
                    {emp.jobTitle && (
                      <span className="text-xs text-gray-400">{emp.jobTitle}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{emp.email}</p>
                </div>

                {/* Mark Attendance button */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setAttendanceTarget(emp)}
                >
                  Mark Attendance
                </Button>
              </div>

              {/* Stats grid */}
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Leads this month */}
                <div className="bg-gray-50 rounded-lg px-3 py-2.5">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">
                    Leads (month)
                  </p>
                  <p className="text-sm font-bold text-[#1F2A2A]">
                    {leads.totalDelivered}
                    <span className="font-normal text-gray-400 text-xs"> delivered</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    <span className="text-green-600 font-medium">{leads.qualified}</span> qualified
                    {" · "}
                    <span className="text-red-500 font-medium">{leads.rejected}</span> rejected
                  </p>
                </div>

                {/* Attendance */}
                <div className="bg-gray-50 rounded-lg px-3 py-2.5">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">
                    Attendance
                  </p>
                  <p className="text-sm font-bold text-[#1F2A2A]">
                    {att.presentDays}
                    <span className="text-gray-400 font-normal">/{att.workingDays} days</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    <span
                      className={
                        att.rate >= 90
                          ? "text-green-600 font-medium"
                          : att.rate >= 70
                          ? "text-yellow-600 font-medium"
                          : "text-red-500 font-medium"
                      }
                    >
                      {att.rate}%
                    </span>{" "}
                    rate
                  </p>
                </div>

                {/* Available balance */}
                <div className="bg-gray-50 rounded-lg px-3 py-2.5">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">
                    Balance
                  </p>
                  <p className="text-sm font-bold text-[#1E6663]">
                    {emp.availableBalance.toLocaleString()} EGP
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Bonus: {emp.bonusBalance.toLocaleString()} EGP
                  </p>
                </div>

                {/* Editable settings */}
                <div className="bg-gray-50 rounded-lg px-3 py-2.5">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
                    Settings
                  </p>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <label className="text-[10px] text-gray-500 w-16 shrink-0">Salary</label>
                      <input
                        type="number"
                        min={0}
                        value={edit.baseSalary}
                        onChange={(e) => setField(emp.id, "baseSalary", e.target.value)}
                        placeholder="—"
                        className="flex-1 text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#1E6663] w-0 min-w-0"
                      />
                      <span className="text-[10px] text-gray-400 shrink-0">EGP</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <label className="text-[10px] text-gray-500 w-16 shrink-0">Target</label>
                      <input
                        type="number"
                        min={0}
                        value={edit.dailyLeadTarget}
                        onChange={(e) => setField(emp.id, "dailyLeadTarget", e.target.value)}
                        className="flex-1 text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#1E6663] w-0 min-w-0"
                      />
                      <span className="text-[10px] text-gray-400 shrink-0">/day</span>
                    </div>
                  </div>
                  {dirty && (
                    <Button
                      size="sm"
                      variant="secondary"
                      loading={isSaving}
                      onClick={() => handleSave(emp)}
                      className="mt-2 w-full !text-[11px] !py-1"
                    >
                      Save
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Attendance Modal */}
      {attendanceTarget && (
        <AttendanceModal
          employee={attendanceTarget}
          onClose={() => setAttendanceTarget(null)}
          onSave={async (payload) => {
            await handleMarkAttendance(payload);
            setAttendanceTarget(null);
          }}
        />
      )}
    </>
  );
}

// ─── Withdrawals View ─────────────────────────────────────────────────────────

interface WithdrawalsViewProps {
  withdrawals: PendingWithdrawal[];
  onRefresh: () => Promise<void>;
}

function WithdrawalsView({ withdrawals, onRefresh }: WithdrawalsViewProps) {
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState<Record<string, boolean>>({});

  async function handleProcess(w: PendingWithdrawal, approve: boolean) {
    setProcessing((p) => ({ ...p, [w.id]: true }));
    try {
      await fetch("/api/admin/hr", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: w.adminTeamMember.id,
          action: "processWithdrawal",
          withdrawalId: w.id,
          approve,
          ...(notes[w.id] ? { adminNote: notes[w.id] } : {}),
        }),
      });
      await onRefresh();
    } finally {
      setProcessing((p) => ({ ...p, [w.id]: false }));
    }
  }

  if (withdrawals.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
        <p className="font-semibold text-[#1F2A2A]">No pending requests</p>
        <p className="text-sm text-gray-400 mt-1">All withdrawal requests have been handled</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Employee
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Amount
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Account Details
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Requested
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Note
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {withdrawals.map((w) => {
            const member = w.adminTeamMember;
            const roleBadge = ROLE_BADGE[member.adminRole] ?? "default";
            const isProcessing = processing[w.id] ?? false;

            return (
              <tr key={w.id} className="hover:bg-gray-50">
                {/* Employee */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#1E6663]/10 flex items-center justify-center text-[#1E6663] font-bold text-xs border border-[#1E6663]/20 shrink-0">
                      {getInitials(member.name, member.email)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-[#1F2A2A] text-sm truncate">
                        {member.name || member.email}
                      </p>
                      <Badge variant={roleBadge}>{member.adminRole}</Badge>
                    </div>
                  </div>
                </td>

                {/* Amount */}
                <td className="px-4 py-3">
                  <span className="font-bold text-[#1E6663] text-sm">
                    {w.amount.toLocaleString()} EGP
                  </span>
                </td>

                {/* Account details */}
                <td className="px-4 py-3">
                  <p className="text-xs text-gray-600 max-w-[160px] break-words whitespace-pre-wrap">
                    {w.accountDetails}
                  </p>
                </td>

                {/* Date */}
                <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                  {formatDate(w.createdAt)}
                </td>

                {/* Admin note */}
                <td className="px-4 py-3">
                  <input
                    type="text"
                    placeholder="Optional note…"
                    value={notes[w.id] ?? ""}
                    onChange={(e) =>
                      setNotes((n) => ({ ...n, [w.id]: e.target.value }))
                    }
                    className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#1E6663] w-36"
                  />
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      loading={isProcessing}
                      onClick={() => handleProcess(w, true)}
                      className="!bg-green-600 hover:!bg-green-700 !text-white !shadow-none"
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      loading={isProcessing}
                      onClick={() => handleProcess(w, false)}
                    >
                      Reject
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

type Tab = "employees" | "withdrawals";

export function AdminHRTab() {
  const [tab, setTab] = useState<Tab>("employees");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [pendingWithdrawals, setPendingWithdrawals] = useState<PendingWithdrawal[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/hr");
      const data = await res.json();
      setEmployees(data.employees ?? []);
      setPendingWithdrawals(data.pendingWithdrawals ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="font-bold text-[#1F2A2A] text-lg">HR Management</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Employee settings, attendance tracking, and withdrawal requests
          </p>
        </div>

        {/* Mini toggle */}
        <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-1">
          {(
            [
              { key: "employees", label: "Employees" },
              { key: "withdrawals", label: `Withdrawals${pendingWithdrawals.length > 0 ? ` (${pendingWithdrawals.length})` : ""}` },
            ] as { key: Tab; label: string }[]
          ).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-150 ${
                tab === key
                  ? "bg-white text-[#1E6663] shadow-sm"
                  : "text-gray-500 hover:text-[#1F2A2A]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-gray-400 text-sm py-12 text-center">Loading HR data…</div>
      ) : tab === "employees" ? (
        <EmployeesView employees={employees} onRefresh={load} />
      ) : (
        <WithdrawalsView withdrawals={pendingWithdrawals} onRefresh={load} />
      )}
    </div>
  );
}
