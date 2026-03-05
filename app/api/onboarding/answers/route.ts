import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await requireAuth();

    const answers = await prisma.onboardingAnswer.findMany({
      where: { userId: session.id },
      orderBy: [{ step: "asc" }, { key: "asc" }],
    });

    // Group by step
    const grouped: Record<number, Record<string, string>> = {};
    for (const a of answers) {
      if (!grouped[a.step]) grouped[a.step] = {};
      grouped[a.step][a.key] = a.value;
    }

    return NextResponse.json({ answers: grouped });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const { step, answers } = await req.json();

    if (typeof step !== "number" || !answers || typeof answers !== "object") {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    // Upsert each answer
    const upserts = Object.entries(answers).map(([key, value]) =>
      prisma.onboardingAnswer.upsert({
        where: {
          userId_step_key: { userId: session.id, step, key },
        },
        update: { value: String(value) },
        create: {
          userId: session.id,
          step,
          key,
          value: String(value),
        },
      })
    );

    await Promise.all(upserts);

    // Also update company profile if step 1
    if (step === 1) {
      const a = answers as Record<string, string>;
      await prisma.companyProfile.upsert({
        where: { userId: session.id },
        update: {
          offer: a.offer,
          problem: a.problem,
          pricingRange: a.pricingRange,
          salesCycleRange: a.salesCycleRange,
          geoTargets: a.geoTargets,
        },
        create: {
          userId: session.id,
          offer: a.offer,
          problem: a.problem,
          pricingRange: a.pricingRange,
          salesCycleRange: a.salesCycleRange,
          geoTargets: a.geoTargets,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
