"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { OrderRow } from "@/components/admin/OrderRow";

const TABS = ["Users", "Payments", "Orders", "Upload Leads", "Audit Log"];

interface User {
  id: string;
  name: string | null;
  email: string;
  plan: string;
  pdfExportsUsed: number;
  createdAt: string;
  _count: { leadOrders: number; generatedReports: number };
}

interface Payment {
  id: string;
  type: string;
  provider: string;
  amountUsd: number;
  status: string;
  invoiceLink?: string;
  reference?: string;
  createdAt: string;
  user: { id: string; name: string | null; email: string };
}

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

interface AuditLog {
  id: string;
  action: string;
  entity?: string;
  entityId?: string;
  details?: string;
  createdAt: string;
  user?: { name: string | null; email: string } | null;
}

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Users");
  const [users, setUsers] = useState<User[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);

  // Upload leads state
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [leadsJson, setLeadsJson] = useState("");
  const [uploading, setUploading] = useState(false);

  // Order update state
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);
  const [updatingPayment, setUpdatingPayment] = useState<string | null>(null);

  const checkAdmin = useCallback(async () => {
    const res = await fetch("/api/auth/me");
    const data = await res.json();
    if (!data.user?.isAdmin) {
      router.push("/dashboard");
    }
  }, [router]);

  useEffect(() => {
    checkAdmin();
    loadUsers();
  }, [checkAdmin]);

  async function loadUsers() {
    setLoading(true);
    const res = await fetch("/api/admin/users");
    const d = await res.json();
    setUsers(d.users || []);
    setLoading(false);
  }

  async function loadPayments() {
    const res = await fetch("/api/admin/payments");
    const d = await res.json();
    setPayments(d.payments || []);
  }

  async function loadOrders() {
    const res = await fetch("/api/admin/orders");
    const d = await res.json();
    setOrders(d.orders || []);
  }

  async function loadAuditLogs() {
    const res = await fetch("/api/admin/audit");
    const d = await res.json();
    setAuditLogs(d.logs || []);
  }

  function handleTabChange(tab: string) {
    setActiveTab(tab);
    if (tab === "Payments") loadPayments();
    if (tab === "Orders" || tab === "Upload Leads") loadOrders();
    if (tab === "Audit Log") loadAuditLogs();
  }

  async function updatePaymentStatus(paymentId: string, status: string) {
    setUpdatingPayment(paymentId);
    try {
      await fetch("/api/admin/payments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId, status }),
      });
      await loadPayments();
    } finally {
      setUpdatingPayment(null);
    }
  }

  async function updateOrderStatus(
    orderId: string,
    status: string,
    adminNotes: string
  ) {
    setUpdatingOrder(orderId);
    try {
      await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status, adminNotes }),
      });
      await loadOrders();
    } finally {
      setUpdatingOrder(null);
    }
  }

  async function uploadLeads() {
    if (!selectedOrderId || !leadsJson) {
      alert("Select an order and paste leads JSON");
      return;
    }

    let parsed;
    try {
      parsed = JSON.parse(leadsJson);
    } catch {
      alert("Invalid JSON format");
      return;
    }

    setUploading(true);
    try {
      const res = await fetch("/api/admin/leads/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: selectedOrderId, leads: parsed }),
      });
      const d = await res.json();
      if (res.ok) {
        alert(`✅ Uploaded ${d.count} leads! Batch: ${d.deliveryBatch}`);
        setLeadsJson("");
      } else {
        alert(d.error);
      }
    } finally {
      setUploading(false);
    }
  }

  const STATUS_BADGE: Record<string, "default" | "warning" | "success" | "danger" | "info"> = {
    Pending: "warning",
    Confirmed: "success",
    Rejected: "danger",
    Draft: "default",
    InvoiceCreated: "warning",
    AwaitingConfirmation: "warning",
    PaidConfirmed: "info",
    InProgress: "info",
    Delivered: "success",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#1E6663] text-white px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-xl">AVORA Admin</h1>
          <p className="text-white/70 text-xs">Enigma Sales Internal Panel</p>
        </div>
        <div className="flex gap-3">
          <a href="/dashboard" className="text-white/80 hover:text-white text-sm">
            ← Dashboard
          </a>
          <button
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              router.push("/");
            }}
            className="text-white/80 hover:text-white text-sm"
          >
            Sign Out
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 mb-6">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-[#1E6663] text-[#1E6663]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Users Tab */}
        {activeTab === "Users" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-[#1F2A2A]">
                Users ({users.length})
              </h2>
              <Button size="sm" variant="ghost" onClick={loadUsers}>
                Refresh
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full bg-white rounded-xl border border-gray-200 text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                      User
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                      Plan
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                      PDF Exports
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                      Orders
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                      Reports
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-[#1F2A2A]">
                          {u.name || "—"}
                        </p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={u.plan === "PLUS" ? "success" : "default"}
                        >
                          {u.plan}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {u.pdfExportsUsed}/2
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {u._count.leadOrders}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {u._count.generatedReports}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === "Payments" && (
          <div>
            <h2 className="font-bold text-[#1F2A2A] mb-4">
              Payments ({payments.length})
            </h2>
            <div className="space-y-3">
              {payments.map((payment) => (
                <Card key={payment.id} padding="sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-[#1F2A2A] text-sm">
                          {payment.type} — ${payment.amountUsd}
                        </span>
                        <Badge variant={STATUS_BADGE[payment.status] || "default"}>
                          {payment.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500">
                        {payment.user.name || payment.user.email} ·{" "}
                        {payment.provider}
                      </p>
                      {payment.reference && (
                        <p className="text-xs text-gray-400 font-mono mt-0.5">
                          Ref: {payment.reference}
                        </p>
                      )}
                      {payment.invoiceLink && (
                        <a
                          href={payment.invoiceLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#1E6663] hover:underline"
                        >
                          View Invoice →
                        </a>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(payment.createdAt).toLocaleString()}
                      </p>
                    </div>

                    {payment.status === "Pending" && (
                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          loading={updatingPayment === payment.id}
                          onClick={() =>
                            updatePaymentStatus(payment.id, "Confirmed")
                          }
                        >
                          ✓ Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          loading={updatingPayment === payment.id}
                          onClick={() =>
                            updatePaymentStatus(payment.id, "Rejected")
                          }
                        >
                          ✗ Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
              {payments.length === 0 && (
                <p className="text-gray-400 text-center py-8">No payments yet</p>
              )}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "Orders" && (
          <div>
            <h2 className="font-bold text-[#1F2A2A] mb-4">
              Lead Orders ({orders.length})
            </h2>
            <div className="space-y-3">
              {orders.map((order) => (
                <OrderRow
                  key={order.id}
                  order={order}
                  onUpdate={updateOrderStatus}
                  updating={updatingOrder === order.id}
                />
              ))}
              {orders.length === 0 && (
                <p className="text-gray-400 text-center py-8">No orders yet</p>
              )}
            </div>
          </div>
        )}

        {/* Upload Leads Tab */}
        {activeTab === "Upload Leads" && (
          <div className="max-w-2xl">
            <h2 className="font-bold text-[#1F2A2A] mb-4">Upload Delivered Leads</h2>
            <Card>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#1F2A2A] mb-1">
                    Select Order
                  </label>
                  <select
                    value={selectedOrderId}
                    onChange={(e) => setSelectedOrderId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">Choose order...</option>
                    {orders
                      .filter((o) =>
                        ["PaidConfirmed", "InProgress"].includes(o.status)
                      )
                      .map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.user.email} — {o.leadCountMonthly} leads ($
                          {o.totalPriceUsd})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1F2A2A] mb-1">
                    Leads JSON Array
                  </label>
                  <textarea
                    value={leadsJson}
                    onChange={(e) => setLeadsJson(e.target.value)}
                    rows={10}
                    placeholder={`[
  {
    "fullName": "...",
    "roleTitle": "VP Sales",
    "email": "...",
    "phone": "...",
    "linkedinUrl": "...",
    "personalityType": "...",
    "personalityAnalysisUrl": "...",
    "brandName": "...",
    "country": "...",
    "techStacks": "...",
    "seniorityLevel": "Senior",
    "buyingRole": "Champion",
    "preferredChannel": "LinkedIn",
    "isPrimaryContact": true,
    "whatsappAvailable": false
  }
]`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono"
                  />
                </div>

                <Button
                  variant="primary"
                  loading={uploading}
                  onClick={uploadLeads}
                  className="w-full"
                >
                  Upload Leads to Order
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Audit Log Tab */}
        {activeTab === "Audit Log" && (
          <div>
            <h2 className="font-bold text-[#1F2A2A] mb-4">
              Audit Log ({auditLogs.length} entries)
            </h2>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-4 py-2 text-gray-500">Time</th>
                      <th className="text-left px-4 py-2 text-gray-500">Action</th>
                      <th className="text-left px-4 py-2 text-gray-500">User</th>
                      <th className="text-left px-4 py-2 text-gray-500">Entity</th>
                      <th className="text-left px-4 py-2 text-gray-500">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-gray-400 whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-2 font-mono font-semibold text-[#1E6663]">
                          {log.action}
                        </td>
                        <td className="px-4 py-2 text-gray-600">
                          {log.user?.email || "—"}
                        </td>
                        <td className="px-4 py-2 text-gray-500">
                          {log.entity && (
                            <span>
                              {log.entity}:{" "}
                              <span className="font-mono text-xs">
                                {log.entityId?.slice(0, 8)}...
                              </span>
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-gray-400 max-w-xs truncate">
                          {log.details
                            ? JSON.stringify(JSON.parse(log.details))
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
