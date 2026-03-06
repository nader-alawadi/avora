import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createToken } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import { cookies } from "next/headers";

function setAuthCookie(token: string) {
  return {
    name: "avora-token",
    value: token,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    },
  };
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();

    // ── 1. Check regular User ─────────────────────────────────────────────────
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      const valid = await verifyPassword(password, user.password);
      if (!valid) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }

      const token = createToken({ sessionType: "user", userId: user.id });
      const c = setAuthCookie(token);
      cookieStore.set(c.name, c.value, c.options);

      await createAuditLog(user.id, "USER_LOGIN", "User", user.id, { email });

      return NextResponse.json({
        user: {
          id: user.id, email: user.email, name: user.name,
          plan: user.plan, isAdmin: user.isAdmin, language: user.language,
          pdfExportsUsed: user.pdfExportsUsed, sessionType: "user",
        },
      });
    }

    // ── 2. Check AdminTeamMember ──────────────────────────────────────────────
    const adminMember = await prisma.adminTeamMember.findUnique({ where: { email } });
    if (adminMember) {
      if (adminMember.status !== "Active" || !adminMember.password) {
        return NextResponse.json(
          { error: "Invite not yet accepted. Check your invite link." },
          { status: 403 }
        );
      }
      const valid = await verifyPassword(password, adminMember.password);
      if (!valid) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }

      const token = createToken({ sessionType: "adminTeam", adminTeamMemberId: adminMember.id });
      const c = setAuthCookie(token);
      cookieStore.set(c.name, c.value, c.options);

      await prisma.adminTeamMember.update({
        where: { id: adminMember.id },
        data: { lastActive: new Date() },
      });

      return NextResponse.json({
        user: {
          id: adminMember.id, email: adminMember.email, name: adminMember.name,
          plan: "PLUS", isAdmin: true, language: "en", pdfExportsUsed: 0,
          sessionType: "adminTeam",
          adminRole: adminMember.adminRole,
          adminTeamMemberId: adminMember.id,
        },
      });
    }

    // ── 3. Check workspace TeamMember ─────────────────────────────────────────
    const teamMember = await prisma.teamMember.findFirst({
      where: { email },
      include: { workspaceOwner: { select: { plan: true, language: true, pdfExportsUsed: true } } },
    });
    if (teamMember) {
      if (teamMember.status !== "Active" || !teamMember.password) {
        return NextResponse.json(
          { error: "Invite not yet accepted. Check your invite link." },
          { status: 403 }
        );
      }
      const valid = await verifyPassword(password, teamMember.password);
      if (!valid) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }

      const token = createToken({
        sessionType: "teamMember",
        teamMemberId: teamMember.id,
        workspaceOwnerId: teamMember.workspaceOwnerId,
      });
      const c = setAuthCookie(token);
      cookieStore.set(c.name, c.value, c.options);

      await prisma.teamMember.update({
        where: { id: teamMember.id },
        data: { lastActive: new Date() },
      });

      return NextResponse.json({
        user: {
          id: teamMember.workspaceOwnerId, email: teamMember.email, name: teamMember.name,
          plan: teamMember.workspaceOwner.plan, isAdmin: false,
          language: teamMember.workspaceOwner.language,
          pdfExportsUsed: teamMember.workspaceOwner.pdfExportsUsed,
          sessionType: "teamMember", teamRole: teamMember.role,
          teamMemberId: teamMember.id,
        },
      });
    }

    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
