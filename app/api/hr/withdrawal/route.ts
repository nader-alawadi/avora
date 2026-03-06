import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// ── GET /api/hr/withdrawal ────────────────────────────────────────────────────

export async function GET() {
  let session;
  try {
    session = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.sessionType !== "adminTeam" || !session.adminTeamMemberId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const memberId = session.adminTeamMemberId;

  try {
    const withdrawals = await prisma.withdrawalRequest.findMany({
      where: { adminTeamMemberId: memberId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ withdrawals });
  } catch (err) {
    console.error("[hr/withdrawal GET] error:", err);
    return NextResponse.json({ error: "Failed to load withdrawals" }, { status: 500 });
  }
}

// ── POST /api/hr/withdrawal ───────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let session;
  try {
    session = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.sessionType !== "adminTeam" || !session.adminTeamMemberId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const memberId = session.adminTeamMemberId;

  let body: { amount?: number; accountDetails?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { amount, accountDetails } = body;

  if (typeof amount !== "number" || amount <= 0) {
    return NextResponse.json({ error: "amount must be a positive number" }, { status: 400 });
  }

  if (!accountDetails || typeof accountDetails !== "string" || accountDetails.trim() === "") {
    return NextResponse.json({ error: "accountDetails must be a non-empty string" }, { status: 400 });
  }

  try {
    const withdrawal = await prisma.withdrawalRequest.create({
      data: {
        adminTeamMemberId: memberId,
        amount,
        accountDetails: accountDetails.trim(),
        status: "Pending",
      },
    });

    return NextResponse.json({ withdrawal }, { status: 201 });
  } catch (err) {
    console.error("[hr/withdrawal POST] error:", err);
    return NextResponse.json({ error: "Failed to create withdrawal request" }, { status: 500 });
  }
}
