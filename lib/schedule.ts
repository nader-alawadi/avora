/**
 * Work schedule helpers for Avora HR.
 *
 * Working days: Sunday – Thursday (Friday & Saturday = weekend off)
 * Timezone for all day-boundary logic: Cairo (UTC+2 year-round for simplicity)
 * Work hours: 10:00 – 18:00 Cairo time
 */

// ── Public holidays ────────────────────────────────────────────────────────────

/** Egyptian + Saudi public holidays for 2026 (YYYY-MM-DD, Cairo calendar date). */
export const HOLIDAYS_2026 = new Set<string>([
  "2026-01-07", // Coptic Christmas (Egypt)
  "2026-02-22", // Saudi Founding Day
  "2026-04-25", // Sinai Liberation Day (Egypt)
  "2026-05-01", // Labour Day (Egypt)
  "2026-06-30", // June 30 Revolution (Egypt)
  "2026-07-23", // July 23 Revolution Day (Egypt)
  "2026-09-23", // Saudi National Day
  "2026-10-06", // Armed Forces Day (Egypt)
]);

// ── Day helpers ────────────────────────────────────────────────────────────────

/**
 * Returns true if the given YYYY-MM-DD string is a working day:
 *   - Sunday (0) through Thursday (4) only
 *   - Not a public holiday
 */
export function isWorkingDay(dateStr: string): boolean {
  const d = new Date(`${dateStr}T00:00:00Z`);
  const dow = d.getUTCDay(); // 0=Sun … 6=Sat
  if (dow === 5 || dow === 6) return false; // Friday or Saturday
  if (HOLIDAYS_2026.has(dateStr)) return false;
  return true;
}

/**
 * Count working days (Sun–Thu, excl. holidays) from monthStart through today,
 * both given as YYYY-MM-DD strings.
 */
export function countWorkingDays(monthStart: string, today: string): number {
  const start = new Date(`${monthStart}T00:00:00Z`);
  const end = new Date(`${today}T00:00:00Z`);
  let count = 0;
  const cursor = new Date(start);
  while (cursor <= end) {
    const y = cursor.getUTCFullYear();
    const m = String(cursor.getUTCMonth() + 1).padStart(2, "0");
    const d = String(cursor.getUTCDate()).padStart(2, "0");
    if (isWorkingDay(`${y}-${m}-${d}`)) count++;
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return count;
}

// ── Time helpers ───────────────────────────────────────────────────────────────

/** Cairo offset in minutes (UTC+2 year-round; adjust if DST changes). */
const CAIRO_OFFSET_MIN = 2 * 60;

/** Work start: 10:00 Cairo time = 08:00 UTC → 480 minutes from midnight UTC */
export const WORK_START_UTC_MIN = 8 * 60; // 480

/** Work end: 18:00 Cairo time = 16:00 UTC → 960 minutes from midnight UTC */
export const WORK_END_UTC_MIN = 16 * 60; // 960

/** Returns the Cairo calendar date for a given JS Date as YYYY-MM-DD. */
export function cairoDateStr(date: Date): string {
  const ms = date.getTime() + CAIRO_OFFSET_MIN * 60_000;
  const d = new Date(ms);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

/** Returns true if the given Date is after 18:00 Cairo time. */
export function isAfterWorkEnd(date: Date): boolean {
  const utcMinutes = date.getUTCHours() * 60 + date.getUTCMinutes();
  return utcMinutes >= WORK_END_UTC_MIN;
}
