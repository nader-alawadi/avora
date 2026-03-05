"use client";
import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

// ── Types ────────────────────────────────────────────────

interface LeadFormData {
  fullName: string;
  roleTitle: string;
  brandName: string;
  email: string;
  phone: string;
  linkedinUrl: string;
  country: string;
  seniorityLevel: string;
  buyingRole: string;
  personalityType: string;
  notes: string;
}

// Staged lead has a DB id plus form fields
interface StagedLead extends LeadFormData {
  id: string;
}

const EMPTY_FORM: LeadFormData = {
  fullName: "",
  roleTitle: "",
  brandName: "",
  email: "",
  phone: "",
  linkedinUrl: "",
  country: "",
  seniorityLevel: "",
  buyingRole: "",
  personalityType: "",
  notes: "",
};

interface Order {
  id: string;
  leadCountMonthly: number;
  pricePerLead: number;
  totalPriceUsd: number;
  status: string;
  adminNotes?: string;
  createdAt: string;
  user: { name: string | null; email: string };
  deliveredLeads: { id: string }[];
}

interface Props {
  orders: Order[];
  onRefresh: () => void;
}

const STATUS_BADGE: Record<string, "default" | "warning" | "success" | "danger" | "info" | "teal"> = {
  Draft: "default",
  InvoiceCreated: "warning",
  AwaitingConfirmation: "warning",
  PaidConfirmed: "info",
  InProgress: "teal",
  Delivered: "success",
};

const ACTIVE_STATUSES = ["PaidConfirmed", "InProgress"];
const MAX_LEADS = 90;

const SENIORITY_OPTIONS = ["Junior", "Mid", "Senior", "Director", "C-Level"];
const BUYING_ROLE_OPTIONS = ["Champion", "Economic Buyer", "Technical Buyer", "End User", "Influencer"];
const PERSONALITY_OPTIONS = ["Analytical", "Driver", "Expressive", "Amiable"];

// ── Field wrapper ─────────────────────────────────────────

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="mt-0.5 text-xs text-red-500">{error}</p>}
    </div>
  );
}

const inputCls =
  "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E6663]/30 focus:border-[#1E6663] bg-white";
const inputErrCls =
  "w-full px-3 py-2 border border-red-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 bg-white";

// ── Main component ────────────────────────────────────────

