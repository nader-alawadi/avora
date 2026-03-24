import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { requireAnthropicClient } from "@/lib/anthropic-client";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  let session;
  try {
    session = await requireAuth(req);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { url } = await req.json();

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  // Validate URL format
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return NextResponse.json({ error: "URL must start with http:// or https://" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
  }

  // HEAD request to check if URL resolves
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const headRes = await fetch(parsedUrl.toString(), {
      method: "HEAD",
      signal: controller.signal,
      redirect: "follow",
    });
    clearTimeout(timeout);
    if (!headRes.ok && headRes.status !== 405) {
      // 405 = HEAD not allowed, try GET
    }
  } catch {
    return NextResponse.json({ error: "Website unreachable. Please check the URL and try again." }, { status: 422 });
  }

  // Fetch HTML content
  let htmlContent = "";
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    const res = await fetch(parsedUrl.toString(), {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; AVORA-Bot/1.0)",
      },
    });
    clearTimeout(timeout);
    const rawHtml = await res.text();
    // Strip script/style tags and truncate
    htmlContent = rawHtml
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 6000);
  } catch {
    // If we can't fetch content, use just the URL for analysis
    htmlContent = `Website URL: ${parsedUrl.toString()}`;
  }

  // Analyze with Claude
  const anthropic = requireAnthropicClient();
  const prompt = `You are analyzing a company website to extract business information for a B2B sales AI platform.

Website URL: ${parsedUrl.toString()}
Website Content (extracted text):
${htmlContent}

Extract the following information and return as JSON only (no markdown, no explanation):
{
  "companyName": "Company name",
  "industry": "Industry/sector (e.g., SaaS, E-commerce, Healthcare, Finance, etc.)",
  "productDescription": "What they sell or offer (1-2 sentences)",
  "targetMarket": "Who their customers are (1-2 sentences)",
  "valueProposition": "Main value proposition (1 sentence)",
  "language": "Website primary language (ar or en)"
}

If you cannot determine something from the content, make a reasonable inference from the URL and available context. Always return valid JSON.`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type");
    }

    let analysisData;
    try {
      // Extract JSON from response
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON in response");
      analysisData = JSON.parse(jsonMatch[0]);
    } catch {
      analysisData = {
        companyName: parsedUrl.hostname.replace("www.", ""),
        industry: "Technology",
        productDescription: "Business solutions and services",
        targetMarket: "B2B companies",
        valueProposition: "Helping businesses grow",
        language: "en",
      };
    }

    // Save to AriaSession
    const userId = session.id;
    await prisma.ariaSession.upsert({
      where: { userId },
      create: {
        userId,
        websiteUrl: parsedUrl.toString(),
        websiteData: JSON.stringify(analysisData),
      },
      update: {
        websiteUrl: parsedUrl.toString(),
        websiteData: JSON.stringify(analysisData),
      },
    });

    return NextResponse.json({ success: true, data: analysisData });
  } catch (error) {
    console.error("Website analysis error:", error);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
