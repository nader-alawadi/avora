import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";

// POST /api/admin/leads/upload — deliver all Staged leads for an order to the client's CRM
export async function POST(req: NextRequest) {
  let admin;
  try {
    admin = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  console.log("[upload] session type:", admin.sessionType, "| role:", admin.adminRole ?? "n/a", "| id:", admin.id);

  try {
    const { orderId } = await req.json();
    console.log("[upload] orderId:", orderId);

    if (!orderId) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const order = await prisma.leadOrder.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    console.log("[upload] order.id:", order.id, "order.userId:", order.userId);

    // Find all staged leads for this order
    const stagedLeads = await prisma.deliveredLead.findMany({
      where: { orderId, status: "Staged" },
    });
    console.log("[upload] stagedLeads.length:", stagedLeads.length, "ids:", stagedLeads.map((l) => l.id));

    if (stagedLeads.length === 0) {
      return NextResponse.json({ error: "No staged leads to deliver" }, { status: 400 });
    }

    const deliveryBatch = `Batch-${Date.now()}`;
    const deliveryDate = new Date();

    // Promote all Staged → Delivered
    const updateResult = await prisma.deliveredLead.updateMany({
      where: { orderId, status: "Staged" },
      data: { status: "Delivered", deliveryBatch, deliveryDate },
    });
    console.log("[upload] updateMany result (Staged→Delivered):", updateResult);

    // Create CrmLead entries one-by-one so unique constraint violations are visible
    const crmLeadsCreated: string[] = [];
    for (const dl of stagedLeads) {
      try {
        // Skip if a CrmLead already exists for this deliveredLeadId (e.g. double-submit)
        const existing = await prisma.crmLead.findUnique({
          where: { deliveredLeadId: dl.id },
          select: { id: true },
        });
        if (existing) {
          console.log("[upload] CrmLead already exists for deliveredLeadId:", dl.id, "→ skipping");
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
        console.log("[upload] Created CrmLead id:", crmLead.id, "for userId:", order.userId);
        crmLeadsCreated.push(crmLead.id);
      } catch (innerErr) {
        console.error("[upload] Failed to create CrmLead for deliveredLeadId:", dl.id, innerErr);
      }
    }

    console.log("[upload] Total CrmLeads created:", crmLeadsCreated.length);

    // Create activity logs for each successfully created CRM lead
    if (crmLeadsCreated.length > 0) {
      await prisma.crmActivity.createMany({
        data: crmLeadsCreated.map((crmLeadId) => ({
          crmLeadId,
          type: "lead_created",
          description: "Lead added to CRM by AVORA team",
        })),
      });
    }

    // Mark the order as Delivered
    await prisma.leadOrder.update({
      where: { id: orderId },
      data: { status: "Delivered" },
    });

    // For AdminTeamMember sessions, admin.id is NOT a User.id — pass null to avoid FK violation
    const auditUserId = admin.sessionType === "user" ? admin.id : null;
    await createAuditLog(auditUserId, "LEADS_DELIVERED", "LeadOrder", orderId, {
      count: stagedLeads.length,
      deliveryBatch,
      crmLeadsCreated: crmLeadsCreated.length,
      actorType: admin.sessionType,
      actorId: admin.id,
      actorEmail: admin.email,
    });

    console.log("[upload] Done. count:", stagedLeads.length);
    return NextResponse.json({ count: stagedLeads.length, deliveryBatch });
  } catch (err) {
    console.error("[upload] Unexpected error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
