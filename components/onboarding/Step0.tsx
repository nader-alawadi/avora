"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";

const TIMEZONES = [
  "UTC", "America/New_York", "America/Los_Angeles", "America/Chicago",
  "Europe/London", "Europe/Paris", "Europe/Berlin", "Asia/Dubai",
  "Asia/Riyadh", "Asia/Kuwait", "Asia/Bahrain", "Africa/Cairo",
  "Asia/Singapore", "Asia/Tokyo", "Australia/Sydney",
];

interface StepProps {
  answers: Record<string, string>;
  onSave: (data: Record<string, string>) => Promise<void>;
  language: string;
}

export function OnboardingStep0({ answers, onSave }: StepProps) {
  const [lang, setLang] = useState(answers.language || "en");
  const [timezone, setTimezone] = useState(answers.timezone || "UTC");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await onSave({ language: lang, timezone });
    setSaving(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-[#1F2A2A] mb-3">
          Preferred Language
        </label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { code: "en", label: "English", flag: "🇬🇧" },
            { code: "ar", label: "العربية", flag: "🇸🇦" },
          ].map((l) => (
            <button
              key={l.code}
              onClick={() => setLang(l.code)}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                lang === l.code
                  ? "border-[#1E6663] bg-[#1E6663]/5 text-[#1E6663]"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <span className="text-2xl">{l.flag}</span>
              <span className="font-semibold">{l.label}</span>
              {lang === l.code && <span className="ml-auto text-[#1E6663]">✓</span>}
            </button>
          ))}
        </div>
        {lang === "ar" && (
          <div className="mt-3 bg-blue-50 text-blue-700 text-sm px-4 py-3 rounded-lg">
            ℹ️ Switching language will regenerate all reports in Arabic (not translate).
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-[#1F2A2A] mb-2">
          Your Timezone
        </label>
        <select
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-[#1F2A2A] text-sm focus:outline-none focus:ring-2 focus:ring-[#1E6663] bg-white"
        >
          {TIMEZONES.map((tz) => (
            <option key={tz} value={tz}>{tz}</option>
          ))}
        </select>
      </div>

      <Button onClick={handleSave} loading={saving} variant="secondary" className="w-full">
        Save Preferences
      </Button>
    </div>
  );
}
