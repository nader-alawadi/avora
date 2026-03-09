"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ARIAAvatar } from "@/components/aria/ARIAAvatar";

// ─── Types ─────────────────────────────────────────────────────────────────

type ARIAState = "idle" | "speaking" | "listening" | "thinking";
type Phase =
  | "welcome"
  | "url-input"
  | "analyzing"
  | "confirm-analysis"
  | "generating-leads"
  | "show-leads";

interface WebsiteData {
  companyName: string;
  industry: string;
  productDescription: string;
  targetMarket: string;
  valueProposition: string;
  language: string;
}

interface OutreachTemplates {
  linkedin: string;
  email: string;
  whatsapp: string;
  coldCall: string;
}

interface ARIALead {
  id: string;
  fullName: string | null;
  roleTitle: string | null;
  company: string | null;
  companyWebsite: string | null;
  linkedinUrl: string | null;
  email: string | null;
  phone: string | null;
  country: string | null;
  industry: string | null;
  employeeCount: string | null;
  icpFitScore: number | null;
  icpFitReason: string | null;
  personalityAnalysis: string | null;
  outreachRecommendation: string | null;
  bestChannel: string | null;
  bestTime: string | null;
  outreachTemplates: OutreachTemplates | null;
}

// ─── Translations ───────────────────────────────────────────────────────────

const T = {
  ar: {
    welcome: (name: string) =>
      `أهلاً وسهلاً بيك${name ? " " + name : ""}! معاك إريا من أفورا، ومبسوطة جداً إنك انضميت لينا. أنا هنا أساعدك توصل للعملا المثاليين ليك. ممكن تديني الويب سايت بتاعك؟`,
    urlPlaceholder: "https://yourwebsite.com",
    urlLabel: "الويب سايت بتاعك",
    urlButton: "تحليل الويب سايت →",
    analyzing: "ممتاز! أنا بحلل الويب سايت بتاعك دلوقتي...",
    confirmPrefix: "تمام، شفت إنك بتقدم",
    confirmMid: "لـ",
    confirmSuffix: ". صح؟",
    confirmYes: "أيوه، صح ✓",
    confirmNo: "لا، في تعديل",
    giftAnnounce:
      "🎁 هديتك من أفورا! جهزتلك 5 ليدز مؤهلة مجاناً بناءً على بيزنسك. هتلاقيهم في الـ CRM بتاعك دلوقتي!",
    generatingLeads: "بجهز الليدز المجانية بتاعتك...",
    freeleadsTitle: "5 ليدز مجانية — هدية من AVORA 🎁",
    ctaText: "عاوز تاخد 5 ليدز أكتر؟ بس أجاوب على 5 أسئلة بسيطة معايا!",
    ctaButton: "يلا نبدأ! 🚀",
    goToCrm: "روح CRM",
    bestChannel: "أفضل قناة",
    bestTime: "أفضل وقت",
    linkedin: "لينكد إن",
    email: "إيميل",
    whatsapp: "واتساب",
    coldCall: "كول",
    goodLead: "👍 ليد مناسب",
    badLead: "👎 مش مناسب",
    replacing: "بجهز ليد بديل...",
    invalidUrl: "الرابط مش صحيح. لازم يبدأ بـ https:// أو http://",
    unreachable: "مقدرتش أوصل للويب سايت ده. تأكد من الرابط وحاول تاني.",
    dir: "rtl" as const,
  },
  en: {
    welcome: (name: string) =>
      `Welcome${name ? " " + name : ""}! I'm ARIA from AVORA, and I'm thrilled to have you here. I'm going to help you find your perfect customers. Could you share your website with me?`,
    urlPlaceholder: "https://yourwebsite.com",
    urlLabel: "Your website",
    urlButton: "Analyze Website →",
    analyzing: "Great! I'm analyzing your website now...",
    confirmPrefix: "Perfect, I can see you offer",
    confirmMid: "to",
    confirmSuffix: ". Is that right?",
    confirmYes: "Yes, that's right ✓",
    confirmNo: "Let me correct that",
    giftAnnounce:
      "🎁 Here's your gift from AVORA! I've prepared 5 qualified leads based on your business — they're already in your CRM!",
    generatingLeads: "Preparing your free leads...",
    freeleadsTitle: "5 Free Leads — Your Gift from AVORA 🎁",
    ctaText: "Want 5 more leads? Just answer 5 quick questions with me!",
    ctaButton: "Let's Go! 🚀",
    goToCrm: "Go to CRM",
    bestChannel: "Best Channel",
    bestTime: "Best Time",
    linkedin: "LinkedIn",
    email: "Email",
    whatsapp: "WhatsApp",
    coldCall: "Cold Call",
    goodLead: "👍 Good Lead",
    badLead: "👎 Bad Lead",
    replacing: "Generating a replacement lead...",
    invalidUrl: "Invalid URL. It must start with https:// or http://",
    unreachable: "Couldn't reach that website. Please check the URL and try again.",
    dir: "ltr" as const,
  },
} as const;

