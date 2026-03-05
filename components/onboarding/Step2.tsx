"use client";
import { useState } from "react";
import { Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface StepProps {
  answers: Record<string, string>;
  onSave: (data: Record<string, string>) => Promise<void>;
  language: string;
}

export function OnboardingStep2({ answers, onSave }: StepProps) {
  const [data, setData] = useState({
    bestCustomer1: answers.bestCustomer1 || "",
    bestCustomer2: answers.bestCustomer2 || "",
    lostDeal: answers.lostDeal || "",
    lostDealReason: answers.lostDealReason || "",
  });
  const [saving, setSaving] = useState(false);

  const set = (key: string) => (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    setData((d) => ({ ...d, [key]: e.target.value }));

  async function handleSave() {
    setSaving(true);
    await onSave(data);
    setSaving(false);
  }

  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
        <p className="text-sm text-amber-800 font-medium">
          ⚡ This step is critical for reaching 90%+ confidence
        </p>
        <p className="text-xs text-amber-700 mt-1">
          Specific customer examples are the most valuable input for your ICP.
          Names/companies can be anonymized.
        </p>
      </div>

      <Textarea
        label="Best Customer Example #1 *"
        value={data.bestCustomer1}
        onChange={set("bestCustomer1")}
        placeholder="Describe your best customer in detail (anonymized OK): industry, company size, role of buyer, what problem they had, why they chose you, what value they got. E.g., 'A 200-person logistics company in Dubai, COO was the buyer, they struggled with manual routing causing 20% delivery delays, chose us over Excel, reduced delays by 35% in 60 days.'"
        rows={4}
        hint="More detail = higher confidence. Minimum 30 characters required."
      />

      <Textarea
        label="Best Customer Example #2 *"
        value={data.bestCustomer2}
        onChange={set("bestCustomer2")}
        placeholder="Second best customer. Similar format — industry, size, buyer role, problem, outcome achieved."
        rows={4}
      />

      <div className="border-t border-gray-100 pt-6">
        <h3 className="font-semibold text-[#1F2A2A] mb-4">Lost Deal Analysis</h3>
        <Textarea
          label="Describe a deal you lost *"
          value={data.lostDeal}
          onChange={set("lostDeal")}
          placeholder="Describe the prospect: company type, size, who was involved, how far the deal got."
          rows={2}
        />
        <div className="mt-4">
          <Textarea
            label="Why did you lose it?"
            value={data.lostDealReason}
            onChange={set("lostDealReason")}
            placeholder="Why did they not buy? Price? Competitor? No budget? No urgency? Wrong fit? Be specific — this shapes your disqualifiers."
            rows={2}
          />
        </div>
      </div>

      <Button onClick={handleSave} loading={saving} variant="secondary" className="w-full">
        Save & Continue
      </Button>
    </div>
  );
}
