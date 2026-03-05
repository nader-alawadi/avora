import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const { reportId, leadCountMonthly } = await req.json();

    // Verify strict gate passed
    const report = await prisma.generatedReport.findFirst({
      where: { userId: session.id, id: reportId },
    });

    if (!report || !report.strictPassed) {
      return NextResponse.json(
        {
          error:
            "Strict gate not passed. Complete onboarding with ≥90% confidence before ordering leads.",
        },
        { status: 400 }
      );
    }

    const pricePerLead = session.plan === "PLUS" ? 5 : 15;
    const totalPriceUsd = leadCountMonthly * pricePerLead;

    const order = await prisma.leadOrder.create({
      data: {
        userId: session.id,
        reportId,
        leadCountMonthly,
        pricePerLead,
        totalPriceUsd,
        status: "Draft",
      },
    });

    await createAuditLog(session.id, "LEAD_ORDER_CREATED", "LeadOrder", order.id, {
      leadCountMonthly,
      pricePerLead,
      totalPriceUsd,
    });

    return NextResponse.json({ order });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function GET() {
  try {
    const session = await requireAuth();

    const orders = await prisma.leadOrder.findMany({
      where: { userId: session.id },
      include: {
        payments: true,
        deliveredLeads: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
