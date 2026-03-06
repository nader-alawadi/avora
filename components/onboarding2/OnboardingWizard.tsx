"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { T, Lang } from "./translations";

// ── Types ──────────────────────────────────────────────────────────────────────

type AnswerVal = string | string[];
type StepAnswers = Record<string, AnswerVal>;
type AllAnswers = Record<number, StepAnswers>;

interface UploadedFile {
  url: string;
  name: string;
}

// ── Primitives ─────────────────────────────────────────────────────────────────

function cx(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function Chip({
  label, selected, onClick, disabled,
}: { label: string; selected: boolean; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cx(
        "px-4 py-2 rounded-full text-sm font-medium border transition-all",
        selected
          ? "bg-[#1a5c4a] text-white border-[#1a5c4a]"
          : "bg-white text-gray-700 border-gray-200 hover:border-[#1a5c4a] hover:text-[#1a5c4a]",
        disabled && !selected && "opacity-40 cursor-not-allowed"
      )}
    >
      {label}
    </button>
  );
}

function AIButton({
  onClick, loading, lang,
}: { onClick: () => void; loading: boolean; lang: Lang }) {
  const t = T[lang];
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-[#1a5c4a] to-[#2a7c64] text-white hover:opacity-90 disabled:opacity-50 transition-all shadow-sm"
    >
      {loading ? t.generating : t.generateWithAI}
    </button>
  );
}

function Toggle({
  value, onChange, yes, no,
}: { value: boolean; onChange: (v: boolean) => void; yes: string; no: string }) {
  return (
    <div className="flex gap-3">
      {[{ v: true, label: yes }, { v: false, label: no }].map(({ v, label }) => (
        <button
          key={String(v)}
          type="button"
          onClick={() => onChange(v)}
          className={cx(
            "px-6 py-2.5 rounded-xl text-sm font-semibold border transition-all",
            value === v
              ? "bg-[#1a5c4a] text-white border-[#1a5c4a]"
              : "bg-white text-gray-600 border-gray-200 hover:border-[#1a5c4a]"
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function Label({ text, optional, lang }: { text: string; optional?: boolean; lang: Lang }) {
  return (
    <label className="block text-sm font-semibold text-gray-800 mb-2">
      {text}
      {optional && <span className="ml-2 text-xs font-normal text-gray-400">{T[lang].optional}</span>}
    </label>
  );
}

function TextInput({
  value, onChange, placeholder, type = "text",
}: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5c4a]/30 focus:border-[#1a5c4a] transition-all"
    />
  );
}

function Textarea({
  value, onChange, placeholder, maxLength, rows = 4,
}: { value: string; onChange: (v: string) => void; placeholder?: string; maxLength?: number; rows?: number }) {
  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={rows}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5c4a]/30 focus:border-[#1a5c4a] transition-all resize-none"
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
  options, value, onChange,
}: { options: { val: string; label: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <Chip key={o.val} label={o.label} selected={value === o.val} onClick={() => onChange(o.val)} />
      ))}
    </div>
  );
}

function MultiSelect({
  options, value, onChange, max,
}: { options: { val: string; label: string }[]; value: string[]; onChange: (v: string[]) => void; max?: number }) {
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
  files, onChange, hint, lang, multiple = true,
}: { files: UploadedFile[]; onChange: (f: UploadedFile[]) => void; hint: string; lang: Lang; multiple?: boolean }) {
  const [uploading, setUploading] = useState(false);
  const t = T[lang];

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const list = Array.from(e.target.files ?? []);
    if (!list.length) return;
    setUploading(true);
    const uploaded: UploadedFile[] = [];
    for (const file of list) {
      const fd = new FormData();
      fd.append("file", file);
      try {
        const res = await fetch("/api/onboarding/upload", { method: "POST", body: fd });
        const d = await res.json();
        if (d.fileUrl) uploaded.push({ url: d.fileUrl, name: file.name });
      } catch { /* silent */ }
    }
    onChange(multiple ? [...files, ...uploaded] : uploaded);
    setUploading(false);
    e.target.value = "";
  }

  return (
    <div className="space-y-3">
      <label className="block border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center cursor-pointer hover:border-[#1a5c4a] transition-colors group">
        <div className="text-3xl mb-2">📎</div>
        <p className="text-sm font-medium text-gray-600 group-hover:text-[#1a5c4a]">
          {uploading ? t.uploading : t.uploadHint}
        </p>
        <p className="text-xs text-gray-400 mt-1">{hint}</p>
        <input
          type="file"
          multiple={multiple}
          accept=".pdf,.ppt,.pptx,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp"
          onChange={handleFiles}
          className="sr-only"
          disabled={uploading}
        />
      </label>
      {files.map((f, i) => (
        <div key={i} className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-2.5">
          <div className="flex items-center gap-2 text-sm text-green-700 min-w-0">
            <span>✓</span>
            <span className="truncate font-medium">{f.name}</span>
          </div>
          <button
            type="button"
            onClick={() => onChange(files.filter((_, j) => j !== i))}
            className="text-xs text-red-400 hover:text-red-600 ml-3 flex-shrink-0"
          >
            {t.removeFile}
          </button>
        </div>
      ))}
    </div>
  );
}

// ── AI generate helper ─────────────────────────────────────────────────────────

async function aiGenerate(field: string, context: Record<string, string>, lang: Lang): Promise<string> {
  const res = await fetch("/api/onboarding/ai-generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ field, context, lang }),
  });
  const d = await res.json();
  return d.text ?? "";
}

