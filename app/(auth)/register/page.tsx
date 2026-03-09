"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AvoraLogo } from "@/components/ui/AvoraLogo";

// ─── ARIA Character ────────────────────────────────────────────────────────────
const ARIACharacter = ({
  mood = "idle",
  speaking = false,
}: {
  mood: string;
  speaking?: boolean;
}) => {
  return (
    <motion.div
      className="relative flex items-center justify-center"
      animate={{ y: [-5, 5, -5] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Outer glow rings when speaking */}
      {speaking && (
        <>
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 160,
              height: 160,
              border: "2px solid rgba(20,184,166,0.4)",
            }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 180,
              height: 180,
              border: "2px solid rgba(20,184,166,0.2)",
            }}
            animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0, 0.2] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
          />
        </>
      )}

      {/* Main orb */}
      <motion.div
        className="relative rounded-full flex items-center justify-center"
        style={{
          width: 120,
          height: 120,
          background:
            mood === "happy"
              ? "linear-gradient(135deg, #14B8A6 0%, #F97316 100%)"
              : mood === "thinking"
              ? "linear-gradient(135deg, #8B5CF6 0%, #14B8A6 100%)"
              : "linear-gradient(135deg, #0D9488 0%, #14B8A6 100%)",
          boxShadow: "0 0 40px rgba(20,184,166,0.4)",
        }}
        animate={{
          boxShadow: speaking
            ? [
                "0 0 40px rgba(20,184,166,0.4)",
                "0 0 60px rgba(20,184,166,0.7)",
                "0 0 40px rgba(20,184,166,0.4)",
              ]
            : "0 0 40px rgba(20,184,166,0.4)",
        }}
        transition={{ duration: 1, repeat: speaking ? Infinity : 0 }}
      >
        {/* SVG face */}
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          {/* Eyes */}
          <motion.ellipse
            cx="28"
            cy="32"
            rx="5"
            ry={mood === "happy" ? 4 : 5}
            fill="white"
            animate={{ ry: mood === "thinking" ? [5, 1, 5] : 5 }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <motion.ellipse
            cx="52"
            cy="32"
            rx="5"
            ry={mood === "happy" ? 4 : 5}
            fill="white"
            animate={{ ry: mood === "thinking" ? [5, 1, 5] : 5 }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          {/* Pupils */}
          <circle cx="28" cy="33" r="2.5" fill="#0A1628" />
          <circle cx="52" cy="33" r="2.5" fill="#0A1628" />
          {/* Mouth */}
          {mood === "happy" ? (
            <path
              d="M 28 52 Q 40 62 52 52"
              stroke="white"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
          ) : mood === "thinking" ? (
            <path
              d="M 32 54 Q 40 50 48 54"
              stroke="white"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
          ) : (
            <path
              d="M 28 52 Q 40 58 52 52"
              stroke="white"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
            />
          )}
          {/* Thinking dots */}
          {mood === "thinking" && (
            <>
              <motion.circle
                cx="58"
                cy="20"
                r="3"
                fill="white"
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0 }}
              />
              <motion.circle
                cx="65"
                cy="15"
                r="3"
                fill="white"
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
              />
              <motion.circle
                cx="72"
                cy="10"
                r="3"
                fill="white"
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.6 }}
              />
            </>
          )}
        </svg>
      </motion.div>
    </motion.div>
  );
};

// ─── Typewriter Text ────────────────────────────────────────────────────────────
const TypewriterText = ({ text }: { text: string }) => {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    setDisplayed("");
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 28);
    return () => clearInterval(timer);
  }, [text]);
  return (
    <span>
      {displayed}
      <motion.span
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 0.8, repeat: Infinity }}
      >
        |
      </motion.span>
    </span>
  );
};

