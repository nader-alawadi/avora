import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ── Context interface ─────────────────────────────────────────────────────────
// Maps all 12 wizard steps into a single flat context object.

export interface OnboardingContext {
  // Meta
  language: string;           // "ar" | "en"

  // Step 0 – Company Identity
  companyName: string;
  website: string;
  employees: string;          // "1-10" | "11-50" | "51-200" | "200+"
  annualRevenue: string;      // "<100k" | "100k-500k" | ...
  linkedin: string;
  logoUrl: string;

  // Step 1 – What You Sell
  productName: string;
  productType: string;        // "product"|"service"|"saas"|"consulting"|"agency"
  description: string;
  pricingModel: string;       // "one-time"|"monthly"|"project"|"commission"|"freemium"
  dealSize: string;           // "<1k"|"1k-5k"|"5k-20k"|"20k-100k"|"100k+"
  salesCycle: string;         // "same-day"|"1-2w"|"1-3m"|"3-6m"|"6m+"

  // Step 2 – Current Sales Process
  leadSources: string;        // comma-joined list
  tools: string;              // comma-joined list
  hasTeam: boolean;
  teamSize: string;
  roles: string;              // comma-joined list

  // Step 3 – Challenges
  topChallenges: string;      // comma-joined list
  biggestPain: string;

  // Step 4 – Target Market
  countries: string;          // comma-joined list
  industries: string;         // comma-joined list
  targetCompanySize: string;  // comma-joined list
  b2bOrB2c: string;           // "b2b" | "b2c"

  // Step 5 – ICP Hints
  jobTitles: string;
  buyingTriggers: string;     // comma-joined list
  disqualifiers: string;

  // Step 6 – Sales Targets
  meetingTarget: string;
  dealsTarget: string;
  revenueTarget: string;      // "<50k"|"50k-200k"|...
  mainMetric: string;

  // Step 7 – Success Stories
  successFiles: string;       // comma-joined file URLs
  bestResult: string;
  notableClients: string;

  // Step 8 – Competition & Positioning
  competitors: string;
  differentiation: string;
  valueProposition: string;

  // Step 9 – Outreach Preferences
  outreachChannels: string;   // comma-joined list
  outreachLang: string;       // "ar"|"en"|"both"
  tone: string;               // "formal"|"semi-formal"|"casual"
  wantsColdCall: boolean;
  wantsEmailSeq: boolean;
  wantsLinkedinSeq: boolean;
  wantsWhatsappSeq: boolean;

  // Step 10 – Company Documents (file URLs, informational)
  profileFiles: string;
  brochureFiles: string;
}

// ── Ramadan / seasonal helpers ────────────────────────────────────────────────

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
  const current = date.getMonth() * 100 + date.getDate();
  return current >= window.startMonth * 100 + window.startDay &&
         current <= window.endMonth * 100 + window.endDay;
}

