import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface OnboardingContext {
  language: string;
  companyName: string;
  offer: string;
  problem: string;
  pricingRange: string;
  salesCycleRange: string;
  geoTargets: string;
  icpHypothesis: string;
  bestCustomer1: string;
  bestCustomer2: string;
  lostDeal: string;
  whyWeWin: string;
  competitors: string;
  differentiation: string;
  disqualifiers: string;
  economicBuyer: string;
  champion: string;
  technicalBuyer: string;
  endUser: string;
  influencer: string;
  objections: string;
  titles: string;
  currentChannels: string;
  teamSize: string;
  tools: string;
  capacity: string;
  industry: string;
  employeeRange: string;
  revenueRange: string;
}

// Approximate Ramadan windows (start month 0-indexed, start day, end month, end day)
const RAMADAN_WINDOWS: Record<number, { startMonth: number; startDay: number; endMonth: number; endDay: number }> = {
  2024: { startMonth: 2, startDay: 11, endMonth: 3, endDay: 9 },
  2025: { startMonth: 2, startDay: 1,  endMonth: 2, endDay: 30 },
  2026: { startMonth: 1, startDay: 18, endMonth: 2, endDay: 19 },
  2027: { startMonth: 1, startDay: 8,  endMonth: 2, endDay: 9 },
  2028: { startMonth: 0, startDay: 28, endMonth: 1, endDay: 26 },
};

function isRamadan(date: Date): boolean {
  const year = date.getFullYear();
  const window = RAMADAN_WINDOWS[year];
  if (!window) return false;
  const month = date.getMonth();
  const day = date.getDate();
  const startTotal = window.startMonth * 100 + window.startDay;
  const endTotal = window.endMonth * 100 + window.endDay;
  const currentTotal = month * 100 + day;
  return currentTotal >= startTotal && currentTotal <= endTotal;
}

function getSeason(month: number, geo: string): string {
  const isGulf = /saudi|uae|qatar|kuwait|bahrain|oman|gulf/i.test(geo);
  const isNorthAfrica = /egypt|morocco|tunisia|algeria|libya/i.test(geo);
  const isEurope = /europe|uk|france|germany|spain|italy|netherlands/i.test(geo);

  if (isGulf || isNorthAfrica) {
    // MENA seasons
    if (month >= 2 && month <= 4) return "Spring";
    if (month >= 5 && month <= 8) return "Summer (hot season — slower enterprise sales)";
    if (month >= 9 && month <= 10) return "Autumn";
    return "Winter";
  }
  if (isEurope) {
    if (month >= 2 && month <= 4) return "Spring";
    if (month >= 5 && month <= 7) return "Summer";
    if (month >= 8 && month <= 10) return "Autumn";
    return "Winter";
  }
  // Default northern hemisphere
  if (month >= 2 && month <= 4) return "Spring";
  if (month >= 5 && month <= 7) return "Summer";
  if (month >= 8 && month <= 10) return "Autumn";
  return "Winter";
}

