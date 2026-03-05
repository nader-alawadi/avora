import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";

// ─── Colour tokens ─────────────────────────────────────────────────────────
const TEAL    = "#1E6663";
const TEAL_LT = "#E8F2F1";
const DARK    = "#1F2A2A";
const GRAY    = "#6B7280";
const GRAY_LT = "#F3F4F6";
const WHITE   = "#FFFFFF";
const CORAL   = "#FF6B63";
const DIVIDER = "#D1D5DB";

// ─── Latin-safe helpers ────────────────────────────────────────────────────
// Helvetica has no Arabic glyphs. Strip everything outside Latin Extended-B
// so textkit never encounters bidi / Arabic code points.
function ls(val: unknown): string {
  if (!val) return "";
  return String(val)
    .replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\u024F]/g, " ")
    .replace(/ {2,}/g, " ")
    .trim();
}
function lsArr(arr: unknown): string[] {
  if (!Array.isArray(arr)) return [];
  return arr.map(ls).filter(Boolean);
}
// Prefer the explicit englishSummary; fall back to latin-safe summary.
function enSummary(section: { summary?: string; englishSummary?: string } | null | undefined): string {
  if (!section) return "";
  if (section.englishSummary) return section.englishSummary;
  return ls(section.summary);
}

// ─── Data interfaces ───────────────────────────────────────────────────────
interface IcpData {
  title?: string;
  firmographics?: {
    industries?: string[];
    companySize?: string;
    revenue?: string;
    geography?: string[];
    techStack?: string[];
  };
  psychographics?: {
    challenges?: string[];
    motivations?: string[];
    priorities?: string[];
  };
  triggers?: string[];
  qualifiers?: string[];
  disqualifiers?: string[];
  summary?: string;
  englishSummary?: string;
  warnings?: string[];
}
interface DmuRole {
  role?: string;
  typicalTitles?: string[];
  concerns?: string[];
  messagingAngle?: string;
  decisionWeight?: string;
}
interface DmuData {
  roles?: DmuRole[];
  buyingProcess?: string;
  keyObjections?: string[];
  summary?: string;
  englishSummary?: string;
}
interface AbmTier {
  tier?: string;
  criteria?: string[];
  accountCount?: string;
  approach?: string;
}
interface AbmData {
  tiers?: AbmTier[];
  prioritizationFramework?: string;
  kpis?: string[];
  summary?: string;
  englishSummary?: string;
}
interface OutreachChannel {
  channel?: string;
  strategy?: string;
  cadence?: string;
  messagingFramework?: { hook?: string; value?: string; cta?: string };
  templates?: string[];
}
interface OutreachData {
  channels?: OutreachChannel[];
  sequenceOverview?: string;
  summary?: string;
  englishSummary?: string;
}
interface LookalikeCat {
  category?: string;
  criteria?: string[];
  rationale?: string;
}
interface LookalikeData {
  criteria?: LookalikeCat[];
  searchQueries?: { linkedin?: string[]; google?: string[]; crunchbase?: string[] };
  booleanStrings?: string[];
  summary?: string;
  englishSummary?: string;
  disclaimer?: string;
}
interface ReportData {
  icp: Record<string, unknown> | null;
  dmu: Record<string, unknown> | null;
  abm: Record<string, unknown> | null;
  outreach: Record<string, unknown> | null;
  lookalike: Record<string, unknown> | null;
  icpConfidence: number;
  dmuConfidence: number;
  strictPassed: boolean;
  version: number;
  createdAt: string;
  language: string;
}

