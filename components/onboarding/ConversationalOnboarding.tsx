"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AvoraLogo } from "@/components/ui/AvoraLogo";

// ── Types ──────────────────────────────────────────────────────────────────────

type Lang = "en" | "ar";

interface StepConfig {
  key: string;
  question: { en: string; ar: string };
  hint: { en: string; ar: string };
  placeholder: { en: string; ar: string };
  inputType: "text" | "textarea";
  chips?: string[];
  aiField?: string;
  apiStep: number;
}

interface TeamInvite {
  firstName: string;
  lastName: string;
  jobTitle: string;
  email: string;
  role: "Admin" | "SalesRep" | "Viewer";
}

const EMPTY_INVITE: TeamInvite = { firstName: "", lastName: "", jobTitle: "", email: "", role: "SalesRep" };

// ── Step definitions ───────────────────────────────────────────────────────────

const QUESTION_STEPS: StepConfig[] = [
  {
    key: "_basic",
    question: { en: "Let\u2019s start with the basics", ar: "\u0644\u0646\u0628\u062f\u0623 \u0628\u0627\u0644\u0623\u0633\u0627\u0633\u064a\u0627\u062a" },
    hint: { en: "Tell us about yourself and your company.", ar: "\u0623\u062e\u0628\u0631\u0646\u0627 \u0639\u0646 \u0646\u0641\u0633\u0643 \u0648\u0634\u0631\u0643\u062a\u0643." },
    placeholder: { en: "", ar: "" },
    inputType: "text",
    apiStep: 0,
  },
  {
    key: "offer",
    question: { en: "What do you sell?", ar: "\u0645\u0627\u0630\u0627 \u062a\u0628\u064a\u0639\u061f" },
    hint: { en: "Describe your product or service in a few words.", ar: "\u0635\u0641 \u0645\u0646\u062a\u062c\u0643 \u0623\u0648 \u062e\u062f\u0645\u062a\u0643 \u0628\u0625\u064a\u062c\u0627\u0632." },
    placeholder: { en: "e.g. AI-powered CRM for MENA startups", ar: "\u0645\u062b\u0644: \u0646\u0638\u0627\u0645 CRM \u0630\u0643\u064a \u0644\u0644\u0634\u0631\u0643\u0627\u062a \u0627\u0644\u0646\u0627\u0634\u0626\u0629" },
    inputType: "textarea",
    chips: ["SaaS Platform", "Consulting Services", "Agency Services", "Enterprise Software", "Marketplace"],
    aiField: "description",
    apiStep: 1,
  },
  {
    key: "problem",
    question: { en: "What problem do you solve?", ar: "\u0645\u0627 \u0627\u0644\u0645\u0634\u0643\u0644\u0629 \u0627\u0644\u062a\u064a \u062a\u062d\u0644\u0647\u0627\u061f" },
    hint: { en: "What pain point does your product address for your customers?", ar: "\u0645\u0627 \u0646\u0642\u0637\u0629 \u0627\u0644\u0623\u0644\u0645 \u0627\u0644\u062a\u064a \u064a\u0639\u0627\u0644\u062c\u0647\u0627 \u0645\u0646\u062a\u062c\u0643\u061f" },
    placeholder: { en: "e.g. Sales teams waste 60% of their time on unqualified leads", ar: "\u0645\u062b\u0644: \u0641\u0631\u0642 \u0627\u0644\u0645\u0628\u064a\u0639\u0627\u062a \u062a\u0647\u062f\u0631 60% \u0645\u0646 \u0648\u0642\u062a\u0647\u0627" },
    inputType: "textarea",
    chips: ["Manual processes waste time", "Lack of visibility", "Poor data quality", "Scaling challenges", "High customer acquisition cost"],
    aiField: "biggestPain",
    apiStep: 1,
  },
  {
    key: "geoTargets",
    question: { en: "Where are your target markets?", ar: "\u0623\u064a\u0646 \u0623\u0633\u0648\u0627\u0642\u0643 \u0627\u0644\u0645\u0633\u062a\u0647\u062f\u0641\u0629\u061f" },
    hint: { en: "Which regions or countries do you sell to?", ar: "\u0645\u0627 \u0627\u0644\u0645\u0646\u0627\u0637\u0642 \u0623\u0648 \u0627\u0644\u062f\u0648\u0644 \u0627\u0644\u062a\u064a \u062a\u0628\u064a\u0639 \u0641\u064a\u0647\u0627\u061f" },
    placeholder: { en: "e.g. UAE, Saudi Arabia, Egypt", ar: "\u0645\u062b\u0644: \u0627\u0644\u0625\u0645\u0627\u0631\u0627\u062a\u060c \u0627\u0644\u0633\u0639\u0648\u062f\u064a\u0629\u060c \u0645\u0635\u0631" },
    inputType: "text",
    chips: ["UAE", "Saudi Arabia", "Egypt", "USA", "Europe", "Global"],
    apiStep: 4,
  },
  {
    key: "icpHypothesis",
    question: { en: "Who is your ideal customer?", ar: "\u0645\u0646 \u0647\u0648 \u0639\u0645\u064a\u0644\u0643 \u0627\u0644\u0645\u062b\u0627\u0644\u064a\u061f" },
    hint: { en: "Describe the profile of your best-fit buyer.", ar: "\u0635\u0641 \u0645\u0644\u0641 \u0627\u0644\u0645\u0634\u062a\u0631\u064a \u0627\u0644\u0623\u0646\u0633\u0628 \u0644\u0643." },
    placeholder: { en: "e.g. VP of Sales at Series B SaaS companies with 50-200 employees", ar: "\u0645\u062b\u0644: \u0646\u0627\u0626\u0628 \u0631\u0626\u064a\u0633 \u0627\u0644\u0645\u0628\u064a\u0639\u0627\u062a \u0641\u064a \u0634\u0631\u0643\u0627\u062a SaaS" },
    inputType: "textarea",
    chips: ["Early-stage startups", "Mid-market (50-500)", "Enterprise (1000+)", "SMBs (1-50)", "Government"],
    aiField: "jobTitles",
    apiStep: 1,
  },
  {
    key: "industry",
    question: { en: "What industries do you target?", ar: "\u0645\u0627 \u0627\u0644\u0635\u0646\u0627\u0639\u0627\u062a \u0627\u0644\u062a\u064a \u062a\u0633\u062a\u0647\u062f\u0641\u0647\u0627\u061f" },
    hint: { en: "Select or type the industries your customers belong to.", ar: "\u0627\u062e\u062a\u0631 \u0623\u0648 \u0627\u0643\u062a\u0628 \u0627\u0644\u0635\u0646\u0627\u0639\u0627\u062a \u0627\u0644\u062a\u064a \u064a\u0646\u062a\u0645\u064a \u0625\u0644\u064a\u0647\u0627 \u0639\u0645\u0644\u0627\u0624\u0643." },
    placeholder: { en: "e.g. SaaS, FinTech, Healthcare", ar: "\u0645\u062b\u0644: SaaS\u060c FinTech\u060c \u0627\u0644\u0631\u0639\u0627\u064a\u0629 \u0627\u0644\u0635\u062d\u064a\u0629" },
    inputType: "text",
    chips: ["SaaS", "FinTech", "Healthcare", "Real Estate", "E-commerce", "Manufacturing"],
    apiStep: 1,
  },
  {
    key: "pricingRange",
    question: { en: "What\u2019s your pricing range?", ar: "\u0645\u0627 \u0646\u0637\u0627\u0642 \u0623\u0633\u0639\u0627\u0631\u0643\u061f" },
    hint: { en: "How much does your product or service cost per year?", ar: "\u0643\u0645 \u062a\u0643\u0644\u0641\u0629 \u0645\u0646\u062a\u062c\u0643 \u0623\u0648 \u062e\u062f\u0645\u062a\u0643 \u0633\u0646\u0648\u064a\u0627\u064b\u061f" },
    placeholder: { en: "e.g. $5,000 - $20,000 per year", ar: "\u0645\u062b\u0644: 5,000$ - 20,000$ \u0633\u0646\u0648\u064a\u0627\u064b" },
    inputType: "text",
    chips: ["Under $1k/year", "$1k\u20135k/year", "$5k\u201320k/year", "$20k\u2013100k/year", "$100k+/year"],
    apiStep: 1,
  },
  {
    key: "salesCycleRange",
    question: { en: "How long is your sales cycle?", ar: "\u0643\u0645 \u062a\u0633\u062a\u063a\u0631\u0642 \u062f\u0648\u0631\u0629 \u0627\u0644\u0645\u0628\u064a\u0639\u0627\u062a\u061f" },
    hint: { en: "From first contact to closed deal, how long does it typically take?", ar: "\u0645\u0646 \u0623\u0648\u0644 \u062a\u0648\u0627\u0635\u0644 \u0625\u0644\u0649 \u0625\u063a\u0644\u0627\u0642 \u0627\u0644\u0635\u0641\u0642\u0629\u060c \u0643\u0645 \u064a\u0633\u062a\u063a\u0631\u0642 \u0639\u0627\u062f\u0629\u064b\u061f" },
    placeholder: { en: "e.g. 2-4 weeks", ar: "\u0645\u062b\u0644: 2-4 \u0623\u0633\u0627\u0628\u064a\u0639" },
    inputType: "text",
    chips: ["Under 2 weeks", "2\u20134 weeks", "1\u20133 months", "3\u20136 months", "6+ months"],
    apiStep: 1,
  },
  {
    key: "employeeRange",
    question: { en: "What company size do you target?", ar: "\u0645\u0627 \u062d\u062c\u0645 \u0627\u0644\u0634\u0631\u0643\u0627\u062a \u0627\u0644\u0645\u0633\u062a\u0647\u062f\u0641\u0629\u061f" },
    hint: { en: "How many employees do your ideal target companies typically have?", ar: "\u0643\u0645 \u0639\u062f\u062f \u0627\u0644\u0645\u0648\u0638\u0641\u064a\u0646 \u0641\u064a \u0627\u0644\u0634\u0631\u0643\u0627\u062a \u0627\u0644\u0645\u0633\u062a\u0647\u062f\u0641\u0629\u061f" },
    placeholder: { en: "e.g. 50-200 employees", ar: "\u0645\u062b\u0644: 50-200 \u0645\u0648\u0638\u0641" },
    inputType: "text",
    chips: ["1\u201310", "11\u201350", "51\u2013200", "201\u2013500", "1000+"],
    apiStep: 1,
  },
  {
    key: "toolsStack",
    question: { en: "What sales tools do you use?", ar: "\u0645\u0627 \u0623\u062f\u0648\u0627\u062a \u0627\u0644\u0645\u0628\u064a\u0639\u0627\u062a \u0627\u0644\u062a\u064a \u062a\u0633\u062a\u062e\u062f\u0645\u0647\u0627\u061f" },
    hint: { en: "What tools or platforms does your sales team currently rely on?", ar: "\u0645\u0627 \u0627\u0644\u0623\u062f\u0648\u0627\u062a \u0623\u0648 \u0627\u0644\u0645\u0646\u0635\u0627\u062a \u0627\u0644\u062a\u064a \u064a\u0639\u062a\u0645\u062f \u0639\u0644\u064a\u0647\u0627 \u0641\u0631\u064a\u0642\u0643\u061f" },
    placeholder: { en: "e.g. HubSpot, LinkedIn Sales Navigator", ar: "\u0645\u062b\u0644: HubSpot\u060c LinkedIn Sales Navigator" },
    inputType: "text",
    chips: ["HubSpot", "Salesforce", "LinkedIn Sales Nav", "Lemlist", "Apollo.io", "None yet"],
    apiStep: 1,
  },
  {
    key: "notes",
    question: { en: "Anything else we should know?", ar: "\u0647\u0644 \u0647\u0646\u0627\u0643 \u0634\u064a\u0621 \u0622\u062e\u0631 \u064a\u062c\u0628 \u0623\u0646 \u0646\u0639\u0631\u0641\u0647\u061f" },
    hint: { en: "Any additional context about your business, goals, or challenges.", ar: "\u0623\u064a \u0633\u064a\u0627\u0642 \u0625\u0636\u0627\u0641\u064a \u062d\u0648\u0644 \u0639\u0645\u0644\u0643 \u0623\u0648 \u0623\u0647\u062f\u0627\u0641\u0643 \u0623\u0648 \u062a\u062d\u062f\u064a\u0627\u062a\u0643." },
    placeholder: { en: "e.g. We're expanding to the GCC market next quarter...", ar: "\u0645\u062b\u0644: \u0646\u062a\u0648\u0633\u0639 \u0625\u0644\u0649 \u0633\u0648\u0642 \u0627\u0644\u062e\u0644\u064a\u062c \u0627\u0644\u0631\u0628\u0639 \u0627\u0644\u0642\u0627\u062f\u0645..." },
    inputType: "textarea",
    apiStep: 1,
  },
];

