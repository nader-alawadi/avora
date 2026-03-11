"use client";

import { GTMentorLogo, GTMentorIcon } from "@/components/ui/GTMentorLogo";

/* ━━━ DESIGN TOKENS ━━━ */
const colors = {
  primary: {
    "Midnight Ink": "#0F1117",
    "Deep Slate": "#1C1F2E",
    "Steel Blue": "#2A2F45",
  },
  accent: {
    "GTM Blue": "#2563EB",
    "GTM Blue Light": "#3B82F6",
    "GTM Blue Pale": "#EFF6FF",
  },
  neutrals: {
    White: "#FFFFFF",
    "Soft White": "#F1F5F9",
    Muted: "#64748B",
    "Dark Muted": "#334155",
  },
  semantic: {
    Success: "#059669",
    Warning: "#D97706",
    Error: "#DC2626",
  },
};

const typography = [
  { name: "Display", size: 56, weight: 700, tracking: -1, ar: "عنوان رئيسي", en: "Display Heading" },
  { name: "H1", size: 40, weight: 600, tracking: -0.5, ar: "العنوان الأول", en: "Primary Heading" },
  { name: "H2", size: 32, weight: 600, tracking: -0.25, ar: "العنوان الثاني", en: "Section Heading" },
  { name: "H3", size: 24, weight: 600, tracking: 0, ar: "عنوان فرعي", en: "Subsection Heading" },
  { name: "H4", size: 20, weight: 500, tracking: 0, ar: "عنوان صغير", en: "Minor Heading" },
  { name: "Body L", size: 18, weight: 400, tracking: 0.1, ar: "نص المحتوى الكبير يستخدم للفقرات الرئيسية", en: "Large body text used for primary content paragraphs" },
  { name: "Body M", size: 16, weight: 400, tracking: 0.1, ar: "نص المحتوى المتوسط يستخدم في معظم الواجهة", en: "Medium body text used across most of the interface" },
  { name: "Body S", size: 14, weight: 400, tracking: 0.2, ar: "نص صغير للمعلومات الثانوية", en: "Small body text for secondary information" },
  { name: "Caption", size: 12, weight: 400, tracking: 0.3, ar: "تعليق توضيحي", en: "Caption or helper text" },
  { name: "Label", size: 11, weight: 600, tracking: 0.5, ar: "تسمية", en: "FIELD LABEL", uppercase: true },
];

const levels = [
  { level: 1, name: "SDR Foundation", color: "#64748B" },
  { level: 2, name: "AE Builder", color: "#059669" },
  { level: 3, name: "Pipeline Pro", color: "#2563EB" },
  { level: 4, name: "GTM Strategist", color: "#D97706" },
  { level: 5, name: "Revenue Consultant", color: "#7C3AED" },
];

const progressSteps = [0, 34, 67, 92, 100];