// ─── Styles ────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  // pages
  page: { backgroundColor: WHITE, fontFamily: "Helvetica" },
  coverPage: { backgroundColor: TEAL, padding: 48, fontFamily: "Helvetica" },
  content: { paddingHorizontal: 40, paddingTop: 22, paddingBottom: 52 },

  // cover
  coverLogo:   { fontSize: 42, fontFamily: "Helvetica-Bold", color: WHITE, letterSpacing: 3 },
  coverTagline:{ fontSize: 14, color: WHITE, fontFamily: "Helvetica", marginTop: 6 },
  coverByline: { fontSize: 10, color: WHITE, fontFamily: "Helvetica", marginTop: 3 },
  coverAccent: { height: 3, backgroundColor: CORAL, marginTop: 36, marginBottom: 30, width: 56 },
  coverTitle:  { fontSize: 20, fontFamily: "Helvetica-Bold", color: WHITE, marginBottom: 22 },
  coverGrid:   { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 4 },
  coverMetaBox:{ backgroundColor: "rgba(255,255,255,0.13)", borderRadius: 8, padding: 14, width: "47%" },
  coverMetaLbl:{ fontSize: 8,  color: WHITE, fontFamily: "Helvetica", marginBottom: 3 },
  coverMetaVal:{ fontSize: 15, fontFamily: "Helvetica-Bold", color: WHITE },
  coverFooter: { position: "absolute", bottom: 28, left: 48, right: 48 },
  coverFooterTxt: { fontSize: 8, color: WHITE, fontFamily: "Helvetica" },

  // section page header bar
  secBar:     { backgroundColor: TEAL, paddingHorizontal: 40, paddingVertical: 18 },
  secBarTitle:{ fontSize: 18, fontFamily: "Helvetica-Bold", color: WHITE },
  secBarSub:  { fontSize: 9, color: WHITE, fontFamily: "Helvetica", marginTop: 2 },

  // page footer
  footer:     { position: "absolute", bottom: 20, left: 40, right: 40, borderTopWidth: 1, borderTopColor: DIVIDER, paddingTop: 6, flexDirection: "row", justifyContent: "space-between" },
  footerTxt:  { fontSize: 8, color: GRAY, fontFamily: "Helvetica" },

  // typography
  subHeading: { fontSize: 12, fontFamily: "Helvetica-Bold", color: DARK, marginBottom: 8, marginTop: 14 },
  label:      { fontSize: 8,  fontFamily: "Helvetica-Bold", color: GRAY, marginBottom: 5 },
  body:       { fontSize: 10, color: DARK, lineHeight: 1.5 },
  note:       { fontSize: 9,  color: GRAY, lineHeight: 1.4, fontFamily: "Helvetica-Oblique" },

  // summary card
  summaryCard:{ backgroundColor: TEAL_LT, borderLeftWidth: 3, borderLeftColor: TEAL, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 14, borderRadius: 3 },
  summaryLbl: { fontSize: 8, fontFamily: "Helvetica-Bold", color: TEAL, marginBottom: 4 },
  summaryTxt: { fontSize: 10, color: DARK, lineHeight: 1.55 },

  // cards
  card:     { backgroundColor: GRAY_LT, borderRadius: 6, padding: 12, marginBottom: 10 },
  cardTitle:{ fontSize: 11, fontFamily: "Helvetica-Bold", color: DARK, marginBottom: 6 },

  // tags
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginBottom: 4 },
  tagTeal:{ backgroundColor: TEAL_LT, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  tagTealTxt: { fontSize: 8, color: TEAL },
  tagGray:    { backgroundColor: "#E5E7EB", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  tagGrayTxt: { fontSize: 8, color: "#374151" },
  tagDark:    { backgroundColor: "#1F2A2A", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  tagDarkTxt: { fontSize: 8, color: "#A3E4D7" },

  // bullets
  bulletRow:  { flexDirection: "row", marginBottom: 5, gap: 6 },
  bulletMark: { fontSize: 10, color: TEAL, width: 10, flexShrink: 0, fontFamily: "Helvetica-Bold" },
  bulletMarkRed: { fontSize: 10, color: CORAL, width: 10, flexShrink: 0, fontFamily: "Helvetica-Bold" },
  bulletTxt:  { fontSize: 10, color: DARK, flex: 1, lineHeight: 1.4 },

  // kv pair
  kvRow: { flexDirection: "row", marginBottom: 6, gap: 6 },
  kvLbl: { fontSize: 9, fontFamily: "Helvetica-Bold", color: GRAY, width: 90, flexShrink: 0 },
  kvVal: { fontSize: 9, color: DARK, flex: 1, lineHeight: 1.4 },

  // columns
  row:  { flexDirection: "row", gap: 10 },
  col2: { flex: 1 },

  // code / template box
  codeBox: { backgroundColor: "#1F2A2A", borderRadius: 4, padding: 10, marginBottom: 8 },
  codeTxt: { fontSize: 9, color: "#6EE7B7", fontFamily: "Helvetica", lineHeight: 1.45 },

  // messaging framework 3-up
  mfRow:   { flexDirection: "row", gap: 8, marginBottom: 8 },
  mfBox:   { flex: 1, borderRadius: 4, padding: 8 },
  mfLbl:   { fontSize: 8, fontFamily: "Helvetica-Bold", marginBottom: 3 },
  mfTxt:   { fontSize: 9, lineHeight: 1.4 },

  // tier card
  tierCard:  { borderWidth: 1, borderColor: DIVIDER, borderRadius: 6, padding: 12, marginBottom: 10 },
  tierBadge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, alignSelf: "flex-start", marginBottom: 8 },
  tierBadgeTxt: { fontSize: 9, fontFamily: "Helvetica-Bold" },
  tierCount: { fontSize: 9, color: GRAY, marginBottom: 8 },

  divider: { height: 1, backgroundColor: DIVIDER, marginVertical: 10 },
});

