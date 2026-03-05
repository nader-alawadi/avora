"use client";

interface ConfidenceMeterProps {
  label: string;
  value: number;
  size?: "sm" | "md" | "lg";
}

export function ConfidenceMeter({ label, value, size = "md" }: ConfidenceMeterProps) {
  const color =
    value >= 90
      ? "bg-green-500"
      : value >= 70
      ? "bg-yellow-500"
      : value >= 50
      ? "bg-orange-500"
      : "bg-red-500";

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
        <span className={`text-sm font-bold ${textColor}`}>{value}%</span>
      </div>
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${heights[size]}`}>
        <div
          className={`${heights[size]} ${color} rounded-full transition-all duration-500`}
          style={{ width: `${value}%` }}
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
