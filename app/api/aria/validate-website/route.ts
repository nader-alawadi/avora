import { NextRequest, NextResponse } from "next/server";

const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com","yahoo.com","hotmail.com","outlook.com","icloud.com",
  "live.com","msn.com","aol.com","mail.com","protonmail.com",
  "ymail.com","yahoo.co.uk","googlemail.com","me.com",
]);

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ valid: false, reason: "URL is required" }, { status: 400 });
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url.startsWith("http") ? url : `https://${url}`);
    } catch {
      return NextResponse.json({ valid: false, reason: "Invalid URL format" });
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return NextResponse.json({ valid: false, reason: "URL must use http or https" });
    }

    // Try to fetch the website
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(parsedUrl.toString(), {
        method: "GET",
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; AvoraBot/1.0)",
        },
        redirect: "follow",
      });
      clearTimeout(timeout);

      if (!response.ok && response.status >= 400) {
        return NextResponse.json({
          valid: false,
          reason: "This website appears to be unreachable or returning errors.",
        });
      }

      const html = await response.text();

      // Check for parking page indicators
      const parkingKeywords = [
        "domain for sale", "this domain is for sale", "buy this domain",
        "parked domain", "godaddy.com/offers", "sedoparking", "domainpark",
        "coming soon", "under construction",
      ];
      const lowerHtml = html.toLowerCase();
      const isParkingPage = parkingKeywords.some((kw) => lowerHtml.includes(kw));

      if (isParkingPage && html.length < 5000) {
        return NextResponse.json({
          valid: false,
          reason: "This domain doesn't seem to have an active website yet.",
        });
      }

      // Extract basic company info from meta tags
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);

      const companyData = {
        name: titleMatch?.[1]?.trim().split(/[|\-–]/)[0]?.trim() || parsedUrl.hostname,
        description: descMatch?.[1]?.trim() || "",
        domain: parsedUrl.hostname.replace("www.", ""),
      };

      return NextResponse.json({ valid: true, companyData });
    } catch (fetchError: unknown) {
      clearTimeout(timeout);
      const isAbort = fetchError instanceof Error && fetchError.name === "AbortError";
      return NextResponse.json({
        valid: false,
        reason: isAbort
          ? "The website took too long to respond. Please check the URL."
          : "I couldn't reach that website. Please check the URL and try again.",
      });
    }
  } catch (error) {
    console.error("Validate website error:", error);
    return NextResponse.json({ valid: false, reason: "Validation failed" }, { status: 500 });
  }
}

export { FREE_EMAIL_DOMAINS };
