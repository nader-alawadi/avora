import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL || "file:./prisma/dev.db",
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new PrismaClient({ adapter } as any);

const email = process.argv[2] || process.env.TARGET_EMAIL;

async function main() {
  if (!email) {
    console.error("Usage: npm run reset:pdf -- <email>");
    console.error("   or: TARGET_EMAIL=user@example.com npm run reset:pdf");
    process.exit(1);
  }

  const result = await prisma.user.updateMany({
    where: { email },
    data: { pdfExportsUsed: 0 },
  });

  if (result.count === 0) {
    console.error(`No user found with email: ${email}`);
    process.exit(1);
  }

  console.log(`✓ Reset pdfExportsUsed to 0 for: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
