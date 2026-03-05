import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";

// POST /api/admin/leads/deliver-single — deliver one staged lead to the client's CRM
export async function POST(req: NextRequest) {
  let admin;
  try {
    admin = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  console.log("[deliver-single] actor:", admin.sessionType, admin.adminRole ?? "n/a", admin.id);

  try {
    const { leadId, orderId } = await req.json();
    if (!leadId || !orderId) {
      return NextResponse.json({ error: "leadId and orderId are required" }, { status: 400 });
    }

    const order = await prisma.leadOrder.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const dl = await prisma.deliveredLead.findUnique({ where: { id: leadId } });
    if (!dl || dl.orderId !== orderId) {
      return NextResponse.json({ error: "Lead not found in this order" }, { status: 404 });
    }
    if (dl.status !== "Staged") {
      return NextResponse.json({ error: "Lead is not staged" }, { status: 409 });
    }

    // Check for existing CrmLead (idempotent guard)
    const existing = await prisma.crmLead.findUnique({
      where: { deliveredLeadId: dl.id },
      select: { id: true },
    });

    let crmLeadId: string;

    if (existing) {
      crmLeadId = existing.id;
    } else {
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
      crmLeadId = crmLead.id;

      await prisma.crmActivity.create({
        data: {
          crmLeadId,
          type: "lead_created",
          description: "Lead added to CRM by AVORA team",
        },
      });
    }

    // Mark DeliveredLead as Delivered
    await prisma.deliveredLead.update({
      where: { id: dl.id },
      data: {
        status: "Delivered",
        deliveryBatch: `Single-${Date.now()}`,
        deliveryDate: new Date(),
      },
    });

    // Update order to InProgress if it's still PaidConfirmed
    if (order.status === "PaidConfirmed") {
      await prisma.leadOrder.update({
        where: { id: orderId },
        data: { status: "InProgress" },
      });
    }

    const auditUserId = admin.sessionType === "user" ? admin.id : null;
    await createAuditLog(auditUserId, "LEAD_DELIVERED_SINGLE", "DeliveredLead", dl.id, {
      orderId,
      crmLeadId,
      actorType: admin.sessionType,
      actorId: admin.id,
      actorEmail: admin.email,
    });

    console.log("[deliver-single] done. crmLeadId:", crmLeadId);
    return NextResponse.json({ crmLeadId, ok: true });
  } catch (err) {
    console.error("[deliver-single] error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
