import { NextResponse } from "next/server";
import  connectDB  from "../../../lib/mongodb";
import User from "../../../models/User";
import { verifySession, SESSION_COOKIE_NAME } from "../../../lib/auth/session";

function getUserIdFromRequest(req: Request): string | null {
  const cookie = req.headers
    .get("cookie")
    ?.match(new RegExp(`${SESSION_COOKIE_NAME}=([^;]+)`))?.[1];
  const session = verifySession(cookie);
  return session?.userId ?? null;
}

export async function GET(req: Request) {
  try {
    await connectDB();
    const userId = getUserIdFromRequest(req);

    if (!userId) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const user = await User.findById(userId).select("-passwordHash");
    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone },
    });
  } catch (error) {
    console.error("GET /api/auth/me error:", error);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await connectDB();
    const userId = getUserIdFromRequest(req);

    if (!userId) {
      return NextResponse.json({ error: "not authenticated" }, { status: 401 });
    }

    const { name, phone } = await req.json();
    // email intentionally not editable here — changing it would need
    // re-verification in a real system, kept out of scope for now

    const user = await User.findByIdAndUpdate(
      userId,
      { name, phone },
      { new: true }
    ).select("-passwordHash");

    if (!user) {
      return NextResponse.json({ error: "user not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone },
    });
  } catch (error) {
    console.error("PATCH /api/auth/me error:", error);
    return NextResponse.json({ error: "update failed" }, { status: 500 });
  }
}
