import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/auth";
import { randomBytes } from "crypto";

const ADMIN_ROLES = ["SuperAdmin", "AccountManager", "LeadResearcher"];

// GET /api/admin/team — list all admin team members
export async function GET() {
  let session;
  try {
    session = await requireSuperAdmin();
  } catch (err) {
    console.error("[admin/team GET] auth failed:", err);
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  console.log("[admin/team GET] session:", session.email, session.sessionType, session.adminRole);

  try {
    const members = await prisma.adminTeamMember.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true, email: true, name: true, adminRole: true,
        assignedClientIds: true, status: true, lastActive: true,
        inviteToken: true, createdAt: true,
      },
    });

    const enriched = members.map((m) => {
      let assignedClientIds: string[] = [];
      try { assignedClientIds = JSON.parse(m.assignedClientIds); } catch { /* */ }
      return { ...m, assignedClientIds };
    });

    console.log("[admin/team GET] found", enriched.length, "members");
    return NextResponse.json({ members: enriched });
  } catch (err) {
    console.error("[admin/team GET] db error:", err);
    return NextResponse.json({ error: "Failed to load team" }, { status: 500 });
  }
}

// POST /api/admin/team — invite a new admin team member
export async function POST(req: NextRequest) {
  // Auth check — separate try-catch so auth failures return 403, not 500
  try {
    await requireSuperAdmin();
  } catch (err) {
    console.error("[admin/team POST] auth failed:", err);
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    console.log("[admin/team POST] body:", JSON.stringify(body));

    const { email, name, adminRole } = body as { email?: string; name?: string; adminRole?: string };

    if (!email || !adminRole) {
      return NextResponse.json({ error: "email and adminRole are required" }, { status: 400 });
    }
    if (!ADMIN_ROLES.includes(adminRole)) {
      return NextResponse.json({ error: `Invalid adminRole: ${adminRole}` }, { status: 400 });
    }

    const existing = await prisma.adminTeamMember.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already invited" }, { status: 409 });
    }

    const inviteToken = randomBytes(32).toString("hex");
    const inviteTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const member = await prisma.adminTeamMember.create({
      data: {
        email,
        name: name || null,
        adminRole,
        inviteToken,
        inviteTokenExpiry,
        status: "Pending",
      },
    });

    console.log("[admin/team POST] created member:", member.id, member.email);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const inviteUrl = `${appUrl}/admin-invite?token=${inviteToken}`;

    return NextResponse.json({ member, inviteUrl });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[admin/team POST] error:", msg, err);
    return NextResponse.json({ error: `Failed to invite member: ${msg}` }, { status: 500 });
  }
}

// PATCH /api/admin/team — update role or assigned clients
export async function PATCH(req: NextRequest) {
  try {
    await requireSuperAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id, adminRole, assignedClientIds } = await req.json();
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const data: Record<string, unknown> = {};
    if (adminRole && ADMIN_ROLES.includes(adminRole)) data.adminRole = adminRole;
    if (Array.isArray(assignedClientIds)) data.assignedClientIds = JSON.stringify(assignedClientIds);

    const updated = await prisma.adminTeamMember.update({ where: { id }, data });
    return NextResponse.json({ member: updated });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[admin/team PATCH] error:", msg);
    return NextResponse.json({ error: `Failed to update: ${msg}` }, { status: 500 });
  }
}

// DELETE /api/admin/team — remove a team member
export async function DELETE(req: NextRequest) {
  try {
    await requireSuperAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    await prisma.adminTeamMember.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[admin/team DELETE] error:", msg);
    return NextResponse.json({ error: `Failed to delete: ${msg}` }, { status: 500 });
  }
}
