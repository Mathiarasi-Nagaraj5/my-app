import { NextResponse } from "next/server";
import connectDB from "@/app/lib/mongodb";
import User from "@/app/models/User";
import { verifyPassword } from "@/app/lib/auth/password";
import { signSession } from "@/app/lib/auth/session";
import { setSessionCookie } from "@/app/lib/auth/cookies";
import { enforceRateLimit } from "@/app/lib/rateLimitResponse";

// Deliberately separate from /api/auth/login — checks role BEFORE issuing
// any session cookie, so a non-admin account never gets a valid session
// from this route at all (unlike calling generic login then checking role
// client-side afterward, which briefly issues a real cookie either way).
export async function POST(req: Request) {
  const limited = enforceRateLimit(req, "auth-admin-login", 5, 60 * 1000); // tighter than customer login
  if (limited) return limited;

  try {
    await connectDB();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, message: "email and password are required" }, { status: 400 });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });

    // Same generic message regardless of which check fails — no account
    // enumeration, no "this account isn't an admin" leak either.
    if (!user) {
      return NextResponse.json({ success: false, message: "invalid credentials" }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ success: false, message: "invalid credentials" }, { status: 401 });
    }

    if (user.role !== "admin") {
      return NextResponse.json({ success: false, message: "invalid credentials" }, { status: 401 });
    }

    // Only reaches here for a verified admin — this is the only branch
    // that ever sets a cookie in this route.
    const token = signSession(String(user._id));
    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      data: { id: user._id, fullName: user.fullName, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("Admin Login Error:", error);
    return NextResponse.json({ success: false, message: "failed to log in" }, { status: 500 });
  }
}