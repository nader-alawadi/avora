"use client";
import { useState } from "react";
import { Textarea, Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface StepProps {
  answers: Record<string, string>;
  onSave: (data: Record<string, string>) => Promise<void>;
  language: string;
}

export function OnboardingStep6({ answers, onSave }: StepProps) {
  const [data, setData] = useState({
    currentChannels: answers.currentChannels || "",
    teamSize: answers.teamSize || "",
    tools: answers.tools || "",
    capacity: answers.capacity || "",
    currentProcess: answers.currentProcess || "",
    topChallenges: answers.topChallenges || "",
  });
  const [saving, setSaving] = useState(false);

  const setField = (key: string) => (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>) =>
    setData((d) => ({ ...d, [key]: e.target.value }));

  async function handleSave() {
    setSaving(true);
    await onSave(data);
    setSaving(false);
  }

  return (
    <div className="space-y-5">
      <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3">
        <p className="text-sm text-green-800 font-medium">
          🎉 Almost done! One last step.
        </p>
        <p className="text-xs text-green-700 mt-1">
          Understanding your current process helps AVORA recommend the right channels and cadence for your team.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#1F2A2A] mb-2">
          Current Outreach Channels
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[
            "LinkedIn", "Cold Email", "WhatsApp", "Phone/Cold Call",
            "Events/Conferences", "Content Marketing", "Paid Ads", "Referrals", "Partnerships"
          ].map((channel) => {
            const channels = data.currentChannels.split(",").map((c) => c.trim()).filter(Boolean);
            const isSelected = channels.includes(channel);
            return (
              <button
                key={channel}
                type="button"
                onClick={() => {
                  const updated = isSelected
                    ? channels.filter((c) => c !== channel)
                    : [...channels, channel];
                  setData((d) => ({ ...d, currentChannels: updated.join(", ") }));
                }}
                className={`text-sm px-3 py-2 rounded-lg border transition-all text-left ${
                  isSelected
                    ? "border-[#1E6663] bg-[#1E6663]/10 text-[#1E6663] font-medium"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                {isSelected ? "✓ " : ""}{channel}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#1F2A2A] mb-1">
            Sales Team Size
          </label>
          <select
            value={data.teamSize}
            onChange={setField("teamSize")}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E6663] bg-white"
          >
            <option value="">Select</option>
            <option value="Solo founder">Solo founder</option>
            <option value="1–2 reps">1–2 reps</option>
            <option value="3–5 reps">3–5 reps</option>
            <option value="6–10 reps">6–10 reps</option>
            <option value="11–20 reps">11–20 reps</option>
            <option value="20+ reps">20+ reps</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1F2A2A] mb-1">
            Outreach Capacity (per rep/week)
          </label>
          <select
            value={data.capacity}
            onChange={setField("capacity")}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E6663] bg-white"
          >
            <option value="">Select</option>
            <option value="Under 20">Under 20 touches/week</option>
            <option value="20–50">20–50 touches/week</option>
            <option value="50–100">50–100 touches/week</option>
            <option value="100–200">100–200 touches/week</option>
            <option value="200+">200+ touches/week</option>
          </select>
        </div>
      </div>

      <Input
        label="Current Tools & Stack"
        value={data.tools}
        onChange={setField("tools")}
        placeholder="E.g., HubSpot, Lemlist, LinkedIn Sales Navigator, Notion, Slack"
        hint="CRM, outreach tools, enrichment tools, etc."
      />

      <Textarea
        label="Describe your current sales process"
        value={data.currentProcess}
        onChange={setField("currentProcess")}
        placeholder="Walk us through how a deal progresses from first touch to close. What stages, who's involved, typical steps?"
        rows={3}
      />

      <Textarea
        label="Top 3 sales challenges"
        value={data.topChallenges}
        onChange={setField("topChallenges")}
        placeholder={`What are your biggest sales challenges right now? E.g.:
1. Finding the right contacts at target accounts
2. Low reply rates on cold outreach
3. Long sales cycles with multiple stakeholders`}
        rows={3}
      />

      <Button onClick={handleSave} loading={saving} variant="secondary" className="w-full">
        Save — I'm Ready to Generate 🚀
      </Button>
    </div>
  );
}
