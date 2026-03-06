import path from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const rawUrl =
    process.env.DATABASE_URL ||
    "libsql://avora-db-nader-alawadi.aws-eu-west-1.turso.io";

  // ── Local SQLite file ────────────────────────────────────────────────────
  // Convert relative file: URL → absolute so Next.js route handlers (which
  // may run in a different CWD) always find the same file.
  if (rawUrl.startsWith("file:")) {
    // Already absolute (file:/ or file:///) — use as-is.
    // Relative (file:./...) — resolve against project root.
    let localUrl = rawUrl;
    if (!rawUrl.startsWith("file:/")) {
      const relativePath = rawUrl.replace(/^file:(\.\/)?/, "");
      const absolutePath = path.resolve(process.cwd(), relativePath);
      localUrl = `file:${absolutePath}`;
    }
    console.log("[prisma] local SQLite:", localUrl);
    const adapter = new PrismaLibSql({ url: localUrl });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new PrismaClient({ adapter } as any);
  }

  // ── Remote Turso / libsql ─────────────────────────────────────────────────
  const authToken =
    process.env.TURSO_AUTH_TOKEN ||
    "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzI3NjM5NzMsImlkIjoiMDE5Y2MwZjYtNzYwMS03NWFlLWFjYTEtNGQwOTQxYjhmZDNlIiwicmlkIjoiOTNhNWZkYzUtNjhiNC00MTc3LTk2NzEtMDIwMTg2ZmY0NDlhIn0.kIjHZELh0b4wsI82nsbaTobhmSw5DN8x4f89TMEqAD6GqICrDldludT3xgFJAxeSCArT-qcE313F0JTPL77GCw";

  console.log("[prisma] remote Turso:", rawUrl.slice(0, 50));
  const adapter = new PrismaLibSql({ url: rawUrl, authToken });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new PrismaClient({ adapter } as any);
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
