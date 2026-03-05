import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createToken } from "@/lib/auth";
import { cookies } from "next/headers";

// POST /api/auth/invite/accept
export async function POST(req: NextRequest) {
  try {
    const { token, name, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: "token and password are required" }, { status: 400 });
    }

    const member = await prisma.teamMember.findUnique({
      where: { inviteToken: token },
      include: { workspaceOwner: { select: { plan: true, language: true, pdfExportsUsed: true } } },
    });

    if (!member) {
      return NextResponse.json({ error: "Invalid or expired invite link" }, { status: 400 });
    }
    if (member.status === "Active") {
      return NextResponse.json({ error: "Invite already accepted" }, { status: 409 });
    }
    if (member.inviteTokenExpiry && member.inviteTokenExpiry < new Date()) {
      return NextResponse.json({ error: "Invite link has expired" }, { status: 400 });
    }

    const hashed = await hashPassword(password);

    const updated = await prisma.teamMember.update({
      where: { id: member.id },
      data: {
        name: name || member.name,
        password: hashed,
        status: "Active",
        inviteToken: null,
        inviteTokenExpiry: null,
        lastActive: new Date(),
      },
    });

    // Auto-login after accepting
    const jwtToken = createToken({
      sessionType: "teamMember",
      teamMemberId: updated.id,
      workspaceOwnerId: updated.workspaceOwnerId,
    });
    const cookieStore = await cookies();
    cookieStore.set("avora-token", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return NextResponse.json({ ok: true, role: updated.role });
  } catch (err) {
    console.error("[invite/accept]", err);
    return NextResponse.json({ error: "Failed to accept invite" }, { status: 500 });
  }
}

// GET /api/auth/invite/accept?token=xxx — validate token
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ error: "token required" }, { status: 400 });

  const member = await prisma.teamMember.findUnique({
    where: { inviteToken: token },
    select: { id: true, email: true, name: true, role: true, status: true, inviteTokenExpiry: true,
      workspaceOwner: { select: { email: true } } },
  });

  if (!member) return NextResponse.json({ error: "Invalid invite" }, { status: 400 });
  if (member.status === "Active") return NextResponse.json({ error: "Already accepted" }, { status: 409 });
  if (member.inviteTokenExpiry && member.inviteTokenExpiry < new Date()) {
    return NextResponse.json({ error: "Expired" }, { status: 400 });
  }

  return NextResponse.json({
    member: {
      email: member.email, name: member.name, role: member.role,
      workspaceDomain: member.workspaceOwner.email.split("@")[1],
    },
  });
}
