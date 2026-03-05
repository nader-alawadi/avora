import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import { generateReportPdf } from "@/lib/pdf/generate-report-pdf";

export async function POST(req: NextRequest) {
  let session;
  try {
    session = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { reportId } = await req.json();

    // Check LITE export limit
    if (session.plan === "LITE") {
      const user = await prisma.user.findUnique({
        where: { id: session.id },
        select: { pdfExportsUsed: true },
      });

      if ((user?.pdfExportsUsed || 0) >= 3) {
        return NextResponse.json(
          {
            error:
              "LITE plan is limited to 3 PDF exports total. Upgrade to PLUS for unlimited exports.",
            limitReached: true,
          },
          { status: 403 }
        );
      }
    }

    const report = await prisma.generatedReport.findFirst({
      where: { id: reportId, userId: session.id },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Increment export count for LITE users
    if (session.plan === "LITE") {
      await prisma.user.update({
        where: { id: session.id },
        data: { pdfExportsUsed: { increment: 1 } },
      });
    }

    await createAuditLog(session.id, "PDF_EXPORTED", "GeneratedReport", reportId);

    // Generate PDF server-side with proper Arabic/RTL font support
    const reportData = {
      icp: report.icpJson ? JSON.parse(report.icpJson) : null,
      dmu: report.dmuJson ? JSON.parse(report.dmuJson) : null,
      abm: report.abmJson ? JSON.parse(report.abmJson) : null,
      outreach: report.outreachJson ? JSON.parse(report.outreachJson) : null,
      lookalike: report.lookalikeJson
        ? JSON.parse(report.lookalikeJson)
        : null,
      icpConfidence: report.icpConfidence,
      dmuConfidence: report.dmuConfidence,
      strictPassed: report.strictPassed,
      version: report.version,
      createdAt: report.createdAt.toISOString(),
      language: report.language,
    };

    const pdfBuffer = await generateReportPdf(reportData);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="avora-strategy-v${report.version}.pdf"`,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;
    console.error("[PDF export error] message:", message);
    console.error("[PDF export error] stack:", stack);
    console.error("[PDF export error] raw:", err);
    return NextResponse.json(
      { error: "Failed to generate PDF", detail: message },
      { status: 500 }
    );
  }
}
