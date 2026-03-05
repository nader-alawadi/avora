import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await requireAuth();

    const report = await prisma.generatedReport.findFirst({
      where: { userId: session.id },
      orderBy: { createdAt: "desc" },
    });

    if (!report) {
      return NextResponse.json({ report: null });
    }

    return NextResponse.json({
      report: {
        id: report.id,
        language: report.language,
        icp: report.icpJson ? JSON.parse(report.icpJson) : null,
        dmu: report.dmuJson ? JSON.parse(report.dmuJson) : null,
        abm: report.abmJson ? JSON.parse(report.abmJson) : null,
        outreach: report.outreachJson ? JSON.parse(report.outreachJson) : null,
        lookalike: report.lookalikeJson ? JSON.parse(report.lookalikeJson) : null,
        icpConfidence: report.icpConfidence,
        dmuConfidence: report.dmuConfidence,
        strictPassed: report.strictPassed,
        version: report.version,
        createdAt: report.createdAt,
      },
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
