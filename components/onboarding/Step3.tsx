"use client";
import { useState } from "react";
import { Textarea, Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface StepProps {
  answers: Record<string, string>;
  onSave: (data: Record<string, string>) => Promise<void>;
  language: string;
}

export function OnboardingStep3({ answers, onSave }: StepProps) {
  const [data, setData] = useState({
    whyWeWin: answers.whyWeWin || "",
    competitors: answers.competitors || "",
    differentiation: answers.differentiation || "",
    alternatives: answers.alternatives || "",
  });
  const [saving, setSaving] = useState(false);

  const setField = (key: string) => (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) =>
    setData((d) => ({ ...d, [key]: e.target.value }));

  async function handleSave() {
    setSaving(true);
    await onSave(data);
    setSaving(false);
  }

  return (
    <div className="space-y-5">
      <Textarea
        label="Why do you win deals? *"
        value={data.whyWeWin}
        onChange={setField("whyWeWin")}
        placeholder="What's the #1 reason customers choose you over alternatives? E.g., 'We have the fastest onboarding (2 weeks vs. 3 months for competitors), native Arabic interface, and built-in compliance for GCC regulations.'"
        rows={3}
        hint="Think about what customers say in win reviews"
      />

      <Input
        label="Competitors & Alternatives *"
        value={data.competitors}
        onChange={setField("competitors")}
        placeholder="E.g., Salesforce, HubSpot, spreadsheets, in-house build, doing nothing"
        hint="Include both direct competitors AND status quo alternatives"
      />

      <Textarea
        label="Your Key Differentiation"
        value={data.differentiation}
        onChange={setField("differentiation")}
        placeholder="List your 3 most defensible advantages. Format: 'We [capability] which means [benefit] unlike [alternative] which [limitation].'"
        rows={3}
      />

      <Textarea
        label="Why do you lose? (vs. competitors)"
        value={data.alternatives}
        onChange={setField("alternatives")}
        placeholder="When do competitors beat you? Where are you weak? This helps define your ICP more precisely."
        rows={2}
      />

      <Button onClick={handleSave} loading={saving} variant="secondary" className="w-full">
        Save & Continue
      </Button>
    </div>
  );
}
