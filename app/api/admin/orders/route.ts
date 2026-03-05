import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";

export async function GET() {
  try {
    await requireAdmin();

    const orders = await prisma.leadOrder.findMany({
      include: {
        user: {
          select: {
            id: true, name: true, email: true, plan: true,
            companyProfile: { select: { companyName: true } },
          },
        },
        payments: true,
        deliveredLeads: {
          select: {
            id: true,
            status: true,
            fullName: true,
            roleTitle: true,
            brandName: true,
            disputeReason: true,
            disputeDetails: true,
            disputeFileUrl: true,
          },
        },
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

    const auditUserId = admin.sessionType === "user" ? admin.id : null;
    await createAuditLog(auditUserId, "ORDER_STATUS_UPDATED", "LeadOrder", orderId, {
      actorType: admin.sessionType,
      actorId: admin.id,
      actorEmail: admin.email,
      status,
      adminNotes,
    });

    return NextResponse.json({ order });
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}
