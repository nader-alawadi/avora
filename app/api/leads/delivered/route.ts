import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();

    if (session.plan !== "PLUS") {
      return NextResponse.json(
        { error: "Leads Dashboard is a PLUS feature" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");

    const where = orderId
      ? {
          orderId,
          order: { userId: session.id },
        }
      : {
          order: { userId: session.id },
        };

    const leads = await prisma.deliveredLead.findMany({
      where,
      include: {
        order: {
          select: {
            id: true,
            leadCountMonthly: true,
            status: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ leads });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
