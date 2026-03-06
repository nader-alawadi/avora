import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireAuth } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";

export async function GET() {
  // GET is open to all admin roles, including LeadResearcher who needs to
  // see orders in the Deliver Leads tab.
  let session;
  try {
    session = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!session.isAdmin && session.sessionType !== "adminTeam") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
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

    // Annotate each order with a derived flag so the delivery panel can surface
    // "Delivered" orders that still have disputed leads needing replacement.
    const annotated = orders.map((o) => ({
      ...o,
      needsReplacement: o.deliveredLeads.some((l) => l.status === "Disputed"),
    }));

    return NextResponse.json({ orders: annotated });
  } catch (err) {
    console.error("[admin/orders GET] error:", err);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireAdmin();

    // LeadResearcher can read orders but cannot modify them
    if (admin.sessionType === "adminTeam" && admin.adminRole === "LeadResearcher") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
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
