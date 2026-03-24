/**
 * Creates / updates the super-admin user.
 * Run with:  node scripts/seed-admin.mjs
 */
import { createRequire } from "module";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

const require = createRequire(import.meta.url);
const bcrypt   = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const { PrismaLibSql } = require("@prisma/adapter-libsql");

// ── Connect (mirrors lib/prisma.ts logic) ────────────────────────────────────
const rawUrl = process.env.DATABASE_URL || "libsql://avora-db-nader-alawadi.aws-eu-west-1.turso.io";
let adapter;
if (rawUrl.startsWith("file:")) {
  const relativePath = rawUrl.replace(/^file:(\.\/)?/, "");
  const absolutePath = path.resolve(process.cwd(), relativePath);
  adapter = new PrismaLibSql({ url: `file:${absolutePath}` });
} else {
  const authToken =
    process.env.TURSO_AUTH_TOKEN ||
    "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzI3NjM5NzMsImlkIjoiMDE5Y2MwZjYtNzYwMS03NWFlLWFjYTEtNGQwOTQxYjhmZDNlIiwicmlkIjoiOTNhNWZkYzUtNjhiNC00MTc3LTk2NzEtMDIwMTg2ZmY0NDlhIn0.kIjHZELh0b4wsI82nsbaTobhmSw5DN8x4f89TMEqAD6GqICrDldludT3xgFJAxeSCArT-qcE313F0JTPL77GCw";
  adapter = new PrismaLibSql({ url: rawUrl, authToken });
}

const prisma = new PrismaClient({ adapter });

// ── Admin credentials ────────────────────────────────────────────────────────
const ADMIN_EMAIL    = "nader@enigmasales.io";
const ADMIN_PASSWORD = "Admin123!";
const ADMIN_NAME     = "Nader Al-Awadi";

async function main() {
  const hash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  const user = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { password: hash, isAdmin: true, plan: "PLUS", name: ADMIN_NAME },
    create: {
      id:       "admin-nader-enigma",
      email:    ADMIN_EMAIL,
      password: hash,
      name:     ADMIN_NAME,
      plan:     "PLUS",
      isAdmin:  true,
      language: "ar",
    },
  });

  console.log("✅ Admin user upserted:");
  console.log("   id      :", user.id);
  console.log("   email   :", user.email);
  console.log("   name    :", user.name);
  console.log("   isAdmin :", user.isAdmin);
  console.log("   plan    :", user.plan);
  console.log("");
  console.log("Login: ", ADMIN_EMAIL, "  /  ", ADMIN_PASSWORD);
}

main().catch((e) => { console.error("❌ Error:", e); process.exit(1); })
      .finally(() => prisma.$disconnect());
