"use client";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

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

export function LeadDeliveryPanel({ orders, onRefresh }: Props) {
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [leadsJson, setLeadsJson] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, string>>({});

  async function uploadLeads(orderId: string) {
    const json = leadsJson[orderId] || "";
    if (!json.trim()) {
      alert("Paste leads JSON first");
      return;
    }

    let parsed;
    try {
      parsed = JSON.parse(json);
    } catch {
      alert("Invalid JSON format");
      return;
    }

    if (!Array.isArray(parsed) || parsed.length === 0) {
      alert("JSON must be a non-empty array of leads");
      return;
    }

    setUploading(orderId);
    setResults((prev) => ({ ...prev, [orderId]: "" }));

    try {
      const res = await fetch("/api/admin/leads/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, leads: parsed }),
      });
      const d = await res.json();

      if (res.ok) {
        setResults((prev) => ({
          ...prev,
          [orderId]: `✅ Uploaded ${d.count} leads. CRM entries created automatically.`,
        }));
        setLeadsJson((prev) => ({ ...prev, [orderId]: "" }));
        setExpandedOrder(null);
        onRefresh();
      } else {
        setResults((prev) => ({ ...prev, [orderId]: `❌ Error: ${d.error}` }));
      }
    } catch {
      setResults((prev) => ({ ...prev, [orderId]: "❌ Network error. Please try again." }));
    } finally {
      setUploading(null);
    }
  }

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

      {/* Active orders needing delivery */}
      {activeOrders.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-[#1E6663] mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-[#1E6663] rounded-full animate-pulse" />
            Ready for Delivery ({activeOrders.length})
          </h3>
          <div className="space-y-3">
            {activeOrders.map((order) => {
              const delivered = order.deliveredLeads.length;
              const isExpanded = expandedOrder === order.id;

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                >
                  {/* Order header row */}
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
                      onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                    >
                      {isExpanded ? "Cancel" : "Upload Leads"}
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

                  {/* Expanded upload area */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 p-4 bg-gray-50">
                      <p className="text-xs font-semibold text-gray-600 mb-2">
                        Leads JSON Array — paste the array of lead objects below
                      </p>
                      <textarea
                        value={leadsJson[order.id] || ""}
                        onChange={(e) =>
                          setLeadsJson((prev) => ({ ...prev, [order.id]: e.target.value }))
                        }
                        rows={8}
                        placeholder={`[
  {
    "fullName": "John Doe",
    "roleTitle": "VP Sales",
    "brandName": "Acme Corp",
    "email": "john@acme.com",
    "phone": "+1234567890",
    "linkedinUrl": "https://linkedin.com/in/johndoe",
    "personalityType": "Driver",
    "buyingRole": "Champion",
    "country": "US",
    "seniorityLevel": "Senior"
  }
]`}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono bg-white focus:outline-none focus:ring-2 focus:ring-[#1E6663]/30 focus:border-[#1E6663] resize-none"
                      />
                      {results[order.id] && (
                        <p className="mt-2 text-xs font-medium text-gray-700">{results[order.id]}</p>
                      )}
                      <div className="mt-3 flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setExpandedOrder(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          variant="primary"
                          loading={uploading === order.id}
                          onClick={() => uploadLeads(order.id)}
                        >
                          Upload & Mark Delivered
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeOrders.length === 0 && (
        <div className="text-center py-10 text-gray-400 text-sm">
          No orders awaiting delivery right now.
        </div>
      )}

      {/* All other orders (history) */}
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
                      <p className="font-medium text-[#1F2A2A] text-sm">
                        {order.user.name || "—"}
                      </p>
                      <p className="text-xs text-gray-400">{order.user.email}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{order.leadCountMonthly}</td>
                    <td className="px-4 py-3 text-gray-600">{order.deliveredLeads.length}</td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_BADGE[order.status] || "default"}>
                        {order.status}
                      </Badge>
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
    </div>
  );
}
