import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const { orderId } = await req.json();

    // Check export pack permission
    const exportPack = await prisma.exportPack.findFirst({
      where: { userId: session.id, status: "Confirmed" },
    });

    if (!exportPack) {
      return NextResponse.json(
        {
          error:
            "XLSX export requires an Export Pack (50 credits = $100). Purchase via Payoneer.",
          needsExportPack: true,
        },
        { status: 403 }
      );
    }

    const leads = await prisma.deliveredLead.findMany({
      where: { orderId },
      include: { order: { select: { userId: true } } },
    });

    if (leads.length === 0 || leads[0].order.userId !== session.id) {
      return NextResponse.json({ error: "No leads found" }, { status: 404 });
    }

    await createAuditLog(session.id, "XLSX_EXPORTED", "LeadOrder", orderId, {
      count: leads.length,
    });

    // Return leads data for client-side XLSX generation
    return NextResponse.json({ leads });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