function buildSeasonalContext(now: Date, geoTargets: string, industry: string): string {
  const month = now.getMonth(); // 0-indexed
  const monthName = now.toLocaleString("en-US", { month: "long" });
  const year = now.getFullYear();
  const season = getSeason(month, geoTargets);
  const ramadan = isRamadan(now);

  const insights: string[] = [];

  // Ramadan context
  if (ramadan) {
    insights.push(
      "It is currently Ramadan — decision-making slows significantly in MENA markets. " +
      "Focus outreach on pre-Ramadan pipeline follow-ups and post-Ramadan (Eid) timing for closings. " +
      "Avoid heavy prospecting campaigns during fasting hours; shift to evening or async outreach. " +
      "Emphasize relationship-building messages over hard sales pitches."
    );
  }

  // Month-specific opportunities
  const monthInsights: Partial<Record<number, string>> = {
    0: "January — New fiscal year in many regions. Budgets are freshly allocated; emphasize ROI and strategic priorities for Q1. Great time to reach decision-makers setting annual vendor plans.",
    1: "February — Q1 pipeline-building month. Push urgency around Q1 goals. In MENA, pre-Ramadan decisions may accelerate.",
    2: "March — End of Q1; deals should close before quarter-end. In Egypt and MENA, post-Ramadan momentum picks up. International schools and education sector begin academic-year planning (strong for EdTech/LMS).",
    3: "April — Post-Ramadan and Eid recovery month. MENA markets re-engage after holiday. New semester starts in many regions — strong for EdTech, training, and HR tech.",
    4: "May — International school year ending in many MENA/Egypt markets. Strong window for EdTech, LMS, and academic software vendors. Universities finalizing next-year budgets.",
    5: "June — H1 close pressure. Push for deals before mid-year budget reviews. Summer slowdown begins in Gulf region.",
    6: "July — Summer slowdown in Europe and Gulf. Decision-makers on holiday. Focus on nurturing, content marketing, and expanding pipeline for Q3.",
    7: "August — Back-to-business month in MENA and Egypt after summer. European market returns. Good time to re-engage stalled deals.",
    8: "September — Strong buying season; Q3 ends, Q4 budgets being finalized. New academic year in full swing — prime for EdTech/LMS/HR platforms.",
    9: "October — Year-end budget cycles accelerating. Companies rushing to spend remaining budgets before fiscal year end (for Dec/Jan FY). ABM urgency is high. Healthcare and government often have 'use it or lose it' budgets.",
    10: "November — Final push before year-end. Last chance for annual contracts. Emphasize multi-year deals, implementation timelines, and end-of-year pricing incentives.",
    11: "December — Holiday slowdown in Western markets. Strong close month for deals already in negotiation. MENA markets remain active. Focus on renewal conversations and Q1 pipeline seeding.",
  };

  if (monthInsights[month]) {
    insights.push(monthInsights[month]!);
  }

  // Industry + month specific opportunities
  const industryLower = industry.toLowerCase();
  if (month === 4 && /lms|edtech|education|e-learning|learning/i.test(industryLower)) {
    insights.push("May is peak season for LMS and EdTech vendors targeting international schools in Egypt — schools finalize next-year platform decisions before summer break.");
  }
  if ((month === 9 || month === 10) && /saas|software|tech|crm|erp/i.test(industryLower)) {
    insights.push("October-November: Enterprise software buyers are under year-end budget pressure — accelerate negotiations and offer Q4 incentives.");
  }
  if (month === 8 && /hr|recruitment|talent|hiring|workforce/i.test(industryLower)) {
    insights.push("September: HR tech buying season — companies plan headcount and HR platform investments for Q4 and next year.");
  }
  if (/egypt|cairo/i.test(geoTargets) && month >= 5 && month <= 7) {
    insights.push("Egyptian market summer (June-August): Government and large enterprises slow down. Focus on SME and private sector targets that remain active year-round.");
  }

  const context = [
    `Current Date: ${monthName} ${year}`,
    `Current Season: ${season}`,
    ramadan ? "Religious Context: Currently Ramadan" : "",
    `Seasonal Intelligence:\n${insights.map((i) => `  - ${i}`).join("\n")}`,
  ].filter(Boolean).join("\n");

  return context;
}

const SYSTEM_PROMPT = `You are AVORA, a Senior GTM Strategist AI for Enigma Sales.
You specialize in B2B go-to-market strategy, ICP definition, DMU mapping, and outreach playbooks.
You are analytical, precise, and data-driven. You NEVER fabricate data or make unfounded assumptions.
Always respond in the user's specified language (English or Arabic).
Your outputs are structured, actionable, and tailored to the specific business context provided.
Return ONLY valid JSON — no markdown, no code fences, no explanation text.`;