function getSeason(month: number, geo: string): string {
  const isGulf = /saudi|uae|qatar|kuwait|bahrain|oman|gulf/i.test(geo);
  const isNorthAfrica = /egypt|morocco|tunisia|algeria|libya/i.test(geo);
  const isEurope = /europe|uk|france|germany|spain|italy|netherlands/i.test(geo);

  if (isGulf || isNorthAfrica) {
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
  if (month >= 2 && month <= 4) return "Spring";
  if (month >= 5 && month <= 7) return "Summer";
  if (month >= 8 && month <= 10) return "Autumn";
  return "Winter";
}

function buildSeasonalContext(now: Date, countries: string, industries: string): string {
  const month = now.getMonth();
  const monthName = now.toLocaleString("en-US", { month: "long" });
  const year = now.getFullYear();
  const season = getSeason(month, countries);
  const ramadan = isRamadan(now);

  const insights: string[] = [];

  if (ramadan) {
    insights.push(
      "It is currently Ramadan — decision-making slows significantly in MENA markets. " +
      "Focus outreach on pre-Ramadan pipeline follow-ups and post-Ramadan (Eid) timing for closings. " +
      "Avoid heavy prospecting campaigns during fasting hours; shift to evening or async outreach. " +
      "Emphasize relationship-building messages over hard sales pitches."
    );
  }

  const monthInsights: Partial<Record<number, string>> = {
    0: "January — New fiscal year; budgets freshly allocated. Emphasize ROI and Q1 strategic priorities. Ideal for reaching decision-makers setting annual vendor plans.",
    1: "February — Q1 pipeline-building month. Push urgency around Q1 goals. In MENA, pre-Ramadan decisions may accelerate.",
    2: "March — Q1 end; close deals before quarter-end. Post-Ramadan momentum picks up in Egypt and MENA. Education sector begins academic-year planning.",
    3: "April — Post-Ramadan and Eid recovery. MENA markets re-engage. New semester starts — strong for EdTech, training, and HR tech.",
    4: "May — International school year ending in MENA/Egypt. Strong window for EdTech, LMS, and academic software. Universities finalizing next-year budgets.",
    5: "June — H1 close pressure. Push for deals before mid-year budget reviews. Summer slowdown begins in Gulf region.",
    6: "July — Summer slowdown in Europe and Gulf. Focus on nurturing and pipeline-building for Q3.",
    7: "August — Back-to-business in MENA and Egypt after summer. European market returns. Good time to re-engage stalled deals.",
    8: "September — Strong buying season; Q3 ends, Q4 budgets finalizing. New academic year — prime for EdTech/LMS/HR platforms.",
    9: "October — Year-end budget cycles accelerating. Companies spending remaining budgets. Healthcare and government have 'use it or lose it' budgets. ABM urgency is high.",
    10: "November — Final push before year-end. Last chance for annual contracts. Emphasize multi-year deals and end-of-year pricing incentives.",
    11: "December — Holiday slowdown in Western markets. Strong close month for deals already in negotiation. MENA markets remain active. Focus on Q1 pipeline seeding.",
  };

  if (monthInsights[month]) insights.push(monthInsights[month]!);

  // Industry-specific seasonality
  const ind = industries.toLowerCase();
  if (month === 4 && /lms|edtech|education|e-learning|learning/i.test(ind))
    insights.push("May is peak season for LMS and EdTech targeting international schools in Egypt — schools finalize next-year platform decisions before summer break.");
  if ((month === 9 || month === 10) && /saas|software|tech|crm|erp/i.test(ind))
    insights.push("October–November: Enterprise software buyers are under year-end budget pressure — accelerate negotiations and offer Q4 incentives.");
  if (month === 8 && /hr|recruitment|talent|hiring|workforce/i.test(ind))
    insights.push("September: HR tech buying season — companies plan headcount and HR platform investments for Q4 and next year.");
  if (/egypt|cairo/i.test(countries) && month >= 5 && month <= 7)
    insights.push("Egyptian market summer (June–August): Government and large enterprises slow down. Focus on SME and private sector targets that remain active year-round.");
  if (/saudi|ksa/i.test(countries) && month >= 9 && month <= 11)
    insights.push("Saudi Arabia Q4: Vision 2030-aligned spending accelerates in October–December; strong for digital transformation, fintech, and PropTech vendors.");
  if (/saas|software/i.test(ind) && /egypt|saudi|uae/i.test(countries))
    insights.push("MENA SaaS market: Fastest growth in cloud adoption Q3–Q4 as enterprises seek to deploy budgets before year-end freeze.");
  if (/ecom|e-commerce|retail/i.test(ind))
    insights.push("E-commerce/Retail: Peak sales season is November–January (Black Friday, Eid, Christmas). Platform and tool vendors should intensify outreach now to be live before the rush.");
  if (/real.?estate|realestate|proptech/i.test(ind))
    insights.push("Real estate: Strongest buying cycles in MENA are post-Ramadan (May) and post-summer (September). Transaction volumes peak before year-end holidays.");

  return [
    `Current Date: ${monthName} ${year}`,
    `Current Season: ${season}`,
    ramadan ? "Religious Context: Currently Ramadan" : "",
    `Seasonal Intelligence:\n${insights.map((i) => `  - ${i}`).join("\n")}`,
  ].filter(Boolean).join("\n");
}

// ── System prompt ─────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are AVORA, a Senior GTM Strategist AI for Enigma Sales.
You specialize in B2B go-to-market strategy, ICP definition, DMU mapping, account-based marketing, and multi-channel outreach playbooks.
You are analytical, precise, and data-driven. You NEVER fabricate data or make unfounded assumptions.
Always respond in the user's specified language (English or Arabic).
Your outputs are structured, actionable, and tailored to the specific business context provided.
Return ONLY valid JSON — no markdown, no code fences, no explanation text.`;

// ── Context builder ───────────────────────────────────────────────────────────

function buildContext(ctx: OnboardingContext, lang: string, mode: string, now: Date = new Date()): string {
  const seasonal = buildSeasonalContext(now, ctx.countries || "", ctx.industries || "");

  // Derive outreach language/dialect for messaging
  const isArabic = ctx.outreachLang === "ar" || ctx.outreachLang === "both";
  const hasEgypt  = /egypt|eg\b/i.test(ctx.countries);
  const hasGulf   = /saudi|uae|qatar|kuwait|gulf|sa\b|ae\b|qa\b|kw\b/i.test(ctx.countries);
  const dialect = isArabic
    ? (hasEgypt ? "Egyptian Arabic dialect" : hasGulf ? "Gulf Arabic dialect" : "Modern Standard Arabic")
    : "English";

  return `Language: ${lang}
Mode: ${mode === "strict" ? "STRICT — comprehensive, data-driven analysis" : "BALANCED — preliminary with clear warnings about data gaps"}

${seasonal}

COMPANY:
- Name: ${ctx.companyName || "Not specified"}
- Website: ${ctx.website || "Not specified"}
- Team size: ${ctx.employees || "Not specified"} employees
- Annual revenue: ${ctx.annualRevenue || "Not specified"}
- LinkedIn: ${ctx.linkedin || "Not specified"}

PRODUCT / SERVICE:
- Name: ${ctx.productName || "Not specified"}
- Type: ${ctx.productType || "Not specified"}
- Description: ${ctx.description || "Not specified"}
- Pricing model: ${ctx.pricingModel || "Not specified"}
- Average deal size: ${ctx.dealSize || "Not specified"}
- Sales cycle: ${ctx.salesCycle || "Not specified"}

CURRENT SALES PROCESS:
- Lead sources: ${ctx.leadSources || "Not specified"}
- Tools used: ${ctx.tools || "Not specified"}
- Has sales team: ${ctx.hasTeam ? "Yes" : "No"}
- Team size: ${ctx.teamSize || "N/A"}
- Sales roles: ${ctx.roles || "N/A"}

CHALLENGES:
- Top 3 challenges: ${ctx.topChallenges || "Not specified"}
- Biggest pain in one sentence: ${ctx.biggestPain || "Not specified"}

TARGET MARKET:
- Countries / regions: ${ctx.countries || "Not specified"}
- Industries: ${ctx.industries || "Not specified"}
- Target company size: ${ctx.targetCompanySize || "Not specified"}
- B2B or B2C: ${ctx.b2bOrB2c || "Not specified"}

ICP HINTS:
- Target job titles: ${ctx.jobTitles || "Not specified"}
- Buying triggers: ${ctx.buyingTriggers || "Not specified"}
- Disqualifiers: ${ctx.disqualifiers || "Not specified"}

SALES TARGETS:
- Monthly meetings target: ${ctx.meetingTarget || "Not specified"}
- Monthly deals target: ${ctx.dealsTarget || "Not specified"}
- Annual revenue target: ${ctx.revenueTarget || "Not specified"}
- Most important metric: ${ctx.mainMetric || "Not specified"}

SOCIAL PROOF:
- Best client result: ${ctx.bestResult || "Not provided"}
- Notable clients: ${ctx.notableClients || "Not provided"}

COMPETITION & POSITIONING:
- Competitors: ${ctx.competitors || "Not specified"}
- Differentiation: ${ctx.differentiation || "Not specified"}
- Value proposition: ${ctx.valueProposition || "Not specified"}

OUTREACH PREFERENCES:
- Preferred channels: ${ctx.outreachChannels || "Not specified"}
- Outreach language: ${ctx.outreachLang || "en"} (${dialect})
- Message tone: ${ctx.tone || "semi-formal"}
- Wants Cold Call scripts: ${ctx.wantsColdCall ? "YES" : "No"}
- Wants Email sequences: ${ctx.wantsEmailSeq ? "YES" : "No"}
- Wants LinkedIn sequences: ${ctx.wantsLinkedinSeq ? "YES" : "No"}
- Wants WhatsApp sequences: ${ctx.wantsWhatsappSeq ? "YES" : "No"}

SEASONAL INSTRUCTIONS:
Use the Seasonal Intelligence above to enrich ALL report sections:
1. ICP psychographics and triggers — factor in current seasonal buying patterns.
2. ABM strategy — adjust timing recommendations and tier prioritization for the current month.
3. Outreach Playbook — adapt cadence and messaging to seasonal context (e.g., avoid aggressive cold outreach during Ramadan fasting hours; emphasize year-end urgency in October–November; highlight Q4 budget-spend windows).
4. Lookalike criteria — call out which account signals are most active this season.`;
}

// ── Claude API call ───────────────────────────────────────────────────────────

async function callClaude(prompt: string, maxTokens = 4096, model = "claude-sonnet-4-6"): Promise<string> {
  const response = await anthropic.messages.create({
    model,
    max_tokens: maxTokens,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: prompt }],
  });

  if (response.stop_reason === "max_tokens") {
    throw new Error("Response truncated — prompt is too long");
  }

  const content = response.content[0];
  if (content.type !== "text") throw new Error("Unexpected response type");

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
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try { return JSON.parse(match[0]); } catch { /* fall through */ }
    }
    console.error(`Failed to parse ${section} JSON:`, text.slice(0, 500));
    throw new Error(`Invalid JSON in ${section}: ${(err as Error).message}`);
  }
}

// ── ICP ───────────────────────────────────────────────────────────────────────

async function generateIcp(ctx: OnboardingContext, lang: string, mode: string, now: Date) {
  const prompt = `${buildContext(ctx, lang, mode, now)}

Generate the ICP (Ideal Customer Profile) section using ALL the context above, especially:
- Job titles provided: ${ctx.jobTitles}
- Buying triggers: ${ctx.buyingTriggers}
- Target industries: ${ctx.industries}
- Target countries: ${ctx.countries}
- Target company sizes: ${ctx.targetCompanySize}
- Disqualifiers: ${ctx.disqualifiers}
- Deal size and sales cycle shape the psychographic urgency level.
- B2B/B2C context: ${ctx.b2bOrB2c}

Return this exact JSON:
{
  "title": "ICP: [short descriptive name]",
  "firmographics": {
    "industries": ["3-5 specific industries matching context"],
    "companySize": "employee range from context",
    "revenue": "revenue range inferred from deal size and target market",
    "geography": ["list of regions/countries from context"],
    "techStack": ["3-5 relevant tech signals this ICP likely uses"]
  },
  "psychographics": {
    "challenges": ["3-5 key pain points from the challenges and biggestPain fields"],
    "motivations": ["3-5 buying motivations"],
    "priorities": ["3-5 strategic priorities this season"]
  },
  "triggers": ["4-6 buying triggers from context + seasonal buying events"],
  "qualifiers": ["5-7 must-have qualification criteria based on job titles, size, industry, triggers"],
  "disqualifiers": ["all disqualifiers provided + any inferred from context"],
  "jobTitles": ["all target job titles expanded with variations"],
  "summary": "2-3 sentence ICP summary in ${lang}",
  "englishSummary": "2-3 sentence ICP summary always in English",
  "seasonalNote": "1-2 sentence note on seasonal buying behaviour for this ICP right now",
  "warnings": ["data gaps if mode is balanced, empty array if strict"]
}`;

  return parseJson(await callClaude(prompt), "ICP");
}

// ── DMU ───────────────────────────────────────────────────────────────────────

async function generateDmu(ctx: OnboardingContext, lang: string, mode: string, now: Date) {
  const prompt = `${buildContext(ctx, lang, mode, now)}

Generate the DMU (Decision Making Unit) Map using the provided job titles, target company sizes, industries, and B2B context.
The job titles hint is: "${ctx.jobTitles}".
The deal size (${ctx.dealSize}) and sales cycle (${ctx.salesCycle}) indicate how complex the buying committee is.
Competition context: "${ctx.competitors}" — infer what roles compare vendors.

Return this exact JSON:
{
  "title": "DMU Map",
  "roles": [
    {
      "role": "Economic Buyer",
      "typicalTitles": ["2-3 specific titles from the job titles context"],
      "concerns": ["2-3 primary concerns: ROI, budget, risk"],
      "messagingAngle": "one powerful sentence targeting this persona",
      "decisionWeight": "High/Medium/Low + brief reason"
    },
    {
      "role": "Champion",
      "typicalTitles": ["2-3 titles"],
      "concerns": ["2-3 concerns"],
      "messagingAngle": "",
      "decisionWeight": ""
    },
    {
      "role": "Technical Buyer",
      "typicalTitles": ["2-3 titles"],
      "concerns": ["2-3 concerns"],
      "messagingAngle": "",
      "decisionWeight": ""
    },
    {
      "role": "End User",
      "typicalTitles": ["2-3 titles"],
      "concerns": ["2-3 concerns"],
      "messagingAngle": "",
      "decisionWeight": ""
    },
    {
      "role": "Influencer",
      "typicalTitles": ["2-3 titles"],
      "concerns": ["2-3 concerns"],
      "messagingAngle": "",
      "decisionWeight": ""
    }
  ],
  "buyingProcess": "2-3 sentences describing the typical buying process for this deal size and sales cycle",
  "keyObjections": ["5-7 specific objections based on competitors, deal size, and challenges context — each with a 1-sentence reframe"],
  "summary": "2-3 sentence DMU summary in ${lang}",
  "englishSummary": "2-3 sentence DMU summary always in English"
}`;

  return parseJson(await callClaude(prompt), "DMU");
}

// ── ABM ───────────────────────────────────────────────────────────────────────

async function generateAbm(ctx: OnboardingContext, lang: string, mode: string, now: Date) {
  const prompt = `${buildContext(ctx, lang, mode, now)}

Generate the ABM (Account-Based Marketing) Strategy.
Tier 1 accounts should match: ${ctx.targetCompanySize} companies in ${ctx.industries} with buying triggers: ${ctx.buyingTriggers}.
Monthly meetings target: ${ctx.meetingTarget} — use this to calibrate account counts per tier.
Most important metric: ${ctx.mainMetric}.

Return this exact JSON:
{
  "title": "ABM Targeting Strategy",
  "tiers": [
    {
      "tier": "Tier 1 — Strategic Accounts",
      "criteria": ["4-5 specific criteria for top accounts matching the ICP perfectly"],
      "accountCount": "realistic estimate based on geography + industry + size",
      "approach": "2-3 sentences: hyper-personalized 1:1 ABM approach",
      "channels": ["primary channels for this tier from outreach preferences"]
    },
    {
      "tier": "Tier 2 — Growth Accounts",
      "criteria": ["3-4 criteria: good fit but require nurturing"],
      "accountCount": "realistic estimate",
      "approach": "2-3 sentences: 1:few programmatic approach",
      "channels": ["channels for tier 2"]
    },
    {
      "tier": "Tier 3 — Pipeline Accounts",
      "criteria": ["3-4 criteria: broad awareness"],
      "accountCount": "realistic estimate",
      "approach": "2-3 sentences: 1:many automated approach",
      "channels": ["channels for tier 3"]
    }
  ],
  "prioritizationFramework": "3-4 sentences: how to score and rank accounts using ICP fit, buying triggers, and seasonal context",
  "kpis": ["6-8 KPIs tied to the client's main metric (${ctx.mainMetric}) and sales targets"],
  "seasonalPlay": "2-3 sentences: specific ABM actions to take right now given the current month/season",
  "summary": "2-3 sentence ABM summary in ${lang}",
  "englishSummary": "2-3 sentence ABM summary always in English"
}`;

  return parseJson(await callClaude(prompt), "ABM");
}

// ── Outreach Playbook ─────────────────────────────────────────────────────────

async function generateOutreach(ctx: OnboardingContext, lang: string, mode: string, now: Date) {
  // Determine which channels are active
  const channels: string[] = [];
  const ch = (ctx.outreachChannels || "").toLowerCase();
  const all = ch.includes("all");
  if (all || ch.includes("cold-email") || ch.includes("email"))   channels.push("Email");
  if (all || ch.includes("linkedin"))                             channels.push("LinkedIn");
  if (all || ch.includes("whatsapp"))                             channels.push("WhatsApp");
  if (all || ch.includes("cold-calls") || ch.includes("cold call")) channels.push("ColdCall");

  // Override with explicit sequence preferences if set
  if (ctx.wantsEmailSeq    && !channels.includes("Email"))    channels.push("Email");
  if (ctx.wantsLinkedinSeq && !channels.includes("LinkedIn")) channels.push("LinkedIn");
  if (ctx.wantsWhatsappSeq && !channels.includes("WhatsApp")) channels.push("WhatsApp");
  if (ctx.wantsColdCall    && !channels.includes("ColdCall")) channels.push("ColdCall");

  // If nothing selected, default to email + linkedin
  if (channels.length === 0) channels.push("Email", "LinkedIn");

  const tone = ctx.tone || "semi-formal";
  const isArabic = ctx.outreachLang === "ar" || ctx.outreachLang === "both";
  const hasEgypt = /egypt|eg\b/i.test(ctx.countries);
  const hasGulf  = /saudi|uae|qatar|kuwait|sa\b|ae\b|qa\b|kw\b/i.test(ctx.countries);
  const dialect  = isArabic
    ? (hasEgypt ? "Egyptian Arabic (Egyptian colloquial dialect, not MSA)" : hasGulf ? "Gulf Arabic (Saudi/Emirati dialect)" : "Modern Standard Arabic")
    : "English";

  const coldCallBlock = channels.includes("ColdCall") ? `
IMPORTANT — Cold Call script section:
Generate a full Cold Call script following Jordan Belfort's Straight Line Sales System:
  - Opening: Pattern-interrupt opener (short, confident, unexpected)
  - Qualify: 3 key qualifying questions (intelligence-gathering, conversational)
  - Pitch: Certainty stack — 3-part pitch building logical, emotional, and credibility certainty (product certain → company certain → salesperson certain)
  - Objection loop: 2-3 reframe loops for the most common objections ("not interested", "send me info", "we have a solution already")
  - Close: Appointment-setting close (confident, assumptive, with a specific day/time offer)
Write the ENTIRE script in ${dialect}. The tone must be ${tone}.
The value prop to use: "${ctx.valueProposition || ctx.description}".
Target persona: "${ctx.jobTitles}".` : "";

  const prompt = `${buildContext(ctx, lang, mode, now)}

Generate the Outreach Playbook. Only generate sections for these channels: ${channels.join(", ")}.
Message tone: ${tone}. All messages should be written in: ${dialect}.
Value proposition to weave in: "${ctx.valueProposition || ctx.description}".
Target personas: "${ctx.jobTitles}".
Best result / social proof to reference: "${ctx.bestResult || ctx.notableClients}".
${coldCallBlock}

CRITICAL REQUIREMENT — ACTUAL WRITTEN COPY ONLY:
Every "body", "message", "script", "opening", "qualify", "pitch", "reframe", and "close" field MUST contain the ACTUAL WRITTEN TEXT that a salesperson would say or send — NOT a description of what should be written.
WRONG: "Cold email body personalised to their pain"
RIGHT: "مرحباً [الاسم]، لاحظت أن شركتكم في [المجال]..."
WRONG: "Opening line using pattern interrupt"
RIGHT: "أهلاً، أنا [الاسم] من أفورا — وصلتك لأنك مسؤول عن نمو المبيعات في شركتك، صح؟"
Write COMPLETE messages — do not truncate. If writing in Arabic, write in ${dialect}. Every sequence step must have the full message text ready to copy-paste and use.

Return this exact JSON:
{
  "title": "Outreach Playbook",
  "dialect": "${dialect}",
  "tone": "${tone}",
  "channels": [
    ${channels.includes("Email") ? `{
      "channel": "Email",
      "strategy": "2-3 sentence email strategy tailored to the ICP and deal size",
      "cadence": "Day 1, Day 4, Day 8, Day 15, Day 30",
      "sequence": [
        {
          "day": 1,
          "subject": "cold email subject line (pattern-interrupt)",
          "body": "full cold email body in ${dialect} — personalised, value-first, 120-150 words, ends with soft CTA"
        },
        {
          "day": 4,
          "subject": "follow-up subject line",
          "body": "follow-up email body — references email 1, adds new insight or proof point, 80-100 words"
        },
        {
          "day": 8,
          "subject": "break-up or value-add subject",
          "body": "third touch — different angle, social proof or case study, soft or break-up tone, 60-80 words"
        }
      ]
    }` : ""}
    ${channels.includes("Email") && channels.length > 1 ? "," : ""}
    ${channels.includes("LinkedIn") ? `{
      "channel": "LinkedIn",
      "strategy": "2-3 sentence LinkedIn strategy",
      "cadence": "Day 1 (connect), Day 3 (thank you + value), Day 7 (insight), Day 14 (follow-up)",
      "sequence": [
        {
          "day": 1,
          "type": "Connection Request",
          "message": "connection request note in ${dialect} — max 200 chars, personalized hook referencing their work"
        },
        {
          "day": 3,
          "type": "First Message",
          "message": "first message after connect — thank you, quick value insight, ends with question — max 300 chars in ${dialect}"
        },
        {
          "day": 7,
          "type": "Value Share",
          "message": "share an insight or mini case study relevant to their pain — max 400 chars in ${dialect}"
        },
        {
          "day": 14,
          "type": "Soft Close",
          "message": "meeting request or breakup message — assumptive and friendly — max 300 chars in ${dialect}"
        }
      ]
    }` : ""}
    ${channels.includes("LinkedIn") && (channels.includes("WhatsApp") || channels.includes("ColdCall")) ? "," : ""}
    ${channels.includes("WhatsApp") ? `{
      "channel": "WhatsApp",
      "strategy": "2-3 sentence WhatsApp strategy — when and how to move from LinkedIn/email to WhatsApp",
      "cadence": "Only after LinkedIn connection or email reply; Day 1, Day 5, Day 10",
      "sequence": [
        {
          "day": 1,
          "message": "WhatsApp intro — extremely short, friendly, references prior contact — max 120 chars in ${dialect}"
        },
        {
          "day": 5,
          "message": "WhatsApp follow-up — one-liner value hook with CTA — max 150 chars in ${dialect}"
        },
        {
          "day": 10,
          "message": "WhatsApp soft close or break-up — max 120 chars in ${dialect}"
        }
      ]
    }` : ""}
    ${channels.includes("WhatsApp") && channels.includes("ColdCall") ? "," : ""}
    ${channels.includes("ColdCall") ? `{
      "channel": "ColdCall",
      "strategy": "2-3 sentence cold calling strategy — time of day, number of attempts, voicemail approach",
      "script": {
        "opening": "Pattern-interrupt opening line in ${dialect} — short, confident, unexpected (2-3 sentences)",
        "qualify": [
          "Qualifying question 1 — intelligence-gathering, conversational in ${dialect}",
          "Qualifying question 2 in ${dialect}",
          "Qualifying question 3 in ${dialect}"
        ],
        "pitch": {
          "logical": "Logical certainty — facts, results, numbers about the product in ${dialect}",
          "emotional": "Emotional certainty — paint the picture of their life after using the product in ${dialect}",
          "credibility": "Credibility certainty — social proof, company story, why we're the best at this in ${dialect}"
        },
        "objectionLoops": [
          {
            "objection": "Most common objection in ${dialect}",
            "reframe": "Straight Line reframe — acknowledge, pivot, re-close in ${dialect}"
          },
          {
            "objection": "Second most common objection in ${dialect}",
            "reframe": "Reframe in ${dialect}"
          },
          {
            "objection": "Third common objection in ${dialect}",
            "reframe": "Reframe in ${dialect}"
          }
        ],
        "close": "Assumptive appointment-setting close in ${dialect} — offer a specific day and time, then shut up"
      }
    }` : ""}
  ],
  "sequenceOverview": "2-3 sentence multi-channel orchestration overview",
  "summary": "2-3 sentence outreach playbook summary in ${lang}",
  "englishSummary": "2-3 sentence outreach playbook summary always in English"
}`;

  return parseJson(await callClaude(prompt, 8000), "Outreach");
}

// ── Lookalike ─────────────────────────────────────────────────────────────────

async function generateLookalike(ctx: OnboardingContext, lang: string, mode: string, now: Date) {
  const LOOKALIKE_MODEL = "claude-sonnet-4-5-20251001";

  // ── Call 1: Criteria, search queries, and boolean strings ─────────────────
  const criteriaPrompt = `${buildContext(ctx, lang, mode, now)}

Generate the Lookalike Account Criteria section — Part 1: Criteria, Search Queries, and Boolean Strings.
Target market: ${ctx.industries} companies in ${ctx.countries} with ${ctx.targetCompanySize} employees.
Buying triggers: ${ctx.buyingTriggers}.
Job titles to reach: ${ctx.jobTitles}.

Return this exact JSON (no additional fields):
{
  "title": "Lookalike Account Criteria",
  "criteria": [
    { "category": "Industry & Vertical", "criteria": ["3-4 specific criteria matching the industries and products in context"], "rationale": "brief rationale" },
    { "category": "Company Size & Stage", "criteria": ["3-4 criteria based on employee range and deal size"], "rationale": "brief rationale" },
    { "category": "Tech Stack Signals", "criteria": ["3-4 tech signals this ICP likely uses or is considering"], "rationale": "brief rationale" },
    { "category": "Behavioral Signals", "criteria": ["3-4 observable behavioral signals indicating buying intent"], "rationale": "brief rationale" },
    { "category": "Buying Trigger Signals", "criteria": ["3-4 observable buying trigger events from the context"], "rationale": "brief rationale" }
  ],
  "searchQueries": {
    "linkedin": [
      "LinkedIn Sales Navigator filter set 1 — specific to job titles, industry, geography, and company size from context",
      "LinkedIn Sales Navigator filter set 2 — alternative targeting angle"
    ],
    "google": [
      "Google search query 1 using site:, filetype:, and industry-specific keywords from context",
      "Google search query 2 using intent signals and geography"
    ],
    "crunchbase": [
      "Crunchbase filter set: specific industry tags, employee range, and geography from context"
    ]
  },
  "booleanStrings": [
    "Boolean string 1 — tailored to job titles from context AND relevant industries AND target geography",
    "Boolean string 2 — alternative angle using buying triggers and company type"
  ],
  "summary": "2-3 sentence lookalike strategy summary in ${lang}",
  "englishSummary": "2-3 sentence lookalike strategy summary always in English",
  "disclaimer": "Company suggestions are based on AI knowledge and should be verified before outreach. Use the search criteria above to build your own validated account list."
}`;

  const criteriaResult = parseJson(
    await callClaude(criteriaPrompt, 8000, LOOKALIKE_MODEL),
    "Lookalike-Criteria"
  );

  // ── Call 2: 10 real recommended companies ─────────────────────────────────
  const companiesPrompt = `${buildContext(ctx, lang, mode, now)}

Generate 10 REAL recommended companies that closely match this ICP.

Target: ${ctx.industries} companies in ${ctx.countries} with ${ctx.targetCompanySize} employees.
Job titles to reach: ${ctx.jobTitles}.
Buying triggers that make them a strong fit: ${ctx.buyingTriggers}.
Selling: ${ctx.productName} — ${ctx.description}

REQUIREMENTS:
1. Name 10 REAL, actual companies you know exist in ${ctx.countries} and ${ctx.industries}.
2. Use their real website domain (e.g., company.com, company.com.eg, company.sa).
3. Each company must genuinely operate in or serve ${ctx.countries}.
4. Provide a specific 1-sentence reason WHY they match (reference their actual industry or known characteristic).
5. Score each on a scale of 1–100 for: industryFit, sizeFit, geographyFit, triggerFit, and overall.
6. Do NOT use placeholder names. Do NOT use "Example Corp" or generic names.

Return this exact JSON (array of exactly 10 objects):
{
  "companies": [
    {
      "company": "Actual real company name",
      "website": "their-real-domain.com",
      "industry": "their specific industry vertical",
      "whyTheyMatch": "1 specific sentence explaining why they fit this ICP — reference something real about them",
      "scores": {
        "industryFit": 85,
        "sizeFit": 78,
        "geographyFit": 92,
        "triggerFit": 80,
        "overall": 84
      }
    }
  ]
}`;

  const companiesResult = parseJson(
    await callClaude(companiesPrompt, 8000, LOOKALIKE_MODEL),
    "Lookalike-Companies"
  );

  // ── Merge both results ────────────────────────────────────────────────────
  const companies = Array.isArray((companiesResult as Record<string, unknown>).companies)
    ? (companiesResult as { companies: unknown[] }).companies
    : [];

  return { ...criteriaResult, recommendedCompanies: companies };
}

// ── Success Probability ───────────────────────────────────────────────────────

async function generateSuccessProbability(ctx: OnboardingContext, lang: string, mode: string, now: Date) {
  const prompt = `${buildContext(ctx, lang, mode, now)}

Generate a Campaign Success Probability analysis.
Evaluate the probability of achieving the sales targets IF the GTM playbook is followed correctly.
Base your probability estimates on:
- ICP clarity (how well-defined the target is): job titles = "${ctx.jobTitles}", triggers = "${ctx.buyingTriggers}", disqualifiers = "${ctx.disqualifiers}"
- Channel fit (how well chosen channels match the ICP): channels = "${ctx.outreachChannels}"
- Deal complexity (deal size = "${ctx.dealSize}", sales cycle = "${ctx.salesCycle}")
- Market conditions (countries = "${ctx.countries}", season, competition = "${ctx.competitors}")
- Team readiness (has team = ${ctx.hasTeam}, tools = "${ctx.tools}")

Return this exact JSON:
{
  "title": "Campaign Success Probability",
  "overallProbability": 72,
  "dimensions": [
    { "name": "ICP Clarity", "score": 80, "rationale": "1 sentence explanation" },
    { "name": "Channel-ICP Fit", "score": 70, "rationale": "1 sentence explanation" },
    { "name": "Deal Complexity", "score": 65, "rationale": "1 sentence explanation — based on deal size and cycle" },
    { "name": "Market Conditions", "score": 75, "rationale": "1 sentence: competition, seasonality, geography" },
    { "name": "Team & Tool Readiness", "score": 60, "rationale": "1 sentence: team size, tools, current process" }
  ],
  "topRisks": ["3-4 specific risks that could reduce success rate"],
  "topAccelerators": ["3-4 specific actions that would increase the probability"],
  "projections": {
    "pessimistic": { "meetingsPerMonth": 0, "dealsPerMonth": 0, "probabilityPct": 0 },
    "realistic":   { "meetingsPerMonth": 0, "dealsPerMonth": 0, "probabilityPct": 0 },
    "optimistic":  { "meetingsPerMonth": 0, "dealsPerMonth": 0, "probabilityPct": 0 }
  },
  "summary": "2-3 sentence probability assessment in ${lang}",
  "englishSummary": "2-3 sentence assessment always in English"
}`;

  return parseJson(await callClaude(prompt), "SuccessProbability");
}

// ── Orchestrator ──────────────────────────────────────────────────────────────

export async function generateReports(
  ctx: OnboardingContext,
  mode: "balanced" | "strict",
  now: Date = new Date()
) {
  const lang = ctx.language === "ar" ? "Arabic" : "English";

  // Log key fields so server logs confirm what Claude will receive
  console.log("[ai-engine] generateReports called. Key context values:");
  console.log(`  companyName="${ctx.companyName}" productName="${ctx.productName}"`);
  console.log(`  description="${ctx.description?.slice(0, 80)}"`);
  console.log(`  countries="${ctx.countries}" industries="${ctx.industries}"`);
  console.log(`  jobTitles="${ctx.jobTitles}" buyingTriggers="${ctx.buyingTriggers}"`);
  console.log(`  topChallenges="${ctx.topChallenges}" biggestPain="${ctx.biggestPain?.slice(0, 80)}"`);
  console.log(`  competitors="${ctx.competitors?.slice(0, 80)}" valueProposition="${ctx.valueProposition?.slice(0, 80)}"`);
  console.log(`  outreachChannels="${ctx.outreachChannels}" outreachLang="${ctx.outreachLang}" tone="${ctx.tone}"`);
  console.log(`  wantsColdCall=${ctx.wantsColdCall} wantsEmail=${ctx.wantsEmailSeq} wantsLinkedIn=${ctx.wantsLinkedinSeq} wantsWhatsApp=${ctx.wantsWhatsappSeq}`);
  console.log(`  lang="${lang}" mode="${mode}"`);

  const [icp, dmu, abm, outreach, lookalike, successProbability] = await Promise.all([
    generateIcp(ctx, lang, mode, now),
    generateDmu(ctx, lang, mode, now),
    generateAbm(ctx, lang, mode, now),
    generateOutreach(ctx, lang, mode, now),
    generateLookalike(ctx, lang, mode, now),
    generateSuccessProbability(ctx, lang, mode, now),
  ]);

  return { icp, dmu, abm, outreach, lookalike, successProbability };
}

// ── Follow-up questions (unchanged, kept for backward compat) ─────────────────

export async function generateFollowUpQuestions(
  step: number,
  existingAnswers: Record<string, string>,
  language: string
): Promise<string[]> {
  const lang = language === "ar" ? "Arabic" : "English";

  const stepNames: Record<number, string> = {
    0: "Company Identity (name, size, revenue, LinkedIn)",
    1: "Product / Service (type, pricing, deal size, sales cycle)",
    2: "Current Sales Process (lead sources, tools, team)",
    3: "Challenges (top pain points)",
    4: "Target Market (countries, industries, company sizes)",
    5: "ICP Hints (job titles, buying triggers, disqualifiers)",
    6: "Sales Targets (meetings, deals, revenue target)",
    7: "Success Stories (best results, notable clients)",
    8: "Competition & Positioning (competitors, differentiation, value proposition)",
    9: "Outreach Preferences (channels, language, tone, sequences)",
    10: "Company Documents (pitch deck, brochure)",
  };

  const prompt = `You are conducting a GTM strategy interview. The user is on step ${step}: ${stepNames[step] ?? "Unknown step"}.

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
