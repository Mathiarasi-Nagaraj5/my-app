import { cookies } from "next/headers";
import connectDB from "@/app/lib/mongodb";
import User from "@/app/models/User";
import { verifySession, SESSION_COOKIE_NAME } from "@/app/lib/auth/session";

export interface AdminCheckResult {
  ok: boolean;
  userId?: string;
  status?: number;
  message?: string;
}

export async function requireAdmin(): Promise<AdminCheckResult> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = verifySession(token);

  if (!session) {
    return { ok: false, status: 401, message: "not logged in" };
  }

  await connectDB();
  const user = await User.findById(session.userId).select("role");

  if (!user) {
    return { ok: false, status: 401, message: "session user no longer exists" };
  }
  if (user.role !== "admin") {
    return { ok: false, status: 403, message: "admin access required" };
  }

  return { ok: true, userId: session.userId };
}