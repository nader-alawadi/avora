import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const { userId, credits = 1 } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { extraRegenerateCredits: { increment: credits } },
      select: { id: true, email: true, extraRegenerateCredits: true },
    });

    await createAuditLog(admin.id, "REGEN_CREDIT_GRANTED", "User", userId, {
      creditsGranted: credits,
      newTotal: user.extraRegenerateCredits,
      grantedBy: admin.email,
    });

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}
