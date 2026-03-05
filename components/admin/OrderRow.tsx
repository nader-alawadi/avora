"use client";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
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

const STATUS_BADGE: Record<string, "default" | "warning" | "success" | "danger" | "info"> = {
  Draft: "default",
  InvoiceCreated: "warning",
  AwaitingConfirmation: "warning",
  PaidConfirmed: "info",
  InProgress: "info",
  Delivered: "success",
};

interface OrderRowProps {
  order: Order;
  onUpdate: (orderId: string, status: string, adminNotes: string) => Promise<void>;
  updating: boolean;
}

export function OrderRow({ order, onUpdate, updating }: OrderRowProps) {
  const [editStatus, setEditStatus] = useState(order.status);
  const [editNotes, setEditNotes] = useState(order.adminNotes || "");

  return (
    <Card padding="sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm">
              {order.leadCountMonthly} leads/month
            </span>
            <Badge variant={STATUS_BADGE[order.status] || "default"}>
              {order.status}
            </Badge>
          </div>
          <p className="text-xs text-gray-500">
            {order.user.name || order.user.email} · ${order.pricePerLead}/lead · Total: $
            {order.totalPriceUsd}
          </p>
          <p className="text-xs text-gray-400">
            Delivered: {order.deliveredLeads?.length || 0} / {order.leadCountMonthly}
          </p>
          <p className="text-xs text-gray-400">
            {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="flex flex-col gap-2 min-w-48">
          <select
            value={editStatus}
            onChange={(e) => setEditStatus(e.target.value)}
            className="text-xs border border-gray-300 rounded-lg px-2 py-1.5"
          >
            {[
              "Draft",
              "InvoiceCreated",
              "AwaitingConfirmation",
              "PaidConfirmed",
              "InProgress",
              "Delivered",
            ].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <input
            value={editNotes}
            onChange={(e) => setEditNotes(e.target.value)}
            placeholder="Admin notes..."
            className="text-xs border border-gray-300 rounded-lg px-2 py-1.5"
          />
          <Button
            size="sm"
            variant="secondary"
            loading={updating}
            onClick={() => onUpdate(order.id, editStatus, editNotes)}
          >
            Update
          </Button>
        </div>
      </div>
    </Card>
  );
}
