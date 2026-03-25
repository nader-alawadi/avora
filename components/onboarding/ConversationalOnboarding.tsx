"use client";

import { useState, useEffect, useCallback, useRef, type JSX } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AvoraLogo } from "@/components/ui/AvoraLogo";
import {
  STEPS, UI, TEAM_ROLES, TEAM_PERMISSIONS,
  type Lang, type Bi, type QuestionConfig, type StepConfig,
} from "./onboarding-steps";

// ── Helpers ──────────────────────────────────────────────────────────────────

const t = (bi: Bi, lang: Lang) => bi[lang];
const ui = (key: string, lang: Lang, vars?: Record<string, string>) => {
  let s = UI[key]?.[lang] ?? key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, v);
  return s;
};

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
};

const TRANSITION = { duration: 0.35, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] };

// ── Team Invite Type ─────────────────────────────────────────────────────────

interface TeamInvite {
  firstName: string;
  lastName: string;
  jobTitle: string;
  email: string;
  role: string;
  permissions: string[];
}

const EMPTY_INVITE: TeamInvite = {
  firstName: "", lastName: "", jobTitle: "", email: "",
  role: "Sales Rep", permissions: ["View leads", "View dashboards"],
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function ConversationalOnboarding() {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>("en");
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState<string | null>(null);

  // Voice
  const [recording, setRecording] = useState(false);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Team invites
  const [invites, setInvites] = useState<[TeamInvite, TeamInvite]>([
    { ...EMPTY_INVITE }, { ...EMPTY_INVITE },
  ]);
  const [inviteErrors, setInviteErrors] = useState<[string, string]>(["", ""]);
  const [inviteStatus, setInviteStatus] = useState("");

  const isRTL = lang === "ar";
  const step = STEPS[currentStep];
  const totalSteps = STEPS.length;

  // ── Load existing answers on mount ─────────────────────────────────────────

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/onboarding/answers");
        if (!res.ok) return;
        const data = await res.json();
        const flat: Record<string, string> = {};
        if (data.answers) {
          for (const stepAnswers of Object.values(data.answers) as Record<string, string>[]) {
            for (const [k, v] of Object.entries(stepAnswers)) flat[k] = v;
          }
        }
        if (Object.keys(flat).length > 0) setAnswers(flat);
        if (flat.language === "العربية") setLang("ar");
      } catch { /* ignore */ }
    })();
  }, []);

  // ── Answer helpers ─────────────────────────────────────────────────────────

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

  // ── Save step answers ──────────────────────────────────────────────────────

  const saveStep = useCallback(async (stepConfig: StepConfig) => {
    setSaving(true);
    const stepAnswers: Record<string, string> = {};
    for (const q of stepConfig.questions) {
      if (answers[q.key]) stepAnswers[q.key] = answers[q.key];
    }
    // Also save detail fields for multi-select-detail
    for (const key of Object.keys(answers)) {
      if (key.endsWith("_detail") && !stepAnswers[key]) {
        const baseKey = key.replace("_detail", "");
        if (stepConfig.questions.some(q => q.key === baseKey)) {
          stepAnswers[key] = answers[key];
        }
      }
    }
    // Step 0 special fields
    if (stepConfig.id === 0) {
      for (const k of ["firstName", "lastName", "companyName", "businessEmail", "websiteUrl", "language", "autoFill"]) {
        if (answers[k]) stepAnswers[k] = answers[k];
      }
    }
    try {
      await fetch("/api/onboarding/answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: stepConfig.id, answers: stepAnswers }),
      });
    } catch { /* ignore */ }
    setSaving(false);
  }, [answers]);

  // ── Navigation ─────────────────────────────────────────────────────────────

  const goNext = useCallback(async () => {
    await saveStep(step);
    if (currentStep < totalSteps - 1) {
      setDirection(1);
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, totalSteps, step, saveStep]);

  const goBack = useCallback(() => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback((idx: number) => {
    setDirection(idx > currentStep ? 1 : -1);
    setCurrentStep(idx);
  }, [currentStep]);

  // ── AI Suggest ─────────────────────────────────────────────────────────────

  const handleAISuggest = useCallback(async (q: QuestionConfig) => {
    if (!q.ai) return;
    setAiLoading(q.key);
    try {
      const res = await fetch("/api/onboarding/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field: q.ai, context: answers, lang }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.text) setAnswer(q.key, data.text);
      }
    } catch { /* ignore */ }
    setAiLoading(null);
  }, [answers, lang, setAnswer]);

  // ── Voice Recording ────────────────────────────────────────────────────────

  const startVoice = useCallback(async (key: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const formData = new FormData();
        formData.append("audio", blob, "recording.webm");
        formData.append("lang", lang);
        try {
          const res = await fetch("/api/voice/transcribe", { method: "POST", body: formData });
          if (res.ok) {
            const data = await res.json();
            if (data.text) setAnswer(key, (answers[key] || "") + " " + data.text);
          }
        } catch { /* ignore */ }
        setRecording(false);
      };
      mediaRef.current = mr;
      mr.start();
      setRecording(true);
    } catch { /* mic access denied */ }
  }, [lang, answers, setAnswer]);

  const stopVoice = useCallback(() => {
    mediaRef.current?.stop();
  }, []);

  // ── Team Invite Handlers ───────────────────────────────────────────────────

  const updateInvite = useCallback((idx: 0 | 1, field: keyof TeamInvite, value: string | string[]) => {
    setInvites(prev => {
      const next = [...prev] as [TeamInvite, TeamInvite];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
    setInviteErrors(prev => { const n = [...prev] as [string, string]; n[idx] = ""; return n; });
  }, []);

  const togglePermission = useCallback((idx: 0 | 1, perm: string) => {
    setInvites(prev => {
      const next = [...prev] as [TeamInvite, TeamInvite];
      const perms = next[idx].permissions.includes(perm)
        ? next[idx].permissions.filter(p => p !== perm)
        : [...next[idx].permissions, perm];
      next[idx] = { ...next[idx], permissions: perms };
      return next;
    });
  }, []);

  const validateDomain = useCallback((email: string): boolean => {
    const website = answers.websiteUrl || "";
    const companyDomain = website.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
    if (!companyDomain || !email.includes("@")) return true; // can't validate
    const emailDomain = email.split("@")[1];
    return emailDomain === companyDomain;
  }, [answers.websiteUrl]);

  const sendInvites = useCallback(async () => {
    setSaving(true);
    setInviteStatus("");
    let allOk = true;
    for (let i = 0; i < 2; i++) {
      const inv = invites[i];
      if (!inv.email) continue;
      if (!validateDomain(inv.email)) {
        setInviteErrors(prev => {
          const n = [...prev] as [string, string];
          n[i as 0 | 1] = ui("domainMismatch", lang);
          return n;
        });
        allOk = false;
        continue;
      }
      try {
        const roleMap: Record<string, string> = {
          "Admin": "Admin", "Manager": "Admin",
          "Sales Rep": "SalesRep", "Viewer": "Viewer",
        };
        const res = await fetch("/api/team", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: inv.email, role: roleMap[inv.role] || "SalesRep" }),
        });
        if (!res.ok) {
          const data = await res.json();
          setInviteErrors(prev => {
            const n = [...prev] as [string, string];
            n[i as 0 | 1] = data.error || "Failed";
            return n;
          });
          allOk = false;
        }
      } catch {
        allOk = false;
      }
    }
    setSaving(false);
    setInviteStatus(allOk ? ui("invitesSent", lang) : ui("inviteFailed", lang));
    if (allOk) setTimeout(() => goNext(), 1200);
  }, [invites, validateDomain, lang, goNext]);

  // ── Confirm & Generate ─────────────────────────────────────────────────────

  const handleConfirm = useCallback(async () => {
    setSaving(true);
    // Save a marker that onboarding is complete
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

  // ── Check if step has required fields filled ──────────────────────────────

  const isStepValid = useCallback((stepConfig: StepConfig): boolean => {
    for (const q of stepConfig.questions) {
      if (q.required && !answers[q.key]) return false;
    }
    return true;
  }, [answers]);

  // ═══════════════════════════════════════════════════════════════════════════
  // FIELD RENDERERS
  // ═══════════════════════════════════════════════════════════════════════════

  function renderField(q: QuestionConfig): JSX.Element | null {
    // Conditional visibility
    if (q.showIf) {
      const val = answers[q.showIf.key] || "";
      const multiVals = (() => { try { return JSON.parse(val) as string[]; } catch { return [val]; } })();
      const visible = q.showIf.values.some(v => multiVals.includes(v));
      if (!visible) return null;
    }

    const label = t(q.label, lang);
    const placeholder = q.placeholder ? t(q.placeholder, lang) : "";
    const value = getAnswer(q.key);

    const fieldLabel = (
      <label className="block text-sm font-medium text-white/80 mb-1.5">
        {label}
        {q.required && <span className="text-red-400 ml-1">*</span>}
      </label>
    );

    const aiButton = q.ai && (
      <button
        type="button"
        onClick={() => void handleAISuggest(q)}
        disabled={aiLoading === q.key}
        className="text-xs px-3 py-1 rounded-full bg-teal-600/30 text-teal-300 hover:bg-teal-600/50 transition disabled:opacity-50"
      >
        {aiLoading === q.key ? ui("aiGenerating", lang) : ui("aiSuggest", lang)}
      </button>
    );

    const voiceButton = q.voice && (
      <button
        type="button"
        onMouseDown={() => void startVoice(q.key)}
        onMouseUp={stopVoice}
        onTouchStart={() => void startVoice(q.key)}
        onTouchEnd={stopVoice}
        className={`text-xs px-3 py-1 rounded-full transition ${
          recording ? "bg-red-500/40 text-red-300" : "bg-white/10 text-white/60 hover:bg-white/20"
        }`}
      >
        {recording ? ui("voiceRecording", lang) : "🎤"}
      </button>
    );

    switch (q.type) {
      case "short-text":
        return (
          <div key={q.key} className="space-y-1">
            {fieldLabel}
            <input
              type="text"
              value={value}
              onChange={e => setAnswer(q.key, e.target.value)}
              placeholder={placeholder}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
            />
          </div>
        );

      case "long-text":
        return (
          <div key={q.key} className="space-y-1">
            <div className="flex items-center justify-between">
              {fieldLabel}
              <div className="flex gap-2">
                {voiceButton}
                {aiButton}
              </div>
            </div>
            <textarea
              value={value}
              onChange={e => setAnswer(q.key, e.target.value)}
              placeholder={placeholder}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-teal-500/40 resize-none"
            />
          </div>
        );

      case "email":
        return (
          <div key={q.key} className="space-y-1">
            {fieldLabel}
            <input
              type="email"
              value={value}
              onChange={e => setAnswer(q.key, e.target.value)}
              placeholder={placeholder}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
            />
          </div>
        );

      case "url":
        return (
          <div key={q.key} className="space-y-1">
            {fieldLabel}
            <input
              type="url"
              value={value}
              onChange={e => setAnswer(q.key, e.target.value)}
              placeholder={placeholder || "https://"}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
            />
          </div>
        );

      case "numeric":
        return (
          <div key={q.key} className="space-y-1">
            {fieldLabel}
            <input
              type="number"
              value={value}
              onChange={e => setAnswer(q.key, e.target.value)}
              placeholder={placeholder}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
            />
          </div>
        );

      case "year":
        return (
          <div key={q.key} className="space-y-1">
            {fieldLabel}
            <input
              type="number"
              min={1900}
              max={2026}
              value={value}
              onChange={e => setAnswer(q.key, e.target.value)}
              placeholder="2020"
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
            />
          </div>
        );

      case "single-select":
        return (
          <div key={q.key} className="space-y-1">
            {fieldLabel}
            <div className="flex flex-wrap gap-2">
              {q.options?.map(opt => {
                const selected = value === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setAnswer(q.key, opt.value)}
                    className={`px-4 py-2 rounded-xl text-sm transition ${
                      selected
                        ? "bg-teal-500 text-white shadow-lg shadow-teal-500/25"
                        : "bg-white/5 border border-white/10 text-white/70 hover:bg-white/10"
                    }`}
                  >
                    {t(opt.label, lang)}
                  </button>
                );
              })}
            </div>
          </div>
        );

      case "true-false":
        return (
          <div key={q.key} className="space-y-1">
            {fieldLabel}
            <div className="flex gap-3">
              {(["yes", "no"] as const).map(v => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setAnswer(q.key, v)}
                  className={`px-6 py-2 rounded-xl text-sm transition ${
                    value === v
                      ? "bg-teal-500 text-white shadow-lg shadow-teal-500/25"
                      : "bg-white/5 border border-white/10 text-white/70 hover:bg-white/10"
                  }`}
                >
                  {ui(v, lang)}
                </button>
              ))}
            </div>
          </div>
        );

      case "multi-select":
        return (
          <div key={q.key} className="space-y-1">
            {fieldLabel}
            <div className="flex flex-wrap gap-2">
              {q.options?.map(opt => {
                const selected = getMulti(q.key).includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggleMulti(q.key, opt.value)}
                    className={`px-4 py-2 rounded-xl text-sm transition ${
                      selected
                        ? "bg-teal-500 text-white shadow-lg shadow-teal-500/25"
                        : "bg-white/5 border border-white/10 text-white/70 hover:bg-white/10"
                    }`}
                  >
                    {t(opt.label, lang)}
                  </button>
                );
              })}
            </div>
          </div>
        );

      case "multi-select-detail": {
        const detailKey = `${q.key}_detail`;
        return (
          <div key={q.key} className="space-y-2">
            <div className="flex items-center justify-between">
              {fieldLabel}
              <div className="flex gap-2">{aiButton}</div>
            </div>
            <div className="flex flex-wrap gap-2">
              {q.options?.map(opt => {
                const selected = getMulti(q.key).includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggleMulti(q.key, opt.value)}
                    className={`px-4 py-2 rounded-xl text-sm transition ${
                      selected
                        ? "bg-teal-500 text-white shadow-lg shadow-teal-500/25"
                        : "bg-white/5 border border-white/10 text-white/70 hover:bg-white/10"
                    }`}
                  >
                    {t(opt.label, lang)}
                  </button>
                );
              })}
            </div>
            {getMulti(q.key).length > 0 && (
              <textarea
                value={answers[detailKey] || ""}
                onChange={e => setAnswer(detailKey, e.target.value)}
                placeholder={ui("addDetails", lang)}
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-teal-500/40 resize-none text-sm"
              />
            )}
          </div>
        );
      }

      case "ranking": {
        const items: string[] = (() => {
          try {
            const parsed = JSON.parse(value) as string[];
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
          } catch { /* ignore */ }
          return q.options?.map(o => o.value) || [];
        })();

        const moveItem = (idx: number, dir: -1 | 1) => {
          const next = [...items];
          const target = idx + dir;
          if (target < 0 || target >= next.length) return;
          [next[idx], next[target]] = [next[target], next[idx]];
          setAnswer(q.key, JSON.stringify(next));
        };

        const optionMap = new Map(q.options?.map(o => [o.value, o]) || []);

        return (
          <div key={q.key} className="space-y-1">
            {fieldLabel}
            <div className="space-y-1.5">
              {items.map((item, idx) => {
                const opt = optionMap.get(item);
                return (
                  <div key={item} className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2">
                    <span className="text-teal-400 font-bold text-sm w-6">{idx + 1}</span>
                    <span className="flex-1 text-white/80 text-sm">
                      {opt ? t(opt.label, lang) : item}
                    </span>
                    <button
                      type="button"
                      onClick={() => moveItem(idx, -1)}
                      disabled={idx === 0}
                      className="text-white/40 hover:text-white disabled:opacity-20 text-xs px-1"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      onClick={() => moveItem(idx, 1)}
                      disabled={idx === items.length - 1}
                      className="text-white/40 hover:text-white disabled:opacity-20 text-xs px-1"
                    >
                      ▼
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TEAM INVITE RENDERER
  // ═══════════════════════════════════════════════════════════════════════════

  function renderTeamInvite(): JSX.Element {
    return (
      <div className="space-y-6">
        {([0, 1] as const).map(idx => (
          <div key={idx} className="bg-white/5 rounded-2xl p-5 border border-white/10 space-y-3">
            <h4 className="text-white font-semibold text-sm">
              {ui("inviteTitle", lang, { n: String(idx + 1) })}
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-white/60 mb-1 block">{ui("firstName", lang)}</label>
                <input
                  type="text"
                  value={invites[idx].firstName}
                  onChange={e => updateInvite(idx, "firstName", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                />
              </div>
              <div>
                <label className="text-xs text-white/60 mb-1 block">{ui("lastName", lang)}</label>
                <input
                  type="text"
                  value={invites[idx].lastName}
                  onChange={e => updateInvite(idx, "lastName", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-white/60 mb-1 block">{ui("jobTitle", lang)}</label>
              <input
                type="text"
                value={invites[idx].jobTitle}
                onChange={e => updateInvite(idx, "jobTitle", e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/40"
              />
            </div>
            <div>
              <label className="text-xs text-white/60 mb-1 block">{ui("email", lang)}</label>
              <input
                type="email"
                value={invites[idx].email}
                onChange={e => updateInvite(idx, "email", e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/40"
              />
              {inviteErrors[idx] && (
                <p className="text-red-400 text-xs mt-1">{inviteErrors[idx]}</p>
              )}
            </div>
            <div>
              <label className="text-xs text-white/60 mb-1 block">{ui("accessLevel", lang)}</label>
              <div className="flex flex-wrap gap-2">
                {TEAM_ROLES.map(role => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => updateInvite(idx, "role", role.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs transition ${
                      invites[idx].role === role.value
                        ? "bg-teal-500 text-white"
                        : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10"
                    }`}
                  >
                    {t(role.label, lang)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-white/60 mb-1 block">{ui("permissions", lang)}</label>
              <div className="flex flex-wrap gap-1.5">
                {TEAM_PERMISSIONS.map(perm => (
                  <button
                    key={perm.value}
                    type="button"
                    onClick={() => togglePermission(idx, perm.value)}
                    className={`px-2.5 py-1 rounded-lg text-xs transition ${
                      invites[idx].permissions.includes(perm.value)
                        ? "bg-teal-600/40 text-teal-300 border border-teal-500/30"
                        : "bg-white/5 border border-white/10 text-white/40 hover:bg-white/10"
                    }`}
                  >
                    {t(perm.label, lang)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
        {inviteStatus && (
          <p className={`text-sm text-center ${inviteStatus.includes("sent") || inviteStatus.includes("تم") ? "text-green-400" : "text-red-400"}`}>
            {inviteStatus}
          </p>
        )}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => void sendInvites()}
            disabled={saving || (!invites[0].email && !invites[1].email)}
            className="flex-1 py-3 rounded-xl bg-teal-500 text-white font-semibold hover:bg-teal-400 transition disabled:opacity-40"
          >
            {saving ? ui("saving", lang) : ui("sendInvites", lang)}
          </button>
          <button
            type="button"
            onClick={() => void goNext()}
            className="px-6 py-3 rounded-xl bg-white/10 text-white/70 hover:bg-white/15 transition"
          >
            {ui("skip", lang)}
          </button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // REVIEW RENDERER
  // ═══════════════════════════════════════════════════════════════════════════

  function renderReview(): JSX.Element {
    return (
      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
        {STEPS.filter(s => s.id < 12).map(s => {
          const stepAnswers = s.questions
            .map(q => ({ q, val: answers[q.key] || "" }))
            .filter(({ val }) => val);

          return (
            <div key={s.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-white font-semibold text-sm">{t(s.title, lang)}</h4>
                <button
                  type="button"
                  onClick={() => goToStep(s.id)}
                  className="text-xs text-teal-400 hover:text-teal-300"
                >
                  {ui("editSection", lang)}
                </button>
              </div>
              {stepAnswers.length === 0 ? (
                <p className="text-white/30 text-xs">{ui("noAnswers", lang)}</p>
              ) : (
                <div className="space-y-1">
                  {stepAnswers.map(({ q, val }) => {
                    let displayVal = val;
                    try {
                      const parsed = JSON.parse(val);
                      if (Array.isArray(parsed)) displayVal = parsed.join(", ");
                    } catch { /* plain string */ }
                    return (
                      <div key={q.key} className="text-xs">
                        <span className="text-white/50">{t(q.label, lang)}: </span>
                        <span className="text-white/80">{displayVal}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
        <button
          type="button"
          onClick={() => void handleConfirm()}
          disabled={saving}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-teal-500 to-teal-400 text-white font-bold text-lg hover:from-teal-400 hover:to-teal-300 transition shadow-lg shadow-teal-500/25 disabled:opacity-50"
        >
          {saving ? ui("saving", lang) : ui("confirmGenerate", lang)}
        </button>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP CONTENT RENDERER
  // ═══════════════════════════════════════════════════════════════════════════

  function renderStepContent(): JSX.Element {
    if (step.special === "team-invite") return renderTeamInvite();
    if (step.special === "review") return renderReview();

    // Language change handler for Step 0
    const handleLangChange = (val: string) => {
      setAnswer("language", val);
      setLang(val === "العربية" ? "ar" : "en");
    };

    return (
      <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-2">
        {step.questions.map(q => {
          // Special handling for language selector
          if (q.key === "language") {
            return (
              <div key={q.key} className="space-y-1">
                <label className="block text-sm font-medium text-white/80 mb-1.5">
                  {t(q.label, lang)}
                </label>
                <div className="flex gap-3">
                  {q.options?.map(opt => {
                    const selected = answers.language === opt.value ||
                      (!answers.language && opt.value === "English");
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleLangChange(opt.value)}
                        className={`px-6 py-3 rounded-xl text-sm font-medium transition ${
                          selected
                            ? "bg-teal-500 text-white shadow-lg shadow-teal-500/25"
                            : "bg-white/5 border border-white/10 text-white/70 hover:bg-white/10"
                        }`}
                      >
                        {t(opt.label, lang)}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          }
          return renderField(q);
        })}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PROGRESS BAR
  // ═══════════════════════════════════════════════════════════════════════════

  function renderProgress(): JSX.Element {
    const pct = ((currentStep + 1) / totalSteps) * 100;
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-white/50">
          <span>{ui("stepOf", lang, { current: String(currentStep + 1), total: String(totalSteps) })}</span>
          <span>{Math.round(pct)}%</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full"
            initial={false}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MAIN LAYOUT
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="min-h-screen gradient-hero flex items-center justify-center p-4"
    >
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="h-8 mx-auto mb-4 flex justify-center"><AvoraLogo variant="light" /></div>
          {renderProgress()}
        </div>

        {/* Card */}
        <div className="glass-dark rounded-3xl p-8 shadow-2xl border border-white/10 relative overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={TRANSITION}
            >
              {/* Step Title */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white">{t(step.title, lang)}</h2>
                {step.subtitle && (
                  <p className="text-white/50 text-sm mt-1">{t(step.subtitle, lang)}</p>
                )}
              </div>

              {/* Step Content */}
              {renderStepContent()}

              {/* Navigation (not for team-invite or review — they have their own buttons) */}
              {step.special !== "team-invite" && step.special !== "review" && (
                <div className="flex items-center justify-between mt-8 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={goBack}
                    disabled={currentStep === 0}
                    className="px-5 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition disabled:opacity-0 disabled:pointer-events-none"
                  >
                    {ui("back", lang)}
                  </button>

                  <div className="flex items-center gap-3">
                    {saving && (
                      <span className="text-xs text-teal-400">{ui("saving", lang)}</span>
                    )}
                    <button
                      type="button"
                      onClick={() => void goNext()}
                      disabled={!isStepValid(step)}
                      className="px-8 py-2.5 rounded-xl bg-teal-500 text-white font-semibold hover:bg-teal-400 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-teal-500/25"
                    >
                      {ui("next", lang)}
                    </button>
                  </div>
                </div>
              )}

              {/* Review step: back button */}
              {step.special === "review" && (
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={goBack}
                    className="px-5 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition"
                  >
                    {ui("back", lang)}
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Step nav dots */}
        <div className="flex justify-center gap-1.5 mt-4">
          {STEPS.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => goToStep(idx)}
              className={`w-2 h-2 rounded-full transition ${
                idx === currentStep
                  ? "bg-teal-400 w-6"
                  : idx < currentStep
                    ? "bg-teal-600"
                    : "bg-white/20"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