/* ━━━ SECTION HEADER ━━━ */
function SectionHeader({ number, title, subtitle }: { number: number; title: string; subtitle: string }) {
  return (
    <div style={{ marginBottom: 48 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <span
          style={{
            background: "#2563EB",
            color: "#fff",
            width: 32,
            height: 32,
            borderRadius: 8,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          {number}
        </span>
        <h2 style={{ fontSize: 32, fontWeight: 600, letterSpacing: -0.25, margin: 0, color: "#0F1117" }}>
          {title}
        </h2>
      </div>
      <p style={{ fontSize: 16, color: "#64748B", margin: 0, paddingLeft: 44 }}>{subtitle}</p>
    </div>
  );
}

/* ━━━ COLOR SWATCH ━━━ */
function ColorSwatch({ name, hex, dark }: { name: string; hex: string; dark?: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div
        style={{
          width: "100%",
          paddingTop: "66%",
          borderRadius: 12,
          background: hex,
          border: dark ? "none" : "1px solid #E2E8F0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
        }}
      />
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#0F1117" }}>{name}</div>
        <div style={{ fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", color: "#64748B" }}>{hex}</div>
      </div>
    </div>
  );
}

/* ━━━ PAGE ━━━ */
export default function BrandGuidePage() {
  return (
    <div
      style={{
        fontFamily: "'IBM Plex Sans', 'IBM Plex Sans Arabic', sans-serif",
        background: "#FFFFFF",
        minHeight: "100vh",
      }}
    >
      {/* Google Fonts */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,100;0,300;0,400;0,500;0,600;0,700;1,400&family=IBM+Plex+Sans+Arabic:wght@100;300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap"
        rel="stylesheet"
      />

      {/* ━━━ HERO ━━━ */}
      <section
        style={{
          background: "#0F1117",
          padding: "80px 80px 64px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle grid pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(37,99,235,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.03) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div style={{ position: "relative", maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ marginBottom: 32 }}>
            <GTMentorLogo variant="dark-bg" size="xl" showSubBrand showPoweredBy />
          </div>
          <h1
            style={{
              fontSize: 48,
              fontWeight: 600,
              color: "#FFFFFF",
              letterSpacing: -0.5,
              margin: 0,
              marginTop: 32,
            }}
          >
            Visual Identity System
          </h1>
          <p style={{ fontSize: 18, color: "#94A3B8", marginTop: 12, maxWidth: 640 }}>
            Complete brand guide for GTMentor Platform — a professional B2B Sales & GTM
            mentorship platform for the Arab world, founded by Nader Al-Awadi.
          </p>
          <div
            style={{
              display: "flex",
              gap: 8,
              marginTop: 32,
              fontSize: 12,
              fontWeight: 500,
              color: "#64748B",
            }}
          >
            {["Logo System", "Color Palette", "Typography", "UI Components", "Brand in Use"].map(
              (item, i) => (
                <a
                  key={item}
                  href={`#section-${i + 1}`}
                  style={{
                    padding: "6px 16px",
                    borderRadius: 99,
                    border: "1px solid #2A2F45",
                    color: "#94A3B8",
                    textDecoration: "none",
                    transition: "all 0.15s",
                  }}
                >
                  {item}
                </a>
              )
            )}
          </div>
        </div>
      </section>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "64px 80px" }}>
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {/* PAGE 1 — LOGO SYSTEM                   */}
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section id="section-1" style={{ marginBottom: 96 }}>
          <SectionHeader
            number={1}
            title="Logo System"
            subtitle="Wordmark, sub-brand, and all exported variants"
          />

          {/* Logo variants grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 24,
              marginBottom: 48,
            }}
          >
            {/* Dark background */}
            <div
              style={{
                background: "#0F1117",
                borderRadius: 16,
                padding: 48,
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                justifyContent: "center",
                minHeight: 220,
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 600, color: "#64748B", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 16 }}>
                Dark Background
              </div>
              <GTMentorLogo variant="dark-bg" size="lg" showSubBrand showPoweredBy />
            </div>

            {/* Light background */}
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: 16,
                padding: 48,
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                justifyContent: "center",
                minHeight: 220,
                border: "1px solid #E2E8F0",
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 600, color: "#64748B", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 16 }}>
                Light Background
              </div>
              <GTMentorLogo variant="light-bg" size="lg" showSubBrand showPoweredBy />
            </div>

            {/* Mono black */}
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: 16,
                padding: 48,
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                justifyContent: "center",
                minHeight: 180,
                border: "1px solid #E2E8F0",
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 600, color: "#64748B", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 16 }}>
                Monochrome Black
              </div>
              <GTMentorLogo variant="mono-black" size="lg" showSubBrand />
            </div>

            {/* Mono white */}
            <div
              style={{
                background: "#0F1117",
                borderRadius: 16,
                padding: 48,
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                justifyContent: "center",
                minHeight: 180,
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 600, color: "#64748B", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 16 }}>
                Monochrome White
              </div>
              <GTMentorLogo variant="mono-white" size="lg" showSubBrand />
            </div>
          </div>

          {/* Favicon / Icon */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#64748B", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 16 }}>
              Favicon / App Icon
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
              <GTMentorIcon size={64} />
              <GTMentorIcon size={48} />
              <GTMentorIcon size={32} />
              <GTMentorIcon size={24} />
              <GTMentorIcon size={16} />
            </div>
          </div>

          {/* Logo construction note */}
          <div
            style={{
              background: "#EFF6FF",
              borderRadius: 12,
              padding: 24,
              border: "1px solid rgba(37,99,235,0.1)",
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 600, color: "#2563EB", marginBottom: 8 }}>
              Logo Construction Rules
            </div>
            <ul style={{ fontSize: 14, color: "#334155", margin: 0, paddingLeft: 20, lineHeight: 1.8 }}>
              <li>Letters <strong>G</strong>, <strong>M</strong>, and <strong>t</strong> are colored in GTM Blue (#2563EB)</li>
              <li>Remaining letters (<strong>T</strong>, <strong>e</strong>, <strong>n</strong>, <strong>o</strong>, <strong>r</strong>) use the neutral color based on background</li>
              <li>Font: IBM Plex Sans Bold, size 32px, tracking -0.5px</li>
              <li>&quot;Platform&quot; sub-brand: IBM Plex Sans Light, 14px, #64748B, 6px below wordmark</li>
              <li>Minimum clear space: 1x height of the letter &quot;G&quot; on all sides</li>
            </ul>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {/* PAGE 2 — COLOR PALETTE                 */}
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section id="section-2" style={{ marginBottom: 96 }}>
          <SectionHeader
            number={2}
            title="Color Palette"
            subtitle='The "Calm Authority" color system — minimal, intentional, professional'
          />

          {Object.entries(colors).map(([group, palette]) => (
            <div key={group} style={{ marginBottom: 48 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#64748B",
                  letterSpacing: 0.5,
                  textTransform: "uppercase",
                  marginBottom: 16,
                }}
              >
                {group === "primary"
                  ? "Primary Palette"
                  : group === "accent"
                    ? "Accent — One Color Only"
                    : group === "neutrals"
                      ? "Neutrals"
                      : "Semantic"}
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${Object.keys(palette).length}, 1fr)`,
                  gap: 16,
                }}
              >
                {Object.entries(palette).map(([name, hex]) => (
                  <ColorSwatch
                    key={name}
                    name={name}
                    hex={hex}
                    dark={["#0F1117", "#1C1F2E", "#2A2F45", "#334155"].includes(hex)}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Usage guidelines */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 16,
              marginTop: 16,
            }}
          >
            <div style={{ background: "#F8FAFC", borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#0F1117", marginBottom: 4 }}>Backgrounds</div>
              <div style={{ fontSize: 13, color: "#64748B" }}>Use Midnight Ink for dark mode, White for light. Never use accent colors as full backgrounds.</div>
            </div>
            <div style={{ background: "#F8FAFC", borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#0F1117", marginBottom: 4 }}>Accent Usage</div>
              <div style={{ fontSize: 13, color: "#64748B" }}>GTM Blue is the only accent. Use for CTAs, active states, and links. Never use more than one accent color.</div>
            </div>
            <div style={{ background: "#F8FAFC", borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#0F1117", marginBottom: 4 }}>Semantic Colors</div>
              <div style={{ fontSize: 13, color: "#64748B" }}>Reserve semantic colors strictly for status communication. Never use them decoratively.</div>
            </div>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {/* PAGE 3 — TYPOGRAPHY                    */}
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section id="section-3" style={{ marginBottom: 96 }}>
          <SectionHeader
            number={3}
            title="Typography Scale"
            subtitle="IBM Plex Sans (English) + IBM Plex Sans Arabic — professional, tech-forward, globally legible"
          />

          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {typography.map((t) => (
              <div
                key={t.name}
                style={{
                  display: "grid",
                  gridTemplateColumns: "140px 1fr 1fr",
                  gap: 32,
                  padding: "20px 0",
                  borderBottom: "1px solid #F1F5F9",
                  alignItems: "baseline",
                }}
              >
                {/* Meta */}
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#0F1117" }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: "#64748B", fontFamily: "'IBM Plex Mono', monospace" }}>
                    {t.size}px / {t.weight} / {t.tracking}px
                  </div>
                </div>
                {/* English */}
                <div
                  style={{
                    fontSize: t.size > 40 ? Math.min(t.size, 48) : t.size,
                    fontWeight: t.weight,
                    letterSpacing: t.tracking,
                    color: "#0F1117",
                    lineHeight: 1.3,
                    textTransform: t.uppercase ? "uppercase" : undefined,
                    fontFamily: "'IBM Plex Sans', sans-serif",
                  }}
                >
                  {t.en}
                </div>
                {/* Arabic */}
                <div
                  dir="rtl"
                  style={{
                    fontSize: t.size > 40 ? Math.min(t.size, 48) : t.size,
                    fontWeight: t.weight,
                    letterSpacing: t.tracking,
                    color: "#0F1117",
                    lineHeight: 1.4,
                    textTransform: t.uppercase ? "uppercase" : undefined,
                    fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                    textAlign: "right",
                  }}
                >
                  {t.ar}
                </div>
              </div>
            ))}
          </div>

          {/* Font info note */}
          <div
            style={{
              marginTop: 32,
              background: "#F8FAFC",
              borderRadius: 12,
              padding: 24,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 32,
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#0F1117", marginBottom: 8 }}>
                Why IBM Plex?
              </div>
              <ul style={{ fontSize: 13, color: "#64748B", margin: 0, paddingLeft: 18, lineHeight: 1.8 }}>
                <li>Designed for professional & tech contexts</li>
                <li>Excellent Arabic version with full weight support</li>
                <li>Used by IBM, Linear, Notion</li>
                <li>Distinctive but not exotic</li>
              </ul>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#0F1117", marginBottom: 8 }}>
                Weight Usage
              </div>
              <ul style={{ fontSize: 13, color: "#64748B", margin: 0, paddingLeft: 18, lineHeight: 1.8 }}>
                <li><strong>Bold (700)</strong> — Display, logos</li>
                <li><strong>SemiBold (600)</strong> — Headings, labels</li>
                <li><strong>Medium (500)</strong> — H4, emphasis</li>
                <li><strong>Regular (400)</strong> — Body copy</li>
                <li><strong>Light (300)</strong> — Sub-brand text</li>
              </ul>
            </div>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {/* PAGE 4 — UI COMPONENTS                 */}
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section id="section-4" style={{ marginBottom: 96 }}>
          <SectionHeader
            number={4}
            title="UI Components"
            subtitle="Core interactive elements in dark and light themes"
          />

          {/* ── BUTTONS ── */}
          <div style={{ marginBottom: 48 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#64748B", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 16 }}>
              Buttons
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              {/* Dark theme buttons */}
              <div style={{ background: "#0F1117", borderRadius: 16, padding: 32 }}>
                <div style={{ fontSize: 12, color: "#64748B", marginBottom: 20, fontWeight: 500 }}>Dark Theme</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                  <button
                    style={{
                      background: "#2563EB",
                      color: "#fff",
                      border: "none",
                      borderRadius: 8,
                      padding: "12px 24px",
                      fontSize: 14,
                      fontWeight: 600,
                      fontFamily: "'IBM Plex Sans', sans-serif",
                      cursor: "pointer",
                    }}
                  >
                    Primary
                  </button>
                  <button
                    style={{
                      background: "transparent",
                      color: "#2563EB",
                      border: "1.5px solid #2563EB",
                      borderRadius: 8,
                      padding: "12px 24px",
                      fontSize: 14,
                      fontWeight: 600,
                      fontFamily: "'IBM Plex Sans', sans-serif",
                      cursor: "pointer",
                    }}
                  >
                    Secondary
                  </button>
                  <button
                    style={{
                      background: "transparent",
                      color: "#64748B",
                      border: "none",
                      borderRadius: 8,
                      padding: "12px 24px",
                      fontSize: 14,
                      fontWeight: 600,
                      fontFamily: "'IBM Plex Sans', sans-serif",
                      cursor: "pointer",
                    }}
                  >
                    Ghost
                  </button>
                  <button
                    style={{
                      background: "#DC2626",
                      color: "#fff",
                      border: "none",
                      borderRadius: 8,
                      padding: "12px 24px",
                      fontSize: 14,
                      fontWeight: 600,
                      fontFamily: "'IBM Plex Sans', sans-serif",
                      cursor: "pointer",
                    }}
                  >
                    Destructive
                  </button>
                </div>
              </div>

              {/* Light theme buttons */}
              <div style={{ background: "#FFFFFF", borderRadius: 16, padding: 32, border: "1px solid #E2E8F0" }}>
                <div style={{ fontSize: 12, color: "#64748B", marginBottom: 20, fontWeight: 500 }}>Light Theme</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                  <button
                    style={{
                      background: "#2563EB",
                      color: "#fff",
                      border: "none",
                      borderRadius: 8,
                      padding: "12px 24px",
                      fontSize: 14,
                      fontWeight: 600,
                      fontFamily: "'IBM Plex Sans', sans-serif",
                      cursor: "pointer",
                    }}
                  >
                    Primary
                  </button>
                  <button
                    style={{
                      background: "transparent",
                      color: "#2563EB",
                      border: "1.5px solid #2563EB",
                      borderRadius: 8,
                      padding: "12px 24px",
                      fontSize: 14,
                      fontWeight: 600,
                      fontFamily: "'IBM Plex Sans', sans-serif",
                      cursor: "pointer",
                    }}
                  >
                    Secondary
                  </button>
                  <button
                    style={{
                      background: "transparent",
                      color: "#64748B",
                      border: "none",
                      borderRadius: 8,
                      padding: "12px 24px",
                      fontSize: 14,
                      fontWeight: 600,
                      fontFamily: "'IBM Plex Sans', sans-serif",
                      cursor: "pointer",
                    }}
                  >
                    Ghost
                  </button>
                  <button
                    style={{
                      background: "#DC2626",
                      color: "#fff",
                      border: "none",
                      borderRadius: 8,
                      padding: "12px 24px",
                      fontSize: 14,
                      fontWeight: 600,
                      fontFamily: "'IBM Plex Sans', sans-serif",
                      cursor: "pointer",
                    }}
                  >
                    Destructive
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── LEVEL BADGES ── */}
          <div style={{ marginBottom: 48 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#64748B", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 16 }}>
              Level Badges
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              {/* Dark */}
              <div style={{ background: "#0F1117", borderRadius: 16, padding: 32 }}>
                <div style={{ fontSize: 12, color: "#64748B", marginBottom: 20, fontWeight: 500 }}>Dark Theme</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {levels.map((l) => (
                    <div
                      key={l.level}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "6px 14px",
                        borderRadius: 99,
                        background: `${l.color}18`,
                        width: "fit-content",
                        fontFamily: "'IBM Plex Sans', sans-serif",
                      }}
                    >
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: l.color,
                        }}
                      />
                      <span style={{ fontSize: 13, fontWeight: 600, color: l.color }}>
                        Level {l.level}
                      </span>
                      <span style={{ fontSize: 13, color: "#94A3B8" }}>{l.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Light */}
              <div style={{ background: "#FFFFFF", borderRadius: 16, padding: 32, border: "1px solid #E2E8F0" }}>
                <div style={{ fontSize: 12, color: "#64748B", marginBottom: 20, fontWeight: 500 }}>Light Theme</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {levels.map((l) => (
                    <div
                      key={l.level}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "6px 14px",
                        borderRadius: 99,
                        background: `${l.color}12`,
                        width: "fit-content",
                        fontFamily: "'IBM Plex Sans', sans-serif",
                      }}
                    >
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: l.color,
                        }}
                      />
                      <span style={{ fontSize: 13, fontWeight: 600, color: l.color }}>
                        Level {l.level}
                      </span>
                      <span style={{ fontSize: 13, color: "#334155" }}>{l.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── PROGRESS BAR ── */}
          <div style={{ marginBottom: 48 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#64748B", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 16 }}>
              Progress Bar
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              <div style={{ background: "#0F1117", borderRadius: 16, padding: 32 }}>
                <div style={{ fontSize: 12, color: "#64748B", marginBottom: 20, fontWeight: 500 }}>Dark Theme</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  {progressSteps.map((p) => (
                    <div key={p}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 12, color: "#94A3B8" }}>{p}%</span>
                      </div>
                      <div
                        style={{
                          height: 6,
                          borderRadius: 99,
                          background: "#2A2F45",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${p}%`,
                            borderRadius: 99,
                            background: "linear-gradient(90deg, #2563EB, #3B82F6)",
                            transition: "width 0.5s ease",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ background: "#FFFFFF", borderRadius: 16, padding: 32, border: "1px solid #E2E8F0" }}>
                <div style={{ fontSize: 12, color: "#64748B", marginBottom: 20, fontWeight: 500 }}>Light Theme</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  {progressSteps.map((p) => (
                    <div key={p}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 12, color: "#64748B" }}>{p}%</span>
                      </div>
                      <div
                        style={{
                          height: 6,
                          borderRadius: 99,
                          background: "#E2E8F0",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${p}%`,
                            borderRadius: 99,
                            background: "linear-gradient(90deg, #2563EB, #3B82F6)",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── CARDS ── */}
          <div style={{ marginBottom: 48 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#64748B", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 16 }}>
              Card Component
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              {/* Dark card */}
              <div style={{ background: "#0F1117", borderRadius: 16, padding: 32 }}>
                <div style={{ fontSize: 12, color: "#64748B", marginBottom: 20, fontWeight: 500 }}>Dark Theme</div>
                <div
                  style={{
                    background: "#1C1F2E",
                    border: "1px solid #2A2F45",
                    borderRadius: 12,
                    padding: 24,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
                  }}
                >
                  <div style={{ fontSize: 16, fontWeight: 600, color: "#FFFFFF", marginBottom: 8, fontFamily: "'IBM Plex Sans', sans-serif" }}>
                    Pipeline Health Score
                  </div>
                  <div style={{ fontSize: 32, fontWeight: 700, color: "#2563EB", marginBottom: 4, fontFamily: "'IBM Plex Sans', sans-serif" }}>
                    87%
                  </div>
                  <div style={{ fontSize: 14, color: "#64748B" }}>+12% from last quarter</div>
                </div>
              </div>
              {/* Light card */}
              <div style={{ background: "#FFFFFF", borderRadius: 16, padding: 32, border: "1px solid #E2E8F0" }}>
                <div style={{ fontSize: 12, color: "#64748B", marginBottom: 20, fontWeight: 500 }}>Light Theme</div>
                <div
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #E2E8F0",
                    borderRadius: 12,
                    padding: 24,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
                  }}
                >
                  <div style={{ fontSize: 16, fontWeight: 600, color: "#0F1117", marginBottom: 8, fontFamily: "'IBM Plex Sans', sans-serif" }}>
                    Pipeline Health Score
                  </div>
                  <div style={{ fontSize: 32, fontWeight: 700, color: "#2563EB", marginBottom: 4, fontFamily: "'IBM Plex Sans', sans-serif" }}>
                    87%
                  </div>
                  <div style={{ fontSize: 14, color: "#64748B" }}>+12% from last quarter</div>
                </div>
              </div>
            </div>
          </div>

          {/* ── INPUT FIELDS ── */}
          <div style={{ marginBottom: 48 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#64748B", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 16 }}>
              Input Fields
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              {/* Dark */}
              <div style={{ background: "#0F1117", borderRadius: 16, padding: 32 }}>
                <div style={{ fontSize: 12, color: "#64748B", marginBottom: 20, fontWeight: 500 }}>Dark Theme</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 500, color: "#F1F5F9", display: "block", marginBottom: 6, fontFamily: "'IBM Plex Sans', sans-serif" }}>
                      Company Name
                    </label>
                    <input
                      readOnly
                      placeholder="Enter your company name"
                      style={{
                        width: "100%",
                        background: "#1C1F2E",
                        border: "1px solid #2A2F45",
                        borderRadius: 8,
                        padding: "12px 16px",
                        color: "#FFFFFF",
                        fontSize: 14,
                        outline: "none",
                        fontFamily: "'IBM Plex Sans', sans-serif",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 500, color: "#F1F5F9", display: "block", marginBottom: 6, fontFamily: "'IBM Plex Sans', sans-serif" }}>
                      Email (Focused)
                    </label>
                    <input
                      readOnly
                      defaultValue="nader@enigmasales.io"
                      style={{
                        width: "100%",
                        background: "#1C1F2E",
                        border: "1px solid #2563EB",
                        borderRadius: 8,
                        padding: "12px 16px",
                        color: "#FFFFFF",
                        fontSize: 14,
                        outline: "none",
                        fontFamily: "'IBM Plex Sans', sans-serif",
                        boxShadow: "0 0 0 3px rgba(37,99,235,0.15)",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>
              </div>
              {/* Light */}
              <div style={{ background: "#FFFFFF", borderRadius: 16, padding: 32, border: "1px solid #E2E8F0" }}>
                <div style={{ fontSize: 12, color: "#64748B", marginBottom: 20, fontWeight: 500 }}>Light Theme</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 500, color: "#0F1117", display: "block", marginBottom: 6, fontFamily: "'IBM Plex Sans', sans-serif" }}>
                      Company Name
                    </label>
                    <input
                      readOnly
                      placeholder="Enter your company name"
                      style={{
                        width: "100%",
                        background: "#FFFFFF",
                        border: "1px solid #E2E8F0",
                        borderRadius: 8,
                        padding: "12px 16px",
                        color: "#0F1117",
                        fontSize: 14,
                        outline: "none",
                        fontFamily: "'IBM Plex Sans', sans-serif",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 500, color: "#0F1117", display: "block", marginBottom: 6, fontFamily: "'IBM Plex Sans', sans-serif" }}>
                      Email (Focused)
                    </label>
                    <input
                      readOnly
                      defaultValue="nader@enigmasales.io"
                      style={{
                        width: "100%",
                        background: "#FFFFFF",
                        border: "1px solid #2563EB",
                        borderRadius: 8,
                        padding: "12px 16px",
                        color: "#0F1117",
                        fontSize: 14,
                        outline: "none",
                        fontFamily: "'IBM Plex Sans', sans-serif",
                        boxShadow: "0 0 0 3px rgba(37,99,235,0.15)",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── DESIGN RULES ── */}
          <div
            style={{
              background: "#F8FAFC",
              borderRadius: 12,
              padding: 24,
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 24,
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#0F1117", marginBottom: 8 }}>Border Radius</div>
              <div style={{ fontSize: 13, color: "#64748B", lineHeight: 1.8 }}>
                8px — inputs, buttons<br />
                12px — cards<br />
                16px — modals, sections<br />
                99px — pills, badges
              </div>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#0F1117", marginBottom: 8 }}>Spacing System</div>
              <div style={{ fontSize: 13, color: "#64748B", lineHeight: 1.8 }}>
                4px base unit<br />
                Scale: 4, 8, 12, 16, 24, 32, 48, 64<br />
                Grid: 12-col, 24px gutter<br />
                Desktop margins: 80px
              </div>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#0F1117", marginBottom: 8 }}>Shadows</div>
              <div style={{ fontSize: 13, color: "#64748B", lineHeight: 1.8 }}>
                Subtle, never dramatic<br />
                Cards: 0 1px 3px rgba(0,0,0,0.12)<br />
                No gradients on backgrounds<br />
                Icons: Phosphor (regular weight)
              </div>
            </div>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {/* PAGE 5 — BRAND IN USE (MOCKUPS)        */}
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section id="section-5" style={{ marginBottom: 64 }}>
          <SectionHeader
            number={5}
            title="Brand in Use"
            subtitle="Mockups showing the identity system applied across key surfaces"
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {/* ── Dashboard Card Mockup ── */}
            <div
              style={{
                background: "#0F1117",
                borderRadius: 16,
                padding: 32,
                overflow: "hidden",
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 600, color: "#64748B", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 20 }}>
                Dashboard — Level Progress
              </div>
              <div
                style={{
                  background: "#1C1F2E",
                  borderRadius: 12,
                  padding: 24,
                  border: "1px solid #2A2F45",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 14, color: "#94A3B8", marginBottom: 4, fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>مستواك الحالي</div>
                    <div style={{ fontSize: 20, fontWeight: 600, color: "#FFFFFF", fontFamily: "'IBM Plex Sans', sans-serif" }}>Level 3 — Pipeline Pro</div>
                  </div>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "6px 12px",
                      borderRadius: 99,
                      background: "rgba(37,99,235,0.15)",
                    }}
                  >
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#2563EB" }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#2563EB" }}>Active</span>
                  </div>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: "#64748B" }}>Progress to Level 4</span>
                    <span style={{ fontSize: 12, color: "#F1F5F9", fontWeight: 600 }}>67%</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 99, background: "#2A2F45", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: "67%", borderRadius: 99, background: "linear-gradient(90deg, #2563EB, #3B82F6)" }} />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 16, marginTop: 16 }}>
                  <div style={{ fontSize: 12, color: "#64748B" }}>
                    <span style={{ color: "#059669", fontWeight: 600 }}>8</span> modules completed
                  </div>
                  <div style={{ fontSize: 12, color: "#64748B" }}>
                    <span style={{ color: "#D97706", fontWeight: 600 }}>4</span> in progress
                  </div>
                </div>
              </div>
            </div>

            {/* ── Certificate Mockup ── */}
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: 16,
                padding: 32,
                border: "1px solid #E2E8F0",
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 600, color: "#64748B", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 20 }}>
                Certificate
              </div>
              <div
                style={{
                  border: "2px solid #E2E8F0",
                  borderRadius: 12,
                  padding: 32,
                  textAlign: "center",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Decorative corner */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: 80,
                    height: 80,
                    background: "linear-gradient(135deg, #2563EB 0%, transparent 60%)",
                    opacity: 0.08,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    width: 80,
                    height: 80,
                    background: "linear-gradient(315deg, #2563EB 0%, transparent 60%)",
                    opacity: 0.08,
                  }}
                />

                <div style={{ marginBottom: 8 }}>
                  <GTMentorLogo variant="light-bg" size="sm" />
                </div>
                <div style={{ fontSize: 10, color: "#64748B", marginBottom: 20, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600 }}>
                  Certificate of Completion
                </div>
                <div style={{ fontSize: 11, color: "#64748B", marginBottom: 4 }}>This certifies that</div>
                <div style={{ fontSize: 22, fontWeight: 600, color: "#0F1117", marginBottom: 4, fontFamily: "'IBM Plex Sans', sans-serif" }}>
                  Nader Al-Awadi
                </div>
                <div style={{ fontSize: 11, color: "#64748B", marginBottom: 16 }}>has successfully completed</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: "#2563EB", marginBottom: 16, fontFamily: "'IBM Plex Sans', sans-serif" }}>
                  Level 3 — Pipeline Pro
                </div>
                <div
                  style={{
                    width: 60,
                    height: 1,
                    background: "#E2E8F0",
                    margin: "0 auto 16px",
                  }}
                />
                <div style={{ fontSize: 10, color: "#94A3B8" }}>Powered by Enigmasales.io</div>
              </div>
            </div>

            {/* ── Mobile Onboarding Mockup ── */}
            <div
              style={{
                background: "#F8FAFC",
                borderRadius: 16,
                padding: 32,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <div style={{ width: "100%" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#64748B", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 20 }}>
                  Mobile — Onboarding Assessment
                </div>
                {/* Phone frame */}
                <div
                  style={{
                    width: 280,
                    height: 500,
                    margin: "0 auto",
                    background: "#0F1117",
                    borderRadius: 32,
                    padding: "16px 12px",
                    boxShadow: "0 16px 40px rgba(0,0,0,0.15)",
                    overflow: "hidden",
                  }}
                >
                  {/* Status bar */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "4px 8px 12px",
                      fontSize: 11,
                      color: "#94A3B8",
                      fontWeight: 600,
                    }}
                  >
                    <span>9:41</span>
                    <span>●●●</span>
                  </div>
                  {/* Content */}
                  <div style={{ padding: "0 8px" }}>
                    <GTMentorLogo variant="dark-bg" size="sm" />
                    <div style={{ height: 6, borderRadius: 99, background: "#2A2F45", marginTop: 16, marginBottom: 20, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: "40%", borderRadius: 99, background: "linear-gradient(90deg, #2563EB, #3B82F6)" }} />
                    </div>
                    <div style={{ fontSize: 12, color: "#64748B", marginBottom: 4, fontFamily: "'IBM Plex Sans Arabic', sans-serif" }} dir="rtl">
                      السؤال ٢ من ٥
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: "#FFFFFF", marginBottom: 16, fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.5 }} dir="rtl">
                      ما هو حجم فريق المبيعات في شركتك؟
                    </div>
                    {["١-٥ أشخاص", "٦-١٥ شخص", "١٦-٥٠ شخص", "+٥٠ شخص"].map((opt, i) => (
                      <div
                        key={i}
                        dir="rtl"
                        style={{
                          background: i === 1 ? "rgba(37,99,235,0.12)" : "#1C1F2E",
                          border: i === 1 ? "1px solid #2563EB" : "1px solid #2A2F45",
                          borderRadius: 8,
                          padding: "10px 14px",
                          marginBottom: 8,
                          fontSize: 14,
                          color: i === 1 ? "#FFFFFF" : "#94A3B8",
                          fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                          cursor: "pointer",
                        }}
                      >
                        {opt}
                      </div>
                    ))}
                    <button
                      style={{
                        width: "100%",
                        background: "#2563EB",
                        color: "#fff",
                        border: "none",
                        borderRadius: 8,
                        padding: "12px 0",
                        fontSize: 14,
                        fontWeight: 600,
                        fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                        marginTop: 12,
                        cursor: "pointer",
                      }}
                    >
                      التالي
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ── LinkedIn Share Card ── */}
            <div
              style={{
                background: "#F8FAFC",
                borderRadius: 16,
                padding: 32,
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 600, color: "#64748B", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 20 }}>
                LinkedIn Share Card
              </div>
              <div
                style={{
                  background: "#0F1117",
                  borderRadius: 12,
                  overflow: "hidden",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                  aspectRatio: "1.91 / 1",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: 40,
                  position: "relative",
                }}
              >
                {/* Subtle grid */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage:
                      "linear-gradient(rgba(37,99,235,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.04) 1px, transparent 1px)",
                    backgroundSize: "32px 32px",
                  }}
                />
                <div style={{ position: "relative", textAlign: "center" }}>
                  <div style={{ marginBottom: 16 }}>
                    <GTMentorLogo variant="dark-bg" size="md" />
                  </div>
                  <div style={{ fontSize: 12, color: "#64748B", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 }}>
                    Certification Achieved
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 600, color: "#FFFFFF", marginBottom: 4, fontFamily: "'IBM Plex Sans', sans-serif" }}>
                    Pipeline Pro — Level 3
                  </div>
                  <div style={{ fontSize: 14, color: "#94A3B8" }}>GTM & Sales Mentorship Program</div>
                  <div
                    style={{
                      marginTop: 20,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "6px 14px",
                      borderRadius: 99,
                      background: "rgba(5,150,105,0.15)",
                    }}
                  >
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#059669" }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#059669" }}>Verified Certificate</span>
                  </div>
                </div>
              </div>
              <div style={{ marginTop: 12, fontSize: 12, color: "#94A3B8", textAlign: "center" }}>
                1200 × 628px — LinkedIn OG Image
              </div>
            </div>
          </div>
        </section>

        {/* ━━━ FOOTER ━━━ */}
        <footer
          style={{
            borderTop: "1px solid #F1F5F9",
            paddingTop: 32,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <GTMentorLogo variant="light-bg" size="sm" showPoweredBy />
          <div style={{ fontSize: 12, color: "#94A3B8" }}>
            Brand Identity System v1.0 — Confidential
          </div>
        </footer>
      </div>
    </div>
  );
}
