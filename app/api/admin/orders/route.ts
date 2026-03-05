import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";

export async function GET() {
  try {
    await requireAdmin();

    const orders = await prisma.leadOrder.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, plan: true } },
        payments: true,
        deliveredLeads: { select: { id: true, status: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders });
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const { orderId, status, adminNotes } = await req.json();

    const validStatuses = [
      "Draft",
      "InvoiceCreated",
      "AwaitingConfirmation",
      "PaidConfirmed",
      "InProgress",
      "Delivered",
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const order = await prisma.leadOrder.update({
      where: { id: orderId },
      data: { status, adminNotes },
    });

    await createAuditLog(admin.id, "ORDER_STATUS_UPDATED", "LeadOrder", orderId, {
      status,
      adminNotes,
    });

    return NextResponse.json({ order });
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}
