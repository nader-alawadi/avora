"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { ConfidenceMeter } from "@/components/ui/ConfidenceMeter";
import { AvoraLogo } from "@/components/ui/AvoraLogo";
import { Confetti } from "@/components/ui/Confetti";
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
  const [prevStep, setPrevStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, Record<string, string>>>({});
  const [confidence, setConfidence] = useState({ icp: 0, dmu: 0 });
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const direction = useRef<1 | -1>(1);

  useEffect(() => {
    fetch("/api/onboarding/answers")
      .then((r) => r.json())
      .then((d) => { if (d.answers) setAnswers(d.answers); })
      .catch(() => {});
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

  function goToStep(next: number) {
    direction.current = next > currentStep ? 1 : -1;
    setPrevStep(currentStep);
    setCurrentStep(next);
  }

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
    setShowConfetti(true);
    try {
      const lang = answers[0]?.language || "en";
      const res = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: lang }),
      });

      if (res.ok) {
        // Let confetti play briefly before redirect
        setTimeout(() => router.push("/dashboard"), 2200);
      } else {
        setShowConfetti(false);
        const d = await res.json();
        alert(d.error || "Generation failed. Please check your answers.");
        setGenerating(false);
      }
    } catch {
      setShowConfetti(false);
      alert("Network error. Please try again.");
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

  const stepVariants = {
    enter: (d: number) => ({ opacity: 0, x: d * 40 }),
    center: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
    exit: (d: number) => ({ opacity: 0, x: d * -40, transition: { duration: 0.2 } }),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {showConfetti && (
        <Confetti onDone={() => setShowConfetti(false)} />
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <AvoraLogo size={30} showTagline taglineColor="#9ca3af" />
              <span className="text-gray-300">/</span>
              <span className="text-gray-500 text-sm font-medium">Onboarding</span>
            </div>
            {saving && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-gray-400 animate-pulse"
              >
                Saving…
              </motion.span>
            )}
          </div>

          {/* Animated progress bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
              <motion.div
                className="h-2 bg-gradient-to-r from-[#1E6663] to-[#4ecdc4] rounded-full"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
            <span className="text-xs text-gray-400 whitespace-nowrap">
              Step {currentStep + 1} of {STEP_TITLES.length}
            </span>
          </div>

          {/* Step indicators */}
          <div className="flex gap-1 mt-3">
            {STEP_TITLES.map((title, i) => (
              <button
                key={i}
                onClick={() => i < currentStep && goToStep(i)}
                className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
                  i < currentStep
                    ? "bg-[#1E6663] cursor-pointer hover:bg-[#175553]"
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
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 md:p-8">
                <div className="mb-6">
                  <div className="text-xs font-bold text-[#1E6663] uppercase tracking-widest mb-1">
                    Step {currentStep + 1}
                  </div>
                  <h2 className="text-xl font-bold text-[#1F2A2A]">
                    {STEP_TITLES[currentStep]}
                  </h2>
                </div>

                <AnimatePresence mode="wait" custom={direction.current}>
                  <motion.div
                    key={currentStep}
                    custom={direction.current}
                    variants={stepVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                  >
                    {currentStep === 0 && <OnboardingStep0 {...stepProps} />}
                    {currentStep === 1 && <OnboardingStep1 {...stepProps} />}
                    {currentStep === 2 && <OnboardingStep2 {...stepProps} />}
                    {currentStep === 3 && <OnboardingStep3 {...stepProps} />}
                    {currentStep === 4 && <OnboardingStep4 {...stepProps} />}
                    {currentStep === 5 && <OnboardingStep5 {...stepProps} />}
                    {currentStep === 6 && <OnboardingStep6 {...stepProps} />}
                  </motion.div>
                </AnimatePresence>

                <div className="mt-8 flex gap-3 justify-between">
                  <Button
                    variant="ghost"
                    onClick={() => goToStep(Math.max(0, currentStep - 1))}
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
                      className={generating ? "pulse-glow" : ""}
                    >
                      Generate My Strategy →
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      onClick={() => goToStep(Math.min(STEP_TITLES.length - 1, currentStep + 1))}
                    >
                      Next Step →
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-4"
            >
              <h3 className="font-semibold text-sm text-[#1F2A2A] mb-4">
                Confidence Score
              </h3>
              <div className="space-y-4">
                <ConfidenceMeter label="ICP Confidence" value={confidence.icp} />
                <ConfidenceMeter label="DMU Confidence" value={confidence.dmu} />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="bg-gradient-to-br from-[#1E6663]/8 to-[#1E6663]/4 rounded-xl border border-[#1E6663]/15 p-4"
            >
              <h3 className="font-semibold text-sm text-[#1E6663] mb-2">
                💡 Why this matters
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Scores below 90% generate a preliminary report with warnings.
                Reach 90%+ on both to unlock lead ordering (strict gate).
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-4"
            >
              <h3 className="font-semibold text-sm text-[#1F2A2A] mb-3">Steps</h3>
              <ul className="space-y-2">
                {STEP_TITLES.map((title, i) => (
                  <li
                    key={i}
                    className={`text-xs flex items-center gap-2 ${
                      i === currentStep
                        ? "text-[#1E6663] font-semibold"
                        : i < currentStep
                        ? "text-gray-400"
                        : "text-gray-400"
                    }`}
                  >
                    <motion.span
                      animate={i === currentStep ? { scale: [1, 1.15, 1] } : {}}
                      transition={{ duration: 0.3 }}
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                        i < currentStep
                          ? "bg-green-100 text-green-600"
                          : i === currentStep
                          ? "bg-[#1E6663] text-white"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {i < currentStep ? "✓" : i + 1}
                    </motion.span>
                    <span className={i < currentStep ? "line-through" : ""}>{title}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
