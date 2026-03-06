import path from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const rawUrl =
    process.env.DATABASE_URL ||
    "libsql://avora-db-nader-alawadi.aws-eu-west-1.turso.io";

  const authToken =
    process.env.TURSO_AUTH_TOKEN ||
    "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzI3NjM5NzMsImlkIjoiMDE5Y2MwZjYtNzYwMS03NWFlLWFjYTEtNGQwOTQxYjhmZDNlIiwicmlkIjoiOTNhNWZkYzUtNjhiNC00MTc3LTk2NzEtMDIwMTg2ZmY0NDlhIn0.kIjHZELh0b4wsI82nsbaTobhmSw5DN8x4f89TMEqAD6GqICrDldludT3xgFJAxeSCArT-qcE313F0JTPL77GCw";

  // For local file: URLs, @libsql/client needs an absolute path to avoid CWD
  // ambiguity inside Next.js route handlers. Convert relative → absolute.
  let url = rawUrl;
  if (rawUrl.startsWith("file:") && !rawUrl.startsWith("file:/")) {
    const relativePath = rawUrl.replace(/^file:(\.\/)?/, "");
    const absolutePath = path.resolve(relativePath);
    // Normalise Windows backslashes → forward slashes so drive letter (e.g. C:)
    // is not mistaken for a URL scheme by libsql.
    const normalizedPath = absolutePath.replace(/\\/g, "/");
    url = `file:///${normalizedPath}`;
  }

  console.log("[prisma] DATABASE_URL env:", process.env.DATABASE_URL);
  console.log("[prisma] Final URL passed to PrismaLibSql:", url);

  // Pass authToken only for remote URLs; local file connections don't need it.
  const config = url.startsWith("file:") ? { url } : { url, authToken };
  const adapter = new PrismaLibSql(config);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new PrismaClient({ adapter } as any);
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
