import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectDB from "@/app/lib/mongodb";
import User from "@/app/models/User";
import { verifySession, SESSION_COOKIE_NAME } from "@/app/lib/auth/session";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    const session = verifySession(token);

    if (!session) {
      return NextResponse.json({ success: false, data: null }, { status: 200 }); // 200, not 401 — "not logged in" is a normal state, not an error
    }

    await connectDB();
    const user = await User.findById(session.userId).select("fullName email phone role");
console.log('user data:', user);
    if (!user) {
      return NextResponse.json({ success: false, data: null }, { status: 200 });
    }

    console.log('user data:', { id: user._id, fullName: user.fullName, email: user.email, phone: user.phone, role: user.role });
    return NextResponse.json({
      success: true,
      data: { id: user._id, fullName: user.fullName, email: user.email, phone: user.phone, role: user.role,test:'summa' },
    });
  } catch {
    return NextResponse.json({ success: false, data: null }, { status: 200 });
  }
}