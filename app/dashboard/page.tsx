"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { KpiCard } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ConfidenceMeter } from "@/components/ui/ConfidenceMeter";
import { IcpTab } from "@/components/dashboard/IcpTab";
import { DmuTab } from "@/components/dashboard/DmuTab";
import { AbmTab } from "@/components/dashboard/AbmTab";
import { OutreachTab } from "@/components/dashboard/OutreachTab";
import { LookalikeTab } from "@/components/dashboard/LookalikeTab";
import { LeadsModule } from "@/components/dashboard/LeadsModule";
import { PdfExportButton } from "@/components/dashboard/PdfExportButton";

interface User {
  id: string;
  email: string;
  name: string | null;
  plan: string;
  isAdmin: boolean;
  pdfExportsUsed: number;
  language: string;
}

interface Report {
  id: string;
  icp: Record<string, unknown> | null;
  dmu: Record<string, unknown> | null;
  abm: Record<string, unknown> | null;
  outreach: Record<string, unknown> | null;
  lookalike: Record<string, unknown> | null;
  icpConfidence: number;
  dmuConfidence: number;
  strictPassed: boolean;
  version: number;
  language: string;
  createdAt: string;
}

const TABS = [
  { id: "icp", label: "ICP", icon: "🎯" },
  { id: "dmu", label: "DMU Map", icon: "🗺️" },
  { id: "abm", label: "ABM Strategy", icon: "🏆" },
  { id: "outreach", label: "Outreach Playbook", icon: "📨" },
  { id: "lookalike", label: "Lookalike Criteria", icon: "🔍" },
  { id: "leads", label: "Request Leads", icon: "📊" },
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [activeTab, setActiveTab] = useState("icp");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch("/api/reports/latest").then((r) => r.json()),
    ]).then(([userData, reportData]) => {
      if (userData.error) {
        router.push("/login");
        return;
      }
      setUser(userData.user);
      setReport(reportData.report);
      setLoading(false);
    });

  }, [router]);

  async function handleRegenerate() {
    setGenerating(true);
    try {
      const res = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: user?.language || "en" }),
      });
      if (res.ok) {
        const reportRes = await fetch("/api/reports/latest");
        const d = await reportRes.json();
        setReport(d.report);
      }
    } catch {
      alert("Failed to regenerate. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#1E6663] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-500">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#1E6663] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="font-bold text-[#1F2A2A]">AVORA</span>
              <Badge variant={user?.plan === "PLUS" ? "success" : "default"}>
                {user?.plan || "LITE"}
              </Badge>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/onboarding" className="text-sm text-gray-500 hover:text-[#1E6663]">
                Edit Onboarding
              </Link>
              {user?.isAdmin && (
                <Link href="/admin" className="text-sm text-gray-500 hover:text-[#1E6663]">
                  Admin
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-red-500"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome + KPIs */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[#1F2A2A]">
                Welcome back{user?.name ? `, ${user.name}` : ""}
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                {report
                  ? `Strategy v${report.version} · Generated ${new Date(report.createdAt).toLocaleDateString()}`
                  : "No strategy generated yet"}
              </p>
            </div>
            <div className="flex gap-3">
              {report && (
                <PdfExportButton
                  reportId={report.id}
                  reportData={report}
                  plan={user?.plan || "LITE"}
                  exportsUsed={user?.pdfExportsUsed || 0}
                />
              )}
              <Button
                variant="secondary"
                loading={generating}
                onClick={handleRegenerate}
              >
                {report ? "Regenerate" : "Generate Strategy"}
              </Button>
            </div>
          </div>

          {report ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-xs text-gray-500 mb-1">ICP Confidence</p>
                <ConfidenceMeter
                  label=""
                  value={report.icpConfidence}
                  size="sm"
                />
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-xs text-gray-500 mb-1">DMU Confidence</p>
                <ConfidenceMeter
                  label=""
                  value={report.dmuConfidence}
                  size="sm"
                />
              </div>
              <KpiCard
                title="Strict Gate"
                value={report.strictPassed ? "Passed ✓" : "Not Passed"}
                subtitle={report.strictPassed ? "Lead orders enabled" : "Complete onboarding"}
                color={report.strictPassed ? "green" : "coral"}
              />
              <KpiCard
                title="PDF Exports"
                value={
                  user?.plan === "PLUS"
                    ? "Unlimited"
                    : `${user?.pdfExportsUsed || 0}/3`
                }
                subtitle={user?.plan === "LITE" ? "LITE limit" : "PLUS plan"}
                color="teal"
              />
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <div className="text-4xl mb-3">🚀</div>
              <h2 className="font-bold text-[#1F2A2A] mb-2">No strategy generated yet</h2>
              <p className="text-gray-500 text-sm mb-6">
                Complete your onboarding to generate your ICP, DMU Map, ABM Strategy, and Outreach Playbook.
              </p>
              <div className="flex gap-3 justify-center">
                <Link href="/onboarding">
                  <Button variant="secondary">Complete Onboarding →</Button>
                </Link>
                <Button variant="primary" loading={generating} onClick={handleRegenerate}>
                  Generate with Current Data
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Warnings for balanced mode */}
        {report && !report.strictPassed && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-amber-500 text-xl mt-0.5">⚠️</span>
              <div>
                <p className="font-semibold text-amber-800 text-sm">
                  Preliminary Report — Balanced Mode
                </p>
                <p className="text-amber-700 text-xs mt-1">
                  This report was generated with incomplete data (confidence {"<"}90%).
                  Lead ordering is disabled until you reach the strict gate.
                  Return to onboarding to improve your confidence score.
                </p>
                <Link href="/onboarding">
                  <Button variant="ghost" size="sm" className="mt-2 text-amber-700">
                    Improve Onboarding →
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        {report && (
          <>
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex gap-1 overflow-x-auto">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? "border-[#1E6663] text-[#1E6663]"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <span>{tab.icon}</span>
                    {tab.label}
                    {tab.id === "leads" && !report.strictPassed && (
                      <span className="ml-1 text-red-400">🔒</span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            <div>
              {activeTab === "icp" && <IcpTab data={report.icp} />}
              {activeTab === "dmu" && <DmuTab data={report.dmu} />}
              {activeTab === "abm" && <AbmTab data={report.abm} />}
              {activeTab === "outreach" && <OutreachTab data={report.outreach} />}
              {activeTab === "lookalike" && <LookalikeTab data={report.lookalike} />}
              {activeTab === "leads" && (
                <LeadsModule
                  report={report}
                  user={user!}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
