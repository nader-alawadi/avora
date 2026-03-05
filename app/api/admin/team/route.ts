import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin, hashPassword } from "@/lib/auth";
import { randomBytes } from "crypto";

const ADMIN_ROLES = ["SuperAdmin", "AccountManager", "LeadResearcher"] as const;

// GET /api/admin/team — list all admin team members
export async function GET() {
  try {
    await requireSuperAdmin();

    const members = await prisma.adminTeamMember.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true, email: true, name: true, adminRole: true,
        assignedClientIds: true, status: true, lastActive: true,
        inviteToken: true, createdAt: true,
      },
    });

    // Annotate each member with their assigned client count
    const enriched = members.map((m) => {
      let assignedClientIds: string[] = [];
      try { assignedClientIds = JSON.parse(m.assignedClientIds); } catch { /* */ }
      return { ...m, assignedClientIds };
    });

    return NextResponse.json({ members: enriched });
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}

// POST /api/admin/team — invite a new admin team member
export async function POST(req: NextRequest) {
  try {
    await requireSuperAdmin();

    const { email, name, adminRole } = await req.json();

    if (!email || !adminRole) {
      return NextResponse.json({ error: "email and adminRole are required" }, { status: 400 });
    }
    if (!ADMIN_ROLES.includes(adminRole)) {
      return NextResponse.json({ error: "Invalid adminRole" }, { status: 400 });
    }

    const existing = await prisma.adminTeamMember.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already invited" }, { status: 409 });
    }

    const inviteToken = randomBytes(32).toString("hex");
    const inviteTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const member = await prisma.adminTeamMember.create({
      data: { email, name, adminRole, inviteToken, inviteTokenExpiry, status: "Pending" },
    });

    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/admin-invite?token=${inviteToken}`;

    return NextResponse.json({ member, inviteUrl });
  } catch (err) {
    console.error("[admin/team POST]", err);
    return NextResponse.json({ error: "Failed to invite member" }, { status: 500 });
  }
}

// PATCH /api/admin/team — update role or assigned clients
export async function PATCH(req: NextRequest) {
  try {
    await requireSuperAdmin();

    const { id, adminRole, assignedClientIds } = await req.json();
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const data: Record<string, unknown> = {};
    if (adminRole && ADMIN_ROLES.includes(adminRole)) data.adminRole = adminRole;
    if (Array.isArray(assignedClientIds)) data.assignedClientIds = JSON.stringify(assignedClientIds);

    const updated = await prisma.adminTeamMember.update({ where: { id }, data });
    return NextResponse.json({ member: updated });
  } catch {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

// DELETE /api/admin/team — remove a team member
export async function DELETE(req: NextRequest) {
  try {
    await requireSuperAdmin();

    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    await prisma.adminTeamMember.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}

// Suppress unused import warning
void hashPassword;
