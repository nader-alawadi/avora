"use client";
import { useState, useEffect, useMemo, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { EmployeeDashboard } from "@/components/employee/EmployeeDashboard";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { AvoraLogo } from "@/components/ui/AvoraLogo";
import { SkeletonDashboard } from "@/components/ui/SkeletonLoader";
import { KpiCard } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ConfidenceMeter } from "@/components/ui/ConfidenceMeter";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { IcpTab } from "@/components/dashboard/IcpTab";
import { DmuTab } from "@/components/dashboard/DmuTab";
import { AbmTab } from "@/components/dashboard/AbmTab";
import { OutreachTab } from "@/components/dashboard/OutreachTab";
import { LookalikeTab } from "@/components/dashboard/LookalikeTab";
import { LeadsModule } from "@/components/dashboard/LeadsModule";
import { PdfExportButton } from "@/components/dashboard/PdfExportButton";
import { ProgressTab } from "@/components/dashboard/ProgressTab";
import { CrmTab } from "@/components/dashboard/CrmTab";
import { TeamTab } from "@/components/dashboard/TeamTab";
import { Sidebar } from "@/components/layout/Sidebar";
import {
  RefreshCw, Sparkles, ChevronDown, Clock, CheckCircle,
  Target, Map, Trophy, Send, Search, Package, TrendingUp, BarChart3, Users2
} from "lucide-react";

interface User {
  id: string;
  email: string;
  name: string | null;
  plan: string;
  isAdmin: boolean;
  pdfExportsUsed: number;
  language: string;
  sessionType?: string;
  teamRole?: string;
  workspaceOwnerId?: string;
  adminRole?: string;
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

const ALL_TABS = [
  { id: "icp",      label: "ICP",              icon: Target,      emoji: "🎯" },
  { id: "dmu",      label: "DMU Map",          icon: Map,         emoji: "🗺️" },
  { id: "abm",      label: "ABM Strategy",     icon: Trophy,      emoji: "🏆" },
  { id: "outreach", label: "Outreach Playbook", icon: Send,       emoji: "📨" },
  { id: "lookalike",label: "Lookalike Criteria",icon: Search,     emoji: "🔍" },
  { id: "leads",    label: "Request Leads",     icon: Package,    emoji: "📊" },
  { id: "progress", label: "Progress",          icon: TrendingUp, emoji: "📈" },
  { id: "crm",      label: "My CRM",            icon: BarChart3,  emoji: "👥" },
  { id: "team",     label: "Team",              icon: Users2,     emoji: "🤝" },
];

const TABS_BY_TEAM_ROLE: Record<string, string[]> = {
  Admin:    ["icp", "dmu", "abm", "outreach", "lookalike", "leads", "progress", "crm", "team"],
  SalesRep: ["crm"],
  Viewer:   ["icp", "dmu", "abm", "outreach", "lookalike", "crm"],
};

/* ── Generation step labels ───────────────────────────────────── */
const GEN_STEPS = [
  "Analyzing your business data…",
  "Building Ideal Customer Profile…",
  "Mapping Decision Making Unit…",
  "Creating ABM Strategy…",
  "Generating Outreach Playbook…",
];

function DashboardInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [activeTab, setActiveTab] = useState("icp");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [genStep, setGenStep] = useState(0);
  const [showRegenModal, setShowRegenModal] = useState(false);
  const [showVersions, setShowVersions] = useState(false);

