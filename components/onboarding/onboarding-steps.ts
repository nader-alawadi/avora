// ── Onboarding Steps — One question per slide ────────────────────────────────

export type QuestionType = "welcome_form" | "single_choice" | "multi_choice" | "true_false" | "range_slider" | "team_invite" | "review";

export interface ChoiceOption {
  value: string;
  label: string;
  labelAr: string;
}

export interface Question {
  id: number;
  key: string;
  title: string;
  titleAr: string;
  subtitle?: string;
  subtitleAr?: string;
  type: QuestionType;
  options?: ChoiceOption[];
  sliderMax?: number;
  sliderStep?: number;
  sliderUnit?: string;
  apiStep: number;
}

// Motivational overlays after these question IDs
export const OVERLAY_AFTER = new Set([5, 10, 15, 20]);
export const OVERLAY_MESSAGES = [
  { text: "You're doing great! Almost there", emoji: "🎯" },
  { text: "2 more minutes and your GTM strategy is ready", emoji: "⚡" },
  { text: "Excellent! Your AI is learning your business", emoji: "🚀" },
  { text: "Final stretch! This will be worth it", emoji: "💎" },
];

const o = (v: string, en: string, ar: string): ChoiceOption => ({ value: v, label: en, labelAr: ar });

export const QUESTIONS: Question[] = [
  // ── 0: Welcome Form ────────────────────────────────────────────────────────
  { id: 0, key: "_welcome", type: "welcome_form", apiStep: 0,
    title: "Welcome to AVORA", titleAr: "مرحبًا بك في AVORA",
    subtitle: "Let's set up your account in under 5 minutes", subtitleAr: "لنقم بإعداد حسابك في أقل من 5 دقائق" },

  // ── 1-3: Company Basics (apiStep 1) ────────────────────────────────────────
  { id: 1, key: "industry", type: "single_choice", apiStep: 1,
    title: "What industry are you in?", titleAr: "في أي قطاع تعمل شركتك؟",
    options: [
      o("saas", "SaaS / Software", "البرمجيات / SaaS"),
      o("consulting", "Consulting", "الاستشارات"),
      o("marketing_agency", "Marketing Agency", "وكالة تسويق"),
      o("financial_services", "Financial Services", "الخدمات المالية"),
      o("healthcare", "Healthcare", "الرعاية الصحية"),
      o("real_estate", "Real Estate", "العقارات"),
      o("ecommerce", "E-commerce", "التجارة الإلكترونية"),
      o("manufacturing", "Manufacturing", "التصنيع"),
      o("education", "Education / Training", "التعليم / التدريب"),
      o("telecom", "Telecom / IT", "الاتصالات / تكنولوجيا المعلومات"),
      o("energy", "Energy / Oil & Gas", "الطاقة / النفط والغاز"),
      o("logistics", "Logistics / Supply Chain", "اللوجستيات"),
    ] },

  { id: 2, key: "company_stage", type: "single_choice", apiStep: 1,
    title: "What stage is your company at?", titleAr: "ما مرحلة شركتك الحالية؟",
    options: [
      o("idea", "Idea Stage", "مرحلة الفكرة"),
      o("mvp", "MVP", "MVP"),
      o("early_traction", "Early Traction", "جذب أولي"),
      o("growth", "Growth", "نمو"),
      o("expansion", "Expansion", "توسع"),
      o("mature", "Mature", "ناضجة"),
    ] },

  { id: 3, key: "employee_count", type: "single_choice", apiStep: 1,
    title: "How many employees?", titleAr: "كم عدد الموظفين؟",
    options: [
      o("1", "Just me", "أنا فقط"),
      o("2-5", "2–5", "2–5"),
      o("6-10", "6–10", "6–10"),
      o("11-25", "11–25", "11–25"),
      o("26-50", "26–50", "26–50"),
      o("51-100", "51–100", "51–100"),
      o("101-250", "101–250", "101–250"),
      o("250+", "250+", "250+"),
    ] },

  // ── 4-5: Business Model (apiStep 2) ────────────────────────────────────────
  { id: 4, key: "problems_solved", type: "multi_choice", apiStep: 2,
    title: "What problems do you solve for customers?", titleAr: "ما المشاكل التي تحلها لعملائك؟",
    subtitle: "Select all that apply", subtitleAr: "اختر كل ما ينطبق",
    options: [
      o("lead_gen", "Lead Generation", "توليد العملاء المحتملين"),
      o("sales_inefficiency", "Sales Inefficiency", "عدم كفاءة المبيعات"),
      o("low_conversion", "Low Conversion Rates", "معدلات تحويل منخفضة"),
      o("poor_ops", "Poor Operations", "عمليات ضعيفة"),
      o("lack_automation", "Lack of Automation", "نقص الأتمتة"),
      o("high_costs", "High Costs", "تكاليف عالية"),
      o("slow_execution", "Slow Execution", "تنفيذ بطيء"),
      o("weak_reporting", "Weak Reporting", "ضعف التقارير"),
      o("customer_acquisition", "Customer Acquisition", "اكتساب العملاء"),
      o("retention", "Retention Issues", "مشاكل الاحتفاظ"),
    ] },

  { id: 5, key: "revenue_model", type: "single_choice", apiStep: 2,
    title: "How do you generate revenue?", titleAr: "كيف تحقق الإيرادات؟",
    options: [
      o("subscription", "Subscription", "اشتراك"),
      o("project", "Project-based", "مشاريع"),
      o("retainer", "Retainer", "عقد شهري"),
      o("commission", "Commission", "عمولة"),
      o("one_time", "One-time Payment", "دفعة واحدة"),
      o("usage", "Usage-based", "حسب الاستخدام"),
      o("hybrid", "Hybrid", "مختلط"),
    ] },

  // ── 6-7: Offer & Economics (apiStep 3) ─────────────────────────────────────
  { id: 6, key: "deal_size", type: "single_choice", apiStep: 3,
    title: "What's your average deal size?", titleAr: "ما متوسط حجم الصفقة؟",
    options: [
      o("under_1k", "< $1,000", "أقل من $1,000"),
      o("1k_5k", "$1,000 – $5,000", "$1,000 – $5,000"),
      o("5k_15k", "$5,000 – $15,000", "$5,000 – $15,000"),
      o("15k_50k", "$15,000 – $50,000", "$15,000 – $50,000"),
      o("50k_100k", "$50,000 – $100,000", "$50,000 – $100,000"),
      o("over_100k", "$100,000+", "$100,000+"),
    ] },

  { id: 7, key: "sales_cycle", type: "single_choice", apiStep: 3,
    title: "How long is your typical sales cycle?", titleAr: "كم مدة دورة المبيعات؟",
    options: [
      o("under_1w", "< 1 week", "أقل من أسبوع"),
      o("1_2w", "1–2 weeks", "1-2 أسبوع"),
      o("2_4w", "2–4 weeks", "2-4 أسابيع"),
      o("1_3m", "1–3 months", "1-3 أشهر"),
      o("3_6m", "3–6 months", "3-6 أشهر"),
      o("over_6m", "6+ months", "أكثر من 6 أشهر"),
    ] },

  // ── 8-10: Target Market (apiStep 4) ────────────────────────────────────────
  { id: 8, key: "target_geography", type: "multi_choice", apiStep: 4,
    title: "Where are your target customers?", titleAr: "أين يتواجد عملاؤك المستهدفون؟",
    subtitle: "Select all regions", subtitleAr: "اختر جميع المناطق",
    options: [
      o("gcc", "GCC", "دول الخليج"),
      o("mena", "MENA", "الشرق الأوسط وشمال أفريقيا"),
      o("europe", "Europe", "أوروبا"),
      o("north_america", "North America", "أمريكا الشمالية"),
      o("asia_pacific", "Asia Pacific", "آسيا والمحيط الهادئ"),
      o("africa", "Africa", "أفريقيا"),
      o("latin_america", "Latin America", "أمريكا اللاتينية"),
      o("global", "Global", "عالمي"),
    ] },

  { id: 9, key: "target_company_size", type: "multi_choice", apiStep: 4,
    title: "What size companies do you target?", titleAr: "ما حجم الشركات المستهدفة؟",
    options: [
      o("startup", "Startups (1–10)", "شركات ناشئة (1-10)"),
      o("smb", "SMBs (11–50)", "صغيرة ومتوسطة (11-50)"),
      o("midmarket", "Mid-market (51–200)", "السوق المتوسط (51-200)"),
      o("enterprise", "Enterprise (200+)", "مؤسسات كبيرة (200+)"),
    ] },

  { id: 10, key: "business_focus", type: "single_choice", apiStep: 4,
    title: "What's your business model focus?", titleAr: "ما نموذج العمل المستهدف؟",
    options: [
      o("b2b", "B2B Only", "B2B فقط"),
      o("b2c", "B2C Only", "B2C فقط"),
      o("both", "Both B2B & B2C", "كلاهما"),
    ] },

  // ── 11-13: ICP (apiStep 5) ─────────────────────────────────────────────────
  { id: 11, key: "ideal_traits", type: "multi_choice", apiStep: 5,
    title: "What makes a company a great fit for you?", titleAr: "ما الصفات التي تجعل الشركة مناسبة لك؟",
    subtitle: "Select your top signals", subtitleAr: "اختر أهم الإشارات",
    options: [
      o("active_sales", "Has active sales team", "لديها فريق مبيعات نشط"),
      o("has_budget", "Has budget", "لديها ميزانية"),
      o("growth_goals", "Has growth goals", "لديها أهداف نمو"),
      o("uses_crm", "Uses CRM", "تستخدم CRM"),
      o("expanding", "Expanding regionally", "تتوسع إقليميًا"),
      o("hiring", "Currently hiring", "توظف حاليًا"),
      o("running_ads", "Running ads", "تشغل إعلانات"),
      o("digital_mature", "Digital maturity", "نضج رقمي"),
      o("buying_similar", "Buying similar service", "تشتري خدمة مشابهة"),
    ] },

  { id: 12, key: "disqualifiers", type: "multi_choice", apiStep: 5,
    title: "What disqualifies a prospect?", titleAr: "ما الذي يستبعد عميلًا محتملًا؟",
    options: [
      o("no_budget", "No budget", "لا ميزانية"),
      o("no_dm_access", "No decision-maker access", "لا وصول لصانع القرار"),
      o("too_small", "Too small", "صغيرة جدًا"),
      o("wrong_industry", "Wrong industry", "قطاع غير مناسب"),
      o("no_growth", "No growth intent", "لا نية للنمو"),
      o("long_procurement", "Long procurement process", "عملية شراء طويلة"),
    ] },

  { id: 13, key: "buying_signals", type: "multi_choice", apiStep: 5,
    title: "What buying signals matter most?", titleAr: "ما أهم إشارات الشراء؟",
    options: [
      o("hiring_sdrs", "Hiring SDRs", "توظيف SDRs"),
      o("recently_funded", "Recently funded", "حصلت على تمويل"),
      o("new_market", "Expanding to new market", "تتوسع لسوق جديد"),
      o("new_product", "Launching product", "إطلاق منتج"),
      o("new_sales_leader", "New sales leader", "قائد مبيعات جديد"),
      o("running_campaigns", "Running campaigns", "تشغيل حملات"),
      o("digital_transform", "Digital transformation", "تحول رقمي"),
    ] },

  // ── 14-15: DMU (apiStep 6) ─────────────────────────────────────────────────
  { id: 14, key: "buyer_roles", type: "multi_choice", apiStep: 6,
    title: "Who typically buys from you?", titleAr: "من يشتري منك عادةً؟",
    options: [
      o("ceo", "Founder / CEO", "المؤسس / CEO"),
      o("coo", "COO", "COO"),
      o("cto", "CTO", "CTO"),
      o("head_sales", "Head of Sales", "رئيس المبيعات"),
      o("head_marketing", "Head of Marketing", "رئيس التسويق"),
      o("procurement", "Procurement", "المشتريات"),
      o("finance", "Finance / CFO", "المالية / CFO"),
      o("operations", "Operations", "العمليات"),
    ] },

  { id: 15, key: "contact_method", type: "multi_choice", apiStep: 6,
    title: "How do you prefer to reach decision-makers?", titleAr: "كيف تفضل الوصول لصناع القرار؟",
    options: [
      o("linkedin", "LinkedIn", "LinkedIn"),
      o("email", "Email", "البريد الإلكتروني"),
      o("whatsapp", "WhatsApp", "WhatsApp"),
      o("phone", "Phone", "هاتف"),
      o("events", "Events", "الفعاليات"),
      o("referrals", "Referrals", "الإحالات"),
    ] },

  // ── 16-18: Sales Team (apiStep 7) ──────────────────────────────────────────
  { id: 16, key: "has_sales_team", type: "true_false", apiStep: 7,
    title: "Do you currently have a sales team?", titleAr: "هل لديك فريق مبيعات حاليًا؟" },

  { id: 17, key: "sales_team_size", type: "range_slider", apiStep: 7,
    title: "How many people in your sales team?", titleAr: "كم شخصًا في فريق المبيعات؟",
    sliderMax: 50, sliderStep: 1, sliderUnit: "people" },

  { id: 18, key: "sales_problems", type: "multi_choice", apiStep: 7,
    title: "Biggest sales team challenges?", titleAr: "ما أكبر تحديات فريق المبيعات؟",
    subtitle: "Select all that apply", subtitleAr: "اختر كل ما ينطبق",
    options: [
      o("weak_targeting", "Weak targeting", "استهداف ضعيف"),
      o("low_response", "Low response rates", "معدلات استجابة منخفضة"),
      o("no_process", "No clear process", "لا عملية واضحة"),
      o("weak_qual", "Weak qualification", "تأهيل ضعيف"),
      o("poor_followup", "Poor follow-up", "متابعة ضعيفة"),
      o("no_crm", "No CRM discipline", "لا انضباط CRM"),
      o("low_close", "Low close rate", "معدل إغلاق منخفض"),
      o("no_personalization", "No personalization", "لا تخصيص"),
    ] },

  // ── 19-20: GTM (apiStep 8) ─────────────────────────────────────────────────
  { id: 19, key: "channels_used", type: "multi_choice", apiStep: 8,
    title: "What channels do you use to reach customers?", titleAr: "ما القنوات التي تستخدمها للوصول للعملاء؟",
    options: [
      o("linkedin", "LinkedIn", "LinkedIn"),
      o("email", "Email", "البريد الإلكتروني"),
      o("cold_calling", "Cold Calling", "الاتصال البارد"),
      o("whatsapp", "WhatsApp", "WhatsApp"),
      o("seo", "SEO", "SEO"),
      o("google_ads", "Google Ads", "إعلانات Google"),
      o("social_media", "Social Media", "وسائل التواصل"),
      o("referrals", "Referrals", "الإحالات"),
      o("content", "Content Marketing", "تسويق المحتوى"),
      o("events", "Events", "الفعاليات"),
      o("partnerships", "Partnerships", "الشراكات"),
    ] },

  { id: 20, key: "best_channel", type: "single_choice", apiStep: 8,
    title: "Which channel performs best?", titleAr: "ما القناة الأفضل أداءً؟",
    options: [
      o("linkedin", "LinkedIn", "LinkedIn"),
      o("email", "Email", "البريد الإلكتروني"),
      o("cold_calling", "Cold Calling", "الاتصال البارد"),
      o("whatsapp", "WhatsApp", "WhatsApp"),
      o("referrals", "Referrals", "الإحالات"),
      o("google_ads", "Google Ads", "إعلانات Google"),
      o("social_media", "Social Media", "وسائل التواصل"),
    ] },

  // ── 21-22: Metrics (apiStep 9) ─────────────────────────────────────────────
  { id: 21, key: "monthly_leads", type: "range_slider", apiStep: 9,
    title: "Average monthly leads?", titleAr: "متوسط العملاء المحتملين شهريًا؟",
    sliderMax: 500, sliderStep: 5, sliderUnit: "leads" },

  { id: 22, key: "lead_to_meeting", type: "range_slider", apiStep: 9,
    title: "Lead-to-meeting conversion rate?", titleAr: "معدل التحويل من عميل محتمل إلى اجتماع؟",
    sliderMax: 100, sliderStep: 1, sliderUnit: "%" },

  // ── 23-24: Goals (apiStep 10) ──────────────────────────────────────────────
  { id: 23, key: "avora_goals", type: "multi_choice", apiStep: 10,
    title: "What do you want to achieve with AVORA?", titleAr: "ماذا تريد تحقيقه مع AVORA؟",
    subtitle: "Pick your top priorities", subtitleAr: "اختر أولوياتك",
    options: [
      o("better_icp", "Better ICP", "تحسين ICP"),
      o("more_leads", "Better lead quality", "جودة عملاء أفضل"),
      o("more_meetings", "More meetings", "اجتماعات أكثر"),
      o("better_targeting", "Better targeting", "استهداف أفضل"),
      o("dm_access", "Decision-maker access", "وصول لصناع القرار"),
      o("better_outreach", "Better outreach", "تواصل أفضل"),
      o("revenue_growth", "Revenue growth", "نمو الإيرادات"),
      o("team_accountability", "Team accountability", "مساءلة الفريق"),
    ] },

  { id: 24, key: "ai_outputs", type: "multi_choice", apiStep: 10,
    title: "What should AI generate for you?", titleAr: "ما الذي يجب أن يولده الذكاء الاصطناعي لك؟",
    options: [
      o("icp", "ICP Analysis", "تحليل ICP"),
      o("dmu", "DMU Mapping", "خريطة DMU"),
      o("abm", "ABM Strategy", "استراتيجية ABM"),
      o("playbook", "Outreach Playbook", "كتيب التواصل"),
      o("lookalike", "Lookalike Criteria", "معايير المشابهة"),
      o("gtm", "GTM Strategy", "استراتيجية GTM"),
      o("scripts", "Sales Scripts", "سكريبتات مبيعات"),
      o("leads", "Lead Lists", "قوائم عملاء"),
    ] },

  // ── 25-27: Preferences (apiStep 11) ────────────────────────────────────────
  { id: 25, key: "speed_accuracy", type: "single_choice", apiStep: 11,
    title: "Speed or accuracy?", titleAr: "السرعة أم الدقة؟",
    subtitle: "How should AI prioritize your outputs?", subtitleAr: "كيف يجب أن يرتب الذكاء الاصطناعي مخرجاتك؟",
    options: [
      o("speed", "Speed first", "السرعة أولاً"),
      o("accuracy", "Accuracy first", "الدقة أولاً"),
      o("balanced", "Balanced", "متوازن"),
    ] },

  { id: 26, key: "outreach_languages", type: "multi_choice", apiStep: 11,
    title: "What languages for outreach?", titleAr: "ما لغات التواصل المطلوبة؟",
    options: [
      o("english", "English", "الإنجليزية"),
      o("arabic", "Arabic", "العربية"),
      o("french", "French", "الفرنسية"),
      o("spanish", "Spanish", "الإسبانية"),
    ] },

  { id: 27, key: "timeline", type: "single_choice", apiStep: 11,
    title: "When do you expect to see results?", titleAr: "متى تتوقع رؤية النتائج؟",
    options: [
      o("this_month", "This month", "هذا الشهر"),
      o("3_months", "Within 3 months", "خلال 3 أشهر"),
      o("6_months", "Within 6 months", "خلال 6 أشهر"),
      o("1_year", "Within a year", "خلال سنة"),
    ] },

  // ── 28: Team Invitations (special) ─────────────────────────────────────────
  { id: 28, key: "_team_invite", type: "team_invite", apiStep: 12,
    title: "Invite your team", titleAr: "ادعُ فريقك",
    subtitle: "Add up to 2 team members to your workspace", subtitleAr: "أضف حتى 2 أعضاء لمساحة العمل" },

  // ── 29: Review & Confirm (special) ─────────────────────────────────────────
  { id: 29, key: "_review", type: "review", apiStep: 13,
    title: "Review & Launch", titleAr: "مراجعة وإطلاق",
    subtitle: "Confirm your answers and generate your GTM strategy", subtitleAr: "أكد إجاباتك وابدأ بإنشاء استراتيجية GTM" },
];