// ── Progress bar ───────────────────────────────────────────────────────────────

function ProgressBar({ step, total }: { step: number; total: number }) {
  const pct = Math.round(((step + 1) / total) * 100);
  return (
    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-[#1a5c4a] to-[#2a7c64] rounded-full transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ── Confetti ───────────────────────────────────────────────────────────────────

function Confetti() {
  const colors = ["#1a5c4a", "#ff6b5b", "#fbbf24", "#60a5fa", "#a78bfa", "#34d399"];
  const pieces = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    color: colors[i % colors.length],
    x: Math.random() * 100,
    delay: Math.random() * 1.5,
    size: 8 + Math.random() * 8,
  }));
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute top-0 animate-bounce"
          style={{
            left: `${p.x}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${1 + Math.random()}s`,
          }}
        >
          <div
            className="rounded-sm"
            style={{ width: p.size, height: p.size, backgroundColor: p.color, transform: `rotate(${Math.random() * 360}deg)` }}
          />
        </div>
      ))}
    </div>
  );
}

// ── Review card ────────────────────────────────────────────────────────────────

function ReviewSection({ title, data }: { title: string; data: Record<string, AnswerVal> }) {
  const entries = Object.entries(data).filter(([, v]) => v && (Array.isArray(v) ? v.length > 0 : v !== ""));
  if (!entries.length) return null;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <h3 className="font-semibold text-[#1a5c4a] text-sm mb-3">{title}</h3>
      <div className="space-y-2">
        {entries.map(([k, v]) => (
          <div key={k} className="flex gap-2 text-sm">
            <span className="text-gray-400 font-medium min-w-0 break-words capitalize">{k.replace(/_/g, " ")}:</span>
            <span className="text-gray-700 flex-1">{Array.isArray(v) ? v.join(", ") : v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Field wrapper ──────────────────────────────────────────────────────────────

function Field({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cx("space-y-2", className)}>{children}</div>;
}

// ── Main wizard ────────────────────────────────────────────────────────────────

const TOTAL_STEPS = 12;

export default function OnboardingWizard() {
  const [lang, setLang] = useState<Lang>("ar");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<AllAnswers>({});
  const [animDir, setAnimDir] = useState<"forward" | "back">("forward");
  const [visible, setVisible] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [logoFile, setLogoFile] = useState<UploadedFile[]>([]);
  const [s8Files, setS8Files] = useState<UploadedFile[]>([]);
  const [s11ProfileFiles, setS11ProfileFiles] = useState<UploadedFile[]>([]);
  const [s11BrochureFiles, setS11BrochureFiles] = useState<UploadedFile[]>([]);
  const [aiLoading, setAiLoading] = useState<Record<string, boolean>>({});
  const savingRef = useRef(false);

  const t = T[lang];
  const isRTL = lang === "ar";

  // ── Answer helpers ───────────────────────────────────────────────────────────

  const get = useCallback((s: number, key: string, def: AnswerVal = ""): AnswerVal => {
    return answers[s]?.[key] ?? def;
  }, [answers]);

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
          // Convert JSON-encoded arrays back
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

  const saveStep = useCallback(async (stepNum: number, stepAnswers: StepAnswers) => {
    if (savingRef.current) return;
    if (!Object.keys(stepAnswers).length) return; // nothing to save
    savingRef.current = true;
    const serialized: Record<string, string> = {};
    for (const [k, v] of Object.entries(stepAnswers)) {
      serialized[k] = Array.isArray(v) ? JSON.stringify(v) : String(v);
    }
    try {
      const res = await fetch("/api/onboarding/answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: stepNum, answers: serialized }),
      });
      if (!res.ok) {
        console.error(`[saveStep] step ${stepNum} save failed:`, await res.text());
      }
    } catch (err) {
      console.error(`[saveStep] step ${stepNum} network error:`, err);
    } finally {
      savingRef.current = false; // always release the lock
    }
  }, []);

  // ── Navigation ───────────────────────────────────────────────────────────────

  const navigate = useCallback(async (dir: "forward" | "back") => {
    if (dir === "forward" && answers[step]) {
      await saveStep(step, answers[step]);
    }
    setAnimDir(dir);
    setVisible(false);
    setTimeout(() => {
      setStep((s) => dir === "forward" ? Math.min(s + 1, TOTAL_STEPS - 1) : Math.max(s - 1, 0));
      setVisible(true);
    }, 200);
  }, [step, answers, saveStep]);

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
    const text = await aiGenerate(field, buildContext(), lang);
    if (text) setFn(text);
    setAiLoading((p) => ({ ...p, [field]: false }));
  };

  // ── Final generate ───────────────────────────────────────────────────────────

  const handleGenerate = async () => {
    setGenerating(true);

    // Save all unsaved steps before generating (flush every step in order)
    for (let s = 0; s <= 10; s++) {
      if (answers[s] && Object.keys(answers[s]).length) {
        savingRef.current = false; // release lock between steps
        await saveStep(s, answers[s]);
      }
    }

    setShowConfetti(true);

    setTimeout(async () => {
      try {
        const res = await fetch("/api/reports/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ language: lang }),
        });
        if (!res.ok) {
          console.error("[handleGenerate] generate failed:", res.status, await res.text());
        }
      } catch (err) {
        console.error("[handleGenerate] network error:", err);
      } finally {
        window.location.href = "/dashboard";
      }
    }, 2000);
  };

  // ── Step renders ─────────────────────────────────────────────────────────────

  const stepContent = () => {
    switch (step) {
      // ── Step 1: Company Identity ────────────────────────────────────────────
      case 0: return (
        <div className="space-y-5">
          <Field>
            <Label text={t.s1_companyName} lang={lang} />
            <TextInput value={getStr(0, "companyName")} onChange={(v) => set(0, "companyName", v)} />
          </Field>
          <Field>
            <Label text={t.s1_website} lang={lang} optional />
            <TextInput value={getStr(0, "website")} onChange={(v) => set(0, "website", v)} type="url" placeholder="https://" />
          </Field>
          <Field>
            <Label text={t.s1_logo} lang={lang} optional />
            <FileUploadArea
              files={logoFile}
              onChange={(f) => { setLogoFile(f); if (f[0]) set(0, "logoUrl", f[0].url); }}
              hint={t.s1_logoHint}
              lang={lang}
              multiple={false}
            />
          </Field>
          <Field>
            <Label text={t.s1_employees} lang={lang} />
            <SingleSelect
              options={[
                { val: "1-10", label: t.s1_emp1 }, { val: "11-50", label: t.s1_emp2 },
                { val: "51-200", label: t.s1_emp3 }, { val: "200+", label: t.s1_emp4 },
              ]}
              value={getStr(0, "employees")}
              onChange={(v) => set(0, "employees", v)}
            />
          </Field>
          <Field>
            <Label text={t.s1_revenue} lang={lang} />
            <SingleSelect
              options={[
                { val: "<100k", label: t.s1_rev1 }, { val: "100k-500k", label: t.s1_rev2 },
                { val: "500k-1m", label: t.s1_rev3 }, { val: "1m-5m", label: t.s1_rev4 }, { val: "5m+", label: t.s1_rev5 },
              ]}
              value={getStr(0, "revenue")}
              onChange={(v) => set(0, "revenue", v)}
            />
          </Field>
          <Field>
            <Label text={t.s1_linkedin} lang={lang} optional />
            <TextInput value={getStr(0, "linkedin")} onChange={(v) => set(0, "linkedin", v)} placeholder="https://linkedin.com/company/…" />
          </Field>
        </div>
      );

      // ── Step 2: What You Sell ───────────────────────────────────────────────
      case 1: return (
        <div className="space-y-5">
          <Field>
            <Label text={t.s2_productName} lang={lang} />
            <TextInput value={getStr(1, "productName")} onChange={(v) => set(1, "productName", v)} />
          </Field>
          <Field>
            <Label text={t.s2_type} lang={lang} />
            <SingleSelect
              options={[
                { val: "product", label: t.s2_type1 }, { val: "service", label: t.s2_type2 },
                { val: "saas", label: t.s2_type3 }, { val: "consulting", label: t.s2_type4 }, { val: "agency", label: t.s2_type5 },
              ]}
              value={getStr(1, "type")}
              onChange={(v) => set(1, "type", v)}
            />
          </Field>
          <Field>
            <div className="flex items-center justify-between mb-2">
              <Label text={t.s2_description} lang={lang} />
              <AIButton onClick={() => handleAI("description", (v) => set(1, "description", v))} loading={!!aiLoading["description"]} lang={lang} />
            </div>
            <Textarea value={getStr(1, "description")} onChange={(v) => set(1, "description", v)} maxLength={200} rows={3} placeholder={t.s2_descHint} />
          </Field>
          <Field>
            <Label text={t.s2_pricing} lang={lang} />
            <SingleSelect
              options={[
                { val: "one-time", label: t.s2_price1 }, { val: "monthly", label: t.s2_price2 },
                { val: "project", label: t.s2_price3 }, { val: "commission", label: t.s2_price4 }, { val: "freemium", label: t.s2_price5 },
              ]}
              value={getStr(1, "pricing")}
              onChange={(v) => set(1, "pricing", v)}
            />
          </Field>
          <Field>
            <Label text={t.s2_dealSize} lang={lang} />
            <SingleSelect
              options={[
                { val: "<1k", label: t.s2_deal1 }, { val: "1k-5k", label: t.s2_deal2 },
                { val: "5k-20k", label: t.s2_deal3 }, { val: "20k-100k", label: t.s2_deal4 }, { val: "100k+", label: t.s2_deal5 },
              ]}
              value={getStr(1, "dealSize")}
              onChange={(v) => set(1, "dealSize", v)}
            />
          </Field>
          <Field>
            <Label text={t.s2_cycle} lang={lang} />
            <SingleSelect
              options={[
                { val: "same-day", label: t.s2_cyc1 }, { val: "1-2w", label: t.s2_cyc2 },
                { val: "1-3m", label: t.s2_cyc3 }, { val: "3-6m", label: t.s2_cyc4 }, { val: "6m+", label: t.s2_cyc5 },
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
                  { val: "cold", label: t.s3_src1 }, { val: "referrals", label: t.s3_src2 },
                  { val: "inbound", label: t.s3_src3 }, { val: "paid-ads", label: t.s3_src4 },
                  { val: "events", label: t.s3_src5 }, { val: "social", label: t.s3_src6 }, { val: "none", label: t.s3_src7 },
                ]}
                value={getArr(2, "leadSources")}
                onChange={(v) => set(2, "leadSources", v)}
              />
            </Field>
            <Field>
              <Label text={t.s3_tools} lang={lang} />
              <MultiSelect
                options={[
                  { val: "linkedin", label: t.s3_tool1 }, { val: "email", label: t.s3_tool2 },
                  { val: "whatsapp", label: t.s3_tool3 }, { val: "crm", label: t.s3_tool4 }, { val: "none", label: t.s3_tool5 },
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
                yes={t.yes} no={t.no}
              />
            </Field>
            {hasTeam && (
              <>
                <Field>
                  <Label text={t.s3_teamSize} lang={lang} />
                  <SingleSelect
                    options={[
                      { val: "1", label: t.s3_sz1 }, { val: "2-3", label: t.s3_sz2 },
                      { val: "4-10", label: t.s3_sz3 }, { val: "10+", label: t.s3_sz4 },
                    ]}
                    value={getStr(2, "teamSize")}
                    onChange={(v) => set(2, "teamSize", v)}
                  />
                </Field>
                <Field>
                  <Label text={t.s3_roles} lang={lang} />
                  <MultiSelect
                    options={[
                      { val: "sdr", label: t.s3_role1 }, { val: "bdr", label: t.s3_role2 },
                      { val: "ae", label: t.s3_role3 }, { val: "sm", label: t.s3_role4 }, { val: "founder", label: t.s3_role5 },
                    ]}
                    value={getArr(2, "roles")}
                    onChange={(v) => set(2, "roles", v)}
                  />
                </Field>
              </>
            )}
          </div>
        );
      }

      // ── Step 4: Biggest Challenges ──────────────────────────────────────────
      case 3: return (
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
              <AIButton onClick={() => handleAI("biggestPain", (v) => set(3, "biggestPain", v))} loading={!!aiLoading["biggestPain"]} lang={lang} />
            </div>
            <Textarea value={getStr(3, "biggestPain")} onChange={(v) => set(3, "biggestPain", v)} rows={3} />
          </Field>
        </div>
      );

      // ── Step 5: Target Market ───────────────────────────────────────────────
      case 4: return (
        <div className="space-y-5">
          <Field>
            <Label text={t.s5_countries} lang={lang} />
            <MultiSelect
              options={[
                { val: "eg", label: t.s5_c1 }, { val: "sa", label: t.s5_c2 }, { val: "ae", label: t.s5_c3 },
                { val: "qa", label: t.s5_c4 }, { val: "kw", label: t.s5_c5 }, { val: "eu", label: t.s5_c6 },
                { val: "us", label: t.s5_c7 }, { val: "other", label: t.s5_c8 },
              ]}
              value={getArr(4, "countries")}
              onChange={(v) => set(4, "countries", v)}
            />
          </Field>
          <Field>
            <Label text={t.s5_industries} lang={lang} />
            <MultiSelect
              options={[
                { val: "saas", label: t.s5_i1 }, { val: "ecom", label: t.s5_i2 }, { val: "realestate", label: t.s5_i3 },
                { val: "health", label: t.s5_i4 }, { val: "edu", label: t.s5_i5 }, { val: "mfg", label: t.s5_i6 },
                { val: "retail", label: t.s5_i7 }, { val: "finance", label: t.s5_i8 }, { val: "other", label: t.s5_i9 },
              ]}
              value={getArr(4, "industries")}
              onChange={(v) => set(4, "industries", v)}
            />
          </Field>
          <Field>
            <Label text={t.s5_companySize} lang={lang} />
            <MultiSelect
              options={[
                { val: "1-10", label: t.s5_cs1 }, { val: "11-50", label: t.s5_cs2 }, { val: "51-200", label: t.s5_cs3 },
                { val: "200-500", label: t.s5_cs4 }, { val: "500+", label: t.s5_cs5 },
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
              yes="B2B" no="B2C"
            />
          </Field>
        </div>
      );

      // ── Step 6: ICP Hints ───────────────────────────────────────────────────
      case 5: return (
        <div className="space-y-5">
          <Field>
            <div className="flex items-center justify-between mb-2">
              <Label text={t.s6_jobTitles} lang={lang} />
              <AIButton onClick={() => handleAI("jobTitles", (v) => set(5, "jobTitles", v))} loading={!!aiLoading["jobTitles"]} lang={lang} />
            </div>
            <TextInput value={getStr(5, "jobTitles")} onChange={(v) => set(5, "jobTitles", v)} placeholder="CEO, VP Sales, CTO…" />
          </Field>
          <Field>
            <Label text={t.s6_triggers} lang={lang} />
            <MultiSelect
              options={[
                { val: "funding", label: t.s6_tr1 }, { val: "hiring", label: t.s6_tr2 },
                { val: "launch", label: t.s6_tr3 }, { val: "expansion", label: t.s6_tr4 },
                { val: "pain", label: t.s6_tr5 }, { val: "seasonal", label: t.s6_tr6 },
              ]}
              value={getArr(5, "triggers")}
              onChange={(v) => set(5, "triggers", v)}
            />
          </Field>
          <Field>
            <div className="flex items-center justify-between mb-2">
              <Label text={t.s6_disqualifiers} lang={lang} optional />
              <AIButton onClick={() => handleAI("disqualifiers", (v) => set(5, "disqualifiers", v))} loading={!!aiLoading["disqualifiers"]} lang={lang} />
            </div>
            <Textarea value={getStr(5, "disqualifiers")} onChange={(v) => set(5, "disqualifiers", v)} rows={3} />
          </Field>
        </div>
      );

      // ── Step 7: Sales Targets ───────────────────────────────────────────────
      case 6: return (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <Label text={t.s7_meetingTarget} lang={lang} />
              <TextInput value={getStr(6, "meetingTarget")} onChange={(v) => set(6, "meetingTarget", v)} type="number" placeholder="10" />
            </Field>
            <Field>
              <Label text={t.s7_dealsTarget} lang={lang} />
              <TextInput value={getStr(6, "dealsTarget")} onChange={(v) => set(6, "dealsTarget", v)} type="number" placeholder="3" />
            </Field>
          </div>
          <Field>
            <Label text={t.s7_revenueTarget} lang={lang} />
            <SingleSelect
              options={[
                { val: "<50k", label: t.s7_rev1 }, { val: "50k-200k", label: t.s7_rev2 },
                { val: "200k-500k", label: t.s7_rev3 }, { val: "500k-1m", label: t.s7_rev4 }, { val: "1m+", label: t.s7_rev5 },
              ]}
              value={getStr(6, "revenueTarget")}
              onChange={(v) => set(6, "revenueTarget", v)}
            />
          </Field>
          <Field>
            <Label text={t.s7_mainMetric} lang={lang} />
            <SingleSelect
              options={[
                { val: "meetings", label: t.s7_m1 }, { val: "deals", label: t.s7_m2 },
                { val: "revenue", label: t.s7_m3 }, { val: "pipeline", label: t.s7_m4 },
              ]}
              value={getStr(6, "mainMetric")}
              onChange={(v) => set(6, "mainMetric", v)}
            />
          </Field>
        </div>
      );

      // ── Step 8: Success Stories ─────────────────────────────────────────────
      case 7: return (
        <div className="space-y-5">
          <Field>
            <Label text={t.s8_files} lang={lang} optional />
            <FileUploadArea files={s8Files} onChange={(f) => { setS8Files(f); set(7, "successFiles", f.map(x => x.url).join(",")); }} hint={t.s8_filesHint} lang={lang} />
          </Field>
          <Field>
            <div className="flex items-center justify-between mb-2">
              <Label text={t.s8_bestResult} lang={lang} optional />
              <AIButton onClick={() => handleAI("bestResult", (v) => set(7, "bestResult", v))} loading={!!aiLoading["bestResult"]} lang={lang} />
            </div>
            <Textarea value={getStr(7, "bestResult")} onChange={(v) => set(7, "bestResult", v)} rows={4} />
          </Field>
          <Field>
            <Label text={t.s8_notableClients} lang={lang} optional />
            <TextInput value={getStr(7, "notableClients")} onChange={(v) => set(7, "notableClients", v)} />
          </Field>
        </div>
      );

      // ── Step 9: Competition & Positioning ──────────────────────────────────
      case 8: return (
        <div className="space-y-5">
          <Field>
            <div className="flex items-center justify-between mb-2">
              <Label text={t.s9_competitors} lang={lang} optional />
              <AIButton onClick={() => handleAI("competitors", (v) => set(8, "competitors", v))} loading={!!aiLoading["competitors"]} lang={lang} />
            </div>
            <Textarea value={getStr(8, "competitors")} onChange={(v) => set(8, "competitors", v)} rows={3} />
          </Field>
          <Field>
            <div className="flex items-center justify-between mb-2">
              <Label text={t.s9_differentiation} lang={lang} />
              <AIButton onClick={() => handleAI("differentiation", (v) => set(8, "differentiation", v))} loading={!!aiLoading["differentiation"]} lang={lang} />
            </div>
            <Textarea value={getStr(8, "differentiation")} onChange={(v) => set(8, "differentiation", v)} rows={3} />
          </Field>
          <Field>
            <div className="flex items-center justify-between mb-2">
              <Label text={t.s9_valueProposition} lang={lang} />
              <AIButton onClick={() => handleAI("valueProposition", (v) => set(8, "valueProposition", v))} loading={!!aiLoading["valueProposition"]} lang={lang} />
            </div>
            <Textarea value={getStr(8, "valueProposition")} onChange={(v) => set(8, "valueProposition", v)} rows={3} />
          </Field>
        </div>
      );

      // ── Step 10: Outreach Preferences ──────────────────────────────────────
      case 9: return (
        <div className="space-y-5">
          <Field>
            <Label text={t.s10_channels} lang={lang} />
            <MultiSelect
              options={[
                { val: "cold-email", label: t.s10_ch1 }, { val: "linkedin", label: t.s10_ch2 },
                { val: "whatsapp", label: t.s10_ch3 }, { val: "cold-calls", label: t.s10_ch4 }, { val: "all", label: t.s10_ch5 },
              ]}
              value={getArr(9, "channels")}
              onChange={(v) => set(9, "channels", v)}
            />
          </Field>
          <Field>
            <Label text={t.s10_outreachLang} lang={lang} />
            <SingleSelect
              options={[
                { val: "ar", label: t.s10_l1 }, { val: "en", label: t.s10_l2 }, { val: "both", label: t.s10_l3 },
              ]}
              value={getStr(9, "outreachLang")}
              onChange={(v) => set(9, "outreachLang", v)}
            />
          </Field>
          <Field>
            <Label text={t.s10_tone} lang={lang} />
            <SingleSelect
              options={[
                { val: "formal", label: t.s10_t1 }, { val: "semi-formal", label: t.s10_t2 }, { val: "casual", label: t.s10_t3 },
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
                yes={t.yes} no={t.no}
              />
            </Field>
          ))}
        </div>
      );

      // ── Step 11: Company Documents ──────────────────────────────────────────
      case 10: return (
        <div className="space-y-5">
          <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4 text-sm text-teal-700">
            {t.s11_helpText}
          </div>
          <Field>
            <Label text={t.s11_profile} lang={lang} optional />
            <FileUploadArea files={s11ProfileFiles} onChange={(f) => { setS11ProfileFiles(f); set(10, "profileFiles", f.map(x => x.url).join(",")); }} hint={t.s11_profileHint} lang={lang} />
          </Field>
          <Field>
            <Label text={t.s11_brochure} lang={lang} optional />
            <FileUploadArea files={s11BrochureFiles} onChange={(f) => { setS11BrochureFiles(f); set(10, "brochureFiles", f.map(x => x.url).join(",")); }} hint={t.s11_brochureHint} lang={lang} />
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
              return <ReviewSection key={i} title={stepNames[i]} data={data} />;
            })}
            <div className="pt-4">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={generating}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#1a5c4a] to-[#2a7c64] text-white font-bold text-lg shadow-lg hover:shadow-xl hover:opacity-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {generating ? t.s12_generating : t.s12_generate}
              </button>
            </div>
          </div>
        );
      }

      default: return null;
    }
  };

  // ── Layout ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0faf7] via-white to-[#fff5f4]" dir={isRTL ? "rtl" : "ltr"}>
      {showConfetti && <Confetti />}

      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-100 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          {/* Logo */}
          <span className="font-bold text-[#1a5c4a] text-lg tracking-tight flex-shrink-0">AVORA</span>

          {/* Progress bar */}
          <div className="flex-1">
            <ProgressBar step={step} total={TOTAL_STEPS} />
          </div>

          {/* Step counter */}
          <span className="text-xs text-gray-400 flex-shrink-0 font-medium">
            {t.step} {step + 1} {t.of} {TOTAL_STEPS}
          </span>

          {/* Lang toggle */}
          <button
            type="button"
            onClick={() => setLang((l) => l === "ar" ? "en" : "ar")}
            className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-bold hover:bg-[#1a5c4a] hover:text-white transition-all"
          >
            {lang === "ar" ? "EN" : "AR"}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Step header */}
        <div
          className="mb-8 transition-all duration-200"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible
              ? "translateX(0)"
              : animDir === "forward"
                ? isRTL ? "translateX(40px)" : "translateX(-40px)"
                : isRTL ? "translateX(-40px)" : "translateX(40px)",
          }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-[#1a5c4a] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
              {step + 1}
            </div>
            <h1 className="text-xl font-bold text-gray-900">{t.steps[step]}</h1>
          </div>

          {/* Confetti message */}
          {showConfetti && (
            <p className="text-[#1a5c4a] font-semibold text-center mt-4 animate-pulse">{t.confetti}</p>
          )}
        </div>

        {/* Step content */}
        <div
          className="transition-all duration-200"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible
              ? "translateX(0)"
              : animDir === "forward"
                ? isRTL ? "translateX(40px)" : "translateX(-40px)"
                : isRTL ? "translateX(-40px)" : "translateX(40px)",
          }}
        >
          {stepContent()}
        </div>

        {/* Navigation */}
        {step < TOTAL_STEPS - 1 && (
          <div className={cx(
            "flex mt-10 gap-4",
            isRTL ? "flex-row-reverse" : "flex-row"
          )}>
            {step > 0 && (
              <button
                type="button"
                onClick={() => navigate("back")}
                className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:border-[#1a5c4a] hover:text-[#1a5c4a] transition-all"
              >
                {t.back}
              </button>
            )}
            <button
              type="button"
              onClick={() => navigate("forward")}
              className="flex-1 py-3 rounded-xl bg-[#1a5c4a] text-white text-sm font-semibold hover:bg-[#154d3d] transition-all shadow-sm"
            >
              {t.next}
            </button>
          </div>
        )}

        {step === TOTAL_STEPS - 1 && step > 0 && (
          <button
            type="button"
            onClick={() => navigate("back")}
            className="mt-6 px-6 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:border-[#1a5c4a] hover:text-[#1a5c4a] transition-all"
          >
            {t.back}
          </button>
        )}
      </div>
    </div>
  );
}
