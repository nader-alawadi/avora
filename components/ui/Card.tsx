"use client";
import { ReactNode } from "react";
import { clsx } from "clsx";

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg" | "none";
  hover?: boolean;
  glass?: boolean;
}

export function Card({
  children,
  className,
  padding = "md",
  hover = false,
  glass = false,
}: CardProps) {
  const paddings = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <div
      className={clsx(
        glass
          ? "glass rounded-xl shadow-md border-white/50"
          : "bg-white rounded-xl border border-gray-200 shadow-sm",
        paddings[padding],
        hover && "card-hover cursor-default",
        className
      )}
    >
      {children}
    </div>
  );
}

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  color?: "teal" | "coral" | "gray" | "green" | "yellow";
}

export function KpiCard({
  title,
  value,
  subtitle,
  icon,
  color = "teal",
}: KpiCardProps) {
  const colors = {
    teal: "bg-[#1E6663]/10 text-[#1E6663]",
    coral: "bg-[#FF6B63]/10 text-[#FF6B63]",
    gray: "bg-gray-100 text-gray-600",
    green: "bg-green-100 text-green-700",
    yellow: "bg-yellow-100 text-yellow-700",
  };

  return (
    <Card hover className="flex items-start gap-4">
      {icon && (
        <div className={clsx("p-3 rounded-lg flex-shrink-0", colors[color])}>
          {icon}
        </div>
      )}
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-[#1F2A2A] mt-0.5">{value}</p>
        {subtitle && (
          <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
        )}
      </div>
    </Card>
  );
}
