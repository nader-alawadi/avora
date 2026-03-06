import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const { orderId, type, amountUsd } = await req.json();

    // Generate a reference number
    const reference = `AVORA-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // In production, integrate with Payoneer API
    // For now, generate a payment request link format
    const invoiceLink = `https://payoneer.com/request-payment?ref=${reference}&amount=${amountUsd}&currency=USD&description=AVORA+${type}`;

    const payment = await prisma.payment.create({
      data: {
        userId: session.id,
        orderId: orderId || null,
        type,
        provider: "PAYONEER",
        invoiceLink,
        reference,
        status: "Pending",
        amountUsd,
      },
    });

    // Update order status if it's a lead order
    if (orderId) {
      await prisma.leadOrder.update({
        where: { id: orderId },
        data: { status: "InvoiceCreated" },
      });
    }

    await createAuditLog(session.id, "PAYMENT_INVOICE_CREATED", "Payment", payment.id, {
      type,
      amountUsd,
      reference,
    });

    return NextResponse.json({ payment, invoiceLink, reference });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
