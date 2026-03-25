// ── Onboarding Step & Question Configuration ─────────────────────────────────
// Data-driven definitions for 14-step onboarding (Steps 0-13)

export type Lang = "en" | "ar";
export type Bi = { en: string; ar: string };

export type FieldType =
  | "short-text" | "long-text" | "email" | "url" | "numeric" | "year"
  | "single-select" | "multi-select" | "multi-select-detail"
  | "true-false" | "ranking";

export interface OptionConfig {
  value: string;
  label: Bi;
}

export interface QuestionConfig {
  key: string;
  label: Bi;
  type: FieldType;
  options?: OptionConfig[];
  required?: boolean;
  ai?: string;       // AI field name for /api/onboarding/ai-generate
  voice?: boolean;    // Enable voice input
  showIf?: { key: string; values: string[] }; // Conditional display
  placeholder?: Bi;
}

export interface StepConfig {
  id: number;
  title: Bi;
  subtitle?: Bi;
  questions: QuestionConfig[];
  special?: "welcome" | "team-invite" | "review";
}

// ── Helper to create bilingual option from English-only term ──────────────────
const o = (v: string, ar?: string): OptionConfig => ({
  value: v,
  label: { en: v, ar: ar || v },
});

// ── All Steps ─────────────────────────────────────────────────────────────────

