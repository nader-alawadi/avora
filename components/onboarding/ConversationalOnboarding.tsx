"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AvoraLogo } from "@/components/ui/AvoraLogo";

// ── Step configuration ─────────────────────────────────────────────────────────

interface StepConfig {
  key: string;
  question: string;
  hint: string;
  placeholder: string;
  inputType: "text" | "textarea";
  chips?: string[];
  aiField?: string;
  /** Which API step number to POST to (for CompanyProfile sync) */
  apiStep: number;
}

const STEPS: StepConfig[] = [
  // Step 0 is special — multi-field, handled separately
  {
    key: "_basic",
    question: "Let's start with the basics",
    hint: "Tell us about yourself and your company.",
    placeholder: "",
    inputType: "text",
    apiStep: 0,
  },
  {
    key: "offer",
    question: "What do you sell?",
    hint: "Describe your product or service in a few words.",
    placeholder: "e.g. AI-powered CRM for MENA startups",
    inputType: "textarea",
    chips: ["SaaS Platform", "Consulting Services", "Agency Services", "Enterprise Software", "Marketplace"],
    aiField: "description",
    apiStep: 1,
  },
  {
    key: "problem",
    question: "What problem do you solve?",
    hint: "What pain point does your product address for your customers?",
    placeholder: "e.g. Sales teams waste 60% of their time on unqualified leads",
    inputType: "textarea",
    chips: ["Manual processes waste time", "Lack of visibility", "Poor data quality", "Scaling challenges", "High customer acquisition cost"],
    aiField: "biggestPain",
    apiStep: 1,
  },
  {
    key: "geoTargets",
    question: "Where are your target markets?",
    hint: "Which regions or countries do you sell to?",
    placeholder: "e.g. UAE, Saudi Arabia, Egypt",
    inputType: "text",
    chips: ["UAE", "Saudi Arabia", "Egypt", "USA", "Europe", "Global"],
    apiStep: 4,
  },
  {
    key: "icpHypothesis",
    question: "Who is your ideal customer?",
    hint: "Describe the profile of your best-fit buyer.",
    placeholder: "e.g. VP of Sales at Series B SaaS companies with 50-200 employees",
    inputType: "textarea",
    chips: ["Early-stage startups", "Mid-market (50-500 employees)", "Enterprise (1000+)", "SMBs (1-50)", "Government & public sector"],
    aiField: "jobTitles",
    apiStep: 1,
  },
  {
    key: "industry",
    question: "What industries do you target?",
    hint: "Select or type the industries your customers belong to.",
    placeholder: "e.g. SaaS, FinTech, Healthcare",
    inputType: "text",
    chips: ["SaaS", "FinTech", "Healthcare", "Real Estate", "E-commerce", "Manufacturing"],
    apiStep: 1,
  },
  {
    key: "pricingRange",
    question: "What's your pricing range?",
    hint: "How much does your product or service cost per year?",
    placeholder: "e.g. $5,000 - $20,000 per year",
    inputType: "text",
    chips: ["Under $1k/year", "$1k–5k/year", "$5k–20k/year", "$20k–100k/year", "$100k+/year"],
    apiStep: 1,
  },
  {
    key: "salesCycleRange",
    question: "How long is your sales cycle?",
    hint: "From first contact to closed deal, how long does it typically take?",
    placeholder: "e.g. 2-4 weeks",
    inputType: "text",
    chips: ["Under 2 weeks", "2–4 weeks", "1–3 months", "3–6 months", "6+ months"],
    apiStep: 1,
  },
  {
    key: "employeeRange",
    question: "What company size do you target?",
    hint: "How many employees do your ideal target companies typically have?",
    placeholder: "e.g. 50-200 employees",
    inputType: "text",
    chips: ["1–10", "11–50", "51–200", "201–500", "1000+"],
    apiStep: 1,
  },
  {
    key: "toolsStack",
    question: "What sales tools do you use?",
    hint: "What tools or platforms does your sales team currently rely on?",
    placeholder: "e.g. HubSpot, LinkedIn Sales Navigator, Lemlist",
    inputType: "text",
    chips: ["HubSpot", "Salesforce", "LinkedIn Sales Nav", "Lemlist", "Apollo.io", "None yet"],
    apiStep: 1,
  },
  {
    key: "notes",
    question: "Anything else we should know?",
    hint: "Any additional context about your business, goals, or challenges.",
    placeholder: "e.g. We're expanding to the GCC market next quarter...",
    inputType: "textarea",
    apiStep: 1,
  },
];

