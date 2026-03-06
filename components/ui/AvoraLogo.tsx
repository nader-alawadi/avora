interface AvoraLogoProps {
  variant?: "dark" | "light";
  height?: number;
  showTagline?: boolean;
  // Legacy props — kept for backwards compatibility
  size?: number;
  showText?: boolean;
  textColor?: string;
  taglineColor?: string;
}

/**
 * AVORA wordmark logo.
 *
 * Renders the lowercase "avora" wordmark in Nunito ExtraBold with a coral
 * (#FF5252) dot perfectly centered inside the counter of the "o".
 *
 * variant="dark"  → teal text  + coral dot (use on white/light backgrounds)
 * variant="light" → white text + coral dot (use on dark/teal backgrounds)
 */
export function AvoraLogo({
  variant = "dark",
  height = 32,
  showTagline = false,
  // legacy
  size,
  textColor,
  taglineColor,
}: AvoraLogoProps) {
  // Resolve variant from legacy textColor prop
  const isLight =
    variant === "light" ||
    textColor === "white" ||
    textColor === "#FFFFFF" ||
    textColor === "#fff";

  const wordColor = isLight ? "#FFFFFF" : "#1A6B6B";
  const tagColor =
    taglineColor ?? (isLight ? "rgba(255,255,255,0.45)" : "#4A6B6B");

  // height from size (legacy) or height prop
  const h = size != null ? Math.round(size * 0.8) : height;

  // ViewBox: 148 × 48 — tight crop around "avora" at 44px Nunito 800
  // Coral dot cx/cy tuned to center of the "o" counter in Nunito ExtraBold
  const vbW = 148;
  const vbH = 48;
  const svgWidth = Math.round((h / vbH) * vbW);

  return (
    <div style={{ display: "inline-flex", flexDirection: "column", gap: 2 }}>
      <svg
        viewBox={`0 0 ${vbW} ${vbH}`}
        width={svgWidth}
        height={h}
        xmlns="http://www.w3.org/2000/svg"
        aria-label="AVORA"
        role="img"
        style={{ display: "block", overflow: "visible" }}
      >
        {/* Wordmark — Nunito ExtraBold, baseline at y=42 */}
        <text
          x="2"
          y="42"
          fontFamily="'Nunito', 'Poppins', sans-serif"
          fontWeight="800"
          fontSize="44"
          fill={wordColor}
          style={{ fontFamily: "'Nunito', 'Poppins', sans-serif" }}
        >
          avora
        </text>
        {/*
          Coral dot inside the "o" counter.
          Approximate metrics for Nunito 800 at 44px:
            a  ≈ 25px  → cumulative end x ≈ 27
            v  ≈ 27px  → cumulative end x ≈ 54
            o  ≈ 29px  → center_x ≈ 54 + 14.5 + 2(origin) = 70.5
          x-height ≈ 30px → center_y = baseline(42) − 15 = 27
          Counter stroke ≈ 9px → safe dot radius = 6
        */}
        <circle cx="70" cy="27" r="6" fill="#FF5252" />
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
            paddingLeft: 2,
          }}
        >
          by Enigma Sales
        </span>
      )}
    </div>
  );
}
