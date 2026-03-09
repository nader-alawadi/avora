import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createToken } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import { cookies } from "next/headers";

const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com","yahoo.com","hotmail.com","outlook.com","icloud.com",
  "live.com","msn.com","aol.com","mail.com","protonmail.com",
  "ymail.com","yahoo.co.uk","googlemail.com","me.com",
]);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      firstName,
      lastName,
      companyName,
      companyWebsite,
      phone,
      email,
      password,
    } = body;

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

    // Block free email providers
    const emailDomain = email.split("@")[1]?.toLowerCase();
    if (FREE_EMAIL_DOMAINS.has(emailDomain)) {
      return NextResponse.json(
        { error: "Please use your business email address, not a personal one." },
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

    // Derive display name from firstName/lastName or fallback to name field
    const displayName = firstName && lastName
      ? `${firstName} ${lastName}`.trim()
      : name || firstName || lastName || undefined;

    const user = await prisma.user.create({
      data: {
        name: displayName,
        firstName: firstName || null,
        lastName: lastName || null,
        companyName: companyName || null,
        companyWebsite: companyWebsite || null,
        phone: phone || null,
        email,
        password: hashedPassword,
        isAdmin,
        plan: "LITE",
      },
    });

    // Create company profile prefilled with sign-up data
    await prisma.companyProfile.create({
      data: {
        userId: user.id,
        companyName: companyName || null,
        websiteUrl: companyWebsite || null,
      },
    });

    const token = createToken({ sessionType: "user", userId: user.id });

    const cookieStore = await cookies();
    cookieStore.set("avora-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    await createAuditLog(user.id, "USER_REGISTERED", "User", user.id, { email });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        firstName: user.firstName,
        plan: user.plan,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