// ─── Step Input ────────────────────────────────────────────────────────────────
const StepInput = ({
  label,
  type = "text",
  value,
  onChange,
  error,
  placeholder,
  prefix,
  autoFocus,
  children,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
  prefix?: string;
  autoFocus?: boolean;
  children?: React.ReactNode;
}) => (
  <div className="w-full">
    <label className="block text-sm font-semibold text-[#0F172A] mb-2">
      {label}
    </label>
    <div className="relative flex items-center">
      {prefix && (
        <span className="absolute left-4 text-[#64748B] text-sm select-none z-10">
          {prefix}
        </span>
      )}
      <motion.input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full h-14 border border-[#E2E8F0] rounded-xl text-base text-[#0F172A] outline-none transition-all bg-white"
        style={{ paddingLeft: prefix ? "80px" : "16px", paddingRight: "16px" }}
        whileFocus={{
          boxShadow: "0 0 0 3px rgba(20,184,166,0.15)",
          borderColor: "#14B8A6",
        }}
      />
      {children}
    </div>
    {error && (
      <motion.p
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-[#EF4444] text-sm mt-1.5"
      >
        {error}
      </motion.p>
    )}
  </div>
);

// ─── Password requirements ─────────────────────────────────────────────────────
const passwordRequirements = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  {
    label: "One uppercase letter",
    test: (p: string) => /[A-Z]/.test(p),
  },
  { label: "One number", test: (p: string) => /[0-9]/.test(p) },
  {
    label: "One special character",
    test: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p),
  },
];

// ─── Free email providers ──────────────────────────────────────────────────────
const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "icloud.com",
  "live.com",
  "msn.com",
  "aol.com",
]);

// ─── ARIA Messages ─────────────────────────────────────────────────────────────
const ariaMessages: Record<number, { en: string; ar: string }> = {
  1: {
    en: "Hi there! 👋 I'm ARIA, your AI sales assistant. Let's get you set up. What's your first name?",
    ar: "أهلاً! 👋 أنا إريا، مساعدتك الذكية. خلينا نبدأ. ما اسمك الأول؟",
  },
  2: {
    en: "Nice to meet you, {firstName}! And your last name?",
    ar: "تشرفت بمعرفتك، {firstName}! وما هو اسمك الأخير؟",
  },
  3: {
    en: "Great! What's the name of your company, {firstName}?",
    ar: "رائع! ما هو اسم شركتك، {firstName}؟",
  },
  4: {
    en: "What's your company website? I'll analyze it to personalize your experience.",
    ar: "ما هو موقع شركتك؟ سأقوم بتحليله لتخصيص تجربتك.",
  },
  5: {
    en: "Almost there! What's your business email? Please use your company email.",
    ar: "تقريباً! ما هو بريدك الإلكتروني التجاري؟",
  },
  6: {
    en: "Now create a secure password for your account.",
    ar: "أنشئ كلمة مرور آمنة لحسابك.",
  },
  7: {
    en: "🎉 You're all set, {firstName}! Creating your account now...",
    ar: "🎉 كل شيء جاهز، {firstName}! جاري إنشاء حسابك...",
  },
};

// ─── Step transition variants ──────────────────────────────────────────────────
const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
};

