"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/Badge";

interface LeadOrder {
  id: string;
  leadCountMonthly: number;
  pricePerLead: number;
  totalPriceUsd: number;
  status: string;
  adminNotes?: string;
  createdAt: string;
  deliveredLeads: { id: string }[];
}

const STAGES = [
  {
    key: "placed",
    label: "Order Placed",
    icon: "📋",
    statuses: ["Draft", "InvoiceCreated", "AwaitingConfirmation", "PaidConfirmed", "InProgress", "Delivered"],
  },
  {
    key: "paid",
    label: "Payment Confirmed",
    icon: "💳",
    statuses: ["PaidConfirmed", "InProgress", "Delivered"],
  },
  {
    key: "inprogress",
    label: "In Progress",
    icon: "⚙️",
    statuses: ["InProgress", "Delivered"],
  },
  {
    key: "delivered",
    label: "Leads Delivered",
    icon: "🎉",
    statuses: ["Delivered"],
  },
];

function addBusinessDays(date: Date, days: number): Date {
  const result = new Date(date);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    const day = result.getDay();
    if (day !== 0 && day !== 6) added++;
  }
  return result;
}

const STATUS_VARIANT: Record<string, "default" | "warning" | "info" | "success" | "teal" | "danger"> = {
  Draft: "default",
  InvoiceCreated: "warning",
  AwaitingConfirmation: "warning",
  PaidConfirmed: "info",
  InProgress: "teal",
  Delivered: "success",
};

function OrderTimeline({ order }: { order: LeadOrder }) {
  const delivered = order.deliveredLeads.length;
  const expectedDelivery = addBusinessDays(new Date(order.createdAt), 7);
  const isDelivered = order.status === "Delivered";
  const isLate = !isDelivered && new Date() > expectedDelivery;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-[#1F2A2A]">
              {order.leadCountMonthly} leads/month
            </span>
            <Badge variant={STATUS_VARIANT[order.status] || "default"}>
              {order.status}
            </Badge>
          </div>
          <p className="text-xs text-gray-400">
            Ordered {new Date(order.createdAt).toLocaleDateString()} ·
            ${order.pricePerLead}/lead · Total ${order.totalPriceUsd.toLocaleString()}
          </p>
        </div>
        <div className="text-right text-xs text-gray-500">
          <p className={`font-medium ${isLate ? "text-red-500" : ""}`}>
            {isDelivered ? "Delivered ✓" : `Expected: ${expectedDelivery.toLocaleDateString()}`}
          </p>
          {isLate && <p className="text-red-400 mt-0.5">Delayed</p>}
        </div>
      </div>

      {/* Progress stepper */}
      <div className="relative">
        {/* Connector line */}
        <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200" />
        <motion.div
          className="absolute top-5 left-5 h-0.5 bg-gradient-to-r from-[#1E6663] to-[#4ecdc4]"
          initial={{ width: 0 }}
          animate={{
            width: `${
              STAGES.filter((s) => s.statuses.includes(order.status)).length === 0
                ? 0
                : ((STAGES.filter((s) => s.statuses.includes(order.status)).length - 1) /
                    (STAGES.length - 1)) *
                  100
            }%`,
          }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          style={{ right: "auto" }}
        />

        <div className="relative flex justify-between">
          {STAGES.map((stage, i) => {
            const isComplete = stage.statuses.includes(order.status);
            const isCurrent =
              STAGES.filter((s) => s.statuses.includes(order.status)).length - 1 === i;

            return (
              <div key={stage.key} className="flex flex-col items-center gap-2 flex-1">
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 * i, duration: 0.4 }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-base z-10 border-2 transition-all ${
                    isComplete
                      ? "bg-[#1E6663] border-[#1E6663] shadow-md"
                      : "bg-white border-gray-200"
                  } ${isCurrent ? "ring-4 ring-[#1E6663]/20" : ""}`}
                >
                  {isComplete ? (
                    <span className="text-white text-sm">{i === STAGES.length - 1 ? "🎉" : "✓"}</span>
                  ) : (
                    <span className="text-gray-300 text-base">{stage.icon}</span>
                  )}
                </motion.div>
                <div className="text-center">
                  <p
                    className={`text-xs font-semibold leading-tight ${
                      isComplete ? "text-[#1E6663]" : "text-gray-400"
                    }`}
                  >
                    {stage.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Delivery progress */}
      {delivered > 0 && (
        <div className="mt-6 bg-gray-50 rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-[#1F2A2A]">Leads delivered</span>
            <span className="text-sm font-bold text-[#1E6663]">
              {delivered} / {order.leadCountMonthly}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <motion.div
              className="h-2.5 bg-gradient-to-r from-[#1E6663] to-[#4ecdc4] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (delivered / order.leadCountMonthly) * 100)}%` }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
            />
          </div>
          {isDelivered && (
            <p className="text-xs text-green-600 mt-2 font-medium">
              ✓ All leads delivered — check your CRM tab to manage them
            </p>
          )}
        </div>
      )}

      {/* Admin notes */}
      {order.adminNotes && (
        <div className="mt-4 bg-[#1E6663]/5 border border-[#1E6663]/15 rounded-lg px-4 py-2.5 text-xs text-[#1E6663]">
          📝 AVORA team: {order.adminNotes}
        </div>
      )}
    </div>
  );
}

export function ProgressTab() {
  const [orders, setOrders] = useState<LeadOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leads/order")
      .then((r) => r.json())
      .then((d) => setOrders(d.orders || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[0, 1].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-32 mb-4" />
            <div className="flex justify-between gap-4">
              {[0, 1, 2, 3].map((j) => (
                <div key={j} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gray-200" />
                  <div className="h-3 bg-gray-200 rounded w-16" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">📋</div>
        <h3 className="font-bold text-[#1F2A2A] text-lg mb-2">No orders yet</h3>
        <p className="text-gray-500 text-sm max-w-sm mx-auto">
          Place your first lead order from the Request Leads tab to start tracking progress here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-bold text-[#1F2A2A] text-lg">Order Progress</h2>
        <span className="text-sm text-gray-400">{orders.length} order{orders.length !== 1 ? "s" : ""}</span>
      </div>
      {orders.map((order, i) => (
        <motion.div
          key={order.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <OrderTimeline order={order} />
        </motion.div>
      ))}
    </div>
  );
}