// ─── Shared AudioContext (singleton) ────────────────────────────────────────
// Reusing one context avoids the "too many AudioContexts" browser warning.

let sharedAudioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!sharedAudioContext || sharedAudioContext.state === "closed") {
    sharedAudioContext = new AudioContext();
  }
  return sharedAudioContext;
}

/** Call this inside any user-gesture handler to resume a suspended context. */
function resumeAudioContext(): void {
  const ctx = getAudioContext();
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }
}

// ─── Browser Speech Synthesis fallback ──────────────────────────────────────

async function speakWithBrowser(text: string, lang: "ar" | "en"): Promise<void> {
  if (!("speechSynthesis" in window)) {
    console.warn("[ariaSpeak] speechSynthesis not available");
    return;
  }
  window.speechSynthesis.cancel();
  console.log("[ariaSpeak] Using browser TTS, lang=", lang);

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang === "ar" ? "ar-SA" : "en-US";
  utterance.rate = 0.9;
  utterance.volume = 1;

  // Try to pick a matching voice
  await new Promise<void>((res) => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) { res(); return; }
    window.speechSynthesis.addEventListener("voiceschanged", () => res(), { once: true });
    setTimeout(res, 1200);
  });

  const voices = window.speechSynthesis.getVoices();
  const bcp = lang === "ar" ? "ar" : "en";
  const match = voices.find((v) => v.lang.toLowerCase().startsWith(bcp));
  if (match) {
    utterance.voice = match;
    console.log("[ariaSpeak] Browser voice:", match.name);
  } else {
    console.warn("[ariaSpeak] No browser voice for", lang);
  }

  return new Promise((resolve) => {
    let done = false;
    const finish = () => { if (!done) { done = true; resolve(); } };
    utterance.onend = finish;
    utterance.onerror = (e) => { console.warn("[ariaSpeak] TTS error:", e.error); finish(); };
    window.speechSynthesis.speak(utterance);
    setTimeout(finish, text.length * 70 + 4000);
  });
}

// ─── Core speak — Web Audio API + ElevenLabs stream ─────────────────────────
// Downloads the full MP3 from the server, decodes with AudioContext, then plays.
// Falls back to browser TTS if anything fails.