const TOTAL_STEPS = STEPS.length;

// ── Animation variants ─────────────────────────────────────────────────────────

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 56, opacity: 0, transition: { duration: 0.2, ease: "easeIn" as const } }),
};

// ── Component ──────────────────────────────────────────────────────────────────

export default function ConversationalOnboarding() {
  const router = useRouter();

  // State
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Load existing answers ──────────────────────────────────────────────────

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/onboarding/answers");
        if (!res.ok) return;
        const data = await res.json();
        const flat: Record<string, string> = {};
        if (data.answers) {
          for (const stepAnswers of Object.values(data.answers) as Record<string, string>[]) {
            for (const [k, v] of Object.entries(stepAnswers)) {
              flat[k] = v;
            }
          }
        }
        setAnswers(flat);
      } catch { /* silent */ }
      setLoaded(true);
    }
    load();
  }, []);

  // ── Answer helpers ─────────────────────────────────────────────────────────

  const getAnswer = useCallback((key: string) => answers[key] || "", [answers]);

  const setAnswer = useCallback((key: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }, []);

  // ── Save step to API ───────────────────────────────────────────────────────

  const saveCurrentStep = useCallback(async () => {
    const step = STEPS[currentStep];
    if (!step) return;

    setSaving(true);
    try {
      if (currentStep === 0) {
        // Basic info step — save multiple fields to API step 0
        await fetch("/api/onboarding/answers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            step: 0,
            answers: {
              companyName: getAnswer("companyName"),
              website: getAnswer("websiteUrl"),
            },
          }),
        });
        // Also sync user name
        await fetch("/api/onboarding/answers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            step: 0,
            answers: { name: getAnswer("name"), email: getAnswer("email") },
          }),
        });
      } else {
        const value = getAnswer(step.key);
        if (!value.trim()) { setSaving(false); return; }

        // For geoTargets, also save as "countries" to API step 4 for CompanyProfile sync
        if (step.key === "geoTargets") {
          await fetch("/api/onboarding/answers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              step: 4,
              answers: { countries: value },
            }),
          });
        }

        await fetch("/api/onboarding/answers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            step: step.apiStep,
            answers: { [step.key]: value },
          }),
        });
      }
    } catch { /* silent */ }
    setSaving(false);
  }, [currentStep, getAnswer]);

  // ── Navigation ─────────────────────────────────────────────────────────────

  const goNext = useCallback(async () => {
    await saveCurrentStep();
    if (currentStep < TOTAL_STEPS - 1) {
      setDirection(1);
      setCurrentStep((s) => s + 1);
    } else {
      // Final step — redirect to dashboard or report generation
      router.push("/dashboard");
    }
  }, [currentStep, saveCurrentStep, router]);

  const goBack = useCallback(() => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((s) => s - 1);
    }
  }, [currentStep]);

  // ── AI Suggest ─────────────────────────────────────────────────────────────

  const handleAISuggest = useCallback(async () => {
    const step = STEPS[currentStep];
    if (!step.aiField) return;

    setAiLoading(true);
    try {
      const res = await fetch("/api/onboarding/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          field: step.aiField,
          context: answers,
          lang: "en",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.text) setAnswer(step.key, data.text);
      }
    } catch { /* silent */ }
    setAiLoading(false);
  }, [currentStep, answers, setAnswer]);

  // ── Voice Recording ────────────────────────────────────────────────────────

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        if (timerRef.current) clearInterval(timerRef.current);
        setIsRecording(false);
        setRecordingTime(0);
        // For now, indicate voice was recorded
        const step = STEPS[currentStep];
        if (step && step.key !== "_basic") {
          const existing = getAnswer(step.key);
          if (!existing.trim()) {
            setAnswer(step.key, "[Voice recorded — please type or edit your answer]");
          }
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000);
    } catch {
      // Mic not available or permission denied
    }
  }, [currentStep, getAnswer, setAnswer]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  // ── Chip toggle ────────────────────────────────────────────────────────────

  const handleChip = useCallback((stepKey: string, chip: string) => {
    const current = getAnswer(stepKey);
    // If chip is already the entire value, clear it
    if (current === chip) {
      setAnswer(stepKey, "");
      return;
    }
    // If value contains the chip, remove it
    const parts = current.split(", ").filter(Boolean);
    if (parts.includes(chip)) {
      setAnswer(stepKey, parts.filter((p) => p !== chip).join(", "));
    } else {
      // Add chip
      setAnswer(stepKey, parts.length ? [...parts, chip].join(", ") : chip);
    }
  }, [getAnswer, setAnswer]);

  // ── Render helpers ─────────────────────────────────────────────────────────

  if (!loaded) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full"
        />
      </div>
    );
  }

  const step = STEPS[currentStep];
  const progress = ((currentStep + 1) / TOTAL_STEPS) * 100;

  return (
    <div className="min-h-screen gradient-hero flex flex-col relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#FF6B63]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4">
        <AvoraLogo size={32} showText textColor="white" />
        <span className="text-white/40 text-sm font-medium">
          Step {currentStep + 1} of {TOTAL_STEPS}
        </span>
      </header>

      {/* Progress bar */}
      <div className="relative z-10 px-6 mb-2">
        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#1A6B6B] to-[#14B8A6]"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4 py-6 relative z-10">
        <div className="w-full max-w-xl">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              {currentStep === 0 ? (
                <BasicInfoStep
                  getAnswer={getAnswer}
                  setAnswer={setAnswer}
                />
              ) : (
                <QuestionStep
                  config={step}
                  value={getAnswer(step.key)}
                  onChange={(v) => setAnswer(step.key, v)}
                  onChip={(chip) => handleChip(step.key, chip)}
                  onAISuggest={step.aiField ? handleAISuggest : undefined}
                  aiLoading={aiLoading}
                  isRecording={isRecording}
                  recordingTime={recordingTime}
                  onStartRecording={startRecording}
                  onStopRecording={stopRecording}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation footer */}
      <footer className="relative z-10 px-6 py-5 flex items-center justify-between">
        <div>
          {currentStep > 0 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={goBack}
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-white/5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </motion.button>
          )}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={goNext}
          disabled={saving}
          className="flex items-center gap-2 bg-gradient-to-r from-[#1A6B6B] to-[#14B8A6] hover:from-[#1A7B7B] hover:to-[#16C8B6] text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg disabled:opacity-50 transition-all text-sm"
        >
          {saving ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
              />
              Saving...
            </>
          ) : currentStep === TOTAL_STEPS - 1 ? (
            <>
              Finish
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </>
          ) : (
            <>
              Continue
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </>
          )}
        </motion.button>
      </footer>
    </div>
  );
}

