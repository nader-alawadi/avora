import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Font,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import path from "path";
import fs from "fs";

// Register Amiri font for Arabic support.
// Use base64 data URLs so react-pdf receives self-contained font data
// instead of a local path string (which react-pdf tries to fetch as a
// network URL, causing ENOENT on local paths).
const amiriBase = path.join(
  process.cwd(),
  "node_modules/@fontsource/amiri/files"
);

function fontDataUrl(filename: string): string {
  const buf = fs.readFileSync(path.join(amiriBase, filename));
  return `data:font/woff;base64,${buf.toString("base64")}`;
}

Font.register({
  family: "Amiri",
  fonts: [
    { src: fontDataUrl("amiri-arabic-400-normal.woff"), fontWeight: 400 },
    { src: fontDataUrl("amiri-arabic-700-normal.woff"), fontWeight: 700 },
    { src: fontDataUrl("amiri-arabic-400-italic.woff"), fontWeight: 400, fontStyle: "italic" },
    { src: fontDataUrl("amiri-arabic-700-italic.woff"), fontWeight: 700, fontStyle: "italic" },
  ],
});

// Disable hyphenation for Arabic text
Font.registerHyphenationCallback((word) => [word]);

/**
 * Sanitize text before passing to react-pdf/textkit.
 *
 * textkit's bidi reorderLine crashes with "Cannot read properties of
 * undefined (reading 'id')" when it encounters a character whose Unicode
 * bidi category is not in its lookup table. This happens with:
 *   - Unicode directional/format control characters (U+200B–U+200F,
 *     U+202A–U+202E, U+2066–U+2069, U+FEFF …)
 *   - Characters in supplementary planes (code point > U+FFFF), e.g.
 *     emoji, which are outside textkit's BMP-only bidi tables.
 *
 * Stripping these invisible characters is safe: they carry no visible
 * content, and basic Arabic text (U+0600–U+06FF) is fully supported.
 */
function sanitizeText(text: string | undefined | null): string {
  if (!text) return "";
  return (
    text
      // Remove Unicode directional and invisible format controls
      .replace(/[\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g, "")
      // Remove supplementary-plane characters (code points > U+FFFF)
      // These appear as surrogate pairs in JS strings
      .replace(/[\uD800-\uDFFF]/g, "")
      // Collapse any resulting double spaces / blank lines
      .replace(/  +/g, " ")
      .trim()
  );
}

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

function isArabic(lang: string) {
  return lang === "ar";
}

function getStyles(lang: string) {
  const rtl = isArabic(lang);
  const fontFamily = rtl ? "Amiri" : "Helvetica";

  return StyleSheet.create({
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
      fontFamily,
      textAlign: rtl ? "right" : "left",
    },
    coverSubtitle: {
      fontSize: 14,
      color: WHITE,
      fontFamily,
      marginTop: 10,
      textAlign: rtl ? "right" : "left",
    },
    coverByline: {
      fontSize: 10,
      color: WHITE,
      fontFamily,
      marginTop: 6,
      textAlign: rtl ? "right" : "left",
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
      fontFamily,
      textAlign: rtl ? "right" : "left",
    },
    metaLine: {
      fontSize: 11,
      color: WHITE,
      fontFamily,
      marginTop: 6,
      textAlign: rtl ? "right" : "left",
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
      fontFamily,
      textAlign: rtl ? "right" : "left",
    },
    page: {
      padding: 40,
      fontFamily,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: TEAL,
      fontFamily,
      marginBottom: 15,
      textAlign: rtl ? "right" : "left",
    },
    bodyText: {
      fontSize: 10,
      color: DARK,
      fontFamily,
      lineHeight: 1.6,
      textAlign: rtl ? "right" : "left",
    },
    stepText: {
      fontSize: 10,
      color: DARK,
      fontFamily,
      marginBottom: 8,
      textAlign: rtl ? "right" : "left",
    },
  });
}

