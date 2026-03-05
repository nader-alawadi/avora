import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { generateReports } from "@/lib/ai-engine";
import {
  calculateIcpConfidence,
  calculateDmuConfidence,
  checkStrictGate,
} from "@/lib/confidence";
import { createAuditLog } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const { language, forceMode } = await req.json();

    const answers = await prisma.onboardingAnswer.findMany({
      where: { userId: session.id },
    });

    const profile = await prisma.companyProfile.findUnique({
      where: { userId: session.id },
    });

    const grouped: Record<number, Record<string, string>> = {};
    for (const a of answers) {
      if (!grouped[a.step]) grouped[a.step] = {};
      grouped[a.step][a.key] = a.value;
    }

    const s1 = grouped[1] || {};
    const s2 = grouped[2] || {};
    const s3 = grouped[3] || {};
    const s4 = grouped[4] || {};
    const s5 = grouped[5] || {};
    const s6 = grouped[6] || {};

    const icpConfidence = calculateIcpConfidence({ step1: s1, step2: s2, step3: s3, step4: s4 });
    const dmuConfidence = calculateDmuConfidence({ step5: s5 });
    const strictGate = checkStrictGate(icpConfidence, dmuConfidence, {
      step1: s1,
      step2: s2,
      step4: s4,
      step5: s5,
    });

    const mode = strictGate.passed ? "strict" : "balanced";

    const context = {
      language: language || session.language || "en",
      companyName: profile?.companyName || "",
      industry: profile?.industry || "",
      employeeRange: profile?.employeeRange || "",
      revenueRange: profile?.revenueRange || "",
      offer: s1.offer || "",
      problem: s1.problem || "",
      pricingRange: s1.pricingRange || "",
      salesCycleRange: s1.salesCycleRange || "",
      geoTargets: s1.geoTargets || "",
      icpHypothesis: s1.icpHypothesis || "",
      bestCustomer1: s2.bestCustomer1 || "",
      bestCustomer2: s2.bestCustomer2 || "",
      lostDeal: s2.lostDeal || "",
      whyWeWin: s3.whyWeWin || "",
      competitors: s3.competitors || "",
      differentiation: s3.differentiation || "",
      disqualifiers: s4.disqualifiers || "",
      economicBuyer: s5.economicBuyer || "",
      champion: s5.champion || "",
      technicalBuyer: s5.technicalBuyer || "",
      endUser: s5.endUser || "",
      influencer: s5.influencer || "",
      objections: s5.objections || "",
      titles: s5.titles || "",
      currentChannels: s6.currentChannels || "",
      teamSize: s6.teamSize || "",
      tools: s6.tools || "",
      capacity: s6.capacity || "",
    };

    const reports = await generateReports(context, mode);

    // Get latest version
    const latestReport = await prisma.generatedReport.findFirst({
      where: { userId: session.id },
      orderBy: { version: "desc" },
    });
    const newVersion = (latestReport?.version || 0) + 1;

    const report = await prisma.generatedReport.create({
      data: {
        userId: session.id,
        language: context.language,
        icpJson: JSON.stringify(reports.icp),
        dmuJson: JSON.stringify(reports.dmu),
        abmJson: JSON.stringify(reports.abm),
        outreachJson: JSON.stringify(reports.outreach),
        lookalikeJson: JSON.stringify(reports.lookalike),
        icpConfidence,
        dmuConfidence,
        strictPassed: strictGate.passed,
        version: newVersion,
      },
    });

    await createAuditLog(session.id, "REPORT_GENERATED", "GeneratedReport", report.id, {
      version: newVersion,
      icpConfidence,
      dmuConfidence,
      strictPassed: strictGate.passed,
    });

    return NextResponse.json({
      report: {
        id: report.id,
        icpConfidence,
        dmuConfidence,
        strictPassed: strictGate.passed,
        missingItems: strictGate.missing,
        mode,
        version: newVersion,
      },
    });
  } catch (error) {
    console.error("Report generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