// Total = question steps + team invite step
const TOTAL_STEPS = QUESTION_STEPS.length + 1;
const TEAM_STEP_INDEX = QUESTION_STEPS.length; // index 11

// ── Bilingual helpers ──────────────────────────────────────────────────────────

const T = {
  stepOf: { en: "Step", ar: "\u0627\u0644\u062e\u0637\u0648\u0629" },
  of: { en: "of", ar: "\u0645\u0646" },
  back: { en: "Back", ar: "\u0631\u062c\u0648\u0639" },
  continue: { en: "Continue", ar: "\u0645\u062a\u0627\u0628\u0639\u0629" },
  finish: { en: "Finish Setup", ar: "\u0625\u0646\u0647\u0627\u0621 \u0627\u0644\u0625\u0639\u062f\u0627\u062f" },
  saving: { en: "Saving...", ar: "\u062c\u0627\u0631\u064a \u0627\u0644\u062d\u0641\u0638..." },
  aiSuggest: { en: "AI Suggest", ar: "\u0627\u0642\u062a\u0631\u0627\u062d \u0630\u0643\u064a" },
  thinking: { en: "Thinking...", ar: "\u062c\u0627\u0631\u064a \u0627\u0644\u062a\u0641\u0643\u064a\u0631..." },
  voice: { en: "Voice", ar: "\u0635\u0648\u062a" },
  stop: { en: "Stop", ar: "\u0625\u064a\u0642\u0627\u0641" },
  // Step 0
  yourName: { en: "Your name", ar: "\u0627\u0633\u0645\u0643" },
  companyName: { en: "Company name", ar: "\u0627\u0633\u0645 \u0627\u0644\u0634\u0631\u0643\u0629" },
  jobTitle: { en: "Job title", ar: "\u0627\u0644\u0645\u0633\u0645\u0649 \u0627\u0644\u0648\u0638\u064a\u0641\u064a" },
  website: { en: "Company website", ar: "\u0645\u0648\u0642\u0639 \u0627\u0644\u0634\u0631\u0643\u0629" },
  email: { en: "Work email", ar: "\u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a" },
  language: { en: "Language", ar: "\u0627\u0644\u0644\u063a\u0629" },
  // Team step
  teamHeading: { en: "Invite your sales team", ar: "\u0627\u062f\u0639\u064f \u0641\u0631\u064a\u0642 \u0627\u0644\u0645\u0628\u064a\u0639\u0627\u062a" },
  teamHint: { en: "They\u2019ll get access to your workspace immediately after setup.", ar: "\u0633\u064a\u062d\u0635\u0644\u0648\u0646 \u0639\u0644\u0649 \u0648\u0635\u0648\u0644 \u0641\u0648\u0631\u064a \u0625\u0644\u0649 \u0645\u0633\u0627\u062d\u0629 \u0639\u0645\u0644\u0643 \u0628\u0639\u062f \u0627\u0644\u0625\u0639\u062f\u0627\u062f." },
  member: { en: "Member", ar: "\u0639\u0636\u0648" },
  firstName: { en: "First name", ar: "\u0627\u0644\u0627\u0633\u0645 \u0627\u0644\u0623\u0648\u0644" },
  lastName: { en: "Last name", ar: "\u0627\u0644\u0627\u0633\u0645 \u0627\u0644\u0623\u062e\u064a\u0631" },
  businessEmail: { en: "Business email", ar: "\u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0645\u0647\u0646\u064a" },
  accessLevel: { en: "Access level", ar: "\u0645\u0633\u062a\u0648\u0649 \u0627\u0644\u0648\u0635\u0648\u0644" },
  skipForNow: { en: "Skip for now", ar: "\u062a\u062e\u0637\u064a \u0627\u0644\u0622\u0646" },
  sendInvites: { en: "Send Invites & Finish", ar: "\u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u062f\u0639\u0648\u0627\u062a \u0648\u0625\u0646\u0647\u0627\u0621" },
  domainError: { en: "Email must match your company domain", ar: "\u064a\u062c\u0628 \u0623\u0646 \u064a\u062a\u0637\u0627\u0628\u0642 \u0627\u0644\u0628\u0631\u064a\u062f \u0645\u0639 \u0646\u0637\u0627\u0642 \u0634\u0631\u0643\u062a\u0643" },
  invitesSent: { en: "Invites sent!", ar: "\u062a\u0645 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u062f\u0639\u0648\u0627\u062a!" },
  inviteFailed: { en: "Failed to send some invites", ar: "\u0641\u0634\u0644 \u0625\u0631\u0633\u0627\u0644 \u0628\u0639\u0636 \u0627\u0644\u062f\u0639\u0648\u0627\u062a" },
};

