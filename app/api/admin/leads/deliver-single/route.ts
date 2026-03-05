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

  console.log("[deliver-single] actor:", admin.sessionType, admin.adminRole ?? "n/a", "id:", admin.id);

  try {
    const body = await req.json();
    const { leadId, orderId } = body as { leadId: string; orderId: string };
    console.log("[deliver-single] leadId:", leadId, "orderId:", orderId);

    if (!leadId || !orderId) {
      return NextResponse.json({ error: "leadId and orderId are required" }, { status: 400 });
    }

    // 1. Fetch order — we need order.userId to create CrmLead for the correct client
    const order = await prisma.leadOrder.findUnique({ where: { id: orderId } });
    if (!order) {
      console.error("[deliver-single] order not found:", orderId);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    console.log("[deliver-single] order.userId:", order.userId, "order.status:", order.status);

    // 2. Fetch the DeliveredLead — must be Staged and belong to this order
    const dl = await prisma.deliveredLead.findUnique({ where: { id: leadId } });
    if (!dl || dl.orderId !== orderId) {
      console.error("[deliver-single] lead not found or wrong order. dl:", dl?.id, "dl.orderId:", dl?.orderId, "expected:", orderId);
      return NextResponse.json({ error: "Lead not found in this order" }, { status: 404 });
    }
    if (dl.status !== "Staged") {
      console.warn("[deliver-single] lead already delivered. status:", dl.status);
      return NextResponse.json({ error: "Lead is not staged" }, { status: 409 });
    }
    console.log("[deliver-single] DeliveredLead ok. fullName:", dl.fullName, "email:", dl.email);

    // 3. Guard against double-submission
    const existing = await prisma.crmLead.findUnique({
      where: { deliveredLeadId: dl.id },
      select: { id: true },
    });
    if (existing) {
      console.log("[deliver-single] CrmLead already exists:", existing.id, "— idempotent return");
      return NextResponse.json({ crmLeadId: existing.id, ok: true });
    }

    // 4. Create CrmLead for the client (always uses order.userId, not admin's id)
    console.log("[deliver-single] creating CrmLead for userId:", order.userId);
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
    console.log("[deliver-single] CrmLead created:", crmLead.id, "userId:", crmLead.userId);

    // 5. Activity log
    await prisma.crmActivity.create({
      data: {
        crmLeadId: crmLead.id,
        type: "lead_created",
        description: "Lead added to CRM by AVORA team",
      },
    });
    console.log("[deliver-single] CrmActivity created for crmLeadId:", crmLead.id);

    // 6. Mark DeliveredLead as Delivered; record who delivered it for HR bonus tracking
    // For adminTeam sessions, admin.id === adminTeamMember.id (see auth.ts)
    const deliveredByAdminId =
      admin.sessionType === "adminTeam" ? admin.id : null;
    await prisma.deliveredLead.update({
      where: { id: dl.id },
      data: {
        status: "Delivered",
        deliveryBatch: `Single-${Date.now()}`,
        deliveryDate: new Date(),
        ...(deliveredByAdminId && { deliveredByAdminId }),
      },
    });
    console.log("[deliver-single] DeliveredLead marked Delivered:", dl.id);

    // 7. Advance order from PaidConfirmed → InProgress on first send
    if (order.status === "PaidConfirmed") {
      await prisma.leadOrder.update({
        where: { id: orderId },
        data: { status: "InProgress" },
      });
      console.log("[deliver-single] order advanced to InProgress");
    }

    // 8. Audit log — pass null userId for AdminTeamMember sessions (FK safety)
    const auditUserId = admin.sessionType === "user" ? admin.id : null;
    await createAuditLog(auditUserId, "LEAD_DELIVERED_SINGLE", "DeliveredLead", dl.id, {
      orderId,
      crmLeadId: crmLead.id,
      clientUserId: order.userId,
      actorType: admin.sessionType,
      actorId: admin.id,
      actorEmail: admin.email,
    });

    console.log("[deliver-single] done ✓ crmLeadId:", crmLead.id);
    return NextResponse.json({ crmLeadId: crmLead.id, ok: true });
  } catch (err) {
    console.error("[deliver-single] UNHANDLED ERROR:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