// ─── Primitive components ──────────────────────────────────────────────────
function Bullet({ text, red }: { text: string; red?: boolean }) {
  return (
    <View style={S.bulletRow}>
      <Text style={red ? S.bulletMarkRed : S.bulletMark}>{red ? "x" : "-"}</Text>
      <Text style={S.bulletTxt}>{text}</Text>
    </View>
  );
}

function Tags({ items, gray, dark }: { items: string[]; gray?: boolean; dark?: boolean }) {
  if (!items.length) return null;
  return (
    <View style={S.tagRow}>
      {items.map((t, i) => (
        <View key={i} style={dark ? S.tagDark : gray ? S.tagGray : S.tagTeal}>
          <Text style={dark ? S.tagDarkTxt : gray ? S.tagGrayTxt : S.tagTealTxt}>{t}</Text>
        </View>
      ))}
    </View>
  );
}

function KV({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <View style={S.kvRow}>
      <Text style={S.kvLbl}>{label}</Text>
      <Text style={S.kvVal}>{value}</Text>
    </View>
  );
}

function SummaryCard({ text, label = "Overview" }: { text: string; label?: string }) {
  if (!text) return null;
  return (
    <View style={S.summaryCard}>
      <Text style={S.summaryLbl}>{label.toUpperCase()}</Text>
      <Text style={S.summaryTxt}>{text}</Text>
    </View>
  );
}

function SectionBar({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={S.secBar}>
      <Text style={S.secBarTitle}>{title}</Text>
      {subtitle && <Text style={S.secBarSub}>{subtitle}</Text>}
    </View>
  );
}

function PageFooter({ left, right }: { left: string; right?: string }) {
  return (
    <View style={S.footer} fixed>
      <Text style={S.footerTxt}>{left}</Text>
      <Text style={S.footerTxt}>{right ?? "AVORA by Enigma Sales — Confidential"}</Text>
    </View>
  );
}

// ─── Cover page ────────────────────────────────────────────────────────────
function CoverPage({ report }: { report: ReportData }) {
  const date = new Date(report.createdAt).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
  const meta = [
    { label: "ICP Confidence",  value: `${report.icpConfidence}%` },
    { label: "DMU Confidence",  value: `${report.dmuConfidence}%` },
    { label: "Report Version",  value: `v${report.version}` },
    { label: "Strict Gate",     value: report.strictPassed ? "Passed" : "Balanced Mode" },
  ];
  return (
    <Page size="A4" style={S.coverPage}>
      <Text style={S.coverLogo}>AVORA</Text>
      <Text style={S.coverTagline}>GTM &amp; Sales Strategy Report</Text>
      <Text style={S.coverByline}>by Enigma Sales</Text>
      <View style={S.coverAccent} />
      <Text style={S.coverTitle}>Your Personalised Go-To-Market Strategy</Text>
      <View style={S.coverGrid}>
        {meta.map((m, i) => (
          <View key={i} style={S.coverMetaBox}>
            <Text style={S.coverMetaLbl}>{m.label}</Text>
            <Text style={S.coverMetaVal}>{m.value}</Text>
          </View>
        ))}
      </View>
      <View style={S.coverFooter}>
        <Text style={S.coverFooterTxt}>Generated {date}  |  Confidential — Enigma Sales / AVORA Platform</Text>
      </View>
    </Page>
  );
}

