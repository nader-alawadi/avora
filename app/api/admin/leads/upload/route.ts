import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const { orderId, leads } = await req.json();

    if (!orderId || !Array.isArray(leads)) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const order = await prisma.leadOrder.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const deliveryBatch = `Batch-${Date.now()}`;
    const deliveryDate = new Date();

    // Create DeliveredLead records one-by-one to get their IDs
    const deliveredLeads = await prisma.$transaction(
      leads.map((lead: Record<string, unknown>) =>
        prisma.deliveredLead.create({
          data: {
            orderId,
            contactId: String(lead.contactId || ""),
            fullName: String(lead.fullName || ""),
            roleTitle: String(lead.roleTitle || ""),
            linkedinUrl: String(lead.linkedinUrl || ""),
            email: String(lead.email || ""),
            phone: String(lead.phone || ""),
            personalityType: String(lead.personalityType || ""),
            personalityAnalysisUrl: String(lead.personalityAnalysisUrl || ""),
            companyId: String(lead.companyId || ""),
            brandName: String(lead.brandName || ""),
            notes: String(lead.notes || ""),
            country: String(lead.country || ""),
            techStacks: String(lead.techStacks || ""),
            seniorityLevel: String(lead.seniorityLevel || ""),
            buyingRole: String(lead.buyingRole || ""),
            preferredChannel: String(lead.preferredChannel || ""),
            isPrimaryContact: Boolean(lead.isPrimaryContact),
            whatsappAvailable: Boolean(lead.whatsappAvailable),
            deliveryBatch,
            deliveryDate,
            status: "Delivered",
          },
        })
      )
    );

    // Auto-create CrmLead entries for the client (stage = NewLead)
    await prisma.crmLead.createMany({
      data: deliveredLeads.map((dl) => ({
        userId: order.userId,
        deliveredLeadId: dl.id,
        fullName: dl.fullName || "",
        roleTitle: dl.roleTitle || "",
        company: dl.brandName || "",
        linkedinUrl: dl.linkedinUrl || "",
        email: dl.email || "",
        phone: dl.phone || "",
        personalityType: dl.personalityType || "",
        personalityAnalysisUrl: dl.personalityAnalysisUrl || "",
        buyingRole: dl.buyingRole || "",
        preferredChannel: dl.preferredChannel || "",
        seniorityLevel: dl.seniorityLevel || "",
        country: dl.country || "",
        techStacks: dl.techStacks || "",
        whatsappAvailable: dl.whatsappAvailable,
        stage: "NewLead",
      })),
    });

    // Create initial CrmActivity "lead_created" for each CRM lead
    const newCrmLeads = await prisma.crmLead.findMany({
      where: { userId: order.userId, deliveredLeadId: { in: deliveredLeads.map((d) => d.id) } },
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

    // Mark order as Delivered
    await prisma.leadOrder.update({
      where: { id: orderId },
      data: { status: "Delivered" },
    });

    await createAuditLog(admin.id, "LEADS_UPLOADED", "LeadOrder", orderId, {
      count: deliveredLeads.length,
      deliveryBatch,
      crmLeadsCreated: newCrmLeads.length,
    });

    return NextResponse.json({ count: deliveredLeads.length, deliveryBatch });
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}
