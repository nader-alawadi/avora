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

export function LeadsModule({ report, user }: { report: Report; user: User }) {
  const [orders, setOrders] = useState<LeadOrder[]>([]);
  const [exportPack, setExportPack] = useState<ExportPack | null>(null);
  const [leadCount, setLeadCount] = useState(10);
  const [creating, setCreating] = useState(false);
  const [buyingPack, setBuyingPack] = useState(false);
  const [exportingXlsx, setExportingXlsx] = useState(false);
  const [paymentNotice, setPaymentNotice] = useState<"success" | "cancelled" | null>(null);

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

    // Detect redirect back from Stripe Checkout and show inline notice
    const params = new URLSearchParams(window.location.search);
    const payment = params.get("payment");
    if (payment === "success" || payment === "cancelled") {
      setPaymentNotice(payment);
      // Clean the query string without a page reload
      window.history.replaceState({}, "", window.location.pathname);
    }
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
      // Step 1: create the order record
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

      // Step 2: open Stripe Checkout session
      const stripeRes = await fetch("/api/payments/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "LeadOrder",
          orderId: orderData.order.id,
          amountUsd: orderData.order.totalPriceUsd,
          leadCountMonthly: leadCount,
        }),
      });
      const stripeData = await stripeRes.json();
      if (!stripeRes.ok) {
        alert(stripeData.error || "Failed to start payment. Please try again.");
        setCreating(false);
        return;
      }

      // Step 3: redirect to Stripe-hosted Checkout (browser leaves this page)
      window.location.href = stripeData.checkoutUrl;
    } catch {
      alert("Failed to create order. Please try again.");
      setCreating(false);
    }
    // Note: do NOT reset creating=false on the success path — browser redirects away
  }

  async function buyExportPack() {
    setBuyingPack(true);
    try {
      const stripeRes = await fetch("/api/payments/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "ExportPack", amountUsd: 100 }),
      });
      const stripeData = await stripeRes.json();
      if (!stripeRes.ok) {
        alert(stripeData.error || "Failed to start payment. Please try again.");
        setBuyingPack(false);
        return;
      }

      // Redirect to Stripe-hosted Checkout
      window.location.href = stripeData.checkoutUrl;
    } catch {
      alert("Failed. Please try again.");
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
        if (d.needsExportPack) {
          alert(d.error);
        } else {
          alert(d.error);
        }
        return;
      }

      // Client-side XLSX generation using xlsx library
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
      {/* Payment result banners (shown after Stripe redirect) */}
      {paymentNotice === "success" && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
          <span className="text-green-500 text-xl mt-0.5">✓</span>
          <div className="flex-1">
            <p className="font-semibold text-green-800 text-sm">Payment successful!</p>
            <p className="text-green-700 text-xs mt-1">
              Your payment has been received. Order status will update to{" "}
              <strong>PaidConfirmed</strong> once our system confirms it — usually within a few seconds.
            </p>
          </div>
          <button
            onClick={() => { setPaymentNotice(null); refreshData(); }}
            className="text-green-400 hover:text-green-600 text-lg leading-none"
          >
            ×
          </button>
        </div>
      )}
      {paymentNotice === "cancelled" && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <span className="text-amber-500 text-xl mt-0.5">⚠</span>
          <div className="flex-1">
            <p className="font-semibold text-amber-800 text-sm">Payment cancelled</p>
            <p className="text-amber-700 text-xs mt-1">
              You cancelled the payment. Your order was created but is not yet paid.
              Click <strong>Request &amp; Pay</strong> again to complete the purchase.
            </p>
          </div>
          <button
            onClick={() => setPaymentNotice(null)}
            className="text-amber-400 hover:text-amber-600 text-lg leading-none"
          >
            ×
          </button>
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
                Delivered within 7 business days · Secure card payment via Stripe
              </p>
            </div>
            <Button
              variant="primary"
              size="lg"
              loading={creating}
              onClick={createOrder}
            >
              Request &amp; Pay
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
                      : "⏳ Processing Payment"}
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
                Payment processing.<br />Activates automatically.
              </span>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
