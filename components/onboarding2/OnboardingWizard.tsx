"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { T, Lang } from "./translations";

// ── Types ──────────────────────────────────────────────────────────────────────

type AnswerVal = string | string[];
type StepAnswers = Record<string, AnswerVal>;
type AllAnswers = Record<number, StepAnswers>;

interface UploadedFile {
  url: string;
  name: string;
}

// ── Utility ────────────────────────────────────────────────────────────────────

function cx(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

// ── Animation variants ─────────────────────────────────────────────────────────

const stepVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 56 : -56,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.28, ease: "easeOut" as const },
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -56 : 56,
    opacity: 0,
    transition: { duration: 0.2, ease: "easeIn" as const },
  }),
};

// ── Primitives ─────────────────────────────────────────────────────────────────

function Chip({
  label,
  selected,
  onClick,
  disabled,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled || selected ? { scale: 1.03 } : {}}
      whileTap={!disabled || selected ? { scale: 0.97 } : {}}
      className={cx(
        "px-4 py-2 rounded-full text-sm font-medium border transition-colors duration-150",
        selected
          ? "bg-[#1a5c4a] text-white border-[#1a5c4a] shadow-sm"
          : "bg-white text-gray-700 border-gray-200 hover:border-[#1a5c4a] hover:text-[#1a5c4a]",
        disabled && !selected && "opacity-40 cursor-not-allowed"
      )}
    >
      {label}
    </motion.button>
  );
}

function AIButton({
  onClick,
  loading,
  lang,
}: {
  onClick: () => void;
  loading: boolean;
  lang: Lang;
}) {
  const t = T[lang];
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={loading}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-[#1a5c4a] to-[#2a7c64] text-white hover:opacity-90 disabled:opacity-50 transition-opacity shadow-sm"
    >
      {loading ? (
        <>
          <span className="inline-block w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          {t.generating}
        </>
      ) : (
        t.generateWithAI
      )}
    </motion.button>
  );
}

function Toggle({
  value,
  onChange,
  yes,
  no,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  yes: string;
  no: string;
}) {
  return (
    <div className="flex gap-3">
      {[
        { v: true, label: yes },
        { v: false, label: no },
      ].map(({ v, label }) => (
        <motion.button
          key={String(v)}
          type="button"
          onClick={() => onChange(v)}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className={cx(
            "px-7 py-2.5 rounded-xl text-sm font-semibold border transition-colors duration-150",
            value === v
              ? "bg-[#1a5c4a] text-white border-[#1a5c4a] shadow-sm"
              : "bg-white text-gray-600 border-gray-200 hover:border-[#1a5c4a] hover:text-[#1a5c4a]"
          )}
        >
          {label}
        </motion.button>
      ))}
    </div>
  );
}

function Label({
  text,
  optional,
  lang,
}: {
  text: string;
  optional?: boolean;
  lang: Lang;
}) {
  return (
    <label className="block text-sm font-semibold text-gray-800 mb-2 leading-snug">
      {text}
      {optional && (
        <span className="ml-2 text-xs font-normal text-gray-400">
          {T[lang].optional}
        </span>
      )}
    </label>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1a5c4a]/25 focus:border-[#1a5c4a] transition-all placeholder-gray-400"
    />
  );
}

function Textarea({
  value,
  onChange,
  placeholder,
  maxLength,
  rows = 4,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
  rows?: number;
}) {
  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={rows}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1a5c4a]/25 focus:border-[#1a5c4a] transition-all resize-none placeholder-gray-400"
      />
      {maxLength && (
        <span className="absolute bottom-3 right-4 text-[10px] text-gray-400">
          {value.length}/{maxLength}
        </span>
      )}
    </div>
  );
}

function SingleSelect({
  options,
  value,
  onChange,
}: {
  options: { val: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <Chip
          key={o.val}
          label={o.label}
          selected={value === o.val}
          onClick={() => onChange(o.val)}
        />
      ))}
    </div>
  );
}

function MultiSelect({
  options,
  value,
  onChange,
  max,
}: {
  options: { val: string; label: string }[];
  value: string[];
  onChange: (v: string[]) => void;
  max?: number;
}) {
  const toggle = (val: string) => {
    if (value.includes(val)) {
      onChange(value.filter((v) => v !== val));
    } else if (!max || value.length < max) {
      onChange([...value, val]);
    }
  };
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <Chip
          key={o.val}
          label={o.label}
          selected={value.includes(o.val)}
          onClick={() => toggle(o.val)}
          disabled={!!max && value.length >= max && !value.includes(o.val)}
        />
      ))}
    </div>
  );
}

// ── File upload widget ─────────────────────────────────────────────────────────

