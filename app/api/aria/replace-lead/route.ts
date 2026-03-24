import { NextRequest, NextResponse } from "next/server";
import { requireAuth, SessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  let session;
  try {
    session = await requireAuth(req);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session as SessionUser).id;
  const { leadId, reason, websiteData } = await req.json();

  if (!leadId) {
    return NextResponse.json({ error: "leadId is required" }, { status: 400 });
  }

  // Save feedback
  await prisma.leadFeedback.create({
    data: {
      leadId,
      userId,
      rating: "bad",
      reason: reason ?? "Not specified",
    },
  });

  // Mark old lead as replaced
  await prisma.crmLead.update({
    where: { id: leadId },
    data: { stage: "Lost", notes: `Replaced — reason: ${reason ?? "Not specified"}` },
  });

  // Collect all bad feedback for this user to avoid repeating mistakes
  const allFeedback = await prisma.leadFeedback.findMany({
    where: { userId, rating: "bad" },
    select: { reason: true },
    take: 20,
  });

  const negativeConstraints = allFeedback
    .map((f) => f.reason)
    .filter(Boolean) as string[];

  // Generate 1 replacement lead
  const genRes = await fetch(
    `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/api/aria/generate-free-leads`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: req.headers.get("cookie") ?? "",
      },
      body: JSON.stringify({ websiteData, count: 1, negativeConstraints }),
    }
  );

  if (!genRes.ok) {
    return NextResponse.json({ error: "Failed to generate replacement lead" }, { status: 500 });
  }

  const data = await genRes.json();
  return NextResponse.json({ success: true, newLead: data.leads?.[0] ?? null });
}
