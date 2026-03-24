"use client";
import { useRef, useEffect, useState } from "react";

/* ── ViewBox constants (viewBox="0 0 148 48") ─────────────── */
const VBW = 148;   // viewBox width
const VBH = 48;    // viewBox height
const FS  = 44;    // font-size in viewBox units (SVG coordinate space)
const TX  = 2;     // text x-origin
const TY  = 42;    // text baseline-y

/*
 * Nunito ExtraBold x-height ratio ≈ 0.715 em.
 * Vertical center of lowercase letters = baseline − (FS × xhRatio / 2)
 * This is stable regardless of which font variant is rendered.
 */
const XH_RATIO = 0.715;
const DOT_CY   = TY - (FS * XH_RATIO) / 2; // ≈ 26.3
const DOT_R    = 6;                           // safe fit inside Nunito "o" counter

/* SSR-safe fallback — approximate x-center of "o" at index 2 */
const FALLBACK_CX = 69;

interface AvoraLogoProps {
  variant?: "dark" | "light";
  height?: number;
  showTagline?: boolean;
  /* Legacy props kept for backwards-compat */
  size?: number;
  showText?: boolean;
  textColor?: string;
  taglineColor?: string;
}

/**
 * AVORA wordmark logo.
 *
 * Renders "avora" in Nunito ExtraBold with a coral (#FF5252) dot
 * precisely centered inside the counter of the letter "o".
 *
 * The dot x-position is measured at runtime via SVGTextElement.getExtentOfChar(2)
 * (index 2 = "o" in "avora") so it is pixel-accurate regardless of browser or OS.
 *
 * variant="dark"  → teal text  + coral dot  (light backgrounds)
 * variant="light" → white text + coral dot  (dark / teal backgrounds)
 */
export function AvoraLogo({
  variant = "dark",
  height = 32,
  showTagline = false,
  size,
  textColor,
  taglineColor,
}: AvoraLogoProps) {
  const textRef = useRef<SVGTextElement>(null);
  const [dotCx, setDotCx] = useState(FALLBACK_CX);

  /* Resolve variant from legacy textColor prop */
  const isLight =
    variant === "light" ||
    textColor === "white" ||
    textColor === "#FFFFFF" ||
    textColor === "#fff";

  const wordColor = isLight ? "#FFFFFF" : "#1A6B6B";
  const tagColor  = taglineColor ?? (isLight ? "rgba(255,255,255,0.45)" : "#4A6B6B");

  /* Resolve rendered size */
  const h    = size != null ? Math.round(size * 0.8) : height;
  const svgW = Math.round((h / VBH) * VBW);

  useEffect(() => {
    const measure = () => {
      const el = textRef.current;
      if (!el) return;
      try {
        /*
         * getExtentOfChar(2) returns the bounding rect of the "o" character
         * (index 2 in "avora") in SVG user-unit (= viewBox) coordinates.
         * We use its x + width/2 as the exact horizontal centre.
         */
        const ext = el.getExtentOfChar(2);
        if (ext && ext.width > 0) {
          setDotCx(ext.x + ext.width / 2);
        }
      } catch {
        /* keep fallback */
      }
    };

    /* Measure immediately (font may already be cached) */
    measure();

    /* Re-measure once all fonts are confirmed loaded */
    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(measure);
    }
  }, []);

  return (
    <div style={{ display: "inline-flex", flexDirection: "column", gap: 2 }}>
      <svg
        viewBox={`0 0 ${VBW} ${VBH}`}
        width={svgW}
        height={h}
        xmlns="http://www.w3.org/2000/svg"
        aria-label="AVORA"
        role="img"
        style={{ display: "block", overflow: "visible" }}
      >
        {/* Wordmark */}
        <text
          ref={textRef}
          x={TX}
          y={TY}
          fontFamily="'Nunito', 'Poppins', sans-serif"
          fontWeight="800"
          fontSize={FS}
          fill={wordColor}
          style={{ fontFamily: "'Nunito', 'Poppins', sans-serif" }}
        >
          avora
        </text>

        {/*
          Coral dot — x measured at runtime, y from Nunito x-height metrics.
          Radius (6 vb-units) fits safely inside the Nunito ExtraBold "o" counter.
        */}
        <circle cx={dotCx} cy={DOT_CY} r={DOT_R} fill="#FF5252" />
      </svg>

      {showTagline && (
        <span
          style={{
            display: "block",
            fontSize: Math.max(9, Math.round(h * 0.28)),
            color: tagColor,
            fontFamily: "'Nunito', 'Inter', sans-serif",
            fontWeight: 600,
            letterSpacing: "0.06em",
            paddingLeft: TX,
          }}
        >
          by Enigma Sales
        </span>
      )}
    </div>
  );
}
