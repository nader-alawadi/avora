"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";

// ─── CountUp Component ────────────────────────────────────────────────────────
function CountUp({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [inView, target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

// ─── Content / Translations ───────────────────────────────────────────────────
const content = {
  en: {
    nav: {
      features: "Features",
      pricing: "Pricing",
      about: "About",
      login: "Log In",
      start: "Start Free",
    },
    hero: {
      badge: "🚀 AI-Powered Sales Intelligence",
      h1a: "Close More Deals With ",
      h1highlight: "AI That Thinks",
      h1b: " Like Your Best Sales Rep",
      sub: "AVORA's AI analyzes your business, finds your ideal customers across 150+ countries, and gives you everything you need to close deals — strategy, leads, coaching, and CRM in one platform.",
      cta1: "Start for Free →",
      cta2: "Watch Demo ▶",
      trust: "⭐⭐⭐⭐⭐  Loved by 500+ sales teams across MENA & GCC",
      dashTitle: "AVORA Dashboard",
      stat1Label: "Leads",
      stat2Label: "Accuracy",
      stat3Label: "Pipeline",
    },
    marquee: {
      label: "Trusted by teams at",
    },
    stats: [
      { value: 2, suffix: "M+", label: "Verified Contacts" },
      { value: 94, suffix: "%", label: "Lead Accuracy" },
      { value: 3, suffix: "x", label: "Average Pipeline Growth" },
      { value: 150, suffix: "+", label: "Countries Covered" },
    ],
    features: {
      header: "Everything You Need to Close More Deals",
      sub: "One platform. Every tool your sales team needs.",
      items: [
        {
          icon: "🎯",
          title: "AI Strategy Builder",
          desc: "Get your complete ICP, DMU, ABM strategy and GTM playbook in minutes — tailored to your exact business.",
        },
        {
          icon: "🔍",
          title: "Qualified Lead Discovery",
          desc: "AI finds decision-makers that match your ICP across 150+ countries with verified contact data.",
        },
        {
          icon: "🤖",
          title: "ARIA AI Coach",
          desc: "Your personal sales mentor guides you from onboarding to closing deals with real-time coaching.",
        },
        {
          icon: "📊",
          title: "Built-in CRM",
          desc: "Manage your entire pipeline, team, and deals without switching tools — everything in one place.",
        },
        {
          icon: "🎙️",
          title: "Meeting Intelligence",
          desc: "ARIA joins your calls, analyzes personalities, writes proposals & contracts automatically.",
        },
        {
          icon: "📈",
          title: "Outreach Templates",
          desc: "Personalized templates for LinkedIn, Email, WhatsApp & Cold Call — optimized to convert.",
        },
      ],
    },
    howItWorks: {
      header: "From Sign Up to First Deal in 24 Hours",
      steps: [
        {
          num: 1,
          title: "ARIA Analyzes Your Business",
          desc: "Sign up and ARIA reads your website — understanding your business, industry, and ideal customers in under 60 seconds.",
          bullets: [
            "Instant business analysis",
            "ICP identification",
            "Market positioning",
          ],
        },
        {
          num: 2,
          title: "Get 5 Free Qualified Leads Instantly",
          desc: "🎁 Your first 5 leads are on us. See exactly who your ideal buyers are and how to reach them.",
          bullets: [
            "Decision-maker profiles",
            "Verified contact info",
            "Personality insights",
          ],
        },
        {
          num: 3,
          title: "Build Your GTM Strategy",
          desc: "AVORA generates your complete go-to-market strategy — ICP, ABM campaigns, and outreach playbooks.",
          bullets: [
            "✓ Full ICP definition",
            "✓ ABM campaign plan",
            "✓ Multi-channel outreach",
            "✓ Competitive positioning",
          ],
        },
        {
          num: 4,
          title: "Scale With Your Team",
          desc: "Invite your team, assign leads, track deals, and let ARIA coach every rep to peak performance.",
          bullets: [
            "Team management",
            "Pipeline tracking",
            "AI coaching for every rep",
          ],
          cta: "Start Free →",
        },
      ],
    },
    leads: {
      header: "Three Tiers of Qualified Leads",
      sub: "Pay only for what you need. No contracts, no commitments.",
      cards: [
        {
          icon: "🎯",
          name: "Fit Lead",
          price: "$5",
          unit: "/lead",
          badge: null,
          features: [
            "Full company analysis",
            "Decision maker profile",
            "Personality analysis",
            "Outreach templates for all channels",
            "ABM strategy included",
          ],
          cta: "Buy Fit Leads",
          ctaStyle: "outline-teal",
        },
        {
          icon: "🔥",
          name: "Intent Lead",
          price: "$10",
          unit: "/lead",
          badge: "Most Popular",
          features: [
            "Everything in Fit Lead",
            "Actively searching for your solution right now",
            "Higher conversion rate",
            "Priority support",
            "Real-time intent signals",
          ],
          cta: "Buy Intent Leads",
          ctaStyle: "filled-teal",
        },
        {
          icon: "💎",
          name: "Engaged Lead",
          price: "Custom",
          unit: " pricing",
          badge: null,
          features: [
            "Everything in Intent Lead",
            "We contacted them for you",
            "They're interested in YOU specifically",
            "Highest close rate",
            "White-glove onboarding",
          ],
          cta: "Get a Quote",
          ctaStyle: "filled-coral",
        },
      ],
    },
    testimonials: {
      header: "Loved by Sales Teams Across MENA",
      items: [
        {
          quote: "We went from 5 to 47 qualified meetings per month. AVORA completely transformed how we prospect.",
          name: "Ahmed K.",
          title: "VP Sales",
          company: "SaaS Company, KSA",
          initials: "AK",
        },
        {
          quote: "AVORA's leads are 3x more accurate than anything we've tried. Our conversion rate doubled in 60 days.",
          name: "Sara M.",
          title: "Growth Lead",
          company: "UAE E-commerce",
          initials: "SM",
        },
        {
          quote: "ARIA is like having a senior sales consultant on call 24/7. It coached our whole team from day one.",
          name: "Omar R.",
          title: "Founder",
          company: "Egypt B2B Services",
          initials: "OR",
        },
      ],
    },
    cta: {
      h2: "Ready to Fill Your Pipeline With Qualified Leads?",
      sub: "Join 500+ sales teams already closing more deals with AVORA.",
      btn1: "Start for Free — No Credit Card Required",
      btn2: "Book a Demo",
    },
    footer: {
      tagline: "AI-powered sales intelligence for MENA & GCC sales teams.",
      product: {
        header: "Product",
        links: ["AI Strategy Builder", "Lead Discovery", "Built-in CRM", "ARIA Coach"],
      },
      company: {
        header: "Company",
        links: ["About", "Customers", "Pricing", "Contact"],
      },
      legal: {
        header: "Legal",
        links: ["Privacy Policy", "Terms of Service", "Cookie Policy"],
      },
      copy: "© 2025 AVORA by Enigma Sales. All rights reserved.",
    },
  },
  ar: {
    nav: {
      features: "الميزات",
      pricing: "الأسعار",
      about: "عن المنصة",
      login: "تسجيل الدخول",
      start: "ابدأ مجاناً",
    },
    hero: {
      badge: "🚀 ذكاء اصطناعي متخصص في المبيعات",
      h1a: "أغلق المزيد من الصفقات مع ",
      h1highlight: "ذكاء اصطناعي يفكر",
      h1b: " مثل أفضل مندوب مبيعات لديك",
      sub: "يحلل AVORA عملك، ويجد عملاءك المثاليين في أكثر من 150 دولة، ويمنحك كل ما تحتاجه لإغلاق الصفقات — الاستراتيجية والعملاء المحتملين والتدريب وإدارة علاقات العملاء في منصة واحدة.",
      cta1: "ابدأ مجاناً →",
      cta2: "▶ شاهد العرض",
      trust: "⭐⭐⭐⭐⭐  يثق به أكثر من 500 فريق مبيعات في منطقة الشرق الأوسط وشمال أفريقيا",
      dashTitle: "لوحة تحكم AVORA",
      stat1Label: "عميل محتمل",
      stat2Label: "دقة التوقعات",
      stat3Label: "خط الأنابيب",
    },
    marquee: {
      label: "يثق بنا فرق من",
    },
    stats: [
      { value: 2, suffix: "م+", label: "جهة اتصال موثقة" },
      { value: 94, suffix: "%", label: "دقة العملاء المحتملين" },
      { value: 3, suffix: "×", label: "متوسط نمو خط الأنابيب" },
      { value: 150, suffix: "+", label: "دولة مغطاة" },
    ],
    features: {
      header: "كل ما تحتاجه لإغلاق المزيد من الصفقات",
      sub: "منصة واحدة. كل الأدوات التي يحتاجها فريق مبيعاتك.",
      items: [
        {
          icon: "🎯",
          title: "مُنشئ الاستراتيجية بالذكاء الاصطناعي",
          desc: "احصل على ملف ICP الكامل واستراتيجية ABM وخطة GTM في دقائق — مصممة خصيصاً لعملك.",
        },
        {
          icon: "🔍",
          title: "اكتشاف العملاء المؤهلين",
          desc: "يعثر الذكاء الاصطناعي على صانعي القرار المطابقين لملفك المثالي في أكثر من 150 دولة.",
        },
        {
          icon: "🤖",
          title: "مدرب ARIA الذكي",
          desc: "مرشدك الشخصي في المبيعات يقودك من الإعداد حتى إغلاق الصفقات بتدريب فوري.",
        },
        {
          icon: "📊",
          title: "نظام CRM مدمج",
          desc: "أدر خط أنابيبك وفريقك وصفقاتك بالكامل دون الحاجة إلى تبديل الأدوات.",
        },
        {
          icon: "🎙️",
          title: "ذكاء الاجتماعات",
          desc: "ARIA تنضم لمكالماتك، تحلل الشخصيات، وتكتب العروض والعقود تلقائياً.",
        },
        {
          icon: "📈",
          title: "قوالب التواصل",
          desc: "قوالب مخصصة لـ LinkedIn والبريد الإلكتروني وواتساب والمكالمات الباردة.",
        },
      ],
    },
    howItWorks: {
      header: "من التسجيل إلى أول صفقة في 24 ساعة",
      steps: [
        {
          num: 1,
          title: "ARIA تحلل عملك",
          desc: "سجّل وستقرأ ARIA موقعك الإلكتروني — لتفهم عملك وصناعتك وعملاءك المثاليين في أقل من 60 ثانية.",
          bullets: ["تحليل فوري للعمل", "تحديد العملاء المثاليين", "تحديد موضع السوق"],
        },
        {
          num: 2,
          title: "احصل على 5 عملاء محتملين مجاناً",
          desc: "🎁 أول 5 عملاء محتملين على حسابنا. اكتشف بالضبط من هم مشتروك المثاليون وكيفية الوصول إليهم.",
          bullets: ["ملفات صانعي القرار", "بيانات اتصال موثقة", "رؤى الشخصية"],
        },
        {
          num: 3,
          title: "بناء استراتيجية GTM الخاصة بك",
          desc: "يُنشئ AVORA استراتيجية الذهاب إلى السوق الكاملة — ICP وحملات ABM وخطط التواصل.",
          bullets: ["✓ تعريف ICP كامل", "✓ خطة حملة ABM", "✓ تواصل متعدد القنوات", "✓ تحديد الموقع التنافسي"],
        },
        {
          num: 4,
          title: "التوسع مع فريقك",
          desc: "ادعُ فريقك وخصص العملاء وتتبع الصفقات ودع ARIA تدرب كل مندوب لتحقيق أفضل أداء.",
          bullets: ["إدارة الفريق", "تتبع خط الأنابيب", "تدريب ذكي لكل مندوب"],
          cta: "ابدأ مجاناً →",
        },
      ],
    },
    leads: {
      header: "ثلاثة مستويات من العملاء المحتملين المؤهلين",
      sub: "ادفع فقط لما تحتاجه. بدون عقود أو التزامات.",
      cards: [
        {
          icon: "🎯",
          name: "عميل مناسب",
          price: "$5",
          unit: "/عميل",
          badge: null,
          features: [
            "تحليل شامل للشركة",
            "ملف صانع القرار",
            "تحليل الشخصية",
            "قوالب تواصل لجميع القنوات",
            "استراتيجية ABM مضمنة",
          ],
          cta: "اشترِ عملاء مناسبين",
          ctaStyle: "outline-teal",
        },
        {
          icon: "🔥",
          name: "عميل بنية شراء",
          price: "$10",
          unit: "/عميل",
          badge: "الأكثر شعبية",
          features: [
            "كل ما في العميل المناسب",
            "يبحث بنشاط عن حلك الآن",
            "معدل تحويل أعلى",
            "دعم ذو أولوية",
            "إشارات النية في الوقت الفعلي",
          ],
          cta: "اشترِ عملاء بنية شراء",
          ctaStyle: "filled-teal",
        },
        {
          icon: "💎",
          name: "عميل متفاعل",
          price: "مخصص",
          unit: "",
          badge: null,
          features: [
            "كل ما في عميل بنية الشراء",
            "تواصلنا معهم نيابة عنك",
            "مهتمون بك تحديداً",
            "أعلى معدل إغلاق",
            "تأهيل شخصي متكامل",
          ],
          cta: "احصل على عرض سعر",
          ctaStyle: "filled-coral",
        },
      ],
    },
    testimonials: {
      header: "يحبه فرق المبيعات في منطقة الشرق الأوسط وشمال أفريقيا",
      items: [
        {
          quote: "انتقلنا من 5 إلى 47 اجتماع مؤهل شهرياً. AVORA غيّر طريقة عملنا كلياً.",
          name: "أحمد ك.",
          title: "نائب رئيس المبيعات",
          company: "شركة SaaS، المملكة العربية السعودية",
          initials: "أك",
        },
        {
          quote: "عملاء AVORA المحتملون أكثر دقة بثلاثة أضعاف من أي شيء جربناه. تضاعف معدل تحويلنا في 60 يوماً.",
          name: "سارة م.",
          title: "قائدة النمو",
          company: "تجارة إلكترونية، الإمارات",
          initials: "سم",
        },
        {
          quote: "ARIA مثل وجود مستشار مبيعات كبير في متناول يدك على مدار الساعة. دربت فريقنا بالكامل منذ اليوم الأول.",
          name: "عمر ر.",
          title: "المؤسس",
          company: "خدمات B2B، مصر",
          initials: "عر",
        },
      ],
    },
    cta: {
      h2: "هل أنت مستعد لملء خط أنابيبك بعملاء محتملين مؤهلين؟",
      sub: "انضم إلى أكثر من 500 فريق مبيعات يغلقون صفقات أكثر مع AVORA.",
      btn1: "ابدأ مجاناً — لا بطاقة ائتمان مطلوبة",
      btn2: "احجز عرضاً توضيحياً",
    },
    footer: {
      tagline: "ذكاء اصطناعي متخصص في المبيعات لفرق البيع في الشرق الأوسط وشمال أفريقيا.",
      product: {
        header: "المنتج",
        links: ["مُنشئ الاستراتيجية", "اكتشاف العملاء", "CRM المدمج", "مدرب ARIA"],
      },
      company: {
        header: "الشركة",
        links: ["من نحن", "العملاء", "الأسعار", "تواصل معنا"],
      },
      legal: {
        header: "القانونية",
        links: ["سياسة الخصوصية", "شروط الخدمة", "سياسة ملفات تعريف الارتباط"],
      },
      copy: "© 2025 AVORA بواسطة Enigma Sales. جميع الحقوق محفوظة.",
    },
  },
};

// ─── Company names for marquee ────────────────────────────────────────────────
const MARQUEE_COMPANIES = [
  "TechCorp", "GrowthCo", "SalesHQ", "B2BPro",
  "ScaleUp", "DealForce", "PipelinePro", "RevenueIQ",
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function HomePage() {
  const [lang, setLang] = useState<"en" | "ar">("en");

  useEffect(() => {
    const saved = localStorage.getItem("avora-lang");
    const browser = navigator.language.startsWith("ar") ? "ar" : "en";
    setLang((saved || browser) as "en" | "ar");
  }, []);

  const t = content[lang];

  return (
    <main dir={lang === "ar" ? "rtl" : "ltr"} style={{ fontFamily: "Inter, sans-serif", overflowX: "hidden" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marqueeRtl {
          0% { transform: translateX(0); }
          100% { transform: translateX(50%); }
        }
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes gradientShiftCTA {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .marquee-track {
          display: flex;
          gap: 48px;
          animation: marquee 28s linear infinite;
          width: max-content;
        }
        .marquee-track-rtl {
          display: flex;
          gap: 48px;
          animation: marqueeRtl 28s linear infinite;
          width: max-content;
        }
        .hero-card-glow {
          position: absolute;
          bottom: -40px;
          left: 50%;
          transform: translateX(-50%);
          width: 80%;
          height: 120px;
          background: radial-gradient(ellipse 80% 40% at 50% 100%, rgba(20,184,166,0.3), transparent);
          pointer-events: none;
        }
        .cta-section {
          background: linear-gradient(135deg, #0D9488 0%, #14B8A6 50%, #0D9488 100%);
          background-size: 200% 200%;
          animation: gradientShiftCTA 6s ease infinite;
        }
        .step-mockup-card {
          background: #1E293B;
          border-radius: 16px;
          padding: 20px;
          min-height: 220px;
        }
        * { box-sizing: border-box; }
      ` }} />

      {/* ── Section 1: Hero ─────────────────────────────────────── */}
      <section
        id="hero"
        style={{
          minHeight: "100vh",
          backgroundColor: "#0A1628",
          paddingTop: 72,
          overflow: "hidden",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Floating Orbs */}
        <motion.div
          style={{
            position: "absolute",
            width: 600,
            height: 600,
            borderRadius: "50%",
            opacity: 0.15,
            filter: "blur(80px)",
            background: "radial-gradient(circle, #14B8A6, transparent)",
            top: -100,
            left: -200,
            willChange: "transform",
            zIndex: 0,
          }}
          animate={{ y: [-30, 30, -30], x: [-20, 20, -20] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          style={{
            position: "absolute",
            width: 400,
            height: 400,
            borderRadius: "50%",
            opacity: 0.12,
            filter: "blur(80px)",
            background: "radial-gradient(circle, #F97316, transparent)",
            top: -80,
            right: -120,
            willChange: "transform",
            zIndex: 0,
          }}
          animate={{ y: [30, -30, 30], x: [20, -20, 20] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          style={{
            position: "absolute",
            width: 300,
            height: 300,
            borderRadius: "50%",
            opacity: 0.10,
            filter: "blur(80px)",
            background: "radial-gradient(circle, #7C3AED, transparent)",
            bottom: 80,
            left: "50%",
            transform: "translateX(-50%)",
            willChange: "transform",
            zIndex: 0,
          }}
          animate={{ y: [-20, 20, -20], x: [-10, 10, -10] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Content */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            padding: "0 24px",
            maxWidth: 1100,
            width: "100%",
            margin: "0 auto",
          }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              border: "1px solid #14B8A6",
              color: "#14B8A6",
              backgroundColor: "#0A2040",
              borderRadius: 9999,
              padding: "8px 20px",
              fontSize: 14,
              fontWeight: 600,
              marginBottom: 32,
              letterSpacing: 0.5,
            }}
          >
            {t.hero.badge}
          </motion.div>

          {/* H1 */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            style={{
              fontSize: "clamp(40px, 6vw, 72px)",
              fontWeight: 800,
              color: "#FFFFFF",
              maxWidth: 900,
              lineHeight: 1.1,
              marginBottom: 24,
              margin: "0 auto 24px",
            }}
          >
            {t.hero.h1a}
            <span
              style={{
                background: "linear-gradient(135deg, #14B8A6, #0D9488)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {t.hero.h1highlight}
            </span>
            {t.hero.h1b}
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            style={{
              fontSize: 20,
              color: "#94A3B8",
              maxWidth: 600,
              lineHeight: 1.6,
              margin: "0 auto 40px",
            }}
          >
            {t.hero.sub}
          </motion.p>

          {/* CTA Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center", marginBottom: 24 }}
          >
            <motion.a
              href="/auth/register"
              whileHover={{ scale: 1.02, boxShadow: "0 8px 30px rgba(249,115,22,0.4)" }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #F97316, #EA580C)",
                color: "#FFFFFF",
                fontWeight: 700,
                fontSize: 16,
                height: 56,
                padding: "0 24px",
                borderRadius: 12,
                textDecoration: "none",
                border: "none",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {t.hero.cta1}
            </motion.a>
            <motion.a
              href="#demo"
              whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.1)" }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid rgba(255,255,255,0.4)",
                color: "#FFFFFF",
                fontWeight: 600,
                fontSize: 16,
                height: 56,
                padding: "0 24px",
                borderRadius: 12,
                textDecoration: "none",
                cursor: "pointer",
                whiteSpace: "nowrap",
                backgroundColor: "transparent",
              }}
            >
              {t.hero.cta2}
            </motion.a>
          </motion.div>

          {/* Trust line */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            style={{ fontSize: 13, color: "#94A3B8", marginBottom: 64 }}
          >
            {t.hero.trust}
          </motion.p>

          {/* Hero Mockup Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            style={{ position: "relative", width: "100%", maxWidth: 780 }}
          >
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              style={{
                background: "rgba(255,255,255,0.05)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 20,
                padding: 24,
                width: "100%",
              }}
            >
              {/* Top bar */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#EF4444" }} />
                <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#F59E0B" }} />
                <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#22C55E" }} />
                <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, marginLeft: 8, fontWeight: 500 }}>
                  {t.hero.dashTitle}
                </span>
              </div>

              {/* Mini stat cards row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
                {[
                  { val: "2,847", label: t.hero.stat1Label, trend: "↑ 12%", trendColor: "#22C55E" },
                  { val: "94%", label: t.hero.stat2Label, trend: "↑ 3%", trendColor: "#22C55E" },
                  { val: "$2.4M", label: t.hero.stat3Label, trend: "↑ 28%", trendColor: "#22C55E" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 12,
                      padding: "12px 16px",
                    }}
                  >
                    <div style={{ color: "#FFFFFF", fontWeight: 700, fontSize: 20 }}>{stat.val}</div>
                    <div style={{ color: "#94A3B8", fontSize: 11, marginTop: 2 }}>{stat.label}</div>
                    <div style={{ color: stat.trendColor, fontSize: 11, marginTop: 4, fontWeight: 600 }}>{stat.trend}</div>
                  </div>
                ))}
              </div>

              {/* Bar chart */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap: 8,
                  height: 80,
                  marginBottom: 20,
                  padding: "0 4px",
                }}
              >
                {[55, 72, 45, 88, 62, 95, 78].map((h, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: `${h}%`,
                      borderRadius: "4px 4px 0 0",
                      background: i % 2 === 0
                        ? "linear-gradient(180deg, #14B8A6, #0D9488)"
                        : "linear-gradient(180deg, #F97316, #EA580C)",
                      opacity: 0.85,
                    }}
                  />
                ))}
              </div>

              {/* Mini table */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { company: "Acme Corp", score: 92, status: "Hot" },
                  { company: "TechGrow SA", score: 85, status: "Warm" },
                  { company: "Gulf Ventures", score: 78, status: "Contacted" },
                ].map((row) => (
                  <div
                    key={row.company}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      background: "rgba(255,255,255,0.04)",
                      borderRadius: 8,
                    }}
                  >
                    <span style={{ color: "#FFFFFF", fontSize: 13, fontWeight: 500 }}>{row.company}</span>
                    <span
                      style={{
                        background: "rgba(20,184,166,0.2)",
                        color: "#14B8A6",
                        borderRadius: 9999,
                        padding: "2px 10px",
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      {row.score}
                    </span>
                    <span style={{ color: "#94A3B8", fontSize: 12 }}>{row.status}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Glow below card */}
            <div className="hero-card-glow" />
          </motion.div>
        </div>
      </section>

      {/* ── Section 2: Logo Marquee ──────────────────────────────── */}
      <section
        style={{
          backgroundColor: "#FFFFFF",
          padding: "40px 0",
          overflow: "hidden",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <p style={{ color: "#94A3B8", fontSize: 13, fontWeight: 500, textAlign: "center", marginBottom: 20 }}>
            {t.marquee.label}
          </p>
        </div>
        <div
          style={{
            overflow: "hidden",
            WebkitMask: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
            mask: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          }}
        >
          <div className={lang === "ar" ? "marquee-track-rtl" : "marquee-track"}>
            {[...MARQUEE_COMPANIES, ...MARQUEE_COMPANIES].map((name, i) => (
              <span
                key={`${name}-${i}`}
                style={{
                  color: "#94A3B8",
                  fontWeight: 600,
                  fontSize: 16,
                  whiteSpace: "nowrap",
                  letterSpacing: 0.5,
                  flexShrink: 0,
                }}
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 3: Stats Bar ─────────────────────────────────── */}
      <section
        style={{
          background: "linear-gradient(135deg, #0D9488 0%, #134E4A 50%, #0A1628 100%)",
          padding: "80px 0",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "0 24px",
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 0,
          }}
        >
          {t.stats.map((stat, i) => (
            <div
              key={stat.label}
              style={{
                textAlign: "center",
                padding: "24px 16px",
                borderRight: i < 3 ? "1px solid rgba(255,255,255,0.2)" : "none",
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              >
                <div
                  style={{
                    fontSize: "clamp(36px, 4vw, 56px)",
                    fontWeight: 800,
                    color: "#FFFFFF",
                    lineHeight: 1,
                    marginBottom: 8,
                  }}
                >
                  <CountUp target={stat.value} suffix={stat.suffix} />
                </div>
                <div style={{ fontSize: 14, color: "#99F6E4", fontWeight: 500 }}>{stat.label}</div>
              </motion.div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 4: Features Grid ─────────────────────────────── */}
      <section
        id="features"
        style={{
          backgroundColor: "#FFFFFF",
          padding: "100px 0",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              style={{
                fontSize: "clamp(32px, 4vw, 48px)",
                fontWeight: 800,
                color: "#0F172A",
                marginBottom: 16,
              }}
            >
              {t.features.header}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              style={{ fontSize: 18, color: "#64748B" }}
            >
              {t.features.sub}
            </motion.p>
          </div>

          {/* Grid */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.1 } },
            }}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: 24,
            }}
          >
            {t.features.items.map((feature) => (
              <motion.div
                key={feature.title}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
                }}
                whileHover={{
                  y: -6,
                  boxShadow: "0 20px 60px rgba(0,0,0,0.10)",
                  borderColor: "#14B8A6",
                }}
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  borderRadius: 20,
                  padding: 32,
                  cursor: "default",
                  transition: "border-color 0.2s",
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #14B8A6, #F97316)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 24,
                    marginBottom: 20,
                  }}
                >
                  {feature.icon}
                </div>
                <h3
                  style={{
                    fontWeight: 600,
                    fontSize: 20,
                    color: "#0F172A",
                    marginBottom: 12,
                  }}
                >
                  {feature.title}
                </h3>
                <p style={{ fontSize: 16, color: "#64748B", lineHeight: 1.6 }}>{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Section 5: How It Works ──────────────────────────────── */}
      <section
        id="how-it-works"
        style={{
          backgroundColor: "#F8FAFC",
          padding: "100px 0",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 80 }}>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              style={{
                fontSize: "clamp(28px, 3.5vw, 44px)",
                fontWeight: 800,
                color: "#0F172A",
              }}
            >
              {t.howItWorks.header}
            </motion.h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 80 }}>
            {t.howItWorks.steps.map((step, index) => {
              const isEven = index % 2 === 0;
              return (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, x: isEven ? -60 : 60 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7 }}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 48,
                    alignItems: "center",
                  }}
                >
                  {/* Mockup */}
                  {isEven && (
                    <div className="step-mockup-card">
                      {index === 0 && (
                        /* ARIA Chat Interface */
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                            <div
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: "50%",
                                backgroundColor: "#14B8A6",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 14,
                              }}
                            >
                              🤖
                            </div>
                            <span style={{ color: "#14B8A6", fontWeight: 600, fontSize: 14 }}>ARIA</span>
                          </div>
                          <div
                            style={{
                              background: "rgba(20,184,166,0.15)",
                              border: "1px solid rgba(20,184,166,0.3)",
                              borderRadius: "0 12px 12px 12px",
                              padding: "10px 14px",
                              color: "#E2E8F0",
                              fontSize: 13,
                              maxWidth: "80%",
                            }}
                          >
                            Hi! I'm analyzing your website now... 🔍
                          </div>
                          <div
                            style={{
                              alignSelf: "flex-end",
                              background: "rgba(255,255,255,0.08)",
                              borderRadius: "12px 0 12px 12px",
                              padding: "10px 14px",
                              color: "#CBD5E1",
                              fontSize: 13,
                              maxWidth: "80%",
                            }}
                          >
                            Great, we sell B2B SaaS to SMEs
                          </div>
                          <div
                            style={{
                              background: "rgba(20,184,166,0.15)",
                              border: "1px solid rgba(20,184,166,0.3)",
                              borderRadius: "0 12px 12px 12px",
                              padding: "10px 14px",
                              color: "#E2E8F0",
                              fontSize: 13,
                              maxWidth: "85%",
                            }}
                          >
                            Got it! I've identified your ICP — ready to find your first leads ✅
                          </div>
                        </div>
                      )}
                      {index === 2 && (
                        /* Strategy Report */
                        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                          <div style={{ color: "#94A3B8", fontSize: 12, marginBottom: 4 }}>GTM Strategy Report</div>
                          {["ICP Definition", "ABM Campaign Plan", "Outreach Playbook"].map((sec) => (
                            <div key={sec}>
                              <div style={{ color: "#14B8A6", fontWeight: 600, fontSize: 13, marginBottom: 6 }}>{sec}</div>
                              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                <div style={{ height: 8, background: "rgba(255,255,255,0.12)", borderRadius: 4, width: "90%" }} />
                                <div style={{ height: 8, background: "rgba(255,255,255,0.08)", borderRadius: 4, width: "70%" }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Text */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #F97316, #EA580C)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#FFFFFF",
                        fontWeight: 800,
                        fontSize: 20,
                      }}
                    >
                      {step.num}
                    </div>
                    <h3 style={{ fontSize: 28, fontWeight: 700, color: "#0F172A" }}>{step.title}</h3>
                    <p style={{ fontSize: 16, color: "#64748B", lineHeight: 1.6 }}>{step.desc}</p>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                      {step.bullets.map((bullet) => (
                        <li key={bullet} style={{ display: "flex", alignItems: "center", gap: 8, color: "#0F172A", fontSize: 15 }}>
                          <span style={{ color: "#14B8A6", fontWeight: 700 }}>✓</span> {bullet}
                        </li>
                      ))}
                    </ul>
                    {"cta" in step && step.cta && (
                      <motion.a
                        href="/auth/register"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          background: "linear-gradient(135deg, #F97316, #EA580C)",
                          color: "#FFFFFF",
                          fontWeight: 700,
                          fontSize: 15,
                          padding: "14px 28px",
                          borderRadius: 10,
                          textDecoration: "none",
                          width: "fit-content",
                          marginTop: 8,
                        }}
                      >
                        {step.cta}
                      </motion.a>
                    )}
                  </div>

                  {/* Mockup on right side for odd steps */}
                  {!isEven && (
                    <div className="step-mockup-card">
                      {index === 1 && (
                        /* Lead cards */
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                          {[
                            { name: "Mohammed Al-Rashid", company: "Gulf Tech LLC", score: 94 },
                            { name: "Fatima Hassan", company: "Dubai SaaS Co", score: 88 },
                            { name: "Khalid Al-Mansouri", company: "Riyadh Ventures", score: 81 },
                          ].map((lead) => (
                            <div
                              key={lead.name}
                              style={{
                                background: "rgba(255,255,255,0.06)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                borderRadius: 10,
                                padding: 12,
                              }}
                            >
                              <div style={{ color: "#FFFFFF", fontWeight: 600, fontSize: 13 }}>{lead.name}</div>
                              <div style={{ color: "#94A3B8", fontSize: 12, marginBottom: 8 }}>{lead.company}</div>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <div
                                  style={{
                                    flex: 1,
                                    height: 4,
                                    background: "rgba(255,255,255,0.1)",
                                    borderRadius: 2,
                                    overflow: "hidden",
                                  }}
                                >
                                  <div
                                    style={{
                                      width: `${lead.score}%`,
                                      height: "100%",
                                      background: "#14B8A6",
                                      borderRadius: 2,
                                    }}
                                  />
                                </div>
                                <span
                                  style={{
                                    background: "rgba(20,184,166,0.2)",
                                    color: "#14B8A6",
                                    borderRadius: 9999,
                                    padding: "2px 8px",
                                    fontSize: 11,
                                    fontWeight: 600,
                                  }}
                                >
                                  Decision Maker
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {index === 3 && (
                        /* CRM Pipeline */
                        <div>
                          <div style={{ color: "#94A3B8", fontSize: 12, marginBottom: 12 }}>Pipeline Overview</div>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                            {[
                              { stage: "Prospecting", deals: ["#14B8A6", "#F97316", "#14B8A6"] },
                              { stage: "Qualified", deals: ["#F97316", "#14B8A6"] },
                              { stage: "Closed", deals: ["#22C55E", "#22C55E", "#22C55E"] },
                            ].map((col) => (
                              <div key={col.stage}>
                                <div style={{ color: "#94A3B8", fontSize: 11, marginBottom: 8 }}>{col.stage}</div>
                                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                  {col.deals.map((color, j) => (
                                    <div
                                      key={j}
                                      style={{
                                        height: 28,
                                        background: `${color}20`,
                                        border: `1px solid ${color}40`,
                                        borderRadius: 6,
                                        display: "flex",
                                        alignItems: "center",
                                        padding: "0 8px",
                                        gap: 6,
                                      }}
                                    >
                                      <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: color }} />
                                      <div style={{ height: 6, flex: 1, background: `${color}30`, borderRadius: 3 }} />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Section 6: Lead Tiers ─────────────────────────────────── */}
      <section
        id="pricing"
        style={{
          backgroundColor: "#0A1628",
          padding: "100px 0",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              style={{
                fontSize: "clamp(28px, 3.5vw, 44px)",
                fontWeight: 800,
                color: "#FFFFFF",
                marginBottom: 16,
              }}
            >
              {t.leads.header}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              style={{ fontSize: 18, color: "#94A3B8" }}
            >
              {t.leads.sub}
            </motion.p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 24,
              alignItems: "center",
            }}
          >
            {t.leads.cards.map((card, i) => {
              const isMiddle = i === 1;
              const borderColor = card.ctaStyle === "filled-coral" ? "#F97316" : "#14B8A6";
              const bgColor =
                card.ctaStyle === "filled-coral"
                  ? "rgba(249,115,22,0.05)"
                  : isMiddle
                  ? "rgba(20,184,166,0.08)"
                  : "rgba(20,184,166,0.05)";

              return (
                <motion.div
                  key={card.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.15 }}
                  whileHover={{ y: -4 }}
                  style={{
                    background: bgColor,
                    border: `${isMiddle ? "2px" : "1px"} solid ${borderColor}`,
                    borderRadius: 20,
                    padding: 32,
                    position: "relative",
                    transform: isMiddle ? "scale(1.05)" : "scale(1)",
                  }}
                >
                  {card.badge && (
                    <div
                      style={{
                        position: "absolute",
                        top: -14,
                        right: 24,
                        background: "#F97316",
                        color: "#FFFFFF",
                        fontSize: 12,
                        fontWeight: 700,
                        padding: "4px 16px",
                        borderRadius: 9999,
                      }}
                    >
                      {card.badge}
                    </div>
                  )}

                  <div style={{ fontSize: 36, marginBottom: 12 }}>{card.icon}</div>
                  <h3 style={{ fontSize: 24, fontWeight: 700, color: "#FFFFFF", marginBottom: 8 }}>{card.name}</h3>
                  <div style={{ marginBottom: 24 }}>
                    <span style={{ fontSize: 40, fontWeight: 800, color: "#FFFFFF" }}>{card.price}</span>
                    <span style={{ fontSize: 16, color: "#94A3B8" }}>{card.unit}</span>
                  </div>

                  <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px", display: "flex", flexDirection: "column", gap: 12 }}>
                    {card.features.map((feature) => (
                      <li key={feature} style={{ display: "flex", alignItems: "flex-start", gap: 10, color: "#CBD5E1", fontSize: 15 }}>
                        <span style={{ color: "#14B8A6", fontWeight: 700, flexShrink: 0, marginTop: 1 }}>✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <motion.a
                    href="/auth/register"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      display: "block",
                      textAlign: "center",
                      padding: "14px 24px",
                      borderRadius: 10,
                      fontWeight: 700,
                      fontSize: 15,
                      textDecoration: "none",
                      cursor: "pointer",
                      ...(card.ctaStyle === "outline-teal"
                        ? {
                            border: "1px solid #14B8A6",
                            color: "#14B8A6",
                            backgroundColor: "transparent",
                          }
                        : card.ctaStyle === "filled-teal"
                        ? {
                            background: "#14B8A6",
                            color: "#FFFFFF",
                            border: "none",
                          }
                        : {
                            background: "linear-gradient(135deg, #F97316, #EA580C)",
                            color: "#FFFFFF",
                            border: "none",
                          }),
                    }}
                  >
                    {card.cta}
                  </motion.a>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Section 7: Testimonials ──────────────────────────────── */}
      <section
        style={{
          backgroundColor: "#FFFFFF",
          padding: "100px 0",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              style={{
                fontSize: "clamp(28px, 3.5vw, 44px)",
                fontWeight: 800,
                color: "#0F172A",
              }}
            >
              {t.testimonials.header}
            </motion.h2>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.15 } },
            }}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 24,
            }}
          >
            {t.testimonials.items.map((item) => (
              <motion.div
                key={item.name}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
                }}
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  borderRadius: 20,
                  padding: 32,
                  boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                }}
              >
                <div style={{ fontSize: 18, color: "#F59E0B" }}>⭐⭐⭐⭐⭐</div>
                <p
                  style={{
                    fontStyle: "italic",
                    color: "#0F172A",
                    fontSize: 16,
                    lineHeight: 1.6,
                    flex: 1,
                  }}
                >
                  &ldquo;{item.quote}&rdquo;
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #14B8A6, #0D9488)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#FFFFFF",
                      fontWeight: 700,
                      fontSize: 16,
                      flexShrink: 0,
                    }}
                  >
                    {item.initials}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: "#0F172A", fontSize: 15 }}>{item.name}</div>
                    <div style={{ color: "#64748B", fontSize: 13 }}>
                      {item.title} · {item.company}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Section 8: Final CTA ─────────────────────────────────── */}
      <section
        className="cta-section"
        style={{ padding: "100px 0" }}
      >
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{
              fontSize: "clamp(28px, 3.5vw, 44px)",
              fontWeight: 800,
              color: "#FFFFFF",
              marginBottom: 20,
              lineHeight: 1.2,
            }}
          >
            {t.cta.h2}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{ fontSize: 18, color: "rgba(255,255,255,0.85)", marginBottom: 40 }}
          >
            {t.cta.sub}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}
          >
            <motion.a
              href="/auth/register"
              whileHover={{ scale: 1.02, boxShadow: "0 8px 30px rgba(0,0,0,0.2)" }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#FFFFFF",
                color: "#0D9488",
                fontWeight: 700,
                fontSize: 16,
                padding: "16px 28px",
                borderRadius: 12,
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
            >
              {t.cta.btn1}
            </motion.a>
            <motion.a
              href="/contact"
              whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.15)" }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid rgba(255,255,255,0.6)",
                color: "#FFFFFF",
                fontWeight: 600,
                fontSize: 16,
                padding: "16px 28px",
                borderRadius: 12,
                textDecoration: "none",
                backgroundColor: "transparent",
                whiteSpace: "nowrap",
              }}
            >
              {t.cta.btn2}
            </motion.a>
          </motion.div>
        </div>
      </section>

      {/* ── Section 9: Footer ───────────────────────────────────── */}
      <footer
        style={{
          backgroundColor: "#0A1628",
          padding: "80px 0 0",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr 1fr",
              gap: 48,
              marginBottom: 64,
            }}
          >
            {/* Column 1: Brand */}
            <div>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  color: "#FFFFFF",
                  marginBottom: 12,
                  letterSpacing: -0.5,
                }}
              >
                <span style={{ color: "#14B8A6" }}>AVO</span>RA
              </div>
              <p style={{ color: "#94A3B8", fontSize: 14, lineHeight: 1.6, marginBottom: 24, maxWidth: 260 }}>
                {t.footer.tagline}
              </p>
              {/* Social Icons */}
              <div style={{ display: "flex", gap: 16 }}>
                {/* LinkedIn */}
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#64748B", transition: "color 0.2s" }}
                  aria-label="LinkedIn"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
                {/* X / Twitter */}
                <a
                  href="https://x.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#64748B" }}
                  aria-label="X / Twitter"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                {/* YouTube */}
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#64748B" }}
                  aria-label="YouTube"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Column 2: Product */}
            <div>
              <h4 style={{ color: "#FFFFFF", fontWeight: 600, fontSize: 14, marginBottom: 20, textTransform: "uppercase", letterSpacing: 1 }}>
                {t.footer.product.header}
              </h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                {t.footer.product.links.map((link) => (
                  <li key={link}>
                    <Link href="/dashboard" style={{ color: "#94A3B8", textDecoration: "none", fontSize: 14, transition: "color 0.2s" }}>
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Company */}
            <div>
              <h4 style={{ color: "#FFFFFF", fontWeight: 600, fontSize: 14, marginBottom: 20, textTransform: "uppercase", letterSpacing: 1 }}>
                {t.footer.company.header}
              </h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                {t.footer.company.links.map((link) => (
                  <li key={link}>
                    <Link href="/contact" style={{ color: "#94A3B8", textDecoration: "none", fontSize: 14 }}>
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: Legal */}
            <div>
              <h4 style={{ color: "#FFFFFF", fontWeight: 600, fontSize: 14, marginBottom: 20, textTransform: "uppercase", letterSpacing: 1 }}>
                {t.footer.legal.header}
              </h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                {t.footer.legal.links.map((link) => (
                  <li key={link}>
                    <a href="#" style={{ color: "#94A3B8", textDecoration: "none", fontSize: 14 }}>
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom strip */}
          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.1)",
              padding: "24px 0",
              textAlign: "center",
            }}
          >
            <p style={{ color: "#64748B", fontSize: 13 }}>{t.footer.copy}</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