async function ariaSpeak(
  text: string,
  lang: "ar" | "en",
  onBlocked?: () => void
): Promise<void> {
  console.log("[ariaSpeak] START | lang=", lang, "| text=", text.slice(0, 50));

  try {
    console.log("[ariaSpeak] Fetching /api/aria/speak...");
    const res = await fetch("/api/aria/speak", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, language: lang }),
    });
    const ct = res.headers.get("Content-Type") ?? "";
    console.log("[ariaSpeak] Response:", res.status, "| Content-Type:", ct);

    if (!res.ok || !ct.includes("audio")) {
      const body = await res.text().catch(() => "");
      console.warn("[ariaSpeak] No audio from server. Body:", body.slice(0, 100));
      throw new Error("no-audio");
    }

    // Wait for the full response body (avoids early cut-off)
    const arrayBuffer = await res.arrayBuffer();
    console.log("[ariaSpeak] Full buffer received:", arrayBuffer.byteLength, "bytes");

    if (arrayBuffer.byteLength === 0) {
      console.warn("[ariaSpeak] Empty buffer");
      throw new Error("empty-buffer");
    }

    const ctx = getAudioContext();
    console.log("[ariaSpeak] AudioContext state before resume:", ctx.state);

    // Try to resume — in Chrome, this resolves without error even when
    // autoplay policy keeps the context "suspended". So we MUST re-check
    // the state afterward and not just trust that resume() resolved.
    if (ctx.state !== "running") {
      try { await ctx.resume(); } catch {}
    }
    console.log("[ariaSpeak] AudioContext state after resume:", ctx.state);

    if (ctx.state !== "running") {
      // Still suspended — browser blocked autoplay. Show the button and
      // fall through to browser TTS immediately (don't schedule into a
      // suspended context which would hang until the safety timeout).
      console.warn("[ariaSpeak] AudioContext still suspended — signalling blocked");
      onBlocked?.();
      throw new Error("context-suspended");
    }

    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    console.log("[ariaSpeak] Decoded audio duration:", audioBuffer.duration.toFixed(2), "s");

    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);
    source.start(0);
    console.log("[ariaSpeak] Playing via Web Audio API");

    await new Promise<void>((resolve) => {
      source.onended = () => { console.log("[ariaSpeak] Web Audio playback ended"); resolve(); };
      // Safety timeout
      setTimeout(resolve, (audioBuffer.duration + 2) * 1000);
    });

    return; // Success — skip browser fallback
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg !== "no-audio" && msg !== "empty-buffer" && msg !== "context-suspended") {
      console.error("[ariaSpeak] Web Audio error:", err);
    }
  }

  // Fallback to browser speech synthesis
  console.log("[ariaSpeak] Falling back to browser TTS");
  await speakWithBrowser(text, lang);
}

// ─── ICP Fit Score Badge ────────────────────────────────────────────────────

function FitScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? "#22c55e" : score >= 60 ? "#eab308" : "#ef4444";
  return (
    <div className="relative w-10 h-10">
      <svg viewBox="0 0 36 36" className="w-10 h-10 -rotate-90">
        <circle cx="18" cy="18" r="15" fill="none" stroke="#1a3a3a" strokeWidth="3" />
        <circle cx="18" cy="18" r="15" fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={`${(score / 100) * 94} 94`} strokeLinecap="round" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">
        {score}
      </span>
    </div>
  );
}

// ─── Lead Card ──────────────────────────────────────────────────────────────

