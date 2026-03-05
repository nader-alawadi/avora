import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";

// POST /api/admin/leads/upload — deliver all Staged leads for an order to the client's CRM
export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const order = await prisma.leadOrder.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Find all staged leads for this order
    const stagedLeads = await prisma.deliveredLead.findMany({
      where: { orderId, status: "Staged" },
    });

    if (stagedLeads.length === 0) {
      return NextResponse.json({ error: "No staged leads to deliver" }, { status: 400 });
    }

    const deliveryBatch = `Batch-${Date.now()}`;
    const deliveryDate = new Date();

    // Promote all Staged → Delivered
    await prisma.deliveredLead.updateMany({
      where: { orderId, status: "Staged" },
      data: { status: "Delivered", deliveryBatch, deliveryDate },
    });

    // Create CrmLead entries for the order's user (one per delivered lead)
    await prisma.crmLead.createMany({
      data: stagedLeads.map((dl) => ({
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
      })),
    });

    // Fetch the newly created CRM lead IDs to create activity logs
    const newCrmLeads = await prisma.crmLead.findMany({
      where: {
        userId: order.userId,
        deliveredLeadId: { in: stagedLeads.map((d) => d.id) },
      },
      select: { id: true },
    });

    if (newCrmLeads.length > 0) {
      await prisma.crmActivity.createMany({
        data: newCrmLeads.map((cl) => ({
          crmLeadId: cl.id,
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

    await createAuditLog(admin.id, "LEADS_DELIVERED", "LeadOrder", orderId, {
      count: stagedLeads.length,
      deliveryBatch,
      crmLeadsCreated: newCrmLeads.length,
    });

    return NextResponse.json({ count: stagedLeads.length, deliveryBatch });
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}
