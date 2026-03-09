import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type } = await req.json(); // "email" | "phone"

    if (!type || !["email", "phone"].includes(type)) {
      return NextResponse.json({ error: "Type must be 'email' or 'phone'" }, { status: 400 });
    }

    const code = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Invalidate old OTPs for this user+type
    await prisma.otpVerification.updateMany({
      where: { userId: session.id, type, used: false },
      data: { used: true },
    });

    await prisma.otpVerification.create({
      data: { userId: session.id, type, code, expiresAt },
    });

    // In production: send via email (nodemailer) or SMS (Twilio)
    // For now, log it and return success (mock)
    console.log(`[OTP] ${type.toUpperCase()} OTP for user ${session.id}: ${code}`);

    // Mock: return code in dev for testing (remove in production)
    const isDev = process.env.NODE_ENV !== "production";

    return NextResponse.json({
      success: true,
      message: `Verification code sent to your ${type}`,
      ...(isDev && { _devCode: code }),
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
