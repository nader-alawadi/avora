import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createToken } from "@/lib/auth";
import { cookies } from "next/headers";

// POST /api/auth/admin-invite/accept
export async function POST(req: NextRequest) {
  try {
    const { token, name, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: "token and password are required" }, { status: 400 });
    }

    const member = await prisma.adminTeamMember.findUnique({ where: { inviteToken: token } });

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

    const updated = await prisma.adminTeamMember.update({
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
    const token_ = createToken({ sessionType: "adminTeam", adminTeamMemberId: updated.id });
    const cookieStore = await cookies();
    cookieStore.set("avora-token", token_, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return NextResponse.json({ ok: true, adminRole: updated.adminRole });
  } catch (err) {
    console.error("[admin-invite/accept]", err);
    return NextResponse.json({ error: "Failed to accept invite" }, { status: 500 });
  }
}

// GET /api/auth/admin-invite/accept?token=xxx — validate token (no password needed)
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ error: "token required" }, { status: 400 });

  const member = await prisma.adminTeamMember.findUnique({
    where: { inviteToken: token },
    select: { id: true, email: true, name: true, adminRole: true, status: true, inviteTokenExpiry: true },
  });

  if (!member) return NextResponse.json({ error: "Invalid invite" }, { status: 400 });
  if (member.status === "Active") return NextResponse.json({ error: "Already accepted" }, { status: 409 });
  if (member.inviteTokenExpiry && member.inviteTokenExpiry < new Date()) {
    return NextResponse.json({ error: "Expired" }, { status: 400 });
  }

  return NextResponse.json({ member: { email: member.email, name: member.name, adminRole: member.adminRole } });
}