// ── Animation ──────────────────────────────────────────────────────────────────

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0, transition: { duration: 0.2, ease: "easeIn" as const } }),
};

// ── Utility ────────────────────────────────────────────────────────────────────

function extractDomain(urlOrEmail: string): string {
  try {
    if (urlOrEmail.includes("@")) return urlOrEmail.split("@")[1]?.toLowerCase() || "";
    const u = new URL(urlOrEmail.startsWith("http") ? urlOrEmail : `https://${urlOrEmail}`);
    return u.hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return urlOrEmail.replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0]?.toLowerCase() || "";
  }
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function ConversationalOnboarding() {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [lang, setLang] = useState<Lang>("en");
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Voice
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Team invites
  const [invites, setInvites] = useState<[TeamInvite, TeamInvite]>([{ ...EMPTY_INVITE }, { ...EMPTY_INVITE }]);
  const [inviteErrors, setInviteErrors] = useState<[string, string]>(["", ""]);
  const [inviteStatus, setInviteStatus] = useState<string>("");

  const isRTL = lang === "ar";
  const t = useCallback((key: keyof typeof T) => T[key][lang], [lang]);

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
        if (flat.language === "ar") setLang("ar");
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
    if (currentStep >= QUESTION_STEPS.length) return; // team step saves separately
    const step = QUESTION_STEPS[currentStep];
    if (!step) return;

    setSaving(true);
    try {
      if (currentStep === 0) {
        await fetch("/api/onboarding/answers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            step: 0,
            answers: {
              companyName: getAnswer("companyName"),
              website: getAnswer("websiteUrl"),
              name: getAnswer("name"),
              email: getAnswer("email"),
              jobTitle: getAnswer("jobTitle"),
              language: lang,
            },
          }),
        });
      } else {
        const value = getAnswer(step.key);
        if (!value.trim()) { setSaving(false); return; }

        if (step.key === "geoTargets") {
          await fetch("/api/onboarding/answers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ step: 4, answers: { countries: value } }),
          });
        }

        await fetch("/api/onboarding/answers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ step: step.apiStep, answers: { [step.key]: value } }),
        });
      }
    } catch { /* silent */ }
    setSaving(false);
  }, [currentStep, getAnswer, lang]);

  // ── Navigation ─────────────────────────────────────────────────────────────

  const goNext = useCallback(async () => {
    if (currentStep < QUESTION_STEPS.length) {
      await saveCurrentStep();
    }
    if (currentStep < TOTAL_STEPS - 1) {
      setDirection(1);
      setCurrentStep((s) => s + 1);
    } else {
      router.push("/dashboard");
    }
  }, [currentStep, saveCurrentStep, router]);

  const goBack = useCallback(() => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((s) => s - 1);
    }
  }, [currentStep]);

  // ── Team invite handlers ───────────────────────────────────────────────────

  const companyDomain = extractDomain(getAnswer("websiteUrl") || getAnswer("email"));

  const updateInvite = useCallback((idx: 0 | 1, field: keyof TeamInvite, value: string) => {
    setInvites((prev) => {
      const copy = [...prev] as [TeamInvite, TeamInvite];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
    setInviteErrors((prev) => {
      const copy = [...prev] as [string, string];
      copy[idx] = "";
      return copy;
    });
  }, []);

  const validateInviteEmail = useCallback((email: string): boolean => {
    if (!email) return true; // empty is ok (optional)
    const domain = email.split("@")[1]?.toLowerCase() || "";
    return !companyDomain || domain === companyDomain;
  }, [companyDomain]);

  const sendInvites = useCallback(async () => {
    const toSend = invites.filter((inv) => inv.email.trim());
    if (toSend.length === 0) { router.push("/dashboard"); return; }

    // Validate domains
    const errors: [string, string] = ["", ""];
    let hasError = false;
    invites.forEach((inv, i) => {
      if (inv.email.trim() && !validateInviteEmail(inv.email)) {
        errors[i as 0 | 1] = t("domainError");
        hasError = true;
      }
    });
    if (hasError) { setInviteErrors(errors); return; }

    setSaving(true);
    setInviteStatus("");
    let allOk = true;

    for (const inv of toSend) {
      try {
        const res = await fetch("/api/team", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: inv.email,
            role: inv.role,
            name: `${inv.firstName} ${inv.lastName}`.trim() || undefined,
          }),
        });
        if (!res.ok) allOk = false;
      } catch { allOk = false; }
    }

    setSaving(false);
    setInviteStatus(allOk ? t("invitesSent") : t("inviteFailed"));
    setTimeout(() => router.push("/dashboard"), 1200);
  }, [invites, validateInviteEmail, router, t]);

  const skipTeam = useCallback(() => { router.push("/dashboard"); }, [router]);

  // ── AI Suggest ─────────────────────────────────────────────────────────────

  const handleAISuggest = useCallback(async () => {
    if (currentStep >= QUESTION_STEPS.length) return;
    const step = QUESTION_STEPS[currentStep];
    if (!step.aiField) return;

    setAiLoading(true);
    try {
      const res = await fetch("/api/onboarding/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field: step.aiField, context: answers, lang }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.text) setAnswer(step.key, data.text);
      }
    } catch { /* silent */ }
    setAiLoading(false);
  }, [currentStep, answers, setAnswer, lang]);

  // ── Voice Recording ────────────────────────────────────────────────────────

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        stream.getTracks().forEach((tr) => tr.stop());
        if (timerRef.current) clearInterval(timerRef.current);
        setIsRecording(false);
        setRecordingTime(0);
        if (currentStep > 0 && currentStep < QUESTION_STEPS.length) {
          const step = QUESTION_STEPS[currentStep];
          if (!getAnswer(step.key).trim()) {
            setAnswer(step.key, lang === "ar" ? "[\u062a\u0645 \u0627\u0644\u062a\u0633\u062c\u064a\u0644 \u2014 \u064a\u0631\u062c\u0649 \u0643\u062a\u0627\u0628\u0629 \u0625\u062c\u0627\u0628\u062a\u0643]" : "[Voice recorded \u2014 please type or edit your answer]");
          }
        }
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime((prev) => prev + 1), 1000);
    } catch { /* mic unavailable */ }
  }, [currentStep, getAnswer, setAnswer, lang]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") mediaRecorderRef.current.stop();
  }, []);

  // ── Chip toggle ────────────────────────────────────────────────────────────

  const handleChip = useCallback((stepKey: string, chip: string) => {
    const current = getAnswer(stepKey);
    if (current === chip) { setAnswer(stepKey, ""); return; }
    const parts = current.split(", ").filter(Boolean);
    if (parts.includes(chip)) {
      setAnswer(stepKey, parts.filter((p) => p !== chip).join(", "));
    } else {
      setAnswer(stepKey, parts.length ? [...parts, chip].join(", ") : chip);
    }
  }, [getAnswer, setAnswer]);

  // ── Loading state ──────────────────────────────────────────────────────────

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

  // ── Render ─────────────────────────────────────────────────────────────────

  const progress = ((currentStep + 1) / TOTAL_STEPS) * 100;
  const isTeamStep = currentStep === TEAM_STEP_INDEX;

  return (
    <div className="min-h-screen gradient-hero flex flex-col relative overflow-hidden" dir={isRTL ? "rtl" : "ltr"}>
      {/* Background orbs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#FF6B63]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4">
        <AvoraLogo size={32} showText textColor="white" />
        <span className="text-white/40 text-sm font-medium">
          {t("stepOf")} {currentStep + 1} {t("of")} {TOTAL_STEPS}
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
        <div className={`w-full ${isTeamStep ? "max-w-2xl" : "max-w-xl"}`}>
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
                  lang={lang}
                  setLang={setLang}
                  t={t}
                />
              ) : isTeamStep ? (
                <TeamInviteStep
                  invites={invites}
                  errors={inviteErrors}
                  status={inviteStatus}
                  companyDomain={companyDomain}
                  updateInvite={updateInvite}
                  lang={lang}
                  t={t}
                />
              ) : (
                <QuestionStep
                  config={QUESTION_STEPS[currentStep]}
                  value={getAnswer(QUESTION_STEPS[currentStep].key)}
                  onChange={(v) => setAnswer(QUESTION_STEPS[currentStep].key, v)}
                  onChip={(chip) => handleChip(QUESTION_STEPS[currentStep].key, chip)}
                  onAISuggest={QUESTION_STEPS[currentStep].aiField ? handleAISuggest : undefined}
                  aiLoading={aiLoading}
                  isRecording={isRecording}
                  recordingTime={recordingTime}
                  onStartRecording={startRecording}
                  onStopRecording={stopRecording}
                  lang={lang}
                  t={t}
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
              <svg className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              {t("back")}
            </motion.button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {isTeamStep && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={skipTeam}
              className="text-white/50 hover:text-white/70 text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-white/5 transition-all"
            >
              {t("skipForNow")}
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={isTeamStep ? sendInvites : goNext}
            disabled={saving}
            className="flex items-center gap-2 bg-gradient-to-r from-[#1A6B6B] to-[#14B8A6] hover:from-[#1A7B7B] hover:to-[#16C8B6] text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg disabled:opacity-50 transition-all text-sm"
          >
            {saving ? (
              <>
                <Spinner />
                {t("saving")}
              </>
            ) : isTeamStep ? (
              <>
                {t("sendInvites")}
                <CheckIcon />
              </>
            ) : currentStep === QUESTION_STEPS.length - 1 ? (
              <>
                {t("continue")}
                <ArrowIcon rtl={isRTL} />
              </>
            ) : (
              <>
                {t("continue")}
                <ArrowIcon rtl={isRTL} />
              </>
            )}
          </motion.button>
        </div>
      </footer>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

// ── Icons ────────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
    />
  );
}

function ArrowIcon({ rtl }: { rtl?: boolean }) {
  return (
    <svg className={`w-4 h-4 ${rtl ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
    </svg>
  );
}

// ── Input class ──────────────────────────────────────────────────────────────

const INPUT_CLS = "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/25 text-sm outline-none focus:border-teal-400/50 focus:bg-white/[0.08] transition-all";

// ── Basic Info Step (Step 0) ─────────────────────────────────────────────────

function BasicInfoStep({
  getAnswer,
  setAnswer,
  lang,
  setLang,
  t,
}: {
  getAnswer: (key: string) => string;
  setAnswer: (key: string, value: string) => void;
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: keyof typeof T) => string;
}) {
  const fields = [
    { key: "name", label: t("yourName"), placeholder: "e.g. Sarah Ahmed", type: "text" },
    { key: "companyName", label: t("companyName"), placeholder: "e.g. Avora Technologies", type: "text" },
    { key: "jobTitle", label: t("jobTitle"), placeholder: "e.g. VP of Sales", type: "text" },
    { key: "websiteUrl", label: t("website"), placeholder: "e.g. https://avora.io", type: "url" },
    { key: "email", label: t("email"), placeholder: "e.g. sarah@avora.io", type: "email" },
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
        {QUESTION_STEPS[0].question[lang]}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-white/50 text-sm mb-6"
      >
        {QUESTION_STEPS[0].hint[lang]}
      </motion.p>

      {/* Language selector */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="mb-5"
      >
        <label className="block text-white/70 text-xs font-semibold uppercase tracking-wider mb-1.5">
          {t("language")}
        </label>
        <div className="flex gap-2">
          {(["en", "ar"] as Lang[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                lang === l
                  ? "bg-[#1A6B6B] border-[#14B8A6] text-white"
                  : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
              }`}
            >
              {l === "en" ? "English" : "\u0627\u0644\u0639\u0631\u0628\u064a\u0629"}
            </button>
          ))}
        </div>
      </motion.div>

      <div className="space-y-3.5">
        {fields.map((f, i) => (
          <motion.div
            key={f.key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 + i * 0.06 }}
          >
            <label className="block text-white/70 text-xs font-semibold uppercase tracking-wider mb-1.5">
              {f.label}
            </label>
            <input
              type={f.type}
              value={getAnswer(f.key)}
              onChange={(e) => setAnswer(f.key, e.target.value)}
              placeholder={f.placeholder}
              className={INPUT_CLS}
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
  lang,
  t,
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
  lang: Lang;
  t: (key: keyof typeof T) => string;
}) {
  const selectedChips = value.split(", ").filter(Boolean);

  return (
    <div>
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-3xl md:text-4xl font-bold text-white mb-2"
        style={{ letterSpacing: "-0.02em" }}
      >
        {config.question[lang]}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-white/50 text-sm mb-6"
      >
        {config.hint[lang]}
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
      >
        {config.inputType === "textarea" ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={config.placeholder[lang]}
            rows={4}
            className={`${INPUT_CLS} resize-none`}
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={config.placeholder[lang]}
            className={INPUT_CLS}
          />
        )}
      </motion.div>

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex items-center gap-3 mt-4"
      >
        <VoiceButton
          isRecording={isRecording}
          recordingTime={recordingTime}
          onStart={onStartRecording}
          onStop={onStopRecording}
          t={t}
        />

        {onAISuggest && (
          <button
            onClick={onAISuggest}
            disabled={aiLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white/80 transition-all text-xs font-medium disabled:opacity-40"
          >
            {aiLoading ? (
              <><Spinner /> {t("thinking")}</>
            ) : (
              <><SparkleIcon /> {t("aiSuggest")}</>
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
  t,
}: {
  isRecording: boolean;
  recordingTime: number;
  onStart: () => void;
  onStop: () => void;
  t: (key: keyof typeof T) => string;
}) {
  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  if (isRecording) {
    return (
      <button
        onClick={onStop}
        className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500/30 transition-all text-xs font-medium"
      >
        <div className="flex items-center gap-0.5 h-3.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="w-[2px] bg-red-400 rounded-full"
              animate={{ height: ["6px", "14px", "6px"] }}
              transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1, ease: "easeInOut" }}
            />
          ))}
        </div>
        <span>{fmt(recordingTime)}</span>
        <span>{t("stop")}</span>
      </button>
    );
  }

  return (
    <button
      onClick={onStart}
      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white/80 transition-all text-xs font-medium"
    >
      <MicIcon /> {t("voice")}
    </button>
  );
}

// ── Team Invite Step ─────────────────────────────────────────────────────────

const ROLE_OPTIONS: { value: TeamInvite["role"]; label: { en: string; ar: string } }[] = [
  { value: "Admin", label: { en: "Admin", ar: "\u0645\u062f\u064a\u0631" } },
  { value: "SalesRep", label: { en: "Sales Rep", ar: "\u0645\u0646\u062f\u0648\u0628 \u0645\u0628\u064a\u0639\u0627\u062a" } },
  { value: "Viewer", label: { en: "Viewer", ar: "\u0645\u0634\u0627\u0647\u062f" } },
];

function TeamInviteStep({
  invites,
  errors,
  status,
  companyDomain,
  updateInvite,
  lang,
  t,
}: {
  invites: [TeamInvite, TeamInvite];
  errors: [string, string];
  status: string;
  companyDomain: string;
  updateInvite: (idx: 0 | 1, field: keyof TeamInvite, value: string) => void;
  lang: Lang;
  t: (key: keyof typeof T) => string;
}) {
  return (
    <div>
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-3xl md:text-4xl font-bold text-white mb-2"
        style={{ letterSpacing: "-0.02em" }}
      >
        {t("teamHeading")}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-white/50 text-sm mb-6"
      >
        {t("teamHint")}
      </motion.p>

      {status && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`mb-4 px-4 py-2.5 rounded-xl text-sm font-medium ${
            status === t("invitesSent")
              ? "bg-teal-500/20 border border-teal-500/40 text-teal-300"
              : "bg-red-500/20 border border-red-500/40 text-red-300"
          }`}
        >
          {status}
        </motion.div>
      )}

      <div className="space-y-5">
        {([0, 1] as const).map((idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 + idx * 0.1 }}
            className="rounded-2xl bg-white/[0.04] border border-white/10 p-5"
          >
            <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">
              {t("member")} {idx + 1}
            </p>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-white/50 text-[10px] font-semibold uppercase tracking-wider mb-1">
                  {t("firstName")}
                </label>
                <input
                  type="text"
                  value={invites[idx].firstName}
                  onChange={(e) => updateInvite(idx, "firstName", e.target.value)}
                  placeholder="Sarah"
                  className={INPUT_CLS}
                />
              </div>
              <div>
                <label className="block text-white/50 text-[10px] font-semibold uppercase tracking-wider mb-1">
                  {t("lastName")}
                </label>
                <input
                  type="text"
                  value={invites[idx].lastName}
                  onChange={(e) => updateInvite(idx, "lastName", e.target.value)}
                  placeholder="Ahmed"
                  className={INPUT_CLS}
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-white/50 text-[10px] font-semibold uppercase tracking-wider mb-1">
                {t("jobTitle")}
              </label>
              <input
                type="text"
                value={invites[idx].jobTitle}
                onChange={(e) => updateInvite(idx, "jobTitle", e.target.value)}
                placeholder="Account Executive"
                className={INPUT_CLS}
              />
            </div>

            <div className="mb-3">
              <label className="block text-white/50 text-[10px] font-semibold uppercase tracking-wider mb-1">
                {t("businessEmail")}
              </label>
              <input
                type="email"
                value={invites[idx].email}
                onChange={(e) => updateInvite(idx, "email", e.target.value)}
                placeholder={companyDomain ? `name@${companyDomain}` : "name@company.com"}
                className={`${INPUT_CLS} ${errors[idx] ? "border-red-500/60" : ""}`}
              />
              {errors[idx] && (
                <p className="text-red-400 text-xs mt-1">{errors[idx]}</p>
              )}
            </div>

            <div>
              <label className="block text-white/50 text-[10px] font-semibold uppercase tracking-wider mb-1">
                {t("accessLevel")}
              </label>
              <div className="flex gap-2">
                {ROLE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => updateInvite(idx, "role", opt.value)}
                    className={`flex-1 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                      invites[idx].role === opt.value
                        ? "bg-[#1A6B6B] border-[#14B8A6] text-white"
                        : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                    }`}
                  >
                    {opt.label[lang]}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
