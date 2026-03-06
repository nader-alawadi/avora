import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";

export async function GET() {
  try {
    const admin = await requireAdmin();

    const payments = await prisma.payment.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, plan: true } },
        order: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ payments });
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const { paymentId, status } = await req.json();

    if (!["Pending", "Confirmed", "Rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const payment = await prisma.payment.update({
      where: { id: paymentId },
      data: { status },
      include: { user: true, order: true },
    });

    // Handle confirmed payment effects
    if (status === "Confirmed") {
      if (payment.type === "LeadOrder" && payment.orderId) {
        // Upgrade user to PLUS
        await prisma.user.update({
          where: { id: payment.userId },
          data: { plan: "PLUS" },
        });

        // Update order status
        await prisma.leadOrder.update({
          where: { id: payment.orderId },
          data: { status: "PaidConfirmed" },
        });

        await createAuditLog(admin.id, "PAYMENT_CONFIRMED_LEAD_ORDER", "Payment", paymentId, {
          userId: payment.userId,
          upgradedToPLUS: true,
        });
      } else if (payment.type === "ExportPack") {
        // Confirm export pack
        const exportPack = await prisma.exportPack.findFirst({
          where: { userId: payment.userId, status: "Pending" },
          orderBy: { createdAt: "desc" },
        });

        if (exportPack) {
          await prisma.exportPack.update({
            where: { id: exportPack.id },
            data: { status: "Confirmed" },
          });
        }

        await createAuditLog(admin.id, "PAYMENT_CONFIRMED_EXPORT_PACK", "Payment", paymentId, {
          userId: payment.userId,
        });
      }
    }

    return NextResponse.json({ payment });
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}