// ── Basic Info Step (Step 0) ─────────────────────────────────────────────────

function BasicInfoStep({
  getAnswer,
  setAnswer,
}: {
  getAnswer: (key: string) => string;
  setAnswer: (key: string, value: string) => void;
}) {
  const fields = [
    { key: "name", label: "Your name", placeholder: "e.g. Sarah Ahmed", type: "text" },
    { key: "companyName", label: "Company name", placeholder: "e.g. Avora Technologies", type: "text" },
    { key: "websiteUrl", label: "Company website", placeholder: "e.g. https://avora.io", type: "url" },
    { key: "email", label: "Work email", placeholder: "e.g. sarah@avora.io", type: "email" },
  ];

  return (
    <div>
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-3xl md:text-4xl font-bold text-white mb-2"
        style={{ letterSpacing: "-0.02em" }}
      >
        Let&apos;s start with the basics
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-white/50 text-sm mb-8"
      >
        Tell us about yourself and your company.
      </motion.p>

      <div className="space-y-4">
        {fields.map((f, i) => (
          <motion.div
            key={f.key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.08 }}
          >
            <label className="block text-white/70 text-xs font-semibold uppercase tracking-wider mb-1.5">
              {f.label}
            </label>
            <input
              type={f.type}
              value={getAnswer(f.key)}
              onChange={(e) => setAnswer(f.key, e.target.value)}
              placeholder={f.placeholder}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/25 text-sm outline-none focus:border-teal-400/50 focus:bg-white/8 transition-all"
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── Question Step (Steps 1-10) ───────────────────────────────────────────────

function QuestionStep({
  config,
  value,
  onChange,
  onChip,
  onAISuggest,
  aiLoading,
  isRecording,
  recordingTime,
  onStartRecording,
  onStopRecording,
}: {
  config: StepConfig;
  value: string;
  onChange: (v: string) => void;
  onChip: (chip: string) => void;
  onAISuggest?: () => void;
  aiLoading: boolean;
  isRecording: boolean;
  recordingTime: number;
  onStartRecording: () => void;
  onStopRecording: () => void;
}) {
  const selectedChips = value.split(", ").filter(Boolean);

  return (
    <div>
      {/* Question heading */}
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-3xl md:text-4xl font-bold text-white mb-2"
        style={{ letterSpacing: "-0.02em" }}
      >
        {config.question}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-white/50 text-sm mb-6"
      >
        {config.hint}
      </motion.p>

      {/* Choice chips */}
      {config.chips && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="flex flex-wrap gap-2 mb-5"
        >
          {config.chips.map((chip) => {
            const isActive = selectedChips.includes(chip);
            return (
              <button
                key={chip}
                onClick={() => onChip(chip)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  isActive
                    ? "bg-[#1A6B6B] border-[#14B8A6] text-white shadow-md shadow-teal-900/30"
                    : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white/80"
                }`}
              >
                {chip}
              </button>
            );
          })}
        </motion.div>
      )}

      {/* Text input */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative"
      >
        {config.inputType === "textarea" ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={config.placeholder}
            rows={4}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/25 text-sm outline-none focus:border-teal-400/50 focus:bg-white/8 transition-all resize-none"
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={config.placeholder}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/25 text-sm outline-none focus:border-teal-400/50 focus:bg-white/8 transition-all"
          />
        )}
      </motion.div>

      {/* Action buttons row */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex items-center gap-3 mt-4"
      >
        {/* Voice recording button */}
        <VoiceButton
          isRecording={isRecording}
          recordingTime={recordingTime}
          onStart={onStartRecording}
          onStop={onStopRecording}
        />

        {/* AI Suggest button */}
        {onAISuggest && (
          <button
            onClick={onAISuggest}
            disabled={aiLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white/80 transition-all text-xs font-medium disabled:opacity-40"
          >
            {aiLoading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                  className="w-3.5 h-3.5 border-[1.5px] border-white/30 border-t-white rounded-full"
                />
                Thinking...
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                </svg>
                AI Suggest
              </>
            )}
          </button>
        )}
      </motion.div>
    </div>
  );
}

// ── Voice Button ─────────────────────────────────────────────────────────────

function VoiceButton({
  isRecording,
  recordingTime,
  onStart,
  onStop,
}: {
  isRecording: boolean;
  recordingTime: number;
  onStart: () => void;
  onStop: () => void;
}) {
  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  if (isRecording) {
    return (
      <button
        onClick={onStop}
        className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500/30 transition-all text-xs font-medium"
      >
        {/* Waveform animation */}
        <div className="flex items-center gap-0.5 h-3.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="w-[2px] bg-red-400 rounded-full"
              animate={{ height: ["6px", "14px", "6px"] }}
              transition={{
                repeat: Infinity,
                duration: 0.6,
                delay: i * 0.1,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
        <span>{formatTime(recordingTime)}</span>
        <span>Stop</span>
      </button>
    );
  }

  return (
    <button
      onClick={onStart}
      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white/80 transition-all text-xs font-medium"
    >
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
      </svg>
      Voice
    </button>
  );
}
