import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createToken } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const isAdmin = email === process.env.ADMIN_EMAIL;

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        isAdmin,
        plan: "LITE",
      },
    });

    // Create empty company profile
    await prisma.companyProfile.create({
      data: { userId: user.id },
    });

    const token = createToken({
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
      isAdmin: user.isAdmin,
      language: user.language,
      pdfExportsUsed: user.pdfExportsUsed,
    });

    const cookieStore = await cookies();
    cookieStore.set("avora-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    await createAuditLog(user.id, "USER_REGISTERED", "User", user.id, {
      email,
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
