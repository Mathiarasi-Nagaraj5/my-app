import { NextResponse } from "next/server";
import connectDB from "@/app/lib/mongodb";
import User from "@/app/models/User";
import { verifyPassword } from "@/app/lib/auth/password";
import { signSession } from "@/app/lib/auth/session";
import { setSessionCookie } from "@/app/lib/auth/cookies";
import { enforceRateLimit } from "@/app/lib/rateLimitResponse";

export async function POST(req: Request) {
  // Deliberately tight — this is the route brute-force attacks target.
  const limited = enforceRateLimit(req, "auth-login", 10, 60 * 1000); // 10/min per IP
  if (limited) return limited;

  try {
    await connectDB();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, message: "email and password are required" }, { status: 400 });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });

    // Same generic message whether the email doesn't exist or the password
    // is wrong — never reveal which one, that's an account-enumeration leak.
    if (!user) {
      return NextResponse.json({ success: false, message: "invalid email or password" }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ success: false, message: "invalid email or password" }, { status: 401 });
    }

    const token = signSession(String(user._id));
    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      data: { id: user._id, fullName: user.fullName, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({ success: false, message: "failed to log in" }, { status: 500 });
  }
}