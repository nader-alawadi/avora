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

  const isLocked = plan === "LITE" && exportsUsed >= 3;
  const remaining = plan === "LITE" ? Math.max(0, 3 - exportsUsed) : null;

  async function handleExport() {
    if (isLocked) {
      alert(
        "You've used your 3 free PDF exports (LITE limit).\nUpgrade to PLUS for unlimited exports."
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

      if (!res.ok) {
        const data = await res.json();
        if (data.limitReached) {
          alert(data.error);
        } else {
          alert(data.error || "Export failed");
        }
        return;
      }

      // Download the PDF blob from the server
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      // Extract filename from Content-Disposition header or use default
      const disposition = res.headers.get("Content-Disposition");
      const filenameMatch = disposition?.match(/filename="?([^"]+)"?/);
      a.download = filenameMatch?.[1] || `avora-strategy-v${reportData?.version || 1}.pdf`;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert("PDF export failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      loading={loading}
      onClick={handleExport}
      disabled={isLocked}
      title={isLocked ? "LITE limit reached (3/3)" : `Export PDF${remaining !== null ? ` (${remaining} left)` : ""}`}
    >
      {isLocked
        ? "🔒 PDF (Limit Reached)"
        : `↓ PDF${remaining !== null ? ` (${remaining} left)` : ""}`}
    </Button>
  );
}
