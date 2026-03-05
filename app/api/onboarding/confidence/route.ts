import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import {
  calculateIcpConfidence,
  calculateDmuConfidence,
  checkStrictGate,
} from "@/lib/confidence";

export async function GET() {
  try {
    const session = await requireAuth();

    const answers = await prisma.onboardingAnswer.findMany({
      where: { userId: session.id },
    });

    const grouped: Record<number, Record<string, string>> = {};
    for (const a of answers) {
      if (!grouped[a.step]) grouped[a.step] = {};
      grouped[a.step][a.key] = a.value;
    }

    const icpConfidence = calculateIcpConfidence({
      step1: grouped[1],
      step2: grouped[2],
      step3: grouped[3],
      step4: grouped[4],
    });

    const dmuConfidence = calculateDmuConfidence({
      step5: grouped[5],
    });

    const strictGate = checkStrictGate(icpConfidence, dmuConfidence, {
      step1: grouped[1],
      step2: grouped[2],
      step4: grouped[4],
      step5: grouped[5],
    });

    return NextResponse.json({
      icpConfidence,
      dmuConfidence,
      strictPassed: strictGate.passed,
      missingItems: strictGate.missing,
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