export const STEPS: StepConfig[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 0 — Welcome / Language / Account Setup
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 0,
    title: { en: "Welcome to AVORA Onboarding", ar: "مرحبًا بك في مرحلة إعداد AVORA" },
    subtitle: { en: "Let's set up your account", ar: "لنقم بإعداد حسابك" },
    special: "welcome",
    questions: [
      {
        key: "language",
        label: { en: "Choose platform language", ar: "اختر لغة المنصة" },
        type: "single-select",
        options: [o("English", "English"), o("العربية", "العربية")],
        required: true,
      },
      {
        key: "firstName",
        label: { en: "First name", ar: "الاسم الأول" },
        type: "short-text",
        required: true,
      },
      {
        key: "lastName",
        label: { en: "Last name", ar: "اسم العائلة" },
        type: "short-text",
        required: true,
      },
      {
        key: "businessEmail",
        label: { en: "Business email", ar: "الإيميل البيزنس" },
        type: "email",
        required: true,
      },
      {
        key: "companyName",
        label: { en: "Company name", ar: "اسم الشركة" },
        type: "short-text",
        required: true,
      },
      {
        key: "websiteUrl",
        label: { en: "Website URL", ar: "رابط الموقع" },
        type: "url",
      },
      {
        key: "autoFill",
        label: { en: "Would you like AVO to auto-fill company info from your website?", ar: "هل تريد أن يقوم AVO بتعبئة معلومات الشركة تلقائيًا من موقعك؟" },
        type: "true-false",
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 1 — Company & Industry Profile
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 1,
    title: { en: "Company & Industry Profile", ar: "ملف الشركة والصناعة" },
    questions: [
      {
        key: "industry",
        label: { en: "What industry are you in?", ar: "في أي قطاع تعمل شركتك؟" },
        type: "single-select",
        options: [
          o("SaaS / Software", "البرمجيات / SaaS"),
          o("Consulting", "الاستشارات"),
          o("Marketing Agency", "وكالة تسويق"),
          o("Financial Services", "الخدمات المالية"),
          o("Healthcare", "الرعاية الصحية"),
          o("Real Estate", "العقارات"),
          o("E-commerce", "التجارة الإلكترونية"),
          o("Manufacturing", "التصنيع"),
          o("Education / Training", "التعليم / التدريب"),
          o("Telecom / IT", "الاتصالات / تكنولوجيا المعلومات"),
          o("Energy / Oil & Gas", "الطاقة / النفط والغاز"),
          o("Logistics / Supply Chain", "اللوجستيات / سلاسل الإمداد"),
          o("Other", "أخرى"),
        ],
        required: true,
      },
      {
        key: "subIndustry",
        label: { en: "Sub-industry or niche (if applicable)", ar: "التخصص الفرعي (إن وُجد)" },
        type: "short-text",
      },
      {
        key: "companyDescription",
        label: { en: "Brief description of what your company does", ar: "وصف مختصر لما تقوم به شركتك" },
        type: "long-text",
        ai: "description",
        voice: true,
      },
      {
        key: "linkedinUrl",
        label: { en: "Company LinkedIn URL", ar: "رابط LinkedIn للشركة" },
        type: "url",
      },
      {
        key: "hqLocation",
        label: { en: "Headquarters location", ar: "موقع المقر الرئيسي" },
        type: "short-text",
      },
      {
        key: "operatingCountries",
        label: { en: "Countries you currently operate in", ar: "الدول التي تعمل فيها حاليًا" },
        type: "short-text",
        placeholder: { en: "e.g. UAE, Saudi Arabia, Egypt", ar: "مثال: الإمارات، السعودية، مصر" },
      },
      {
        key: "companyStage",
        label: { en: "Current company stage", ar: "مرحلة الشركة الحالية" },
        type: "single-select",
        options: [
          o("Idea stage", "مرحلة الفكرة"),
          o("MVP", "MVP"),
          o("Early traction", "جذب أولي"),
          o("Growth", "نمو"),
          o("Expansion", "توسع"),
          o("Mature", "ناضجة"),
        ],
        required: true,
      },
      {
        key: "foundingYear",
        label: { en: "Year founded", ar: "سنة التأسيس" },
        type: "year",
      },
      {
        key: "employeeCount",
        label: { en: "Number of employees", ar: "عدد الموظفين" },
        type: "single-select",
        options: [
          o("1"), o("2–5"), o("6–10"), o("11–25"),
          o("26–50"), o("51–100"), o("101–250"), o("250+"),
        ],
        required: true,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 2 — Business Model Canvas Core
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 2,
    title: { en: "Business Model Canvas", ar: "نموذج العمل التجاري" },
    questions: [
      {
        key: "targetCustomers",
        label: { en: "Who are your primary customers?", ar: "من هم العملاء الأساسيون لديك؟" },
        type: "long-text",
        voice: true,
        ai: "description",
      },
      {
        key: "valueProposition",
        label: { en: "What core value do you deliver to them?", ar: "ما القيمة الأساسية التي تقدمها لهم؟" },
        type: "long-text",
        voice: true,
        ai: "valueProposition",
      },
      {
        key: "problemsSolved",
        label: { en: "What are the most important problems you solve for your customers?", ar: "ما أهم المشاكل التي تحلها لعملائك؟" },
        type: "multi-select-detail",
        options: [
          o("Lead generation", "توليد العملاء المحتملين"),
          o("Sales inefficiency", "عدم كفاءة المبيعات"),
          o("Low conversion rates", "معدلات تحويل منخفضة"),
          o("Poor operations", "عمليات ضعيفة"),
          o("Lack of automation", "نقص الأتمتة"),
          o("High costs", "تكاليف عالية"),
          o("Slow execution", "تنفيذ بطيء"),
          o("Weak visibility/reporting", "ضعف الرؤية / التقارير"),
          o("Customer acquisition", "اكتساب العملاء"),
          o("Retention issues", "مشاكل الاحتفاظ"),
          o("Other", "أخرى"),
        ],
      },
      {
        key: "channels",
        label: { en: "What channels do you currently use to reach customers?", ar: "ما القنوات الحالية التي تصل بها للعملاء؟" },
        type: "multi-select",
        options: [
          o("LinkedIn"), o("Email"), o("Cold calling", "الاتصال البارد"),
          o("WhatsApp"), o("SEO"), o("Google Ads"),
          o("Referrals", "الإحالات"), o("Events", "الفعاليات"),
          o("Partnerships", "الشراكات"), o("Content marketing", "تسويق المحتوى"),
          o("Facebook / Instagram"), o("Other", "أخرى"),
        ],
      },
      {
        key: "revenueModel",
        label: { en: "How do you generate revenue?", ar: "كيف تحقق الإيرادات؟" },
        type: "multi-select",
        options: [
          o("Subscription", "اشتراك"), o("Project-based", "مشاريع"),
          o("Retainer", "عقد شهري"), o("Commission", "عمولة"),
          o("One-time payment", "دفعة واحدة"), o("Usage-based", "حسب الاستخدام"),
          o("Hybrid", "مختلط"),
        ],
      },
      {
        key: "keyResources",
        label: { en: "What are your most important resources?", ar: "ما أهم الموارد التي تعتمد عليها الشركة؟" },
        type: "multi-select-detail",
        options: [
          o("Team", "الفريق"), o("Technology", "التكنولوجيا"),
          o("Data", "البيانات"), o("Personal brand", "العلامة الشخصية"),
          o("Partnerships", "الشراكات"), o("Ads budget", "ميزانية إعلانات"),
          o("Sales team", "فريق المبيعات"), o("Operations team", "فريق العمليات"),
          o("Product/IP", "المنتج / الملكية الفكرية"), o("Other", "أخرى"),
        ],
      },
      {
        key: "keyActivities",
        label: { en: "What are the most important operational/sales activities your company does continuously?", ar: "ما أهم الأنشطة التشغيلية/البيعية التي تقوم بها الشركة باستمرار؟" },
        type: "long-text",
        voice: true,
      },
      {
        key: "hasPartners",
        label: { en: "Do you have key partners or partnership channels?", ar: "هل لديك شركاء أو قنوات شراكة أساسية؟" },
        type: "true-false",
      },
      {
        key: "partnerDetails",
        label: { en: "Partner details", ar: "تفاصيل الشركاء" },
        type: "long-text",
        showIf: { key: "hasPartners", values: ["yes", "نعم"] },
      },
      {
        key: "costStructure",
        label: { en: "What are your main cost elements?", ar: "ما أهم عناصر التكلفة لديك؟" },
        type: "multi-select-detail",
        options: [
          o("Salaries", "الرواتب"), o("Ads", "الإعلانات"),
          o("Software tools", "أدوات برمجية"), o("Sales commissions", "عمولات المبيعات"),
          o("Contractors", "المقاولون"), o("Infrastructure", "البنية التحتية"),
          o("Content production", "إنتاج المحتوى"), o("Operations", "العمليات"),
          o("Other", "أخرى"),
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 3 — Offer & Economics
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 3,
    title: { en: "Products / Services & Pricing", ar: "المنتجات / الخدمات والتسعير" },
    questions: [
      {
        key: "mainProducts",
        label: { en: "List your main products or services", ar: "اذكر منتجاتك أو خدماتك الرئيسية" },
        type: "long-text",
        voice: true,
        ai: "description",
      },
      {
        key: "pricingModel",
        label: { en: "Pricing model", ar: "نموذج التسعير" },
        type: "single-select",
        options: [
          o("Fixed price", "سعر ثابت"), o("Tiered pricing", "تسعير متدرج"),
          o("Custom / negotiated", "مخصص / تفاوضي"), o("Freemium", "مجاني جزئيًا"),
          o("Pay-per-use", "الدفع حسب الاستخدام"), o("Other", "أخرى"),
        ],
      },
      {
        key: "avgDealSize",
        label: { en: "Average deal size (USD)", ar: "متوسط حجم الصفقة (دولار)" },
        type: "single-select",
        options: [
          o("< $1,000"), o("$1,000 – $5,000"), o("$5,000 – $15,000"),
          o("$15,000 – $50,000"), o("$50,000 – $100,000"), o("$100,000+"),
        ],
      },
      {
        key: "salesCycle",
        label: { en: "Typical sales cycle length", ar: "مدة دورة المبيعات النموذجية" },
        type: "single-select",
        options: [
          o("< 1 week", "أقل من أسبوع"), o("1–2 weeks", "1-2 أسبوع"),
          o("2–4 weeks", "2-4 أسابيع"), o("1–3 months", "1-3 أشهر"),
          o("3–6 months", "3-6 أشهر"), o("6+ months", "أكثر من 6 أشهر"),
        ],
      },
      {
        key: "hasCaseStudies",
        label: { en: "Do you have case studies or success stories?", ar: "هل لديك دراسات حالة أو قصص نجاح؟" },
        type: "true-false",
      },
      {
        key: "bestResult",
        label: { en: "Describe your best client result", ar: "صف أفضل نتيجة حققتها لعميل" },
        type: "long-text",
        voice: true,
        ai: "bestResult",
        showIf: { key: "hasCaseStudies", values: ["yes", "نعم"] },
      },
      {
        key: "competitors",
        label: { en: "Who are your main competitors?", ar: "من هم منافسوك الرئيسيون؟" },
        type: "long-text",
        ai: "competitors",
      },
      {
        key: "differentiation",
        label: { en: "What makes you different from competitors?", ar: "ما الذي يميزك عن المنافسين؟" },
        type: "long-text",
        voice: true,
        ai: "differentiation",
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 4 — Target Market & Geography
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 4,
    title: { en: "Target Market & Geography", ar: "السوق المستهدف والجغرافيا" },
    questions: [
      {
        key: "targetCountries",
        label: { en: "Target countries or regions", ar: "الدول أو المناطق المستهدفة" },
        type: "short-text",
        placeholder: { en: "e.g. GCC, MENA, North America", ar: "مثال: الخليج، الشرق الأوسط، أمريكا الشمالية" },
        required: true,
      },
      {
        key: "targetIndustries",
        label: { en: "Target industries", ar: "القطاعات المستهدفة" },
        type: "multi-select",
        options: [
          o("SaaS / Tech", "التقنية / SaaS"), o("Finance / Banking", "المالية / البنوك"),
          o("Healthcare", "الرعاية الصحية"), o("Real Estate", "العقارات"),
          o("Retail / E-commerce", "التجزئة / التجارة الإلكترونية"),
          o("Manufacturing", "التصنيع"), o("Education", "التعليم"),
          o("Government", "الحكومة"), o("Consulting", "الاستشارات"),
          o("Telecom", "الاتصالات"), o("Energy", "الطاقة"),
          o("Hospitality", "الضيافة"), o("Other", "أخرى"),
        ],
      },
      {
        key: "targetCompanySize",
        label: { en: "Target company size", ar: "حجم الشركات المستهدفة" },
        type: "multi-select",
        options: [
          o("Startups (1–10)", "شركات ناشئة (1-10)"),
          o("SMBs (11–50)", "شركات صغيرة ومتوسطة (11-50)"),
          o("Mid-market (51–200)", "السوق المتوسط (51-200)"),
          o("Enterprise (200+)", "مؤسسات كبيرة (200+)"),
        ],
      },
      {
        key: "businessModel",
        label: { en: "Business model focus", ar: "نموذج العمل المستهدف" },
        type: "single-select",
        options: [
          o("B2B only", "B2B فقط"), o("B2C only", "B2C فقط"),
          o("Both B2B & B2C", "كلاهما B2B و B2C"),
        ],
      },
      {
        key: "newMarkets",
        label: { en: "New markets you want to enter", ar: "أسواق جديدة تريد الدخول إليها" },
        type: "long-text",
        voice: true,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 5 — ICP & Buyer Fit
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 5,
    title: { en: "Ideal Customer Profile (ICP)", ar: "ملف العميل المثالي (ICP)" },
    questions: [
      {
        key: "idealCustomer",
        label: { en: "Who is your absolute ideal customer?", ar: "من هو العميل المثالي جدًا لك؟" },
        type: "long-text",
        voice: true,
        ai: "description",
      },
      {
        key: "goodFitTraits",
        label: { en: "What traits make a company a great fit for you?", ar: "ما الصفات التي تجعل الشركة مناسبة جدًا لك؟" },
        type: "multi-select",
        options: [
          o("Has active sales team", "لديها فريق مبيعات نشط"),
          o("Has budget", "لديها ميزانية"),
          o("Has growth goals", "لديها أهداف نمو"),
          o("Uses CRM", "تستخدم CRM"),
          o("Expanding regionally", "تتوسع إقليميًا"),
          o("Hiring", "توظف حاليًا"),
          o("Running ads", "تشغل إعلانات"),
          o("Has website", "لديها موقع إلكتروني"),
          o("Has multiple branches", "لديها فروع متعددة"),
          o("Digital maturity", "نضج رقمي"),
          o("Already buying similar service", "تشتري خدمة مشابهة"),
          o("Other", "أخرى"),
        ],
      },
      {
        key: "disqualifiers",
        label: { en: "What traits make a company NOT a good fit?", ar: "ما الصفات التي تجعل الشركة غير مناسبة لك؟" },
        type: "multi-select-detail",
        ai: "disqualifiers",
        options: [
          o("No budget", "لا ميزانية"), o("No decision maker access", "لا وصول لصانع القرار"),
          o("Too small", "صغيرة جدًا"), o("Wrong industry", "قطاع غير مناسب"),
          o("No growth intent", "لا نية للنمو"), o("Other", "أخرى"),
        ],
      },
      {
        key: "hasMinCompanySize",
        label: { en: "Is there a minimum company size?", ar: "هل هناك حد أدنى لحجم الشركة؟" },
        type: "true-false",
      },
      {
        key: "minCompanySizeDetails",
        label: { en: "Minimum size details (revenue, team, market)", ar: "تفاصيل الحد الأدنى (إيرادات، فريق، سوق)" },
        type: "short-text",
        showIf: { key: "hasMinCompanySize", values: ["yes", "نعم"] },
      },
      {
        key: "hasMinBudget",
        label: { en: "Is there a minimum expected budget?", ar: "هل هناك حد أدنى للميزانية المتوقعة؟" },
        type: "true-false",
      },
      {
        key: "minBudgetAmount",
        label: { en: "Minimum budget amount", ar: "مبلغ الحد الأدنى للميزانية" },
        type: "short-text",
        showIf: { key: "hasMinBudget", values: ["yes", "نعم"] },
      },
      {
        key: "buyingSignals",
        label: { en: "What are the most important buying signals?", ar: "ما أهم Buying Signals التي تدل أن الشركة جاهزة؟" },
        type: "multi-select",
        options: [
          o("Hiring SDRs", "توظيف SDRs"), o("Recently funded", "حصلت على تمويل"),
          o("Expanding to new market", "تتوسع لسوق جديد"), o("Launching product", "إطلاق منتج"),
          o("New sales leader hired", "تعيين قائد مبيعات جديد"), o("Website revamp", "تجديد الموقع"),
          o("Running campaigns", "تشغيل حملات"), o("Opening branches", "فتح فروع"),
          o("Digital transformation", "تحول رقمي"), o("Other", "أخرى"),
        ],
      },
      {
        key: "negativeSignals",
        label: { en: "What are the negative signals?", ar: "ما الإشارات السلبية؟" },
        type: "multi-select",
        options: [
          o("Layoffs", "تسريح موظفين"), o("Declining revenue", "إيرادات متراجعة"),
          o("No online presence", "لا وجود رقمي"), o("Frozen budgets", "ميزانيات مجمدة"),
          o("Recent vendor switch", "تغيير مورد مؤخرًا"), o("Other", "أخرى"),
        ],
      },
      {
        key: "qualificationRanking",
        label: { en: "Rank these qualification factors (most to least important)", ar: "رتب عوامل التأهيل هذه من الأهم إلى الأقل أهمية" },
        type: "ranking",
        options: [
          o("Industry fit", "ملاءمة القطاع"), o("Company size", "حجم الشركة"),
          o("Geography", "الجغرافيا"), o("Budget", "الميزانية"),
          o("Use case", "حالة الاستخدام"), o("Buying signal", "إشارة شراء"),
          o("Decision maker seniority", "أقدمية صانع القرار"),
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 6 — DMU / Decision Makers
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 6,
    title: { en: "Decision-Making Unit (DMU)", ar: "وحدة صنع القرار (DMU)" },
    questions: [
      {
        key: "primaryBuyer",
        label: { en: "Who is the primary person that buys from you?", ar: "من هو الشخص الأساسي الذي يشتري منك غالبًا؟" },
        type: "multi-select",
        ai: "jobTitles",
        options: [
          o("Founder / CEO"), o("COO"), o("CTO"), o("CRO"),
          o("Head of Sales"), o("Sales Manager"), o("Head of Marketing"),
          o("Procurement"), o("Finance"), o("Operations"), o("HR"), o("Other", "أخرى"),
        ],
      },
      {
        key: "multipleInfluencers",
        label: { en: "Is there more than one person influencing the buying decision?", ar: "هل يوجد أكثر من شخص مؤثر في قرار الشراء؟" },
        type: "true-false",
      },
      {
        key: "influencers",
        label: { en: "Who are the people influencing the decision?", ar: "من هم الأشخاص المؤثرون على القرار؟" },
        type: "multi-select",
        showIf: { key: "multipleInfluencers", values: ["yes", "نعم"] },
        options: [
          o("Founder / CEO"), o("COO"), o("CTO"), o("CRO"),
          o("Head of Sales"), o("Sales Manager"), o("Head of Marketing"),
          o("Procurement"), o("Finance"), o("Operations"), o("HR"), o("Other", "أخرى"),
        ],
      },
      {
        key: "endUser",
        label: { en: "Who is the end user of your solution?", ar: "من هو المستخدم النهائي لحلك؟" },
        type: "multi-select",
        options: [
          o("Sales reps"), o("Marketing team", "فريق التسويق"),
          o("Operations team", "فريق العمليات"), o("Management", "الإدارة"),
          o("Finance team", "الفريق المالي"), o("IT team", "فريق تكنولوجيا المعلومات"),
          o("End customers", "العملاء النهائيون"), o("Other", "أخرى"),
        ],
      },
      {
        key: "objectors",
        label: { en: "Who might object to the purchase?", ar: "من قد يعترض على الشراء غالبًا؟" },
        type: "multi-select-detail",
        options: [
          o("Finance / CFO"), o("Procurement"), o("IT / Security"),
          o("Legal"), o("Operations"), o("Other", "أخرى"),
        ],
      },
      {
        key: "painPointsByRole",
        label: { en: "What are the main pain points for each decision-maker role?", ar: "ما أهم Pain Points لكل Role؟" },
        type: "long-text",
        voice: true,
        ai: "biggestPain",
        placeholder: { en: "e.g. CEO: lacks pipeline visibility; Sales Manager: low team productivity", ar: "مثال: CEO: يفتقر لرؤية الأنبوب; مدير المبيعات: إنتاجية الفريق منخفضة" },
      },
      {
        key: "autoAnalyzeLinkedIn",
        label: { en: "Would you like AVORA to auto-analyze decision-maker personalities from LinkedIn?", ar: "هل تريد من AVORA تحليل شخصية صناع القرار تلقائيًا من LinkedIn؟" },
        type: "true-false",
      },
      {
        key: "preferredContactMethod",
        label: { en: "Preferred communication style with these people?", ar: "ما أسلوب التواصل المفضل مع هؤلاء الأشخاص؟" },
        type: "multi-select",
        options: [
          o("LinkedIn"), o("Email"), o("WhatsApp"),
          o("Phone", "هاتف"), o("Mixed", "مختلط"),
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 7 — Sales Team & Execution
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 7,
    title: { en: "Sales Team & Sales Process", ar: "فريق المبيعات وعملية البيع" },
    questions: [
      {
        key: "hasSalesTeam",
        label: { en: "Do you currently have a sales team?", ar: "هل لديك فريق مبيعات حاليًا؟" },
        type: "true-false",
      },
      {
        key: "salesTeamSize",
        label: { en: "How many people in the sales team?", ar: "كم عدد الأشخاص في فريق المبيعات؟" },
        type: "numeric",
        showIf: { key: "hasSalesTeam", values: ["yes", "نعم"] },
      },
      {
        key: "salesRoles",
        label: { en: "What roles exist currently?", ar: "ما الأدوار الموجودة حاليًا؟" },
        type: "multi-select",
        showIf: { key: "hasSalesTeam", values: ["yes", "نعم"] },
        options: [
          o("SDR"), o("BDR"), o("Account Executive"),
          o("Sales Manager"), o("Founder-led sales", "مبيعات يقودها المؤسس"),
          o("Closer"), o("Customer Success"),
          o("No structured roles", "لا أدوار منظمة"),
        ],
      },
      {
        key: "salesTeamProblems",
        label: { en: "Biggest sales team problems?", ar: "ما أكبر مشاكل فريق المبيعات الحالي؟" },
        type: "multi-select-detail",
        options: [
          o("Weak targeting", "استهداف ضعيف"),
          o("Low response rates", "معدلات استجابة منخفضة"),
          o("No clear process", "لا عملية واضحة"),
          o("Weak qualification", "تأهيل ضعيف"),
          o("Poor follow-up", "متابعة ضعيفة"),
          o("No CRM discipline", "لا انضباط في CRM"),
          o("Low close rate", "معدل إغلاق منخفض"),
          o("Weak objection handling", "ضعف التعامل مع الاعتراضات"),
          o("No personalization", "لا تخصيص"),
          o("Limited pipeline", "أنبوب محدود"),
          o("Other", "أخرى"),
        ],
      },
      {
        key: "dailyPainPoints",
        label: { en: "Biggest daily pain points for the team?", ar: "ما أكبر Pain Points يوميًا عند الفريق؟" },
        type: "long-text",
        voice: true,
        ai: "biggestPain",
      },
      {
        key: "hasCRM",
        label: { en: "Do you currently use a CRM?", ar: "هل لديكم CRM حاليًا؟" },
        type: "true-false",
      },
      {
        key: "crmDetails",
        label: { en: "Which CRM and how structured is it?", ar: "أي CRM وما مدى تنظيمه؟" },
        type: "short-text",
        showIf: { key: "hasCRM", values: ["yes", "نعم"] },
      },
      {
        key: "hasUnifiedOutreach",
        label: { en: "Do you have a unified outreach process?", ar: "هل لديكم outreach process موحد؟" },
        type: "single-select",
        options: [
          o("Yes", "نعم"), o("No", "لا"), o("Partially", "جزئيًا"),
        ],
      },
      {
        key: "hasPlaybooks",
        label: { en: "Do you have scripts or playbooks?", ar: "هل توجد Scripts / Playbooks حالية؟" },
        type: "true-false",
      },
      {
        key: "inboundOutbound",
        label: { en: "Is the team Inbound, Outbound, or both?", ar: "هل الفريق يشتغل Inbound أم Outbound أم الاثنين؟" },
        type: "single-select",
        options: [o("Inbound"), o("Outbound"), o("Both", "كلاهما")],
      },
      {
        key: "hasKPIs",
        label: { en: "Do you have clear KPIs for the team?", ar: "هل عندكم KPIs واضحة للفريق؟" },
        type: "true-false",
      },
      {
        key: "kpiTypes",
        label: { en: "Which KPIs?", ar: "أي KPIs؟" },
        type: "multi-select",
        showIf: { key: "hasKPIs", values: ["yes", "نعم"] },
        options: [
          o("Leads"), o("Meetings", "اجتماعات"), o("Conversion", "تحويل"),
          o("Revenue", "إيرادات"), o("Calls", "مكالمات"), o("Emails"),
          o("Others", "أخرى"),
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 8 — Current GTM & Outreach Reality
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 8,
    title: { en: "Current GTM Reality", ar: "واقع الذهاب للسوق الحالي" },
    questions: [
      {
        key: "currentChannels",
        label: { en: "What channels do you currently use to reach customers?", ar: "ما القنوات التي تستخدمها حاليًا للوصول للعملاء؟" },
        type: "multi-select",
        options: [
          o("LinkedIn"), o("Email"), o("Cold calling", "الاتصال البارد"),
          o("WhatsApp"), o("SEO"), o("Google Ads"), o("Social media", "وسائل التواصل"),
          o("Referrals", "الإحالات"), o("Events", "الفعاليات"),
          o("Partnerships", "الشراكات"), o("Content marketing", "تسويق المحتوى"),
          o("Other", "أخرى"),
        ],
      },
      {
        key: "bestChannel",
        label: { en: "Which channel performs best?", ar: "ما القناة الأفضل أداءً؟" },
        type: "single-select",
        options: [
          o("LinkedIn"), o("Email"), o("Cold calling", "الاتصال البارد"),
          o("WhatsApp"), o("Referrals", "الإحالات"), o("Google Ads"),
          o("Social media", "وسائل التواصل"), o("Other", "أخرى"),
        ],
      },
      {
        key: "monthlyOutreachVolume",
        label: { en: "Monthly outreach volume (messages/calls)", ar: "حجم التواصل الشهري (رسائل/مكالمات)" },
        type: "single-select",
        options: [
          o("< 100"), o("100–500"), o("500–1,000"),
          o("1,000–5,000"), o("5,000+"),
        ],
      },
      {
        key: "avgResponseRate",
        label: { en: "Average response rate", ar: "متوسط معدل الاستجابة" },
        type: "single-select",
        options: [
          o("< 1%"), o("1–3%"), o("3–5%"), o("5–10%"), o("10%+"), o("Don't know", "لا أعرف"),
        ],
      },
      {
        key: "currentTools",
        label: { en: "Tools currently used for outreach/GTM", ar: "الأدوات المستخدمة حاليًا للتواصل" },
        type: "multi-select",
        options: [
          o("HubSpot"), o("Salesforce"), o("Apollo"), o("Lusha"),
          o("LinkedIn Sales Navigator"), o("Outreach.io"),
          o("Mailchimp"), o("ActiveCampaign"), o("None", "لا شيء"), o("Other", "أخرى"),
        ],
      },
      {
        key: "gtmChallenges",
        label: { en: "Biggest GTM challenges right now?", ar: "ما أكبر تحديات الذهاب للسوق حاليًا؟" },
        type: "long-text",
        voice: true,
        ai: "biggestPain",
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 9 — Revenue, Metrics & Performance
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 9,
    title: { en: "Revenue, Metrics & Performance", ar: "الإيرادات والمقاييس والأداء" },
    questions: [
      {
        key: "currentMRR",
        label: { en: "Current MRR or ARR (approximate)", ar: "الإيرادات الشهرية/السنوية الحالية (تقريبًا)" },
        type: "short-text",
        placeholder: { en: "e.g. $10,000/mo or $120,000/yr", ar: "مثال: $10,000/شهر أو $120,000/سنة" },
      },
      {
        key: "revenueGrowthRate",
        label: { en: "Revenue growth rate (YoY)", ar: "معدل نمو الإيرادات (سنويًا)" },
        type: "single-select",
        options: [
          o("Declining", "متراجع"), o("Flat (0%)", "ثابت"),
          o("1–10%"), o("10–25%"), o("25–50%"),
          o("50–100%"), o("100%+"), o("Don't know", "لا أعرف"),
        ],
      },
      {
        key: "cac",
        label: { en: "Customer acquisition cost (CAC)", ar: "تكلفة اكتساب العميل (CAC)" },
        type: "short-text",
        placeholder: { en: "e.g. $500", ar: "مثال: $500" },
      },
      {
        key: "ltv",
        label: { en: "Customer lifetime value (LTV)", ar: "قيمة العميل مدى الحياة (LTV)" },
        type: "short-text",
        placeholder: { en: "e.g. $5,000", ar: "مثال: $5,000" },
      },
      {
        key: "lastQuarterRevenue",
        label: { en: "Total sales/revenue in the last 3 months", ar: "إجمالي المبيعات في آخر 3 أشهر" },
        type: "short-text",
      },
      {
        key: "annualRevenue",
        label: { en: "Current annual revenue", ar: "الإيراد السنوي الحالي" },
        type: "single-select",
        options: [
          o("Less than $50k"), o("$50k–$100k"), o("$100k–$250k"),
          o("$250k–$500k"), o("$500k–$1M"), o("$1M+"),
        ],
      },
      {
        key: "monthlyLeads",
        label: { en: "Average monthly leads", ar: "متوسط عدد الـ Leads الشهري" },
        type: "numeric",
      },
      {
        key: "monthlyMeetings",
        label: { en: "Average monthly meetings", ar: "متوسط عدد الـ Meetings الشهري" },
        type: "numeric",
      },
      {
        key: "monthlyDeals",
        label: { en: "Average monthly deals", ar: "متوسط عدد الـ Deals الشهري" },
        type: "numeric",
      },
      {
        key: "leadToMeetingRate",
        label: { en: "Average lead-to-meeting conversion rate (%)", ar: "متوسط معدل التحويل من Lead إلى Meeting (%)" },
        type: "numeric",
        placeholder: { en: "e.g. 15", ar: "مثال: 15" },
      },
      {
        key: "meetingToDealRate",
        label: { en: "Average meeting-to-deal conversion rate (%)", ar: "متوسط معدل التحويل من Meeting إلى Deal (%)" },
        type: "numeric",
        placeholder: { en: "e.g. 25", ar: "مثال: 25" },
      },
      {
        key: "biggestMetricGap",
        label: { en: "Biggest metric gap you want to fix?", ar: "ما أكبر فجوة رقمية تريد حلها؟" },
        type: "single-select",
        options: [
          o("Not enough leads", "لا يوجد عملاء محتملون كافون"),
          o("Not enough meetings", "لا يوجد اجتماعات كافية"),
          o("Weak qualification", "تأهيل ضعيف"),
          o("Weak close rate", "معدل إغلاق ضعيف"),
          o("Weak revenue predictability", "ضعف التنبؤ بالإيرادات"),
          o("Long sales cycle", "دورة مبيعات طويلة"),
          o("Other", "أخرى"),
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 10 — Challenges, Goals & Platform Expectations
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 10,
    title: { en: "Goals & Challenges", ar: "الأهداف والتحديات" },
    questions: [
      {
        key: "topChallenges",
        label: { en: "What are the top 3 challenges in sales or growth?", ar: "ما أهم 3 تحديات حالية في المبيعات أو النمو؟" },
        type: "long-text",
        voice: true,
        ai: "biggestPain",
      },
      {
        key: "avoraGoals",
        label: { en: "Top 3 goals you want to achieve with AVORA?", ar: "ما أهم 3 أهداف تريد تحقيقها من AVORA؟" },
        type: "multi-select",
        options: [
          o("Better ICP", "تحسين ICP"), o("Better lead quality", "جودة عملاء أفضل"),
          o("More meetings", "اجتماعات أكثر"), o("Better targeting", "استهداف أفضل"),
          o("Better decision-maker access", "وصول أفضل لصناع القرار"),
          o("Better outreach", "تواصل أفضل"), o("Better ABM", "ABM أفضل"),
          o("Better CRM visibility", "رؤية CRM أفضل"),
          o("Team accountability", "مساءلة الفريق"),
          o("Revenue growth", "نمو الإيرادات"),
        ],
      },
      {
        key: "aiOutputs",
        label: { en: "What do you want AI Agent to produce for you?", ar: "ما الذي تريد من AI Agent أن يخرجه لك تحديدًا؟" },
        type: "multi-select",
        options: [
          o("ICP"), o("DMU Mapping"), o("ABM Strategy"),
          o("Outreach Playbook"), o("Lookalike Criteria"),
          o("GTM Strategy"), o("Lead lists", "قوائم عملاء"),
          o("Sales scripts", "سكريبتات مبيعات"), o("CRM workflow"),
          o("All of the above", "كل ما سبق"),
        ],
      },
      {
        key: "outputPriority",
        label: { en: "Rank the priority of these outputs", ar: "ما أولوية هذه المخرجات؟" },
        type: "ranking",
        options: [
          o("ICP"), o("DMU Mapping"), o("ABM Strategy"),
          o("Outreach Playbook"), o("Lookalike Criteria"),
          o("GTM Strategy"), o("Lead lists", "قوائم عملاء"),
        ],
      },
      {
        key: "speedVsAccuracy",
        label: { en: "Do you want fast outputs or highly accurate ones (even if slower)?", ar: "هل تريد مخرجات سريعة أم دقيقة جدًا حتى لو أخذت وقتًا أطول؟" },
        type: "single-select",
        options: [
          o("Speed first", "السرعة أولاً"),
          o("Accuracy first", "الدقة أولاً"),
          o("Balanced", "متوازن"),
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 11 — Strategic Preferences & Constraints
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 11,
    title: { en: "Preferences & Constraints", ar: "التفضيلات والقيود" },
    questions: [
      {
        key: "outreachLanguages",
        label: { en: "What languages are needed for outreach?", ar: "ما اللغات المطلوبة في الـ outreach؟" },
        type: "multi-select",
        options: [
          o("English", "الإنجليزية"), o("Arabic", "العربية"),
          o("Both", "كلاهما"), o("Other", "أخرى"),
        ],
      },
      {
        key: "outreachTone",
        label: { en: "Preferred outreach tone", ar: "نبرة التواصل المفضلة" },
        type: "single-select",
        options: [
          o("Formal / Professional", "رسمي / مهني"),
          o("Casual / Friendly", "ودي / غير رسمي"),
          o("Direct / Assertive", "مباشر / حازم"),
          o("Consultative / Advisory", "استشاري / إرشادي"),
        ],
      },
      {
        key: "budgetConstraints",
        label: { en: "Monthly budget available for sales/GTM tools?", ar: "الميزانية الشهرية المتاحة لأدوات المبيعات؟" },
        type: "single-select",
        options: [
          o("< $500"), o("$500 – $1,000"), o("$1,000 – $3,000"),
          o("$3,000 – $5,000"), o("$5,000+"), o("Flexible", "مرنة"),
        ],
      },
      {
        key: "timelineExpectation",
        label: { en: "When do you expect to see results?", ar: "متى تتوقع رؤية النتائج؟" },
        type: "single-select",
        options: [
          o("This month", "هذا الشهر"), o("Within 3 months", "خلال 3 أشهر"),
          o("Within 6 months", "خلال 6 أشهر"), o("Within a year", "خلال سنة"),
        ],
      },
      {
        key: "regulatoryConstraints",
        label: { en: "Any regulatory or compliance constraints we should know about?", ar: "هل هناك قيود تنظيمية أو قانونية يجب أن نعرفها؟" },
        type: "long-text",
        voice: true,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 12 — Team Invitations
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 12,
    title: { en: "Team Invitations", ar: "دعوات الفريق" },
    subtitle: { en: "Invite up to 2 team members to your workspace", ar: "ادعُ حتى 2 من أعضاء فريقك إلى مساحة العمل" },
    special: "team-invite",
    questions: [], // Handled by special team-invite renderer
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 13 — Review & Confirmation
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 13,
    title: { en: "Review Your Information", ar: "مراجعة معلوماتك" },
    subtitle: { en: "Review all your answers before generating your GTM strategy", ar: "راجع جميع إجاباتك قبل إنشاء استراتيجية الذهاب للسوق" },
    special: "review",
    questions: [], // Handled by special review renderer
  },
];

// ── UI Translations ──────────────────────────────────────────────────────────

export const UI: Record<string, Bi> = {
  next: { en: "Continue", ar: "متابعة" },
  back: { en: "Back", ar: "رجوع" },
  skip: { en: "Skip for now", ar: "تخطي الآن" },
  saving: { en: "Saving...", ar: "جاري الحفظ..." },
  saved: { en: "Saved", ar: "تم الحفظ" },
  aiSuggest: { en: "AI Suggest", ar: "اقتراح AI" },
  aiGenerating: { en: "Generating...", ar: "جاري التوليد..." },
  voiceRecord: { en: "Hold to record", ar: "اضغط للتسجيل" },
  voiceRecording: { en: "Recording...", ar: "جاري التسجيل..." },
  yes: { en: "Yes", ar: "نعم" },
  no: { en: "No", ar: "لا" },
  stepOf: { en: "Step {current} of {total}", ar: "خطوة {current} من {total}" },
  required: { en: "Required", ar: "مطلوب" },
  // Team invite
  inviteTitle: { en: "Team Member {n}", ar: "عضو الفريق {n}" },
  firstName: { en: "First Name", ar: "الاسم الأول" },
  lastName: { en: "Last Name", ar: "اسم العائلة" },
  jobTitle: { en: "Job Title", ar: "المسمى الوظيفي" },
  email: { en: "Business Email", ar: "الإيميل البيزنس" },
  accessLevel: { en: "Access Level", ar: "مستوى الوصول" },
  permissions: { en: "Permissions", ar: "الصلاحيات" },
  sendInvites: { en: "Send Invitations", ar: "إرسال الدعوات" },
  invitesSent: { en: "Invitations sent!", ar: "تم إرسال الدعوات!" },
  inviteFailed: { en: "Some invitations failed", ar: "فشل إرسال بعض الدعوات" },
  domainMismatch: { en: "Must use same company domain", ar: "يجب استخدام نفس نطاق الشركة" },
  // Review
  editSection: { en: "Edit", ar: "تعديل" },
  confirmGenerate: { en: "Confirm & Generate GTM Strategy", ar: "تأكيد وإنشاء استراتيجية GTM" },
  noAnswers: { en: "No answers yet", ar: "لا توجد إجابات بعد" },
  // Details
  addDetails: { en: "Add details...", ar: "أضف تفاصيل..." },
  moveUp: { en: "↑", ar: "↑" },
  moveDown: { en: "↓", ar: "↓" },
};

export const TEAM_ROLES: OptionConfig[] = [
  o("Admin", "مسؤول"),
  o("Manager", "مدير"),
  o("Sales Rep", "مندوب مبيعات"),
  o("Viewer", "مشاهد"),
];

export const TEAM_PERMISSIONS = [
  o("View leads", "عرض العملاء المحتملين"),
  o("Move leads in pipeline", "نقل العملاء في الأنبوب"),
  o("Add tasks", "إضافة مهام"),
  o("Edit tasks", "تعديل مهام"),
  o("View dashboards", "عرض لوحات المعلومات"),
  o("Assign leads", "تعيين العملاء"),
  o("Export data", "تصدير البيانات"),
  o("Manage outreach templates", "إدارة قوالب التواصل"),
];
