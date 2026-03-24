#!/bin/bash
set -euo pipefail

# Only run in Claude Code remote (web) sessions
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

echo '{"async": true, "asyncTimeout": 300000}'

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-/home/user/avora}"
cd "$PROJECT_DIR"

# ── 1. Install dependencies if needed ────────────────────────────────────────
if [ ! -d "node_modules" ] || [ ! -f "node_modules/.package-lock.json" ]; then
  echo "[session-start] Installing npm dependencies..."
  npm install
else
  echo "[session-start] node_modules OK, skipping install"
fi

# ── 2. Generate Prisma client if needed ──────────────────────────────────────
echo "[session-start] Generating Prisma client..."
npx prisma generate 2>/dev/null || true

# ── 3. Run DB migrations on local SQLite ─────────────────────────────────────
echo "[session-start] Running DB migrations..."
npx prisma migrate deploy 2>/dev/null || true

# ── 4. Start Next.js dev server ──────────────────────────────────────────────
# Kill any existing Next.js process first
pkill -f "next dev" 2>/dev/null || true
sleep 1

echo "[session-start] Starting Next.js dev server on port 3000..."
nohup npm run dev > /tmp/nextjs.log 2>&1 &
echo "[session-start] Next.js started (PID: $!)"

# Wait until server is ready (max 30s)
for i in $(seq 1 30); do
  if curl -s --max-time 2 http://localhost:3000 > /dev/null 2>&1; then
    echo "[session-start] Server ready on port 3000"
    break
  fi
  sleep 1
done
