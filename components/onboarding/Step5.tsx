"use client";
import { useState } from "react";
import { Textarea, Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface StepProps {
  answers: Record<string, string>;
  onSave: (data: Record<string, string>) => Promise<void>;
  language: string;
}

const DMU_ROLES = [
  {
    key: "economicBuyer",
    label: "Economic Buyer",
    icon: "💰",
    hint: "Controls budget. Final financial decision. E.g., CFO, VP Finance, CEO",
    placeholder: "Who controls the budget? What's their main concern? E.g., 'CFO / VP Finance — focused on ROI, TCO, and risk. Wants payback in <12 months.'",
  },
  {
    key: "champion",
    label: "Champion / Sponsor",
    icon: "🏆",
    hint: "Internal advocate who wants your solution to win",
    placeholder: "Who benefits most and advocates internally? E.g., 'Head of Operations — they feel the pain daily and have been pushing for a solution for 2 years.'",
  },
  {
    key: "technicalBuyer",
    label: "Technical Buyer",
    icon: "⚙️",
    hint: "Evaluates technical fit, security, integrations",
    placeholder: "Who evaluates technical suitability? E.g., 'CTO or IT Director — reviews integrations, security, compliance. Their veto can kill the deal.'",
  },
  {
    key: "endUser",
    label: "End User",
    icon: "👤",
    hint: "Daily users of your product",
    placeholder: "Who uses it day-to-day? E.g., 'Sales reps / HR coordinators — adoption depends on them. They care about UX and time savings.'",
  },
  {
    key: "influencer",
    label: "Influencer",
    icon: "💬",
    hint: "Advisor, consultant, or peer who shapes opinions",
    placeholder: "Who influences the decision without being a buyer? E.g., 'Management consultant, industry advisor, or trusted peer who was consulted.'",
  },
];

export function OnboardingStep5({ answers, onSave }: StepProps) {
  const [data, setData] = useState({
    economicBuyer: answers.economicBuyer || "",
    champion: answers.champion || "",
    technicalBuyer: answers.technicalBuyer || "",
    endUser: answers.endUser || "",
    influencer: answers.influencer || "",
    titles: answers.titles || "",
    objections: answers.objections || "",
  });
  const [saving, setSaving] = useState(false);

  const setField = (key: string) => (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) =>
    setData((d) => ({ ...d, [key]: e.target.value }));

  async function handleSave() {
    setSaving(true);
    await onSave(data);
    setSaving(false);
  }

  const filledRoles = DMU_ROLES.filter(
    (r) => data[r.key as keyof typeof data]?.length > 10
  ).length;

  return (
    <div className="space-y-6">
      <div className="bg-[#1E6663]/5 border border-[#1E6663]/20 rounded-lg px-4 py-3">
        <p className="text-sm text-[#1E6663] font-medium">
          🗺️ Map your Decision Making Unit
        </p>
        <p className="text-xs text-gray-600 mt-1">
          Filled {filledRoles}/5 DMU roles. Fill all 5 for maximum DMU confidence.
        </p>
      </div>

      {DMU_ROLES.map((role) => (
        <div key={role.key} className="border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">{role.icon}</span>
            <div>
              <div className="font-semibold text-sm text-[#1F2A2A]">{role.label}</div>
              <div className="text-xs text-gray-500">{role.hint}</div>
            </div>
            {data[role.key as keyof typeof data]?.length > 10 && (
              <span className="ml-auto text-green-500 text-sm">✓</span>
            )}
          </div>
          <Textarea
            value={data[role.key as keyof typeof data] || ""}
            onChange={setField(role.key)}
            placeholder={role.placeholder}
            rows={2}
          />
        </div>
      ))}

      <Input
        label="Common Titles You Target"
        value={data.titles}
        onChange={setField("titles")}
        placeholder="E.g., VP Sales, Head of Revenue, CRO, Commercial Director, Sales Operations Manager"
        hint="Comma-separated job titles"
      />

      <Textarea
        label="Common Objections You Face *"
        value={data.objections}
        onChange={setField("objections")}
        placeholder={`List the top objections you hear. E.g.:
'We already use [competitor] and it works fine'
'We don't have budget right now'
'Our IT team would need to approve this'
'Can we build this in-house instead?'
'We're too small for this solution'`}
        rows={4}
        hint="One objection per line. These shape your outreach messaging."
      />

      <Button onClick={handleSave} loading={saving} variant="secondary" className="w-full">
        Save & Continue
      </Button>
    </div>
  );
}
