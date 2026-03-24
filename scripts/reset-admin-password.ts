/**
 * reset-admin-password.ts
 * ─────────────────────────────────────────────────────────────
 * Run locally to create or reset the admin account credentials.
 *
 * Usage (from the project root):
 *   npx tsx scripts/reset-admin-password.ts
 *
 * Or with custom email / password:
 *   ADMIN_EMAIL=me@example.com ADMIN_PASSWORD=MyPass123 npx tsx scripts/reset-admin-password.ts
 *
 * After running, sign in at http://localhost:3000/login with
 * the credentials printed below.
 */

import bcrypt from "bcryptjs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

/* ── Read env vars (same logic as lib/prisma.ts) ─────────────── */
const rawUrl =
  process.env.DATABASE_URL ||
  "libsql://avora-db-nader-alawadi.aws-eu-west-1.turso.io";

function buildAdapter() {
  if (rawUrl.startsWith("file:")) {
    let localUrl = rawUrl;
    if (!rawUrl.startsWith("file:/")) {
      const rel = rawUrl.replace(/^file:(\.\/)?/, "");
      localUrl = `file:${path.resolve(process.cwd(), rel)}`;
    }
    console.log("📁 Database:", localUrl);
    return new PrismaLibSql({ url: localUrl });
  }
  const authToken =
    process.env.TURSO_AUTH_TOKEN ||
    "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzI3NjM5NzMsImlkIjoiMDE5Y2MwZjYtNzYwMS03NWFlLWFjYTEtNGQwOTQxYjhmZDNlIiwicmlkIjoiOTNhNWZkYzUtNjhiNC00MTc3LTk2NzEtMDIwMTg2ZmY0NDlhIn0.kIjHZELh0b4wsI82nsbaTobhmSw5DN8x4f89TMEqAD6GqICrDldludT3xgFJAxeSCArT-qcE313F0JTPL77GCw";
  console.log("☁️  Database:", rawUrl.slice(0, 55));
  return new PrismaLibSql({ url: rawUrl, authToken });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new PrismaClient({ adapter: buildAdapter() } as any);

const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    || "nader@enigmasales.io";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "ChangeMe123!";

async function main() {
  console.log("\n🔑  AVORA — Admin Password Reset\n");

  const hashed = await bcrypt.hash(ADMIN_PASSWORD, 12);

  const existing = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });

  if (existing) {
    await prisma.user.update({
      where: { email: ADMIN_EMAIL },
      data: { password: hashed, isAdmin: true },
    });
    console.log(`✅  Updated password for: ${ADMIN_EMAIL}`);
  } else {
    await prisma.user.create({
      data: {
        email: ADMIN_EMAIL,
        name:  "Admin",
        password: hashed,
        isAdmin:  true,
        plan:     "PRO",
      },
    });
    // Ensure a companyProfile row exists
    try {
      const user = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
      if (user) {
        await prisma.companyProfile.upsert({
          where:  { userId: user.id },
          create: { userId: user.id },
          update: {},
        });
      }
    } catch { /* table may not exist yet — ignore */ }
    console.log(`✅  Created admin account: ${ADMIN_EMAIL}`);
  }

  /* Also list all existing accounts so you know what's in the DB */
  const allUsers = await prisma.user.findMany({
    select: { email: true, name: true, isAdmin: true, plan: true },
    orderBy: { createdAt: "desc" },
  });

  console.log(`\n📋  All accounts in database (${allUsers.length}):`);
  allUsers.forEach((u) =>
    console.log(`   ${u.isAdmin ? "👑" : "👤"} ${u.email}  (${u.plan})`),
  );

  console.log("\n─────────────────────────────────────────────");
  console.log("  Sign in at: http://localhost:3000/login");
  console.log(`  Email   :  ${ADMIN_EMAIL}`);
  console.log(`  Password:  ${ADMIN_PASSWORD}`);
  console.log("─────────────────────────────────────────────\n");
}

main()
  .catch((e) => { console.error("❌ Error:", e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
