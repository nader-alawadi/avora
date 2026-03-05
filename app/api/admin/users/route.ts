import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        plan: true,
        isAdmin: true,
        pdfExportsUsed: true,
        language: true,
        createdAt: true,
        _count: {
          select: { leadOrders: true, generatedReports: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ users });
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}
