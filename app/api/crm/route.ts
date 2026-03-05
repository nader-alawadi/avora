import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// GET /api/crm — fetch all CRM leads for the current user
export async function GET() {
  try {
    const session = await requireAuth();
    console.log("[crm GET] session.id:", session.id, "email:", session.email);

    const leads = await prisma.crmLead.findMany({
      where: { userId: session.id },
      include: {
        activities: { orderBy: { createdAt: "asc" } },
        disputes: {
          where: { status: "Pending" },
          select: { id: true, status: true },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    console.log("[crm GET] found", leads.length, "CrmLeads for userId:", session.id);

    return NextResponse.json({ leads });
  } catch (err) {
    console.error("[crm GET] error:", err);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

// PATCH /api/crm — update a CRM lead's stage, notes, or nextFollowUp
export async function PATCH(req: NextRequest) {
  try {
    const session = await requireAuth();

    // Viewers cannot mutate CRM data
    if (session.sessionType === "teamMember" && session.teamRole === "Viewer") {
      return NextResponse.json({ error: "Viewers have read-only access" }, { status: 403 });
    }
    const { id, stage, notes, nextFollowUp } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Missing lead id" }, { status: 400 });
    }

    const lead = await prisma.crmLead.findUnique({ where: { id } });
    if (!lead || lead.userId !== session.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    const activities: { type: string; description: string }[] = [];

    if (stage !== undefined && stage !== lead.stage) {
      const STAGE_LABELS: Record<string, string> = {
        NewLead: "New Lead",
        Contacted: "Contacted",
        Qualified: "Qualified",
        ProposalSent: "Proposal Sent",
        Negotiation: "Negotiation",
        Won: "Won",
        Lost: "Lost",
      };
      updateData.stage = stage;
      activities.push({
        type: "stage_change",
        description: `Moved from "${STAGE_LABELS[lead.stage] ?? lead.stage}" to "${STAGE_LABELS[stage] ?? stage}"`,
      });
    }

    if (notes !== undefined && notes !== lead.notes) {
      updateData.notes = notes;
      activities.push({ type: "note_updated", description: "Notes updated" });
    }

    if (nextFollowUp !== undefined) {
      const parsed = nextFollowUp ? new Date(nextFollowUp) : null;
      updateData.nextFollowUp = parsed;
      if (parsed) {
        activities.push({
          type: "follow_up_set",
          description: `Follow-up set for ${parsed.toLocaleDateString()}`,
        });
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedLead = await tx.crmLead.update({
        where: { id },
        data: updateData,
        include: { activities: { orderBy: { createdAt: "asc" } } },
      });

      if (activities.length > 0) {
        await tx.crmActivity.createMany({
          data: activities.map((a) => ({ crmLeadId: id, ...a })),
        });
      }

      return updatedLead;
    });

    // Re-fetch with latest activities and dispute status
    const finalLead = await prisma.crmLead.findUnique({
      where: { id },
      include: {
        activities: { orderBy: { createdAt: "asc" } },
        disputes: {
          where: { status: "Pending" },
          select: { id: true, status: true },
          take: 1,
        },
      },
    });

    return NextResponse.json({ lead: finalLead ?? updated });
  } catch (err) {
    console.error("[crm PATCH] error:", err);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
