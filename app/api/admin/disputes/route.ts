import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";

// GET /api/admin/disputes — list all disputes
export async function GET() {
  try {
    await requireAdmin();

    const disputes = await prisma.leadDispute.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
        crmLead: {
          select: {
            id: true,
            fullName: true,
            roleTitle: true,
            company: true,
            deliveredLeadId: true,
            deliveredLead: { select: { orderId: true } },
          },
        },
      },
    });

    return NextResponse.json({ disputes });
  } catch (err) {
    console.error("[admin/disputes GET] error:", err);
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}

// PATCH /api/admin/disputes — accept or reject a dispute
export async function PATCH(req: NextRequest) {
  try {
    const session = await requireAdmin();
    const { disputeId, action, adminNote } = await req.json();

    if (!disputeId || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (action !== "accept" && action !== "reject") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const dispute = await prisma.leadDispute.findUnique({
      where: { id: disputeId },
      include: {
        crmLead: {
          select: {
            id: true,
            userId: true,
            fullName: true,
            deliveredLead: { select: { orderId: true } },
          },
        },
      },
    });

    if (!dispute) {
      return NextResponse.json({ error: "Dispute not found" }, { status: 404 });
    }

    if (dispute.status !== "Pending") {
      return NextResponse.json({ error: "Dispute is already resolved" }, { status: 409 });
    }

    if (action === "accept") {
      await prisma.$transaction(async (tx) => {
        // Update dispute status
        await tx.leadDispute.update({
          where: { id: disputeId },
          data: { status: "Accepted", adminNote: adminNote || null, updatedAt: new Date() },
        });

        // Delete the CRM lead
        await tx.crmLead.delete({ where: { id: dispute.crmLeadId } });

        // Decrement the order's delivered count by setting the DeliveredLead status back
        // so it can be reassigned (replacement)
        if (dispute.crmLead.deliveredLead?.orderId) {
          await tx.deliveredLead.updateMany({
            where: { orderId: dispute.crmLead.deliveredLead.orderId, status: "Delivered" },
            data: {},  // no-op field update; actual count is derived
          });
        }
      });

      // Notify client via activity (lead is deleted, so we create a standalone audit log)
      await createAuditLog(session.id, "DISPUTE_ACCEPTED", "LeadDispute", disputeId, {
        crmLeadId: dispute.crmLeadId,
        clientUserId: dispute.crmLead.userId,
        reason: dispute.reason,
        adminNote,
      });

      return NextResponse.json({ status: "Accepted" });
    }

    // Reject
    await prisma.leadDispute.update({
      where: { id: disputeId },
      data: { status: "Rejected", adminNote: adminNote || null, updatedAt: new Date() },
    });

    // Log activity on the lead so client sees it
    await prisma.crmActivity.create({
      data: {
        crmLeadId: dispute.crmLeadId,
        type: "dispute_rejected",
        description: `Dispute rejected by admin${adminNote ? `: "${adminNote}"` : ""}`,
      },
    });

    await createAuditLog(session.id, "DISPUTE_REJECTED", "LeadDispute", disputeId, {
      crmLeadId: dispute.crmLeadId,
      clientUserId: dispute.crmLead.userId,
      reason: dispute.reason,
      adminNote,
    });

    return NextResponse.json({ status: "Rejected" });
  } catch (err) {
    console.error("[admin/disputes PATCH] error:", err);
    return NextResponse.json({ error: "Failed to process dispute" }, { status: 500 });
  }
}
