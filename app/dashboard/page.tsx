"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { AvoraLogo } from "@/components/ui/AvoraLogo";
import { SkeletonDashboard } from "@/components/ui/SkeletonLoader";
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
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const validTabs = TABS.map((t) => t.id);
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(
    tabParam && validTabs.includes(tabParam) ? tabParam : "icp"
  );
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showRegenModal, setShowRegenModal] = useState(false);

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

      if (res.status === 402) {
        setShowRegenModal(true);
        return;
      }

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

  function buildRegenWhatsAppUrl() {
    const timestamp = Date.now();
    const ref = `REGEN-${timestamp}`;
    const message = `Hi, I'd like to purchase a Regenerate Credit for $5. Account: ${user?.email || ""}. Reference: ${ref}`;
    return `https://wa.me/201011348217?text=${encodeURIComponent(message)}`;
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-16">
            <AvoraLogo size={32} />
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <SkeletonDashboard />
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
              <AvoraLogo size={32} />
              <Badge variant={user?.plan === "PLUS" ? "success" : "default"}>
                {user?.plan || "LITE"}
              </Badge>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/contact" className="text-sm text-gray-500 hover:text-[#1E6663]">
                Contact Us
              </Link>
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
                className={generating ? "pulse-glow" : ""}
              >
                {report ? "Regenerate" : "Generate Strategy"}
              </Button>
            </div>
          </div>

          {report ? (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {[
                <div key="icp" className="bg-white rounded-xl border border-gray-100 p-4 card-hover">
                  <p className="text-xs text-gray-500 mb-1">ICP Confidence</p>
                  <ConfidenceMeter label="" value={report.icpConfidence} size="sm" />
                </div>,
                <div key="dmu" className="bg-white rounded-xl border border-gray-100 p-4 card-hover">
                  <p className="text-xs text-gray-500 mb-1">DMU Confidence</p>
                  <ConfidenceMeter label="" value={report.dmuConfidence} size="sm" />
                </div>,
                <KpiCard
                  key="gate"
                  title="Strict Gate"
                  value={report.strictPassed ? "Passed ✓" : "Not Passed"}
                  subtitle={report.strictPassed ? "Lead orders enabled" : "Complete onboarding"}
                  color={report.strictPassed ? "green" : "coral"}
                />,
                <KpiCard
                  key="pdf"
                  title="PDF Exports"
                  value={user?.plan === "PLUS" ? "Unlimited" : `${user?.pdfExportsUsed || 0}/3`}
                  subtitle={user?.plan === "LITE" ? "LITE limit" : "PLUS plan"}
                  color="teal"
                />,
              ].map((card, i) => (
                <motion.div
                  key={i}
                  variants={{
                    hidden: { opacity: 0, y: 16 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
                  }}
                >
                  {card}
                </motion.div>
              ))}
            </motion.div>
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

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                {activeTab === "icp" && <IcpTab data={report.icp} />}
                {activeTab === "dmu" && <DmuTab data={report.dmu} />}
                {activeTab === "abm" && <AbmTab data={report.abm} />}
                {activeTab === "outreach" && <OutreachTab data={report.outreach} />}
                {activeTab === "lookalike" && <LookalikeTab data={report.lookalike} />}
                {activeTab === "leads" && (
                  <LeadsModule report={report} user={user!} />
                )}
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </div>

      {/* Regenerate Credit Required Modal */}
      {showRegenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="text-center mb-4">
              <div className="text-4xl mb-3">🔄</div>
              <h2 className="text-lg font-bold text-[#1F2A2A]">
                Monthly Regenerate Used
              </h2>
              <p className="text-gray-500 text-sm mt-2">
                You&apos;ve used your free regenerate this month. Additional regenerates
                cost <span className="font-semibold text-[#1F2A2A]">$5 each</span>.
                Contact us on WhatsApp to get a payment link and receive your credit.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-5 text-xs text-gray-500 space-y-1">
              <p>• First regenerate every month is <strong>FREE</strong></p>
              <p>• Additional regenerates: <strong>$5 each</strong></p>
              <p>• Credits are applied manually after payment confirmation</p>
            </div>

            <div className="flex flex-col gap-3">
              <a
                href={buildRegenWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-semibold py-3 px-5 rounded-xl transition-colors text-sm"
                onClick={() => setShowRegenModal(false)}
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Contact us on WhatsApp — $5 Regenerate
              </a>
              <button
                onClick={() => setShowRegenModal(false)}
                className="text-sm text-gray-400 hover:text-gray-600 py-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
