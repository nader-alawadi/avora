import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";

export async function POST() {
  try {
    const session = await requireAuth();

    // Check if already has a confirmed export pack
    const existing = await prisma.exportPack.findFirst({
      where: { userId: session.id, status: "Confirmed" },
    });

    if (existing) {
      return NextResponse.json({
        error: "You already have an active Export Pack",
      }, { status: 400 });
    }

    const reference = `EXPORT-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const invoiceLink = `https://payoneer.com/request-payment?ref=${reference}&amount=100&currency=USD&description=AVORA+Export+Pack+50+Credits`;

    const exportPack = await prisma.exportPack.create({
      data: {
        userId: session.id,
        credits: 50,
        priceUsd: 100,
        status: "Pending",
      },
    });

    const payment = await prisma.payment.create({
      data: {
        userId: session.id,
        type: "ExportPack",
        provider: "PAYONEER",
        invoiceLink,
        reference,
        status: "Pending",
        amountUsd: 100,
      },
    });

    await createAuditLog(session.id, "EXPORT_PACK_REQUESTED", "ExportPack", exportPack.id, {
      priceUsd: 100,
      reference,
    });

    return NextResponse.json({ exportPack, payment, invoiceLink, reference });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function GET() {
  try {
    const session = await requireAuth();

    const exportPack = await prisma.exportPack.findFirst({
      where: { userId: session.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ exportPack });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
