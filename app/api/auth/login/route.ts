import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import  connectDB  from "../../../lib/mongodb";
import User from "../../../models/User";
import { signSession, SESSION_COOKIE_NAME } from "../../../lib/auth/session";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "email and password are required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    // deliberately vague error message on both "no such user" and "wrong
    // password" — confirming which one is true helps attackers enumerate
    // valid emails
    if (!user) {
      return NextResponse.json({ error: "invalid email or password" }, { status: 401 });
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      return NextResponse.json({ error: "invalid email or password" }, { status: 401 });
    }

    const token = signSession(user._id.toString());
    const res = NextResponse.json({
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone },
    });

    res.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (error) {
    console.error("POST /api/auth/login error:", error);
    return NextResponse.json({ error: "login failed" }, { status: 500 });
  }
}
