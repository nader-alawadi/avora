"use client";
import { useState } from "react";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface StepProps {
  answers: Record<string, string>;
  onSave: (data: Record<string, string>) => Promise<void>;
  language: string;
}

export function OnboardingStep1({ answers, onSave }: StepProps) {
  const [data, setData] = useState({
    offer: answers.offer || "",
    problem: answers.problem || "",
    icpHypothesis: answers.icpHypothesis || "",
    geoTargets: answers.geoTargets || "",
    pricingRange: answers.pricingRange || "",
    salesCycleRange: answers.salesCycleRange || "",
    industry: answers.industry || "",
    employeeRange: answers.employeeRange || "",
    revenueRange: answers.revenueRange || "",
  });
  const [saving, setSaving] = useState(false);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setData((d) => ({ ...d, [key]: e.target.value }));

  async function handleSave() {
    setSaving(true);
    await onSave(data);
    setSaving(false);
  }

  return (
    <div className="space-y-5">
      <Textarea
        label="What do you sell? *"
        value={data.offer}
        onChange={set("offer")}
        placeholder="Describe your product/service clearly. E.g., 'We provide AI-powered recruitment software that automates resume screening for mid-size companies.'"
        rows={3}
        hint="Be specific. Vague answers reduce your confidence score."
      />

      <Textarea
        label="What problem do you solve? *"
        value={data.problem}
        onChange={set("problem")}
        placeholder="What specific pain or business challenge does your product address? E.g., 'HR teams waste 15+ hours/week manually screening CVs and miss top candidates.'"
        rows={3}
      />

      <Textarea
        label="Your ICP hypothesis"
        value={data.icpHypothesis}
        onChange={set("icpHypothesis")}
        placeholder="Who do you think your ideal customer is? E.g., 'Series B+ tech startups in the US with 100-500 employees growing their engineering team.'"
        rows={2}
      />

      <Input
        label="Target Geographies *"
        value={data.geoTargets}
        onChange={set("geoTargets")}
        placeholder="E.g., UAE, Saudi Arabia, Egypt, US"
        hint="Comma-separated list of countries or regions"
      />

      <Input
        label="Your Industry"
        value={data.industry}
        onChange={set("industry")}
        placeholder="E.g., HR Tech, SaaS, FinTech, Logistics"
      />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#1F2A2A] mb-1">
            Pricing Range (USD) *
          </label>
          <select
            value={data.pricingRange}
            onChange={set("pricingRange")}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E6663] bg-white"
          >
            <option value="">Select range</option>
            <option value="Under $1k/year">Under $1k/year</option>
            <option value="$1k–5k/year">$1k–5k/year</option>
            <option value="$5k–20k/year">$5k–20k/year</option>
            <option value="$20k–50k/year">$20k–50k/year</option>
            <option value="$50k–100k/year">$50k–100k/year</option>
            <option value="$100k+/year">$100k+/year</option>
            <option value="Custom enterprise">Custom enterprise</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1F2A2A] mb-1">
            Sales Cycle Length *
          </label>
          <select
            value={data.salesCycleRange}
            onChange={set("salesCycleRange")}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E6663] bg-white"
          >
            <option value="">Select range</option>
            <option value="Under 2 weeks">Under 2 weeks</option>
            <option value="2–4 weeks">2–4 weeks</option>
            <option value="1–3 months">1–3 months</option>
            <option value="3–6 months">3–6 months</option>
            <option value="6–12 months">6–12 months</option>
            <option value="12+ months">12+ months</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#1F2A2A] mb-1">
            Target Company Size
          </label>
          <select
            value={data.employeeRange}
            onChange={set("employeeRange")}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E6663] bg-white"
          >
            <option value="">Select range</option>
            <option value="1–10">1–10 employees</option>
            <option value="11–50">11–50 employees</option>
            <option value="51–200">51–200 employees</option>
            <option value="201–500">201–500 employees</option>
            <option value="501–1000">501–1,000 employees</option>
            <option value="1000+">1,000+ employees</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1F2A2A] mb-1">
            Target Revenue Range
          </label>
          <select
            value={data.revenueRange}
            onChange={set("revenueRange")}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E6663] bg-white"
          >
            <option value="">Select range</option>
            <option value="Pre-revenue">Pre-revenue</option>
            <option value="Under $1M">Under $1M ARR</option>
            <option value="$1M–$10M">$1M–$10M ARR</option>
            <option value="$10M–$50M">$10M–$50M ARR</option>
            <option value="$50M–$100M">$50M–$100M ARR</option>
            <option value="$100M+">$100M+ ARR</option>
          </select>
        </div>
      </div>

      <Button onClick={handleSave} loading={saving} variant="secondary" className="w-full">
        Save & Continue
      </Button>
    </div>
  );
}
