import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";

const VALID_REASONS = [
  "Not the right person",
  "Wrong company",
  "Already a client",
  "Fake/invalid contact",
  "Other",
];

// POST /api/crm/dispute — client submits a dispute for a CRM lead
export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();

    // Viewers cannot dispute
    if (session.sessionType === "teamMember" && session.teamRole === "Viewer") {
      return NextResponse.json({ error: "Viewers have read-only access" }, { status: 403 });
    }

    const { crmLeadId, reason, details, fileUrl } = await req.json();

    if (!crmLeadId || !reason) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!VALID_REASONS.includes(reason)) {
      return NextResponse.json({ error: "Invalid reason" }, { status: 400 });
    }

    // Verify lead belongs to this user
    const lead = await prisma.crmLead.findUnique({ where: { id: crmLeadId } });
    if (!lead || lead.userId !== session.id) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // Check for existing pending dispute
    const existing = await prisma.leadDispute.findFirst({
      where: { crmLeadId, status: "Pending" },
    });
    if (existing) {
      return NextResponse.json({ error: "A dispute is already pending for this lead" }, { status: 409 });
    }

    const dispute = await prisma.leadDispute.create({
      data: {
        crmLeadId,
        userId: session.id,
        reason,
        details: details || null,
        fileUrl: fileUrl || null,
        status: "Pending",
        leadName: lead.fullName || null,
        leadTitle: lead.roleTitle || null,
      },
    });

    // Log activity on the lead
    await prisma.crmActivity.create({
      data: {
        crmLeadId,
        type: "dispute_submitted",
        description: `Dispute submitted: "${reason}"`,
      },
    });

    await createAuditLog(session.id, "DISPUTE_SUBMITTED", "LeadDispute", dispute.id, {
      crmLeadId,
      reason,
    });

    return NextResponse.json({ dispute });
  } catch (err) {
    console.error("[crm/dispute POST] error:", err);
    return NextResponse.json({ error: "Failed to submit dispute" }, { status: 500 });
  }
}
