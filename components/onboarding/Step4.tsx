"use client";
import { useState } from "react";
import { Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface StepProps {
  answers: Record<string, string>;
  onSave: (data: Record<string, string>) => Promise<void>;
  language: string;
}

export function OnboardingStep4({ answers, onSave }: StepProps) {
  const [data, setData] = useState({
    disqualifiers: answers.disqualifiers || "",
    redFlags: answers.redFlags || "",
    worstCustomer: answers.worstCustomer || "",
  });
  const [saving, setSaving] = useState(false);

  const setField = (key: string) => (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    setData((d) => ({ ...d, [key]: e.target.value }));

  async function handleSave() {
    setSaving(true);
    await onSave(data);
    setSaving(false);
  }

  const disqualifierCount = data.disqualifiers
    .split("\n")
    .filter((d) => d.trim().length > 5).length;

  return (
    <div className="space-y-6">
      <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
        <p className="text-sm text-red-800 font-medium">
          🚫 Who should NOT be your customer?
        </p>
        <p className="text-xs text-red-700 mt-1">
          Disqualifiers are crucial for precise targeting. You need at least 3 to reach the strict gate.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#1F2A2A] mb-2">
          ICP Disqualifiers *{" "}
          <span className={`text-xs ${disqualifierCount >= 3 ? "text-green-600" : "text-red-500"}`}>
            ({disqualifierCount}/3 minimum)
          </span>
        </label>
        <Textarea
          value={data.disqualifiers}
          onChange={setField("disqualifiers")}
          placeholder={`Enter one disqualifier per line. Examples:
Companies with less than 50 employees
Industries: retail/consumer (B2C focus)
No dedicated IT team or technical decision maker
Startups with no product-market fit yet
Companies using a different ERP we can't integrate with
Projects under $10k budget`}
          rows={7}
          hint="One disqualifier per line. Be specific."
        />

        {disqualifierCount > 0 && disqualifierCount < 3 && (
          <p className="text-xs text-red-500 mt-1">
            Need {3 - disqualifierCount} more disqualifier(s) to reach strict gate.
          </p>
        )}
        {disqualifierCount >= 3 && (
          <p className="text-xs text-green-600 mt-1">
            ✓ Great! {disqualifierCount} disqualifiers defined.
          </p>
        )}
      </div>

      <Textarea
        label="Red Flags (warning signals)"
        value={data.redFlags}
        onChange={setField("redFlags")}
        placeholder="What early signals suggest this prospect won't convert? E.g., 'No clear pain expressed', 'Decision by committee with no champion', 'Competitor locked in multi-year deal'"
        rows={3}
        hint="Optional but improves ICP precision"
      />

      <Textarea
        label="Describe your worst customer (optional)"
        value={data.worstCustomer}
        onChange={setField("worstCustomer")}
        placeholder="Think of a customer who churned, was high-maintenance, or was a bad fit. What made them wrong for you?"
        rows={3}
      />

      <Button onClick={handleSave} loading={saving} variant="secondary" className="w-full">
        Save & Continue
      </Button>
    </div>
  );
}
