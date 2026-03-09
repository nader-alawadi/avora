import { NextRequest, NextResponse } from "next/server";
import { requireAuth, SessionUser } from "@/lib/auth";
import { requireAnthropicClient } from "@/lib/anthropic-client";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  let session;
  try {
    session = await requireAuth(req);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session as SessionUser).id;

  const { websiteData, count = 5, negativeConstraints = [] } = await req.json();

  if (!websiteData) {
    return NextResponse.json({ error: "websiteData is required" }, { status: 400 });
  }

  const anthropic = requireAnthropicClient();

  const negativeNote = negativeConstraints.length > 0
    ? `\n\nIMPORTANT — Avoid leads that match these criteria (from previous feedback):\n${negativeConstraints.join("\n")}`
    : "";

  const prompt = `You are a B2B sales intelligence AI. Generate ${count} highly realistic qualified leads for this company:

Company Analysis:
${JSON.stringify(websiteData, null, 2)}
${negativeNote}

Generate ${count} leads. Each lead should be a realistic decision maker at a company that would benefit from this product/service.

Return ONLY valid JSON array (no markdown, no explanation):
[
  {
    "companyName": "Real-sounding company name",
    "companyWebsite": "https://example.com",
    "industry": "Industry sector",
    "employeeCount": "50-200",
    "decisionMakerName": "Full Name",
    "decisionMakerTitle": "Job Title (e.g., CEO, VP Sales, Head of Marketing)",
    "decisionMakerLinkedIn": "https://linkedin.com/in/username",
    "email": "firstname.lastname@company.com",
    "phone": "+1-555-0100",
    "country": "Country name",
    "icpFitScore": 85,
    "icpFitReason": "Why this is a good fit (1-2 sentences)",
    "personalityAnalysis": "Communication style and personality traits (2-3 sentences)",
    "outreachRecommendation": "Best approach for this specific lead (1-2 sentences)",
    "bestChannel": "LinkedIn|Email|WhatsApp|Cold Call",
    "bestTime": "e.g., Tuesday-Thursday morning",
    "outreachTemplates": {
      "linkedin": "Personalized LinkedIn message (2-3 sentences)",
      "email": "Subject: ...\n\nEmail body (3-4 sentences)",
      "whatsapp": "WhatsApp message (2-3 sentences)",
      "coldCall": "Cold call opener script (2-3 sentences)"
    }
  }
]

Make the leads realistic and varied in company size, location, and fit score. Ensure icpFitScore reflects actual fit (don't make all leads 95+). Use realistic names and companies.`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type");
    }

    let leadsData: Record<string, unknown>[];
    try {
      const jsonMatch = content.text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error("No JSON array in response");
      leadsData = JSON.parse(jsonMatch[0]);
    } catch {
      throw new Error("Failed to parse leads JSON");
    }

    // Save leads to CRM
    const savedLeads = await Promise.all(
      leadsData.map(async (lead: Record<string, unknown>) => {
        const crmLead = await prisma.crmLead.create({
          data: {
            userId,
            fullName: lead.decisionMakerName as string ?? null,
            roleTitle: lead.decisionMakerTitle as string ?? null,
            company: lead.companyName as string ?? null,
            companyWebsite: lead.companyWebsite as string ?? null,
            linkedinUrl: lead.decisionMakerLinkedIn as string ?? null,
            email: lead.email as string ?? null,
            phone: lead.phone as string ?? null,
            country: lead.country as string ?? null,
            employeeCount: lead.employeeCount as string ?? null,
            industry: lead.industry as string ?? null,
            icpFitScore: typeof lead.icpFitScore === "number" ? lead.icpFitScore : null,
            icpFitReason: lead.icpFitReason as string ?? null,
            personalityAnalysis: lead.personalityAnalysis as string ?? null,
            outreachRecommendation: lead.outreachRecommendation as string ?? null,
            bestChannel: lead.bestChannel as string ?? null,
            bestTime: lead.bestTime as string ?? null,
            outreachTemplates: JSON.stringify(lead.outreachTemplates ?? {}),
            source: "ARIA_FREE_GIFT",
            stage: "NewLead",
          },
        });
        return { ...crmLead, outreachTemplates: lead.outreachTemplates };
      })
    );

    return NextResponse.json({ success: true, leads: savedLeads });
  } catch (error) {
    console.error("Generate leads error:", error);
    return NextResponse.json({ error: "Failed to generate leads" }, { status: 500 });
  }
}
