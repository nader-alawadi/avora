import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { generateReports, OnboardingContext } from "@/lib/ai-engine";
import { createAuditLog } from "@/lib/audit";

function getCurrentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

/** Parse a JSON-encoded answer value back to an array, or return it as-is. */
function parseArr(v: string | undefined): string {
  if (!v) return "";
  try {
    const parsed = JSON.parse(v);
    return Array.isArray(parsed) ? parsed.join(", ") : v;
  } catch {
    return v;
  }
}

function bool(v: string | undefined): boolean {
  if (!v) return false;
  return v === "yes" || v === "true" || v === "1";
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();

    // req.json() throws on empty body — handle gracefully
    let language: string | undefined;
    let forceMode: string | undefined;
    try {
      const body = await req.json();
      language = body.language;
      forceMode = body.forceMode;
    } catch {
      // body was empty or not JSON — use session defaults
    }

    // ── Regenerate credit check ──────────────────────────────────────────────
    const user = await prisma.user.findUniqueOrThrow({ where: { id: session.id } });
    const currentMonth = getCurrentMonthKey();
    const needsReset = user.regenerateResetMonth !== currentMonth;
    const monthlyUsed = needsReset ? 0 : user.monthlyRegenerateUsed;

    const hasFreeMonthly = monthlyUsed === 0;
    const hasExtraCredit = user.extraRegenerateCredits > 0;
    const canRegenerate = hasFreeMonthly || hasExtraCredit;

    if (!canRegenerate) {
      return NextResponse.json({ error: "REGEN_CREDIT_REQUIRED" }, { status: 402 });
    }

    // Consume credit (extra first, then monthly slot)
    if (hasExtraCredit && !hasFreeMonthly) {
      await prisma.user.update({
        where: { id: session.id },
        data: {
          extraRegenerateCredits: { decrement: 1 },
          ...(needsReset ? { regenerateResetMonth: currentMonth, monthlyRegenerateUsed: 0 } : {}),
        },
      });
    } else {
      await prisma.user.update({
        where: { id: session.id },
        data: {
          monthlyRegenerateUsed: monthlyUsed + 1,
          regenerateResetMonth: currentMonth,
        },
      });
    }

    // ── Fetch onboarding answers ─────────────────────────────────────────────
    const rawAnswers = await prisma.onboardingAnswer.findMany({
      where: { userId: session.id },
    });

    // Group by step
    const grouped: Record<number, Record<string, string>> = {};
    for (const a of rawAnswers) {
      if (!grouped[a.step]) grouped[a.step] = {};
      grouped[a.step][a.key] = a.value;
    }

    // New 12-step wizard: steps 0-11
    const s0  = grouped[0]  ?? {};  // Company Identity
    const s1  = grouped[1]  ?? {};  // What You Sell
    const s2  = grouped[2]  ?? {};  // Current Sales Process
    const s3  = grouped[3]  ?? {};  // Challenges
    const s4  = grouped[4]  ?? {};  // Target Market
    const s5  = grouped[5]  ?? {};  // ICP Hints
    const s6  = grouped[6]  ?? {};  // Sales Targets
    const s7  = grouped[7]  ?? {};  // Success Stories
    const s8  = grouped[8]  ?? {};  // Competition & Positioning
    const s9  = grouped[9]  ?? {};  // Outreach Preferences
    const s10 = grouped[10] ?? {};  // Company Documents

    // Also check old step keys for backward compatibility (steps 1-6 from old wizard)
    const sOld1 = grouped[1]  ?? {};
    const sOld5 = grouped[5]  ?? {};
    const sOld6 = grouped[6]  ?? {};

    // ── Build OnboardingContext ───────────────────────────────────────────────

    const ctx: OnboardingContext = {
      language: language || session.language || "ar",

      // Step 0 — Company Identity
      companyName:   s0.companyName  || sOld1.offer?.split(" ")[0] || "",
      website:       s0.website      || "",
      employees:     s0.employees    || "",
      annualRevenue: s0.revenue      || "",
      linkedin:      s0.linkedin     || "",
      logoUrl:       s0.logoUrl      || "",

      // Step 1 — What You Sell
      productName:  s1.productName  || sOld1.offer || "",
      productType:  s1.type         || "",
      description:  s1.description  || sOld1.problem || "",
      pricingModel: s1.pricing      || sOld1.pricingRange || "",
      dealSize:     s1.dealSize     || "",
      salesCycle:   s1.salesCycle   || sOld1.salesCycleRange || "",

      // Step 2 — Current Sales Process
      leadSources: parseArr(s2.leadSources) || sOld6.currentChannels || "",
      tools:       parseArr(s2.tools)       || sOld6.tools           || "",
      hasTeam:     bool(s2.hasTeam),
      teamSize:    s2.teamSize || sOld6.teamSize || "",
      roles:       parseArr(s2.roles)       || "",

      // Step 3 — Challenges
      topChallenges: parseArr(s3.challenges) || "",
      biggestPain:   s3.biggestPain || "",

      // Step 4 — Target Market
      countries:          parseArr(s4.countries)    || sOld1.geoTargets   || "",
      industries:         parseArr(s4.industries)   || "",
      targetCompanySize:  parseArr(s4.companySize)  || "",
      b2bOrB2c:           s4.b2b || "b2b",

      // Step 5 — ICP Hints
      jobTitles:     s5.jobTitles   || sOld5.titles || "",
      buyingTriggers: parseArr(s5.triggers) || "",
      disqualifiers:  s5.disqualifiers || sOld5.disqualifiers || "",

      // Step 6 — Sales Targets
      meetingTarget: s6.meetingTarget || "",
      dealsTarget:   s6.dealsTarget   || "",
      revenueTarget: s6.revenueTarget || "",
      mainMetric:    s6.mainMetric    || "",

      // Step 7 — Success Stories
      successFiles:    s7.successFiles    || "",
      bestResult:      s7.bestResult      || "",
      notableClients:  s7.notableClients  || "",

      // Step 8 — Competition & Positioning
      competitors:       s8.competitors       || sOld1.competitors    || "",
      differentiation:   s8.differentiation   || sOld1.differentiation || "",
      valueProposition:  s8.valueProposition  || sOld1.whyWeWin       || "",

      // Step 9 — Outreach Preferences
      outreachChannels:   parseArr(s9.channels)  || sOld6.currentChannels || "",
      outreachLang:       s9.outreachLang        || (language === "ar" ? "ar" : "en"),
      tone:               s9.tone               || "semi-formal",
      wantsColdCall:      bool(s9.coldCall),
      wantsEmailSeq:      bool(s9.emailSeq),
      wantsLinkedinSeq:   bool(s9.linkedinSeq),
      wantsWhatsappSeq:   bool(s9.whatsappSeq),

      // Step 10 — Company Documents
      profileFiles:   s10.profileFiles  || "",
      brochureFiles:  s10.brochureFiles || "",
    };

    // ── Confidence scoring ───────────────────────────────────────────────────
    const icpScore = scoreIcp(ctx);
    const dmuScore = scoreDmu(ctx);
    const mode = forceMode || (icpScore >= 70 && dmuScore >= 70 ? "strict" : "balanced");
    const strictPassed = icpScore >= 70 && dmuScore >= 70;

    // ── Full context debug log ───────────────────────────────────────────────
    console.log("=".repeat(60));
    console.log("[generate] RAW DB answers by step:");
    for (const [stepNum, kvs] of Object.entries(grouped)) {
      console.log(`  Step ${stepNum}:`, JSON.stringify(kvs));
    }
    console.log("[generate] OnboardingContext sent to AI:");
    console.log(JSON.stringify(ctx, null, 2));
    console.log(`[generate] icpScore=${icpScore} dmuScore=${dmuScore} mode=${mode}`);
    console.log("=".repeat(60));

    // ── Generate reports ─────────────────────────────────────────────────────
    const now = new Date();
    const reports = await generateReports(ctx, mode, now);

    // ── Persist ──────────────────────────────────────────────────────────────
    const latestReport = await prisma.generatedReport.findFirst({
      where: { userId: session.id },
      orderBy: { version: "desc" },
    });
    const newVersion = (latestReport?.version || 0) + 1;

    const report = await prisma.generatedReport.create({
      data: {
        userId:                 session.id,
        language:               ctx.language,
        icpJson:                JSON.stringify(reports.icp),
        dmuJson:                JSON.stringify(reports.dmu),
        abmJson:                JSON.stringify(reports.abm),
        outreachJson:           JSON.stringify(reports.outreach),
        lookalikeJson:          JSON.stringify(reports.lookalike),
        successProbabilityJson: JSON.stringify(reports.successProbability),
        icpConfidence:          icpScore,
        dmuConfidence:          dmuScore,
        strictPassed,
        version:                newVersion,
      },
    });

    await createAuditLog(session.id, "REPORT_GENERATED", "GeneratedReport", report.id, {
      version:         newVersion,
      icpConfidence:   icpScore,
      dmuConfidence:   dmuScore,
      strictPassed,
      usedFreeMonthly: hasFreeMonthly,
      usedExtraCredit: hasExtraCredit && !hasFreeMonthly,
    });

    return NextResponse.json({
      report: {
        id: report.id,
        icpConfidence: icpScore,
        dmuConfidence: dmuScore,
        strictPassed,
        mode,
        version: newVersion,
      },
    });
  } catch (error) {
    console.error("Report generation error:", error);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}

