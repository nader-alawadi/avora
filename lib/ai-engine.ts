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

const SYSTEM_PROMPT = `You are AVORA, a Senior GTM Strategist AI for Enigma Sales.
You specialize in B2B go-to-market strategy, ICP definition, DMU mapping, and outreach playbooks.
You are analytical, precise, and data-driven. You NEVER fabricate data or make unfounded assumptions.
Always respond in the user's specified language (English or Arabic).
Your outputs are structured, actionable, and tailored to the specific business context provided.`;

export async function generateReports(
  context: OnboardingContext,
  mode: "balanced" | "strict"
) {
  const lang = context.language === "ar" ? "Arabic" : "English";

  const prompt = `Generate a comprehensive GTM strategy report in ${lang} for the following business.

BUSINESS CONTEXT:
- Company: ${context.companyName}
- Industry: ${context.industry}
- What they sell: ${context.offer}
- Problem they solve: ${context.problem}
- Pricing range: ${context.pricingRange}
- Sales cycle: ${context.salesCycleRange}
- Target geographies: ${context.geoTargets}
- ICP hypothesis: ${context.icpHypothesis}
- Employee range: ${context.employeeRange}
- Revenue range: ${context.revenueRange}

CUSTOMER EVIDENCE:
- Best customer 1: ${context.bestCustomer1}
- Best customer 2: ${context.bestCustomer2}
- Lost deal: ${context.lostDeal}

VALUE PROPOSITION:
- Why we win: ${context.whyWeWin}
- Competitors/Alternatives: ${context.competitors}
- Differentiation: ${context.differentiation}

ICP CONSTRAINTS:
- Disqualifiers: ${context.disqualifiers}

DMU:
- Economic buyer: ${context.economicBuyer}
- Champion: ${context.champion}
- Technical buyer: ${context.technicalBuyer}
- End user: ${context.endUser}
- Influencer: ${context.influencer}
- Common objections: ${context.objections}
- Typical titles: ${context.titles}

CHANNELS & PROCESS:
- Current channels: ${context.currentChannels}
- Team size: ${context.teamSize}
- Tools: ${context.tools}
- Capacity: ${context.capacity}

Mode: ${mode === "strict" ? "STRICT (full analysis required)" : "BALANCED (preliminary analysis with warnings)"}

Return a JSON object with these exact keys:
{
  "icp": {
    "title": "...",
    "firmographics": { "industries": [], "companySize": "", "revenue": "", "geography": [], "techStack": [] },
    "psychographics": { "challenges": [], "motivations": [], "priorities": [] },
    "triggers": [],
    "qualifiers": [],
    "disqualifiers": [],
    "summary": "...",
    "warnings": []
  },
  "dmu": {
    "title": "...",
    "roles": [
      {
        "role": "Economic Buyer",
        "typicalTitles": [],
        "concerns": [],
        "messagingAngle": "",
        "decisionWeight": ""
      }
    ],
    "buyingProcess": "",
    "keyObjections": [],
    "summary": "..."
  },
  "abm": {
    "title": "...",
    "tiers": [
      { "tier": "Tier 1 - Strategic", "criteria": [], "accountCount": "", "approach": "" },
      { "tier": "Tier 2 - Growth", "criteria": [], "accountCount": "", "approach": "" },
      { "tier": "Tier 3 - Scale", "criteria": [], "accountCount": "", "approach": "" }
    ],
    "prioritizationFramework": "",
    "kpis": [],
    "summary": "..."
  },
  "outreach": {
    "title": "...",
    "channels": [
      {
        "channel": "LinkedIn",
        "strategy": "",
        "cadence": "",
        "messagingFramework": { "hook": "", "value": "", "cta": "" },
        "templates": []
      },
      {
        "channel": "Email",
        "strategy": "",
        "cadence": "",
        "messagingFramework": { "hook": "", "value": "", "cta": "" },
        "templates": []
      },
      {
        "channel": "WhatsApp",
        "strategy": "",
        "cadence": "",
        "messagingFramework": { "hook": "", "value": "", "cta": "" },
        "templates": []
      }
    ],
    "sequenceOverview": "",
    "summary": "..."
  },
  "lookalike": {
    "title": "...",
    "criteria": [
      { "category": "", "criteria": [], "rationale": "" }
    ],
    "searchQueries": {
      "linkedin": [],
      "google": [],
      "crunchbase": []
    },
    "booleanStrings": [],
    "summary": "...",
    "disclaimer": "These are search criteria only. No specific companies or personal contacts are provided."
  }
}

Important: Return ONLY valid JSON, no markdown code blocks.`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 8000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: prompt }],
  });

  const content = response.content[0];
  if (content.type !== "text") throw new Error("Unexpected response type");

  const jsonText = content.text.trim();
  return JSON.parse(jsonText);
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

Generate 2-3 specific follow-up questions in ${lang} to help deepen the analysis and improve confidence score.
Focus on gaps or areas needing more specificity.
Return ONLY a JSON array of question strings, no explanations.`;

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 500,
    messages: [{ role: "user", content: prompt }],
  });

  const content = response.content[0];
  if (content.type !== "text") return [];

  try {
    return JSON.parse(content.text.trim());
  } catch {
    return [];
  }
}
