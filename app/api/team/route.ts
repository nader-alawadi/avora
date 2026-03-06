import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { randomBytes } from "crypto";

const ROLES = ["Admin", "SalesRep", "Viewer"] as const;
const FREE_MEMBER_LIMIT = 2;

function getWorkspaceOwnerId(session: { id: string; sessionType: string; workspaceOwnerId?: string }): string {
  return session.sessionType === "teamMember" && session.workspaceOwnerId
    ? session.workspaceOwnerId
    : session.id;
}

// GET /api/team — list workspace team members
export async function GET() {
  try {
    const session = await requireAuth();
    // Only the workspace owner (or Admin team member) can manage the team
    if (session.sessionType === "teamMember" && session.teamRole !== "Admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const ownerId = getWorkspaceOwnerId(session);

    const members = await prisma.teamMember.findMany({
      where: { workspaceOwnerId: ownerId },
      orderBy: { createdAt: "asc" },
      select: {
        id: true, email: true, name: true, role: true,
        status: true, lastActive: true, inviteToken: true, createdAt: true,
      },
    });

    const owner = await prisma.user.findUnique({
      where: { id: ownerId },
      select: { email: true, name: true },
    });

    return NextResponse.json({ members, owner });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

// POST /api/team — invite a workspace team member
export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    if (session.sessionType === "teamMember" && session.teamRole !== "Admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const ownerId = getWorkspaceOwnerId(session);
    const { email, role } = await req.json();

    if (!email || !role) {
      return NextResponse.json({ error: "email and role are required" }, { status: 400 });
    }
    if (!ROLES.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Validate same business domain
    const ownerEmail = session.sessionType === "teamMember"
      ? (await prisma.user.findUnique({ where: { id: ownerId }, select: { email: true } }))?.email ?? ""
      : session.email;
    const ownerDomain = ownerEmail.split("@")[1];
    const inviteeDomain = email.split("@")[1];
    if (!ownerDomain || ownerDomain !== inviteeDomain) {
      return NextResponse.json(
        { error: `Team members must use the same business domain (@${ownerDomain})` },
        { status: 400 }
      );
    }

    // Check free member limit
    const existingCount = await prisma.teamMember.count({
      where: { workspaceOwnerId: ownerId, status: { not: "Revoked" } },
    });
    const isPaid = existingCount >= FREE_MEMBER_LIMIT;

    // Check if already exists
    const existing = await prisma.teamMember.findUnique({
      where: { workspaceOwnerId_email: { workspaceOwnerId: ownerId, email } },
    });
    if (existing) {
      return NextResponse.json({ error: "This email has already been invited" }, { status: 409 });
    }

    const inviteToken = randomBytes(32).toString("hex");
    const inviteTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const member = await prisma.teamMember.create({
      data: { workspaceOwnerId: ownerId, email, role, inviteToken, inviteTokenExpiry, status: "Pending" },
    });

    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/invite?token=${inviteToken}`;

    return NextResponse.json({ member, inviteUrl, isPaid });
  } catch (err) {
    console.error("[team POST]", err);
    return NextResponse.json({ error: "Failed to invite member" }, { status: 500 });
  }
}

// PATCH /api/team — update a team member's role
export async function PATCH(req: NextRequest) {
  try {
    const session = await requireAuth();
    if (session.sessionType === "teamMember" && session.teamRole !== "Admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const ownerId = getWorkspaceOwnerId(session);
    const { id, role } = await req.json();

    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const member = await prisma.teamMember.findUnique({ where: { id } });
    if (!member || member.workspaceOwnerId !== ownerId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const data: Record<string, unknown> = {};
    if (role && ROLES.includes(role)) data.role = role;

    const updated = await prisma.teamMember.update({ where: { id }, data });
    return NextResponse.json({ member: updated });
  } catch {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

// DELETE /api/team — revoke a team member
export async function DELETE(req: NextRequest) {
  try {
    const session = await requireAuth();
    if (session.sessionType === "teamMember" && session.teamRole !== "Admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const ownerId = getWorkspaceOwnerId(session);
    const { id } = await req.json();

    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const member = await prisma.teamMember.findUnique({ where: { id } });
    if (!member || member.workspaceOwnerId !== ownerId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.teamMember.update({ where: { id }, data: { status: "Revoked" } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to revoke" }, { status: 500 });
  }
}
