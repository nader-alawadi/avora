import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  let session;
  try {
    session = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
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
  } catch (err) {
    console.error("[onboarding/answers GET]", err);
    return NextResponse.json({ error: "Failed to load answers" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  let session;
  try {
    session = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { step: unknown; answers: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { step, answers } = body;

  if (typeof step !== "number" || !answers || typeof answers !== "object" || Array.isArray(answers)) {
    return NextResponse.json({ error: "Invalid data: step must be a number and answers must be an object" }, { status: 400 });
  }

  const a = answers as Record<string, string>;

  // Filter out empty-string values so we don't persist noise
  const filtered: Record<string, string> = {};
  for (const [k, v] of Object.entries(a)) {
    if (v !== undefined && v !== null && String(v).trim() !== "") {
      filtered[k] = String(v);
    }
  }

  if (!Object.keys(filtered).length) {
    return NextResponse.json({ success: true, saved: 0 });
  }

  try {
    // Upsert each answer key individually
    await Promise.all(
      Object.entries(filtered).map(([key, value]) =>
        prisma.onboardingAnswer.upsert({
          where: { userId_step_key: { userId: session.id, step: step as number, key } },
          update: { value },
          create: { userId: session.id, step: step as number, key, value },
        })
      )
    );

    // ── Sync CompanyProfile with canonical fields ───────────────────────────
    // Step 0 — Company Identity: companyName, website, employees, revenue, linkedin
    if (step === 0) {
      await prisma.companyProfile.upsert({
        where: { userId: session.id },
        update: {
          ...(a.companyName  ? { companyName: a.companyName }    : {}),
          ...(a.website      ? { websiteUrl: a.website }         : {}),
          ...(a.employees    ? { employeeRange: a.employees }    : {}),
          ...(a.revenue      ? { revenueRange: a.revenue }       : {}),
        },
        create: {
          userId: session.id,
          companyName:  a.companyName  || null,
          websiteUrl:   a.website      || null,
          employeeRange: a.employees   || null,
          revenueRange: a.revenue      || null,
        },
      });
    }

    // Step 1 — What You Sell: description (offer), pricing, salesCycle, countries from step 4
    if (step === 1) {
      await prisma.companyProfile.upsert({
        where: { userId: session.id },
        update: {
          ...(a.description ? { offer: a.description }               : {}),
          ...(a.pricing     ? { pricingRange: a.pricing }            : {}),
          ...(a.salesCycle  ? { salesCycleRange: a.salesCycle }      : {}),
        },
        create: {
          userId: session.id,
          offer:          a.description || null,
          pricingRange:   a.pricing     || null,
          salesCycleRange: a.salesCycle || null,
        },
      });
    }

    // Step 4 — Target Market: countries -> geoTargets
    if (step === 4) {
      let countries = a.countries || "";
      // countries may be JSON-encoded array
      try {
        const parsed = JSON.parse(countries);
        if (Array.isArray(parsed)) countries = parsed.join(", ");
      } catch { /* already a plain string */ }

      if (countries) {
        await prisma.companyProfile.upsert({
          where: { userId: session.id },
          update: { geoTargets: countries },
          create: { userId: session.id, geoTargets: countries },
        });
      }
    }

    console.log(`[onboarding/answers POST] user=${session.id} step=${step} saved ${Object.keys(filtered).length} keys: ${Object.keys(filtered).join(", ")}`);

    return NextResponse.json({ success: true, saved: Object.keys(filtered).length });
  } catch (err) {
    console.error("[onboarding/answers POST]", err);
    return NextResponse.json({ error: "Failed to save answers" }, { status: 500 });
  }
}
