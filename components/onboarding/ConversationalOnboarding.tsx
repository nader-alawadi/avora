"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AvoraLogo } from "@/components/ui/AvoraLogo";
import {
  QUESTIONS, OVERLAY_AFTER, OVERLAY_MESSAGES,
  type Question, type ChoiceOption,
} from "./onboarding-steps";

// ── Types ──────────────────────────────────────────────────────────────────────

type Lang = "en" | "ar";

interface TeamInvite {
  email: string;
  role: string;
}

const EMPTY_INVITE: TeamInvite = { email: "", role: "SalesRep" };
const TEAM_ROLES = [
  { value: "Admin", en: "Admin", ar: "مدير" },
  { value: "SalesRep", en: "Sales Rep", ar: "مندوب مبيعات" },
  { value: "Viewer", en: "Viewer", ar: "مشاهد" },
];

// ── UI strings ─────────────────────────────────────────────────────────────────

const UI: Record<string, Record<Lang, string>> = {
  next: { en: "Continue", ar: "التالي" },
  back: { en: "Back", ar: "رجوع" },
  skip: { en: "Skip", ar: "تخطي" },
  saving: { en: "Saving…", ar: "جارٍ الحفظ…" },
  yes: { en: "YES", ar: "نعم" },
  no: { en: "NO", ar: "لا" },
  aiSuggest: { en: "✨ AI Suggest", ar: "✨ اقتراح AI" },
  aiGenerating: { en: "Generating…", ar: "جارٍ التوليد…" },
  recording: { en: "Recording…", ar: "جارٍ التسجيل…" },
  sendInvites: { en: "Send Invites", ar: "إرسال الدعوات" },
  confirmGenerate: { en: "Generate My GTM Strategy", ar: "إنشاء استراتيجية GTM" },
  editSection: { en: "Edit", ar: "تعديل" },
  noAnswers: { en: "No answers yet", ar: "لا إجابات بعد" },
  firstName: { en: "First Name", ar: "الاسم الأول" },
  lastName: { en: "Last Name", ar: "اسم العائلة" },
  companyName: { en: "Company Name", ar: "اسم الشركة" },
  businessEmail: { en: "Business Email", ar: "البريد الإلكتروني" },
  websiteUrl: { en: "Website URL", ar: "رابط الموقع" },
  language: { en: "Language", ar: "اللغة" },
};

const ui = (key: string, lang: Lang) => UI[key]?.[lang] ?? key;

// ── Animation ──────────────────────────────────────────────────────────────────

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
};
const TRANSITION = { duration: 0.35, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] };

// ── Helpers ────────────────────────────────────────────────────────────────────

const qTitle = (q: Question, lang: Lang) => lang === "ar" ? q.titleAr : q.title;
const qSubtitle = (q: Question, lang: Lang) => lang === "ar" ? q.subtitleAr : q.subtitle;
const optLabel = (o: ChoiceOption, lang: Lang) => lang === "ar" ? o.labelAr : o.label;

