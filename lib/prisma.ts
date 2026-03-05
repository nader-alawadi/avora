import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const libsqlClient = createClient({
    url: process.env.DATABASE_URL || "file:./prisma/dev.db",
  });
  const adapter = new PrismaLibSql(libsqlClient);
  return new PrismaClient({ adapter } as any); // eslint-disable-line @typescript-eslint/no-explicit-any
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

