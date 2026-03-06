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
            deliveredLead: { select: { id: true, orderId: true } },
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
            deliveredLeadId: true,
            deliveredLead: { select: { id: true, orderId: true } },
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
      await prisma.$transaction(async (tx: any) => {
        // 1. Mark the DeliveredLead as "Disputed" and stamp the dispute data onto it
        //    so Lead Researchers can see exactly why it was rejected.
        //    Do this BEFORE deleting the CrmLead (which would null out crmLead.deliveredLeadId).
        const deliveredLeadId = dispute.crmLead?.deliveredLeadId ?? null;
        if (deliveredLeadId) {
          await tx.deliveredLead.update({
            where: { id: deliveredLeadId },
            data: {
              status: "Disputed",
              disputeReason: dispute.reason,
              disputeDetails: dispute.details ?? null,
              disputeFileUrl: dispute.fileUrl ?? null,
            },
          });
        }

        // 2. Delete the CRM lead (cascades to CrmActivity; LeadDispute.crmLeadId → SetNull)
        if (dispute.crmLeadId) {
          await tx.crmLead.delete({ where: { id: dispute.crmLeadId } });
        }

        // 3. Update dispute status
        await tx.leadDispute.update({
          where: { id: disputeId },
          data: { status: "Accepted", adminNote: adminNote || null, updatedAt: new Date() },
        });
      });

      // Notify client via activity (lead is deleted, so we create a standalone audit log)
      await createAuditLog(session.id, "DISPUTE_ACCEPTED", "LeadDispute", disputeId, {
        crmLeadId: dispute.crmLeadId,
        clientUserId: dispute.crmLead?.userId,
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

    // Log activity on the lead so client sees it (only if CrmLead still exists)
    if (dispute.crmLeadId) {
      await prisma.crmActivity.create({
        data: {
          crmLeadId: dispute.crmLeadId,
          type: "dispute_rejected",
          description: `Dispute rejected by admin${adminNote ? `: "${adminNote}"` : ""}`,
        },
      });
    }

    await createAuditLog(session.id, "DISPUTE_REJECTED", "LeadDispute", disputeId, {
      crmLeadId: dispute.crmLeadId,
      clientUserId: dispute.crmLead?.userId,
      reason: dispute.reason,
      adminNote,
    });

    return NextResponse.json({ status: "Rejected" });
  } catch (err) {
    console.error("[admin/disputes PATCH] error:", err);
    return NextResponse.json({ error: "Failed to process dispute" }, { status: 500 });
  }
}
