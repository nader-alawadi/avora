interface AvoraLogoProps {
  size?: number;
  showText?: boolean;
  showTagline?: boolean;
  textColor?: string;
  taglineColor?: string;
}

export function AvoraLogo({
  size = 36,
  showText = true,
  showTagline = false,
  textColor = "#1F2A2A",
  taglineColor = "#9ca3af",
}: AvoraLogoProps) {
  return (
    <div className="flex items-center gap-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/avora-logo.svg"
        alt="AVORA"
        width={size}
        height={size}
        style={{ borderRadius: size * 0.22 }}
      />
      {showText && (
        <div>
          <span
            className="font-bold leading-none"
            style={{
              color: textColor,
              fontSize: size * 0.47,
              letterSpacing: "-0.01em",
            }}
          >
            AVORA
          </span>
          {showTagline && (
            <span
              className="block text-[10px] leading-none mt-0.5"
              style={{ color: taglineColor }}
            >
              by Enigma Sales
            </span>
          )}
        </div>
      )}
    </div>
  );
}
