"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface User {
  id: string;
  plan: string;
  pdfExportsUsed: number;
}

interface Report {
  id: string;
  strictPassed: boolean;
  icpConfidence: number;
  dmuConfidence: number;
}

interface LeadOrder {
  id: string;
  leadCountMonthly: number;
  pricePerLead: number;
  totalPriceUsd: number;
  status: string;
  createdAt: string;
  adminNotes?: string;
  deliveredLeads: { id: string; status: string }[];
  payments: { id: string; status: string; invoiceLink?: string }[];
}

interface ExportPack {
  id: string;
  status: string;
  credits: number;
}

interface OrderConfirmation {
  orderId: string;
  leadCount: number;
  totalPrice: number;
  packageName: string;
}

export function LeadsModule({ report, user }: { report: Report; user: User }) {
  const [orders, setOrders] = useState<LeadOrder[]>([]);
  const [exportPack, setExportPack] = useState<ExportPack | null>(null);
  const [leadCount, setLeadCount] = useState(10);
  const [creating, setCreating] = useState(false);
  const [buyingPack, setBuyingPack] = useState(false);
  const [exportingXlsx, setExportingXlsx] = useState(false);
  const [orderConfirmation, setOrderConfirmation] = useState<OrderConfirmation | null>(null);
  const [markingInvoice, setMarkingInvoice] = useState(false);

  const pricePerLead = user.plan === "PLUS" ? 5 : 15;
  const totalPrice = leadCount * pricePerLead;

  function refreshData() {
    fetch("/api/leads/order")
      .then((r) => r.json())
      .then((d) => setOrders(d.orders || []));

    fetch("/api/payments/export-pack")
      .then((r) => r.json())
      .then((d) => setExportPack(d.exportPack || null));
  }

  useEffect(() => {
    refreshData();
  }, []);

  const STATUS_BADGES: Record<string, "default" | "warning" | "info" | "success" | "teal"> = {
    Draft: "default",
    InvoiceCreated: "warning",
    AwaitingConfirmation: "warning",
    PaidConfirmed: "info",
    InProgress: "teal",
    Delivered: "success",
  };

  async function createOrder() {
    setCreating(true);
    try {
      const orderRes = await fetch("/api/leads/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId: report.id, leadCountMonthly: leadCount }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        alert(orderData.error);
        setCreating(false);
        return;
      }

      setOrderConfirmation({
        orderId: orderData.order.id,
        leadCount,
        totalPrice,
        packageName: "AVORA Targeted B2B Leads",
      });
    } catch {
      alert("Failed to create order. Please try again.");
    } finally {
      setCreating(false);
    }
  }

  async function handleWhatsAppClick() {
    if (!orderConfirmation) return;
    setMarkingInvoice(true);

    const { orderId, leadCount: count, totalPrice: price, packageName } = orderConfirmation;
    const message = `Hi, I'd like to request a payment link for my AVORA order: ${packageName} - ${count} leads/month - $${price} USD. Reference: ${orderId}`;
    const waUrl = `https://wa.me/201011348217?text=${encodeURIComponent(message)}`;

    window.open(waUrl, "_blank");

    try {
      await fetch("/api/leads/order", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
    } catch {
      // Non-critical — order was created, status update can be retried
    } finally {
      setMarkingInvoice(false);
      setOrderConfirmation(null);
      refreshData();
    }
  }

  async function buyExportPack() {
    setBuyingPack(true);
    try {
      const res = await fetch("/api/payments/export-pack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to create export pack request. Please try again.");
        return;
      }
      alert(`Export Pack requested! Use this link to pay via Payoneer:\n${data.invoiceLink}`);
      refreshData();
    } catch {
      alert("Failed. Please try again.");
    } finally {
      setBuyingPack(false);
    }
  }

  async function downloadXlsx(orderId: string) {
    setExportingXlsx(true);
    try {
      const res = await fetch("/api/export/xlsx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      const d = await res.json();

      if (!res.ok) {
        alert(d.error);
        return;
      }

      const XLSX = await import("xlsx");
      const ws = XLSX.utils.json_to_sheet(d.leads);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Leads");
      XLSX.writeFile(wb, `avora-leads-${orderId}.xlsx`);
    } catch {
      alert("Download failed. Please try again.");
    } finally {
      setExportingXlsx(false);
    }
  }

  if (!report.strictPassed) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="font-bold text-[#1F2A2A] text-xl mb-2">Strict Gate Required</h2>
        <p className="text-gray-500 max-w-md mx-auto text-sm">
          Lead ordering is locked until your ICP and DMU confidence both reach 90%+
          and all required onboarding fields are complete.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 max-w-xs mx-auto">
          <div className="text-center">
            <div className="text-2xl font-bold text-[#FF6B63]">{report.icpConfidence}%</div>
            <div className="text-xs text-gray-500">ICP Confidence</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[#FF6B63]">{report.dmuConfidence}%</div>
            <div className="text-xs text-gray-500">DMU Confidence</div>
          </div>
        </div>
        <a href="/onboarding" className="mt-6 inline-block">
          <Button variant="secondary">Complete Onboarding →</Button>
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* WhatsApp Order Confirmation Modal */}
      {orderConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4">
            <h3 className="font-bold text-[#1F2A2A] text-lg mb-4">Order Summary</h3>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2 mb-5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Package</span>
                <span className="font-medium text-[#1F2A2A]">{orderConfirmation.packageName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Leads per month</span>
                <span className="font-medium text-[#1F2A2A]">{orderConfirmation.leadCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total price</span>
                <span className="font-bold text-[#1F2A2A] text-base">
                  ${orderConfirmation.totalPrice.toLocaleString()} USD
                </span>
              </div>
              <div className="flex justify-between text-sm pt-1 border-t border-gray-200">
                <span className="text-gray-500">Reference</span>
                <span className="font-mono text-xs text-gray-600 break-all text-right max-w-[60%]">
                  {orderConfirmation.orderId}
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-5">
              Click below to contact us on WhatsApp. We&apos;ll send you a payment link within a few hours.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setOrderConfirmation(null);
                  refreshData();
                }}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleWhatsAppClick}
                disabled={markingInvoice}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#25D366] text-white text-sm font-semibold hover:bg-[#1DAA54] transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Contact us on WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lead Order Form */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-[#1F2A2A]">Request Targeted Leads</h3>
          <Badge variant={user.plan === "PLUS" ? "success" : "default"}>
            ${pricePerLead}/lead · {user.plan}
          </Badge>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-[#1F2A2A] block mb-2">
              Number of leads per month
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={5}
                max={200}
                step={5}
                value={leadCount}
                onChange={(e) => setLeadCount(Number(e.target.value))}
                className="flex-1 accent-[#1E6663]"
              />
              <span className="w-16 text-center font-bold text-[#1E6663] text-lg">
                {leadCount}
              </span>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{leadCount} leads × ${pricePerLead}/lead</p>
              <p className="text-2xl font-bold text-[#1F2A2A] mt-0.5">
                ${totalPrice.toLocaleString()} USD
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Delivered within 7 business days · We&apos;ll send you a payment link via WhatsApp
              </p>
            </div>
            <Button
              variant="primary"
              size="lg"
              loading={creating}
              onClick={createOrder}
            >
              Request &amp; Get Invoice
            </Button>
          </div>

          {user.plan === "LITE" && (
            <div className="bg-[#1E6663]/5 rounded-lg p-3 text-xs text-[#1E6663]">
              💡 <strong>PLUS members</strong> pay $5/lead (66% less). Upgrade by placing your
              first order.
            </div>
          )}
        </div>
      </Card>

      {/* Existing Orders */}
      {orders.length > 0 && (
        <div>
          <h3 className="font-bold text-[#1F2A2A] mb-3">Your Orders</h3>
          <div className="space-y-3">
            {orders.map((order) => {
              const deliveredCount = order.deliveredLeads?.length || 0;
              const hasConfirmedExportPack = exportPack?.status === "Confirmed";

              return (
                <Card key={order.id} padding="sm">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-[#1F2A2A] text-sm">
                          {order.leadCountMonthly} leads/month
                        </span>
                        <Badge variant={STATUS_BADGES[order.status] || "default"}>
                          {order.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-500 space-y-0.5">
                        <p>${order.pricePerLead}/lead · Total: ${order.totalPriceUsd}</p>
                        <p>Placed: {new Date(order.createdAt).toLocaleDateString()}</p>
                        {order.adminNotes && (
                          <p className="text-[#1E6663]">📝 Admin: {order.adminNotes}</p>
                        )}
                      </div>

                      {/* Delivery progress */}
                      {deliveredCount > 0 && (
                        <div className="mt-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-600">Delivered</span>
                            <span className="font-semibold">
                              {deliveredCount} / {order.leadCountMonthly}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-[#1E6663] h-1.5 rounded-full"
                              style={{
                                width: `${Math.min(100, (deliveredCount / order.leadCountMonthly) * 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      {order.status === "Delivered" && user.plan === "PLUS" && (
                        <Button
                          size="sm"
                          variant={hasConfirmedExportPack ? "secondary" : "outline"}
                          loading={exportingXlsx}
                          disabled={!hasConfirmedExportPack}
                          onClick={() => downloadXlsx(order.id)}
                          title={
                            hasConfirmedExportPack
                              ? "Download XLSX"
                              : "Requires Export Pack ($100)"
                          }
                        >
                          {hasConfirmedExportPack ? "↓ XLSX" : "🔒 XLSX"}
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Export Pack section */}
      {user.plan === "PLUS" && (
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-[#1F2A2A]">XLSX Export Pack</h3>
              <p className="text-sm text-gray-500 mt-1">
                50 credits = $100 · Enables XLSX download for all your lead orders.
              </p>
              {exportPack && (
                <div className="mt-2">
                  <Badge
                    variant={exportPack.status === "Confirmed" ? "success" : "warning"}
                  >
                    {exportPack.status === "Confirmed"
                      ? "✓ Export Pack Active"
                      : "⏳ Awaiting Confirmation"}
                  </Badge>
                </div>
              )}
            </div>
            {!exportPack && (
              <Button
                variant="outline"
                loading={buyingPack}
                onClick={buyExportPack}
              >
                Buy Export Pack ($100)
              </Button>
            )}
            {exportPack?.status === "Pending" && (
              <span className="text-xs text-amber-600 text-right">
                Awaiting admin confirmation.<br />Activates automatically.
              </span>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
