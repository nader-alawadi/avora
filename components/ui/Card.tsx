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
          ? "glass rounded-2xl shadow-md border-white/50"
          : "bg-white rounded-2xl border border-gray-100 shadow-sm",
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
    teal: "bg-[#DBEAFE] text-[#2563EB]",
    coral: "bg-[#EDE9FE] text-[#7C3AED]",
    gray: "bg-gray-100 text-gray-600",
    green: "bg-[#D1FAE5] text-[#059669]",
    yellow: "bg-yellow-100 text-yellow-700",
  };

  return (
    <Card hover className="flex items-start gap-4">
      {icon && (
        <div className={clsx("p-3 rounded-xl flex-shrink-0", colors[color])}>
          {icon}
        </div>
      )}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{title}</p>
        <p className="text-2xl font-extrabold text-[#1E293B] mt-1">{value}</p>
        {subtitle && (
          <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
        )}
      </div>
    </Card>
  );
}
