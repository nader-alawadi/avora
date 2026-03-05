"use client";
import { ButtonHTMLAttributes, ReactNode } from "react";
import { clsx } from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none hover:scale-[1.02] active:scale-[0.97]";

  const variants = {
    primary:
      "bg-[#FF6B63] hover:bg-[#e55d55] text-white focus:ring-[#FF6B63] shadow-sm hover:shadow-[0_4px_12px_rgba(255,107,99,0.35)]",
    secondary:
      "bg-[#1E6663] hover:bg-[#175553] text-white focus:ring-[#1E6663] shadow-sm hover:shadow-[0_4px_12px_rgba(30,102,99,0.35)]",
    danger:
      "bg-red-600 hover:bg-red-700 text-white focus:ring-red-600 shadow-sm",
    ghost:
      "bg-transparent hover:bg-gray-100 text-[#1F2A2A] focus:ring-gray-300",
    outline:
      "border-2 border-[#1E6663] text-[#1E6663] hover:bg-[#1E6663] hover:text-white focus:ring-[#1E6663]",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      className={clsx(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
