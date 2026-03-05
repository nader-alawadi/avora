import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// ── Helpers ───────────────────────────────────────────────────────────────────

function getTodayUTC(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function getMonthBoundsUTC(): { monthStart: string; today: string } {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");
  return {
    monthStart: `${year}-${month}-01`,
    today: `${year}-${month}-${day}`,
  };
}

/**
 * Count Mon–Fri days from the first of the current month up to and including today (UTC).
 */
function countWorkingDays(monthStart: string, today: string): number {
  const start = new Date(`${monthStart}T00:00:00Z`);
  const end = new Date(`${today}T00:00:00Z`);
  let count = 0;
  const cursor = new Date(start);
  while (cursor <= end) {
    const dow = cursor.getUTCDay(); // 0=Sun, 6=Sat
    if (dow !== 0 && dow !== 6) count++;
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return count;
}

// ── GET /api/hr/attendance ────────────────────────────────────────────────────

export async function GET() {
  let session;
  try {
    session = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.sessionType !== "adminTeam" || !session.adminTeamMemberId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const memberId = session.adminTeamMemberId;
  const { monthStart, today } = getMonthBoundsUTC();

  try {
    // Fetch today's log and all logs for the current month in parallel
    const [todayLog, monthlyLogs] = await Promise.all([
      prisma.attendanceLog.findUnique({
        where: { adminTeamMemberId_date: { adminTeamMemberId: memberId, date: today } },
      }),
      prisma.attendanceLog.findMany({
        where: {
          adminTeamMemberId: memberId,
          date: { gte: monthStart, lte: today },
        },
        orderBy: { date: "asc" },
      }),
    ]);

    // Build summary
    let present = 0;
    let late = 0;
    let absent = 0;
    for (const log of monthlyLogs) {
      if (log.status === "Present") present++;
      else if (log.status === "Late") late++;
      else absent++;
    }

    const workingDays = countWorkingDays(monthStart, today);
    const attendanceRate =
      workingDays > 0
        ? Math.round(((present + late) / workingDays) * 100)
        : 0;

    return NextResponse.json({
      today: todayLog,
      monthly: monthlyLogs,
      summary: { present, late, absent, workingDays, attendanceRate },
    });
  } catch (err) {
    console.error("[hr/attendance GET] error:", err);
    return NextResponse.json({ error: "Failed to load attendance" }, { status: 500 });
  }
}

// ── POST /api/hr/attendance ───────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let session;
  try {
    session = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.sessionType !== "adminTeam" || !session.adminTeamMemberId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const memberId = session.adminTeamMemberId;

  let body: { action?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { action } = body;
  if (action !== "checkin" && action !== "checkout") {
    return NextResponse.json({ error: "action must be 'checkin' or 'checkout'" }, { status: 400 });
  }

  const today = getTodayUTC();
  const now = new Date();

  try {
    if (action === "checkin") {
      // Late if check-in hour is >= 9 UTC (strictly after 09:00 means minute > 0 when hour == 9,
      // or hour > 9; at exactly 09:00:00 it is "Present").
      const utcHour = now.getUTCHours();
      const utcMinute = now.getUTCMinutes();
      const utcSecond = now.getUTCSeconds();
      const isLate =
        utcHour > 9 || (utcHour === 9 && (utcMinute > 0 || utcSecond > 0));
      const status = isLate ? "Late" : "Present";

      const record = await prisma.attendanceLog.upsert({
        where: { adminTeamMemberId_date: { adminTeamMemberId: memberId, date: today } },
        create: {
          adminTeamMemberId: memberId,
          date: today,
          checkInTime: now,
          status,
        },
        update: {
          checkInTime: now,
          status,
        },
      });

      return NextResponse.json({ record });
    }

    // checkout
    const existing = await prisma.attendanceLog.findUnique({
      where: { adminTeamMemberId_date: { adminTeamMemberId: memberId, date: today } },
    });

    if (!existing || !existing.checkInTime) {
      return NextResponse.json({ error: "No check-in found for today" }, { status: 400 });
    }

    const checkInMs = new Date(existing.checkInTime).getTime();
    const hoursWorked = Math.round(((now.getTime() - checkInMs) / 3_600_000) * 100) / 100;

    const record = await prisma.attendanceLog.update({
      where: { adminTeamMemberId_date: { adminTeamMemberId: memberId, date: today } },
      data: {
        checkOutTime: now,
        hoursWorked,
      },
    });

    return NextResponse.json({ record });
  } catch (err) {
    console.error("[hr/attendance POST] error:", err);
    return NextResponse.json({ error: "Failed to record attendance" }, { status: 500 });
  }
}
