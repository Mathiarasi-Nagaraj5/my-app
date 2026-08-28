import { cookies } from "next/headers";
import connectDB from "@/app/lib/mongodb";
import User, { IUser } from "@/app/models/User";
import { verifySession, SESSION_COOKIE_NAME } from "@/app/lib/auth/session";

export interface AuthCheckResult {
  ok: boolean;
  user?: IUser;
  status?: number;
  message?: string;
}

export async function requireAuth(): Promise<AuthCheckResult> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = verifySession(token);

  if (!session) {
    return { ok: false, status: 401, message: "not logged in" };
  }

  await connectDB();
  const user = await User.findById(session.userId);

  if (!user) {
    return { ok: false, status: 401, message: "session user no longer exists" };
  }

  return { ok: true, user };
}