function FileUploadArea({
  files,
  onChange,
  hint,
  lang,
  multiple = true,
}: {
  files: UploadedFile[];
  onChange: (f: UploadedFile[]) => void;
  hint: string;
  lang: Lang;
  multiple?: boolean;
}) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const t = T[lang];

  async function handleFiles(fileList: File[]) {
    if (!fileList.length) return;
    setUploading(true);
    const uploaded: UploadedFile[] = [];
    for (const file of fileList) {
      const fd = new FormData();
      fd.append("file", file);
      try {
        const res = await fetch("/api/onboarding/upload", {
          method: "POST",
          body: fd,
        });
        const d = await res.json();
        if (d.fileUrl) uploaded.push({ url: d.fileUrl, name: file.name });
      } catch {
        /* silent */
      }
    }
    onChange(multiple ? [...files, ...uploaded] : uploaded);
    setUploading(false);
  }

  return (
    <div className="space-y-3">
      <motion.label
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(Array.from(e.dataTransfer.files));
        }}
        animate={{ borderColor: dragOver ? "#1a5c4a" : "#e5e7eb" }}
        className="block border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer hover:border-[#1a5c4a] transition-colors group"
      >
        <div className="text-3xl mb-2">{uploading ? "⏳" : "📎"}</div>
        <p className="text-sm font-medium text-gray-600 group-hover:text-[#1a5c4a]">
          {uploading ? t.uploading : t.uploadHint}
        </p>
        <p className="text-xs text-gray-400 mt-1">{hint}</p>
        <input
          type="file"
          multiple={multiple}
          accept=".pdf,.ppt,.pptx,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp"
          onChange={(e) => handleFiles(Array.from(e.target.files ?? []))}
          className="sr-only"
          disabled={uploading}
        />
      </motion.label>

      <AnimatePresence>
        {files.map((f, i) => (
          <motion.div
            key={f.url}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5"
          >
            <div className="flex items-center gap-2 text-sm text-emerald-700 min-w-0">
              <span className="text-emerald-500">✓</span>
              <span className="truncate font-medium">{f.name}</span>
            </div>
            <button
              type="button"
              onClick={() => onChange(files.filter((_, j) => j !== i))}
              className="text-xs text-red-400 hover:text-red-600 ml-3 flex-shrink-0 transition-colors"
            >
              {t.removeFile}
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ── AI generate helper ─────────────────────────────────────────────────────────

async function aiGenerate(
  field: string,
  context: Record<string, string>,
  lang: Lang
): Promise<string> {
  const res = await fetch("/api/onboarding/ai-generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ field, context, lang }),
  });
  const d = await res.json();
  if (!res.ok || !d.text) throw new Error(d.error || "Empty response from AI");
  return d.text;
}

// ── Animated Progress Bar ──────────────────────────────────────────────────────

function ProgressBar({ step, total }: { step: number; total: number }) {
  const pct = Math.round(((step + 1) / total) * 100);
  return (
    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-gradient-to-r from-[#1a5c4a] to-[#2a7c64] rounded-full"
        initial={false}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.5, ease: "easeOut" as const }}
      />
    </div>
  );
}

// ── Step Dots ─────────────────────────────────────────────────────────────────

function StepDots({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5 overflow-hidden max-w-[200px]">
      {Array.from({ length: total }, (_, i) => (
        <motion.div
          key={i}
          animate={{
            width: i === step ? 20 : 6,
            backgroundColor: i < step ? "#1a5c4a" : i === step ? "#1a5c4a" : "#d1d5db",
            opacity: Math.abs(i - step) > 4 ? 0.3 : 1,
          }}
          transition={{ duration: 0.3 }}
          className="h-1.5 rounded-full flex-shrink-0"
        />
      ))}
    </div>
  );
}

// ── Confetti ───────────────────────────────────────────────────────────────────

function Confetti() {
  const colors = [
    "#1a5c4a",
    "#ff6b5b",
    "#fbbf24",
    "#60a5fa",
    "#a78bfa",
    "#34d399",
    "#f472b6",
  ];
  const pieces = Array.from({ length: 70 }, (_, i) => ({
    id: i,
    color: colors[i % colors.length],
    x: Math.random() * 100,
    delay: Math.random() * 0.8,
    size: 7 + Math.random() * 9,
    rotation: Math.random() * 360,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: -20, x: `${p.x}vw`, rotate: p.rotation, opacity: 1 }}
          animate={{
            y: "110vh",
            rotate: p.rotation + 720,
            opacity: [1, 1, 0.8, 0],
          }}
          transition={{
            duration: 2.5 + Math.random() * 1.5,
            delay: p.delay,
            ease: "easeIn",
          }}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
          }}
        >
          <div
            className="rounded-sm"
            style={{
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}

// ── Review card ────────────────────────────────────────────────────────────────

function ReviewSection({
  title,
  data,
  index,
}: {
  title: string;
  data: Record<string, AnswerVal>;
  index: number;
}) {
  const entries = Object.entries(data).filter(
    ([, v]) => v && (Array.isArray(v) ? v.length > 0 : v !== "")
  );
  if (!entries.length) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm"
    >
      <h3 className="font-semibold text-[#1a5c4a] text-sm mb-3 flex items-center gap-2">
        <span className="w-5 h-5 rounded-full bg-[#1a5c4a]/10 text-[#1a5c4a] text-[10px] font-bold flex items-center justify-center flex-shrink-0">
          {index + 1}
        </span>
        {title}
      </h3>
      <div className="space-y-2">
        {entries.slice(0, 6).map(([k, v]) => (
          <div key={k} className="flex gap-2 text-sm">
            <span className="text-gray-400 font-medium min-w-0 break-words capitalize shrink-0">
              {k.replace(/_/g, " ")}:
            </span>
            <span className="text-gray-700 flex-1 break-words">
              {Array.isArray(v) ? v.join(", ") : v}
            </span>
          </div>
        ))}
        {entries.length > 6 && (
          <p className="text-xs text-gray-400">+{entries.length - 6} more fields</p>
        )}
      </div>
    </motion.div>
  );
}

// ── Field wrapper ──────────────────────────────────────────────────────────────

function Field({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cx("space-y-2", className)}>{children}</div>;
}

// ── Step icon map ──────────────────────────────────────────────────────────────

const STEP_ICONS = [
  "🏢", "💼", "📊", "🎯", "🌍", "👤", "📈", "⭐", "🏆", "📣", "📄", "🚀",
];

// ── Main wizard ────────────────────────────────────────────────────────────────

const TOTAL_STEPS = 12;

export default function OnboardingWizard() {
  const [lang, setLang] = useState<Lang>("ar");
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState<AllAnswers>({});
  const [showConfetti, setShowConfetti] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");
  const [logoFile, setLogoFile] = useState<UploadedFile[]>([]);
  const [s8Files, setS8Files] = useState<UploadedFile[]>([]);
  const [s11ProfileFiles, setS11ProfileFiles] = useState<UploadedFile[]>([]);
  const [s11BrochureFiles, setS11BrochureFiles] = useState<UploadedFile[]>([]);
  const [aiLoading, setAiLoading] = useState<Record<string, boolean>>({});
  const [aiError, setAiError] = useState("");
  const savingRef = useRef(false);

  const t = T[lang];
  const isRTL = lang === "ar";

  // ── Answer helpers ───────────────────────────────────────────────────────────

  const get = useCallback(
    (s: number, key: string, def: AnswerVal = ""): AnswerVal => {
      return answers[s]?.[key] ?? def;
    },
    [answers]
  );

  const set = useCallback((s: number, key: string, val: AnswerVal) => {
    setAnswers((prev) => ({ ...prev, [s]: { ...prev[s], [key]: val } }));
  }, []);

  const getStr = (s: number, key: string) => String(get(s, key, ""));
  const getArr = (s: number, key: string) => {
    const v = get(s, key, []);
    return Array.isArray(v) ? v : [];
  };

  // ── Persist & restore ────────────────────────────────────────────────────────

  useEffect(() => {
    fetch("/api/onboarding/answers")
      .then((r) => r.json())
      .then((d) => {
        if (d.answers) {
          const restored: AllAnswers = {};
          for (const [stepStr, kvs] of Object.entries(d.answers)) {
            const stepNum = Number(stepStr);
            restored[stepNum] = {};
            for (const [k, v] of Object.entries(kvs as Record<string, string>)) {
              try {
                const parsed = JSON.parse(v as string);
                restored[stepNum][k] = Array.isArray(parsed) ? parsed : (v as string);
              } catch {
                restored[stepNum][k] = v as string;
              }
            }
          }
          setAnswers(restored);
        }
      })
      .catch(() => {});
  }, []);

  const saveStep = useCallback(
    async (stepNum: number, stepAnswers: StepAnswers) => {
      if (savingRef.current) return;
      if (!Object.keys(stepAnswers).length) return;
      savingRef.current = true;
      const serialized: Record<string, string> = {};
      for (const [k, v] of Object.entries(stepAnswers)) {
        serialized[k] = Array.isArray(v) ? JSON.stringify(v) : String(v);
      }
      try {
        await fetch("/api/onboarding/answers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ step: stepNum, answers: serialized }),
        });
      } catch (err) {
        console.error(`[saveStep] step ${stepNum} error:`, err);
      } finally {
        savingRef.current = false;
      }
    },
    []
  );

  // ── Navigation ───────────────────────────────────────────────────────────────

  const navigate = useCallback(
    async (dir: "forward" | "back") => {
      if (dir === "forward" && answers[step]) {
        await saveStep(step, answers[step]);
      }
      setDirection(dir === "forward" ? 1 : -1);
      setStep((s) =>
        dir === "forward"
          ? Math.min(s + 1, TOTAL_STEPS - 1)
          : Math.max(s - 1, 0)
      );
    },
    [step, answers, saveStep]
  );

  // ── AI generate ──────────────────────────────────────────────────────────────

  const buildContext = (): Record<string, string> => {
    const ctx: Record<string, string> = {};
    for (const [, kvs] of Object.entries(answers)) {
      for (const [k, v] of Object.entries(kvs)) {
        ctx[k] = Array.isArray(v) ? v.join(", ") : v;
      }
    }
    return ctx;
  };

  const handleAI = async (field: string, setFn: (v: string) => void) => {
    setAiLoading((p) => ({ ...p, [field]: true }));
    setAiError("");
    try {
      const text = await aiGenerate(field, buildContext(), lang);
      setFn(text);
    } catch (err) {
      console.error("[handleAI] error for field:", field, err);
      const msg = lang === "ar"
        ? "فشل التوليد. تأكد من إدخال معلومات الشركة في الخطوات السابقة ثم حاول مرة أخرى."
        : "Generation failed. Make sure you've filled in company details in earlier steps, then try again.";
      setAiError(msg);
      // Auto-clear after 5 seconds
      setTimeout(() => setAiError(""), 5000);
    } finally {
      setAiLoading((p) => ({ ...p, [field]: false }));
    }
  };

  // ── Final generate ───────────────────────────────────────────────────────────

  const handleGenerate = async () => {
    setGenerating(true);
    setGenerateError("");

    // Save all step answers to the database first
    for (let s = 0; s <= 10; s++) {
      if (answers[s] && Object.keys(answers[s]).length) {
        savingRef.current = false;
        await saveStep(s, answers[s]);
      }
    }

    // Call the report generation API
    try {
      console.log("[handleGenerate] calling /api/reports/generate...");
      const res = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: lang }),
      });

      if (!res.ok) {
        let errMsg = "Report generation failed. Please try again.";
        try {
          const data = await res.json();
          console.error("[handleGenerate] API error:", res.status, data);
          if (data.error === "REGEN_CREDIT_REQUIRED") {
            errMsg = lang === "ar"
              ? "لقد استهلكت حد الإنشاء الشهري. يرجى التواصل مع الدعم."
              : "You have used your monthly generation credit. Please contact support.";
          }
        } catch { /* non-JSON response */ }
        setGenerateError(errMsg);
        setGenerating(false);
        return;
      }

      console.log("[handleGenerate] success — redirecting to dashboard");
      // Show confetti briefly, then redirect
      setShowConfetti(true);
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 2800);
    } catch (err) {
      console.error("[handleGenerate] network error:", err);
      setGenerateError(
        lang === "ar"
          ? "خطأ في الشبكة. يرجى التحقق من اتصالك والمحاولة مرة أخرى."
          : "Network error. Please check your connection and try again."
      );
      setGenerating(false);
    }
  };

  // ── Step renders ─────────────────────────────────────────────────────────────

  const stepContent = () => {
    switch (step) {
      // ── Step 1: Company Identity ────────────────────────────────────────────
      case 0:
        return (
          <div className="space-y-5">
            <Field>
              <Label text={t.s1_companyName} lang={lang} />
              <TextInput
                value={getStr(0, "companyName")}
                onChange={(v) => set(0, "companyName", v)}
              />
            </Field>
            <Field>
              <Label text={t.s1_website} lang={lang} optional />
              <TextInput
                value={getStr(0, "website")}
                onChange={(v) => set(0, "website", v)}
                type="url"
                placeholder="https://"
              />
            </Field>
            <Field>
              <Label text={t.s1_logo} lang={lang} optional />
              <FileUploadArea
                files={logoFile}
                onChange={(f) => {
                  setLogoFile(f);
                  if (f[0]) set(0, "logoUrl", f[0].url);
                }}
                hint={t.s1_logoHint}
                lang={lang}
                multiple={false}
              />
            </Field>
            <Field>
              <Label text={t.s1_employees} lang={lang} />
              <SingleSelect
                options={[
                  { val: "1-10", label: t.s1_emp1 },
                  { val: "11-50", label: t.s1_emp2 },
                  { val: "51-200", label: t.s1_emp3 },
                  { val: "200+", label: t.s1_emp4 },
                ]}
                value={getStr(0, "employees")}
                onChange={(v) => set(0, "employees", v)}
              />
            </Field>
            <Field>
              <Label text={t.s1_revenue} lang={lang} />
              <SingleSelect
                options={[
                  { val: "<100k", label: t.s1_rev1 },
                  { val: "100k-500k", label: t.s1_rev2 },
                  { val: "500k-1m", label: t.s1_rev3 },
                  { val: "1m-5m", label: t.s1_rev4 },
                  { val: "5m+", label: t.s1_rev5 },
                ]}
                value={getStr(0, "revenue")}
                onChange={(v) => set(0, "revenue", v)}
              />
            </Field>
            <Field>
              <Label text={t.s1_linkedin} lang={lang} optional />
              <TextInput
                value={getStr(0, "linkedin")}
                onChange={(v) => set(0, "linkedin", v)}
                placeholder="https://linkedin.com/company/…"
              />
            </Field>
          </div>
        );

      // ── Step 2: What You Sell ───────────────────────────────────────────────
      case 1:
        return (
          <div className="space-y-5">
            <Field>
              <Label text={t.s2_productName} lang={lang} />
              <TextInput
                value={getStr(1, "productName")}
                onChange={(v) => set(1, "productName", v)}
              />
            </Field>
            <Field>
              <Label text={t.s2_type} lang={lang} />
              <SingleSelect
                options={[
                  { val: "product", label: t.s2_type1 },
                  { val: "service", label: t.s2_type2 },
                  { val: "saas", label: t.s2_type3 },
                  { val: "consulting", label: t.s2_type4 },
                  { val: "agency", label: t.s2_type5 },
                ]}
                value={getStr(1, "type")}
                onChange={(v) => set(1, "type", v)}
              />
            </Field>
            <Field>
              <div className="flex items-center justify-between mb-2">
                <Label text={t.s2_description} lang={lang} />
                <AIButton
                  onClick={() =>
                    handleAI("description", (v) => set(1, "description", v))
                  }
                  loading={!!aiLoading["description"]}
                  lang={lang}
                />
              </div>
              <Textarea
                value={getStr(1, "description")}
                onChange={(v) => set(1, "description", v)}
                maxLength={200}
                rows={3}
                placeholder={t.s2_descHint}
              />
            </Field>
            <Field>
              <Label text={t.s2_pricing} lang={lang} />
              <SingleSelect
                options={[
                  { val: "one-time", label: t.s2_price1 },
                  { val: "monthly", label: t.s2_price2 },
                  { val: "project", label: t.s2_price3 },
                  { val: "commission", label: t.s2_price4 },
                  { val: "freemium", label: t.s2_price5 },
                ]}
                value={getStr(1, "pricing")}
                onChange={(v) => set(1, "pricing", v)}
              />
            </Field>
            <Field>
              <Label text={t.s2_dealSize} lang={lang} />
              <SingleSelect
                options={[
                  { val: "<1k", label: t.s2_deal1 },
                  { val: "1k-5k", label: t.s2_deal2 },
                  { val: "5k-20k", label: t.s2_deal3 },
                  { val: "20k-100k", label: t.s2_deal4 },
                  { val: "100k+", label: t.s2_deal5 },
                ]}
                value={getStr(1, "dealSize")}
                onChange={(v) => set(1, "dealSize", v)}
              />
            </Field>
            <Field>
              <Label text={t.s2_cycle} lang={lang} />
              <SingleSelect
                options={[
                  { val: "same-day", label: t.s2_cyc1 },
                  { val: "1-2w", label: t.s2_cyc2 },
                  { val: "1-3m", label: t.s2_cyc3 },
                  { val: "3-6m", label: t.s2_cyc4 },
                  { val: "6m+", label: t.s2_cyc5 },
                ]}
                value={getStr(1, "salesCycle")}
                onChange={(v) => set(1, "salesCycle", v)}
              />
            </Field>
          </div>
        );

      // ── Step 3: Current Sales Process ───────────────────────────────────────
      case 2: {
        const hasTeam = getStr(2, "hasTeam") === "yes";
        return (
          <div className="space-y-5">
            <Field>
              <Label text={t.s3_leadSources} lang={lang} />
              <p className="text-xs text-gray-400 -mt-1">{t.selectAll}</p>
              <MultiSelect
                options={[
                  { val: "cold", label: t.s3_src1 },
                  { val: "referrals", label: t.s3_src2 },
                  { val: "inbound", label: t.s3_src3 },
                  { val: "paid-ads", label: t.s3_src4 },
                  { val: "events", label: t.s3_src5 },
                  { val: "social", label: t.s3_src6 },
                  { val: "none", label: t.s3_src7 },
                ]}
                value={getArr(2, "leadSources")}
                onChange={(v) => set(2, "leadSources", v)}
              />
            </Field>
            <Field>
              <Label text={t.s3_tools} lang={lang} />
              <MultiSelect
                options={[
                  { val: "linkedin", label: t.s3_tool1 },
                  { val: "email", label: t.s3_tool2 },
                  { val: "whatsapp", label: t.s3_tool3 },
                  { val: "crm", label: t.s3_tool4 },
                  { val: "none", label: t.s3_tool5 },
                ]}
                value={getArr(2, "tools")}
                onChange={(v) => set(2, "tools", v)}
              />
            </Field>
            <Field>
              <Label text={t.s3_hasTeam} lang={lang} />
              <Toggle
                value={hasTeam}
                onChange={(v) => set(2, "hasTeam", v ? "yes" : "no")}
                yes={t.yes}
                no={t.no}
              />
            </Field>
            <AnimatePresence>
              {hasTeam && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-5 overflow-hidden"
                >
                  <Field>
                    <Label text={t.s3_teamSize} lang={lang} />
                    <SingleSelect
                      options={[
                        { val: "1", label: t.s3_sz1 },
                        { val: "2-3", label: t.s3_sz2 },
                        { val: "4-10", label: t.s3_sz3 },
                        { val: "10+", label: t.s3_sz4 },
                      ]}
                      value={getStr(2, "teamSize")}
                      onChange={(v) => set(2, "teamSize", v)}
                    />
                  </Field>
                  <Field>
                    <Label text={t.s3_roles} lang={lang} />
                    <MultiSelect
                      options={[
                        { val: "sdr", label: t.s3_role1 },
                        { val: "bdr", label: t.s3_role2 },
                        { val: "ae", label: t.s3_role3 },
                        { val: "sm", label: t.s3_role4 },
                        { val: "founder", label: t.s3_role5 },
                      ]}
                      value={getArr(2, "roles")}
                      onChange={(v) => set(2, "roles", v)}
                    />
                  </Field>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      }

      // ── Step 4: Biggest Challenges ──────────────────────────────────────────
      case 3:
        return (
          <div className="space-y-5">
            <Field>
              <Label text={t.s4_challenges} lang={lang} />
              <p className="text-xs text-gray-400 -mt-1">{t.selectUpTo3}</p>
              <MultiSelect
                max={3}
                options={[
                  { val: "not-enough-leads", label: t.s4_ch1 },
                  { val: "poor-quality", label: t.s4_ch2 },
                  { val: "low-reply", label: t.s4_ch3 },
                  { val: "no-dm", label: t.s4_ch4 },
                  { val: "long-cycle", label: t.s4_ch5 },
                  { val: "no-icp", label: t.s4_ch6 },
                  { val: "no-followup", label: t.s4_ch7 },
                  { val: "pricing-obj", label: t.s4_ch8 },
                  { val: "competition", label: t.s4_ch9 },
                ]}
                value={getArr(3, "challenges")}
                onChange={(v) => set(3, "challenges", v)}
              />
            </Field>
            <Field>
              <div className="flex items-center justify-between mb-2">
                <Label text={t.s4_biggestPain} lang={lang} optional />
                <AIButton
                  onClick={() =>
                    handleAI("biggestPain", (v) => set(3, "biggestPain", v))
                  }
                  loading={!!aiLoading["biggestPain"]}
                  lang={lang}
                />
              </div>
              <Textarea
                value={getStr(3, "biggestPain")}
                onChange={(v) => set(3, "biggestPain", v)}
                rows={3}
              />
            </Field>
          </div>
        );

      // ── Step 5: Target Market ───────────────────────────────────────────────
      case 4:
        return (
          <div className="space-y-5">
            <Field>
              <Label text={t.s5_countries} lang={lang} />
              <MultiSelect
                options={[
                  { val: "eg", label: t.s5_c1 },
                  { val: "sa", label: t.s5_c2 },
                  { val: "ae", label: t.s5_c3 },
                  { val: "qa", label: t.s5_c4 },
                  { val: "kw", label: t.s5_c5 },
                  { val: "eu", label: t.s5_c6 },
                  { val: "us", label: t.s5_c7 },
                  { val: "other", label: t.s5_c8 },
                ]}
                value={getArr(4, "countries")}
                onChange={(v) => set(4, "countries", v)}
              />
            </Field>
            <Field>
              <Label text={t.s5_industries} lang={lang} />
              <MultiSelect
                options={[
                  { val: "saas", label: t.s5_i1 },
                  { val: "ecom", label: t.s5_i2 },
                  { val: "realestate", label: t.s5_i3 },
                  { val: "health", label: t.s5_i4 },
                  { val: "edu", label: t.s5_i5 },
                  { val: "mfg", label: t.s5_i6 },
                  { val: "retail", label: t.s5_i7 },
                  { val: "finance", label: t.s5_i8 },
                  { val: "other", label: t.s5_i9 },
                ]}
                value={getArr(4, "industries")}
                onChange={(v) => set(4, "industries", v)}
              />
            </Field>
            <Field>
              <Label text={t.s5_companySize} lang={lang} />
              <MultiSelect
                options={[
                  { val: "1-10", label: t.s5_cs1 },
                  { val: "11-50", label: t.s5_cs2 },
                  { val: "51-200", label: t.s5_cs3 },
                  { val: "200-500", label: t.s5_cs4 },
                  { val: "500+", label: t.s5_cs5 },
                ]}
                value={getArr(4, "companySize")}
                onChange={(v) => set(4, "companySize", v)}
              />
            </Field>
            <Field>
              <Label text={t.s5_b2b} lang={lang} />
              <Toggle
                value={getStr(4, "b2b") !== "b2c"}
                onChange={(v) => set(4, "b2b", v ? "b2b" : "b2c")}
                yes="B2B"
                no="B2C"
              />
            </Field>
          </div>
        );

      // ── Step 6: ICP Hints ───────────────────────────────────────────────────
      case 5:
        return (
          <div className="space-y-5">
            <Field>
              <div className="flex items-center justify-between mb-2">
                <Label text={t.s6_jobTitles} lang={lang} />
                <AIButton
                  onClick={() =>
                    handleAI("jobTitles", (v) => set(5, "jobTitles", v))
                  }
                  loading={!!aiLoading["jobTitles"]}
                  lang={lang}
                />
              </div>
              <TextInput
                value={getStr(5, "jobTitles")}
                onChange={(v) => set(5, "jobTitles", v)}
                placeholder="CEO, VP Sales, CTO…"
              />
            </Field>
            <Field>
              <Label text={t.s6_triggers} lang={lang} />
              <MultiSelect
                options={[
                  { val: "funding", label: t.s6_tr1 },
                  { val: "hiring", label: t.s6_tr2 },
                  { val: "launch", label: t.s6_tr3 },
                  { val: "expansion", label: t.s6_tr4 },
                  { val: "pain", label: t.s6_tr5 },
                  { val: "seasonal", label: t.s6_tr6 },
                ]}
                value={getArr(5, "triggers")}
                onChange={(v) => set(5, "triggers", v)}
              />
            </Field>
            <Field>
              <div className="flex items-center justify-between mb-2">
                <Label text={t.s6_disqualifiers} lang={lang} optional />
                <AIButton
                  onClick={() =>
                    handleAI("disqualifiers", (v) => set(5, "disqualifiers", v))
                  }
                  loading={!!aiLoading["disqualifiers"]}
                  lang={lang}
                />
              </div>
              <Textarea
                value={getStr(5, "disqualifiers")}
                onChange={(v) => set(5, "disqualifiers", v)}
                rows={3}
              />
            </Field>
          </div>
        );

      // ── Step 7: Sales Targets ───────────────────────────────────────────────
      case 6:
        return (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <Label text={t.s7_meetingTarget} lang={lang} />
                <TextInput
                  value={getStr(6, "meetingTarget")}
                  onChange={(v) => set(6, "meetingTarget", v)}
                  type="number"
                  placeholder="10"
                />
              </Field>
              <Field>
                <Label text={t.s7_dealsTarget} lang={lang} />
                <TextInput
                  value={getStr(6, "dealsTarget")}
                  onChange={(v) => set(6, "dealsTarget", v)}
                  type="number"
                  placeholder="3"
                />
              </Field>
            </div>
            <Field>
              <Label text={t.s7_revenueTarget} lang={lang} />
              <SingleSelect
                options={[
                  { val: "<50k", label: t.s7_rev1 },
                  { val: "50k-200k", label: t.s7_rev2 },
                  { val: "200k-500k", label: t.s7_rev3 },
                  { val: "500k-1m", label: t.s7_rev4 },
                  { val: "1m+", label: t.s7_rev5 },
                ]}
                value={getStr(6, "revenueTarget")}
                onChange={(v) => set(6, "revenueTarget", v)}
              />
            </Field>
            <Field>
              <Label text={t.s7_mainMetric} lang={lang} />
              <SingleSelect
                options={[
                  { val: "meetings", label: t.s7_m1 },
                  { val: "deals", label: t.s7_m2 },
                  { val: "revenue", label: t.s7_m3 },
                  { val: "pipeline", label: t.s7_m4 },
                ]}
                value={getStr(6, "mainMetric")}
                onChange={(v) => set(6, "mainMetric", v)}
              />
            </Field>
          </div>
        );

      // ── Step 8: Success Stories ─────────────────────────────────────────────
      case 7:
        return (
          <div className="space-y-5">
            <Field>
              <Label text={t.s8_files} lang={lang} optional />
              <FileUploadArea
                files={s8Files}
                onChange={(f) => {
                  setS8Files(f);
                  set(7, "successFiles", f.map((x) => x.url).join(","));
                }}
                hint={t.s8_filesHint}
                lang={lang}
              />
            </Field>
            <Field>
              <div className="flex items-center justify-between mb-2">
                <Label text={t.s8_bestResult} lang={lang} optional />
                <AIButton
                  onClick={() =>
                    handleAI("bestResult", (v) => set(7, "bestResult", v))
                  }
                  loading={!!aiLoading["bestResult"]}
                  lang={lang}
                />
              </div>
              <Textarea
                value={getStr(7, "bestResult")}
                onChange={(v) => set(7, "bestResult", v)}
                rows={4}
              />
            </Field>
            <Field>
              <Label text={t.s8_notableClients} lang={lang} optional />
              <TextInput
                value={getStr(7, "notableClients")}
                onChange={(v) => set(7, "notableClients", v)}
              />
            </Field>
          </div>
        );

      // ── Step 9: Competition & Positioning ──────────────────────────────────
      case 8:
        return (
          <div className="space-y-5">
            <Field>
              <div className="flex items-center justify-between mb-2">
                <Label text={t.s9_competitors} lang={lang} optional />
                <AIButton
                  onClick={() =>
                    handleAI("competitors", (v) => set(8, "competitors", v))
                  }
                  loading={!!aiLoading["competitors"]}
                  lang={lang}
                />
              </div>
              <Textarea
                value={getStr(8, "competitors")}
                onChange={(v) => set(8, "competitors", v)}
                rows={3}
              />
            </Field>
            <Field>
              <div className="flex items-center justify-between mb-2">
                <Label text={t.s9_differentiation} lang={lang} />
                <AIButton
                  onClick={() =>
                    handleAI("differentiation", (v) =>
                      set(8, "differentiation", v)
                    )
                  }
                  loading={!!aiLoading["differentiation"]}
                  lang={lang}
                />
              </div>
              <Textarea
                value={getStr(8, "differentiation")}
                onChange={(v) => set(8, "differentiation", v)}
                rows={3}
              />
            </Field>
            <Field>
              <div className="flex items-center justify-between mb-2">
                <Label text={t.s9_valueProposition} lang={lang} />
                <AIButton
                  onClick={() =>
                    handleAI("valueProposition", (v) =>
                      set(8, "valueProposition", v)
                    )
                  }
                  loading={!!aiLoading["valueProposition"]}
                  lang={lang}
                />
              </div>
              <Textarea
                value={getStr(8, "valueProposition")}
                onChange={(v) => set(8, "valueProposition", v)}
                rows={3}
              />
            </Field>
          </div>
        );

      // ── Step 10: Outreach Preferences ──────────────────────────────────────
      case 9:
        return (
          <div className="space-y-5">
            <Field>
              <Label text={t.s10_channels} lang={lang} />
              <MultiSelect
                options={[
                  { val: "cold-email", label: t.s10_ch1 },
                  { val: "linkedin", label: t.s10_ch2 },
                  { val: "whatsapp", label: t.s10_ch3 },
                  { val: "cold-calls", label: t.s10_ch4 },
                  { val: "all", label: t.s10_ch5 },
                ]}
                value={getArr(9, "channels")}
                onChange={(v) => set(9, "channels", v)}
              />
            </Field>
            <Field>
              <Label text={t.s10_outreachLang} lang={lang} />
              <SingleSelect
                options={[
                  { val: "ar", label: t.s10_l1 },
                  { val: "en", label: t.s10_l2 },
                  { val: "both", label: t.s10_l3 },
                ]}
                value={getStr(9, "outreachLang")}
                onChange={(v) => set(9, "outreachLang", v)}
              />
            </Field>
            <Field>
              <Label text={t.s10_tone} lang={lang} />
              <SingleSelect
                options={[
                  { val: "formal", label: t.s10_t1 },
                  { val: "semi-formal", label: t.s10_t2 },
                  { val: "casual", label: t.s10_t3 },
                ]}
                value={getStr(9, "tone")}
                onChange={(v) => set(9, "tone", v)}
              />
            </Field>
            {[
              { key: "coldCall", label: t.s10_coldCall },
              { key: "emailSeq", label: t.s10_emailSeq },
              { key: "linkedinSeq", label: t.s10_linkedinSeq },
              { key: "whatsappSeq", label: t.s10_whatsappSeq },
            ].map(({ key, label }) => (
              <Field key={key}>
                <Label text={label} lang={lang} />
                <Toggle
                  value={getStr(9, key) === "yes"}
                  onChange={(v) => set(9, key, v ? "yes" : "no")}
                  yes={t.yes}
                  no={t.no}
                />
              </Field>
            ))}
          </div>
        );

      // ── Step 11: Company Documents ──────────────────────────────────────────
      case 10:
        return (
          <div className="space-y-5">
            <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4 text-sm text-teal-700">
              {t.s11_helpText}
            </div>
            <Field>
              <Label text={t.s11_profile} lang={lang} optional />
              <FileUploadArea
                files={s11ProfileFiles}
                onChange={(f) => {
                  setS11ProfileFiles(f);
                  set(10, "profileFiles", f.map((x) => x.url).join(","));
                }}
                hint={t.s11_profileHint}
                lang={lang}
              />
            </Field>
            <Field>
              <Label text={t.s11_brochure} lang={lang} optional />
              <FileUploadArea
                files={s11BrochureFiles}
                onChange={(f) => {
                  setS11BrochureFiles(f);
                  set(10, "brochureFiles", f.map((x) => x.url).join(","));
                }}
                hint={t.s11_brochureHint}
                lang={lang}
              />
            </Field>
          </div>
        );

      // ── Step 12: Review & Generate ──────────────────────────────────────────
      case 11: {
        const stepNames = t.steps;
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">{t.s12_subtitle}</p>
            {Array.from({ length: 11 }, (_, i) => {
              const data = answers[i] ?? {};
              if (!Object.keys(data).length) return null;
              return (
                <ReviewSection
                  key={i}
                  title={stepNames[i]}
                  data={data}
                  index={i}
                />
              );
            })}

            {/* Language toggle for final review */}
            <div className="flex items-center gap-2 pt-2">
              <span className="text-sm text-gray-500">
                {lang === "ar"
                  ? "لغة التقرير:"
                  : "Report language:"}
              </span>
              <button
                type="button"
                onClick={() => setLang((l) => (l === "ar" ? "en" : "ar"))}
                className="px-4 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-[#1a5c4a] hover:text-white transition-all"
              >
                {lang === "ar" ? "Switch to English" : "التبديل إلى العربية"}
              </button>
            </div>

            {generateError && (
              <div className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-center">
                {generateError}
              </div>
            )}

            <div className="pt-2">
              <motion.button
                type="button"
                onClick={handleGenerate}
                disabled={generating}
                whileHover={{ scale: generating ? 1 : 1.02 }}
                whileTap={{ scale: generating ? 1 : 0.98 }}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#1a5c4a] to-[#2a7c64] text-white font-bold text-lg shadow-lg hover:shadow-xl transition-shadow disabled:opacity-60 disabled:cursor-not-allowed relative overflow-hidden"
              >
                {generating && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  />
                )}
                <span className="relative">
                  {generating ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      {t.s12_generating}
                    </span>
                  ) : (
                    t.s12_generate
                  )}
                </span>
              </motion.button>
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  // ── Layout ───────────────────────────────────────────────────────────────────

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-[#f0faf7] via-white to-[#fff8f7]"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {showConfetti && <Confetti />}

      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center gap-4 mb-2.5">
            {/* Logo */}
            <span className="font-extrabold text-[#1a5c4a] text-lg tracking-tight flex-shrink-0">
              AVORA
            </span>

            {/* Step dots */}
            <div className="flex-1 flex items-center justify-center">
              <StepDots step={step} total={TOTAL_STEPS} />
            </div>

            {/* Step counter */}
            <span className="text-xs text-gray-400 flex-shrink-0 font-medium tabular-nums">
              {t.step} {step + 1}/{TOTAL_STEPS}
            </span>

            {/* Lang toggle */}
            <motion.button
              type="button"
              onClick={() => setLang((l) => (l === "ar" ? "en" : "ar"))}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-bold hover:bg-[#1a5c4a] hover:text-white transition-colors"
            >
              {lang === "ar" ? "EN" : "AR"}
            </motion.button>
          </div>

          {/* Animated progress bar */}
          <ProgressBar step={step} total={TOTAL_STEPS} />
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Step header */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={`header-${step}`}
            custom={isRTL ? -direction : direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="mb-7"
          >
            <div className="flex items-center gap-3 mb-1">
              {/* Step icon badge */}
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.05, type: "spring", stiffness: 300 }}
                className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#1a5c4a] to-[#2a7c64] text-white text-xl flex items-center justify-center flex-shrink-0 shadow-md"
              >
                {STEP_ICONS[step]}
              </motion.div>
              <div>
                <p className="text-xs font-medium text-[#1a5c4a] uppercase tracking-wider mb-0.5">
                  {t.step} {step + 1} {t.of} {TOTAL_STEPS}
                </p>
                <h1 className="text-xl font-bold text-gray-900 leading-tight">
                  {t.steps[step]}
                </h1>
              </div>
            </div>

            {showConfetti && (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[#1a5c4a] font-semibold text-center mt-4"
              >
                {t.confetti}
              </motion.p>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Step content */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={`content-${step}`}
            custom={isRTL ? -direction : direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              {stepContent()}
            </div>

            {aiError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-center"
              >
                {aiError}
              </motion.div>
            )}

            {/* Navigation */}
            <div
              className={cx(
                "flex mt-5 gap-3",
                isRTL ? "flex-row-reverse" : "flex-row"
              )}
            >
              {step > 0 && step < TOTAL_STEPS - 1 && (
                <motion.button
                  type="button"
                  onClick={() => navigate("back")}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:border-[#1a5c4a] hover:text-[#1a5c4a] transition-colors"
                >
                  {t.back}
                </motion.button>
              )}

              {step < TOTAL_STEPS - 1 && (
                <motion.button
                  type="button"
                  onClick={() => navigate("forward")}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 py-3 rounded-xl bg-[#1a5c4a] text-white text-sm font-semibold hover:bg-[#154d3d] transition-colors shadow-sm"
                >
                  {t.next}
                </motion.button>
              )}

              {step === TOTAL_STEPS - 1 && step > 0 && (
                <motion.button
                  type="button"
                  onClick={() => navigate("back")}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:border-[#1a5c4a] hover:text-[#1a5c4a] transition-colors"
                >
                  {t.back}
                </motion.button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
