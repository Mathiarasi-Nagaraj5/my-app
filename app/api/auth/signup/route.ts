import { NextResponse } from "next/server";
import connectDB from "@/app/lib/mongodb";
import User from "@/app/models/User";
import { hashPassword } from "@/app/lib/auth/password";
import { signSession } from "@/app/lib/auth/session";
import { setSessionCookie } from "@/app/lib/auth/cookies";
import { enforceRateLimit } from "@/app/lib/rateLimitResponse";

export async function POST(req: Request) {
  const limited = enforceRateLimit(req, "auth-signup", 5, 60 * 1000); // 5/min per IP — signup abuse guard
  if (limited) return limited;

  try {
    await connectDB();
    const { fullName, email, phone, password } = await req.json();

    if (!fullName || !email || !password) {
      return NextResponse.json(
        { success: false, message: "full name, email, and password are required" },
        { status: 400 }
      );
    }
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, message: "password must be at least 8 characters" },
        { status: 400 }
      );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, message: "enter a valid email address" }, { status: 400 });
    }

    const existing = await User.findOne({ email: email.trim().toLowerCase() });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "an account with this email already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const user = await User.create({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim(),
      passwordHash,
      role: "customer", // signup can NEVER create an admin — that's set manually in the DB only
    });

    const token = signSession(String(user._id));
    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      data: { id: user._id, fullName: user.fullName, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("Signup Error:", error);
    return NextResponse.json({ success: false, message: "failed to sign up" }, { status: 500 });
  }
}