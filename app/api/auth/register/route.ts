import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import  connectDB  from "../../../lib/mongodb";
import User from "../../../models/User";
import { signSession, SESSION_COOKIE_NAME } from "../../../lib/auth/session";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { name, email, phone, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "name, email, and password are required" },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json(
        { error: "an account with this email already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      passwordHash,
    });

    const token = signSession(user._id.toString());
    const res = NextResponse.json({
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone },
    });

    res.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return res;
  } catch (error) {
    console.error("POST /api/auth/register error:", error);
    return NextResponse.json({ error: "registration failed" }, { status: 500 });
  }
}
