import path from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const rawUrl = process.env.DATABASE_URL || "file:./prisma/dev.db";

  // PrismaLibSql (a factory) calls @libsql/client's createClient({ url }) internally.
  // For local file: URLs, @libsql/client needs an absolute path to avoid CWD
  // ambiguity inside Next.js route handlers. Convert relative → absolute.
  let url = rawUrl;
  if (rawUrl.startsWith("file:") && !rawUrl.startsWith("file:/")) {
    const relativePath = rawUrl.replace(/^file:(\.\/)?/, "");
    const absolutePath = path.resolve(relativePath);
    // Normalise Windows backslashes → forward slashes, then use file:/// so the
    // drive letter (e.g. C:) is not mistaken for a URL scheme by libsql.
    const normalizedPath = absolutePath.replace(/\\/g, "/");
    url = `file:///${normalizedPath}`;
  }

  const adapter = new PrismaLibSql({ url });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new PrismaClient({ adapter } as any);
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

