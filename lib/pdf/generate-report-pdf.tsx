import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";

// PDF is English-only. Arabic reports use English labels with the
// original AI-generated content stripped of non-Latin characters that
// crash textkit's bidi algorithm. Helvetica is the built-in react-pdf
// Latin font — no custom font registration needed.

interface ReportData {
  icp: { summary?: string } | null;
  dmu: { summary?: string } | null;
  abm: { summary?: string } | null;
  outreach: { summary?: string } | null;
  lookalike: { summary?: string } | null;
  icpConfidence: number;
  dmuConfidence: number;
  strictPassed: boolean;
  version: number;
  createdAt: string;
  language: string;
}

const TEAL = "#1E6663";
const CORAL = "#FF6B63";
const DARK = "#1F2A2A";
const WHITE = "#FFFFFF";

// Strip any non-ASCII / non-Latin characters so textkit never receives
// Arabic Unicode or bidi control characters.
function toLatinSafe(text: string | undefined | null): string {
  if (!text) return "";
  return text
    .replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\u024F]/g, " ")
    .replace(/  +/g, " ")
    .trim();
}

const styles = StyleSheet.create({
  coverPage: {
    backgroundColor: TEAL,
    padding: 40,
    height: "100%",
    justifyContent: "flex-start",
  },
  coverTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: WHITE,
    fontFamily: "Helvetica-Bold",
  },
  coverSubtitle: {
    fontSize: 14,
    color: WHITE,
    fontFamily: "Helvetica",
    marginTop: 10,
  },
  coverByline: {
    fontSize: 10,
    color: WHITE,
    fontFamily: "Helvetica",
    marginTop: 6,
  },
  coverDivider: {
    height: 1,
    backgroundColor: CORAL,
    marginTop: 30,
    marginBottom: 20,
  },
  coverHeading: {
    fontSize: 18,
    fontWeight: "bold",
    color: WHITE,
    fontFamily: "Helvetica-Bold",
  },
  metaLine: {
    fontSize: 11,
    color: WHITE,
    fontFamily: "Helvetica",
    marginTop: 6,
  },
  coverFooter: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
  },
  coverFooterText: {
    fontSize: 8,
    color: WHITE,
    fontFamily: "Helvetica",
  },
  page: {
    padding: 40,
    fontFamily: "Helvetica",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: TEAL,
    fontFamily: "Helvetica-Bold",
    marginBottom: 15,
  },
  bodyText: {
    fontSize: 10,
    color: DARK,
    fontFamily: "Helvetica",
    lineHeight: 1.6,
  },
  stepText: {
    fontSize: 10,
    color: DARK,
    fontFamily: "Helvetica",
    marginBottom: 8,
  },
});

function CoverPage({ report }: { report: ReportData }) {
  const meta = [
    `Report Version: ${report.version}`,
    `Generated: ${new Date(report.createdAt).toLocaleDateString("en-US")}`,
    `ICP Confidence: ${report.icpConfidence}%`,
    `DMU Confidence: ${report.dmuConfidence}%`,
    `Strict Gate: ${report.strictPassed ? "Yes" : "No (Balanced Mode)"}`,
  ];

  return (
    <Page size="A4" style={styles.coverPage}>
      <Text style={styles.coverTitle}>AVORA</Text>
      <Text style={styles.coverSubtitle}>GTM &amp; Sales Strategy Report</Text>
      <Text style={styles.coverByline}>by Enigma Sales</Text>

      <View style={styles.coverDivider} />

      <Text style={styles.coverHeading}>Your Personalized Strategy</Text>

      {meta.map((line, i) => (
        <Text key={i} style={styles.metaLine}>{line}</Text>
      ))}

      <View style={styles.coverFooter}>
        <Text style={styles.coverFooterText}>
          Confidential — Enigma Sales / AVORA Platform
        </Text>
      </View>
    </Page>
  );
}

function SectionPage({ title, summary }: { title: string; summary?: string }) {
  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {summary && (
        <Text style={styles.bodyText}>{toLatinSafe(summary)}</Text>
      )}
    </Page>
  );
}

function NextStepsPage() {
  const steps = [
    "1. Review your ICP and validate with your sales team",
    "2. Map your top 20 target accounts against Tier 1 criteria",
    "3. Use outreach templates to build your sequences",
    "4. Use lookalike criteria to build your target list",
    "5. Request targeted leads via AVORA dashboard (if strict gate passed)",
  ];

  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.sectionTitle}>Next Steps</Text>
      {steps.map((step, i) => (
        <Text key={i} style={styles.stepText}>{step}</Text>
      ))}
    </Page>
  );
}

function ReportDocument({ report }: { report: ReportData }) {
  const sections = [
    { title: "Ideal Customer Profile (ICP)", data: report.icp },
    { title: "DMU Map", data: report.dmu },
    { title: "ABM Strategy", data: report.abm },
    { title: "Outreach Playbook", data: report.outreach },
    { title: "Lookalike Criteria", data: report.lookalike },
  ];

  return (
    <Document>
      <CoverPage report={report} />
      {sections.map(({ title, data }, i) => (
        <SectionPage key={i} title={title} summary={data?.summary} />
      ))}
      <NextStepsPage />
    </Document>
  );
}

export async function generateReportPdf(report: ReportData): Promise<Buffer> {
  return renderToBuffer(<ReportDocument report={report} />);
}
