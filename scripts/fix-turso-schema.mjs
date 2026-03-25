#!/usr/bin/env node
/**
 * Add missing columns to existing Turso tables.
 * Uses ALTER TABLE ADD COLUMN which is idempotent-safe (errors on "already exists" are caught).
 */

import { createClient } from "@libsql/client";

const url = process.env.DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;
if (!url || !authToken) { console.error("Set DATABASE_URL and TURSO_AUTH_TOKEN"); process.exit(1); }

const client = createClient({ url, authToken });

// All columns that may be missing from the old schema
const alterStatements = [
  // users table — new columns added after initial deploy
  `ALTER TABLE "users" ADD COLUMN "firstName" TEXT`,
  `ALTER TABLE "users" ADD COLUMN "lastName" TEXT`,
  `ALTER TABLE "users" ADD COLUMN "companyName" TEXT`,
  `ALTER TABLE "users" ADD COLUMN "companyWebsite" TEXT`,
  `ALTER TABLE "users" ADD COLUMN "phone" TEXT`,
  `ALTER TABLE "users" ADD COLUMN "phoneVerified" BOOLEAN NOT NULL DEFAULT false`,
  `ALTER TABLE "users" ADD COLUMN "emailVerified" BOOLEAN NOT NULL DEFAULT false`,
  `ALTER TABLE "users" ADD COLUMN "language" TEXT NOT NULL DEFAULT 'en'`,
  `ALTER TABLE "users" ADD COLUMN "timezone" TEXT NOT NULL DEFAULT 'UTC'`,
  `ALTER TABLE "users" ADD COLUMN "pdfExportsUsed" INTEGER NOT NULL DEFAULT 0`,
  `ALTER TABLE "users" ADD COLUMN "monthlyRegenerateUsed" INTEGER NOT NULL DEFAULT 0`,
  `ALTER TABLE "users" ADD COLUMN "regenerateResetMonth" TEXT NOT NULL DEFAULT ''`,
  `ALTER TABLE "users" ADD COLUMN "extraRegenerateCredits" INTEGER NOT NULL DEFAULT 0`,

  // delivered_leads — dispute fields
  `ALTER TABLE "delivered_leads" ADD COLUMN "disputeReason" TEXT`,
  `ALTER TABLE "delivered_leads" ADD COLUMN "disputeDetails" TEXT`,
  `ALTER TABLE "delivered_leads" ADD COLUMN "disputeFileUrl" TEXT`,
  `ALTER TABLE "delivered_leads" ADD COLUMN "deliveredByAdminId" TEXT`,

  // crm_leads — enrichment fields
  `ALTER TABLE "crm_leads" ADD COLUMN "icpFitScore" INTEGER`,
  `ALTER TABLE "crm_leads" ADD COLUMN "icpFitReason" TEXT`,
  `ALTER TABLE "crm_leads" ADD COLUMN "personalityAnalysis" TEXT`,
  `ALTER TABLE "crm_leads" ADD COLUMN "outreachRecommendation" TEXT`,
  `ALTER TABLE "crm_leads" ADD COLUMN "bestChannel" TEXT`,
  `ALTER TABLE "crm_leads" ADD COLUMN "bestTime" TEXT`,
  `ALTER TABLE "crm_leads" ADD COLUMN "outreachTemplates" TEXT`,
  `ALTER TABLE "crm_leads" ADD COLUMN "source" TEXT`,
  `ALTER TABLE "crm_leads" ADD COLUMN "companyWebsite" TEXT`,
  `ALTER TABLE "crm_leads" ADD COLUMN "employeeCount" TEXT`,
  `ALTER TABLE "crm_leads" ADD COLUMN "industry" TEXT`,

  // lead_disputes — snapshot fields
  `ALTER TABLE "lead_disputes" ADD COLUMN "leadName" TEXT`,
  `ALTER TABLE "lead_disputes" ADD COLUMN "leadTitle" TEXT`,

  // admin_team_members — HR fields
  `ALTER TABLE "admin_team_members" ADD COLUMN "jobTitle" TEXT`,
  `ALTER TABLE "admin_team_members" ADD COLUMN "avatarUrl" TEXT`,
  `ALTER TABLE "admin_team_members" ADD COLUMN "phone" TEXT`,
  `ALTER TABLE "admin_team_members" ADD COLUMN "nationalId" TEXT`,
  `ALTER TABLE "admin_team_members" ADD COLUMN "bankAccount" TEXT`,
  `ALTER TABLE "admin_team_members" ADD COLUMN "eWallet" TEXT`,
  `ALTER TABLE "admin_team_members" ADD COLUMN "baseSalary" REAL`,
  `ALTER TABLE "admin_team_members" ADD COLUMN "dailyLeadTarget" INTEGER NOT NULL DEFAULT 10`,
  `ALTER TABLE "admin_team_members" ADD COLUMN "bonusBalance" REAL NOT NULL DEFAULT 0`,
];

console.log(`Running ${alterStatements.length} ALTER TABLE statements...`);

for (const stmt of alterStatements) {
  const preview = stmt.slice(0, 80);
  try {
    await client.execute(stmt);
    console.log(`  ✓ ${preview}`);
  } catch (err) {
    if (err.message?.includes("duplicate column") || err.message?.includes("already exists")) {
      console.log(`  ⏭ ${preview} (already exists)`);
    } else {
      console.error(`  ✗ ${preview}`);
      console.error(`    ${err.message}`);
    }
  }
}

console.log("\n✓ Schema migration complete!");
client.close();
