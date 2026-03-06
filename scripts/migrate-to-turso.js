#!/usr/bin/env node
/**
 * scripts/migrate-to-turso.js
 *
 * Reads all data from the local SQLite database (prisma/dev.db),
 * creates all tables in Turso (if they don't exist), then copies
 * every row across.
 *
 * Usage:
 *   TURSO_AUTH_TOKEN=<token> node scripts/migrate-to-turso.js
 *
 * Prerequisites:
 *   npm install --save-dev better-sqlite3
 *   (or: npm install better-sqlite3)
 */

"use strict";

const path = require("path");
const Database = require("better-sqlite3");
const { createClient } = require("@libsql/client");

// ── Config ────────────────────────────────────────────────────────────────────

const LOCAL_DB_PATH = path.resolve(__dirname, "../prisma/dev.db");
const TURSO_URL = "libsql://avora-db-nader-alawadi.aws-eu-west-1.turso.io";
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN;
const BATCH_SIZE = 50; // rows per turso batch call

// ── DDL — one CREATE TABLE IF NOT EXISTS per model ───────────────────────────
// Tables listed in FK dependency order so foreign keys are satisfied.

const DDL = [
  // 1. No FKs
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    plan TEXT NOT NULL DEFAULT 'LITE',
    language TEXT NOT NULL DEFAULT 'en',
    timezone TEXT NOT NULL DEFAULT 'UTC',
    pdfExportsUsed INTEGER NOT NULL DEFAULT 0,
    isAdmin INTEGER NOT NULL DEFAULT 0,
    monthlyRegenerateUsed INTEGER NOT NULL DEFAULT 0,
    regenerateResetMonth TEXT NOT NULL DEFAULT '',
    extraRegenerateCredits INTEGER NOT NULL DEFAULT 0,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  )`,

  `CREATE TABLE IF NOT EXISTS admin_team_members (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    password TEXT,
    adminRole TEXT NOT NULL,
    assignedClientIds TEXT NOT NULL DEFAULT '[]',
    status TEXT NOT NULL DEFAULT 'Pending',
    inviteToken TEXT UNIQUE,
    inviteTokenExpiry TEXT,
    lastActive TEXT,
    jobTitle TEXT,
    avatarUrl TEXT,
    phone TEXT,
    nationalId TEXT,
    bankAccount TEXT,
    eWallet TEXT,
    baseSalary REAL,
    dailyLeadTarget INTEGER NOT NULL DEFAULT 10,
    bonusBalance REAL NOT NULL DEFAULT 0,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  )`,

  // 2. FK → users
  `CREATE TABLE IF NOT EXISTS company_profiles (
    id TEXT PRIMARY KEY,
    userId TEXT UNIQUE NOT NULL,
    companyName TEXT,
    websiteUrl TEXT,
    industry TEXT,
    geoTargets TEXT,
    employeeRange TEXT,
    revenueRange TEXT,
    offer TEXT,
    problem TEXT,
    pricingRange TEXT,
    salesCycleRange TEXT,
    toolsStack TEXT,
    notes TEXT,
    updatedAt TEXT NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  )`,

  `CREATE TABLE IF NOT EXISTS onboarding_answers (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    step INTEGER NOT NULL,
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    UNIQUE (userId, step, key),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  )`,

  `CREATE TABLE IF NOT EXISTS generated_reports (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    language TEXT NOT NULL DEFAULT 'en',
    icpJson TEXT,
    dmuJson TEXT,
    abmJson TEXT,
    outreachJson TEXT,
    lookalikeJson TEXT,
    successProbabilityJson TEXT,
    icpConfidence REAL NOT NULL DEFAULT 0,
    dmuConfidence REAL NOT NULL DEFAULT 0,
    strictPassed INTEGER NOT NULL DEFAULT 0,
    version INTEGER NOT NULL DEFAULT 1,
    createdAt TEXT NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  )`,

  `CREATE TABLE IF NOT EXISTS team_members (
    id TEXT PRIMARY KEY,
    workspaceOwnerId TEXT NOT NULL,
    email TEXT NOT NULL,
    name TEXT,
    password TEXT,
    role TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending',
    inviteToken TEXT UNIQUE,
    inviteTokenExpiry TEXT,
    lastActive TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    UNIQUE (workspaceOwnerId, email),
    FOREIGN KEY (workspaceOwnerId) REFERENCES users(id) ON DELETE CASCADE
  )`,

  `CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    userId TEXT,
    action TEXT NOT NULL,
    entity TEXT,
    entityId TEXT,
    details TEXT,
    createdAt TEXT NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id)
  )`,

  `CREATE TABLE IF NOT EXISTS export_packs (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    credits INTEGER NOT NULL DEFAULT 50,
    priceUsd REAL NOT NULL DEFAULT 100,
    status TEXT NOT NULL DEFAULT 'Pending',
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  )`,

  // 3. FK → users + generated_reports
  `CREATE TABLE IF NOT EXISTS lead_orders (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    reportId TEXT,
    leadCountMonthly INTEGER NOT NULL,
    pricePerLead REAL NOT NULL,
    totalPriceUsd REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'Draft',
    deliverySlaBusinessDays INTEGER NOT NULL DEFAULT 7,
    adminNotes TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reportId) REFERENCES generated_reports(id)
  )`,

  // 4. FK → users + lead_orders
  `CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    orderId TEXT,
    type TEXT NOT NULL,
    provider TEXT NOT NULL DEFAULT 'PAYONEER',
    invoiceLink TEXT,
    reference TEXT,
    status TEXT NOT NULL DEFAULT 'Pending',
    amountUsd REAL NOT NULL,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (orderId) REFERENCES lead_orders(id)
  )`,

  // 5. FK → lead_orders + admin_team_members
  `CREATE TABLE IF NOT EXISTS delivered_leads (
    id TEXT PRIMARY KEY,
    orderId TEXT NOT NULL,
    contactId TEXT,
    fullName TEXT,
    roleTitle TEXT,
    linkedinUrl TEXT,
    email TEXT,
    phone TEXT,
    personalityType TEXT,
    personalityAnalysisUrl TEXT,
    companyId TEXT,
    brandName TEXT,
    notes TEXT,
    country TEXT,
    techStacks TEXT,
    seniorityLevel TEXT,
    buyingRole TEXT,
    preferredChannel TEXT,
    isPrimaryContact INTEGER NOT NULL DEFAULT 0,
    whatsappAvailable INTEGER NOT NULL DEFAULT 0,
    deliveryBatch TEXT,
    deliveryDate TEXT,
    status TEXT NOT NULL DEFAULT 'Delivered',
    disputeReason TEXT,
    disputeDetails TEXT,
    disputeFileUrl TEXT,
    deliveredByAdminId TEXT,
    createdAt TEXT NOT NULL,
    FOREIGN KEY (orderId) REFERENCES lead_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (deliveredByAdminId) REFERENCES admin_team_members(id) ON DELETE SET NULL
  )`,

  // 6. FK → users + delivered_leads
  `CREATE TABLE IF NOT EXISTS crm_leads (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    deliveredLeadId TEXT UNIQUE,
    fullName TEXT,
    roleTitle TEXT,
    company TEXT,
    linkedinUrl TEXT,
    email TEXT,
    phone TEXT,
    personalityType TEXT,
    personalityAnalysisUrl TEXT,
    buyingRole TEXT,
    preferredChannel TEXT,
    seniorityLevel TEXT,
    country TEXT,
    techStacks TEXT,
    whatsappAvailable INTEGER NOT NULL DEFAULT 0,
    stage TEXT NOT NULL DEFAULT 'NewLead',
    notes TEXT,
    nextFollowUp TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (deliveredLeadId) REFERENCES delivered_leads(id)
  )`,

  // 7. FK → crm_leads
  `CREATE TABLE IF NOT EXISTS crm_activities (
    id TEXT PRIMARY KEY,
    crmLeadId TEXT NOT NULL,
    type TEXT NOT NULL,
    description TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    FOREIGN KEY (crmLeadId) REFERENCES crm_leads(id) ON DELETE CASCADE
  )`,

  `CREATE TABLE IF NOT EXISTS lead_disputes (
    id TEXT PRIMARY KEY,
    crmLeadId TEXT,
    userId TEXT NOT NULL,
    reason TEXT NOT NULL,
    details TEXT,
    fileUrl TEXT,
    status TEXT NOT NULL DEFAULT 'Pending',
    adminNote TEXT,
    leadName TEXT,
    leadTitle TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    FOREIGN KEY (crmLeadId) REFERENCES crm_leads(id) ON DELETE SET NULL,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  )`,

  // 8. FK → admin_team_members
  `CREATE TABLE IF NOT EXISTS attendance_logs (
    id TEXT PRIMARY KEY,
    adminTeamMemberId TEXT NOT NULL,
    date TEXT NOT NULL,
    checkInTime TEXT,
    checkOutTime TEXT,
    hoursWorked REAL,
    status TEXT NOT NULL DEFAULT 'Absent',
    createdAt TEXT NOT NULL,
    UNIQUE (adminTeamMemberId, date),
    FOREIGN KEY (adminTeamMemberId) REFERENCES admin_team_members(id) ON DELETE CASCADE
  )`,

  `CREATE TABLE IF NOT EXISTS bonus_transactions (
    id TEXT PRIMARY KEY,
    adminTeamMemberId TEXT NOT NULL,
    type TEXT NOT NULL,
    amount REAL NOT NULL,
    leadId TEXT,
    description TEXT,
    createdAt TEXT NOT NULL,
    FOREIGN KEY (adminTeamMemberId) REFERENCES admin_team_members(id) ON DELETE CASCADE
  )`,

  `CREATE TABLE IF NOT EXISTS withdrawal_requests (
    id TEXT PRIMARY KEY,
    adminTeamMemberId TEXT NOT NULL,
    amount REAL NOT NULL,
    accountDetails TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending',
    adminNote TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    FOREIGN KEY (adminTeamMemberId) REFERENCES admin_team_members(id) ON DELETE CASCADE
  )`,
];

// Tables in the same FK-safe order used for DDL above
const TABLES = [
  "users",
  "admin_team_members",
  "company_profiles",
  "onboarding_answers",
  "generated_reports",
  "team_members",
  "audit_logs",
  "export_packs",
  "lead_orders",
  "payments",
  "delivered_leads",
  "crm_leads",
  "crm_activities",
  "lead_disputes",
  "attendance_logs",
  "bonus_transactions",
  "withdrawal_requests",
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function chunk(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

async function copyTable(localDb, turso, table) {
  const rows = localDb.prepare(`SELECT * FROM "${table}"`).all();

  if (rows.length === 0) {
    console.log(`  ${table}: 0 rows — skipping`);
    return;
  }

  const cols = Object.keys(rows[0]);
  const placeholders = cols.map((_, i) => `?${i + 1}`).join(", ");
  const sql = `INSERT OR IGNORE INTO "${table}" (${cols.map((c) => `"${c}"`).join(", ")}) VALUES (${placeholders})`;

  let inserted = 0;
  for (const batch of chunk(rows, BATCH_SIZE)) {
    await turso.batch(
      batch.map((row) => ({
        sql,
        args: cols.map((c) => {
          const v = row[c];
          // better-sqlite3 returns booleans as 0/1 integers — libsql accepts them as-is.
          // Dates stored as TEXT in SQLite come through as strings — fine.
          return v === undefined ? null : v;
        }),
      })),
      "write"
    );
    inserted += batch.length;
  }

  console.log(`  ${table}: ${inserted} row(s) copied`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  if (!TURSO_AUTH_TOKEN) {
    console.error("ERROR: TURSO_AUTH_TOKEN environment variable is not set.");
    console.error("Usage: TURSO_AUTH_TOKEN=<token> node scripts/migrate-to-turso.js");
    process.exit(1);
  }

  console.log("Opening local database:", LOCAL_DB_PATH);
  const localDb = new Database(LOCAL_DB_PATH, { readonly: true });

  console.log("Connecting to Turso:", TURSO_URL);
  const turso = createClient({
    url: TURSO_URL,
    authToken: TURSO_AUTH_TOKEN,
  });

  // Enable FK enforcement for this session
  await turso.execute("PRAGMA foreign_keys = OFF");

  console.log("\n── Creating tables in Turso ──────────────────────────────────");
  for (const ddl of DDL) {
    // Extract table name for logging
    const match = ddl.match(/CREATE TABLE IF NOT EXISTS (\w+)/);
    const tableName = match ? match[1] : "?";
    await turso.execute(ddl);
    console.log(`  ✓ ${tableName}`);
  }

  console.log("\n── Copying data ──────────────────────────────────────────────");
  for (const table of TABLES) {
    // Check the table actually exists in the local DB (safe guard)
    const exists = localDb
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?")
      .get(table);

    if (!exists) {
      console.log(`  ${table}: not found in local DB — skipping`);
      continue;
    }

    await copyTable(localDb, turso, table);
  }

  // Re-enable FK enforcement
  await turso.execute("PRAGMA foreign_keys = ON");

  localDb.close();
  console.log("\n✅ Migration complete.");
}

main().catch((err) => {
  console.error("\n❌ Migration failed:", err);
  process.exit(1);
});
