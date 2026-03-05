import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { sign, verify } from "jsonwebtoken";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "avora-secret";

// ── Session types ─────────────────────────────────────────────────────────────

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  plan: string;
  isAdmin: boolean;
  language: string;
  pdfExportsUsed: number;

  // Discriminated session type
  sessionType: "user" | "teamMember" | "adminTeam";

  // teamMember-only fields
  workspaceOwnerId?: string; // actual workspace owner User.id
  teamRole?: string;         // "Admin" | "SalesRep" | "Viewer"
  teamMemberId?: string;     // TeamMember.id

  // adminTeam-only fields
  adminRole?: string;           // "SuperAdmin" | "AccountManager" | "LeadResearcher"
  adminTeamMemberId?: string;   // AdminTeamMember.id
  assignedClientIds?: string[]; // User IDs this AM is assigned to
}

// ── JWT payloads ──────────────────────────────────────────────────────────────

type JWTPayload =
  | { sessionType: "user";        userId: string }
  | { sessionType: "teamMember";  teamMemberId: string; workspaceOwnerId: string }
  | { sessionType: "adminTeam";   adminTeamMemberId: string };

// ── Helpers ───────────────────────────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function createToken(payload: JWTPayload): string {
  return sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

// ── Session resolution ────────────────────────────────────────────────────────

export async function getSession(_req?: NextRequest): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("avora-token")?.value;
    if (!token) return null;

    const decoded = verify(token, JWT_SECRET) as JWTPayload & { userId?: string };

    // Back-compat: old JWTs have `userId` without `sessionType`
    const sessionType = decoded.sessionType ?? "user";

    if (sessionType === "user") {
      const uid = (decoded as { userId?: string; sessionType?: string }).userId
               ?? (decoded as { userId: string }).userId;
      const user = await prisma.user.findUnique({
        where: { id: uid },
        select: {
          id: true, email: true, name: true, plan: true,
          isAdmin: true, language: true, pdfExportsUsed: true,
        },
      });
      if (!user) return null;
      return { ...user, sessionType: "user" };
    }

    if (sessionType === "teamMember") {
      const p = decoded as { teamMemberId: string; workspaceOwnerId: string };
      const member = await prisma.teamMember.findUnique({
        where: { id: p.teamMemberId },
        include: { workspaceOwner: { select: { plan: true, language: true, pdfExportsUsed: true } } },
      });
      if (!member || member.status !== "Active") return null;

      await prisma.teamMember.update({
        where: { id: member.id },
        data: { lastActive: new Date() },
      });

      return {
        id: member.workspaceOwnerId, // API routes use this as the data owner
        email: member.email,
        name: member.name,
        plan: member.workspaceOwner.plan,
        isAdmin: false,
        language: member.workspaceOwner.language,
        pdfExportsUsed: member.workspaceOwner.pdfExportsUsed,
        sessionType: "teamMember",
        workspaceOwnerId: member.workspaceOwnerId,
        teamRole: member.role,
        teamMemberId: member.id,
      };
    }

    if (sessionType === "adminTeam") {
      const p = decoded as { adminTeamMemberId: string };
      const member = await prisma.adminTeamMember.findUnique({
        where: { id: p.adminTeamMemberId },
      });
      if (!member || member.status !== "Active") return null;

      await prisma.adminTeamMember.update({
        where: { id: member.id },
        data: { lastActive: new Date() },
      });

      let assignedClientIds: string[] = [];
      try { assignedClientIds = JSON.parse(member.assignedClientIds); } catch { /* */ }

      return {
        id: member.id,
        email: member.email,
        name: member.name,
        plan: "PLUS",
        isAdmin: true, // gives access to /admin redirect
        language: "en",
        pdfExportsUsed: 0,
        sessionType: "adminTeam",
        adminRole: member.adminRole,
        adminTeamMemberId: member.id,
        assignedClientIds,
      };
    }

    return null;
  } catch {
    return null;
  }
}

// ── Auth guards ───────────────────────────────────────────────────────────────

export async function requireAuth(_req?: NextRequest): Promise<SessionUser> {
  const session = await getSession(_req);
  if (!session) throw new Error("Unauthorized");
  return session;
}

export async function requireAdmin(): Promise<SessionUser> {
  const session = await requireAuth();
  // Super admin (isAdmin User) or any AdminTeamMember
  if (!session.isAdmin) throw new Error("Forbidden");
  return session;
}

// Require full super-admin (not restricted team role)
export async function requireSuperAdmin(): Promise<SessionUser> {
  const session = await requireAdmin();
  if (session.sessionType === "adminTeam" && session.adminRole !== "SuperAdmin") {
    throw new Error("Forbidden");
  }
  return session;
}

// Check if an AdminTeamMember has access to a specific client
export function canAccessClient(session: SessionUser, clientUserId: string): boolean {
  if (session.sessionType !== "adminTeam") return true; // regular admin sees all
  if (session.adminRole === "SuperAdmin") return true;
  return (session.assignedClientIds ?? []).includes(clientUserId);
}
