import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";

// Next.js App Router — raw body must be read before any parsing.
// Do NOT use NextResponse.json() before reading req.text().
export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover" as "2026-02-25.clover",
});

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    console.error("[Stripe webhook] Missing stripe-signature header or STRIPE_WEBHOOK_SECRET env var");
    return NextResponse.json(
      { error: "Missing Stripe signature or webhook secret" },
      { status: 400 }
    );
  }

  // Read the raw body as text — stripe.webhooks.constructEvent requires it
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[Stripe webhook] Signature verification failed:", message);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${message}` },
      { status: 400 }
    );
  }

  // ── Handle checkout.session.completed ─────────────────────────────────────
  if (event.type === "checkout.session.completed") {
    const checkoutSession = event.data.object as Stripe.Checkout.Session;

    const {
      paymentId,
      userId,
      type,
      orderId,
      exportPackId,
    } = checkoutSession.metadata ?? {};

    if (!paymentId || !userId || !type) {
      console.error("[Stripe webhook] Missing metadata on session:", checkoutSession.id);
      // Return 200 so Stripe doesn't retry — this is a data integrity issue, not a transient error
      return NextResponse.json({ received: true, warning: "Missing metadata" });
    }

    try {
      // 1. Confirm the Payment record
      await prisma.payment.update({
        where: { id: paymentId },
        data: { status: "Confirmed" },
      });

      // 2a. LeadOrder: mark as PaidConfirmed and upgrade user to PLUS
      if (type === "LeadOrder" && orderId) {
        await prisma.leadOrder.update({
          where: { id: orderId },
          data: { status: "PaidConfirmed" },
        });
        await prisma.user.update({
          where: { id: userId },
          data: { plan: "PLUS" },
        });
      }

      // 2b. ExportPack: activate the pack
      if (type === "ExportPack" && exportPackId) {
        await prisma.exportPack.update({
          where: { id: exportPackId },
          data: { status: "Confirmed" },
        });
      }

      await createAuditLog(userId, "STRIPE_PAYMENT_CONFIRMED", "Payment", paymentId, {
        type,
        stripeSessionId: checkoutSession.id,
        amountTotal: checkoutSession.amount_total,
        ...(orderId ? { orderId } : {}),
        ...(exportPackId ? { exportPackId } : {}),
      });

      console.log(
        `[Stripe webhook] Payment ${paymentId} confirmed — type: ${type}, session: ${checkoutSession.id}`
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("[Stripe webhook] DB update failed:", message);
      // Return 500 so Stripe retries the webhook
      return NextResponse.json({ error: "Database update failed" }, { status: 500 });
    }
  }

  // Acknowledge all other event types without action
  return NextResponse.json({ received: true });
}