export function LeadDeliveryPanel({ orders, onRefresh }: Props) {
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  // stagedLeads[orderId] = array of DB-persisted leads (with id)
  const [stagedLeads, setStagedLeads] = useState<Record<string, StagedLead[]>>({});
  // track which orders have already been fetched so we don't re-fetch on every expand
  const [fetchedOrders, setFetchedOrders] = useState<Set<string>>(new Set());
  const [fetchingStaged, setFetchingStaged] = useState<string | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [form, setForm] = useState<LeadFormData>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof LeadFormData, string>>>({});
  const [savingLead, setSavingLead] = useState(false);

  // Delivery state
  const [uploading, setUploading] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, string>>({});

  // ── Fetch staged leads from DB when an order is expanded ──

  const fetchStagedLeads = useCallback(async (orderId: string) => {
    setFetchingStaged(orderId);
    try {
      const res = await fetch(`/api/admin/leads/stage?orderId=${orderId}`);
      const d = await res.json();
      if (res.ok) {
        setStagedLeads((prev) => ({
          ...prev,
          [orderId]: (d.leads ?? []).map((dl: Record<string, string | boolean>) => ({
            id: String(dl.id),
            fullName: String(dl.fullName || ""),
            roleTitle: String(dl.roleTitle || ""),
            brandName: String(dl.brandName || ""),
            email: String(dl.email || ""),
            phone: String(dl.phone || ""),
            linkedinUrl: String(dl.linkedinUrl || ""),
            country: String(dl.country || ""),
            seniorityLevel: String(dl.seniorityLevel || ""),
            buyingRole: String(dl.buyingRole || ""),
            personalityType: String(dl.personalityType || ""),
            notes: String(dl.notes || ""),
          })),
        }));
        setFetchedOrders((prev) => new Set([...prev, orderId]));
      }
    } finally {
      setFetchingStaged(null);
    }
  }, []);

  function toggleOrder(orderId: string) {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
      if (!fetchedOrders.has(orderId)) {
        fetchStagedLeads(orderId);
      }
    }
  }

  // Re-fetch when orders list changes (e.g. after refresh) to clear stale fetch cache
  useEffect(() => {
    setFetchedOrders(new Set());
  }, [orders]);

  // ── Modal helpers ─────────────────────────────────────────

  function openAddLeadModal(orderId: string) {
    setActiveOrderId(orderId);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setActiveOrderId(null);
  }

  function set(field: keyof LeadFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  function validateForm(): boolean {
    const errors: Partial<Record<keyof LeadFormData, string>> = {};
    if (!form.fullName.trim()) errors.fullName = "Required";
    if (!form.roleTitle.trim()) errors.roleTitle = "Required";
    if (!form.brandName.trim()) errors.brandName = "Required";
    if (!form.email.trim()) errors.email = "Required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  // ── Add lead — saves to DB immediately ───────────────────

  async function addLead() {
    if (!validateForm() || !activeOrderId) return;

    setSavingLead(true);
    try {
      const res = await fetch("/api/admin/leads/stage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: activeOrderId, lead: form }),
      });
      const d = await res.json();

      if (!res.ok) {
        alert(d.error || "Failed to save lead. Please try again.");
        return;
      }

      // Add the DB record (with its id) to local state
      setStagedLeads((prev) => ({
        ...prev,
        [activeOrderId]: [
          ...(prev[activeOrderId] || []),
          { id: d.lead.id, ...form },
        ],
      }));
      closeModal();
    } finally {
      setSavingLead(false);
    }
  }

  // ── Remove lead — deletes from DB ─────────────────────────

  async function removeLead(orderId: string, index: number) {
    const lead = stagedLeads[orderId]?.[index];
    if (!lead) return;

    // Optimistic remove from UI
    setStagedLeads((prev) => ({
      ...prev,
      [orderId]: prev[orderId].filter((_, i) => i !== index),
    }));

    await fetch("/api/admin/leads/stage", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId: lead.id }),
    });
  }

  // ── Deliver — promotes Staged → Delivered, creates CRM leads ─

  async function deliverLeads(orderId: string) {
    const leads = stagedLeads[orderId] || [];
    if (leads.length === 0) return;

    setUploading(orderId);
    setResults((prev) => ({ ...prev, [orderId]: "" }));

    try {
      const res = await fetch("/api/admin/leads/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const d = await res.json();

      if (res.ok) {
        setResults((prev) => ({
          ...prev,
          [orderId]: `✅ Delivered ${d.count} lead${d.count !== 1 ? "s" : ""} to client CRM.`,
        }));
        setStagedLeads((prev) => ({ ...prev, [orderId]: [] }));
        setExpandedOrder(null);
        onRefresh();
      } else {
        setResults((prev) => ({ ...prev, [orderId]: `❌ Error: ${d.error}` }));
      }
    } catch {
      setResults((prev) => ({
        ...prev,
        [orderId]: "❌ Network error. Please try again.",
      }));
    } finally {
      setUploading(null);
    }
  }

  // ── Render ────────────────────────────────────────────────

  const activeOrders = orders.filter((o) => ACTIVE_STATUSES.includes(o.status));
  const otherOrders = orders.filter((o) => !ACTIVE_STATUSES.includes(o.status));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-[#1F2A2A] text-lg">Lead Delivery</h2>
        <Button size="sm" variant="ghost" onClick={onRefresh}>
          Refresh
        </Button>
      </div>

      {/* Active orders */}
      {activeOrders.length > 0 ? (
        <div>
          <h3 className="text-sm font-semibold text-[#1E6663] mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-[#1E6663] rounded-full animate-pulse" />
            Ready for Delivery ({activeOrders.length})
          </h3>
          <div className="space-y-4">
            {activeOrders.map((order) => {
              const delivered = order.deliveredLeads.length;
              const staged = stagedLeads[order.id] || [];
              const isExpanded = expandedOrder === order.id;
              const isLoading = fetchingStaged === order.id;

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                >
                  {/* Order header */}
                  <div className="p-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-[#1F2A2A] text-sm truncate">
                          {order.user.name || order.user.email}
                        </p>
                        <Badge variant={STATUS_BADGE[order.status] || "default"}>
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-400 truncate">{order.user.email}</p>
                    </div>

                    <div className="flex gap-6 text-center text-xs">
                      <div>
                        <p className="font-bold text-[#1F2A2A] text-sm">{order.leadCountMonthly}</p>
                        <p className="text-gray-400">Ordered</p>
                      </div>
                      <div>
                        <p className={`font-bold text-sm ${delivered === 0 ? "text-gray-400" : "text-green-600"}`}>
                          {delivered}
                        </p>
                        <p className="text-gray-400">Delivered</p>
                      </div>
                      <div>
                        <p className="font-bold text-[#1F2A2A] text-sm">
                          ${order.totalPriceUsd.toLocaleString()}
                        </p>
                        <p className="text-gray-400">Total</p>
                      </div>
                      <div>
                        <p className="font-bold text-[#1F2A2A] text-sm">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-gray-400">Order date</p>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant={isExpanded ? "ghost" : "secondary"}
                      onClick={() => toggleOrder(order.id)}
                    >
                      {isExpanded ? "Collapse" : "Add Leads"}
                    </Button>
                  </div>

                  {/* Delivery progress bar */}
                  {delivered > 0 && (
                    <div className="px-4 pb-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Delivery progress</span>
                        <span>{delivered} / {order.leadCountMonthly} leads</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className="bg-[#1E6663] h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (delivered / order.leadCountMonthly) * 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Expanded lead entry area */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-gray-50">
                      {/* Toolbar */}
                      <div className="px-4 py-3 flex items-center justify-between border-b border-gray-200 bg-white">
                        <div className="flex items-center gap-3">
                          {isLoading ? (
                            <span className="text-xs text-gray-400 animate-pulse">Loading staged leads…</span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-28 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-2 bg-gradient-to-r from-[#1E6663] to-[#28a99e] rounded-full transition-all duration-300"
                                  style={{ width: `${Math.min(100, (staged.length / MAX_LEADS) * 100)}%` }}
                                />
                              </div>
                              <span className="text-xs font-semibold text-[#1E6663]">
                                {staged.length} / {MAX_LEADS} leads added
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => openAddLeadModal(order.id)}
                            disabled={staged.length >= MAX_LEADS || isLoading}
                          >
                            + Add Lead
                          </Button>
                          <Button
                            size="sm"
                            variant="primary"
                            loading={uploading === order.id}
                            onClick={() => deliverLeads(order.id)}
                            disabled={staged.length === 0 || uploading === order.id || isLoading}
                          >
                            Deliver All Leads
                          </Button>
                        </div>
                      </div>

                      {/* Result message */}
                      {results[order.id] && (
                        <div className="px-4 py-2 bg-white border-b border-gray-100">
                          <p className="text-xs font-medium text-gray-700">{results[order.id]}</p>
                        </div>
                      )}

                      {/* Leads table */}
                      {isLoading ? (
                        <div className="py-8 text-center">
                          <div className="text-sm text-gray-400 animate-pulse">Fetching staged leads…</div>
                        </div>
                      ) : staged.length === 0 ? (
                        <div className="py-10 text-center">
                          <p className="text-2xl mb-2">👤</p>
                          <p className="text-sm text-gray-400 font-medium">No leads added yet</p>
                          <p className="text-xs text-gray-400 mt-1">
                            Click &ldquo;+ Add Lead&rdquo; to enter the first lead for this order
                          </p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-white border-b border-gray-200">
                                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">#</th>
                                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Name</th>
                                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Title</th>
                                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Company</th>
                                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Email</th>
                                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Seniority</th>
                                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Buying Role</th>
                                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Personality</th>
                                <th className="px-4 py-2.5" />
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {staged.map((lead, idx) => (
                                <tr key={lead.id} className="hover:bg-white/70 group">
                                  <td className="px-4 py-2.5 text-xs text-gray-400">{idx + 1}</td>
                                  <td className="px-4 py-2.5">
                                    <p className="font-medium text-[#1F2A2A] text-xs whitespace-nowrap">{lead.fullName}</p>
                                  </td>
                                  <td className="px-4 py-2.5 text-xs text-gray-600 whitespace-nowrap">{lead.roleTitle}</td>
                                  <td className="px-4 py-2.5 text-xs text-gray-600 whitespace-nowrap">{lead.brandName}</td>
                                  <td className="px-4 py-2.5 text-xs text-gray-500">{lead.email || "—"}</td>
                                  <td className="px-4 py-2.5">
                                    {lead.seniorityLevel ? (
                                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-blue-50 text-blue-700 font-medium">
                                        {lead.seniorityLevel}
                                      </span>
                                    ) : <span className="text-gray-300 text-xs">—</span>}
                                  </td>
                                  <td className="px-4 py-2.5">
                                    {lead.buyingRole ? (
                                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-purple-50 text-purple-700 font-medium">
                                        {lead.buyingRole}
                                      </span>
                                    ) : <span className="text-gray-300 text-xs">—</span>}
                                  </td>
                                  <td className="px-4 py-2.5">
                                    {lead.personalityType ? (
                                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-amber-50 text-amber-700 font-medium">
                                        {lead.personalityType}
                                      </span>
                                    ) : <span className="text-gray-300 text-xs">—</span>}
                                  </td>
                                  <td className="px-4 py-2.5 text-right">
                                    <button
                                      onClick={() => removeLead(order.id, idx)}
                                      className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all text-xs px-2 py-1 rounded hover:bg-red-50"
                                    >
                                      Remove
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-10 text-gray-400 text-sm">
          No orders awaiting delivery right now.
        </div>
      )}

      {/* History table */}
      {otherOrders.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-500 mb-3">
            All Other Orders ({otherOrders.length})
          </h3>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Client</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Leads</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Delivered</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {otherOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#1F2A2A] text-sm">{order.user.name || "—"}</p>
                      <p className="text-xs text-gray-400">{order.user.email}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{order.leadCountMonthly}</td>
                    <td className="px-4 py-3 text-gray-600">{order.deliveredLeads.length}</td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_BADGE[order.status] || "default"}>{order.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Lead Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-[#1F2A2A] text-base">Add New Lead</h3>
                <p className="text-xs text-gray-400 mt-0.5">Lead will be saved immediately to the staging queue</p>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors text-xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Modal body — scrollable */}
            <div className="overflow-y-auto flex-1 px-6 py-5">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Full Name" required error={formErrors.fullName}>
                  <input
                    className={formErrors.fullName ? inputErrCls : inputCls}
                    placeholder="e.g. Sarah Johnson"
                    value={form.fullName}
                    onChange={(e) => set("fullName", e.target.value)}
                  />
                </Field>
                <Field label="Job Title" required error={formErrors.roleTitle}>
                  <input
                    className={formErrors.roleTitle ? inputErrCls : inputCls}
                    placeholder="e.g. VP of Sales"
                    value={form.roleTitle}
                    onChange={(e) => set("roleTitle", e.target.value)}
                  />
                </Field>

                <Field label="Company / Brand Name" required error={formErrors.brandName}>
                  <input
                    className={formErrors.brandName ? inputErrCls : inputCls}
                    placeholder="e.g. Acme Corporation"
                    value={form.brandName}
                    onChange={(e) => set("brandName", e.target.value)}
                  />
                </Field>
                <Field label="Email" required error={formErrors.email}>
                  <input
                    type="email"
                    className={formErrors.email ? inputErrCls : inputCls}
                    placeholder="e.g. sarah@acme.com"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                  />
                </Field>

                <Field label="Phone">
                  <input
                    className={inputCls}
                    placeholder="e.g. +1 555 000 1234"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                  />
                </Field>
                <Field label="LinkedIn URL">
                  <input
                    className={inputCls}
                    placeholder="https://linkedin.com/in/..."
                    value={form.linkedinUrl}
                    onChange={(e) => set("linkedinUrl", e.target.value)}
                  />
                </Field>

                <Field label="Country">
                  <input
                    className={inputCls}
                    placeholder="e.g. United States"
                    value={form.country}
                    onChange={(e) => set("country", e.target.value)}
                  />
                </Field>
                <Field label="Seniority Level">
                  <select
                    className={inputCls}
                    value={form.seniorityLevel}
                    onChange={(e) => set("seniorityLevel", e.target.value)}
                  >
                    <option value="">Select level…</option>
                    {SENIORITY_OPTIONS.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Buying Role">
                  <select
                    className={inputCls}
                    value={form.buyingRole}
                    onChange={(e) => set("buyingRole", e.target.value)}
                  >
                    <option value="">Select role…</option>
                    {BUYING_ROLE_OPTIONS.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Personality Type">
                  <select
                    className={inputCls}
                    value={form.personalityType}
                    onChange={(e) => set("personalityType", e.target.value)}
                  >
                    <option value="">Select type…</option>
                    {PERSONALITY_OPTIONS.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </Field>

                <div className="col-span-2">
                  <Field label="Notes">
                    <textarea
                      className={`${inputCls} resize-none`}
                      rows={3}
                      placeholder="Any additional context about this lead…"
                      value={form.notes}
                      onChange={(e) => set("notes", e.target.value)}
                    />
                  </Field>
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50 rounded-b-2xl">
              <p className="text-xs text-gray-400">
                Fields marked <span className="text-red-400">*</span> are required
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={closeModal} disabled={savingLead}>
                  Cancel
                </Button>
                <Button size="sm" variant="primary" onClick={addLead} loading={savingLead}>
                  {savingLead ? "Saving…" : "Add Lead →"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
