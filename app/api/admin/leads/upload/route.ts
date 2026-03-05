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

    // Verify order exists
    const order = await prisma.leadOrder.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const deliveryBatch = `Batch-${Date.now()}`;
    const deliveryDate = new Date();

    const created = await prisma.deliveredLead.createMany({
      data: leads.map((lead: Record<string, unknown>) => ({
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
      })),
    });

    // Update order status to delivered if enough leads
    await prisma.leadOrder.update({
      where: { id: orderId },
      data: { status: "Delivered" },
    });

    await createAuditLog(admin.id, "LEADS_UPLOADED", "LeadOrder", orderId, {
      count: leads.length,
      deliveryBatch,
    });

    return NextResponse.json({ count: created.count, deliveryBatch });
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}
