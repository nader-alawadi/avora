import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover" as "2026-02-25.clover",
});

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const { type, orderId, amountUsd, leadCountMonthly } = await req.json();

    if (!type || !amountUsd) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

    // ── ExportPack: create the pending record before checkout ─────────────────
    let exportPackId: string | null = null;

    if (type === "ExportPack") {
      const existing = await prisma.exportPack.findFirst({
        where: { userId: session.id, status: "Confirmed" },
      });
      if (existing) {
        return NextResponse.json(
          { error: "You already have an active Export Pack" },
          { status: 400 }
        );
      }

      // Also prevent duplicate pending packs
      const pendingPack = await prisma.exportPack.findFirst({
        where: { userId: session.id, status: "Pending" },
      });
      if (pendingPack) {
        return NextResponse.json(
          { error: "You already have an Export Pack purchase in progress" },
          { status: 400 }
        );
      }

      const exportPack = await prisma.exportPack.create({
        data: { userId: session.id, credits: 50, priceUsd: 100, status: "Pending" },
      });
      exportPackId = exportPack.id;
    }

    // ── LeadOrder: move to InvoiceCreated once checkout is initiated ──────────
    if (type === "LeadOrder" && orderId) {
      await prisma.leadOrder.update({
        where: { id: orderId },
        data: { status: "InvoiceCreated" },
      });
    }

    // ── Create a pending Payment record ───────────────────────────────────────
    const payment = await prisma.payment.create({
      data: {
        userId: session.id,
        orderId: orderId || null,
        type,
        provider: "STRIPE",
        status: "Pending",
        amountUsd,
      },
    });

    // ── Build human-readable line item ────────────────────────────────────────
    const productName =
      type === "LeadOrder"
        ? "AVORA Targeted B2B Leads"
        : "AVORA Export Pack — 50 Credits";

    const productDescription =
      type === "LeadOrder"
        ? `${leadCountMonthly ?? "Targeted"} verified B2B leads/month · Delivered within 7 business days`
        : "Enables XLSX download for all your lead orders";

    // ── Create Stripe Checkout Session ────────────────────────────────────────
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: productName,
              description: productDescription,
            },
            unit_amount: Math.round(amountUsd * 100), // cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        paymentId: payment.id,
        userId: session.id,
        type,
        ...(orderId ? { orderId } : {}),
        ...(exportPackId ? { exportPackId } : {}),
      },
      // Stripe replaces {CHECKOUT_SESSION_ID} in success_url automatically
      success_url: `${appUrl}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/dashboard?payment=cancelled`,
    });

    // ── Persist Stripe session ID + checkout URL on the payment record ────────
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        reference: checkoutSession.id,
        invoiceLink: checkoutSession.url,
      },
    });

    await createAuditLog(session.id, "STRIPE_CHECKOUT_CREATED", "Payment", payment.id, {
      type,
      amountUsd,
      stripeSessionId: checkoutSession.id,
    });

    return NextResponse.json({ checkoutUrl: checkoutSession.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[Stripe checkout error]", message);
    return NextResponse.json(
      { error: "Failed to create Stripe checkout session", detail: message },
      { status: 500 }
    );
  }
}
