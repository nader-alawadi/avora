import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { countWorkingDays } from "@/lib/schedule";

// ── Helpers ───────────────────────────────────────────────────────────────────

function getUTCBounds() {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth(); // 0-based
  const day = now.getUTCDate();

  const monthStart = new Date(Date.UTC(year, month, 1));
  const todayStart = new Date(Date.UTC(year, month, day));
  const tomorrowStart = new Date(Date.UTC(year, month, day + 1));

  // YYYY-MM-DD string for the current month's first day
  const monthStartStr = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  // Today's date string
  const todayStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  return { now, year, month, day, monthStart, todayStart, tomorrowStart, monthStartStr, todayStr };
}

function computeBonus(qualified: number, rejected: number): number {
  return qualified * 50 - rejected * 25;
}

// ── GET /api/hr/performance ───────────────────────────────────────────────────

export async function GET() {
  let session;
  try {
    session = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.sessionType !== "adminTeam") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // session.id === adminTeamMember.id for adminTeam sessions (see auth.ts)
  const memberId = session.id;
  const { monthStart, todayStart, tomorrowStart, monthStartStr, todayStr } = getUTCBounds();

  try {
    // Fetch all data in parallel
    const [
      thisMonthLeads,
      todayLeads,
      allTimeLeads,
      approvedWithdrawals,
      memberRecord,
      attendanceLogs,
    ] = await Promise.all([
      // This month's delivered leads (excl. Staged)
      prisma.deliveredLead.findMany({
        where: {
          deliveredByAdminId: memberId,
          deliveryDate: { gte: monthStart },
          status: { not: "Staged" },
        },
        include: {
          order: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                  companyProfile: { select: { companyName: true } },
                },
              },
            },
          },
        },
      }),

      // Today's delivered leads (excl. Staged)
      prisma.deliveredLead.count({
        where: {
          deliveredByAdminId: memberId,
          deliveryDate: { gte: todayStart, lt: tomorrowStart },
          status: { not: "Staged" },
        },
      }),

      // All-time delivered leads (excl. Staged) — just count + statuses needed
      prisma.deliveredLead.findMany({
        where: {
          deliveredByAdminId: memberId,
          status: { not: "Staged" },
        },
        select: { status: true },
      }),

      // Approved withdrawals
      prisma.withdrawalRequest.aggregate({
        where: { adminTeamMemberId: memberId, status: "Approved" },
        _sum: { amount: true },
      }),

      // Member record for dailyLeadTarget
      prisma.adminTeamMember.findUnique({
        where: { id: memberId },
        select: { dailyLeadTarget: true },
      }),

      // Attendance logs for current month
      prisma.attendanceLog.findMany({
        where: {
          adminTeamMemberId: memberId,
          date: { gte: monthStartStr, lte: todayStr },
        },
      }),
    ]);

    // ── thisMonth ────────────────────────────────────────────────────────────

    const thisMonthQualified = thisMonthLeads.filter(
      (l: any) => l.status !== "Disputed"
    ).length;
    const thisMonthRejected = thisMonthLeads.filter(
      (l: any) => l.status === "Disputed"
    ).length;
    const thisMonthTotal = thisMonthLeads.length;
    const thisMonthGrossBonus = computeBonus(thisMonthQualified, thisMonthRejected);

    // Attendance rate for current month
    const workingDays = countWorkingDays(monthStartStr, todayStr);
    const presentCount = attendanceLogs.filter(
      (l: any) => l.status === "Present" || l.status === "Late"
    ).length;
    const attendanceRate =
      workingDays > 0 ? Math.round((presentCount / workingDays) * 100) : 0;

    // ── allTime ──────────────────────────────────────────────────────────────

    const allTimeQualified = allTimeLeads.filter((l: any) => l.status !== "Disputed").length;
    const allTimeRejected = allTimeLeads.filter((l: any) => l.status === "Disputed").length;
    const allTimeGrossBonus = computeBonus(allTimeQualified, allTimeRejected);
    const totalWithdrawn = approvedWithdrawals._sum.amount ?? 0;
    const availableBalance = allTimeGrossBonus - totalWithdrawn;

    // ── performanceLog ───────────────────────────────────────────────────────
    // Group this month's leads by (date string, orderId)

    type GroupKey = string; // `${dateStr}::${orderId}`
    interface Group {
      date: string;
      orderId: string;
      clientName: string;
      delivered: number;
      qualified: number;
      rejected: number;
    }

    const groupMap = new Map<GroupKey, Group>();

    for (const lead of thisMonthLeads) {
      // Use deliveryDate if present, otherwise createdAt
      const rawDate = lead.deliveryDate ?? lead.createdAt;
      const dateStr = new Date(rawDate).toISOString().slice(0, 10);
      const key: GroupKey = `${dateStr}::${lead.orderId}`;

      if (!groupMap.has(key)) {
        const user = lead.order?.user;
        const clientName =
          user?.companyProfile?.companyName ?? user?.name ?? user?.email ?? "";

        groupMap.set(key, {
          date: dateStr,
          orderId: lead.orderId,
          clientName,
          delivered: 0,
          qualified: 0,
          rejected: 0,
        });
      }

      const group = groupMap.get(key)!;
      group.delivered++;
      if (lead.status === "Disputed") {
        group.rejected++;
      } else {
        group.qualified++;
      }
    }

    const performanceLog = Array.from(groupMap.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((g: any) => ({
        ...g,
        bonusEarned: computeBonus(g.qualified, g.rejected),
      }));

    return NextResponse.json({
      thisMonth: {
        totalDelivered: thisMonthTotal,
        qualified: thisMonthQualified,
        rejected: thisMonthRejected,
        grossBonus: thisMonthGrossBonus,
        attendanceRate,
      },
      today: {
        delivered: todayLeads,
        target: memberRecord?.dailyLeadTarget ?? 10,
      },
      allTime: {
        availableBalance,
        grossBonus: allTimeGrossBonus,
        totalWithdrawn,
      },
      performanceLog,
    });
  } catch (err) {
    console.error("[hr/performance GET] error:", err);
    return NextResponse.json({ error: "Failed to load performance data" }, { status: 500 });
  }
}