// ─── Eye icon SVG ──────────────────────────────────────────────────────────────
const EyeIcon = ({ open }: { open: boolean }) =>
  open ? (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#64748B"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#64748B"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );

// ─── Check icon ────────────────────────────────────────────────────────────────
const CheckIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// ─── Main Component ────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const router = useRouter();
  const direction = useRef(1);

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    companyName: "",
    companyWebsite: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [websiteValid, setWebsiteValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isRTL, setIsRTL] = useState(false);

  useEffect(() => {
    setIsRTL(navigator.language.startsWith("ar"));
  }, []);

  // ─── Derived ─────────────────────────────────────────────────────────────────
  const ariaMood =
    loading && currentStep === 4
      ? "thinking"
      : currentStep === 7 || websiteValid
      ? "happy"
      : "idle";

  const getMessage = (step: number) => {
    const msgs = ariaMessages[step];
    const raw = isRTL ? msgs.ar : msgs.en;
    return raw
      .replace(/\{firstName\}/g, formData.firstName || "")
      .replace(/\{firstName\}!/g, formData.firstName ? `${formData.firstName}!` : "!");
  };

  const progressPercent = ((currentStep - 1) / 6) * 100;

  // ─── Validation ───────────────────────────────────────────────────────────────
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.firstName || formData.firstName.trim().length < 2) {
        newErrors.firstName = "First name must be at least 2 characters.";
      } else if (!/^[a-zA-Z\u0600-\u06FF\s]+$/.test(formData.firstName)) {
        newErrors.firstName = "First name must contain letters only.";
      }
    }

    if (step === 2) {
      if (!formData.lastName || formData.lastName.trim().length < 2) {
        newErrors.lastName = "Last name must be at least 2 characters.";
      } else if (!/^[a-zA-Z\u0600-\u06FF\s]+$/.test(formData.lastName)) {
        newErrors.lastName = "Last name must contain letters only.";
      }
    }

    if (step === 3) {
      if (!formData.companyName || formData.companyName.trim().length < 2) {
        newErrors.companyName = "Company name must be at least 2 characters.";
      }
    }

    if (step === 4) {
      const url = formData.companyWebsite.trim();
      if (!url) {
        newErrors.companyWebsite = "Please enter your company website.";
      } else {
        try {
          const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
          if (!parsed.hostname.includes(".")) {
            newErrors.companyWebsite = "Please enter a valid website URL.";
          }
        } catch {
          newErrors.companyWebsite = "Please enter a valid website URL.";
        }
      }
    }

    if (step === 5) {
      const email = formData.email.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        newErrors.email = "Please enter a valid email address.";
      } else {
        const emailDomain = email.split("@")[1]?.toLowerCase();
        if (FREE_EMAIL_DOMAINS.has(emailDomain)) {
          newErrors.email =
            "Please use your business email address, not a personal one.";
        } else {
          try {
            const websiteUrl = formData.companyWebsite.startsWith("http")
              ? formData.companyWebsite
              : `https://${formData.companyWebsite}`;
            const websiteDomain = new URL(websiteUrl).hostname
              .replace(/^www\./, "")
              .toLowerCase();
            const emailDomainClean = emailDomain.replace(/^www\./, "");
            if (
              websiteDomain &&
              emailDomainClean !== websiteDomain &&
              !emailDomainClean.endsWith(`.${websiteDomain}`)
            ) {
              newErrors.email = `Your email should match your company domain (${websiteDomain}).`;
            }
          } catch {
            // ignore url parse errors
          }
        }
      }
    }

    if (step === 6) {
      const p = formData.password;
      const allMet = passwordRequirements.every((r) => r.test(p));
      if (!allMet) {
        newErrors.password = "Please meet all password requirements.";
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ─── Handlers ─────────────────────────────────────────────────────────────────
  const handleNext = async () => {
    if (!validateStep(currentStep)) return;

    // Step 4: validate website via API
    if (currentStep === 4) {
      setLoading(true);
      try {
        const url = formData.companyWebsite.trim();
        const normalizedUrl = url.startsWith("http") ? url : `https://${url}`;
        const res = await fetch("/api/aria/validate-website", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: normalizedUrl }),
        });
        const data = await res.json();
        if (!res.ok || data.valid === false) {
          setErrors({ companyWebsite: data.error || "Unable to verify website. Please check the URL." });
          setLoading(false);
          return;
        }
        setWebsiteValid(true);
        setFormData((prev) => ({ ...prev, companyWebsite: normalizedUrl }));
      } catch {
        setErrors({ companyWebsite: "Network error. Please check your connection." });
        setLoading(false);
        return;
      }
      setLoading(false);
    }

    // Step 7: submit
    if (currentStep === 7) {
      await handleSubmit();
      return;
    }

    direction.current = 1;
    setCurrentStep((s) => s + 1);
  };

  const handleBack = () => {
    if (currentStep === 1) return;
    direction.current = -1;
    setErrors({});
    setCurrentStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          companyName: formData.companyName,
          companyWebsite: formData.companyWebsite,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error || "Registration failed. Please try again.");
        setLoading(false);
        return;
      }
      router.push("/onboarding/aria");
    } catch {
      setSubmitError("Network error. Please try again.");
      setLoading(false);
    }
  };

  const updateField = (field: keyof typeof formData) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  // ─── Step content ─────────────────────────────────────────────────────────────
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <StepInput
            label="First name"
            value={formData.firstName}
            onChange={updateField("firstName")}
            error={errors.firstName}
            placeholder="Your first name"
            autoFocus
          />
        );
      case 2:
        return (
          <StepInput
            label="Last name"
            value={formData.lastName}
            onChange={updateField("lastName")}
            error={errors.lastName}
            placeholder="Your last name"
            autoFocus
          />
        );
      case 3:
        return (
          <StepInput
            label="Company name"
            value={formData.companyName}
            onChange={updateField("companyName")}
            error={errors.companyName}
            placeholder="Your company name"
            autoFocus
          />
        );
      case 4:
        return (
          <div className="w-full">
            <label className="block text-sm font-semibold text-[#0F172A] mb-2">
              Company website
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-[#64748B] text-sm select-none z-10">
                https://
              </span>
              <motion.input
                type="text"
                value={formData.companyWebsite.replace(/^https?:\/\//, "")}
                onChange={(e) => {
                  updateField("companyWebsite")(e.target.value);
                  setWebsiteValid(false);
                }}
                placeholder="yourcompany.com"
                autoFocus
                className="w-full h-14 border border-[#E2E8F0] rounded-xl text-base text-[#0F172A] outline-none transition-all bg-white"
                style={{ paddingLeft: "80px", paddingRight: websiteValid ? "44px" : "16px" }}
                whileFocus={{
                  boxShadow: "0 0 0 3px rgba(20,184,166,0.15)",
                  borderColor: "#14B8A6",
                }}
              />
              {websiteValid && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute right-4 w-6 h-6 rounded-full bg-[#10B981] flex items-center justify-center"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </motion.div>
              )}
            </div>
            {errors.companyWebsite && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[#EF4444] text-sm mt-1.5"
              >
                {errors.companyWebsite}
              </motion.p>
            )}
          </div>
        );
      case 5:
        return (
          <StepInput
            label="Business email"
            type="email"
            value={formData.email}
            onChange={updateField("email")}
            error={errors.email}
            placeholder="you@yourcompany.com"
            autoFocus
          />
        );
      case 6:
        return (
          <div className="w-full space-y-4">
            {/* Password */}
            <div className="w-full">
              <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                Password
              </label>
              <div className="relative flex items-center">
                <motion.input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => updateField("password")(e.target.value)}
                  placeholder="Create a password"
                  autoFocus
                  className="w-full h-14 border border-[#E2E8F0] rounded-xl text-base text-[#0F172A] outline-none transition-all bg-white"
                  style={{ paddingLeft: "16px", paddingRight: "48px" }}
                  whileFocus={{
                    boxShadow: "0 0 0 3px rgba(20,184,166,0.15)",
                    borderColor: "#14B8A6",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 text-[#64748B] hover:text-[#0F172A] transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[#EF4444] text-sm mt-1.5"
                >
                  {errors.password}
                </motion.p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="w-full">
              <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                Confirm password
              </label>
              <div className="relative flex items-center">
                <motion.input
                  type={showConfirm ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => updateField("confirmPassword")(e.target.value)}
                  placeholder="Repeat your password"
                  className="w-full h-14 border border-[#E2E8F0] rounded-xl text-base text-[#0F172A] outline-none transition-all bg-white"
                  style={{ paddingLeft: "16px", paddingRight: "48px" }}
                  whileFocus={{
                    boxShadow: "0 0 0 3px rgba(20,184,166,0.15)",
                    borderColor: "#14B8A6",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-4 text-[#64748B] hover:text-[#0F172A] transition-colors"
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  <EyeIcon open={showConfirm} />
                </button>
              </div>
              {errors.confirmPassword && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[#EF4444] text-sm mt-1.5"
                >
                  {errors.confirmPassword}
                </motion.p>
              )}
            </div>

            {/* Requirements checklist */}
            <div className="space-y-2 pt-1">
              {passwordRequirements.map((req) => {
                const met = req.test(formData.password);
                return (
                  <motion.div
                    key={req.label}
                    className="flex items-center gap-2"
                    animate={{ opacity: 1 }}
                  >
                    <motion.div
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      animate={{
                        backgroundColor: met ? "#10B981" : "#E2E8F0",
                        color: met ? "#ffffff" : "#94A3B8",
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      {met && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 400, damping: 20 }}
                        >
                          <CheckIcon />
                        </motion.span>
                      )}
                    </motion.div>
                    <motion.span
                      className="text-sm"
                      animate={{ color: met ? "#10B981" : "#64748B" }}
                      transition={{ duration: 0.2 }}
                    >
                      {req.label}
                    </motion.span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        );
      case 7:
        return (
          <div className="w-full text-center py-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="w-20 h-20 rounded-full bg-[#14B8A6]/10 flex items-center justify-center mx-auto mb-4"
            >
              <span className="text-4xl">🎉</span>
            </motion.div>
            <h3 className="text-xl font-bold text-[#0F172A] mb-2">
              You&apos;re all set, {formData.firstName}!
            </h3>
            <p className="text-[#64748B] text-sm mb-4">
              Review your details before we create your account.
            </p>
            <div className="text-left space-y-2 bg-[#F8FAFC] rounded-xl p-4 border border-[#E2E8F0]">
              {[
                { label: "Name", value: `${formData.firstName} ${formData.lastName}` },
                { label: "Company", value: formData.companyName },
                { label: "Website", value: formData.companyWebsite },
                { label: "Email", value: formData.email },
              ].map((item) => (
                <div key={item.label} className="flex justify-between text-sm">
                  <span className="text-[#64748B] font-medium">{item.label}</span>
                  <span className="text-[#0F172A] font-semibold truncate ml-4 max-w-[60%] text-right">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
            {submitError && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[#EF4444] text-sm mt-3"
              >
                {submitError}
              </motion.p>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  const stepTitles: Record<number, string> = {
    1: "What's your first name?",
    2: "And your last name?",
    3: "Your company name",
    4: "Company website",
    5: "Business email",
    6: "Create a password",
    7: "Ready to launch!",
  };

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen flex"
      dir={isRTL ? "rtl" : "ltr"}
      role="main"
      aria-label="Registration page"
    >
      {/* ── Mobile banner (hidden on md+) ─────────────────────────────────────── */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-20 flex items-center gap-3 px-4 py-3"
        style={{
          background: "linear-gradient(135deg, #0A1628 0%, #0D3D3D 100%)",
        }}
      >
        <Link href="/" aria-label="Go to homepage">
          <AvoraLogo variant="light" height={28} />
        </Link>
        <div className="flex-1 flex justify-center">
          <div className="scale-50 origin-center -my-4">
            <ARIACharacter mood={ariaMood} speaking={currentStep < 7} />
          </div>
        </div>
        <div className="text-white/60 text-xs font-medium">
          {currentStep}/7
        </div>
      </div>

      {/* ── Left Panel (desktop) ─────────────────────────────────────────────── */}
      <div
        className="hidden md:flex md:w-2/5 flex-col relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0A1628 0%, #0D3D3D 100%)",
        }}
        aria-hidden="true"
      >
        {/* Decorative orbs */}
        <div
          className="absolute top-1/3 right-0 w-64 h-64 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(20,184,166,0.12) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-1/4 left-0 w-48 h-48 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%)",
          }}
        />

        {/* Logo */}
        <div className="relative z-10 p-8 pb-0">
          <Link href="/" aria-label="Go to homepage">
            <AvoraLogo variant="light" height={32} />
          </Link>
        </div>

        {/* ARIA + Speech Bubble centered */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 gap-8 relative z-10">
          {/* Speech bubble */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.3 }}
              className="relative bg-white rounded-xl p-4 shadow-lg max-w-[240px] text-sm text-[#0F172A] leading-relaxed"
            >
              <TypewriterText text={getMessage(currentStep)} />
              {/* Triangle pointing down toward ARIA */}
              <div
                className="absolute left-1/2 -translate-x-1/2 top-full"
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: "8px solid transparent",
                  borderRight: "8px solid transparent",
                  borderTop: "8px solid white",
                }}
              />
            </motion.div>
          </AnimatePresence>

          {/* ARIA character */}
          <ARIACharacter mood={ariaMood} speaking={currentStep < 7} />

          {/* Step dots */}
          <div className="flex items-center gap-2 mt-4" role="progressbar" aria-valuenow={currentStep} aria-valuemin={1} aria-valuemax={7} aria-label={`Step ${currentStep} of 7`}>
            <span className="text-white/40 text-xs font-medium mr-1">
              Step {currentStep} of 7
            </span>
            {Array.from({ length: 7 }, (_, i) => (
              <motion.div
                key={i}
                className="rounded-full"
                animate={{
                  width: i + 1 === currentStep ? 24 : 8,
                  backgroundColor:
                    i + 1 <= currentStep
                      ? "#14B8A6"
                      : "rgba(255,255,255,0.3)",
                }}
                style={{ height: 8 }}
                transition={{ duration: 0.3 }}
              />
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <div className="relative z-10 p-8 pt-0">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="border border-white/10 rounded-xl p-4"
            style={{ background: "rgba(255,255,255,0.05)" }}
          >
            <p className="text-white/70 text-sm italic leading-relaxed mb-3">
              &ldquo;AVORA transformed our sales outreach. We closed 3x more deals
              in the first month alone.&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#14B8A6]/30 flex items-center justify-center text-[#14B8A6] font-bold text-sm">
                S
              </div>
              <div>
                <p className="text-white text-xs font-semibold">Sarah Mitchell</p>
                <p className="text-white/40 text-xs">VP Sales, TechFlow Inc.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Right Panel ──────────────────────────────────────────────────────── */}
      <div
        className="flex-1 flex flex-col bg-white relative"
        style={{ paddingTop: "0" }}
      >
        {/* Progress bar */}
        <div className="w-full h-1 bg-[#F1F5F9]" role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100}>
          <motion.div
            className="h-full"
            style={{ background: "linear-gradient(90deg, #14B8A6 0%, #0D9488 100%)" }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          />
        </div>

        {/* Form area */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 mt-12 md:mt-0">
          <div className="w-full max-w-md">
            {/* Back button */}
            {currentStep > 1 && currentStep < 7 && (
              <motion.button
                onClick={handleBack}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 text-[#64748B] hover:text-[#0F172A] text-sm font-medium mb-6 transition-colors group"
                aria-label="Go to previous step"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="group-hover:-translate-x-0.5 transition-transform"
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Back
              </motion.button>
            )}

            {/* Step heading */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`title-${currentStep}`}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.25 }}
                className="mb-6"
              >
                <p className="text-[#14B8A6] text-xs font-bold uppercase tracking-widest mb-1">
                  Step {currentStep} of 7
                </p>
                <h1 className="text-2xl font-extrabold text-[#0F172A]" style={{ letterSpacing: "-0.02em" }}>
                  {stepTitles[currentStep]}
                </h1>
              </motion.div>
            </AnimatePresence>

            {/* Step form content */}
            <AnimatePresence mode="wait" custom={direction.current}>
              <motion.div
                key={currentStep}
                custom={direction.current}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="mb-6"
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>

            {/* Primary action button */}
            <motion.button
              onClick={handleNext}
              disabled={loading}
              whileHover={loading ? {} : { scale: 1.02 }}
              whileTap={loading ? {} : { scale: 0.98 }}
              className="w-full h-14 rounded-xl font-semibold text-white text-base"
              style={{
                background: loading
                  ? "#94A3B8"
                  : "linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)",
              }}
              aria-label={currentStep === 7 ? "Create account" : "Continue to next step"}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <motion.div
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                  <span>Please wait...</span>
                </div>
              ) : currentStep === 7 ? (
                <span>Create Account 🚀</span>
              ) : (
                <span>Continue →</span>
              )}
            </motion.button>

            {/* Sign in link */}
            <p className="mt-6 text-center text-sm text-[#64748B]">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-[#14B8A6] font-semibold hover:text-[#0D9488] transition-colors"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
