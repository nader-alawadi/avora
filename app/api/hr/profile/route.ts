import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// ── GET /api/hr/profile ───────────────────────────────────────────────────────

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
    const member = await prisma.adminTeamMember.findUnique({
      where: { id: memberId },
      select: {
        id: true,
        name: true,
        email: true,
        adminRole: true,
        jobTitle: true,
        phone: true,
        nationalId: true,
        bankAccount: true,
        eWallet: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    return NextResponse.json({ member });
  } catch (err) {
    console.error("[hr/profile GET] error:", err);
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}

// ── PATCH /api/hr/profile ─────────────────────────────────────────────────────

export async function PATCH(req: NextRequest) {
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

  let body: {
    name?: string;
    jobTitle?: string;
    phone?: string;
    nationalId?: string;
    bankAccount?: string;
    eWallet?: string;
    avatarUrl?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Build update data object with only provided fields
  const data: Record<string, string> = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.jobTitle !== undefined) data.jobTitle = body.jobTitle;
  if (body.phone !== undefined) data.phone = body.phone;
  if (body.nationalId !== undefined) data.nationalId = body.nationalId;
  if (body.bankAccount !== undefined) data.bankAccount = body.bankAccount;
  if (body.eWallet !== undefined) data.eWallet = body.eWallet;
  if (body.avatarUrl !== undefined) data.avatarUrl = body.avatarUrl;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No fields provided to update" }, { status: 400 });
  }

  try {
    const member = await prisma.adminTeamMember.update({
      where: { id: memberId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        adminRole: true,
        jobTitle: true,
        phone: true,
        nationalId: true,
        bankAccount: true,
        eWallet: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ member });
  } catch (err) {
    console.error("[hr/profile PATCH] error:", err);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
