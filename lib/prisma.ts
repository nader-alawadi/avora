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
    url = `file:${path.resolve(rawUrl.slice("file:".length))}`;
  }

  const adapter = new PrismaLibSql({ url });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new PrismaClient({ adapter } as any);
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