function buildContext(context: OnboardingContext, lang: string, mode: string, now: Date = new Date()): string {
  const seasonalContext = buildSeasonalContext(now, context.geoTargets || "", context.industry || "");

  return `Language: ${lang}
Mode: ${mode === "strict" ? "STRICT - comprehensive analysis" : "BALANCED - preliminary with warnings"}

${seasonalContext}

BUSINESS:
- Company: ${context.companyName || "Not specified"}
- Industry: ${context.industry || "Not specified"}
- Offer: ${context.offer || "Not specified"}
- Problem solved: ${context.problem || "Not specified"}
- Pricing: ${context.pricingRange || "Not specified"}
- Sales cycle: ${context.salesCycleRange || "Not specified"}
- Geographies: ${context.geoTargets || "Not specified"}
- ICP hypothesis: ${context.icpHypothesis || "Not specified"}
- Company size target: ${context.employeeRange || "Not specified"}
- Revenue target: ${context.revenueRange || "Not specified"}

EVIDENCE:
- Best customer 1: ${context.bestCustomer1 || "Not provided"}
- Best customer 2: ${context.bestCustomer2 || "Not provided"}
- Lost deal: ${context.lostDeal || "Not provided"}

VALUE PROP:
- Why we win: ${context.whyWeWin || "Not specified"}
- Competitors: ${context.competitors || "Not specified"}
- Differentiation: ${context.differentiation || "Not specified"}
- Disqualifiers: ${context.disqualifiers || "Not specified"}

DMU:
- Economic buyer: ${context.economicBuyer || "Not specified"}
- Champion: ${context.champion || "Not specified"}
- Technical buyer: ${context.technicalBuyer || "Not specified"}
- End user: ${context.endUser || "Not specified"}
- Influencer: ${context.influencer || "Not specified"}
- Objections: ${context.objections || "Not specified"}
- Titles: ${context.titles || "Not specified"}

CHANNELS:
- Current channels: ${context.currentChannels || "Not specified"}
- Team size: ${context.teamSize || "Not specified"}
- Tools: ${context.tools || "Not specified"}
- Capacity: ${context.capacity || "Not specified"}

SEASONAL INSTRUCTIONS:
Use the Seasonal Intelligence above to enrich all 5 report sections:
1. In ICP psychographics and triggers, factor in current seasonal buying patterns and priorities.
2. In ABM strategy, adjust outreach timing recommendations and tier prioritization based on the current month and season.
3. In the Outreach Playbook, adapt cadence and messaging to reflect seasonal context (e.g., avoid aggressive cold outreach during Ramadan fasting hours, emphasize year-end urgency in October-November, etc.).
4. In ABM and ICP sections, call out specific seasonal opportunities relevant to the user's industry and geography.`;
}

async function callClaude(prompt: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: prompt }],
  });

  if (response.stop_reason === "max_tokens") {
    throw new Error("Response was truncated — reduce content or split into smaller sections");
  }

  const content = response.content[0];
  if (content.type !== "text") throw new Error("Unexpected response type");

  // Strip markdown code fences if model adds them despite instructions
  return content.text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();
}

function parseJson(text: string, section: string): Record<string, unknown> {
  try {
    return JSON.parse(text);
  } catch (err) {
    // Attempt to extract JSON object from the text if there's surrounding noise
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        // fall through
      }
    }
    console.error(`Failed to parse ${section} JSON:`, text.slice(0, 500));
    throw new Error(`Invalid JSON in ${section} response: ${(err as Error).message}`);
  }
}

async function generateIcp(context: OnboardingContext, lang: string, mode: string, now: Date) {
  const prompt = `${buildContext(context, lang, mode, now)}

Generate the ICP (Ideal Customer Profile) section. Return this exact JSON structure:
{
  "title": "ICP: [short descriptive name]",
  "firmographics": {
    "industries": ["3-5 specific industries"],
    "companySize": "employee range",
    "revenue": "revenue range",
    "geography": ["list of regions/countries"],
    "techStack": ["relevant tech signals"]
  },
  "psychographics": {
    "challenges": ["3-5 key pain points"],
    "motivations": ["3-5 buying motivations"],
    "priorities": ["3-5 strategic priorities"]
  },
  "triggers": ["4-6 buying trigger events"],
  "qualifiers": ["5-7 must-have qualification criteria"],
  "disqualifiers": ["all disqualifiers from context"],
  "summary": "2-3 sentence ICP summary in the response language",
  "englishSummary": "2-3 sentence ICP summary always written in English regardless of response language",
  "warnings": ["any data gaps if mode is balanced, empty array if strict"]
}`;

  const text = await callClaude(prompt);
  return parseJson(text, "ICP");
}

