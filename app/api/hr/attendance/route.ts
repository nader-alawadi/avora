import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { countWorkingDays, isAfterWorkEnd } from "@/lib/schedule";

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

    // Build summary — Holiday/Weekend rows do not count against attendance
    let present = 0;
    let late = 0;
    let absent = 0;
    for (const log of monthlyLogs) {
      if (log.status === "Present") present++;
      else if (log.status === "Late") late++;
      else if (log.status !== "Holiday" && log.status !== "Weekend") absent++;
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
      // Status is set to "Present" on check-in.
      // Final status (Present vs Late) is evaluated at checkout based on:
      //   whether the daily lead target was met before 18:00 Cairo time.
      const record = await prisma.attendanceLog.upsert({
        where: { adminTeamMemberId_date: { adminTeamMemberId: memberId, date: today } },
        create: {
          adminTeamMemberId: memberId,
          date: today,
          checkInTime: now,
          status: "Present",
        },
        update: {
          checkInTime: now,
          status: "Present",
        },
      });

      return NextResponse.json({ record });
    }

    // ── checkout ────────────────────────────────────────────────────────────
    const existing = await prisma.attendanceLog.findUnique({
      where: { adminTeamMemberId_date: { adminTeamMemberId: memberId, date: today } },
    });

    if (!existing || !existing.checkInTime) {
      return NextResponse.json({ error: "No check-in found for today" }, { status: 400 });
    }

    const checkInMs = new Date(existing.checkInTime).getTime();
    const hoursWorked = Math.round(((now.getTime() - checkInMs) / 3_600_000) * 100) / 100;

    // Determine final status:
    //   Late = checkout is after 18:00 Cairo AND daily lead target was NOT completed
    //   Present = anything else
    let finalStatus = "Present";

    if (isAfterWorkEnd(now)) {
      // Count leads delivered today by this member (deliveredByAdminId = memberId)
      const todayStart = new Date(`${today}T00:00:00Z`);
      const tomorrowStart = new Date(`${today}T00:00:00Z`);
      tomorrowStart.setUTCDate(tomorrowStart.getUTCDate() + 1);

      const [memberRecord, leadsToday] = await Promise.all([
        prisma.adminTeamMember.findUnique({
          where: { id: memberId },
          select: { dailyLeadTarget: true },
        }),
        prisma.deliveredLead.count({
          where: {
            deliveredByAdminId: memberId,
            deliveryDate: { gte: todayStart, lt: tomorrowStart },
            status: { not: "Staged" },
          },
        }),
      ]);

      const target = memberRecord?.dailyLeadTarget ?? 10;
      if (leadsToday < target) {
        finalStatus = "Late";
      }
    }

    const record = await prisma.attendanceLog.update({
      where: { adminTeamMemberId_date: { adminTeamMemberId: memberId, date: today } },
      data: {
        checkOutTime: now,
        hoursWorked,
        status: finalStatus,
      },
    });

    return NextResponse.json({ record });
  } catch (err) {
    console.error("[hr/attendance POST] error:", err);
    return NextResponse.json({ error: "Failed to record attendance" }, { status: 500 });
  }
}
