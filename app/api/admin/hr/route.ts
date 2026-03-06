import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { countWorkingDays } from "@/lib/schedule";

// ── Helpers ───────────────────────────────────────────────────────────────────

function getMonthBoundsUTC(): { monthStart: Date; monthStartStr: string; todayStr: string } {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const day = now.getUTCDate();

  const monthStart = new Date(Date.UTC(year, month, 1));
  const monthStartStr = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const todayStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  return { monthStart, monthStartStr, todayStr };
}

function computeBonus(qualified: number, rejected: number): number {
  return qualified * 50 - rejected * 25;
}

// ── GET /api/admin/hr ─────────────────────────────────────────────────────────

export async function GET() {
  let session;
  try {
    session = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (session.sessionType !== "adminTeam" || session.adminRole !== "SuperAdmin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { monthStart, monthStartStr, todayStr } = getMonthBoundsUTC();
  const workingDays = countWorkingDays(monthStartStr, todayStr);

  try {
    const [activeMembers, pendingWithdrawals] = await Promise.all([
      prisma.adminTeamMember.findMany({
        where: { status: "Active" },
        select: {
          id: true,
          name: true,
          email: true,
          adminRole: true,
          jobTitle: true,
          avatarUrl: true,
          baseSalary: true,
          dailyLeadTarget: true,
          bonusBalance: true,
          createdAt: true,
        },
        orderBy: { createdAt: "asc" },
      }),

      prisma.withdrawalRequest.findMany({
        where: { status: "Pending" },
        orderBy: { createdAt: "desc" },
        include: {
          adminTeamMember: {
            select: { id: true, name: true, email: true, adminRole: true },
          },
        },
      }),
    ]);

    // Enrich each active member with performance + attendance data
    const employees = await Promise.all(
      activeMembers.map(async (member: any) => {
        const [thisMonthLeads, allTimeLeads, approvedWithdrawals, attendanceLogs] =
          await Promise.all([
            // This month delivered leads (excl. Staged)
            prisma.deliveredLead.findMany({
              where: {
                deliveredByAdminId: member.id,
                deliveryDate: { gte: monthStart },
                status: { not: "Staged" },
              },
              select: { status: true },
            }),

            // All-time delivered leads (excl. Staged)
            prisma.deliveredLead.findMany({
              where: {
                deliveredByAdminId: member.id,
                status: { not: "Staged" },
              },
              select: { status: true },
            }),

            // Sum of approved withdrawals
            prisma.withdrawalRequest.aggregate({
              where: { adminTeamMemberId: member.id, status: "Approved" },
              _sum: { amount: true },
            }),

            // Attendance logs for current month
            prisma.attendanceLog.findMany({
              where: {
                adminTeamMemberId: member.id,
                date: { gte: monthStartStr, lte: todayStr },
              },
              select: { status: true },
            }),
          ]);

        // thisMonth stats
const thisMonthQualified = thisMonthLeads.filter((l: any) => l.status !== "Disputed").length;
const thisMonthRejected = thisMonthLeads.filter((l: any) => l.status === "Disputed").length;
const thisMonthTotal = thisMonthLeads.length;

        // allTime stats
        const allTimeQualified = allTimeLeads.filter((l: any) => l.status !== "Disputed").length;
        const allTimeRejected = allTimeLeads.filter((l: any) => l.status === "Disputed").length;
        const allTimeGrossBonus = computeBonus(allTimeQualified, allTimeRejected);
        const totalWithdrawn = approvedWithdrawals._sum.amount ?? 0;
        const availableBalance = allTimeGrossBonus - totalWithdrawn;

        // Attendance for this month
        const presentDays = attendanceLogs.filter(
          (l: any) => l.status === "Present" || l.status === "Late"
        ).length;
        const attendanceRate =
          workingDays > 0 ? Math.round((presentDays / workingDays) * 100) : 0;

        return {
          ...member,
          thisMonth: {
            qualified: thisMonthQualified,
            rejected: thisMonthRejected,
            totalDelivered: thisMonthTotal,
          },
          attendanceThisMonth: {
            presentDays,
            workingDays,
            rate: attendanceRate,
          },
          availableBalance,
        };
      })
    );

    return NextResponse.json({ employees, pendingWithdrawals });
  } catch (err) {
    console.error("[admin/hr GET] error:", err);
    return NextResponse.json({ error: "Failed to load HR data" }, { status: 500 });
  }
}

// ── PATCH /api/admin/hr ───────────────────────────────────────────────────────

export async function PATCH(req: NextRequest) {
  let session;
  try {
    session = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (session.sessionType !== "adminTeam" || session.adminRole !== "SuperAdmin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: {
    memberId?: string;
    action?: string;
    // updateSettings
    baseSalary?: number;
    dailyLeadTarget?: number;
    // markAttendance
    date?: string;
    status?: string;
    checkInTime?: string;
    checkOutTime?: string;
    // processWithdrawal
    withdrawalId?: string;
    approve?: boolean;
    adminNote?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { action } = body;

  if (!action) {
    return NextResponse.json({ error: "action is required" }, { status: 400 });
  }

  try {
    // ── action: updateSettings ──────────────────────────────────────────────
    if (action === "updateSettings") {
      const { memberId, baseSalary, dailyLeadTarget } = body;

      if (!memberId) {
        return NextResponse.json({ error: "memberId is required" }, { status: 400 });
      }

      const data: Record<string, number> = {};
      if (baseSalary !== undefined && typeof baseSalary === "number") {
        data.baseSalary = baseSalary;
      }
      if (dailyLeadTarget !== undefined && typeof dailyLeadTarget === "number") {
        data.dailyLeadTarget = dailyLeadTarget;
      }

      if (Object.keys(data).length === 0) {
        return NextResponse.json(
          { error: "Provide at least one of: baseSalary, dailyLeadTarget" },
          { status: 400 }
        );
      }

      const member = await prisma.adminTeamMember.update({
        where: { id: memberId },
        data,
        select: {
          id: true,
          name: true,
          email: true,
          adminRole: true,
          baseSalary: true,
          dailyLeadTarget: true,
        },
      });

      return NextResponse.json({ member });
    }

    // ── action: markAttendance ──────────────────────────────────────────────
    if (action === "markAttendance") {
      const { memberId, date, status, checkInTime, checkOutTime } = body;

      if (!memberId) {
        return NextResponse.json({ error: "memberId is required" }, { status: 400 });
      }
      if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return NextResponse.json(
          { error: "date is required in YYYY-MM-DD format" },
          { status: 400 }
        );
      }
      if (!status) {
        return NextResponse.json({ error: "status is required" }, { status: 400 });
      }

      const upsertData: {
        status: string;
        checkInTime?: Date;
        checkOutTime?: Date;
      } = { status };

      if (checkInTime) upsertData.checkInTime = new Date(checkInTime);
      if (checkOutTime) upsertData.checkOutTime = new Date(checkOutTime);

      const record = await prisma.attendanceLog.upsert({
        where: {
          adminTeamMemberId_date: { adminTeamMemberId: memberId, date },
        },
        create: {
          adminTeamMemberId: memberId,
          date,
          ...upsertData,
        },
        update: upsertData,
      });

      return NextResponse.json({ record });
    }

    // ── action: processWithdrawal ───────────────────────────────────────────
    if (action === "processWithdrawal") {
      const { withdrawalId, approve, adminNote } = body;

      if (!withdrawalId) {
        return NextResponse.json({ error: "withdrawalId is required" }, { status: 400 });
      }
      if (typeof approve !== "boolean") {
        return NextResponse.json(
          { error: "approve (boolean) is required" },
          { status: 400 }
        );
      }

      const newStatus = approve ? "Approved" : "Rejected";

      const withdrawal = await prisma.withdrawalRequest.update({
        where: { id: withdrawalId },
        data: {
          status: newStatus,
          ...(adminNote !== undefined ? { adminNote } : {}),
        },
        include: {
          adminTeamMember: {
            select: { id: true, name: true, email: true, adminRole: true },
          },
        },
      });

      return NextResponse.json({ withdrawal });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (err) {
    console.error("[admin/hr PATCH] error:", err);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Operation failed: ${msg}` }, { status: 500 });
  }
}