  /* ── Pill tab indicator ─────────────────────────────────────── */
  const tabsRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, left: 0 });

  const visibleTabIds = useMemo((): string[] => {
    if (!user) return [];
    if (user.sessionType === "teamMember" && user.teamRole) {
      return TABS_BY_TEAM_ROLE[user.teamRole] ?? ["crm"];
    }
    return ALL_TABS.map((t) => t.id);
  }, [user]);

  const visibleTabs = ALL_TABS.filter((t) => visibleTabIds.includes(t.id));
  const isOwner = !user?.sessionType || user.sessionType === "user";
  const isViewer = user?.sessionType === "teamMember" && user.teamRole === "Viewer";
  const canManageTeam = isOwner || (user?.sessionType === "teamMember" && user.teamRole === "Admin");

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch("/api/reports/latest").then((r) => r.json()),
    ]).then(([userData, reportData]) => {
      if (userData.error) { router.push("/login"); return; }
      if (userData.user?.sessionType === "adminTeam") {
        setUser(userData.user);
        setLoading(false);
        return;
      }
      setUser(userData.user);
      setReport(reportData.report);

      const role = userData.user?.teamRole;
      const defaultTab =
        userData.user?.sessionType === "teamMember" && role === "SalesRep"
          ? "crm"
          : userData.user?.sessionType === "teamMember" && role === "Viewer"
          ? "icp"
          : "icp";

      const tabParam = searchParams.get("tab");
      const allowedIds =
        userData.user?.sessionType === "teamMember" && role
          ? (TABS_BY_TEAM_ROLE[role] ?? ["crm"])
          : ALL_TABS.map((t) => t.id);

      setActiveTab(tabParam && allowedIds.includes(tabParam) ? tabParam : defaultTab);
      setLoading(false);
    });
  }, [router, searchParams]);

  /* ── Update pill indicator on tab change ────────────────────── */
  useEffect(() => {
    if (!tabsRef.current) return;
    const el = tabsRef.current.querySelector(`[data-tab="${activeTab}"]`) as HTMLElement | null;
    if (el) {
      setIndicatorStyle({ width: el.offsetWidth, left: el.offsetLeft });
    }
  }, [activeTab, visibleTabs.length]);

  /* ── Strategy generation with animated steps ────────────────── */
  async function handleRegenerate() {
    if (isViewer) return;
    setGenerating(true);
    setGenStep(0);

    const stepInterval = setInterval(() => {
      setGenStep((prev) => Math.min(prev + 1, GEN_STEPS.length - 1));
    }, 2500);

    try {
      const res = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: user?.language || "en" }),
      });
      clearInterval(stepInterval);
      if (res.status === 402) { setShowRegenModal(true); return; }
      if (res.ok) {
        const reportRes = await fetch("/api/reports/latest");
        const d = await reportRes.json();
        setReport(d.report);
      }
    } catch {
      clearInterval(stepInterval);
      alert("Failed to regenerate. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  function buildRegenWhatsAppUrl() {
    const ref = `REGEN-${Date.now()}`;
    const message = `Hi, I'd like to purchase a Regenerate Credit for $5. Account: ${user?.email || ""}. Reference: ${ref}`;
    return `https://wa.me/201011348217?text=${encodeURIComponent(message)}`;
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  /* ── Loading skeleton with sidebar shape ────────────────────── */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafb] flex">
        <div className="hidden lg:block w-[260px] flex-shrink-0" style={{ background: "#061a1a" }} />
        <div className="flex-1 min-w-0">
          <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-30">
            <div className="flex items-center h-16 px-6 lg:px-8">
              <AvoraLogo size={32} />
            </div>
          </header>
          <div className="px-6 lg:px-8 py-8 max-w-6xl">
            <SkeletonDashboard />
          </div>
        </div>
      </div>
    );
  }

  if (user?.sessionType === "adminTeam") {
    return <EmployeeDashboard memberName={user.name} memberRole={user.adminRole ?? null} />;
  }

  return (
    <div className="min-h-screen bg-[#f8fafb] flex">
      {/* ── Sidebar ──────────────────────────────────────────── */}
      <Sidebar
        user={{
          name: user?.name ?? null,
          email: user?.email ?? "",
          plan: user?.plan ?? "LITE",
          isAdmin: user?.isAdmin ?? false,
          sessionType: user?.sessionType,
          teamRole: user?.teamRole,
        }}
        onLogout={handleLogout}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        visibleTabIds={visibleTabIds}
      />

      {/* ── Main content ─────────────────────────────────────── */}
      <div className="flex-1 min-w-0 lg:ml-[260px] transition-all duration-300">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
          <div className="flex items-center justify-between px-4 lg:px-8 h-16">
            <div className="flex items-center gap-3">
              <div className="lg:hidden">
                <AvoraLogo size={28} />
              </div>
              <h2 className="hidden lg:block text-lg font-bold text-[#1E293B]">
                {ALL_TABS.find((t) => t.id === activeTab)?.emoji}{" "}
                {ALL_TABS.find((t) => t.id === activeTab)?.label || "Dashboard"}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              {report && (
                <button
                  onClick={() => setShowVersions(!showVersions)}
                  className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#1A6B6B] bg-gray-100 hover:bg-[#EFF6F6] px-3 py-1.5 rounded-full transition-colors"
                >
                  <Clock size={14} />
                  v{report.version}
                  <ChevronDown size={12} className={`transition-transform ${showVersions ? "rotate-180" : ""}`} />
                </button>
              )}
              <span className={`hidden sm:inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${
                user?.plan === "PLUS"
                  ? "bg-[#2DD4BF]/10 text-[#1A6B6B]"
                  : "bg-gray-100 text-gray-500"
              }`}>
                {user?.plan || "LITE"}
              </span>
              {user?.sessionType === "teamMember" && (
                <Badge variant="info">{user.teamRole}</Badge>
              )}
            </div>
          </div>
        </header>

        <div className="px-4 lg:px-8 py-6 lg:py-8 max-w-6xl pb-24 lg:pb-8">
          {/* TeamMember banner */}
          {user?.sessionType === "teamMember" && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-2xl p-3 mb-6 flex items-center gap-3">
              <span className="text-[#2563EB] text-lg">🤝</span>
              <p className="text-sm text-[#1D4ED8]">
                You&apos;re viewing as a <strong>{user.teamRole}</strong> workspace member.
                {user.teamRole === "Viewer" && " You have read-only access."}
                {user.teamRole === "SalesRep" && " You have access to the CRM pipeline."}
              </p>
            </motion.div>
          )}

          {/* ── Welcome + KPIs ────────────────────────────────── */}
          {user?.teamRole !== "SalesRep" && (
            <div className="mb-8">
              {/* Welcome header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                className="rounded-3xl p-6 lg:p-8 text-white mb-6 relative overflow-hidden"
                style={{ background: "linear-gradient(135deg, #061a1a 0%, #0d3333 50%, #1A6B6B 100%)" }}
              >
                {/* Decorative orbs */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="absolute top-4 right-10 w-32 h-32 bg-[#2DD4BF] rounded-full blur-[80px] opacity-20" />
                  <div className="absolute bottom-4 left-20 w-24 h-24 bg-[#FF5252] rounded-full blur-[60px] opacity-15" />
                </div>
                <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                      className="text-2xl lg:text-3xl font-bold mb-2">
                      Welcome back{user?.name ? `, ${user.name}` : ""} 👋
                    </motion.h1>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                      className="text-white/60">
                      {report
                        ? `Strategy v${report.version} · Generated ${new Date(report.createdAt).toLocaleDateString()}`
                        : "No strategy generated yet"}
                    </motion.p>
                  </div>
                  {!isViewer && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
                      className="flex gap-3">
                      {report && (
                        <PdfExportButton
                          reportId={report.id}
                          reportData={report}
                          plan={user?.plan || "LITE"}
                          exportsUsed={user?.pdfExportsUsed || 0}
                        />
                      )}
                      {isOwner && (
                        <Button variant="primary" loading={generating} onClick={handleRegenerate}
                          className={`!bg-[#FF5252] hover:!bg-[#E04545] !shadow-[0_4px_20px_rgba(255,82,82,0.3)] ${generating ? "pulse-glow" : ""}`}>
                          <RefreshCw size={16} className={`mr-2 ${generating ? "animate-spin" : ""}`} />
                          {report ? "Regenerate" : "Generate Strategy"}
                        </Button>
                      )}
                    </motion.div>
                  )}
                </div>
              </motion.div>

              {/* Generation progress overlay */}
              <AnimatePresence>
                {generating && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="bg-[#EFF6F6] border border-[#1A6B6B]/10 rounded-2xl mb-6 overflow-hidden"
                  >
                    <div className="p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <Sparkles className="text-[#1A6B6B] animate-pulse" size={18} />
                        <p className="text-sm font-semibold text-[#1A6B6B]">Building your GTM strategy…</p>
                      </div>
                      <div className="space-y-2.5">
                        {GEN_STEPS.map((step, i) => (
                          <motion.div key={i} initial={{ opacity: 0, x: 8 }} animate={{ opacity: i <= genStep ? 1 : 0.3, x: 0 }}
                            className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                              i < genStep ? "bg-[#1A6B6B] text-white" : i === genStep ? "bg-[#1A6B6B]/20 text-[#1A6B6B] animate-pulse" : "bg-gray-200 text-gray-400"
                            }`}>
                              {i < genStep ? <CheckCircle size={14} /> : i + 1}
                            </div>
                            <span className={`text-sm ${i <= genStep ? "text-[#1A6B6B]" : "text-gray-400"}`}>{step}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* KPI cards with progress rings */}
              {report ? (
                <motion.div
                  initial="hidden" animate="visible"
                  variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
                  className="grid grid-cols-2 lg:grid-cols-4 gap-4"
                >
                  {[
                    <div key="icp" className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm card-hover">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">ICP Confidence</p>
                      <div className="flex items-center gap-4">
                        <ProgressRing value={report.icpConfidence} size={64} strokeWidth={5} color="#1A6B6B" />
                        <div>
                          <p className="text-xs text-gray-500">
                            {report.icpConfidence >= 90 ? "✓ Strict gate passed" : "Need more data"}
                          </p>
                        </div>
                      </div>
                    </div>,
                    <div key="dmu" className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm card-hover">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">DMU Confidence</p>
                      <div className="flex items-center gap-4">
                        <ProgressRing value={report.dmuConfidence} size={64} strokeWidth={5} color="#2D8080" />
                        <div>
                          <p className="text-xs text-gray-500">
                            {report.dmuConfidence >= 90 ? "✓ Strict gate passed" : "Need more data"}
                          </p>
                        </div>
                      </div>
                    </div>,
                    <KpiCard key="gate" title="Strict Gate"
                      value={report.strictPassed ? "Passed ✓" : "Not Passed"}
                      subtitle={report.strictPassed ? "Lead orders enabled" : "Complete onboarding"}
                      color={report.strictPassed ? "green" : "coral"} />,
                    <KpiCard key="pdf" title="PDF Exports"
                      value={user?.plan === "PLUS" ? "Unlimited" : `${user?.pdfExportsUsed || 0}/3`}
                      subtitle={user?.plan === "LITE" ? "LITE limit" : "PLUS plan"} color="teal" />,
                  ].map((card, i) => (
                    <motion.div key={i} variants={{
                      hidden: { opacity: 0, y: 16 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
                    }}>{card}</motion.div>
                  ))}
                </motion.div>
              ) : isOwner ? (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-sm">
                  <div className="text-4xl mb-3">🚀</div>
                  <h2 className="font-bold text-[#1F2A2A] mb-2">No strategy generated yet</h2>
                  <p className="text-gray-500 text-sm mb-6">
                    Complete your onboarding to generate your ICP, DMU Map, ABM Strategy, and Outreach Playbook.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Link href="/onboarding"><Button variant="secondary">Complete Onboarding →</Button></Link>
                    <Button variant="primary" loading={generating} onClick={handleRegenerate}
                      className="!bg-[#FF5252] hover:!bg-[#E04545]">
                      Generate with Current Data
                    </Button>
                  </div>
                </motion.div>
              ) : null}
            </div>
          )}

          {/* Balanced mode warning */}
          {report && !report.strictPassed && !isViewer && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <span className="text-amber-500 text-xl mt-0.5">⚠️</span>
                <div>
                  <p className="font-semibold text-amber-800 text-sm">Preliminary Report — Balanced Mode</p>
                  <p className="text-amber-700 text-xs mt-1">
                    This report was generated with incomplete data (confidence {"<"}90%).
                    Lead ordering is disabled until you reach the strict gate.
                  </p>
                  {isOwner && (
                    <Link href="/onboarding">
                      <Button variant="ghost" size="sm" className="mt-2 text-amber-700">Improve Onboarding →</Button>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Pill Tabs ─────────────────────────────────────── */}
          {(report || user?.sessionType === "teamMember") && visibleTabs.length > 0 && (
            <>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
                <div className="relative px-4 lg:px-6 pt-4 overflow-x-auto" ref={tabsRef}>
                  {/* Sliding indicator */}
                  <motion.div
                    className="absolute bottom-0 h-[3px] bg-[#1A6B6B] rounded-full"
                    animate={{ width: indicatorStyle.width, left: indicatorStyle.left }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                  <div className="flex gap-1">
                    {visibleTabs.map((tab) => (
                      <button
                        key={tab.id}
                        data-tab={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium rounded-t-xl transition-all whitespace-nowrap active:scale-[0.98] ${
                          activeTab === tab.id
                            ? "text-[#1A6B6B]"
                            : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <span>{tab.emoji}</span>
                        {tab.label}
                        {tab.id === "leads" && report && !report.strictPassed && (
                          <span className="ml-1 text-red-400">🔒</span>
                        )}
                        {tab.id === "team" && isViewer && (
                          <span className="ml-1 text-gray-300">👁</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tab content with animated transitions */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                >
                  {activeTab === "icp"      && <IcpTab data={report?.icp ?? null} />}
                  {activeTab === "dmu"      && <DmuTab data={report?.dmu ?? null} />}
                  {activeTab === "abm"      && <AbmTab data={report?.abm ?? null} />}
                  {activeTab === "outreach" && <OutreachTab data={report?.outreach ?? null} />}
                  {activeTab === "lookalike"&& <LookalikeTab data={report?.lookalike ?? null} />}
                  {activeTab === "leads"    && report && <LeadsModule report={report} user={user!} />}
                  {activeTab === "progress" && <ProgressTab />}
                  {activeTab === "crm"      && <CrmTab readOnly={isViewer} />}
                  {activeTab === "team"     && (
                    <TeamTab
                      userEmail={user?.email || ""}
                      isOwner={canManageTeam}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </>
          )}
        </div>
      </div>

      {/* ── Regenerate Credit Modal ───────────────────────────── */}
      <AnimatePresence>
        {showRegenModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
              <div className="text-center mb-4">
                <div className="text-4xl mb-3">🔄</div>
                <h2 className="text-lg font-bold text-[#1F2A2A]">Monthly Regenerate Used</h2>
                <p className="text-gray-500 text-sm mt-2">
                  You&apos;ve used your free regenerate this month. Additional regenerates cost{" "}
                  <span className="font-semibold text-[#1F2A2A]">$5 each</span>.
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 mb-5 text-xs text-gray-500 space-y-1">
                <p>• First regenerate every month is <strong>FREE</strong></p>
                <p>• Additional regenerates: <strong>$5 each</strong></p>
                <p>• Credits are applied manually after payment confirmation</p>
              </div>
              <div className="flex flex-col gap-3">
                <a href={buildRegenWhatsAppUrl()} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-semibold py-3 px-5 rounded-xl transition-colors text-sm"
                  onClick={() => setShowRegenModal(false)}>
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Contact us on WhatsApp — $5 Regenerate
                </a>
                <button onClick={() => setShowRegenModal(false)} className="text-sm text-gray-400 hover:text-gray-600 py-2">
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardInner />
    </Suspense>
  );
}
