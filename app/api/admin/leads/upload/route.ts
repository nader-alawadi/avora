import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";

// POST /api/admin/leads/upload — deliver all remaining staged leads for an order
// Body: { orderId: string, force?: boolean }
//   force=false (default): returns 409 with partial info if staged+delivered < ordered
//   force=true: delivers all staged and marks order Delivered regardless of count
// Role restriction: LeadResearcher may NOT use this endpoint (single-send only)
export async function POST(req: NextRequest) {
  let admin;
  try {
    admin = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // LeadResearcher can only deliver individual leads, not batch-deliver all
  if (admin.sessionType === "adminTeam" && admin.adminRole === "LeadResearcher") {
    return NextResponse.json(
      { error: "LeadResearcher role cannot use Deliver All — use individual Send buttons instead" },
      { status: 403 }
    );
  }

  console.log("[upload] actor:", admin.sessionType, admin.adminRole ?? "n/a", admin.id);

  try {
    const body = await req.json();
    const { orderId, force = false } = body as { orderId: string; force?: boolean };

    if (!orderId) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const order = await prisma.leadOrder.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Count already-delivered leads
    const alreadyDelivered = await prisma.deliveredLead.count({
      where: { orderId, status: "Delivered" },
    });

    // Find all staged leads for this order
    const stagedLeads = await prisma.deliveredLead.findMany({
      where: { orderId, status: "Staged" },
    });

    if (stagedLeads.length === 0) {
      // No staged leads — if all are delivered, still mark order as Delivered
      if (alreadyDelivered > 0) {
        await prisma.leadOrder.update({ where: { id: orderId }, data: { status: "Delivered" } });
        return NextResponse.json({ count: 0, alreadyDelivered, markedDelivered: true });
      }
      return NextResponse.json({ error: "No staged leads to deliver" }, { status: 400 });
    }

    const totalReady = alreadyDelivered + stagedLeads.length;
    const ordered = order.leadCountMonthly;

    // Partial delivery warning — only block if not forced
    if (!force && totalReady < ordered) {
      return NextResponse.json(
        { partial: true, ready: totalReady, ordered, staged: stagedLeads.length, alreadyDelivered },
        { status: 409 }
      );
    }

    const deliveryBatch = `Batch-${Date.now()}`;
    const deliveryDate = new Date();
    const deliveredByAdminId =
      admin.sessionType === "adminTeam" && admin.adminTeamMemberId
        ? admin.adminTeamMemberId
        : null;

    await prisma.deliveredLead.updateMany({
      where: { orderId, status: "Staged" },
      data: {
        status: "Delivered",
        deliveryBatch,
        deliveryDate,
        ...(deliveredByAdminId && { deliveredByAdminId }),
      },
    });

    // Create CrmLead entries
    const crmLeadsCreated: string[] = [];
    for (const dl of stagedLeads) {
      try {
        const existing = await prisma.crmLead.findUnique({
          where: { deliveredLeadId: dl.id },
          select: { id: true },
        });
        if (existing) {
          crmLeadsCreated.push(existing.id);
          continue;
        }

        const crmLead = await prisma.crmLead.create({
          data: {
            userId: order.userId,
            deliveredLeadId: dl.id,
            fullName: dl.fullName || "",
            roleTitle: dl.roleTitle || "",
            company: dl.brandName || "",
            linkedinUrl: dl.linkedinUrl || "",
            email: dl.email || "",
            phone: dl.phone || "",
            personalityType: dl.personalityType || "",
            buyingRole: dl.buyingRole || "",
            seniorityLevel: dl.seniorityLevel || "",
            country: dl.country || "",
            stage: "NewLead",
          },
        });
        crmLeadsCreated.push(crmLead.id);
      } catch (innerErr) {
        console.error("[upload] Failed to create CrmLead for deliveredLeadId:", dl.id, innerErr);
      }
    }

    if (crmLeadsCreated.length > 0) {
      await prisma.crmActivity.createMany({
        data: crmLeadsCreated.map((crmLeadId) => ({
          crmLeadId,
          type: "lead_created",
          description: "Lead added to CRM by AVORA team",
        })),
      });
    }

    // Mark order as Delivered
    await prisma.leadOrder.update({
      where: { id: orderId },
      data: { status: "Delivered" },
    });

    const auditUserId = admin.sessionType === "user" ? admin.id : null;
    await createAuditLog(auditUserId, "LEADS_DELIVERED", "LeadOrder", orderId, {
      count: stagedLeads.length,
      deliveryBatch,
      crmLeadsCreated: crmLeadsCreated.length,
      alreadyDelivered,
      totalDelivered: alreadyDelivered + stagedLeads.length,
      forced: force,
      actorType: admin.sessionType,
      actorId: admin.id,
      actorEmail: admin.email,
    });

    console.log("[upload] done. staged:", stagedLeads.length, "total:", totalReady);
    return NextResponse.json({
      count: stagedLeads.length,
      deliveryBatch,
      alreadyDelivered,
      totalDelivered: totalReady,
    });
  } catch (err) {
    console.error("[upload] Unexpected error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
