"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface PdfExportButtonProps {
  reportId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reportData: any;
  plan: string;
  exportsUsed: number;
}

export function PdfExportButton({
  reportId,
  reportData,
  plan,
  exportsUsed,
}: PdfExportButtonProps) {
  const [loading, setLoading] = useState(false);

  const isLocked = plan === "LITE" && exportsUsed >= 2;
  const remaining = plan === "LITE" ? Math.max(0, 2 - exportsUsed) : null;

  async function handleExport() {
    if (isLocked) {
      alert(
        "You've used your 2 free PDF exports (LITE limit).\nUpgrade to PLUS for unlimited exports."
      );
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/export/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.limitReached) {
          alert(data.error);
        } else {
          alert(data.error || "Export failed");
        }
        return;
      }

      // Generate PDF client-side
      await generatePdf(data.reportData);
    } catch {
      alert("PDF export failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function generatePdf(report: Record<string, unknown>) {
    const { jsPDF } = await import("jspdf");

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    const TEAL = [30, 102, 99] as [number, number, number];
    const CORAL = [255, 107, 99] as [number, number, number];
    const DARK = [31, 42, 42] as [number, number, number];

    let y = 0;

    function addPage() {
      doc.addPage();
      y = 20;
    }

    function checkNewPage(neededSpace = 20) {
      if (y + neededSpace > 270) addPage();
    }

    // Cover page
    doc.setFillColor(...TEAL);
    doc.rect(0, 0, 210, 297, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(32);
    doc.text("AVORA", 20, 60);

    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text("GTM & Sales Strategy Report", 20, 75);

    doc.setFontSize(10);
    doc.text("by Enigma Sales", 20, 85);

    doc.setFillColor(...CORAL);
    doc.rect(20, 100, 170, 1, "F");

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Your Personalized Strategy", 20, 120);

    const icp = report.icp as Record<string, unknown>;
    const meta = {
      version: report.version,
      date: new Date(report.createdAt as string).toLocaleDateString(),
      icpConf: `${report.icpConfidence}%`,
      dmuConf: `${report.dmuConfidence}%`,
      strictPassed: report.strictPassed ? "Yes" : "No (Balanced Mode)",
    };

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    const metaLines = [
      `Report Version: ${meta.version}`,
      `Generated: ${meta.date}`,
      `Language: ${report.language === "ar" ? "Arabic" : "English"}`,
      `ICP Confidence: ${meta.icpConf}`,
      `DMU Confidence: ${meta.dmuConf}`,
      `Strict Gate: ${meta.strictPassed}`,
    ];
    metaLines.forEach((line, i) => {
      doc.text(line, 20, 140 + i * 8);
    });

    doc.setFontSize(8);
    doc.text("Confidential — Enigma Sales / AVORA Platform", 20, 280);

    // ICP Page
    doc.addPage();
    y = 20;

    doc.setTextColor(...TEAL);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Ideal Customer Profile (ICP)", 20, y);
    y += 15;

    if (icp?.summary) {
      doc.setTextColor(...DARK);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const summaryLines = doc.splitTextToSize(icp.summary as string, 170);
      summaryLines.forEach((line: string) => {
        checkNewPage();
        doc.text(line, 20, y);
        y += 6;
      });
    }

    const sections = [
      { title: "DMU Map", data: report.dmu },
      { title: "ABM Strategy", data: report.abm },
      { title: "Outreach Playbook", data: report.outreach },
      { title: "Lookalike Criteria", data: report.lookalike },
    ];

    sections.forEach(({ title, data }) => {
      doc.addPage();
      y = 20;

      doc.setTextColor(...TEAL);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text(title, 20, y);
      y += 15;

      if (data && (data as Record<string, unknown>).summary) {
        doc.setTextColor(...DARK);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        const lines = doc.splitTextToSize(
          (data as Record<string, unknown>).summary as string,
          170
        );
        lines.forEach((line: string) => {
          checkNewPage();
          doc.text(line, 20, y);
          y += 6;
        });
      }
    });

    // Last page — next steps
    doc.addPage();
    y = 20;
    doc.setTextColor(...TEAL);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Next Steps", 20, y);
    y += 15;

    doc.setTextColor(...DARK);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const steps = [
      "1. Review your ICP and validate with your sales team",
      "2. Map your top 20 target accounts against Tier 1 criteria",
      "3. Use outreach templates to build your sequences",
      "4. Use lookalike criteria to build your target list",
      "5. Request targeted leads via AVORA dashboard (if strict gate passed)",
    ];
    steps.forEach((step) => {
      doc.text(step, 20, y);
      y += 8;
    });

    doc.save(`avora-strategy-v${meta.version}.pdf`);
  }

  return (
    <Button
      variant="outline"
      loading={loading}
      onClick={handleExport}
      disabled={isLocked}
      title={isLocked ? "LITE limit reached (2/2)" : `Export PDF${remaining !== null ? ` (${remaining} left)` : ""}`}
    >
      {isLocked
        ? "🔒 PDF (Limit Reached)"
        : `↓ PDF${remaining !== null ? ` (${remaining} left)` : ""}`}
    </Button>
  );
}