/** Safely parse JSON from a fetch response; returns null on failure */
async function safeJSON<T = unknown>(res: Response): Promise<T | null> {
  try {
    const text = await res.text();
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

// ═════════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════════

export default function ConversationalOnboarding() {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>("en");
  const [currentQ, setCurrentQ] = useState(0);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  // Voice
  const [recording, setRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Team invites
  const [invites, setInvites] = useState<[TeamInvite, TeamInvite]>([
    { ...EMPTY_INVITE }, { ...EMPTY_INVITE },
  ]);
  const [inviteErrors, setInviteErrors] = useState<[string, string]>(["", ""]);

  // Overlay
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayIdx, setOverlayIdx] = useState(0);

  // Hydration fix
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => { setHasMounted(true); }, []);

  const isRTL = lang === "ar";
  const question = QUESTIONS[currentQ];
  const totalQ = QUESTIONS.length;

  // ── Load existing answers on mount ──────────────────────────────────────────

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/onboarding/answers");
        if (!res.ok) return;
        const data = await safeJSON<{ answers?: Record<string, Record<string, string>> }>(res);
        if (!data?.answers) return;
        const flat: Record<string, string> = {};
        for (const stepAnswers of Object.values(data.answers)) {
          for (const [k, v] of Object.entries(stepAnswers)) flat[k] = v;
        }
        if (Object.keys(flat).length > 0) setAnswers(flat);
        if (flat.language === "العربية") setLang("ar");
      } catch { /* ignore */ }
    })();
  }, []);

  // ── Answer helpers ──────────────────────────────────────────────────────────

  const setAnswer = useCallback((key: string, value: string) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  }, []);

  const getAnswer = useCallback((key: string) => answers[key] || "", [answers]);

  const toggleMulti = useCallback((key: string, value: string) => {
    setAnswers(prev => {
      const current = prev[key] ? JSON.parse(prev[key]) as string[] : [];
      const next = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [key]: JSON.stringify(next) };
    });
  }, []);

  const getMulti = useCallback((key: string): string[] => {
    try { return JSON.parse(answers[key] || "[]") as string[]; }
    catch { return []; }
  }, [answers]);

  // ── Save current question's answer ──────────────────────────────────────────

  const saveQuestion = useCallback(async (q: Question) => {
    setSaving(true);
    const stepAnswers: Record<string, string> = {};

    if (q.type === "welcome_form") {
      for (const k of ["firstName", "lastName", "companyName", "businessEmail", "websiteUrl", "language"]) {
        if (answers[k]) stepAnswers[k] = answers[k];
      }
    } else if (q.key.startsWith("_")) {
      // special steps (team_invite, review) - skip
    } else {
      if (answers[q.key]) stepAnswers[q.key] = answers[q.key];
    }

    if (Object.keys(stepAnswers).length > 0) {
      try {
        await fetch("/api/onboarding/answers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ step: q.apiStep, answers: stepAnswers }),
        });
      } catch { /* ignore */ }
    }
    setSaving(false);
  }, [answers]);

  // ── Navigation ──────────────────────────────────────────────────────────────

  const goNext = useCallback(async () => {
    await saveQuestion(question);
    if (currentQ < totalQ - 1) {
      // Check for motivational overlay
      if (OVERLAY_AFTER.has(question.id)) {
        const idx = [...OVERLAY_AFTER].indexOf(question.id);
        setOverlayIdx(idx);
        setShowOverlay(true);
        setTimeout(() => {
          setShowOverlay(false);
          setDirection(1);
          setCurrentQ(prev => prev + 1);
        }, 2000);
      } else {
        setDirection(1);
        setCurrentQ(prev => prev + 1);
      }
    }
  }, [currentQ, totalQ, question, saveQuestion]);

  const goBack = useCallback(() => {
    if (currentQ > 0) {
      setDirection(-1);
      setCurrentQ(prev => prev - 1);
    }
  }, [currentQ]);

  const goToQuestion = useCallback((idx: number) => {
    setDirection(idx > currentQ ? 1 : -1);
    setCurrentQ(idx);
  }, [currentQ]);

  // ── AI Suggest ──────────────────────────────────────────────────────────────

  const handleAISuggest = useCallback(async () => {
    if (question.type === "welcome_form" || question.type === "team_invite" || question.type === "review") return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/onboarding/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionKey: question.key,
          websiteUrl: answers.websiteUrl || "",
          previousAnswers: answers,
          lang,
        }),
      });
      if (res.ok) {
        const data = await safeJSON<{ suggestion?: string | string[] }>(res);
        if (data?.suggestion) {
          if (question.type === "multi_choice" && Array.isArray(data.suggestion)) {
            setAnswer(question.key, JSON.stringify(data.suggestion));
          } else if (typeof data.suggestion === "string") {
            setAnswer(question.key, data.suggestion);
          }
        }
      }
    } catch { /* network error — ignore */ }
    setAiLoading(false);
  }, [question, answers, lang, setAnswer]);

  // ── Voice Recording ─────────────────────────────────────────────────────────

  const startVoice = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);

      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        if (timerRef.current) clearInterval(timerRef.current);
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const formData = new FormData();
        formData.append("audio", blob, "recording.webm");
        formData.append("lang", lang);
        try {
          const res = await fetch("/api/onboarding/transcribe", { method: "POST", body: formData });
          if (res.ok) {
            const data = await safeJSON<{ text?: string }>(res);
            if (data?.text) {
              const key = question.key;
              setAnswer(key, (answers[key] || "") + " " + data.text);
            }
          }
        } catch { /* ignore */ }
        setRecording(false);
        setRecordingTime(0);
      };
      mediaRef.current = mr;
      mr.start();
      setRecording(true);
    } catch { /* mic access denied */ }
  }, [lang, answers, question.key, setAnswer]);

  const stopVoice = useCallback(() => {
    mediaRef.current?.stop();
  }, []);

  // ── Team Invite Handlers ────────────────────────────────────────────────────

  const sendInvites = useCallback(async () => {
    setSaving(true);
    const errors: [string, string] = ["", ""];
    let sent = false;
    for (let i = 0; i < 2; i++) {
      const inv = invites[i];
      if (!inv.email) continue;
      try {
        const res = await fetch("/api/team", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: inv.email, role: inv.role }),
        });
        if (!res.ok) {
          const data = await safeJSON<{ error?: string }>(res);
          errors[i as 0 | 1] = data?.error || "Failed";
        } else {
          sent = true;
        }
      } catch {
        errors[i as 0 | 1] = "Network error";
      }
    }
    setInviteErrors(errors);
    setSaving(false);
    if (sent) setTimeout(() => void goNext(), 800);
  }, [invites, goNext]);

  // ── Confirm & Generate ──────────────────────────────────────────────────────

  const handleConfirm = useCallback(async () => {
    setSaving(true);
    try {
      await fetch("/api/onboarding/answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: 13, answers: { completed: "true", completedAt: new Date().toISOString() } }),
      });
    } catch { /* ignore */ }
    setSaving(false);
    router.push("/dashboard");
  }, [router]);

  // ── Format time ─────────────────────────────────────────────────────────────

  const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  // ═════════════════════════════════════════════════════════════════════════════
  // RENDERERS
  // ═════════════════════════════════════════════════════════════════════════════

  // ── Sparkle + Mic buttons ───────────────────────────────────────────────────

  function renderToolbar() {
    if (question.type === "welcome_form" || question.type === "team_invite" || question.type === "review") return null;
    return (
      <div className="flex items-center gap-3 mt-6">
        {/* AI Suggest */}
        <button
          type="button"
          onClick={() => void handleAISuggest()}
          disabled={aiLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1E6663]/20 border border-[#1E6663]/30 text-teal-300 text-sm hover:bg-[#1E6663]/30 transition disabled:opacity-50"
        >
          {aiLoading ? (
            <span className="animate-spin text-base">⏳</span>
          ) : (
            <span className="text-base">✨</span>
          )}
          {aiLoading ? ui("aiGenerating", lang) : ui("aiSuggest", lang)}
        </button>

        {/* Voice */}
        {recording ? (
          <button
            type="button"
            onClick={stopVoice}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-sm animate-pulse"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            {fmtTime(recordingTime)} — {ui("recording", lang)}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => void startVoice()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/50 text-sm hover:bg-white/10 transition"
          >
            <span className="text-base">🎤</span>
          </button>
        )}
      </div>
    );
  }

  // ── Single Choice ───────────────────────────────────────────────────────────

  function renderSingleChoice() {
    const value = getAnswer(question.key);
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {question.options?.map(opt => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setAnswer(question.key, opt.value)}
              className={`relative px-5 py-4 rounded-2xl text-left transition-all duration-200 border ${
                selected
                  ? "bg-[#1E6663]/25 border-[#1E6663] text-white shadow-lg shadow-[#1E6663]/20"
                  : "bg-[#0d2626] border-white/10 text-white/70 hover:border-[#1E6663]/40 hover:bg-[#0d2626]/80"
              }`}
            >
              <span className="font-medium">{optLabel(opt, lang)}</span>
              {selected && (
                <span className="absolute top-3 right-3 text-teal-400 text-lg">✓</span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // ── Multi Choice ────────────────────────────────────────────────────────────

  function renderMultiChoice() {
    const selected = getMulti(question.key);
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {question.options?.map(opt => {
          const isSelected = selected.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggleMulti(question.key, opt.value)}
              className={`relative px-5 py-4 rounded-2xl text-left transition-all duration-200 border ${
                isSelected
                  ? "bg-[#1E6663]/25 border-[#1E6663] text-white shadow-lg shadow-[#1E6663]/20"
                  : "bg-[#0d2626] border-white/10 text-white/70 hover:border-[#1E6663]/40 hover:bg-[#0d2626]/80"
              }`}
            >
              <span className="font-medium">{optLabel(opt, lang)}</span>
              {isSelected && (
                <span className="absolute top-3 right-3 text-teal-400 text-lg">✓</span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // ── True/False ──────────────────────────────────────────────────────────────

  function renderTrueFalse() {
    const value = getAnswer(question.key);
    return (
      <div className="flex gap-4 justify-center">
        {(["yes", "no"] as const).map(v => {
          const selected = value === v;
          return (
            <button
              key={v}
              type="button"
              onClick={() => setAnswer(question.key, v)}
              className={`w-40 h-32 rounded-3xl text-2xl font-bold transition-all duration-200 border-2 ${
                selected
                  ? v === "yes"
                    ? "bg-[#1E6663]/30 border-[#1E6663] text-teal-300 shadow-xl shadow-[#1E6663]/25"
                    : "bg-red-500/15 border-red-500/50 text-red-300 shadow-xl shadow-red-500/15"
                  : "bg-[#0d2626] border-white/10 text-white/50 hover:border-white/30"
              }`}
            >
              {ui(v, lang)}
            </button>
          );
        })}
      </div>
    );
  }

  // ── Range Slider ────────────────────────────────────────────────────────────

  function renderRangeSlider() {
    const value = Number(getAnswer(question.key)) || 0;
    const max = question.sliderMax || 100;
    const step = question.sliderStep || 1;
    const unit = question.sliderUnit || "";
    return (
      <div className="space-y-8 py-4">
        {/* Large number display */}
        <div className="text-center">
          <span className="text-7xl font-bold text-teal-400 tabular-nums">{value}</span>
          {unit && <span className="text-2xl text-white/40 ml-3">{unit}</span>}
        </div>
        {/* Slider */}
        <div className="px-4">
          <input
            type="range"
            min={0}
            max={max}
            step={step}
            value={value}
            onChange={e => setAnswer(question.key, e.target.value)}
            className="w-full h-3 rounded-full appearance-none cursor-pointer bg-white/10
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-7 [&::-webkit-slider-thumb]:h-7
              [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-teal-400
              [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-teal-400/40
              [&::-moz-range-thumb]:w-7 [&::-moz-range-thumb]:h-7 [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:bg-teal-400 [&::-moz-range-thumb]:border-0"
          />
          <div className="flex justify-between text-xs text-white/30 mt-2">
            <span>0</span>
            <span>{max}</span>
          </div>
        </div>
      </div>
    );
  }

  // ── Welcome Form ────────────────────────────────────────────────────────────

  function renderWelcomeForm() {
    const fields: { key: string; label: string; type?: string; placeholder?: string }[] = [
      { key: "firstName", label: ui("firstName", lang), placeholder: "John" },
      { key: "lastName", label: ui("lastName", lang), placeholder: "Smith" },
      { key: "companyName", label: ui("companyName", lang), placeholder: "Acme Inc" },
      { key: "businessEmail", label: ui("businessEmail", lang), type: "email", placeholder: "john@acme.com" },
      { key: "websiteUrl", label: ui("websiteUrl", lang), type: "url", placeholder: "https://acme.com" },
    ];
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fields.map(f => (
            <div key={f.key} className={f.key === "websiteUrl" ? "sm:col-span-2" : ""}>
              <label className="block text-sm font-medium text-white/60 mb-1.5">{f.label}</label>
              <input
                type={f.type || "text"}
                value={answers[f.key] || ""}
                onChange={e => setAnswer(f.key, e.target.value)}
                placeholder={f.placeholder}
                className="w-full px-4 py-3 rounded-xl bg-[#0d2626] border border-white/10 text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-[#1E6663]/50 focus:border-[#1E6663]/50 transition"
              />
            </div>
          ))}
        </div>
        {/* Language toggle */}
        <div>
          <label className="block text-sm font-medium text-white/60 mb-1.5">{ui("language", lang)}</label>
          <div className="flex gap-3">
            {[
              { v: "English", l: "English" },
              { v: "العربية", l: "العربية" },
            ].map(({ v, l }) => {
              const selected = (answers.language || "English") === v;
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => {
                    setAnswer("language", v);
                    setLang(v === "العربية" ? "ar" : "en");
                  }}
                  className={`px-6 py-3 rounded-xl font-medium transition border ${
                    selected
                      ? "bg-[#1E6663]/25 border-[#1E6663] text-white"
                      : "bg-[#0d2626] border-white/10 text-white/50 hover:border-[#1E6663]/40"
                  }`}
                >
                  {l}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── Team Invite ─────────────────────────────────────────────────────────────

  function renderTeamInvite() {
    return (
      <div className="space-y-5">
        {([0, 1] as const).map(idx => (
          <div key={idx} className="bg-[#0d2626] rounded-2xl p-5 border border-white/10 space-y-4">
            <h4 className="text-white/80 font-semibold text-sm">
              {lang === "ar" ? `عضو ${idx + 1}` : `Member ${idx + 1}`}
            </h4>
            <div>
              <label className="text-xs text-white/50 mb-1 block">Email</label>
              <input
                type="email"
                value={invites[idx].email}
                onChange={e => {
                  setInvites(prev => {
                    const next = [...prev] as [TeamInvite, TeamInvite];
                    next[idx] = { ...next[idx], email: e.target.value };
                    return next;
                  });
                  setInviteErrors(prev => { const n = [...prev] as [string, string]; n[idx] = ""; return n; });
                }}
                placeholder="colleague@company.com"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-[#1E6663]/50 transition"
              />
              {inviteErrors[idx] && (
                <p className="text-red-400 text-xs mt-1">{inviteErrors[idx]}</p>
              )}
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">Role</label>
              <div className="flex gap-2">
                {TEAM_ROLES.map(r => {
                  const selected = invites[idx].role === r.value;
                  return (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => {
                        setInvites(prev => {
                          const next = [...prev] as [TeamInvite, TeamInvite];
                          next[idx] = { ...next[idx], role: r.value };
                          return next;
                        });
                      }}
                      className={`px-4 py-2 rounded-xl text-sm transition border ${
                        selected
                          ? "bg-[#1E6663]/25 border-[#1E6663] text-white"
                          : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"
                      }`}
                    >
                      {lang === "ar" ? r.ar : r.en}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => void sendInvites()}
            disabled={saving || (!invites[0].email && !invites[1].email)}
            className="flex-1 py-3.5 rounded-xl bg-[#1E6663] text-white font-semibold hover:bg-[#1E6663]/80 transition disabled:opacity-40"
          >
            {saving ? ui("saving", lang) : ui("sendInvites", lang)}
          </button>
          <button
            type="button"
            onClick={() => void goNext()}
            className="px-6 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:bg-white/10 transition"
          >
            {ui("skip", lang)}
          </button>
        </div>
      </div>
    );
  }

  // ── Review ──────────────────────────────────────────────────────────────────

  function renderReview() {
    // Group answers by apiStep
    const steps = new Map<number, { questions: Question[]; label: string }>();
    for (const q of QUESTIONS) {
      if (q.type === "welcome_form" || q.type === "team_invite" || q.type === "review") continue;
      if (!answers[q.key]) continue;
      if (!steps.has(q.apiStep)) {
        steps.set(q.apiStep, { questions: [], label: `Step ${q.apiStep}` });
      }
      steps.get(q.apiStep)!.questions.push(q);
    }

    return (
      <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-2 scrollbar-thin">
        {[...steps.entries()].map(([stepNum, { questions: qs }]) => (
          <div key={stepNum} className="bg-[#0d2626] rounded-xl p-4 border border-white/10">
            <div className="space-y-2">
              {qs.map(q => {
                let displayVal = answers[q.key] || "";
                try {
                  const parsed = JSON.parse(displayVal);
                  if (Array.isArray(parsed)) {
                    displayVal = parsed.map(v => {
                      const opt = q.options?.find(o => o.value === v);
                      return opt ? optLabel(opt, lang) : v;
                    }).join(", ");
                  }
                } catch {
                  const opt = q.options?.find(o => o.value === displayVal);
                  if (opt) displayVal = optLabel(opt, lang);
                }
                return (
                  <div key={q.key} className="flex justify-between items-start gap-4">
                    <span className="text-white/40 text-xs shrink-0">{qTitle(q, lang)}</span>
                    <span className="text-white/80 text-xs text-right">{displayVal}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => void handleConfirm()}
          disabled={saving}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#1E6663] to-teal-500 text-white font-bold text-lg hover:opacity-90 transition shadow-xl shadow-[#1E6663]/30 disabled:opacity-50"
        >
          {saving ? ui("saving", lang) : ui("confirmGenerate", lang)}
        </button>
      </div>
    );
  }

  // ── Question content dispatcher ─────────────────────────────────────────────

  function renderQuestionContent() {
    switch (question.type) {
      case "welcome_form": return renderWelcomeForm();
      case "single_choice": return renderSingleChoice();
      case "multi_choice": return renderMultiChoice();
      case "true_false": return renderTrueFalse();
      case "range_slider": return renderRangeSlider();
      case "team_invite": return renderTeamInvite();
      case "review": return renderReview();
      default: return null;
    }
  }

  // ── Check if current question has an answer ─────────────────────────────────

  const hasAnswer = useCallback((): boolean => {
    if (question.type === "welcome_form") {
      return !!(answers.firstName && answers.companyName && answers.businessEmail);
    }
    if (question.type === "team_invite" || question.type === "review") return true;
    return !!answers[question.key];
  }, [question, answers]);

  // ═════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═════════════════════════════════════════════════════════════════════════════

  const pct = ((currentQ + 1) / totalQ) * 100;

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="min-h-screen bg-[#061a1a] flex flex-col"
    >
      {/* ── Motivational Overlay ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {showOverlay && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-50 bg-[#061a1a]/95 flex items-center justify-center"
          >
            <div className="text-center">
              <span className="text-7xl mb-6 block">{OVERLAY_MESSAGES[overlayIdx]?.emoji}</span>
              <h2 className="text-3xl font-bold text-white mb-2">
                {OVERLAY_MESSAGES[overlayIdx]?.text}
              </h2>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Top bar ───────────────────────────────────────────────────────────── */}
      <div className="px-6 pt-5 pb-3">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 flex items-center">
              <AvoraLogo variant="light" height={22} />
            </div>
            <span className="text-xs text-white/30">
              {currentQ + 1} / {totalQ}
            </span>
          </div>
          {/* Progress bar */}
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#1E6663] to-teal-400 rounded-full"
              initial={false}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>
      </div>

      {/* ── Main content ──────────────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentQ}
              custom={direction}
              variants={slideVariants}
              initial={hasMounted ? "enter" : false}
              animate="center"
              exit="exit"
              transition={TRANSITION}
            >
              {/* Title */}
              <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
                  {qTitle(question, lang)}
                </h1>
                {qSubtitle(question, lang) && (
                  <p className="text-white/40 mt-2 text-lg">
                    {qSubtitle(question, lang)}
                  </p>
                )}
              </div>

              {/* Content */}
              {renderQuestionContent()}

              {/* Toolbar (AI + Voice) */}
              {renderToolbar()}

              {/* Navigation */}
              {question.type !== "team_invite" && question.type !== "review" && (
                <div className="flex items-center justify-between mt-10">
                  <button
                    type="button"
                    onClick={goBack}
                    disabled={currentQ === 0}
                    className="px-5 py-2.5 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition disabled:opacity-0 disabled:pointer-events-none text-sm"
                  >
                    {ui("back", lang)}
                  </button>

                  <div className="flex items-center gap-3">
                    {saving && (
                      <span className="text-xs text-teal-400/60">{ui("saving", lang)}</span>
                    )}
                    <button
                      type="button"
                      onClick={() => void goNext()}
                      disabled={!hasAnswer()}
                      className="px-8 py-3 rounded-xl bg-[#1E6663] text-white font-semibold hover:bg-[#1E6663]/80 transition disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-[#1E6663]/25"
                    >
                      {ui("next", lang)}
                    </button>
                  </div>
                </div>
              )}

              {/* Review: back button */}
              {question.type === "review" && (
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={goBack}
                    className="px-5 py-2.5 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition text-sm"
                  >
                    {ui("back", lang)}
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── Bottom nav dots ───────────────────────────────────────────────────── */}
      <div className="flex justify-center gap-1 pb-6 flex-wrap max-w-2xl mx-auto px-6">
        {QUESTIONS.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => goToQuestion(idx)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === currentQ
                ? "bg-teal-400 w-6"
                : idx < currentQ
                  ? "bg-[#1E6663]/60 w-1.5"
                  : "bg-white/10 w-1.5"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