async function generateDmu(context: OnboardingContext, lang: string, mode: string, now: Date) {
  const prompt = `${buildContext(context, lang, mode, now)}

Generate the DMU (Decision Making Unit) Map section. Return this exact JSON structure:
{
  "title": "DMU Map",
  "roles": [
    {
      "role": "Economic Buyer",
      "typicalTitles": ["2-3 titles"],
      "concerns": ["2-3 primary concerns"],
      "messagingAngle": "one sentence angle for this persona",
      "decisionWeight": "High/Medium/Low + brief reason"
    },
    {
      "role": "Champion",
      "typicalTitles": [],
      "concerns": [],
      "messagingAngle": "",
      "decisionWeight": ""
    },
    {
      "role": "Technical Buyer",
      "typicalTitles": [],
      "concerns": [],
      "messagingAngle": "",
      "decisionWeight": ""
    },
    {
      "role": "End User",
      "typicalTitles": [],
      "concerns": [],
      "messagingAngle": "",
      "decisionWeight": ""
    },
    {
      "role": "Influencer",
      "typicalTitles": [],
      "concerns": [],
      "messagingAngle": "",
      "decisionWeight": ""
    }
  ],
  "buyingProcess": "2-3 sentence description of typical buying process",
  "keyObjections": ["4-6 common objections with brief response hints"],
  "summary": "2-3 sentence DMU summary in the response language",
  "englishSummary": "2-3 sentence DMU summary always written in English regardless of response language"
}`;

  const text = await callClaude(prompt);
  return parseJson(text, "DMU");
}

async function generateAbm(context: OnboardingContext, lang: string, mode: string, now: Date) {
  const prompt = `${buildContext(context, lang, mode, now)}

Generate the ABM (Account-Based Marketing) Strategy section. Return this exact JSON structure:
{
  "title": "ABM Targeting Strategy",
  "tiers": [
    {
      "tier": "Tier 1 - Strategic Accounts",
      "criteria": ["4-5 specific criteria for top accounts"],
      "accountCount": "estimated number e.g. 20-50",
      "approach": "2-3 sentence personalized approach"
    },
    {
      "tier": "Tier 2 - Growth Accounts",
      "criteria": ["3-4 criteria"],
      "accountCount": "estimated number e.g. 100-300",
      "approach": "2-3 sentence scaled approach"
    },
    {
      "tier": "Tier 3 - Pipeline Accounts",
      "criteria": ["3-4 criteria"],
      "accountCount": "estimated number e.g. 500-2000",
      "approach": "2-3 sentence automated approach"
    }
  ],
  "prioritizationFramework": "3-4 sentence framework for scoring and prioritizing accounts",
  "kpis": ["5-7 KPIs to track ABM performance"],
  "summary": "2-3 sentence ABM strategy summary in the response language",
  "englishSummary": "2-3 sentence ABM strategy summary always written in English regardless of response language"
}`;

  const text = await callClaude(prompt);
  return parseJson(text, "ABM");
}

async function generateOutreach(context: OnboardingContext, lang: string, mode: string, now: Date) {
  const prompt = `${buildContext(context, lang, mode, now)}

Generate the Outreach Playbook section. Keep templates concise (2-3 sentences each). Return this exact JSON structure:
{
  "title": "Outreach Playbook",
  "channels": [
    {
      "channel": "LinkedIn",
      "strategy": "2-3 sentence LinkedIn approach",
      "cadence": "e.g. Day 1, 3, 7, 14",
      "messagingFramework": {
        "hook": "attention-grabbing opener",
        "value": "core value statement",
        "cta": "low-friction call to action"
      },
      "templates": [
        "Connection request template (150 chars max)",
        "Follow-up message template (300 chars max)"
      ]
    },
    {
      "channel": "Email",
      "strategy": "2-3 sentence email approach",
      "cadence": "e.g. Day 1, 4, 8, 15",
      "messagingFramework": {
        "hook": "subject line hook",
        "value": "core value statement",
        "cta": "low-friction CTA"
      },
      "templates": [
        "Cold email template (150 words max)",
        "Follow-up email template (100 words max)"
      ]
    },
    {
      "channel": "WhatsApp",
      "strategy": "2-3 sentence WhatsApp approach",
      "cadence": "e.g. After LinkedIn connect",
      "messagingFramework": {
        "hook": "conversation opener",
        "value": "quick value statement",
        "cta": "simple next step"
      },
      "templates": [
        "WhatsApp intro message (100 chars max)"
      ]
    }
  ],
  "sequenceOverview": "2-3 sentence multi-channel sequence overview",
  "summary": "2-3 sentence outreach strategy summary in the response language",
  "englishSummary": "2-3 sentence outreach strategy summary always written in English regardless of response language"
}`;

  const text = await callClaude(prompt);
  return parseJson(text, "Outreach");
}