// ── Confidence scoring helpers ────────────────────────────────────────────────
// These replace the old step-specific confidence functions and work directly
// on the flattened OnboardingContext.

function filled(s: string | undefined, minLen = 3): boolean {
  return (s ?? "").trim().length >= minLen;
}

function scoreIcp(ctx: OnboardingContext): number {
  let score = 0;
  if (filled(ctx.productName, 3))      score += 10;
  if (filled(ctx.description, 20))     score += 15;
  if (filled(ctx.pricingModel, 3))     score += 8;
  if (filled(ctx.salesCycle, 3))       score += 8;
  if (filled(ctx.countries, 2))        score += 8;
  if (filled(ctx.industries, 3))       score += 8;
  if (filled(ctx.targetCompanySize, 2)) score += 5;
  if (filled(ctx.jobTitles, 5))        score += 12;
  if (filled(ctx.buyingTriggers, 3))   score += 8;
  if (filled(ctx.disqualifiers, 10))   score += 10;
  if (filled(ctx.biggestPain, 10))     score += 5;
  if (filled(ctx.valueProposition, 10)) score += 3;
  return Math.min(100, score);
}

function scoreDmu(ctx: OnboardingContext): number {
  let score = 0;
  if (filled(ctx.jobTitles, 5))        score += 30;
  if (filled(ctx.competitors, 5))      score += 15;
  if (filled(ctx.differentiation, 10)) score += 15;
  if (filled(ctx.valueProposition, 10)) score += 20;
  if (filled(ctx.topChallenges, 3))    score += 10;
  if (filled(ctx.biggestPain, 10))     score += 10;
  return Math.min(100, score);
}
