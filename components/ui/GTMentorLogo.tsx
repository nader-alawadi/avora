"use client";
import { clsx } from "clsx";

interface GTMentorLogoProps {
  variant?: "dark-bg" | "light-bg" | "mono-black" | "mono-white";
  size?: "sm" | "md" | "lg" | "xl";
  showSubBrand?: boolean;
  showPoweredBy?: boolean;
  className?: string;
}

const GTM_BLUE = "#2563EB";

const sizes = {
  sm: { logo: "text-xl", sub: "text-[10px]", powered: "text-[8px]", gap: "gap-0.5" },
  md: { logo: "text-[32px]", sub: "text-[14px]", powered: "text-[10px]", gap: "gap-1" },
  lg: { logo: "text-[48px]", sub: "text-[18px]", powered: "text-[12px]", gap: "gap-1.5" },
  xl: { logo: "text-[64px]", sub: "text-[22px]", powered: "text-[14px]", gap: "gap-2" },
};

export function GTMentorLogo({
  variant = "dark-bg",
  size = "md",
  showSubBrand = false,
  showPoweredBy = false,
  className,
}: GTMentorLogoProps) {
  const s = sizes[size];

  const getLetterColor = (isGTM: boolean) => {
    if (variant === "mono-black") return "#0F1117";
    if (variant === "mono-white") return "#FFFFFF";
    if (isGTM) return GTM_BLUE;
    return variant === "dark-bg" ? "#FFFFFF" : "#0F1117";
  };

  const neutralColor = getLetterColor(false);
  const blueColor = getLetterColor(true);

  const subColor =
    variant === "mono-black" || variant === "light-bg" ? "#64748B" : "#94A3B8";

  return (
    <div className={clsx("flex flex-col", s.gap, className)}>
      <div
        className={clsx(s.logo, "font-bold leading-none")}
        style={{ letterSpacing: "-0.5px", fontFamily: "'IBM Plex Sans', sans-serif" }}
      >
        <span style={{ color: blueColor }}>G</span>
        <span style={{ color: neutralColor }}>T</span>
        <span style={{ color: blueColor }}>M</span>
        <span style={{ color: neutralColor }}>e</span>
        <span style={{ color: neutralColor }}>n</span>
        <span style={{ color: blueColor }}>t</span>
        <span style={{ color: neutralColor }}>o</span>
        <span style={{ color: neutralColor }}>r</span>
      </div>
      {showSubBrand && (
        <span
          className={clsx(s.sub, "font-light leading-none")}
          style={{ color: subColor, fontFamily: "'IBM Plex Sans', sans-serif" }}
        >
          Platform
        </span>
      )}
      {showPoweredBy && (
        <span
          className={clsx(s.powered, "leading-none mt-1")}
          style={{ color: subColor, fontFamily: "'IBM Plex Sans', sans-serif" }}
        >
          Powered by Enigmasales.io
        </span>
      )}
    </div>
  );
}

/** Favicon/icon version — "GT" in a rounded square */
export function GTMentorIcon({
  size = 40,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={clsx("inline-flex items-center justify-center", className)}
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.22,
        background: "#0F1117",
        fontFamily: "'IBM Plex Sans', sans-serif",
        fontWeight: 700,
        fontSize: size * 0.42,
        letterSpacing: "-0.5px",
        lineHeight: 1,
      }}
    >
      <span style={{ color: GTM_BLUE }}>G</span>
      <span style={{ color: "#FFFFFF" }}>T</span>
    </div>
  );
}