async function generateLookalike(context: OnboardingContext, lang: string, mode: string, now: Date) {
  const prompt = `${buildContext(context, lang, mode, now)}

Generate the Lookalike Company Criteria section. NO specific company names or personal contacts. Return this exact JSON structure:
{
  "title": "Lookalike Account Criteria",
  "criteria": [
    { "category": "Industry & Vertical", "criteria": ["3-4 criteria"], "rationale": "brief rationale" },
    { "category": "Company Size & Stage", "criteria": ["3-4 criteria"], "rationale": "brief rationale" },
    { "category": "Tech Stack Signals", "criteria": ["3-4 criteria"], "rationale": "brief rationale" },
    { "category": "Behavioral Signals", "criteria": ["3-4 criteria"], "rationale": "brief rationale" }
  ],
  "searchQueries": {
    "linkedin": [
      "LinkedIn Sales Navigator filter set 1",
      "LinkedIn Sales Navigator filter set 2"
    ],
    "google": [
      "site:linkedin.com/company [industry] [size] [location]",
      "Google search query 2"
    ],
    "crunchbase": [
      "Crunchbase filter description 1"
    ]
  },
  "booleanStrings": [
    "Boolean search string 1 for LinkedIn/Google",
    "Boolean search string 2"
  ],
  "summary": "2-3 sentence lookalike strategy summary in the response language",
  "englishSummary": "2-3 sentence lookalike strategy summary always written in English regardless of response language",
  "disclaimer": "These are search criteria only. No specific companies or personal contacts are provided. Use these criteria to build your own targeted account lists."
}`;

  const text = await callClaude(prompt);
  return parseJson(text, "Lookalike");
}

export async function generateReports(
  context: OnboardingContext,
  mode: "balanced" | "strict",
  now: Date = new Date()
) {
  const lang = context.language === "ar" ? "Arabic" : "English";

  // Generate all 5 sections in parallel — each call is small enough to never truncate
  const [icp, dmu, abm, outreach, lookalike] = await Promise.all([
    generateIcp(context, lang, mode, now),
    generateDmu(context, lang, mode, now),
    generateAbm(context, lang, mode, now),
    generateOutreach(context, lang, mode, now),
    generateLookalike(context, lang, mode, now),
  ]);

  return { icp, dmu, abm, outreach, lookalike };
}

export async function generateFollowUpQuestions(
  step: number,
  existingAnswers: Record<string, string>,
  language: string
): Promise<string[]> {
  const lang = language === "ar" ? "Arabic" : "English";

  const stepNames: Record<number, string> = {
    1: "Business Foundation (what you sell, problem, ICP hypothesis, target geos, pricing, sales cycle)",
    2: "Real Customer Evidence (best customers, lost deals)",
    3: "Value Proposition & Alternatives",
    4: "ICP Constraints & Disqualifiers",
    5: "DMU Roles",
    6: "Channels & Current Process",
  };

  const prompt = `You are conducting a GTM strategy interview. The user is on step ${step}: ${stepNames[step]}.

Their current answers: ${JSON.stringify(existingAnswers)}

Generate 2-3 specific follow-up questions in ${lang} to deepen the analysis.
Focus on gaps or areas needing more specificity.
Return ONLY a JSON array of question strings.`;

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 500,
    messages: [{ role: "user", content: prompt }],
  });

  const content = response.content[0];
  if (content.type !== "text") return [];

  try {
    const text = content.text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "");
    return JSON.parse(text);
  } catch {
    return [];
  }
}
