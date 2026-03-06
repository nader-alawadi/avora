import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

// GET /api/admin/leads/stage?orderId=X — fetch staged leads for an order
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const orderId = req.nextUrl.searchParams.get("orderId");
    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    const leads = await prisma.deliveredLead.findMany({
      where: { orderId, status: "Staged" },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ leads });
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}

// POST /api/admin/leads/stage — save a single staged lead to DB
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const { orderId, lead } = await req.json();
    if (!orderId || !lead) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const order = await prisma.leadOrder.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const staged = await prisma.deliveredLead.create({
      data: {
        orderId,
        fullName: String(lead.fullName || ""),
        roleTitle: String(lead.roleTitle || ""),
        brandName: String(lead.brandName || ""),
        email: String(lead.email || ""),
        phone: String(lead.phone || ""),
        linkedinUrl: String(lead.linkedinUrl || ""),
        country: String(lead.country || ""),
        seniorityLevel: String(lead.seniorityLevel || ""),
        buyingRole: String(lead.buyingRole || ""),
        personalityType: String(lead.personalityType || ""),
        notes: String(lead.notes || ""),
        status: "Staged",
      },
    });

    return NextResponse.json({ lead: staged });
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}

// DELETE /api/admin/leads/stage — remove a staged lead from DB
export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin();

    const { leadId } = await req.json();
    if (!leadId) {
      return NextResponse.json({ error: "Missing leadId" }, { status: 400 });
    }

    await prisma.deliveredLead.deleteMany({
      where: { id: leadId, status: "Staged" },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}