function LeadCard({
  lead, index, lang, websiteData, onReplace,
}: {
  lead: ARIALead;
  index: number;
  lang: "ar" | "en";
  websiteData: WebsiteData | null;
  onReplace: (id: string, newLead: ARIALead) => void;
}) {
  const t = T[lang];
  const [tab, setTab] = useState<"linkedin" | "email" | "whatsapp" | "coldCall">("linkedin");
  const [replacing, setReplacing] = useState(false);
  const [replaced, setReplaced] = useState(false);
  const [rating, setRating] = useState<"good" | "bad" | null>(null);
  const templates = lead.outreachTemplates;

  async function handleBadLead() {
    const reason = prompt(lang === "ar" ? "ليه مش مناسب؟" : "Why isn't this lead a good fit?");
    setReplacing(true);
    try {
      const res = await fetch("/api/aria/replace-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: lead.id, reason, websiteData }),
      });
      const data = await res.json();
      if (data.newLead) {
        onReplace(lead.id, {
          ...data.newLead,
          outreachTemplates:
            typeof data.newLead.outreachTemplates === "string"
              ? JSON.parse(data.newLead.outreachTemplates)
              : data.newLead.outreachTemplates,
        });
        setReplaced(true);
      }
    } catch { /* silent */ } finally {
      setReplacing(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="bg-[#0d2626] border border-teal-800/40 rounded-2xl overflow-hidden"
    >
      <div className="p-4 border-b border-teal-800/30">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-white truncate">{lead.fullName ?? "—"}</div>
            <div className="text-sm text-teal-300 truncate">{lead.roleTitle ?? "—"}</div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-white/50">
              <span className="font-medium text-white/70">{lead.company}</span>
              {lead.industry && (
                <span className="px-2 py-0.5 bg-teal-900/50 text-teal-300 rounded-full">{lead.industry}</span>
              )}
              {lead.country && <span>{lead.country}</span>}
              {lead.employeeCount && <span>👥 {lead.employeeCount}</span>}
            </div>
          </div>
          {lead.icpFitScore != null && <FitScoreBadge score={lead.icpFitScore} />}
        </div>

        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {lead.email && (
            <a href={`mailto:${lead.email}`} className="flex items-center gap-1 px-2.5 py-1 bg-teal-900/40 hover:bg-teal-800/40 text-teal-300 rounded-lg transition-colors">
              ✉ {lead.email}
            </a>
          )}
          {lead.linkedinUrl && (
            <a href={lead.linkedinUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 px-2.5 py-1 bg-blue-900/30 hover:bg-blue-800/30 text-blue-300 rounded-lg transition-colors"
            >
              in LinkedIn
            </a>
          )}
          {lead.phone && (
            <span className="flex items-center gap-1 px-2.5 py-1 bg-white/5 text-white/50 rounded-lg">
              📞 {lead.phone}
            </span>
          )}
        </div>
      </div>

      <div className="p-4 space-y-2 border-b border-teal-800/20">
        {lead.icpFitReason && (
          <p className="text-xs text-white/60">
            <span className="text-teal-400 font-medium">ICP: </span>{lead.icpFitReason}
          </p>
        )}
        {lead.personalityAnalysis && (
          <p className="text-xs text-white/50">
            <span className="text-purple-400 font-medium">🧠 </span>{lead.personalityAnalysis}
          </p>
        )}
        <div className="flex flex-wrap gap-2 text-xs">
          {lead.bestChannel && (
            <span className="px-2 py-0.5 bg-teal-900/40 text-teal-300 rounded-full">
              {t.bestChannel}: {lead.bestChannel}
            </span>
          )}
          {lead.bestTime && (
            <span className="px-2 py-0.5 bg-purple-900/30 text-purple-300 rounded-full">
              ⏰ {lead.bestTime}
            </span>
          )}
        </div>
      </div>

      {templates && (
        <div className="p-4 border-b border-teal-800/20">
          <div className="flex gap-1 mb-3 text-xs">
            {(["linkedin", "email", "whatsapp", "coldCall"] as const).map((ch) => (
              <button key={ch} onClick={() => setTab(ch)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  tab === ch ? "bg-teal-600 text-white" : "bg-white/5 text-white/40 hover:text-white/70"
                }`}
              >
                {t[ch]}
              </button>
            ))}
          </div>
          <div className="bg-black/20 rounded-xl p-3 text-xs text-white/65 whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto">
            {templates[tab] ?? "—"}
          </div>
        </div>
      )}

      <div className="p-3 flex gap-2">
        {rating === "good" ? (
          <div className="flex-1 text-center text-xs text-green-400 py-2">✓ Marked as good lead</div>
        ) : (
          <>
            <button onClick={() => setRating("good")}
              className="flex-1 text-xs py-2 rounded-xl font-medium bg-green-900/20 text-green-400 hover:bg-green-800/30 transition-all"
            >
              {t.goodLead}
            </button>
            {!replaced && (
              <button onClick={() => { setRating("bad"); handleBadLead(); }} disabled={replacing}
                className="flex-1 text-xs py-2 rounded-xl font-medium bg-red-900/20 text-red-400 hover:bg-red-800/30 disabled:opacity-50 transition-all"
              >
                {replacing ? t.replacing : t.badLead}
              </button>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}

// ─── ARIA Message Bubble ────────────────────────────────────────────────────

function ARIABubble({ text, dir }: { text: string; dir: "ltr" | "rtl" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-lg mx-auto text-center"
      dir={dir}
    >
      <div className="inline-block bg-[#0d2626] border border-teal-700/30 text-white/85 rounded-2xl px-6 py-4 text-sm leading-relaxed shadow-lg">
        {text}
      </div>
    </motion.div>
  );
}

// ─── Derive current ARIA message from phase ──────────────────────────────────
// Used both for initial render and when the user switches language.

function getCurrentMessage(
  phase: Phase,
  lang: "ar" | "en",
  userName: string,
  websiteData: WebsiteData | null
): string {
  const t = T[lang];
  switch (phase) {
    case "welcome":
    case "url-input":
      return t.welcome(userName);
    case "analyzing":
      return t.analyzing;
    case "confirm-analysis":
      if (!websiteData) return t.analyzing;
      return `${t.confirmPrefix} "${websiteData.productDescription}" ${t.confirmMid} "${websiteData.targetMarket}"${t.confirmSuffix}`;
    case "generating-leads":
    case "show-leads":
      return t.giftAnnounce;
    default:
      return "";
  }
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function ARIAOnboardingPage() {
  const router = useRouter();

  // lang starts as "en" for SSR/hydration consistency.
  const [lang, setLang] = useState<"ar" | "en">("en");
  const [ariaState, setAriaState] = useState<ARIAState>("idle");
  const [phase, setPhase] = useState<Phase>("welcome");
  const [ariaMessage, setAriaMessage] = useState("");
  const [userName, setUserName] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [urlError, setUrlError] = useState("");
  const [websiteData, setWebsiteData] = useState<WebsiteData | null>(null);
  const [leads, setLeads] = useState<ARIALead[]>([]);
  // audioBlocked: show "tap to hear" button (set on mount — welcome always needs gesture)
  const [audioBlocked, setAudioBlocked] = useState(true);
  // Store the pending speak args so the "tap to hear" button can replay them
  const pendingSpeakRef = useRef<{ text: string; lang: "ar" | "en" } | null>(null);

  // Keep a ref to latest phase/websiteData/userName so the toggle handler
  // can read the current values without going stale inside a closure.
  const phaseRef = useRef(phase);
  const websiteDataRef = useRef(websiteData);
  const userNameRef = useRef(userName);
  phaseRef.current = phase;
  websiteDataRef.current = websiteData;
  userNameRef.current = userName;

  const t = T[lang];

  // ── Language toggle ───────────────────────────────────────────────────────
  const handleLangToggle = useCallback(() => {
    resumeAudioContext();
    setAudioBlocked(false);

    const newLang = lang === "ar" ? "en" : "ar";
    setLang(newLang);

    const msg = getCurrentMessage(
      phaseRef.current,
      newLang,
      userNameRef.current,
      websiteDataRef.current
    );
    setAriaMessage(msg);

    if (msg) {
      pendingSpeakRef.current = { text: msg, lang: newLang };
      setAriaState("speaking");
      ariaSpeak(msg, newLang, () => setAudioBlocked(true)).then(() => {
        setAudioBlocked(false);
        setAriaState(phaseRef.current === "url-input" ? "listening" : "idle");
      });
    }
  }, [lang]);

  // ── "Tap to hear" replay ──────────────────────────────────────────────────
  const handleTapToHear = useCallback(() => {
    resumeAudioContext();
    setAudioBlocked(false);
    const pending = pendingSpeakRef.current;
    if (!pending) return;
    setAriaState("speaking");
    ariaSpeak(pending.text, pending.lang, () => setAudioBlocked(true)).then(() => {
      setAudioBlocked(false);
      setAriaState(phaseRef.current === "url-input" ? "listening" : "idle");
    });
  }, []);

  // ── Unlock AudioContext on first user interaction ─────────────────────────
  useEffect(() => {
    const unlock = () => resumeAudioContext();
    document.addEventListener("click", unlock, { once: true });
    document.addEventListener("touchstart", unlock, { once: true });
    return () => {
      document.removeEventListener("click", unlock);
      document.removeEventListener("touchstart", unlock);
    };
  }, []);

  // ── Single initialization effect ──────────────────────────────────────────
  useEffect(() => {
    // Detect language — check full navigator.languages array
    const allLangs = [
      navigator.language ?? "",
      ...(navigator.languages ?? []),
    ];
    const detectedLang: "ar" | "en" = allLangs.some((l) =>
      l.toLowerCase().startsWith("ar")
    )
      ? "ar"
      : "en";
    setLang(detectedLang);

    const translations = T[detectedLang];

    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => String(d?.user?.name ?? d?.name ?? ""))
      .catch(() => "")
      .then(async (fullName) => {
        const firstName = fullName ? fullName.split(" ")[0] : "";
        setUserName(firstName);

        const msg = translations.welcome(firstName);
        setAriaMessage(msg);
        setAriaState("speaking");
        pendingSpeakRef.current = { text: msg, lang: detectedLang };

        await ariaSpeak(msg, detectedLang, () => setAudioBlocked(true));
        setAudioBlocked(false);

        setPhase("url-input");
        setAriaState("listening");
      });
  }, []); // runs once on mount only

  // ── URL analysis ─────────────────────────────────────────────────────────
  async function handleUrlSubmit() {
    setUrlError("");
    const trimmed = urlInput.trim();
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
      setUrlError(t.invalidUrl);
      return;
    }

    setPhase("analyzing");
    setAriaMessage(t.analyzing);
    setAriaState("thinking");
    pendingSpeakRef.current = { text: t.analyzing, lang };
    await ariaSpeak(t.analyzing, lang, () => setAudioBlocked(true));

    try {
      const res = await fetch("/api/aria/analyze-website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setUrlError(data.error ?? t.unreachable);
        setPhase("url-input");
        setAriaState("listening");
        return;
      }
      setWebsiteData(data.data);
      const confirmMsg = `${t.confirmPrefix} "${data.data.productDescription}" ${t.confirmMid} "${data.data.targetMarket}"${t.confirmSuffix}`;
      setAriaMessage(confirmMsg);
      setPhase("confirm-analysis");
      pendingSpeakRef.current = { text: confirmMsg, lang };
      await ariaSpeak(confirmMsg, lang, () => setAudioBlocked(true));
      setAriaState("idle");
    } catch {
      setUrlError(t.unreachable);
      setPhase("url-input");
      setAriaState("listening");
    }
  }

  // ── Generate free leads ───────────────────────────────────────────────────
  async function handleConfirm() {
    setPhase("generating-leads");
    setAriaMessage(t.giftAnnounce);
    setAriaState("thinking");
    pendingSpeakRef.current = { text: t.giftAnnounce, lang };
    await ariaSpeak(t.giftAnnounce, lang, () => setAudioBlocked(true));

    try {
      const res = await fetch("/api/aria/generate-free-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ websiteData }),
      });
      const data = await res.json();
      const parsedLeads: ARIALead[] = (data.leads ?? []).map(
        (l: ARIALead & { outreachTemplates: OutreachTemplates | string }) => ({
          ...l,
          outreachTemplates:
            typeof l.outreachTemplates === "string"
              ? JSON.parse(l.outreachTemplates)
              : l.outreachTemplates,
        })
      );
      setLeads(parsedLeads);
    } catch { /* show empty state */ } finally {
      setPhase("show-leads");
      setAriaState("idle");
    }
  }

  function handleReplaceLead(oldId: string, newLead: ARIALead) {
    setLeads((prev) => prev.map((l) => (l.id === oldId ? newLead : l)));
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen bg-[#061a1a] flex flex-col"
      dir={t.dir}
      style={{ fontFamily: lang === "ar" ? "'Cairo', sans-serif" : "inherit" }}
    >

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-teal-900/40">
        <div className="text-white/40 text-sm">AVORA</div>
        <button
          onClick={handleLangToggle}
          className="text-sm font-semibold text-teal-300 hover:text-white px-4 py-2 rounded-xl border border-teal-600/50 hover:border-teal-400 bg-teal-900/30 hover:bg-teal-800/40 transition-all"
        >
          {lang === "ar" ? "🌐 English" : "🌐 العربية"}
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center px-4 py-10 max-w-2xl mx-auto w-full">

        {/* ARIA Avatar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8"
        >
          <ARIAAvatar state={ariaState} size={130} />
        </motion.div>

        {/* ARIA Message */}
        <AnimatePresence mode="wait">
          {ariaMessage && (
            <motion.div
              key={ariaMessage}
              className="mb-4 w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ARIABubble text={ariaMessage} dir={t.dir} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tap to hear — shown until user unlocks audio with a gesture */}
        <AnimatePresence>
          {audioBlocked && ariaMessage && (
            <motion.button
              key="tap-to-hear"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={handleTapToHear}
              className="mb-6 flex items-center gap-2.5 text-sm font-semibold text-white px-6 py-3 rounded-2xl bg-teal-600 hover:bg-teal-500 shadow-lg shadow-teal-900/40 transition-all active:scale-95"
            >
              🔊 {lang === "ar" ? "اضغط لتسمع إريا" : "Tap to Hear ARIA"}
            </motion.button>
          )}
        </AnimatePresence>

        {/* ── Phase: URL Input ── */}
        <AnimatePresence>
          {phase === "url-input" && (
            <motion.div
              key="url-input"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="w-full space-y-3"
            >
              <label className="block text-sm font-medium text-white/60 text-center">
                {t.urlLabel}
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
                  placeholder={t.urlPlaceholder}
                  autoFocus
                  className="flex-1 px-4 py-3.5 rounded-xl bg-[#0d2626] border border-teal-700/40 focus:border-teal-500 text-white placeholder-white/25 text-sm outline-none transition-colors"
                  dir="ltr"
                />
                <motion.button
                  onClick={handleUrlSubmit}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-5 py-3.5 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-xl text-sm transition-colors whitespace-nowrap"
                >
                  {t.urlButton}
                </motion.button>
              </div>
              {urlError && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-red-400 text-xs text-center"
                >
                  {urlError}
                </motion.p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Phase: Analyzing ── */}
        <AnimatePresence>
          {phase === "analyzing" && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 text-teal-300 text-sm"
            >
              <motion.div
                className="w-5 h-5 rounded-full border-2 border-teal-500 border-t-transparent"
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
              />
              {t.analyzing}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Phase: Confirm Analysis ── */}
        <AnimatePresence>
          {phase === "confirm-analysis" && websiteData && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="w-full space-y-4"
            >
              <div className="bg-[#0d2626] border border-teal-800/40 rounded-2xl p-4 text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-white/40">Company</span>
                  <span className="text-white font-medium">{websiteData.companyName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Industry</span>
                  <span className="text-teal-300">{websiteData.industry}</span>
                </div>
                <div className="border-t border-teal-900/40 pt-2">
                  <p className="text-white/60 text-xs leading-relaxed">{websiteData.productDescription}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <motion.button onClick={handleConfirm} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  className="flex-1 py-3.5 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-xl text-sm transition-colors"
                >
                  {t.confirmYes}
                </motion.button>
                <motion.button
                  onClick={() => { setPhase("url-input"); setAriaMessage(""); }}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  className="flex-1 py-3.5 bg-white/5 hover:bg-white/10 text-white/70 font-semibold rounded-xl text-sm transition-colors border border-white/10"
                >
                  {t.confirmNo}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Phase: Generating leads ── */}
        <AnimatePresence>
          {phase === "generating-leads" && (
            <motion.div
              key="generating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 py-8"
            >
              <motion.div
                className="w-12 h-12 rounded-full border-teal-500 border-t-transparent"
                style={{ borderWidth: 3, borderStyle: "solid" }}
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
              />
              <p className="text-white/60 text-sm">{t.generatingLeads}</p>
              {[1, 2, 3].map((i) => (
                <motion.div key={i} className="w-full h-24 rounded-2xl bg-teal-900/20"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Phase: Show Leads ── */}
        <AnimatePresence>
          {phase === "show-leads" && (
            <motion.div
              key="leads"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full space-y-4"
            >
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
                <h2 className="text-xl font-bold text-white">{t.freeleadsTitle}</h2>
              </motion.div>

              {leads.map((lead, i) => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  index={i}
                  lang={lang}
                  websiteData={websiteData}
                  onReplace={handleReplaceLead}
                />
              ))}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-gradient-to-r from-teal-900/40 to-purple-900/20 border border-teal-700/30 rounded-2xl p-6 text-center space-y-4 mt-6"
              >
                <p className="text-white/80 font-medium">{t.ctaText}</p>
                <div className="flex gap-3 justify-center flex-wrap">
                  <motion.button
                    onClick={() => router.push("/onboarding/tasks")}
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    className="px-8 py-3.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-sm transition-colors shadow-lg"
                  >
                    {t.ctaButton}
                  </motion.button>
                  <motion.button
                    onClick={() => router.push("/dashboard")}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    className="px-6 py-3.5 bg-white/5 hover:bg-white/10 text-white/60 font-medium rounded-xl text-sm transition-colors border border-white/10"
                  >
                    {t.goToCrm}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
