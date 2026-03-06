import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null });
  }

  const [profile, report, onboardingAnswers] = await Promise.all([
    prisma.companyProfile.findUnique({ where: { userId: session.id } }),
    prisma.generatedReport.findFirst({
      where: { userId: session.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.onboardingAnswer.findMany({
      where: { userId: session.id, step: 1 },
    }),
  ]);

  const step1: Record<string, string> = {};
  for (const a of onboardingAnswers) step1[a.key] = a.value;

  // Parse ICP and Outreach from report
  let icpTitle = "";
  let topIndustries: string[] = [];
  let outreachFocus = "";
  let abmTier1 = "";

  if (report) {
    try {
      if (report.icpJson) {
        const icp = JSON.parse(report.icpJson);
        icpTitle = icp.title || "";
        topIndustries = icp.firmographics?.industries?.slice(0, 3) || [];
      }
    } catch { /* ignore */ }
    try {
      if (report.outreachJson) {
        const outreach = JSON.parse(report.outreachJson);
        const primaryChannel = outreach.channels?.[0];
        if (primaryChannel) {
          outreachFocus = `${primaryChannel.channel}: ${primaryChannel.strategy || ""}`;
        }
      }
    } catch { /* ignore */ }
    try {
      if (report.abmJson) {
        const abm = JSON.parse(report.abmJson);
        const tier1 = abm.tiers?.[0];
        if (tier1) {
          abmTier1 = tier1.approach || "";
        }
      }
    } catch { /* ignore */ }
  }

  const firstName = session.name?.split(" ")[0] || session.email.split("@")[0];

  return NextResponse.json({
    user: {
      firstName,
      fullName: session.name || "",
      email: session.email,
      plan: session.plan,
      companyName: profile?.companyName || "",
      industry: profile?.industry || "",
      icpTitle,
      topIndustries,
      offer: step1.offer || "",
      problem: step1.problem || "",
      geoTargets: step1.geoTargets || "",
      outreachFocus,
      abmTier1,
      hasReport: !!report,
      reportVersion: report?.version || 0,
      icpConfidence: report?.icpConfidence || 0,
      dmuConfidence: report?.dmuConfidence || 0,
    },
  });
}
