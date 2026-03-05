"use client";
import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-[#1F2A2A]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={clsx(
            "w-full px-3 py-2.5 rounded-lg border text-[#1F2A2A] bg-white",
            "focus:outline-none focus:ring-2 focus:ring-[#1E6663] focus:border-transparent",
            "placeholder:text-gray-400 text-sm transition-colors",
            error
              ? "border-red-400 focus:ring-red-400"
              : "border-gray-300 hover:border-gray-400",
            className
          )}
          {...props}
        />
        {hint && !error && (
          <p className="text-xs text-gray-500">{hint}</p>
        )}
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-[#1F2A2A]">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          rows={4}
          className={clsx(
            "w-full px-3 py-2.5 rounded-lg border text-[#1F2A2A] bg-white",
            "focus:outline-none focus:ring-2 focus:ring-[#1E6663] focus:border-transparent",
            "placeholder:text-gray-400 text-sm transition-colors resize-none",
            error
              ? "border-red-400 focus:ring-red-400"
              : "border-gray-300 hover:border-gray-400",
            className
          )}
          {...props}
        />
        {hint && !error && (
          <p className="text-xs text-gray-500">{hint}</p>
        )}
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
