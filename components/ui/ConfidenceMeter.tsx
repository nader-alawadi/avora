"use client";
import { useEffect, useState } from "react";

interface ConfidenceMeterProps {
  label: string;
  value: number;
  size?: "sm" | "md" | "lg";
}

export function ConfidenceMeter({ label, value, size = "md" }: ConfidenceMeterProps) {
  const [animatedWidth, setAnimatedWidth] = useState(0);
  const [displayNum, setDisplayNum] = useState(0);

  useEffect(() => {
    const widthTimer = setTimeout(() => setAnimatedWidth(value), 80);
    return () => clearTimeout(widthTimer);
  }, [value]);

  useEffect(() => {
    let frame: number;
    const start = performance.now();
    const duration = 1100;

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayNum(Math.round(eased * value));
      if (progress < 1) frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  const color =
    value >= 90
      ? "from-green-400 to-green-500"
      : value >= 70
      ? "from-yellow-400 to-yellow-500"
      : value >= 50
      ? "from-orange-400 to-orange-500"
      : "from-red-400 to-red-500";

  const textColor =
    value >= 90
      ? "text-green-600"
      : value >= 70
      ? "text-yellow-600"
      : value >= 50
      ? "text-orange-600"
      : "text-red-600";

  const heights = { sm: "h-1.5", md: "h-2.5", lg: "h-4" };

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className={`text-sm font-bold tabular-nums ${textColor}`}>
          {displayNum}%
        </span>
      </div>
      <div
        className={`w-full bg-gray-200 rounded-full overflow-hidden ${heights[size]}`}
      >
        <div
          className={`${heights[size]} bg-gradient-to-r ${color} rounded-full transition-all duration-1000 ease-out`}
          style={{ width: `${animatedWidth}%` }}
        />
      </div>
      {value < 90 && (
        <p className="text-xs text-gray-500">
          {value >= 70
            ? "Good — need more detail for strict gate"
            : value >= 50
            ? "Building — complete more fields"
            : "Incomplete — fill required sections"}
        </p>
      )}
      {value >= 90 && (
        <p className="text-xs text-green-600">✓ Strict gate passed</p>
      )}
    </div>
  );
}
