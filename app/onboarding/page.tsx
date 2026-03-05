"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ConfidenceMeter } from "@/components/ui/ConfidenceMeter";
import { OnboardingStep0 } from "@/components/onboarding/Step0";
import { OnboardingStep1 } from "@/components/onboarding/Step1";
import { OnboardingStep2 } from "@/components/onboarding/Step2";
import { OnboardingStep3 } from "@/components/onboarding/Step3";
import { OnboardingStep4 } from "@/components/onboarding/Step4";
import { OnboardingStep5 } from "@/components/onboarding/Step5";
import { OnboardingStep6 } from "@/components/onboarding/Step6";

const STEP_TITLES = [
  "Language & Timezone",
  "Business Foundation",
  "Customer Evidence",
  "Value Proposition",
  "ICP Constraints",
  "DMU Roles",
  "Channels & Process",
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, Record<string, string>>>({});
  const [confidence, setConfidence] = useState({ icp: 0, dmu: 0 });
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    // Load existing answers
    fetch("/api/onboarding/answers")
      .then((r) => r.json())
      .then((d) => {
        if (d.answers) setAnswers(d.answers);
      })
      .catch(() => {});

    // Load confidence
    refreshConfidence();
  }, []);

  const refreshConfidence = useCallback(() => {
    fetch("/api/onboarding/confidence")
      .then((r) => r.json())
      .then((d) => {
        setConfidence({ icp: d.icpConfidence || 0, dmu: d.dmuConfidence || 0 });
      })
      .catch(() => {});
  }, []);

  async function saveStep(step: number, stepAnswers: Record<string, string>) {
    setSaving(true);
    try {
      await fetch("/api/onboarding/answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step, answers: stepAnswers }),
      });
      setAnswers((prev) => ({ ...prev, [step]: stepAnswers }));
      refreshConfidence();
    } catch {
      console.error("Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleGenerateReport() {
    setGenerating(true);
    try {
      const lang = answers[0]?.language || "en";
      const res = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: lang }),
      });

      if (res.ok) {
        router.push("/dashboard");
      } else {
        const d = await res.json();
        alert(d.error || "Generation failed. Please check your answers.");
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  const isLastStep = currentStep === STEP_TITLES.length - 1;
  const progress = ((currentStep + 1) / STEP_TITLES.length) * 100;

  const stepProps = {
    answers: answers[currentStep] || {},
    onSave: (data: Record<string, string>) => saveStep(currentStep, data),
    language: answers[0]?.language || "en",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#1E6663] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="font-bold text-[#1F2A2A]">AVORA</span>
              <span className="text-gray-400 text-sm">/ Onboarding</span>
            </div>
            {saving && (
              <span className="text-xs text-gray-400 animate-pulse">Saving...</span>
            )}
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-[#1E6663] h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 whitespace-nowrap">
              Step {currentStep + 1} of {STEP_TITLES.length}
            </span>
          </div>

          {/* Step indicators */}
          <div className="flex gap-1 mt-3">
            {STEP_TITLES.map((title, i) => (
              <button
                key={i}
                onClick={() => i < currentStep && setCurrentStep(i)}
                className={`flex-1 h-1 rounded-full transition-colors ${
                  i < currentStep
                    ? "bg-[#1E6663] cursor-pointer"
                    : i === currentStep
                    ? "bg-[#FF6B63]"
                    : "bg-gray-200 cursor-default"
                }`}
                title={title}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8">
              <div className="mb-6">
                <div className="text-xs font-semibold text-[#1E6663] uppercase tracking-wide mb-1">
                  Step {currentStep + 1}
                </div>
                <h2 className="text-xl font-bold text-[#1F2A2A]">
                  {STEP_TITLES[currentStep]}
                </h2>
              </div>

              {currentStep === 0 && <OnboardingStep0 {...stepProps} />}
              {currentStep === 1 && <OnboardingStep1 {...stepProps} />}
              {currentStep === 2 && <OnboardingStep2 {...stepProps} />}
              {currentStep === 3 && <OnboardingStep3 {...stepProps} />}
              {currentStep === 4 && <OnboardingStep4 {...stepProps} />}
              {currentStep === 5 && <OnboardingStep5 {...stepProps} />}
              {currentStep === 6 && <OnboardingStep6 {...stepProps} />}

              <div className="mt-8 flex gap-3 justify-between">
                <Button
                  variant="ghost"
                  onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
                  disabled={currentStep === 0}
                >
                  ← Back
                </Button>

                {isLastStep ? (
                  <Button
                    variant="primary"
                    size="lg"
                    loading={generating}
                    onClick={handleGenerateReport}
                  >
                    Generate My Strategy →
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    onClick={() => setCurrentStep((s) => Math.min(STEP_TITLES.length - 1, s + 1))}
                  >
                    Next Step →
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-semibold text-sm text-[#1F2A2A] mb-4">
                Confidence Score
              </h3>
              <div className="space-y-4">
                <ConfidenceMeter label="ICP Confidence" value={confidence.icp} />
                <ConfidenceMeter label="DMU Confidence" value={confidence.dmu} />
              </div>
            </div>

            <div className="bg-[#1E6663]/5 rounded-xl border border-[#1E6663]/20 p-4">
              <h3 className="font-semibold text-sm text-[#1E6663] mb-2">
                💡 Why this matters
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Scores below 90% generate a preliminary report with warnings.
                Reach 90%+ on both to unlock lead ordering (strict gate).
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-semibold text-sm text-[#1F2A2A] mb-3">Steps</h3>
              <ul className="space-y-2">
                {STEP_TITLES.map((title, i) => (
                  <li
                    key={i}
                    className={`text-xs flex items-center gap-2 ${
                      i === currentStep
                        ? "text-[#1E6663] font-semibold"
                        : i < currentStep
                        ? "text-gray-400 line-through"
                        : "text-gray-400"
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                        i < currentStep
                          ? "bg-green-100 text-green-600"
                          : i === currentStep
                          ? "bg-[#1E6663] text-white"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {i < currentStep ? "✓" : i + 1}
                    </span>
                    {title}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