function CoverPage({ report, styles }: { report: ReportData; styles: ReturnType<typeof getStyles> }) {
  const rtl = isArabic(report.language);

  const meta = [
    `${rtl ? "إصدار التقرير" : "Report Version"}: ${report.version}`,
    `${rtl ? "تاريخ الإنشاء" : "Generated"}: ${new Date(report.createdAt).toLocaleDateString(rtl ? "ar-SA" : "en-US")}`,
    `${rtl ? "اللغة" : "Language"}: ${rtl ? "العربية" : "English"}`,
    `${rtl ? "ثقة ICP" : "ICP Confidence"}: ${report.icpConfidence}%`,
    `${rtl ? "ثقة DMU" : "DMU Confidence"}: ${report.dmuConfidence}%`,
    `${rtl ? "البوابة الصارمة" : "Strict Gate"}: ${report.strictPassed ? (rtl ? "نعم" : "Yes") : (rtl ? "لا (الوضع المتوازن)" : "No (Balanced Mode)")}`,
  ];

  return (
    <Page size="A4" style={styles.coverPage}>
      <Text style={styles.coverTitle}>AVORA</Text>
      <Text style={styles.coverSubtitle}>
        {rtl ? "تقرير استراتيجية GTM والمبيعات" : "GTM & Sales Strategy Report"}
      </Text>
      <Text style={styles.coverByline}>
        {rtl ? "بواسطة Enigma Sales" : "by Enigma Sales"}
      </Text>

      <View style={styles.coverDivider} />

      <Text style={styles.coverHeading}>
        {rtl ? "استراتيجيتك المخصصة" : "Your Personalized Strategy"}
      </Text>

      {meta.map((line, i) => (
        <Text key={i} style={styles.metaLine}>{sanitizeText(line)}</Text>
      ))}

      <View style={styles.coverFooter}>
        <Text style={styles.coverFooterText}>
          {rtl
            ? "سري — Enigma Sales / منصة AVORA"
            : "Confidential — Enigma Sales / AVORA Platform"}
        </Text>
      </View>
    </Page>
  );
}

function SectionPage({
  title,
  summary,
  styles,
}: {
  title: string;
  summary?: string;
  styles: ReturnType<typeof getStyles>;
}) {
  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.sectionTitle}>{sanitizeText(title)}</Text>
      {summary && <Text style={styles.bodyText}>{sanitizeText(summary)}</Text>}
    </Page>
  );
}

function NextStepsPage({ styles, rtl }: { styles: ReturnType<typeof getStyles>; rtl: boolean }) {
  const steps = rtl
    ? [
        "١. راجع ملف العميل المثالي (ICP) وتحقق منه مع فريق المبيعات",
        "٢. حدد أفضل ٢٠ حسابًا مستهدفًا وفقًا لمعايير المستوى الأول",
        "٣. استخدم قوالب التواصل لبناء تسلسلات الاتصال",
        "٤. استخدم معايير التشابه لبناء قائمة الأهداف",
        "٥. اطلب عملاء محتملين مستهدفين عبر لوحة تحكم AVORA (إذا تم اجتياز البوابة الصارمة)",
      ]
    : [
        "1. Review your ICP and validate with your sales team",
        "2. Map your top 20 target accounts against Tier 1 criteria",
        "3. Use outreach templates to build your sequences",
        "4. Use lookalike criteria to build your target list",
        "5. Request targeted leads via AVORA dashboard (if strict gate passed)",
      ];

  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.sectionTitle}>
        {rtl ? "الخطوات التالية" : "Next Steps"}
      </Text>
      {steps.map((step, i) => (
        <Text key={i} style={styles.stepText}>{step}</Text>
      ))}
    </Page>
  );
}

function ReportDocument({ report }: { report: ReportData }) {
  const rtl = isArabic(report.language);
  const styles = getStyles(report.language);

  const sections = [
    {
      title: rtl ? "ملف العميل المثالي (ICP)" : "Ideal Customer Profile (ICP)",
      data: report.icp,
    },
    {
      title: rtl ? "خريطة DMU" : "DMU Map",
      data: report.dmu,
    },
    {
      title: rtl ? "استراتيجية ABM" : "ABM Strategy",
      data: report.abm,
    },
    {
      title: rtl ? "خطة التواصل" : "Outreach Playbook",
      data: report.outreach,
    },
    {
      title: rtl ? "معايير التشابه" : "Lookalike Criteria",
      data: report.lookalike,
    },
  ];

  return (
    <Document>
      <CoverPage report={report} styles={styles} />
      {sections.map(({ title, data }, i) => (
        <SectionPage
          key={i}
          title={title}
          summary={data?.summary}
          styles={styles}
        />
      ))}
      <NextStepsPage styles={styles} rtl={rtl} />
    </Document>
  );
}

export async function generateReportPdf(report: ReportData): Promise<Buffer> {
  return renderToBuffer(<ReportDocument report={report} />);
}