// ─── ICP pages ─────────────────────────────────────────────────────────────
function IcpPages({ data }: { data: Record<string, unknown> | null }) {
  if (!data) return null;
  const icp = data as IcpData;
  const f = icp.firmographics ?? {};
  const p = icp.psychographics ?? {};
  const summary  = enSummary(icp);
  const warnings = lsArr(icp.warnings);
  const industries = lsArr(f.industries);
  const geo        = lsArr(f.geography);
  const tech       = lsArr(f.techStack);
  const challenges = lsArr(p.challenges);
  const motivations= lsArr(p.motivations);
  const priorities = lsArr(p.priorities);
  const triggers   = lsArr(icp.triggers);
  const qualifiers = lsArr(icp.qualifiers);
  const disqualifiers = lsArr(icp.disqualifiers);

  return (
    <>
      <Page size="A4" style={S.page}>
        <SectionBar title="Ideal Customer Profile (ICP)" subtitle="Firmographics & Psychographics" />
        <View style={S.content}>
          {warnings.length > 0 && (
            <View style={{ backgroundColor: "#FFFBEB", borderLeftWidth: 3, borderLeftColor: "#F59E0B", padding: 10, borderRadius: 3, marginBottom: 12 }}>
              <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", color: "#92400E", marginBottom: 4 }}>DATA WARNINGS</Text>
              {warnings.map((w, i) => <Bullet key={i} text={w} />)}
            </View>
          )}

          <SummaryCard text={summary} label="ICP Summary" />

          {/* Firmographics card */}
          <Text style={S.subHeading}>Firmographics</Text>
          <View style={S.row}>
            <View style={S.col2}>
              <View style={S.card}>
                {industries.length > 0 && (
                  <View style={{ marginBottom: 10 }}>
                    <Text style={S.label}>INDUSTRIES</Text>
                    <Tags items={industries} />
                  </View>
                )}
                {ls(f.companySize) && <KV label="Company Size" value={ls(f.companySize)} />}
                {ls(f.revenue)     && <KV label="Revenue Range" value={ls(f.revenue)} />}
                {geo.length > 0 && (
                  <View style={{ marginTop: 6 }}>
                    <Text style={S.label}>GEOGRAPHY</Text>
                    <Tags items={geo} gray />
                  </View>
                )}
              </View>
            </View>
            <View style={S.col2}>
              {tech.length > 0 && (
                <View style={S.card}>
                  <Text style={S.label}>TECH STACK SIGNALS</Text>
                  <Tags items={tech} dark />
                </View>
              )}
            </View>
          </View>

          {/* Psychographics */}
          <Text style={S.subHeading}>Psychographics</Text>
          <View style={S.row}>
            {challenges.length > 0 && (
              <View style={S.col2}>
                <View style={S.card}>
                  <Text style={S.cardTitle}>Key Challenges</Text>
                  {challenges.map((c, i) => <Bullet key={i} text={c} />)}
                </View>
              </View>
            )}
            {motivations.length > 0 && (
              <View style={S.col2}>
                <View style={S.card}>
                  <Text style={S.cardTitle}>Buying Motivations</Text>
                  {motivations.map((m, i) => <Bullet key={i} text={m} />)}
                </View>
              </View>
            )}
          </View>
          {priorities.length > 0 && (
            <View style={S.card}>
              <Text style={S.cardTitle}>Strategic Priorities</Text>
              <View style={S.row}>
                {priorities.map((pr, i) => (
                  <View key={i} style={{ flex: 1, backgroundColor: TEAL_LT, borderRadius: 4, padding: 8 }}>
                    <Text style={{ fontSize: 9, color: TEAL }}>{pr}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
        <PageFooter left="Section 1 — Ideal Customer Profile" />
      </Page>

      {/* ICP page 2: triggers / qualifiers / disqualifiers */}
      {(triggers.length > 0 || qualifiers.length > 0 || disqualifiers.length > 0) && (
        <Page size="A4" style={S.page}>
          <SectionBar title="Ideal Customer Profile (ICP)" subtitle="Triggers, Qualifiers & Disqualifiers" />
          <View style={S.content}>
            <View style={S.row}>
              {triggers.length > 0 && (
                <View style={S.col2}>
                  <Text style={S.subHeading}>Buying Triggers</Text>
                  <View style={S.card}>
                    {triggers.map((t, i) => <Bullet key={i} text={t} />)}
                  </View>
                </View>
              )}
              {qualifiers.length > 0 && (
                <View style={S.col2}>
                  <Text style={S.subHeading}>Qualification Criteria</Text>
                  <View style={S.card}>
                    {qualifiers.map((q, i) => <Bullet key={i} text={q} />)}
                  </View>
                </View>
              )}
            </View>
            {disqualifiers.length > 0 && (
              <>
                <Text style={S.subHeading}>Disqualifiers</Text>
                <View style={{ ...S.card, borderLeftWidth: 3, borderLeftColor: CORAL }}>
                  {disqualifiers.map((d, i) => <Bullet key={i} text={d} red />)}
                </View>
              </>
            )}
          </View>
          <PageFooter left="Section 1 — Ideal Customer Profile" />
        </Page>
      )}
    </>
  );
}

// ─── DMU pages ─────────────────────────────────────────────────────────────
const ROLE_ACCENT: Record<string, { bg: string; txt: string }> = {
  "Economic Buyer": { bg: "#EDE9FE", txt: "#5B21B6" },
  "Champion":       { bg: "#D1FAE5", txt: "#065F46" },
  "Technical Buyer":{ bg: "#DBEAFE", txt: "#1E40AF" },
  "End User":       { bg: "#FEF3C7", txt: "#92400E" },
  "Influencer":     { bg: "#FCE7F3", txt: "#9D174D" },
};

function DmuPages({ data }: { data: Record<string, unknown> | null }) {
  if (!data) return null;
  const dmu = data as DmuData;
  const roles     = Array.isArray(dmu.roles) ? dmu.roles : [];
  const summary   = enSummary(dmu);
  const objections= lsArr(dmu.keyObjections);

  return (
    <>
      <Page size="A4" style={S.page}>
        <SectionBar title="Decision Making Unit (DMU)" subtitle="Roles, Titles & Messaging Angles" />
        <View style={S.content}>
          <SummaryCard text={summary} label="DMU Overview" />
          <Text style={S.subHeading}>Roles</Text>
          {roles.map((role, i) => {
            const roleName = ls(role.role);
            const accent   = ROLE_ACCENT[roleName] ?? { bg: GRAY_LT, txt: DARK };
            const titles   = lsArr(role.typicalTitles);
            const concerns = lsArr(role.concerns);
            const angle    = ls(role.messagingAngle);
            const weight   = ls(role.decisionWeight);
            return (
              <View key={i} style={{ ...S.card, marginBottom: 12 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <View style={{ ...S.tierBadge, backgroundColor: accent.bg }}>
                    <Text style={{ ...S.tierBadgeTxt, color: accent.txt }}>{roleName}</Text>
                  </View>
                  {weight && <Text style={S.note}>{weight}</Text>}
                </View>
                <View style={S.row}>
                  <View style={S.col2}>
                    {titles.length > 0 && (
                      <View style={{ marginBottom: 8 }}>
                        <Text style={S.label}>TYPICAL TITLES</Text>
                        <Tags items={titles} gray />
                      </View>
                    )}
                    {concerns.length > 0 && (
                      <View>
                        <Text style={S.label}>KEY CONCERNS</Text>
                        {concerns.map((c, j) => <Bullet key={j} text={c} />)}
                      </View>
                    )}
                  </View>
                  {angle && (
                    <View style={S.col2}>
                      <View style={{ backgroundColor: TEAL_LT, borderRadius: 4, padding: 10 }}>
                        <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold", color: TEAL, marginBottom: 4 }}>MESSAGING ANGLE</Text>
                        <Text style={{ fontSize: 9, color: DARK, lineHeight: 1.4 }}>{angle}</Text>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>
        <PageFooter left="Section 2 — Decision Making Unit" />
      </Page>

      {/* DMU page 2: buying process + objections */}
      {(ls(dmu.buyingProcess) || objections.length > 0) && (
        <Page size="A4" style={S.page}>
          <SectionBar title="Decision Making Unit (DMU)" subtitle="Buying Process & Key Objections" />
          <View style={S.content}>
            {ls(dmu.buyingProcess) && (
              <>
                <Text style={S.subHeading}>Buying Process</Text>
                <View style={S.card}>
                  <Text style={S.body}>{ls(dmu.buyingProcess)}</Text>
                </View>
              </>
            )}
            {objections.length > 0 && (
              <>
                <Text style={S.subHeading}>Key Objections &amp; Response Hints</Text>
                <View style={S.card}>
                  {objections.map((obj, i) => <Bullet key={i} text={obj} />)}
                </View>
              </>
            )}
          </View>
          <PageFooter left="Section 2 — Decision Making Unit" />
        </Page>
      )}
    </>
  );
}

// ─── ABM pages ─────────────────────────────────────────────────────────────
const TIER_STYLES = [
  { bg: "#F5F3FF", border: "#7C3AED", badge: { bg: "#EDE9FE", txt: "#5B21B6" } },
  { bg: "#EFF6FF", border: "#2563EB", badge: { bg: "#DBEAFE", txt: "#1E40AF" } },
  { bg: "#F9FAFB", border: "#6B7280", badge: { bg: "#E5E7EB", txt: "#374151" } },
];

function AbmPages({ data }: { data: Record<string, unknown> | null }) {
  if (!data) return null;
  const abm     = data as AbmData;
  const tiers   = Array.isArray(abm.tiers) ? abm.tiers : [];
  const summary = enSummary(abm);
  const kpis    = lsArr(abm.kpis);

  return (
    <Page size="A4" style={S.page}>
      <SectionBar title="ABM Targeting Strategy" subtitle="Account Tiers, Framework & KPIs" />
      <View style={S.content}>
        <SummaryCard text={summary} label="ABM Overview" />

        {tiers.length > 0 && (
          <>
            <Text style={S.subHeading}>Account Tiers</Text>
            {tiers.map((tier, i) => {
              const style    = TIER_STYLES[i] ?? TIER_STYLES[2];
              const criteria = lsArr(tier.criteria);
              return (
                <View key={i} style={{ ...S.tierCard, borderLeftWidth: 4, borderLeftColor: style.border, backgroundColor: style.bg }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <View style={{ ...S.tierBadge, backgroundColor: style.badge.bg, marginBottom: 0 }}>
                      <Text style={{ ...S.tierBadgeTxt, color: style.badge.txt }}>{ls(tier.tier)}</Text>
                    </View>
                    {ls(tier.accountCount) && (
                      <Text style={S.tierCount}>Est. {ls(tier.accountCount)} accounts</Text>
                    )}
                  </View>
                  {criteria.length > 0 && (
                    <View style={{ marginBottom: 6 }}>
                      <Text style={S.label}>CRITERIA</Text>
                      <Tags items={criteria} gray />
                    </View>
                  )}
                  {ls(tier.approach) && (
                    <Text style={{ fontSize: 9, color: DARK, lineHeight: 1.4 }}>{ls(tier.approach)}</Text>
                  )}
                </View>
              );
            })}
          </>
        )}

        <View style={S.row}>
          {ls(abm.prioritizationFramework) && (
            <View style={S.col2}>
              <Text style={S.subHeading}>Prioritisation Framework</Text>
              <View style={S.card}>
                <Text style={S.body}>{ls(abm.prioritizationFramework)}</Text>
              </View>
            </View>
          )}
          {kpis.length > 0 && (
            <View style={S.col2}>
              <Text style={S.subHeading}>KPIs to Track</Text>
              <View style={S.card}>
                {kpis.map((kpi, i) => <Bullet key={i} text={kpi} />)}
              </View>
            </View>
          )}
        </View>
      </View>
      <PageFooter left="Section 3 — ABM Targeting Strategy" />
    </Page>
  );
}

// ─── Outreach pages ────────────────────────────────────────────────────────
function OutreachPages({ data }: { data: Record<string, unknown> | null }) {
  if (!data) return null;
  const out      = data as OutreachData;
  const channels = Array.isArray(out.channels) ? out.channels : [];
  const summary  = enSummary(out);

  return (
    <>
      <Page size="A4" style={S.page}>
        <SectionBar title="Outreach Playbook" subtitle="Multi-Channel Sequences & Templates" />
        <View style={S.content}>
          <SummaryCard text={summary} label="Outreach Overview" />
          {ls(out.sequenceOverview) && (
            <View style={{ ...S.card, borderLeftWidth: 3, borderLeftColor: TEAL, marginBottom: 14 }}>
              <Text style={{ ...S.label, marginBottom: 6 }}>SEQUENCE OVERVIEW</Text>
              <Text style={S.body}>{ls(out.sequenceOverview)}</Text>
            </View>
          )}

          {channels.map((ch, i) => {
            const mf        = ch.messagingFramework ?? {};
            const templates = lsArr(ch.templates);
            return (
              <View key={i} style={{ marginBottom: 16 }}>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8, gap: 8 }}>
                  <View style={{ backgroundColor: TEAL, borderRadius: 4, paddingHorizontal: 10, paddingVertical: 4 }}>
                    <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold", color: WHITE }}>{ls(ch.channel)}</Text>
                  </View>
                  {ls(ch.cadence) && (
                    <View style={{ backgroundColor: GRAY_LT, borderRadius: 4, paddingHorizontal: 8, paddingVertical: 4 }}>
                      <Text style={{ fontSize: 9, color: GRAY }}>{ls(ch.cadence)}</Text>
                    </View>
                  )}
                </View>

                {ls(ch.strategy) && (
                  <Text style={{ ...S.note, marginBottom: 8 }}>{ls(ch.strategy)}</Text>
                )}

                {/* Messaging framework 3-up */}
                {(ls(mf.hook) || ls(mf.value) || ls(mf.cta)) && (
                  <View style={S.mfRow}>
                    {ls(mf.hook) && (
                      <View style={{ ...S.mfBox, backgroundColor: "#FFFBEB" }}>
                        <Text style={{ ...S.mfLbl, color: "#92400E" }}>HOOK</Text>
                        <Text style={{ ...S.mfTxt, color: DARK }}>{ls(mf.hook)}</Text>
                      </View>
                    )}
                    {ls(mf.value) && (
                      <View style={{ ...S.mfBox, backgroundColor: "#F0FDF4" }}>
                        <Text style={{ ...S.mfLbl, color: "#065F46" }}>VALUE</Text>
                        <Text style={{ ...S.mfTxt, color: DARK }}>{ls(mf.value)}</Text>
                      </View>
                    )}
                    {ls(mf.cta) && (
                      <View style={{ ...S.mfBox, backgroundColor: "#EFF6FF" }}>
                        <Text style={{ ...S.mfLbl, color: "#1E40AF" }}>CTA</Text>
                        <Text style={{ ...S.mfTxt, color: DARK }}>{ls(mf.cta)}</Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Message templates */}
                {templates.length > 0 && (
                  <View>
                    <Text style={S.label}>MESSAGE TEMPLATES</Text>
                    {templates.map((t, j) => (
                      <View key={j} style={S.codeBox}>
                        <Text style={S.codeTxt}>{t}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {i < channels.length - 1 && <View style={S.divider} />}
              </View>
            );
          })}
        </View>
        <PageFooter left="Section 4 — Outreach Playbook" />
      </Page>
    </>
  );
}

// ─── Lookalike pages ───────────────────────────────────────────────────────
function LookalikePages({ data }: { data: Record<string, unknown> | null }) {
  if (!data) return null;
  const ll       = data as LookalikeData;
  const cats     = Array.isArray(ll.criteria) ? ll.criteria : [];
  const sq       = ll.searchQueries ?? {};
  const booleans = lsArr(ll.booleanStrings);
  const summary  = enSummary(ll);

  return (
    <>
      <Page size="A4" style={S.page}>
        <SectionBar title="Lookalike Account Criteria" subtitle="Matching Criteria & Search Queries" />
        <View style={S.content}>
          {/* Disclaimer banner */}
          <View style={{ backgroundColor: "#EFF6FF", borderLeftWidth: 3, borderLeftColor: "#2563EB", padding: 10, borderRadius: 3, marginBottom: 12 }}>
            <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold", color: "#1E40AF", marginBottom: 3 }}>SEARCH CRITERIA ONLY — NO PERSONAL DATA</Text>
            <Text style={{ fontSize: 9, color: "#1E40AF", lineHeight: 1.4 }}>
              {ls(ll.disclaimer) || "These are search criteria and queries only. No specific companies or personal contacts are included."}
            </Text>
          </View>

          <SummaryCard text={summary} label="Lookalike Strategy" />

          {cats.length > 0 && (
            <>
              <Text style={S.subHeading}>Account Matching Criteria</Text>
              <View style={S.row}>
                {cats.map((cat, i) => (
                  <View key={i} style={S.col2}>
                    <View style={S.card}>
                      <Text style={S.cardTitle}>{ls(cat.category)}</Text>
                      {ls(cat.rationale) && (
                        <Text style={{ ...S.note, marginBottom: 8 }}>{ls(cat.rationale)}</Text>
                      )}
                      {lsArr(cat.criteria).map((c, j) => <Bullet key={j} text={c} />)}
                    </View>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Search queries */}
          {(lsArr(sq.linkedin).length > 0 || lsArr(sq.google).length > 0 || lsArr(sq.crunchbase).length > 0) && (
            <>
              <Text style={S.subHeading}>Search Queries</Text>

              {lsArr(sq.linkedin).length > 0 && (
                <View style={{ marginBottom: 10 }}>
                  <Text style={S.label}>LINKEDIN SALES NAVIGATOR</Text>
                  {lsArr(sq.linkedin).map((q, i) => (
                    <View key={i} style={{ ...S.codeBox, marginBottom: 4 }}>
                      <Text style={S.codeTxt}>{q}</Text>
                    </View>
                  ))}
                </View>
              )}

              {lsArr(sq.google).length > 0 && (
                <View style={{ marginBottom: 10 }}>
                  <Text style={S.label}>GOOGLE SEARCH</Text>
                  {lsArr(sq.google).map((q, i) => (
                    <View key={i} style={{ ...S.codeBox, marginBottom: 4 }}>
                      <Text style={S.codeTxt}>{q}</Text>
                    </View>
                  ))}
                </View>
              )}

              {lsArr(sq.crunchbase).length > 0 && (
                <View style={{ marginBottom: 10 }}>
                  <Text style={S.label}>CRUNCHBASE FILTERS</Text>
                  {lsArr(sq.crunchbase).map((q, i) => (
                    <View key={i} style={{ backgroundColor: GRAY_LT, borderRadius: 4, padding: 8, marginBottom: 4 }}>
                      <Text style={{ fontSize: 9, color: DARK }}>{q}</Text>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}

          {booleans.length > 0 && (
            <>
              <Text style={S.subHeading}>Boolean Search Strings</Text>
              {booleans.map((b, i) => (
                <View key={i} style={{ ...S.codeBox, marginBottom: 6 }}>
                  <Text style={S.codeTxt}>{b}</Text>
                </View>
              ))}
            </>
          )}
        </View>
        <PageFooter left="Section 5 — Lookalike Account Criteria" />
      </Page>
    </>
  );
}

// ─── Next steps page ───────────────────────────────────────────────────────
function NextStepsPage() {
  const steps = [
    { n: "1", title: "Validate the ICP",       desc: "Review ICP firmographics and psychographics with your sales team. Confirm against 3–5 real accounts you have won." },
    { n: "2", title: "Build your Tier 1 list", desc: "Use the ABM criteria to identify 20–50 Tier 1 target accounts. Score and prioritise using the framework provided." },
    { n: "3", title: "Launch outreach",         desc: "Build LinkedIn + Email sequences using the templates in Section 4. Personalise Tier 1 messaging for each account." },
    { n: "4", title: "Find lookalike accounts", desc: "Run the LinkedIn Sales Navigator filters and Boolean strings to discover accounts that match your ICP." },
    { n: "5", title: "Request targeted leads",  desc: "Once the strict gate is passed, use the AVORA dashboard to order curated, verified lead lists from Enigma Sales." },
  ];
  return (
    <Page size="A4" style={S.page}>
      <SectionBar title="Next Steps" subtitle="Recommended actions to activate your strategy" />
      <View style={S.content}>
        {steps.map((step, i) => (
          <View key={i} style={{ flexDirection: "row", gap: 14, marginBottom: 16 }}>
            <View style={{ width: 28, height: 28, backgroundColor: TEAL, borderRadius: 14, alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
              <Text style={{ fontSize: 12, fontFamily: "Helvetica-Bold", color: WHITE }}>{step.n}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, fontFamily: "Helvetica-Bold", color: DARK, marginBottom: 4 }}>{step.title}</Text>
              <Text style={{ fontSize: 10, color: GRAY, lineHeight: 1.5 }}>{step.desc}</Text>
            </View>
          </View>
        ))}
        <View style={{ marginTop: 24, backgroundColor: TEAL_LT, borderRadius: 8, padding: 16, borderWidth: 1, borderColor: "#B2D8D4" }}>
          <Text style={{ fontSize: 11, fontFamily: "Helvetica-Bold", color: TEAL, marginBottom: 6 }}>About this Report</Text>
          <Text style={{ fontSize: 9, color: DARK, lineHeight: 1.55 }}>
            This report was generated by AVORA, Enigma Sales&apos; AI-powered GTM strategy engine.
            All analysis is based on the information provided during onboarding.
            Results are intended as a starting framework — validate assumptions with real customer data as you progress.
          </Text>
        </View>
      </View>
      <PageFooter left="Next Steps" right="AVORA by Enigma Sales — Confidential" />
    </Page>
  );
}

// ─── Document root ─────────────────────────────────────────────────────────
function ReportDocument({ report }: { report: ReportData }) {
  return (
    <Document>
      <CoverPage report={report} />
      <IcpPages data={report.icp} />
      <DmuPages data={report.dmu} />
      <AbmPages data={report.abm} />
      <OutreachPages data={report.outreach} />
      <LookalikePages data={report.lookalike} />
      <NextStepsPage />
    </Document>
  );
}

export async function generateReportPdf(report: ReportData): Promise<Buffer> {
  return renderToBuffer(<ReportDocument report={report} />);
}
