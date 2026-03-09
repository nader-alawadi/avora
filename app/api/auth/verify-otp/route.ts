import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type, code } = await req.json();

    if (!type || !code) {
      return NextResponse.json({ error: "Type and code are required" }, { status: 400 });
    }

    const otp = await prisma.otpVerification.findFirst({
      where: {
        userId: session.id,
        type,
        code,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otp) {
      return NextResponse.json(
        { error: "Invalid or expired verification code" },
        { status: 400 }
      );
    }

    // Mark OTP as used
    await prisma.otpVerification.update({
      where: { id: otp.id },
      data: { used: true },
    });

    // Mark user as verified
    const updateData: Record<string, boolean> = {};
    if (type === "email") updateData.emailVerified = true;
    if (type === "phone") updateData.phoneVerified = true;

    await prisma.user.update({
      where: { id: session.id },
      data: updateData,
    });

    return NextResponse.json({ success: true, verified: true });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
