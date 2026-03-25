#!/usr/bin/env node
/**
 * Push the Prisma migration SQL to the remote Turso database.
 * Uses CREATE TABLE IF NOT EXISTS so it's safe to re-run.
 *
 * Usage:
 *   DATABASE_URL="libsql://..." TURSO_AUTH_TOKEN="..." node scripts/push-schema-to-turso.mjs
 */

import { createClient } from "@libsql/client";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const url = process.env.DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("ERROR: DATABASE_URL and TURSO_AUTH_TOKEN must be set");
  process.exit(1);
}

const client = createClient({ url, authToken });

// Read the migration SQL
const migrationPath = resolve(__dirname, "../prisma/migrations/20260309183640_init/migration.sql");
let sql = readFileSync(migrationPath, "utf-8");

// Make all CREATE TABLE idempotent
sql = sql.replace(/CREATE TABLE /g, "CREATE TABLE IF NOT EXISTS ");
// Make all CREATE UNIQUE INDEX idempotent
sql = sql.replace(/CREATE UNIQUE INDEX /g, "CREATE UNIQUE INDEX IF NOT EXISTS ");
sql = sql.replace(/CREATE INDEX /g, "CREATE INDEX IF NOT EXISTS ");

// Remove comment-only lines, then split into individual statements
const cleaned = sql.replace(/^--.*$/gm, "");
const statements = cleaned
  .split(";")
  .map((s) => s.trim())
  .filter((s) => s.length > 0);

console.log(`Pushing ${statements.length} statements to Turso...`);

for (const stmt of statements) {
  const preview = stmt.slice(0, 80).replace(/\n/g, " ");
  try {
    await client.execute(stmt);
    console.log(`  ✓ ${preview}...`);
  } catch (err) {
    // "already exists" errors are fine
    if (err.message?.includes("already exists")) {
      console.log(`  ⏭ ${preview}... (already exists)`);
    } else {
      console.error(`  ✗ ${preview}...`);
      console.error(`    ${err.message}`);
    }
  }
}

console.log("\n✓ Schema push complete!");
client.close();
