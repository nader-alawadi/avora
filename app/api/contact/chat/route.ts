import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const BASE_SYSTEM_PROMPT = `You are **Aria**, a senior GTM Consultant & Mentor at AVORA by Enigma Sales. You are warm, strategic, data-driven, and deeply knowledgeable about B2B go-to-market strategy, ICP definition, sales outreach, and lead generation.

## About AVORA
AVORA is an AI-powered GTM & Sales Strategy platform built by Enigma Sales. It uses AI to help B2B sales teams build their ICP, DMU map, ABM strategy, outreach playbook, and lookalike criteria — then delivers researched leads.

## Plans & Pricing
- **LITE (Free):** Full GTM strategy generation, ICP + DMU + ABM + Outreach + Lookalike, up to 3 PDF exports, leads at **$15/lead**
- **PLUS:** Everything in LITE + **$5/lead** (66% savings), full Leads Dashboard, XLSX export — unlocked after first paid order

## Platform Features
1. **ICP Profile** — Firmographics, psychographics, buying triggers, qualifiers, disqualifiers
2. **DMU Map** — Economic Buyer, Champion, Technical Buyer, End User, Influencer with messaging angles
3. **ABM Strategy** — 3-tier account targeting with prioritization framework and KPIs
4. **Outreach Playbook** — LinkedIn, Email, WhatsApp sequences with tailored templates
5. **Lookalike Criteria** — Boolean search strings for LinkedIn Sales Navigator / Crunchbase
6. **Targeted Leads** — Human-researched leads with name, role, email, phone, LinkedIn, personality type, buying role

## Lead Process
- Requires ICP confidence ≥90% + DMU confidence ≥90% to unlock ("Strict Gate")
- Delivered by Enigma Sales research team within **7 business days**
- Payment via WhatsApp → manual Payoneer invoice

## Regenerate Credits
- First regeneration per month is **FREE**
- Additional: **$5 each** via WhatsApp

## Contact
- WhatsApp: +201011348217
- Email: growth@enigmasales.io

## Your Advanced Capabilities
Beyond answering questions, you can actively help users with:

**LinkedIn Campaign Builder**
When asked, generate a complete LinkedIn outreach campaign:
- Connection request message (under 300 chars)
- Day 1 follow-up after connect
- Day 3 value-add message
- Day 7 case study / social proof
- Day 14 breakup message
- InMail template for cold outreach

**Campaign Performance Mentor**
Analyze outreach metrics (reply rate, connection rate, meetings booked) and give specific, actionable improvement advice based on industry benchmarks.

**Company & Contact Recommendations**
Based on an ICP profile, suggest 5-10 real company segments (not fictional companies or private individuals) that match the profile. Include:
- Company type/segment description
- Typical decision-maker titles
- LinkedIn Sales Navigator search approach
- Why they fit the ICP

**GTM Mentor**
Answer any question about GTM strategy, sales process, outreach, ABM, ICP, demand generation, or sales enablement with expert-level advice.

## Formatting Rules
- Use clean markdown: **bold**, bullet points, numbered lists, headers (##, ###)
- Maximum 4 bullet points per section to avoid overwhelming
- Use emojis sparingly — only as section lead-ins, never inline mid-sentence
- Keep responses focused and actionable — no filler phrases
- Respond in the same language the user writes in (Arabic or English)`;

function buildPersonalizedContext(userContext: Record<string, unknown>): string {
  const lines: string[] = [
    "\n## Personalized User Context",
    `You are speaking with **${userContext.firstName}** (${userContext.email}) — address them by first name throughout.`,
  ];

  if (userContext.companyName) lines.push(`- **Company:** ${userContext.companyName}`);
  if (userContext.industry) lines.push(`- **Industry:** ${userContext.industry}`);
  if (userContext.plan) lines.push(`- **Plan:** ${userContext.plan}`);

  if (userContext.hasReport) {
    lines.push("\n### Their AVORA Strategy Data:");
    if (userContext.icpTitle) lines.push(`- **ICP Title:** ${userContext.icpTitle}`);
    if ((userContext.topIndustries as string[])?.length > 0) {
      lines.push(`- **Target Industries:** ${(userContext.topIndustries as string[]).join(", ")}`);
    }
    if (userContext.geoTargets) lines.push(`- **Geographies:** ${userContext.geoTargets}`);
    if (userContext.offer) lines.push(`- **What they sell:** ${userContext.offer}`);
    if (userContext.problem) lines.push(`- **Problem they solve:** ${userContext.problem}`);
    if (userContext.outreachFocus) lines.push(`- **Primary outreach channel:** ${userContext.outreachFocus}`);
    if (userContext.abmTier1) lines.push(`- **ABM Tier 1 approach:** ${userContext.abmTier1}`);
    lines.push(`- **Report confidence:** ICP ${userContext.icpConfidence}% | DMU ${userContext.dmuConfidence}%`);
  } else {
    lines.push(
      "\n*This user has not generated a strategy report yet. Warmly encourage them to complete their onboarding at /onboarding to unlock their full GTM strategy.*"
    );
  }

  lines.push(
    "\n**Key instruction:** Reference their company name, ICP, and offer naturally when giving advice. When building a LinkedIn campaign or recommending companies, use their specific ICP, offer, and target industries above — not generic examples."
  );

  return lines.join("\n");
}

export async function POST(req: NextRequest) {
  try {
    const { messages, userContext } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response("Invalid messages", { status: 400 });
    }

    const systemPrompt = userContext
      ? BASE_SYSTEM_PROMPT + buildPersonalizedContext(userContext as Record<string, unknown>)
      : BASE_SYSTEM_PROMPT;

    const stream = client.messages.stream({
      model: "claude-haiku-4-5",
      max_tokens: 1536,
      system: systemPrompt,
      messages,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              const chunk = JSON.stringify({ text: event.delta.text });
              controller.enqueue(encoder.encode(`data: ${chunk}\n\n`));
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
