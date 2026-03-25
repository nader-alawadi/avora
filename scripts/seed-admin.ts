import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import bcrypt from "bcryptjs";

const url = process.env.DATABASE_URL || "file:./prisma/dev.db";
const adapter = new PrismaLibSql({
  url,
  ...(url.startsWith("libsql://") && process.env.TURSO_AUTH_TOKEN
    ? { authToken: process.env.TURSO_AUTH_TOKEN }
    : {}),
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new PrismaClient({ adapter } as any);

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "nader@enigmasales.io";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "ChangeMe123!";

async function main() {
  const existing = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });

  if (existing) {
    await prisma.user.update({
      where: { email: ADMIN_EMAIL },
      data: { isAdmin: true },
    });
    console.log(`✓ Set isAdmin=true for existing user: ${ADMIN_EMAIL}`);
  } else {
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);
    await prisma.user.create({
      data: {
        email: ADMIN_EMAIL,
        name: "Nader Alawadi",
        password: hashedPassword,
        plan: "PRO",
        isAdmin: true,
      },
    });
    console.log(`✓ Created admin user: ${ADMIN_EMAIL} (password: ${ADMIN_PASSWORD})`);
    console.log("  ⚠ Change the password after first login.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
