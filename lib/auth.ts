import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { sign, verify } from "jsonwebtoken";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "avora-secret";

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  plan: string;
  isAdmin: boolean;
  language: string;
  pdfExportsUsed: number;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function createToken(user: SessionUser): string {
  return sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
}

export async function getSession(req?: NextRequest): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("avora-token")?.value;
    if (!token) return null;

    const decoded = verify(token, JWT_SECRET) as { userId: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        isAdmin: true,
        language: true,
        pdfExportsUsed: true,
      },
    });

    return user as SessionUser | null;
  } catch {
    return null;
  }
}

export async function requireAuth(req?: NextRequest): Promise<SessionUser> {
  const session = await getSession(req);
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function requireAdmin(): Promise<SessionUser> {
  const session = await requireAuth();
  if (!session.isAdmin) {
    throw new Error("Forbidden");
  }
  return session;
}
